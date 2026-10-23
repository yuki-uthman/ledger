import { test, expect, type Locator, type Page } from '@playwright/test'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import {
  ORIGIN,
  buildBundle,
  repoRoot,
  serveDist,
  startLocalStack,
  type ServedOrigin,
  type Stack,
} from '../support/local-stack.js'
import {
  createAccount,
  offerStoredRow,
  readStoredLedger,
  replaceEntries,
  seedPeopleByName,
  type Account,
  type EntrySeed,
  type StoredLedgerRow,
} from '../support/accounts.js'

// What the owner reads here: the Paid back by Abbaas list in three columns -- Date, Method
// and USD -- where no number is drawn in any row, each header word stands over the column it
// names, and every repayment reads the dollars it stores with the dollar mark under the
// same row rule as the sending list: '$3,000' whole, '$3,000.25' when the cents are real.
//
// Judged only through the declared public port: the BUILT bundle as Chrome loads it over
// the served loopback origin, at 360 by 780, with the local stack behind it. Nothing here
// imports a module of src/: the stimulus is stored rows, the reading is the document, and
// every expected figure is derived in this file from what the ledger stores, so the oracle
// cannot echo back whatever the screen happens to draw.
//
// Every figure, date and name below is invented. This repository is public, and no figure
// of the owner's own ledger is written anywhere in it.
//
// Three notes on the readings.
//   - A repayment names nobody, so its middle cell says how the money came back. A
//     repayment the ledger stores nothing nameable for reads an empty cell and carries no
//     token, which is what this oracle reads instead of a word the screen made up.
//   - The ledger itself refuses a way the money came back that this app cannot name, so
//     that reading is observed where it is written -- offered to the store and turned down
//     -- and not on a screen that could never be given one.
//   - This list has no rufiyaa column. A repayment stored in rufiyaa therefore reads the
//     dollars it stores, and this oracle reads that no rufiyaa figure and no bracketed
//     figure is drawn anywhere on the list.

const PASSWORD_FIELD = 'input[type="password"]'
const VIEWPORT = { width: 360, height: 780 } as const

/** The separator the board draws between the parts of a footer line. */
const DOT = '·'
/** The endpoint the bundle reads the ledger from, as the browser sees it. */
const ENTRIES_ENDPOINT = '**/rest/v1/entries**'
/** What a failed read says, as the port words it. */
const UNREADABLE = 'Could not load the ledger. Try again.'

/** The three words this list is headed by, in the order the owner reads them. */
const BACK_WORDS = ['Date', 'Method', 'USD'] as const
/** The hooks those three header cells carry, so a reading finds a column without styling. */
const BACK_COLUMNS = ['date', 'method', 'usd'] as const
/** The four words the sending list is headed by, which this value leaves alone. */
const SENT_WORDS = ['Date', 'Paid to', 'MVR', 'USD'] as const
/** The three lines the sending list's footer stands on, which this value leaves alone. */
const SENT_FOOT_LINES = ['mvr', 'usd', 'total'] as const

// ===== The domain vocabulary this oracle speaks =====

type Method = 'cash' | 'cheque' | 'transfer'

/** The word the owner reads for a stored way the money came back. */
const METHOD_WORDS: Record<Method, string> = {
  cash: 'Cash',
  cheque: 'Cheque',
  transfer: 'Transfer',
}

/** Every word this app can read in that column, for the rows that must read none of them. */
const EVERY_METHOD_WORD = Object.values(METHOD_WORDS)

/** Where a part of the screen rests, so a reading can say it did not move. */
type Box = {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/** One row of the paid-back list, as the owner reads it across the row. */
type BackRowReading = {
  readonly id: string
  readonly place: string
  readonly cells: number
  readonly date: string
  /** The word in the middle cell, and the token the ledger stored for it. */
  readonly method: string
  readonly token: string | null
  readonly usdText: string
  /** The whole row as text, which is how this oracle reads what is NOT in it. */
  readonly text: string
}

/** The column header of a list, as the owner reads it. */
type HeadReading = {
  readonly found: boolean
  readonly words: readonly string[]
  readonly columns: readonly (string | null)[]
  /** Whether each header word's centre lies within the extent of the first row's cell of the same index (true when no row exists). */
  readonly overTheRowCells: boolean
}

/** A list's footer, as the owner reads it and as a reading finds its figures. */
type FootReading = {
  readonly count: string | null
  readonly cents: string | null
  readonly text: string
}

/** The paid-back list, its furniture and the rest of the screen, in one reading. */
type StatementReading = {
  readonly present: boolean
  readonly shown: string | null
  readonly name: string | null
  readonly head: HeadReading
  readonly rows: readonly BackRowReading[]
  readonly foot: FootReading | null
  /** The whole paid-back panel as text, which is how a figure's absence is read. */
  readonly listText: string
  readonly card: ReadonlyArray<{
    readonly which: string
    readonly cents: string | null
    readonly text: string
    readonly box: Box
  }>
  /** The sending list's own header words and footer lines, which this value leaves alone. */
  readonly sentWords: readonly string[]
  readonly sentFootLines: readonly (string | null)[]
  readonly writingControls: number
  readonly alerts: number
}

// ===== The independent oracle: what the stored rows mean, worded here =====

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

const grouped = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const groupedWithMinor = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** The day and short month a date reads as: '2026-09-14' is '14 Sep'. */
const shortDate = (date: string): string => {
  const parts = date.split('-')
  const month = MONTHS[Number(parts[1]) - 1] ?? parts[1] ?? ''
  return `${Number(parts[2])} ${month}`.trim()
}

/**
 * Whole minor units as the owner reads the amount: grouped with commas, with no decimals
 * when the amount is whole and with two when it is not. Nothing is rounded.
 */
const minorFigure = (minor: number): string => {
  const units = Math.abs(minor)
  return units % 100 === 0 ? grouped.format(units / 100) : groupedWithMinor.format(units / 100)
}

/** The marked whole reading of stored dollars: '$3,000', '$3,000.25'. */
const usdFigure = (cents: number): string => `$${minorFigure(cents)}`
/** A figure as the card and the two footers read it, always to two decimals. */
const twoDecimalFigure = (cents: number): string => `$${groupedWithMinor.format(Math.abs(cents) / 100)}`

/** What this app calls a number of entries. */
const countLabel = (count: number): string => {
  if (count <= 0) return 'No entries'
  if (count === 1) return '1 entry'
  return `${count} entries`
}

/** The word a stored way the money came back reads as, or nothing nameable. */
const methodWordOf = (stored: string | null): string =>
  stored === null ? '' : (METHOD_WORDS[stored as Method] ?? '')

/** Oldest first: by entry date, then by the instant it was saved, then by its id. */
const oldestFirst = (rows: readonly StoredLedgerRow[]): readonly StoredLedgerRow[] =>
  [...rows].sort(
    (left, right) =>
      left.entry_date.localeCompare(right.entry_date) ||
      left.saved_at.localeCompare(right.saved_at) ||
      left.id.localeCompare(right.id),
  )

/** The repayments of a stored ledger, in the order the owner reads them. */
const repaymentsOf = (stored: readonly StoredLedgerRow[]): readonly StoredLedgerRow[] =>
  oldestFirst(stored.filter((row) => row.kind === 'receive'))
/** The sends of a stored ledger, in the same order. */
const sendsOf = (stored: readonly StoredLedgerRow[]): readonly StoredLedgerRow[] =>
  oldestFirst(stored.filter((row) => row.kind === 'send'))

/** What one stored repayment means across its three cells. */
type ExpectedRow = {
  readonly place: string
  readonly date: string
  readonly method: string
  readonly token: string | null
  readonly usd: string
}

/** Every repayment row the stored ledger means, derived from the stored columns alone. */
const expectedRows = (stored: readonly StoredLedgerRow[]): readonly ExpectedRow[] =>
  repaymentsOf(stored).map((row, index) => {
    const word = methodWordOf(row.method)
    return {
      place: String(index + 1),
      date: shortDate(row.entry_date),
      method: word,
      // A token with no word is nothing said, so nothing is carried on the cell either.
      token: word === '' ? null : row.method,
      usd: usdFigure(row.usd_cents),
    }
  })

/** This list's footer, which this value leaves exactly as it reads today. */
const expectedFoot = (
  stored: readonly StoredLedgerRow[],
): { count: string; cents: string; text: string } => {
  const repayments = repaymentsOf(stored)
  const cents = repayments.reduce((sum, row) => sum + row.usd_cents, 0)
  return {
    count: String(repayments.length),
    cents: String(cents),
    text: `Total paid back ${DOT} ${countLabel(repayments.length)} ${twoDecimalFigure(cents)}`,
  }
}

/** The three figures of the balance card, which this value leaves at two decimals. */
const expectedCard = (
  stored: readonly StoredLedgerRow[],
): ReadonlyArray<{ which: string; cents: string; text: string }> => {
  const sent = sendsOf(stored).reduce((sum, row) => sum + row.usd_cents, 0)
  const paid = repaymentsOf(stored).reduce((sum, row) => sum + row.usd_cents, 0)
  const balance = Math.abs(sent - paid)
  return [
    { which: 'sent', cents: String(sent), text: twoDecimalFigure(sent) },
    { which: 'paid', cents: String(paid), text: twoDecimalFigure(paid) },
    { which: 'balance', cents: String(balance), text: twoDecimalFigure(balance) },
  ]
}

/**
 * The whole minor units a drawn figure STATES, read back out of its own text: the mark and
 * the thousands separators come off, and what is left is the amount. It answers null when
 * the text is not a figure of this app at all.
 */
const minorUnitsStated = (drawn: string): number | null => {
  const bare = drawn.replace(/^\$/, '').replace(/,/g, '')
  if (!/^\d+(\.\d{2})?$/.test(bare)) return null
  const [whole, minor] = bare.split('.')
  return Number(whole) * 100 + Number(minor ?? '0')
}

// ===== The stimulus: the stored ledgers the owner signs in to =====

const ACCOUNT_BACK = { email: 'owner-back-a@abbaas.test', password: 'back-password-a1' } as const
const ACCOUNT_EMPTY = { email: 'owner-back-b@abbaas.test', password: 'back-password-b2' } as const
const ACCOUNT_RUFIYAA = { email: 'owner-back-c@abbaas.test', password: 'back-password-c3' } as const
const ACCOUNT_GENERATED = { email: 'owner-back-g@abbaas.test', password: 'back-password-g4' } as const
const ACCOUNT_OFFERED = { email: 'owner-back-r@abbaas.test', password: 'back-password-r5' } as const

const AHMED = 'Ahmed Shifaz'
const MARIYAM = 'Mariyam Nisha'

/**
 * The month the brief words this list by: one repayment in cash of whole dollars, one with
 * real cents the ledger stores no way back for, one by transfer, and one send above them so
 * the card and the sending list are not empty.
 */
const PAID_BACK_LEDGER: readonly EntrySeed[] = [
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 150_000,
    rate: null,
    usdCents: 150_000,
    entryDate: '2026-09-10',
    savedAt: '2026-09-10T09:00:00Z',
    personName: MARIYAM,
    method: 'transfer',
  },
  {
    kind: 'receive',
    currency: 'USD',
    amountMinor: 300_000,
    rate: null,
    usdCents: 300_000,
    entryDate: '2026-09-14',
    savedAt: '2026-09-14T09:00:00Z',
    method: 'cash',
  },
  {
    kind: 'receive',
    currency: 'USD',
    amountMinor: 300_025,
    rate: null,
    usdCents: 300_025,
    entryDate: '2026-09-18',
    savedAt: '2026-09-18T09:00:00Z',
    method: null,
  },
  {
    kind: 'receive',
    currency: 'USD',
    amountMinor: 299_975,
    rate: null,
    usdCents: 299_975,
    entryDate: '2026-09-22',
    savedAt: '2026-09-22T09:00:00Z',
    method: 'transfer',
  },
]

/**
 * What those three repayments read, stated as constants so a wrong derivation above cannot
 * pass unnoticed: the whole figure drops its decimals, the one with real cents keeps them,
 * and the repayment stored with no way back reads an empty cell carrying no token.
 */
const PAID_BACK_LEDGER_READS: readonly ExpectedRow[] = [
  { place: '1', date: '14 Sep', method: 'Cash', token: 'cash', usd: '$3,000' },
  { place: '2', date: '18 Sep', method: '', token: null, usd: '$3,000.25' },
  { place: '3', date: '22 Sep', method: 'Transfer', token: 'transfer', usd: '$2,999.75' },
]

/** One repayment stored in rufiyaa: the stressor this list has no column to compare with. */
const RUFIYAA_LEDGER: readonly EntrySeed[] = [
  {
    kind: 'receive',
    currency: 'MVR',
    amountMinor: 5_000_000,
    rate: '20.0000',
    usdCents: 250_000,
    entryDate: '2026-08-05',
    savedAt: '2026-08-05T09:00:00Z',
    method: 'cheque',
  },
]

let stack: Stack
let served: ServedOrigin
let paidBack: Account
let empty: Account
let rufiyaa: Account
let generated: Account
let offered: Account
let generatedPeople: ReadonlyMap<string, string>

test.use({ viewport: VIEWPORT })
// Not serial: each scenario signs in as its own owner and reads its own ledger, so one
// scenario's disagreement never hides what the others observe.

test.beforeAll(async () => {
  stack = startLocalStack()
  buildBundle(stack)
  served = await serveDist()

  paidBack = await createAccount(stack, ACCOUNT_BACK)
  await replaceEntries(
    stack,
    paidBack,
    PAID_BACK_LEDGER,
    await seedPeopleByName(stack, paidBack, [AHMED, MARIYAM]),
  )

  empty = await createAccount(stack, ACCOUNT_EMPTY)

  rufiyaa = await createAccount(stack, ACCOUNT_RUFIYAA)
  await replaceEntries(stack, rufiyaa, RUFIYAA_LEDGER)

  generated = await createAccount(stack, ACCOUNT_GENERATED)
  generatedPeople = await seedPeopleByName(stack, generated, [AHMED, MARIYAM])

  offered = await createAccount(stack, ACCOUNT_OFFERED)
})

test.afterAll(async () => {
  await served?.close()
})

// ===== The steps this oracle's scenarios are written in =====

const statementTab = (page: Page): Locator => page.locator('[data-view="statement"]')
const statement = (page: Page): Locator => page.locator('[data-screen="statement"]')
const statementPane = (page: Page): Locator => page.locator('[data-pane="statement"]')

const givenTheOwnerIsSignedIn = async (page: Page, account: Account): Promise<void> => {
  await page.goto(ORIGIN)
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen never appeared. WHY: every reading of the paid-back list starts from a signed-in owner. HOW: serve the built bundle and let it mount its sign-in screen.',
  ).toBeVisible()
  await page.getByLabel('Email').fill(account.email)
  await page.getByLabel('Password').fill(account.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen stayed up after Sign in. WHY: the owner cannot reach the Statement until the app lets them in. HOW: confirm the seeded account and let sign-in replace the screen.',
  ).toHaveCount(0)
}

/** The marks of the parts of a switch that are still moving, as the motion carries them. */
const partsStillMoving = (page: Page): Promise<readonly string[]> =>
  page.evaluate(() => {
    const switching = ['view-slide', 'list-slide', 'list-enter']
    return Array.from(document.querySelectorAll('[data-motion], [data-enter-rise]'))
      .map((part) => part.getAttribute('data-motion') ?? `rise:${part.getAttribute('data-enter-rise')}`)
      .filter((mark) => switching.includes(mark) || mark.startsWith('rise:switch-'))
      .filter((mark) => !mark.endsWith('row'))
  })

/** Waits until nothing moves any more, so every box and reading is taken from where it rests. */
const thenEveryPartHasComeToRest = async (page: Page): Promise<void> => {
  await expect
    .poll(() => partsStillMoving(page), {
      message:
        "WHAT: the screen was still moving two seconds after the tap. WHY: every box, edge and reading this oracle takes is taken from where the screen came to rest, so a reading taken mid-slide would judge a place the owner never sees. HOW: finish the slide and the arriving list's rise, and drop each part's mark as it stops.",
      timeout: 2_000,
    })
    .toEqual([])
}

/** The same wait where a disagreement is collected rather than raised. */
const everyPartSettles = async (page: Page, budgetMs = 2_000): Promise<boolean> => {
  const deadline = Date.now() + budgetMs
  for (;;) {
    if ((await partsStillMoving(page)).length === 0) return true
    if (Date.now() >= deadline) return false
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

const givenTheOwnerIsReadingTheStatement = async (page: Page): Promise<void> => {
  await expect(
    statementTab(page),
    'WHAT: there is no Statement tab to tap on the bottom bar. WHY: a tap on that tab is the only way into the Statement, so without it the paid-back list is unreachable. HOW: draw the bottom bar with its Entries and Statement tabs.',
  ).toBeVisible()
  await statementTab(page).click()
  await expect(
    statement(page),
    'WHAT: tapping Statement showed no statement screen. WHY: the tap is what brings the two lists into the viewport. HOW: show the pane whose screen carries data-screen=statement.',
  ).toBeVisible()
  await thenEveryPartHasComeToRest(page)
}

const whenTheOwnerTapsWhatCameBack = async (page: Page): Promise<void> => {
  const tab = page.getByRole('tab', { name: 'Paid back by Abbaas' })
  await expect(
    tab,
    'WHAT: there is no tab named Paid back by Abbaas to tap. WHY: that tap is how the owner reaches what came back, which is the whole of this reading. HOW: keep both tabs of the pill.',
  ).toBeVisible()
  await tab.click()
  await expect(
    statement(page),
    'WHAT: the screen does not say it is showing what came back after the tap. WHY: which list is shown is one attribute, and the reading below is only of that list. HOW: write data-statement-shown=back on the tap.',
  ).toHaveAttribute('data-statement-shown', 'back')
  await thenEveryPartHasComeToRest(page)
}

/**
 * Reads the paid-back list in one pass: its column header, every row across its three
 * cells, its footer, the card above it, the sending list's own header and footer lines and
 * whatever on the screen could record money. Answers even when the screen is not there.
 */
const readPaidBackList = (page: Page): Promise<StatementReading> =>
  page.evaluate((): StatementReading => {
    const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()
    const boxOf = (element: Element): Box => {
      const box = element.getBoundingClientRect()
      return {
        left: Math.round(box.left),
        top: Math.round(box.top),
        width: Math.round(box.width),
        height: Math.round(box.height),
      }
    }

    const noHead: HeadReading = {
      found: false,
      words: [],
      columns: [],
      overTheRowCells: false,
    }
    const alerts = document.querySelectorAll('[data-pane="statement"] [role="alert"]').length
    const screen = document.querySelector('[data-screen="statement"]')
    if (!screen) {
      return {
        present: false,
        shown: null,
        name: null,
        head: noHead,
        rows: [],
        foot: null,
        listText: '',
        card: [],
        sentWords: [],
        sentFootLines: [],
        writingControls: 0,
        alerts,
      }
    }
    const panel = screen.querySelector('[data-statement-list="back"]')
    const headElement = screen.querySelector('[data-statement-head="back"]')
    const rowElements = Array.from(screen.querySelectorAll('[data-statement-list="back"] [data-statement-row]'))

    const rows: BackRowReading[] = rowElements.map((row) => {
      const cells = Array.from(row.children)
      // The middle cell is where a repayment says how the money came back, and the last is
      // its figure: this list carries no hook of its own on either, so both are read where
      // the header says they stand.
      const methodCell = cells[cells.length - 2] ?? null
      const figureCell = cells[cells.length - 1] ?? null
      return {
        id: row.getAttribute('data-statement-row') ?? '',
        place: row.getAttribute('data-no') ?? '',
        cells: cells.length,
        date: squash(cells[0]?.textContent),
        method: squash(methodCell?.textContent),
        token: methodCell === null ? null : methodCell.getAttribute('data-statement-method'),
        usdText: squash(figureCell?.textContent),
        text: squash(row.textContent),
      }
    })

    let head = noHead
    if (headElement !== null) {
      const headCells = Array.from(headElement.children)
      const firstRowCells = rowElements[0] === undefined ? [] : Array.from(rowElements[0].children)
      head = {
        found: true,
        words: headCells.map((cell) => squash(cell.textContent)),
        columns: headCells.map((cell) => cell.getAttribute('data-statement-column')),
        overTheRowCells:
          rowElements[0] === undefined ||
          (firstRowCells.length === headCells.length &&
            headCells.every((cell, index) => {
              const under = firstRowCells[index]
              if (under === undefined) return false
              const above = cell.getBoundingClientRect()
              const below = under.getBoundingClientRect()
              const centre = (above.left + above.right) / 2
              return centre >= below.left && centre <= below.right
            })),
      }
    }

    const footElement = screen.querySelector('[data-statement-foot="back"]')
    const writing =
      screen.querySelectorAll('[data-box], [data-action]').length +
      Array.from(screen.querySelectorAll('button, a')).filter((control) =>
        ['Send', 'Receive'].includes(squash(control.textContent)),
      ).length

    return {
      present: true,
      shown: screen.getAttribute('data-statement-shown'),
      name: panel === null ? null : panel.getAttribute('aria-label'),
      head,
      rows,
      foot:
        footElement === null
          ? null
          : {
              count: footElement.getAttribute('data-count'),
              cents: footElement.getAttribute('data-cents'),
              text: squash(footElement.textContent),
            },
      listText: panel === null ? '' : squash(panel.textContent),
      card: Array.from(screen.querySelectorAll('[data-statement-total]')).map((figure) => ({
        which: figure.getAttribute('data-statement-total') ?? '',
        cents: figure.getAttribute('data-cents'),
        text: squash(figure.textContent),
        box: boxOf(figure),
      })),
      sentWords: Array.from(screen.querySelectorAll('[data-statement-head="sent"] > *')).map((cell) =>
        squash(cell.textContent),
      ),
      sentFootLines: Array.from(
        screen.querySelectorAll('[data-statement-foot="sent"] [data-statement-foot-line]'),
      ).map((line) => line.getAttribute('data-statement-foot-line')),
      writingControls: writing,
      alerts,
    }
  })

// ===== The scenarios =====

test('what came back reads by day, by the way it came and in dollars', async ({ page }) => {
  // Given the owner has been paid back three times this month, one of them with real cents
  const stored = await readStoredLedger(stack, paidBack)
  expect(
    expectedRows(stored),
    'WHAT: the ledger seeded for this reading is not the one the brief words this list by. WHY: the readings below are stated as constants so a wrong derivation in this oracle cannot pass unnoticed. HOW: seed the three repayments the brief names, oldest first.',
  ).toEqual(PAID_BACK_LEDGER_READS)
  await givenTheOwnerIsSignedIn(page, paidBack)
  await givenTheOwnerIsReadingTheStatement(page)

  // When the owner taps what Abbaas paid back
  await whenTheOwnerTapsWhatCameBack(page)

  // Then the three column words stand over the three cells of every row
  const reading = await readPaidBackList(page)
  expect(
    [reading.present, reading.shown, reading.name],
    'WHAT: the paid-back list is not the list the tap opens. WHY: the owner taps that tab to read what came back, and nothing else on the screen answers that question. HOW: show the panel named Paid back by Abbaas on the tap.',
  ).toEqual([true, 'back', 'Paid back by Abbaas'])
  expect(
    reading.head.words,
    'WHAT: the column header does not read Date, Method and USD. WHY: those three words are what make the cells of a repayment readable, and a No. column would promise a number this list no longer draws. HOW: head this list with those three words in that order.',
  ).toEqual([...BACK_WORDS])
  expect(
    reading.head.columns,
    'WHAT: the header cells do not name their own columns. WHY: a reading of this list must find the day, the way the money came back and the figure without reading styling. HOW: carry data-statement-column on each header cell.',
  ).toEqual([...BACK_COLUMNS])
  expect(
    reading.head.overTheRowCells,
    'WHAT: a header word does not stand over the column it names. WHY: the owner reads a figure under the word that says what it is. HOW: put the header and the rows on the same columns, so each header word sits over the cells of its own column.',
  ).toBe(true)

  // And every repayment reads its day, its way back and its own marked figure, with no number
  expect(
    [reading.rows.map((row) => row.place), reading.rows.map((row) => row.id)],
    'WHAT: the rows no longer say which place they hold or which entry they came from. WHY: the order is still read by its place and each row still names its own entry, even though no number is drawn. HOW: keep each row\'s place, numbered 1 upward oldest first, and its entry\'s own name.',
  ).toEqual([PAID_BACK_LEDGER_READS.map((row) => row.place), repaymentsOf(stored).map((row) => row.id)])
  expect(
    reading.rows.map((row) => row.cells),
    'WHAT: a repayment still draws four cells. WHY: the No. column is gone, so a row reads its day, the way the money came back and its dollars and nothing else. HOW: draw three cells in each row.',
  ).toEqual(PAID_BACK_LEDGER_READS.map(() => 3))
  expect(
    reading.rows.map((row) => [row.date, row.method, row.token, row.usdText]),
    "WHAT: the three repayments are not read as the ledger stores them. WHY: this list is what the owner checks what came back against: an unmarked figure leaves the currency unstated, a rounded one states money nobody paid, and a word in the middle cell nobody recorded invents how it came. HOW: read the day from the stored date, the middle cell from the stored token alone, and the figure as the marked dollars of that entry, dropping only a trailing '.00'.",
  ).toEqual(
    PAID_BACK_LEDGER_READS.map((row) => [row.date, row.method, row.token, row.usd]),
  )
  expect(
    reading.rows.map((row) => EVERY_METHOD_WORD.some((word) => row.text.includes(word))),
    'WHAT: a repayment the ledger stores no way back for still reads one somewhere in its row. WHY: a way the money came back that nobody recorded is a statement about the owner\'s money that no one can check. HOW: say nothing at all in that cell, and nowhere else in the row either.',
  ).toEqual(PAID_BACK_LEDGER_READS.map((row) => row.method !== ''))

  // And the footer and the read-only screen are as they were
  expect(
    reading.foot === null
      ? null
      : { count: reading.foot.count, cents: reading.foot.cents, text: reading.foot.text },
    "WHAT: the footer no longer reads one line, 'Total paid back' with its count and its two-decimal total. WHY: the footer is the owner's check that this list and the card agree, and this value leaves it exactly as it is. HOW: keep its one line, counting the repayments and adding their stored dollars to two decimals.",
  ).toEqual(expectedFoot(stored))
  expect(
    reading.writingControls,
    'WHAT: the Statement offers something that records money. WHY: this screen only reports: a box or a Send or Receive control there would let the owner write from a screen that cannot. HOW: draw no data-box, no data-action and no such control on this screen.',
  ).toBe(0)
})

test('the three column words stand over the list even when nothing has come back', async ({ page }) => {
  // Given an owner who has recorded nothing at all
  await givenTheOwnerIsSignedIn(page, empty)
  await givenTheOwnerIsReadingTheStatement(page)

  // When the owner taps what Abbaas paid back
  await whenTheOwnerTapsWhatCameBack(page)

  // Then the same three words head an empty list, and its footer says so in words
  const reading = await readPaidBackList(page)
  expect(
    [reading.head.words, reading.head.columns, reading.rows.length],
    'WHAT: an empty paid-back list has no column header, or lists a row. WHY: the owner must be told what this list would hold before anything has come back, and a repayment they were never paid is a lie about their money. HOW: draw the header at every ledger length, and a row for each stored repayment only.',
  ).toEqual([[...BACK_WORDS], [...BACK_COLUMNS], 0])
  expect(
    reading.foot === null
      ? null
      : { count: reading.foot.count, cents: reading.foot.cents, text: reading.foot.text },
    "WHAT: an empty list's footer does not say in words that nothing has come back. WHY: a blank total, or a '0' with no words, reads as a figure the owner must work out: this app says 'No entries' instead. HOW: word the count as this app words every count, and total nothing to two decimals.",
  ).toEqual({ count: '0', cents: '0', text: `Total paid back ${DOT} No entries $0.00` })
  expect(
    reading.alerts,
    'WHAT: an empty ledger is reported as a failed read. WHY: an empty ledger and a read that failed must never look alike. HOW: speak an alert only when the read itself failed.',
  ).toBe(0)
})

test('a repayment made in rufiyaa still reads the dollars it stores', async ({ page }) => {
  // Given the one repayment of this ledger was paid back in rufiyaa
  const stored = await readStoredLedger(stack, rufiyaa)
  const row = stored[0]
  expect(
    [stored.length, row?.currency, row?.amount_minor, row?.usd_cents],
    'WHAT: the ledger seeded for this reading does not hold one repayment stored in rufiyaa. WHY: this is the stressor that negates the assumption that what came back was paid in dollars. HOW: seed exactly one repayment of kind receive in MVR with its rate and its stored dollars.',
  ).toEqual([1, 'MVR', 5_000_000, 250_000])
  await givenTheOwnerIsSignedIn(page, rufiyaa)
  await givenTheOwnerIsReadingTheStatement(page)

  // When the owner taps what Abbaas paid back
  await whenTheOwnerTapsWhatCameBack(page)

  // Then it reads the dollars that entry stores, and no rufiyaa figure stands anywhere here
  const reading = await readPaidBackList(page)
  expect(
    reading.rows.map((line) => [line.date, line.method, line.usdText]),
    'WHAT: a repayment made in rufiyaa does not read the dollars its own entry stores, with the mark. WHY: this list has one currency: a figure whose currency is unstated leaves the owner guessing, and converting the rufiyaa a second time would move their money by the rounding. HOW: read the stored dollars of that entry and mark them.',
  ).toEqual([['5 Aug', 'Cheque', usdFigure(row?.usd_cents ?? -1)]])
  expect(
    [/\/-/.test(reading.listText), /\(|\)/.test(reading.listText)],
    'WHAT: the paid-back list drew a rufiyaa figure, or a figure in brackets. WHY: this list has no rufiyaa column to compare a bracketed figure with, so a bracketed reading here states a comparison the owner cannot make. HOW: read only the stored dollars on this list, showing no rufiyaa figure at all.',
  ).toEqual([false, false])
  expect(
    reading.foot === null
      ? null
      : { count: reading.foot.count, cents: reading.foot.cents, text: reading.foot.text },
    "WHAT: a list of one repayment does not word its count as one entry with its two-decimal total. WHY: the owner reads how many times they were paid back off this one line, and this app has one wording for a count of one. HOW: word that count as this app words every count, and keep the total at two decimals.",
  ).toEqual(expectedFoot(stored))
})

test('the ledger keeps no repayment whose way back nobody could name', async () => {
  // Arrange: the readings a stored repayment must carry before any screen can state it
  const wellFormed = {
    kind: 'receive',
    currency: 'USD',
    amount_minor: 180_000,
    rate: null,
    usd_cents: 180_000,
    entry_date: '2026-05-04',
    method: 'cash',
  }

  // Act: offer the ledger a way back this app cannot name, one with no dollars at all, and
  // the same repayment well formed
  const unknownMethod = await offerStoredRow(stack, offered, { ...wellFormed, method: 'venmo' })
  const noDollars = await offerStoredRow(stack, offered, { ...wellFormed, usd_cents: 0 })
  const kept = await offerStoredRow(stack, offered, wellFormed)

  // Assert: the two are refused where they are written, and the well-formed one is kept
  expect(
    unknownMethod,
    'WHAT: the ledger kept a way the money came back that this app cannot name. WHY: the middle cell could then only read a word nobody recorded or print raw storage at the owner, and neither is a way they were paid back. HOW: hold one of the three known words, or nothing, on a stored repayment.',
  ).not.toBeNull()
  expect(
    noDollars,
    "WHAT: the ledger kept a repayment with no dollars at all. WHY: the figure column must always read an amount: a repayment with nothing in it would read '$0' for money that never came back. HOW: hold a dollar amount on every stored repayment.",
  ).not.toBeNull()
  expect(
    kept,
    'WHAT: the ledger refused a repayment with its dollars, its day and a way back it can name. WHY: that is the very repayment this list must read back, so a refusal here would leave nothing to observe at all. HOW: keep a well-formed repayment as it is written.',
  ).toBeNull()
})

test('a ledger that cannot be read says so instead of showing empty columns', async ({ page }) => {
  // Given the ledger cannot be reached from the phone
  await page.route(ENTRIES_ENDPOINT, async (route) => {
    if (route.request().method() === 'GET') {
      await route.abort('failed')
      return
    }
    await route.continue()
  })
  await givenTheOwnerIsSignedIn(page, paidBack)

  // When the owner taps the Statement tab
  await givenTheOwnerIsReadingTheStatement(page)

  // Then the screen speaks the message the read gave it, and draws no column and no figure
  await expect(
    statementPane(page).getByRole('alert'),
    'WHAT: the Statement does not speak one alert after a failed read. WHY: the owner must be told the ledger could not be read, not shown a list with nothing in it. HOW: speak the message the read answers with, and draw no list.',
  ).toHaveText(UNREADABLE)
  const reading = await readPaidBackList(page)
  expect(
    [reading.head.found, reading.head.words.length, reading.rows.length, reading.foot, reading.card.length],
    'WHAT: a failed read still drew the column words, a row, a footer or a figure. WHY: three empty columns read as a month in which nothing came back, which is a different and false statement. HOW: draw the alert alone when the read failed.',
  ).toEqual([false, 0, 0, null, 0])
})

test('every stored repayment reads the dollars its own entry holds', async ({ page }) => {
  // Arrange a spread of ledgers from a fixed seed, including the readings that must be there
  const ledgers = generatedLedgers()
  await givenTheOwnerIsSignedIn(page, generated)

  // Act: read each ledger through its own page load, keeping the first that disagrees
  const failing = await firstFailing(page, ledgers, judgeWhatCameBack)

  // Assert: nothing disagreed; a failing ledger is reported at its smallest
  expect(
    await reportOf(page, failing, judgeWhatCameBack),
    "WHAT: a generated ledger was not read as its stored rows mean it. WHY: this is the law that makes this list true of every ledger and not only of the seeded one: every repayment reads the marked dollars of its own entry, with its separators, a trailing '.00' dropped and real cents kept, in its own place in the oldest-first order, with the word of its stored way back or nothing at all. HOW: read the failing ledger printed above, which is the smallest one that still disagrees.",
  ).toBe('')
})

test('no drawn figure of what came back moves the money the ledger stores', async ({ page }) => {
  // Arrange the same spread of ledgers, read for what each figure states and not for its text
  const ledgers = generatedLedgers()
  await givenTheOwnerIsSignedIn(page, generated)

  // Act: read each ledger through its own page load, keeping the first that disagrees
  const failing = await firstFailing(page, ledgers, judgeNothingIsRounded)

  // Assert: every drawn figure states exactly the cents it was seeded from
  expect(
    await reportOf(page, failing, judgeNothingIsRounded),
    "WHAT: a drawn figure states a different amount from the cents the ledger stores. WHY: a figure worded with fewer decimals reads money the owner was never paid, and this list is what they check what came back against. HOW: read the failing ledger printed above: every figure must state its own stored cents, dropping only a trailing '.00'.",
  ).toBe('')
})

test('the dollars of what came back are worded where the money is understood', async () => {
  // Arrange: the modules of this app, as the repository stores them
  const read = (relative: string): string | null => {
    const full = path.join(repoRoot, relative)
    return existsSync(full) ? readFileSync(full, 'utf8') : null
  }
  const filesIn = (relative: string): readonly string[] => {
    const full = path.join(repoRoot, relative)
    if (!existsSync(full)) return []
    return readdirSync(full)
      .filter((name) => name.endsWith('.ts'))
      .map((name) => `${relative}/${name}`)
  }
  const screenSource = read('src/ui/statement.ts')

  // Act: look at what the screen names, and at what the meaning modules reach for
  const withoutComments = (source: string): string =>
    source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:"'`\\])\/\/[^\n]*/g, '$1 ')
  const LITERAL = /`(?:[^`\\]|\\.)*`|'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g
  const plain = withoutComments(screenSource ?? '')
  // A written mark, never a value put into a sentence: the opening of an interpolation is
  // masked before the marks are looked for.
  const marks = Array.from(plain.replace(/\$\{/g, '@{').matchAll(LITERAL))
    .map((match) => match[0])
    .filter((literal) => /\$|\/-/.test(literal))
  const code = plain.replace(LITERAL, '""')
  const wordsMoneyItself = /\b(Intl|NumberFormat|toLocaleString|toFixed)\b/.test(code)
  const scales = code
    .split('\n')
    .map((line, index) => `${index + 1}: ${line.trim()}`)
    .filter((line) => /[*/%]/.test(line.slice(line.indexOf(':') + 1)))
  const importsOf = (source: string): readonly string[] =>
    Array.from(source.matchAll(/from\s+'([^']+)'/g)).map((match) => match[1] ?? '')
  const namesAnAdapter = (source: string): boolean =>
    importsOf(source).some((name) => name.includes('adapters') || name.includes('supabase'))
  const namesTheDocument = (source: string): boolean =>
    /\b(document|window|HTMLElement|HTMLDivElement|Element)\b/.test(source)
  const domainOffenders = filesIn('src/domain')
    .map((file) => ({ file, source: read(file) ?? '' }))
    .filter((module) => namesTheDocument(module.source) || namesAnAdapter(module.source))
    .map((module) => module.file)
  const classes = ['src/ui/statement.ts', 'src/domain/statement.ts'].filter((file) =>
    /\bclass\s+\w/.test(read(file) ?? ''),
  )
  const writesFromTheScreen = ['addEntry', 'removeEntry', 'addPerson', 'insert(', 'delete(', 'upsert('].filter(
    (operation) => (screenSource ?? '').includes(operation),
  )

  // Assert: the money is worded in one place, and the screen only draws it
  expect(
    screenSource === null ? 'missing' : 'present',
    "WHAT: there is no module owning the statement's screen. WHY: both lists are drawn by one function from the read ledger to DOM, which decides nothing about money itself. HOW: own that screen in the statement's own screen module.",
  ).toBe('present')
  expect(
    marks,
    'WHAT: the screen writes a currency mark of its own. WHY: one place must word every figure, or a row, a card and a footer can mark or group the same money differently. HOW: take each marked figure from the module that owns what a row reads.',
  ).toEqual([])
  expect(
    wordsMoneyItself,
    'WHAT: the screen formats a number itself. WHY: a second formatter is a second rounding, and the owner would read two different amounts for one repayment. HOW: draw the text the meaning module has already worded.',
  ).toBe(false)
  expect(
    scales,
    'WHAT: the screen multiplies or divides something. WHY: scaling a stored amount on the screen is how a figure stops being the money the ledger holds. HOW: leave every amount exactly as it arrives.',
  ).toEqual([])
  expect(
    namesAnAdapter(screenSource ?? ''),
    'WHAT: the statement screen reaches for an adapter. WHY: a screen that can reach the database can change what it is reporting, and this screen only reports. HOW: hand it the read outcome and nothing else.',
  ).toBe(false)
  expect(
    domainOffenders,
    'WHAT: a module that decides meaning names the document or an adapter. WHY: meaning that can touch the DOM or the database cannot be read, reused or trusted on its own. HOW: keep the meaning modules to values in and values out.',
  ).toEqual([])
  expect(
    classes,
    'WHAT: a statement module declares a class. WHY: this app is written as functions from values to values and from values to DOM, and a second style in one module makes the rule unreadable. HOW: change the cells of this list as functions.',
  ).toEqual([])
  expect(
    writesFromTheScreen,
    'WHAT: the statement screen names an operation that writes to the ledger. WHY: this screen only reports: a writing operation within its reach could change the money it is reporting. HOW: give the screen the read outcome and nothing that writes.',
  ).toEqual([])
})

test('one reading of a row of money is kept, never two', async () => {
  // Arrange: every module of this app that could word the dollars of a row
  const sources = ['src/domain', 'src/ui', 'src/ports', 'src/adapters', 'src/app']
    .flatMap((directory) => {
      const full = path.join(repoRoot, directory)
      if (!existsSync(full)) return []
      return readdirSync(full)
        .filter((name) => name.endsWith('.ts'))
        .map((name) => `${directory}/${name}`)
    })
    .map((file) => ({ file, source: readFileSync(path.join(repoRoot, file), 'utf8') }))

  // Act: look for a second, unmarked dollar reading left on a row beside the marked one
  const unsignedReadings = sources
    .filter((module) => /withoutCurrencySign|usdText/.test(module.source))
    .map((module) => module.file)

  // Assert: a row of either list carries one dollar reading and one only
  expect(
    unsignedReadings,
    'WHAT: a row of money still carries a second, unmarked dollar reading beside its marked one. WHY: two readings of the same cents are two ways to word them, and the next reader cannot tell which one the owner is meant to see: that is how one list drifts from the other. HOW: keep the marked reading both lists now use, and take the unmarked one away with its last reference.',
  ).toEqual([])
})

test('the rest of the Statement reads exactly as before', async ({ page }) => {
  // Given the owner is reading a month with a send and three repayments in it
  const stored = await readStoredLedger(stack, paidBack)
  await givenTheOwnerIsSignedIn(page, paidBack)

  // When the owner taps the Statement tab
  await givenTheOwnerIsReadingTheStatement(page)

  // Then the card keeps its three two-decimal figures and the sending list keeps its own shape
  const reading = await readPaidBackList(page)
  expect(
    reading.card.map((figure) => [figure.which, figure.cents, figure.text]),
    'WHAT: the balance card no longer reads its three figures to two decimals. WHY: the card is the first thing the owner looks at and this value does not touch it: the row rule applied there would restate the whole screen. HOW: leave the card figures worded as they are.',
  ).toEqual(expectedCard(stored).map((figure) => [figure.which, figure.cents, figure.text]))
  expect(
    reading.sentWords,
    'WHAT: the sending list no longer reads its own four column words. WHY: the sending side was settled before this reading and nothing here touches it: changing both lists at once would leave the owner reading a screen nobody approved. HOW: leave the sending header as it stands.',
  ).toEqual([...SENT_WORDS])
  expect(
    reading.sentFootLines,
    'WHAT: the sending list no longer stands on its three footer lines. WHY: what went out in each currency and the total of the two are read off those three lines, and this reading changes none of them. HOW: leave that footer as it stands.',
  ).toEqual([...SENT_FOOT_LINES])
})

test('the pill still moves between the two lists without moving the card', async ({ page }) => {
  // Given the owner is reading the Statement, with the sending list in sight
  await givenTheOwnerIsSignedIn(page, paidBack)
  await givenTheOwnerIsReadingTheStatement(page)
  const before = await readPaidBackList(page)

  // When the owner taps what Abbaas paid back
  await whenTheOwnerTapsWhatCameBack(page)

  // Then the lists have swapped, the card has not moved, and nothing is left mid-slide
  const after = await readPaidBackList(page)
  expect(
    [before.shown, after.shown, after.rows.length > 0],
    'WHAT: the tap on the pill did not bring what came back into sight. WHY: the pill is the only way between the two lists, and this reading leaves that switch exactly as it is. HOW: switch which list is shown on the tap, and draw its rows.',
  ).toEqual(['sent', 'back', true])
  expect(
    after.card.map((figure) => [figure.which, figure.box]),
    'WHAT: the balance card moved when the lists swapped. WHY: the card is the owner\'s fixed point above the two lists: a card that shifts as the list changes makes the figures hard to compare. HOW: switch the list under the card and leave the card where it rests.',
  ).toEqual(before.card.map((figure) => [figure.which, figure.box]))
  expect(
    await partsStillMoving(page),
    'WHAT: parts of the screen were still moving when the switch was read. WHY: a switch that never comes to rest leaves the owner reading a list in motion. HOW: finish the slide and the arriving list\'s rise, and drop each part\'s mark as it stops.',
  ).toEqual([])
})

// ===== The generated ledgers =====

/** The seed is a constant of this spec, printed with any failing ledger so it is replayed exactly. */
const GENERATOR_SEED = 20261023

/** A small deterministic source of numbers, so the ledgers below never drift. */
const numbersFrom = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

/** Five days only, so repayments collide on a day and the oldest-first order is exercised. */
const DATE_POOL = ['2026-01-05', '2026-03-17', '2026-07-01', '2026-09-14', '2026-12-28'] as const

/**
 * The shapes a stored repayment of this app can take, each one named so it is reached by
 * construction rather than hoped for: whole dollars, real cents, and one paid back in
 * rufiyaa, which this list has no column for.
 */
const REPAYMENT_SHAPES = ['dollars, whole', 'dollars, with cents', 'rufiyaa, whole'] as const
type RepaymentShape = (typeof REPAYMENT_SHAPES)[number]

/**
 * The ways a stored entry can say the money changed hands, nothing included. A token this
 * app cannot name is absent here because the ledger itself refuses one, which is observed
 * where it is written rather than on a screen that can never be given one.
 */
const STORED_METHODS = ['cash', 'cheque', 'transfer', null] as const

/**
 * One generated entry of the named shape. The dollars a rufiyaa entry stores are drawn
 * unrelated to its own amount and rate, so a reading that converts the rufiyaa figure
 * instead of reading the stored dollars is caught. A dollar entry stores the very amount it
 * was made in, as this app writes it.
 */
const generatedEntry = (
  next: () => number,
  index: number,
  shape: RepaymentShape,
  kind: 'send' | 'receive',
): EntrySeed => {
  const entryDate = DATE_POOL[Math.floor(next() * DATE_POOL.length)] ?? '2026-07-01'
  const method = STORED_METHODS[Math.floor(next() * STORED_METHODS.length)] ?? null
  const wholeUnits = 1 + Math.floor(next() * 200_000)
  const realMinor = 1 + Math.floor(next() * 99)
  const rufiyaa = shape === 'rufiyaa, whole'
  const amountMinor = shape === 'dollars, with cents' ? wholeUnits * 100 + realMinor : wholeUnits * 100
  const rate = (1 + Math.floor(next() * 40)) * 10_000
  return {
    kind,
    currency: rufiyaa ? 'MVR' : 'USD',
    amountMinor,
    rate: rufiyaa ? (rate / 10_000).toFixed(4) : null,
    usdCents: rufiyaa ? 1 + Math.floor(next() * 900_000) : amountMinor,
    entryDate,
    savedAt: `${entryDate}T0${index % 10}:${String(index % 60).padStart(2, '0')}:00Z`,
    // A repayment from Abbaas names nobody; a send names who was paid.
    personName: kind === 'send' ? (next() < 0.5 ? AHMED : MARIYAM) : undefined,
    method,
  }
}

/** The ledgers this value is judged over, including the readings that must be there. */
const generatedLedgers = (): ReadonlyArray<{ label: string; entries: readonly EntrySeed[] }> => {
  const next = numbersFrom(GENERATOR_SEED)
  const drawn = (size: number): readonly EntrySeed[] =>
    Array.from({ length: size }, (_unused, index) => {
      const shape = REPAYMENT_SHAPES[Math.floor(next() * REPAYMENT_SHAPES.length)] ?? 'dollars, whole'
      // A quarter of the entries are sends, which this list must leave out.
      return generatedEntry(next, index, shape, next() < 0.75 ? 'receive' : 'send')
    })

  return [
    { label: 'nothing recorded at all', entries: [] },
    {
      label: 'one repayment of every shape, and one stored with no way back',
      entries: [
        ...REPAYMENT_SHAPES.map((shape, index) => generatedEntry(next, index, shape, 'receive')),
        {
          ...generatedEntry(next, REPAYMENT_SHAPES.length, 'dollars, with cents', 'receive'),
          method: null,
        },
        {
          ...generatedEntry(next, REPAYMENT_SHAPES.length + 1, 'dollars, whole', 'receive'),
          method: 'cash',
        },
      ],
    },
    { label: 'one entry', entries: drawn(1) },
    { label: 'a few entries across a year', entries: drawn(4) },
    { label: 'a dozen entries', entries: drawn(12) },
    { label: 'the longest this generator draws', entries: drawn(30) },
  ]
}

/** What a judge answers: every way one ledger's reading disagreed with its stored rows. */
type Judge = (page: Page) => Promise<readonly string[]>

/** Stores one ledger, reads it through a page load and a tap, and hands it to a judge. */
const readLedgerAndJudge = async (
  page: Page,
  entries: readonly EntrySeed[],
  judge: Judge,
): Promise<readonly string[]> => {
  await replaceEntries(stack, generated, entries, generatedPeople)
  await page.reload()
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the reload asked the owner to sign in again. WHY: each generated ledger is read by the same signed-in owner. HOW: keep the session on the phone.',
  ).toHaveCount(0)
  await expect(
    statementTab(page),
    'WHAT: the reloaded app offers no Statement tab. WHY: every generated ledger is read through that tap. HOW: draw the bottom bar on every load.',
  ).toBeVisible()
  await statementTab(page).click()
  if (!(await everyPartSettles(page))) return ['parts of the screen were still moving after the tap on Statement']
  const tab = page.getByRole('tab', { name: 'Paid back by Abbaas' })
  if ((await tab.count()) === 0) return ['there is no tab to reach what came back']
  await tab.click()
  if (!(await everyPartSettles(page))) return ['parts of the screen were still moving after the tap on the pill']
  return judge(page)
}

/** Judges one reading against the stored rows: the three cells of a repayment, row by row. */
const judgeWhatCameBack: Judge = async (page: Page): Promise<readonly string[]> => {
  const stored = await readStoredLedger(stack, generated)
  const reading = await readPaidBackList(page)
  if (!reading.present) return ['there is no statement screen to read']
  const expected = expectedRows(stored)
  const reasons: string[] = []

  if (reading.rows.length !== expected.length) {
    reasons.push(
      `${reading.rows.length} rows are listed, out of ${stored.length} stored entries of which ${expected.length} came back`,
    )
  }
  const drawn = reading.rows.map((row) => ({
    place: row.place,
    date: row.date,
    method: row.method,
    token: row.token,
    usd: row.usdText,
  }))
  const meant = expected.map((row) => ({
    place: row.place,
    date: row.date,
    method: row.method,
    token: row.token,
    usd: row.usd,
  }))
  if (JSON.stringify(drawn) !== JSON.stringify(meant)) {
    reasons.push(`rows read ${JSON.stringify(drawn)} not ${JSON.stringify(meant)}`)
  }
  // This list has one currency: no rufiyaa mark and no bracketed figure belongs on it, at
  // any length and whatever the entries were paid back in.
  if (/\/-/.test(reading.listText)) reasons.push('a rufiyaa figure is drawn on this list')
  if (/\(|\)/.test(reading.listText)) reasons.push('a figure in brackets is drawn on this list')
  const wordedWithNoToken = reading.rows
    .filter((row) => (row.method === '') !== (row.token === null))
    .map((row) => `row ${row.place} reads '${row.method}' with ${JSON.stringify(row.token)} stored`)
  reasons.push(...wordedWithNoToken)
  return reasons
}

/** Judges one reading for what each figure STATES: the cents behind its own text. */
const judgeNothingIsRounded: Judge = async (page: Page): Promise<readonly string[]> => {
  const stored = await readStoredLedger(stack, generated)
  const reading = await readPaidBackList(page)
  if (!reading.present) return ['there is no statement screen to read']
  const reasons: string[] = []

  repaymentsOf(stored).forEach((row, index) => {
    const drawnRow = reading.rows[index]
    if (drawnRow === undefined) {
      reasons.push(`the repayment of ${row.entry_date} has no row of its own`)
      return
    }
    const text = drawnRow.usdText
    const stated = minorUnitsStated(text)
    if (stated !== row.usd_cents) {
      reasons.push(`'${text}' states ${String(stated)} cents, stored ${row.usd_cents}`)
    }
    if ((row.usd_cents % 100 === 0) !== !text.includes('.')) {
      reasons.push(
        `'${text}' ${text.includes('.') ? 'keeps' : 'drops'} its decimals on ${row.usd_cents} stored cents`,
      )
    }
    if (!text.startsWith('$')) {
      reasons.push(`'${text}' carries no dollar mark`)
    }
  })
  return reasons
}

/** The first generated ledger whose reading disagrees, or nothing when none does. */
const firstFailing = async (
  page: Page,
  ledgers: ReadonlyArray<{ label: string; entries: readonly EntrySeed[] }>,
  judge: Judge,
): Promise<{ label: string; entries: readonly EntrySeed[]; reasons: readonly string[] } | null> => {
  for (const ledger of ledgers) {
    const reasons = await readLedgerAndJudge(page, ledger.entries, judge)
    if (reasons.length > 0) return { label: ledger.label, entries: ledger.entries, reasons }
  }
  return null
}

/** Takes one entry away at a time while the ledger still disagrees, and reports it. */
const smallestStillFailing = async (
  page: Page,
  entries: readonly EntrySeed[],
  judge: Judge,
): Promise<{ entries: readonly EntrySeed[]; reasons: readonly string[] }> => {
  let smallest = entries
  let reasons = await readLedgerAndJudge(page, smallest, judge)
  let attempts = 0
  const BUDGET = 12
  for (let shrinking = true; shrinking && attempts < BUDGET; ) {
    shrinking = false
    for (let index = 0; index < smallest.length && attempts < BUDGET; index += 1) {
      const candidate = smallest.filter((_unused, at) => at !== index)
      attempts += 1
      const candidateReasons = await readLedgerAndJudge(page, candidate, judge)
      if (candidateReasons.length > 0) {
        smallest = candidate
        reasons = candidateReasons
        shrinking = true
        break
      }
    }
  }
  return { entries: smallest, reasons }
}

/**
 * The one line a failing generated ledger is reported as: its seed, its label and the
 * smallest ledger that still disagrees, so the case is replayed exactly. This repository
 * has no property-testing library, so there is no automatic shrinking and the smallest case
 * is found by taking entries away one at a time, which is a stated limit of this evidence.
 */
const reportOf = async (
  page: Page,
  failing: { label: string; entries: readonly EntrySeed[]; reasons: readonly string[] } | null,
  judge: Judge,
): Promise<string> => {
  if (failing === null) return ''
  const smallest = await smallestStillFailing(page, failing.entries, judge)
  return (
    `seed ${GENERATOR_SEED}, ledger '${failing.label}' of ${failing.entries.length} entries, ` +
    `smallest still failing: ${smallest.entries.length} entries ` +
    `${JSON.stringify(
      smallest.entries.map((entry) => [
        entry.kind,
        entry.currency,
        entry.entryDate,
        entry.amountMinor,
        entry.rate,
        entry.usdCents,
        entry.method ?? null,
      ]),
    )}; ` +
    `${
      smallest.reasons.length > 0
        ? smallest.reasons.join(' | ')
        : `no disagreement on the re-read, so the first reading was not repeatable; it read: ${failing.reasons.join(' | ')}`
    }`
  )
}
