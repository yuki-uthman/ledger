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

// The Statement the owner reads: a bottom bar with two tabs, and a read-only screen
// starting at the balance card, with the Sent for Abbaas list below it, pinned so
// that only its rows scroll.
//
// Judged only through the declared public port: the BUILT bundle as Chrome loads it
// over the served origin, at 360 by 780. Nothing here imports a module of src/; the
// stimulus is stored rows, the reading is the document, and every expected figure is
// derived in this file from what the ledger actually stores, so the oracle cannot
// echo back whatever the screen happens to draw.
//
// Three notes on where the expected figures come from.
//   - The brief's own figures-law says the three card figures are the sum of the
//     sends, the sum of the repayments and the unsigned difference. Applied to the
//     brief's own seven seeded rows that is 459,635, 1,100,000 and 640,365 cents; the
//     brief's prose prints 455,635 and 644,365, which its figures-law does not yield
//     from those rows. The law and the stored rows decide here, and the figures below
//     are stated as constants so a wrong one cannot pass unnoticed.
//   - The seeded rufiyaa row's stored dollars happen to equal its own conversion, so
//     that row alone cannot catch a screen that converts a second time. The generated
//     ledgers store dollars unrelated to their rate, which is what makes the
//     'read the stored dollars' law falsifiable.
//   - A sent row now reads its own currency columns: the MVR column holds a rufiyaa
//     send's marked figure with its rate appended to it, and nothing but the em dash
//     where the send was made in dollars, while the USD column holds the dollars the
//     entry stores, marked, with no brackets round them. The MVR
//     cell appends its figure and its rate with NO whitespace between them, so the
//     cell's own text reads 'MVR10,000@20'; a row read as one line of text therefore holds that one token.
//   - The footer of this list now reads three lines in one block: what went in rufiyaa
//     with its stored dollars beside them, what went in dollars, and the total of both,
//     each with its own count. Read as one text here, those lines stand in that order;
//     each line's own hooks are read by the footer's own oracle. The balance card is
//     untouched and keeps its two decimals.

const PASSWORD_FIELD = 'input[type="password"]'
const VIEWPORT = { width: 360, height: 780 } as const

/** The separator the board draws between the parts of a line. */
const DOT = '·'
/** The mark that stands where a rufiyaa figure is absent: an em dash, not a hyphen. */
const EM_DASH = '—'

/** Sub-pixel layout rounding: a box that "has not moved" may still differ by a whisker. */
const PIXEL = 1
/** The endpoint the bundle reads the ledger from, as the browser sees it. */
const ENTRIES_ENDPOINT = '**/rest/v1/entries**'
/** What a failed read says, as the port words it. */
const UNREADABLE = 'Could not load the ledger. Try again.'

// ===== The domain vocabulary this oracle speaks =====

type Method = 'cash' | 'cheque' | 'transfer'

/** The word the owner reads for a stored method; a null method says nothing at all. */
const METHOD_WORDS: Record<Method, string> = {
  cash: 'Cash',
  cheque: 'Cheque',
  transfer: 'Transfer',
}

/**
 * One row of the Sent for Abbaas list, as the owner reads it across the row: its place,
 * which the row carries as a hook and draws nowhere, its date, the person paid with the
 * line under them, and its two currency columns.
 */
type SentRowReading = {
  readonly no: string
  readonly date: string
  readonly party: string
  readonly sub: string | null
  /** The marked rufiyaa figure, or null where the send was made in dollars. */
  readonly mvr: string | null
  /** The inline rate behind its mark, or null where there is no rate to read. */
  readonly rate: string | null
  readonly usd: string
}

/** The whole Statement screen, as the owner reads it. */
type StatementReading = {
  readonly present: boolean
  readonly above: readonly string[]
  readonly headings: number
  readonly totals: ReadonlyArray<{ which: string; cents: string | null; text: string }>
  readonly head: readonly string[]
  readonly rows: ReadonlyArray<{ no: string; party: string; sub: string | null }>
  readonly rowTexts: readonly string[]
  readonly foot: { count: string | null; cents: string | null; text: string } | null
  readonly writingControls: number
  readonly pageScrolls: boolean
}

// ===== The independent oracle: what the stored rows mean, worded here =====

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

const dollars = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const grouped = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

/** The day and short month a date reads as, with no leading zero: '2026-09-14' is '14 Sep'. */
const shortDate = (date: string): string => {
  const [year, month, day] = date.split('-')
  return `${Number(day)} ${MONTHS[Number(month) - 1] ?? month} ${year}`.trim()
}
/** The same label without its year, which is how a date inside one year reads. */
const shortDateNoYear = (date: string): string => shortDate(date).split(' ').slice(0, 2).join(' ')

/** A USD figure as the card and the footer read it: always to two decimals. */
const usdWithSign = (cents: number): string => `$${dollars.format(Math.abs(cents) / 100)}`

/**
 * Whole minor units as the owner reads the amount in a row: grouped with commas, with no
 * decimals when the amount is whole and with two when it is not. Nothing is rounded.
 */
const minorFigure = (minor: number): string => {
  const units = Math.abs(minor)
  return units % 100 === 0 ? grouped.format(units / 100) : dollars.format(units / 100)
}

/** The marked whole reading of the dollars a row stores: '$1,500', '$1,500.50'. */
const usdFigure = (cents: number): string => `$${minorFigure(cents)}`
/** The reading, with no brackets, of the dollars a rufiyaa send stores: '$500', '$649.35'. */
const convertedFigure = (cents: number): string => usdFigure(cents)
/** The marked reading of stored laari: 'MVR10,000', 'MVR10,000.50'. */
const mvrFigure = (laari: number): string => `MVR${minorFigure(laari)}`

/** A stored rate as the owner reads it beside a figure: no trailing zeros, at most four decimals. */
const plainRate = (stored: string): string => {
  if (!stored.includes('.')) return stored
  return stored.replace(/0+$/, '').replace(/\.$/, '')
}

/** The rate as it stands inline in the MVR cell, behind its mark and against the figure. */
const inlineRate = (stored: string): string => `@${plainRate(stored)}`

/** What the Entries count and the footer call a number of entries. */
const countLabel = (count: number): string => {
  if (count <= 0) return 'No entries'
  if (count === 1) return '1 entry'
  return `${count} entries`
}

/**
 * A send's sub-line: the stored method's word alone. The rufiyaa figure and its rate are
 * read in the MVR column of the row itself, so nothing of them is worded here; a row with
 * nothing nameable stored has no sub-line at all.
 */
const sublineOf = (row: StoredLedgerRow): string | null => {
  if (row.method === null) return null
  return METHOD_WORDS[row.method as Method] ?? null
}

/** Oldest first: by entry date, then by the instant it was saved, then by its id. */
const oldestFirst = (rows: readonly StoredLedgerRow[]): readonly StoredLedgerRow[] =>
  [...rows].sort(
    (left, right) =>
      left.entry_date.localeCompare(right.entry_date) ||
      left.saved_at.localeCompare(right.saved_at) ||
      left.id.localeCompare(right.id),
  )

/**
 * The sent rows the stored ledger means, in the order the owner reads them: each one's
 * place, its date, its person and sub-line, and its two currency columns, all derived from
 * the stored currency, minor units, rate and dollars of that row alone.
 */
const expectedSentRows = (rows: readonly StoredLedgerRow[]): readonly SentRowReading[] =>
  oldestFirst(rows.filter((row) => row.kind === 'send')).map((row, index) => {
    const inRufiyaa = row.currency === 'MVR'
    return {
      no: String(index + 1),
      date: shortDateNoYear(row.entry_date),
      party: row.person_name ?? '',
      sub: sublineOf(row),
      mvr: inRufiyaa ? mvrFigure(row.amount_minor) : null,
      rate: inRufiyaa && row.rate !== null ? inlineRate(row.rate) : null,
      usd: inRufiyaa ? convertedFigure(row.usd_cents) : usdFigure(row.usd_cents),
    }
  })

/**
 * The whole row as one line of text, in the order the cells stand: the date, the person
 * with their sub-line, the MVR cell and the USD cell. No place is drawn in the row at all.
 * The MVR cell's own figure and rate carry no whitespace between them, so they stand here
 * as one token, and a dollar send reads the em dash that stands for the figure it has not.
 */
const asRowText = (row: SentRowReading): string =>
  [
    row.date,
    row.party,
    row.sub,
    row.mvr === null ? EM_DASH : `${row.mvr}${row.rate ?? ''}`,
    row.usd,
  ]
    .filter((cell) => cell !== null && cell !== '')
    .join(' ')

/** The three figures of the balance card, in cents. */
const expectedFigures = (
  rows: readonly StoredLedgerRow[],
): { sent: number; paid: number; balance: number } => {
  const sent = rows.filter((row) => row.kind === 'send').reduce((sum, row) => sum + row.usd_cents, 0)
  const paid = rows.filter((row) => row.kind === 'receive').reduce((sum, row) => sum + row.usd_cents, 0)
  return { sent, paid, balance: Math.abs(sent - paid) }
}

/** The dollar value of the rufiyaa subtotal, which keeps its two decimals and no brackets. */
const convertedTotal = (cents: number): string => usdWithSign(cents)

/**
 * The footer of the sent list: three lines in the order they are drawn, read as the one
 * block of text they stand in. The rufiyaa line reads the laari the sends stored in MVR
 * add up to, with the dollars those same sends store beside them; the dollar line reads
 * the sends stored in USD; the total line reads every send, whatever its currency. Each
 * count is worded as this app words a count, every figure keeps its two decimals except
 * the rufiyaa subtotal, which reads like a rufiyaa amount, and the block's own count and
 * cents are still the total line's, so a reader that knew only the old hooks still reads
 * the total. All three lines stand at every ledger, the empty one included.
 */
const expectedFoot = (rows: readonly StoredLedgerRow[]): { count: string; cents: string; text: string } => {
  const sends = rows.filter((row) => row.kind === 'send')
  const centsOf = (group: readonly StoredLedgerRow[]): number =>
    group.reduce((sum, row) => sum + row.usd_cents, 0)
  const inRufiyaa = sends.filter((row) => row.currency === 'MVR')
  const inDollars = sends.filter((row) => row.currency === 'USD')
  const laari = inRufiyaa.reduce((sum, row) => sum + row.amount_minor, 0)
  return {
    count: String(sends.length),
    cents: String(centsOf(sends)),
    text: [
      `Sent in MVR ${DOT} ${countLabel(inRufiyaa.length)} ${mvrFigure(laari)} ${convertedTotal(centsOf(inRufiyaa))}`,
      `Sent in USD ${DOT} ${countLabel(inDollars.length)} ${usdWithSign(centsOf(inDollars))}`,
      `Total Sent ${DOT} ${countLabel(sends.length)} ${usdWithSign(centsOf(sends))}`,
    ].join(' '),
  }
}

// ===== The stimulus: the stored ledger the owner signs in to =====

const ACCOUNT_SEVEN = { email: 'owner-statement-a@abbaas.test', password: 'statement-password-a1' } as const
const ACCOUNT_EMPTY = { email: 'owner-statement-b@abbaas.test', password: 'statement-password-b2' } as const
const ACCOUNT_GENERATED = { email: 'owner-statement-g@abbaas.test', password: 'statement-password-g3' } as const
const ACCOUNT_LONG = { email: 'owner-statement-l@abbaas.test', password: 'statement-password-l4' } as const
const ACCOUNT_OFFERED = { email: 'owner-statement-r@abbaas.test', password: 'statement-password-r5' } as const

const AHMED = 'Ahmed Shifaz'
const MARIYAM = 'Mariyam Nisha'

/**
 * The brief's seven rows: five sends across a month and two repayments inside it, one
 * send in rufiyaa with a method, one in rufiyaa without, one in dollars without, and
 * the earliest and the latest entry a send, so the oldest-first order has both ends.
 */
const SEVEN: readonly EntrySeed[] = [
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 200700,
    rate: null,
    usdCents: 200700,
    entryDate: '2026-09-14',
    savedAt: '2026-09-14T09:00:00Z',
    personName: MARIYAM,
    method: 'transfer',
  },
  {
    kind: 'send',
    currency: 'MVR',
    amountMinor: 1700000,
    rate: '20.0000',
    usdCents: 85000,
    entryDate: '2026-09-20',
    savedAt: '2026-09-20T09:00:00Z',
    personName: AHMED,
    method: 'transfer',
  },
  {
    kind: 'receive',
    currency: 'USD',
    amountMinor: 500000,
    rate: null,
    usdCents: 500000,
    entryDate: '2026-09-22',
    savedAt: '2026-09-22T09:00:00Z',
    method: 'cash',
  },
  {
    kind: 'send',
    currency: 'MVR',
    amountMinor: 1000000,
    rate: '15.4000',
    usdCents: 64935,
    entryDate: '2026-09-29',
    savedAt: '2026-09-29T09:00:00Z',
    personName: AHMED,
    method: null,
  },
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 9000,
    rate: null,
    usdCents: 9000,
    entryDate: '2026-10-03',
    savedAt: '2026-10-03T09:00:00Z',
    personName: MARIYAM,
    method: null,
  },
  {
    kind: 'receive',
    currency: 'USD',
    amountMinor: 600000,
    rate: null,
    usdCents: 600000,
    entryDate: '2026-10-08',
    savedAt: '2026-10-08T09:00:00Z',
    method: 'cheque',
  },
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 100000,
    rate: null,
    usdCents: 100000,
    entryDate: '2026-10-14',
    savedAt: '2026-10-14T09:00:00Z',
    personName: MARIYAM,
    method: 'cheque',
  },
]

/** The figures those seven rows mean, stated so a wrong sum cannot pass unnoticed. */
const SEVEN_SENT_CENTS = 459635
const SEVEN_PAID_CENTS = 1100000
const SEVEN_BALANCE_CENTS = 640365

/** How long the ledger of the long-ledger owner is. */
const LONG_LEDGER_ROWS = 500

let stack: Stack
let served: ServedOrigin
let seven: Account
let empty: Account
let generated: Account
let long: Account
let offered: Account
let generatedPeople: ReadonlyMap<string, string>

test.use({ viewport: VIEWPORT })
// Not serial: each scenario signs in as its own owner and reads its own ledger, so one
// scenario's disagreement must not hide what the other eight observe.

test.beforeAll(async () => {
  stack = startLocalStack()
  buildBundle(stack)
  served = await serveDist()

  seven = await createAccount(stack, ACCOUNT_SEVEN)
  const sevenPeople = await seedPeopleByName(stack, seven, [AHMED, MARIYAM])
  await replaceEntries(stack, seven, SEVEN, sevenPeople)

  empty = await createAccount(stack, ACCOUNT_EMPTY)

  generated = await createAccount(stack, ACCOUNT_GENERATED)
  generatedPeople = await seedPeopleByName(stack, generated, [AHMED, MARIYAM])

  long = await createAccount(stack, ACCOUNT_LONG)
  const longPeople = await seedPeopleByName(stack, long, [MARIYAM])
  await replaceEntries(stack, long, longLedger(LONG_LEDGER_ROWS), longPeople)

  offered = await createAccount(stack, ACCOUNT_OFFERED)
  await seedPeopleByName(stack, offered, [MARIYAM])
})

test.afterAll(async () => {
  await served?.close()
})

/** A ledger of many sends, so the rows area really has somewhere to scroll. */
const longLedger = (rows: number): readonly EntrySeed[] =>
  Array.from({ length: rows }, (_unused, index) => {
    const day = (index % 28) + 1
    const month = (index % 12) + 1
    return {
      kind: 'send' as const,
      currency: 'USD' as const,
      amountMinor: 1000 + index,
      rate: null,
      usdCents: 1000 + index,
      entryDate: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      savedAt: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T0${index % 10}:00:00Z`,
      personName: MARIYAM,
      method: (['cash', 'cheque', 'transfer', null] as const)[index % 4] ?? null,
    }
  })

// ===== The steps this oracle's scenarios are written in =====

const givenTheOwnerIsSignedIn = async (page: Page, account: Account): Promise<void> => {
  await page.goto(ORIGIN)
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen never appeared. WHY: every reading of the Statement starts from a signed-in owner. HOW: serve the built bundle and let it mount its sign-in screen.',
  ).toBeVisible()
  await page.getByLabel('Email').fill(account.email)
  await page.getByLabel('Password').fill(account.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen stayed up after Sign in. WHY: the owner cannot reach either tab until the app lets them in. HOW: confirm the seeded account and let sign-in replace the screen.',
  ).toHaveCount(0)
}

const statementTab = (page: Page): Locator => page.locator('[data-view="statement"]')
const entriesTab = (page: Page): Locator => page.locator('[data-view="entries"]')
const statement = (page: Page): Locator => page.locator('[data-screen="statement"]')
const entriesPane = (page: Page): Locator => page.locator('[data-pane="entries"]')
const statementPane = (page: Page): Locator => page.locator('[data-pane="statement"]')

/**
 * The marks of the parts of a switch that are still moving, named by their own journey or
 * kind: a sliding track, a sliding pair of panels, and the arriving screen's card, pill,
 * panel and pinned parts. Two marks are left out on purpose. A row rising or crossing
 * inside its own scrolling area carries no box, hook or reading these scenarios take, and a
 * long list keeps its rows marked after the switch itself has rested; and a screen's own
 * arrival on a paint is a different journey, which these scenarios never read mid-flight.
 */
const partsStillMoving = (page: Page): Promise<readonly string[]> =>
  page.evaluate(() => {
    const switching = ['view-slide', 'list-slide', 'list-enter']
    return Array.from(document.querySelectorAll('[data-motion], [data-enter-rise]'))
      .map((part) => part.getAttribute('data-motion') ?? `rise:${part.getAttribute('data-enter-rise')}`)
      .filter((mark) => switching.includes(mark) || mark.startsWith('rise:switch-'))
      .filter((mark) => !mark.endsWith('row'))
  })

/**
 * Waits until nothing is moving any more, so every box, position and row read after a tap
 * is read from where it came to rest. On a product that moves nothing this returns at once.
 */
const thenEveryPartHasComeToRest = async (page: Page): Promise<void> => {
  await expect
    .poll(() => partsStillMoving(page), {
      message:
        'WHAT: the switch was still moving two seconds after the tap. WHY: every box, position and reading this oracle takes after a tap is taken from where the switch came to rest, so a reading taken mid-slide would judge a place the owner never sees. HOW: finish the slide and the arriving screen\'s rise, and drop each part\'s mark as it stops.',
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

const whenTheOwnerTapsStatement = async (page: Page): Promise<void> => {
  await expect(
    statementTab(page),
    'WHAT: there is no Statement tab to tap on the bottom bar. WHY: a tap on that tab is the only way into the Statement, so without it the screen is unreachable. HOW: draw the bottom bar with its Entries and Statement tabs.',
  ).toBeVisible()
  await statementTab(page).click()
  await expect(
    statement(page),
    'WHAT: tapping Statement showed no statement screen. WHY: the tap is what brings the figures and the rows into the viewport. HOW: show the pane whose screen carries data-screen=statement.',
  ).toBeVisible()
  await thenEveryPartHasComeToRest(page)
}

const whenTheOwnerTapsEntries = async (page: Page): Promise<void> => {
  await expect(
    entriesTab(page),
    'WHAT: there is no Entries tab to tap. WHY: the owner must be able to come back to their entries. HOW: draw both tabs on the bottom bar.',
  ).toBeVisible()
  await entriesTab(page).click()
  await thenEveryPartHasComeToRest(page)
}

/** Reads the whole Statement screen in one pass, answering even when it is not there. */
const readStatement = (page: Page): Promise<StatementReading> =>
  page.evaluate(() => {
    const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()
    const screen = document.querySelector('[data-screen="statement"]')
    const root = document.documentElement
    const pageScrolls = root.scrollHeight > root.clientHeight + 1 || root.scrollTop !== 0
    if (!screen) {
      return {
        present: false,
        above: [],
        headings: 0,
        totals: [],
        head: [],
        rows: [],
        rowTexts: [],
        foot: null,
        writingControls: 0,
        pageScrolls,
      }
    }
    const above: string[] = []
    const cardAncestors: Element[] = []
    for (let part: Element | null = screen.querySelector('[data-statement-total]'); part !== null && part !== screen; part = part.parentElement) {
      cardAncestors.push(part)
    }
    const cardPart = cardAncestors[cardAncestors.length - 1] ?? null
    if (cardPart !== null) {
      for (const part of Array.from(screen.children)) {
        if (part === cardPart) break
        above.push(`${part.tagName.toLowerCase()} '${squash(part.textContent).slice(0, 40)}'`)
      }
    }
    const headings = screen.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]').length
    const totals = Array.from(screen.querySelectorAll('[data-statement-total]')).map((row) => ({
      which: row.getAttribute('data-statement-total') ?? '',
      cents: row.getAttribute('data-cents'),
      text: squash(row.textContent),
    }))
    const head = Array.from(screen.querySelectorAll('[data-statement-head="sent"] > *')).map((cell) =>
      squash(cell.textContent),
    )
    // Rows are read inside the sent panel, as the header, the footer and the scrolling
    // area beside them already are: the paid-back list numbers its own rows from one
    // upward too, so a reading taken across the whole screen would run the two lists
    // together and call it one.
    const rowElements = Array.from(
      screen.querySelectorAll('[data-statement-list="sent"] [data-statement-row]'),
    )
    const rows = rowElements.map((row) => {
      const sub = row.querySelector('[data-statement-sub]')
      const party = row.querySelector('[data-person]')
      return {
        no: row.getAttribute('data-no') ?? '',
        party: squash(party?.textContent),
        sub: sub === null ? null : squash(sub.textContent),
      }
    })
    const footElement = screen.querySelector('[data-statement-foot="sent"]')
    const writing =
      screen.querySelectorAll('[data-box], [data-action]').length +
      Array.from(screen.querySelectorAll('button, a')).filter((control) =>
        ['Send', 'Receive'].includes(squash(control.textContent)),
      ).length
    return {
      present: true,
      above,
      headings,
      totals,
      head,
      rows,
      rowTexts: rowElements.map((row) => squash(row.textContent)),
      foot:
        footElement === null
          ? null
          : {
              count: footElement.getAttribute('data-count'),
              cents: footElement.getAttribute('data-cents'),
              text: squash(footElement.textContent),
            },
      writingControls: writing,
      pageScrolls,
    }
  })

// ===== The balance card, as the board draws it and the owner reads it =====

/** The sign the card draws before what came back: a minus, not a hyphen. */
const MINUS = '\u2212'

/** The card as the owner reads it: its words and its sign. */
type CardReading = {
  readonly present: boolean
  readonly labels: readonly string[]
  readonly signs: readonly string[]
  /** Whether a drawn line stands between the first two rows and the Balance row, above that row. */
  readonly dividerAboveBalance: boolean
}

/**
 * Reads the balance card as the owner sees it, found from the figures it holds rather than
 * from any hook the design does not declare: the card is the nearest thing around all three
 * figures. Answers the three labels in order, whatever stands between each label and its
 * own figure, and whether a line is drawn above the Balance row.
 */
const readBalanceCard = (page: Page): Promise<CardReading> =>
  page.evaluate((): CardReading => {
    const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()
    const absent: CardReading = { present: false, labels: [], signs: [], dividerAboveBalance: false }
    const screen = document.querySelector('[data-screen="statement"]')
    if (!screen) return absent
    const figures = Array.from(screen.querySelectorAll('[data-statement-total]'))
    const first = figures[0]
    if (first === undefined) return absent

    let climbing: Element | null = first.parentElement
    for (;;) {
      if (climbing === null) return absent
      const probe = climbing
      if (figures.every((figure) => probe.contains(figure))) break
      climbing = climbing.parentElement
    }
    const card = climbing

    const rowOf = (figure: Element): Element => {
      let row: Element = figure
      while (row.parentElement !== null && row.parentElement !== card) row = row.parentElement
      return row
    }
    const rows = figures.map(rowOf)
    const cellsBeforeTheFigure = (row: Element, figure: Element): readonly Element[] => {
      const cells = Array.from(row.children)
      const at = cells.findIndex((cell) => cell.contains(figure))
      return cells.slice(1, at < 0 ? cells.length : at)
    }
    /** Whether a line is drawn above the Balance row: a part of its own before it, or its own top edge. */
    const dividerAbove = (): boolean => {
      const balanceAt = figures.findIndex((figure) => figure.getAttribute('data-statement-total') === 'balance')
      const balanceRow = balanceAt < 0 ? null : (rows[balanceAt] ?? null)
      if (balanceRow === null) return false
      const before = balanceRow.previousElementSibling
      if (before !== null && !rows.includes(before)) {
        const line = before.getBoundingClientRect()
        // One pixel of slack is sub-pixel layout rounding only.
        return line.width > 0 && line.height > 0 && line.bottom <= balanceRow.getBoundingClientRect().top + 1
      }
      return Number.parseFloat(window.getComputedStyle(balanceRow).borderTopWidth) > 0
    }

    return {
      present: true,
      labels: rows.map((row) => squash(row.firstElementChild?.textContent)),
      signs: rows.map((row, index) =>
        cellsBeforeTheFigure(row, figures[index] as Element)
          .map((cell) => squash(cell.textContent))
          .join(' ')
          .trim(),
      ),
      dividerAboveBalance: dividerAbove(),
    }
  })

/** The box of one part of the screen, read only once the part is really there. */
const boxOf = async (locator: Locator, what: string): Promise<{ x: number; y: number; width: number; height: number }> => {
  await expect(
    locator,
    `WHAT: ${what} is not on the screen to measure. WHY: the pinned layout is a claim about where that part stays. HOW: draw it inside the statement pane.`,
  ).toBeVisible()
  const box = await locator.boundingBox()
  if (!box) throw new Error(`${what} has no layout box`)
  return box
}

/** Scrolls the rows area of the sent list to its end and says how far it travelled. */
const scrollRowsToTheEnd = (page: Page): Promise<number> =>
  page.evaluate(() => {
    const area = document.querySelector('[data-statement-rows="sent"]')
    if (!area) return -1
    area.scrollTop = area.scrollHeight
    return area.scrollTop
  })

// ===== The scenarios =====

test("the bottom bar offers Entries and Statement, and the Entries tab still shows the owner's ledger", async ({
  page,
}) => {
  // Given the owner has a month of sends and repayments in their ledger
  await givenTheOwnerIsSignedIn(page, seven)

  // When the owner looks at the bar they arrived on
  const bar = page.getByRole('navigation', { name: 'Views' })

  // Then both tabs stand on it, with the Entries tab the active one
  await expect(
    bar,
    'WHAT: there is no bottom bar named Views. WHY: the bar is how the owner moves between their entries and the Statement. HOW: draw a navigation bar with that accessible name.',
  ).toBeVisible()
  const barBox = await boxOf(bar, 'the bottom bar')
  expect(
    Math.round(barBox.y + barBox.height),
    'WHAT: the bottom bar does not sit on the foot of the phone. WHY: the owner reaches it with their thumb. HOW: pin the bar to the bottom of the viewport.',
  ).toBe(VIEWPORT.height)

  await expect(
    entriesTab(page),
    'WHAT: no tab named Entries. WHY: the owner must be able to name where they are going. HOW: label the first tab Entries.',
  ).toHaveText(/Entries/)
  await expect(
    statementTab(page),
    'WHAT: no tab named Statement. WHY: that tab is the only way into the Statement. HOW: label the second tab Statement.',
  ).toHaveText(/Statement/)
  await expect(
    entriesTab(page),
    'WHAT: the Entries tab does not say it is the current one. WHY: the owner must be able to see which view they are in. HOW: carry aria-current=page on the active tab.',
  ).toHaveAttribute('aria-current', 'page')
  await expect(
    statementTab(page),
    'WHAT: the Statement tab claims to be current while Entries is showing. WHY: exactly one tab is the current one. HOW: carry aria-current=false on the tab that is not showing.',
  ).toHaveAttribute('aria-current', 'false')

  // And the pill lies under the active tab, on its own half of the bar
  const pill = bar.locator('[aria-hidden="true"]').first()
  const pillBox = await boxOf(pill, 'the pill')
  const entriesBox = await boxOf(entriesTab(page), 'the Entries tab')
  expect(
    [pillBox.x + pillBox.width / 2 >= entriesBox.x, pillBox.x + pillBox.width / 2 <= entriesBox.x + entriesBox.width],
    'WHAT: the pill does not rest under the active tab. WHY: the pill is what tells the owner, at a glance, which view they are in. HOW: rest the pill at zero or one half of the bar, under the showing tab.',
  ).toEqual([true, true])
  expect(
    pillBox.x + pillBox.width,
    'WHAT: the pill crosses into the other tab\'s half. WHY: a pill under both tabs names neither. HOW: keep the pill inside the half of the bar it rests on.',
  ).toBeLessThanOrEqual(VIEWPORT.width / 2 + PIXEL)

  // And the Entries tab still shows today's Home, with its figures and its buttons
  await expect(
    entriesPane(page).locator('[data-box="you"]'),
    'WHAT: Home lost its You box. WHY: this change gives Home a pane of its own and must leave Home itself alone. HOW: render the same Home inside the entries pane.',
  ).toHaveCount(1)
  await expect(
    entriesPane(page).locator('[data-box="abbaas"]'),
    'WHAT: Home lost its Abbaas box. WHY: this change must leave Home itself alone. HOW: render the same Home inside the entries pane.',
  ).toHaveCount(1)
  await expect(
    entriesPane(page).locator('[data-action="send"]'),
    'WHAT: Home lost its Send button. WHY: the owner still records money from Home. HOW: keep Home\'s bottom buttons inside its own pane.',
  ).toHaveCount(1)
  await expect(
    entriesPane(page).locator('[data-action="receive"]'),
    'WHAT: Home lost its Receive button. WHY: the owner still records money from Home. HOW: keep Home\'s bottom buttons inside its own pane.',
  ).toHaveCount(1)
  await expect(
    entriesPane(page).locator('[data-entry]'),
    'WHAT: Home does not list the seven stored entries. WHY: the Entries tab shows today\'s Home, unchanged. HOW: keep Home\'s own list and figures exactly as they were.',
  ).toHaveCount(SEVEN.length)
  await expect(
    page.getByRole('region', { name: 'Entries' }),
    'WHAT: the entries pane has no accessible name. WHY: a pane the owner can be moved into must say what it is. HOW: name the two panes Entries and Statement.',
  ).toHaveCount(1)
})

test('a tap on Statement starts at the balance card, reads the three figures and every send oldest first, and offers nothing that records money', async ({
  page,
}) => {
  // Given the owner has a month of sends and repayments, and the ledger was read once
  let entryReads = 0
  await page.route(ENTRIES_ENDPOINT, async (route) => {
    if (route.request().method() === 'GET') entryReads += 1
    await route.continue()
  })
  await givenTheOwnerIsSignedIn(page, seven)
  await expect(
    entriesPane(page).locator('[data-entry]'),
    'WHAT: Home did not finish reading the ledger. WHY: both panes are built from that one read. HOW: await the read before painting.',
  ).toHaveCount(SEVEN.length)
  const readsBeforeTheTap = entryReads
  const historyBefore = await page.evaluate(() => window.history.length)
  const stored = await readStoredLedger(stack, seven)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the screen starts at the card, reads its figures and its rows, and nothing can write
  const reading = await readStatement(page)
  const figures = expectedFigures(stored)
  const rows = expectedSentRows(stored)

  expect(
    figures,
    'WHAT: the stored rows do not add up to the figures this oracle expects. WHY: the card\'s figures are the sum of the stored sends, the sum of the repayments and their unsigned difference. HOW: seed the brief\'s seven rows exactly as stored.',
  ).toEqual({ sent: SEVEN_SENT_CENTS, paid: SEVEN_PAID_CENTS, balance: SEVEN_BALANCE_CENTS })

  expect(
    reading.above,
    'WHAT: something stands above the balance card inside the Statement. WHY: the owner asked to start at the figures: a heading or a line of dates above the card costs the phone its first screenful and says nothing the tab and the card do not already say. HOW: draw the card as the first part inside the pane, and nothing before it.',
  ).toEqual([])
  expect(
    reading.headings,
    'WHAT: the Statement holds a heading. WHY: the view names itself through its tab and the pane\'s own accessible name, so a heading inside it repeats what the owner already read. HOW: draw no heading element inside the pane.',
  ).toBe(0)
  await expect(
    statementPane(page),
    'WHAT: the statement pane is no longer named Statement. WHY: dropping the heading must not cost an owner using a screen reader the name of the view they are in. HOW: keep the pane\'s accessible name Statement.',
  ).toHaveAccessibleName('Statement')

  expect(
    reading.totals.map((total) => [total.which, total.cents, total.text]),
    'WHAT: the balance card does not read Total Sent, Paid Back and Balance as the stored rows add up. WHY: these three figures are why the owner opens the Statement. HOW: sum the stored sends, the stored repayments and take their unsigned difference, in cents.',
  ).toEqual([
    ['sent', String(figures.sent), usdWithSign(figures.sent)],
    ['paid', String(figures.paid), usdWithSign(figures.paid)],
    ['balance', String(figures.balance), usdWithSign(figures.balance)],
  ])

  // And the card itself reads its words and its minus, which a hook token cannot stand in for.
  const card = await readBalanceCard(page)
  expect(
    card.labels,
    "WHAT: the balance card's three rows do not read 'Total Sent', 'Paid Back' and 'Balance', in that order. WHY: a figure with no word beside it tells the owner nothing about what it counts, and the order is what makes the third the sum of the first two. HOW: label the three rows with those words, top to bottom.",
  ).toEqual(['Total Sent', 'Paid Back', 'Balance'])
  expect(
    card.signs,
    `WHAT: the Paid Back row does not read a '${MINUS}' between its words and its figure, or another row reads a sign. WHY: the minus is what tells the owner that this money came back against what went out, rather than adding to it. HOW: draw the minus before the Paid Back figure and nowhere else.`,
  ).toEqual(['', MINUS, ''])
  expect(
    card.dividerAboveBalance,
    'WHAT: there is no line across the card above the Balance row. WHY: the line is what separates the two figures the balance is made of from the balance itself, so the owner reads a sum and not a third amount. HOW: draw a line across the card, above the Balance row.',
  ).toBe(true)

  await expect(
    statement(page).locator('[data-statement-list="sent"]'),
    'WHAT: there is no sent panel on the Statement. WHY: the Sent for Abbaas list is the body of this screen. HOW: draw the panel carrying data-statement-list=sent.',
  ).toHaveCount(1)
  // Named, not typed: what the owner must get is a list that says what it holds. Which
  // kind of thing carries that name is the screen's business, and a later value makes
  // these two panels the pages of a switch.
  await expect(
    statement(page).locator('[data-statement-list="sent"]'),
    'WHAT: the sent list is not named Sent for Abbaas. WHY: the owner must be told what the list the owner reads holds. HOW: give that panel the accessible name Sent for Abbaas.',
  ).toHaveAccessibleName('Sent for Abbaas')
  expect(
    reading.head,
    'WHAT: the column header does not read Date, Paid to, MVR and USD. WHY: those four words are what make the four cells of a row readable, and the two currency words are how the owner knows which column holds rufiyaa and which holds dollars. HOW: draw the header the board draws, with no number column at all.',
  ).toEqual(['Date', 'Paid to', 'MVR', 'USD'])

  expect(
    reading.rows.map((row) => row.no),
    'WHAT: the rows do not carry their place, 1 upward in document order. WHY: the number is no longer drawn, but each row still knows where it stands in the oldest-first order, which is what a reader of this list checks the order by. HOW: carry each send\'s own place on its row, 1 upward in the oldest-first order, and draw no number in the row.',
  ).toEqual(rows.map((row) => row.no))
  expect(
    reading.rowTexts,
    'WHAT: the sent rows do not read, oldest first, their date, the person paid with the sub-line, their rufiyaa column and their dollar column, with no number drawn anywhere. WHY: this list IS the statement: a drawn number, a wrong order, a wrong date, a wrong sub-line or a wrong figure in either currency misstates what the owner sent. HOW: build each row from its own stored entry, oldest first by date, then by the instant it was saved, then by its id, with the rufiyaa figure and its rate in the MVR cell and the stored dollars in the USD cell.',
  ).toEqual(rows.map(asRowText))
  expect(
    reading.rows.map((row) => row.sub),
    'WHAT: a row\'s sub-line is not the stored method\'s word alone. WHY: the rufiyaa figure and its rate are read in the MVR column now, so anything else under the person either repeats a column or invents what was stored. HOW: word the stored method and nothing else, and draw no sub-line at all for a send with no nameable stored method.',
  ).toEqual(rows.map((row) => row.sub))
  expect(
    reading.rowTexts.filter((text) => !text.includes('$')),
    'WHAT: a sent row reads a figure with no mark on it. WHY: a row carries two currencies at once, so an unmarked figure leaves the owner unable to tell rufiyaa from dollars: every row reads its stored dollars marked, whichever currency the send was made in. HOW: word each row figure with its own mark rather than through the unmarked two-decimal formatter.',
  ).toEqual([])

  expect(
    reading.foot,
    'WHAT: the footer does not read its three lines - Sent in MVR with the rufiyaa subtotal and its dollar value, Sent in USD with its dollar subtotal, and Total Sent with the total - each with the count of its own sends. WHY: the footer is the owner\'s check that the list and the card agree, and a single line would hide which half of the money went in which currency. HOW: split the sent footer by the stored currency of each send, draw all three lines, and keep the block\'s own count and cents reading the total line.',
  ).toEqual(expectedFoot(stored))

  expect(
    reading.writingControls,
    'WHAT: the Statement offers something that records money. WHY: the Statement is read-only: a balance box or a Send or Receive button there would let the owner write from a screen that only reports. HOW: draw no data-box, no data-action and no control named Send or Receive on this screen.',
  ).toBe(0)

  // And the tap read nothing again, and added no hash and no history entry
  expect(
    entryReads - readsBeforeTheTap,
    'WHAT: tapping Statement read the ledger again. WHY: both panes are built from one read, so the two can never disagree and the switch costs nothing. HOW: switch on the shown attribute alone, reading nothing.',
  ).toBe(0)
  expect(
    await page.evaluate(() => window.location.hash),
    'WHAT: the tab tap changed the address. WHY: the Statement is not a route in this value, so a tap must leave the address alone. HOW: switch the shown pane without touching the hash.',
  ).toBe('')
  expect(
    await page.evaluate(() => window.history.length),
    'WHAT: the tab tap pushed a history entry. WHY: the phone\'s back button must not have to walk back through tab taps. HOW: switch the shown pane without pushing history.',
  ).toBe(historyBefore)
})

test('only the rows of the statement scroll: the card, the column header and the footer stay where they are', async ({
  page,
}) => {
  // Given the owner is reading their statement
  await givenTheOwnerIsSignedIn(page, seven)
  await whenTheOwnerTapsStatement(page)
  const card = statement(page).locator('[data-statement-total="balance"]')
  const head = statement(page).locator('[data-statement-head="sent"]')
  const foot = statement(page).locator('[data-statement-foot="sent"]')
  const before = {
    card: await boxOf(card, "the balance card's own Balance figure"),
    head: await boxOf(head, 'the column header'),
    foot: await boxOf(foot, 'the footer'),
  }

  // When the rows area is scrolled to its end
  const travelled = await scrollRowsToTheEnd(page)

  // Then nothing but the rows has moved, and the page itself has not scrolled
  expect(
    travelled,
    'WHAT: the statement has no rows area to scroll. WHY: the pinned layout is the claim that the rows area alone scrolls, so it must be there to scroll. HOW: draw the scrolling rows area of the sent list.',
  ).toBeGreaterThanOrEqual(0)
  const after = {
    card: await boxOf(card, "the balance card's own Balance figure"),
    head: await boxOf(head, 'the column header'),
    foot: await boxOf(foot, 'the footer'),
  }
  for (const part of ['card', 'head', 'foot'] as const) {
    expect(
      Math.abs(after[part].y - before[part].y),
      `WHAT: ${part === 'head' ? 'the column header' : part === 'foot' ? 'the footer' : `the ${part}`} moved when the rows were scrolled. WHY: the owner must keep the figures and the column words in sight while they read down the list. HOW: scroll the rows area alone, inside a panel whose header and footer cannot move.`,
    ).toBeLessThanOrEqual(PIXEL)
  }

  const scroll = await page.evaluate(() => ({
    top: document.documentElement.scrollTop,
    height: document.documentElement.scrollHeight,
    client: document.documentElement.clientHeight,
    scrollers: Array.from(document.querySelectorAll('[data-screen="statement"] *')).filter((element) => {
      const style = window.getComputedStyle(element)
      return (
        ['auto', 'scroll'].includes(style.overflowY) &&
        element.getAttribute('data-statement-rows') === null
      )
    }).length,
  }))
  expect(
    scroll.top,
    'WHAT: the page itself scrolled. WHY: a page that scrolls carries the bar and the figures off the phone. HOW: make the shell exactly the viewport height and keep every scrolling area inside a pane.',
  ).toBe(0)
  expect(
    scroll.height,
    'WHAT: the document is taller than the phone. WHY: the page must never scroll at any list length. HOW: keep the shell to the dynamic viewport height.',
  ).toBeLessThanOrEqual(scroll.client + PIXEL)
  expect(
    scroll.scrollers,
    'WHAT: something other than the rows area can scroll inside the statement. WHY: only the rows scroll, so the card, the header and the footer cannot be scrolled away. HOW: let the rows area alone be the overflowing one.',
  ).toBe(0)

  // And Home's own fade, which belongs to the other pane, lies nowhere over these rows
  const fade = entriesPane(page).locator('[data-fade]')
  await expect(
    fade,
    'WHAT: Home\'s fade is not inside the entries pane. WHY: anchored to the whole screen it would lie over the statement\'s own rows. HOW: make each pane the containing block of its own fixed furniture.',
  ).toHaveCount(1)
  const fadeBox = await boxOf(fade, 'Home\'s fade')
  const statementBox = await boxOf(statementPane(page), 'the statement pane')
  expect(
    fadeBox.x >= statementBox.x + statementBox.width - PIXEL || fadeBox.x + fadeBox.width <= statementBox.x + PIXEL,
    'WHAT: Home\'s fade lies over the statement pane. WHY: a fade anchored to the viewport instead of its own pane would grey out the statement\'s rows. HOW: anchor the fade to the entries pane, which travels with it.',
  ).toBe(true)
})

test('an owner with nothing recorded still reads the whole statement, with no rows and no entries counted', async ({
  page,
}) => {
  // Given an owner who has recorded nothing at all
  await givenTheOwnerIsSignedIn(page, empty)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the same screen reads zero three times, lists no row, and says so in words
  const reading = await readStatement(page)
  expect(
    [reading.above, reading.headings],
    'WHAT: an empty ledger draws something above the balance card, or a heading. WHY: the Statement starts at the figures at every ledger length, and an owner with nothing recorded is shown the same screen as one with a year of entries. HOW: draw the card first inside the pane, with no heading and no line of dates before it.',
  ).toEqual([[], 0])
  expect(
    reading.totals.map((total) => [total.which, total.cents, total.text]),
    'WHAT: an empty ledger does not read $0.00 three times. WHY: an owner who has recorded nothing is owed nothing and owes nothing. HOW: sum an empty ledger to zero rather than hiding the card.',
  ).toEqual([
    ['sent', '0', '$0.00'],
    ['paid', '0', '$0.00'],
    ['balance', '0', '$0.00'],
  ])
  expect(
    reading.head,
    'WHAT: the column header is missing on an empty statement. WHY: the owner must see what the list would hold, both currency columns included. HOW: draw the header whether or not there is a row.',
  ).toEqual(['Date', 'Paid to', 'MVR', 'USD'])
  expect(
    reading.rows,
    'WHAT: an empty ledger shows rows. WHY: a row the owner never recorded is a lie about their money. HOW: list a row for each stored send and no other.',
  ).toEqual([])
  expect(
    reading.foot?.text,
    `WHAT: the footer of an empty list does not read all three of its lines at zero: 'Sent in MVR ${DOT} No entries MVR0 $0.00', 'Sent in USD ${DOT} No entries $0.00' and 'Total Sent ${DOT} No entries $0.00'. WHY: 'No entries' is how this app words a count of none, and a currency line hidden at zero would read as a currency the owner cannot send in. HOW: draw all three lines whatever the ledger holds, wording each count from the sends stored in that currency.`,
  ).toBe(
    `Sent in MVR ${DOT} No entries MVR0 $0.00` +
      ` Sent in USD ${DOT} No entries $0.00` +
      ` Total Sent ${DOT} No entries $0.00`,
  )
  expect(
    [reading.foot?.count, reading.foot?.cents],
    'WHAT: the empty footer does not carry a count of 0 and a total of 0. WHY: the footer\'s own numbers are what a reader checks the words against. HOW: carry the count and the cents of the rows the footer sums.',
  ).toEqual(['0', '0'])
  expect(
    reading.writingControls,
    'WHAT: the empty statement offers something that records money. WHY: the Statement stays read-only at every ledger length, including none. HOW: draw no balance box, no action and no Send or Receive control on this screen.',
  ).toBe(0)
  await expect(
    statement(page).getByRole('alert'),
    'WHAT: an empty ledger is reported as a failed read. WHY: an empty ledger and a read that failed must never look alike. HOW: speak an alert only when the read itself failed.',
  ).toHaveCount(0)
})

test('a ledger that cannot be read says so on the statement instead of showing zero figures', async ({
  page,
}) => {
  // Given the ledger cannot be reached from the phone
  await page.route(ENTRIES_ENDPOINT, async (route) => {
    if (route.request().method() === 'GET') {
      await route.abort('failed')
      return
    }
    await route.continue()
  })
  await givenTheOwnerIsSignedIn(page, seven)
  await expect(
    entriesPane(page).getByRole('alert'),
    'WHAT: the pane in view does not speak one alert after a failed read. WHY: the owner must be told the ledger could not be read, not shown an empty one. HOW: show one spoken alert and no rows when the read answers retry.',
  ).toHaveText(UNREADABLE)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the statement says the same thing, and shows no figure and no row at all
  await expect(
    statementPane(page).getByRole('alert'),
    'WHAT: the statement does not speak the same alert after a failed read. WHY: a failed read must look the same on both panes, and never like a settled ledger. HOW: word the alert from the port\'s own message on the Statement too.',
  ).toHaveText(UNREADABLE)
  const reading = await readStatement(page)
  expect(
    [reading.totals.length, reading.rows.length, reading.foot],
    'WHAT: a failed read still drew figures, rows or a footer. WHY: $0.00 figures and an empty list would read as a ledger with nothing in it, which is a different and false statement. HOW: draw the alert alone when the read failed.',
  ).toEqual([0, 0, null])
})

test('a long ledger still scrolls only its rows, and its footer still counts every send', async ({
  page,
}) => {
  // Given an owner with five hundred sends recorded
  await givenTheOwnerIsSignedIn(page, long)
  await whenTheOwnerTapsStatement(page)
  const head = statement(page).locator('[data-statement-head="sent"]')
  const foot = statement(page).locator('[data-statement-foot="sent"]')
  const headBefore = await boxOf(head, 'the column header')
  const footBefore = await boxOf(foot, 'the footer')

  // When the rows area is scrolled to its end
  const travelled = await scrollRowsToTheEnd(page)

  // Then the rows really moved, the header and footer did not, and the page did not
  expect(
    travelled,
    'WHAT: the rows area did not scroll at all under five hundred rows. WHY: a list that cannot scroll is not pinned, it is simply short, and this claim would be empty. HOW: let the rows area overflow and scroll inside the panel.',
  ).toBeGreaterThan(0)
  const headAfter = await boxOf(head, 'the column header')
  const footAfter = await boxOf(foot, 'the footer')
  expect(
    Math.abs(headAfter.y - headBefore.y),
    'WHAT: the column header scrolled away with the rows. WHY: the owner reading row four hundred must still see which column is which. HOW: keep the header outside the scrolling area.',
  ).toBeLessThanOrEqual(PIXEL)
  expect(
    Math.abs(footAfter.y - footBefore.y),
    'WHAT: the footer scrolled away with the rows. WHY: the total is what the owner checks the list against, at any length. HOW: keep the footer outside the scrolling area.',
  ).toBeLessThanOrEqual(PIXEL)
  const scroll = await page.evaluate(() => ({
    top: document.documentElement.scrollTop,
    height: document.documentElement.scrollHeight,
    client: document.documentElement.clientHeight,
  }))
  expect(
    [scroll.top, scroll.height <= scroll.client + 1],
    'WHAT: five hundred rows made the page itself scroll. WHY: the page must never scroll, however long the ledger grows. HOW: keep every scrolling area inside a pane of exactly the viewport height.',
  ).toEqual([0, true])

  const reading = await readStatement(page)
  expect(
    [reading.foot?.count, reading.foot?.text.includes(`Total Sent ${DOT} ${LONG_LEDGER_ROWS} entries`)],
    `WHAT: the footer's total line does not count all ${LONG_LEDGER_ROWS} sends. WHY: a count that stops at what is drawn would understate what the owner sent, at any length. HOW: count the stored sends on the total line, not the rows in sight.`,
  ).toEqual([String(LONG_LEDGER_ROWS), true])
})

test('the owner comes back from the statement to the same place in the entries', async ({ page }) => {
  // Given the owner has scrolled a long list of entries on Home
  let entryReads = 0
  await page.route(ENTRIES_ENDPOINT, async (route) => {
    if (route.request().method() === 'GET') entryReads += 1
    await route.continue()
  })
  await givenTheOwnerIsSignedIn(page, long)
  await expect(
    entriesPane(page).locator('[data-entry]'),
    'WHAT: Home did not list the long ledger. WHY: the owner must have something to scroll before they can come back to it. HOW: list the stored entries on Home.',
  ).toHaveCount(LONG_LEDGER_ROWS)
  const scrolledTo = await page.evaluate(() => {
    const pane = document.querySelector('[data-pane="entries"]')
    if (!pane) return -1
    const areas = [pane, ...Array.from(pane.querySelectorAll('*'))].filter(
      (element) => element.scrollHeight > element.clientHeight + 1,
    )
    const area = areas[0]
    if (!area) return -1
    area.scrollTop = 600
    return area.scrollTop
  })
  expect(
    scrolledTo,
    'WHAT: Home has no scrolling area to leave a place in. WHY: Home\'s pane is the only scrolling area of its screen, and the claim is that a tab switch keeps its place. HOW: give Home a pane of its own that scrolls.',
  ).toBeGreaterThan(0)
  const readsBefore = entryReads

  // When the owner looks at the statement and comes back
  await whenTheOwnerTapsStatement(page)
  await whenTheOwnerTapsEntries(page)

  // Then their entries are where they left them, read no second time
  const scrolledBack = await page.evaluate(() => {
    const pane = document.querySelector('[data-pane="entries"]')
    if (!pane) return -1
    const areas = [pane, ...Array.from(pane.querySelectorAll('*'))].filter(
      (element) => element.scrollHeight > element.clientHeight + 1,
    )
    return areas[0]?.scrollTop ?? -1
  })
  expect(
    scrolledBack,
    'WHAT: Home lost the place the owner had scrolled to. WHY: looking at the statement and coming back must not throw away where they were reading. HOW: keep the same Home mounted and switch the shown pane, rather than painting Home again.',
  ).toBe(scrolledTo)
  await expect(
    entriesPane(page).locator('[data-entry]'),
    'WHAT: Home does not list the same entries after the round trip. WHY: a switch there and back changes nothing the owner can see. HOW: leave Home mounted while the other pane shows.',
  ).toHaveCount(LONG_LEDGER_ROWS)
  await expect(
    entriesTab(page),
    'WHAT: the Entries tab does not say it is current again. WHY: exactly one tab is the current one, before and after the round trip. HOW: write both aria-current values on every switch.',
  ).toHaveAttribute('aria-current', 'page')
  expect(
    entryReads - readsBefore,
    'WHAT: the round trip read the ledger again. WHY: a second read can disagree with the first, and would cost the owner a wait for a screen they already have. HOW: switch the shown pane without reading anything.',
  ).toBe(0)
})

test('an open entry sheet covers the bottom bar, so no tab can be tapped underneath it', async ({
  page,
}) => {
  // Given the owner is reading one of their entries
  await givenTheOwnerIsSignedIn(page, seven)
  const card = entriesPane(page).locator('[data-entry]').first()
  await expect(
    card,
    'WHAT: Home lists no entry to open. WHY: the sheet is raised from an entry card. HOW: list the stored entries on Home.',
  ).toBeVisible()

  // When the owner opens its sheet
  await card.click()
  const sheet = page.getByRole('dialog')
  await expect(
    sheet,
    'WHAT: tapping an entry opened no sheet. WHY: the sheet is how the owner reads one entry. HOW: raise the entry sheet over the shell.',
  ).toBeVisible()

  // Then the bar lies under it: the point on the Statement tab belongs to the sheet
  await expect(
    statementTab(page),
    'WHAT: there is no Statement tab to cover. WHY: the bar is what the sheet must lie over. HOW: draw the bottom bar.',
  ).toBeAttached()
  const tabBox = await statementTab(page).boundingBox()
  expect(
    tabBox,
    'WHAT: the Statement tab has no place on the screen. WHY: the claim is about the point the owner would tap. HOW: lay the bar out at the foot of the phone.',
  ).not.toBeNull()
  const covered = await page.evaluate(
    (point) => {
      const hit = document.elementFromPoint(point.x, point.y)
      if (!hit) return 'nothing is there'
      return hit.closest('[data-view="statement"]') === null ? 'covered' : 'the tab itself'
    },
    { x: tabBox!.x + tabBox!.width / 2, y: tabBox!.y + tabBox!.height / 2 },
  )
  expect(
    covered,
    'WHAT: the Statement tab is still the thing under the owner\'s thumb while a sheet is open. WHY: a tab tapped under an open sheet would switch the view behind it. HOW: append the sheet and its scrim to the shell root, over the bar.',
  ).toBe('covered')
})

test('every generated ledger numbers its sends oldest first, adds them up and still does not scroll the page', async ({
  page,
}) => {
  // Arrange a spread of ledgers from a fixed seed, including the cases that must be there
  const ledgers = generatedLedgers()
  await givenTheOwnerIsSignedIn(page, generated)

  // Act: read each ledger through its own page load, keeping the first that disagrees
  let failing: { label: string; entries: readonly EntrySeed[]; reasons: readonly string[] } | null = null
  for (const ledger of ledgers) {
    const reasons = await readLedgerAndJudge(page, ledger.entries)
    if (reasons.length > 0) {
      failing = { label: ledger.label, entries: ledger.entries, reasons }
      break
    }
  }

  // Assert: nothing disagreed; a failing ledger is reported at its smallest
  let report = ''
  if (failing !== null) {
    const smallest = await smallestStillFailing(page, failing.entries)
    report =
      `seed ${GENERATOR_SEED}, ledger '${failing.label}' of ${failing.entries.length} entries, ` +
      `smallest still failing: ${smallest.entries.length} entries ` +
      `${JSON.stringify(smallest.entries.map((entry) => [entry.kind, entry.currency, entry.entryDate, entry.amountMinor, entry.rate, entry.method ?? null]))}; ` +
      `${smallest.reasons.length > 0 ? smallest.reasons.join(' | ') : `no disagreement on the re-read, so the first reading was not repeatable; it read: ${failing.reasons.join(' | ')}`}`
  }
  expect(
    report,
    'WHAT: a generated ledger was not reported as the stored rows mean it. WHY: these laws are what make the statement true of every ledger and not only of the seeded one: the sends are numbered 1 upward oldest first, each row reads its own stored date, party, sub-line and dollars, the card and the footer add up the stored dollars, nothing stands above the card, and the page never scrolls. HOW: read the failing ledger printed above, which is the smallest one that still disagrees.',
  ).toBe('')
})

test('a stored MVR row and a row with no method read as recorded', async ({ page }) => {
  // Arrange: the stored rows the brief fixes, read back outside the browser
  const stored = await readStoredLedger(stack, seven)
  const mvr = stored.find((row) => row.currency === 'MVR' && row.method === 'transfer')
  const noMethod = stored.find((row) => row.kind === 'send' && row.currency === 'USD' && row.method === null)
  expect(
    [mvr?.amount_minor, mvr?.rate, mvr?.usd_cents],
    'WHAT: the rufiyaa row is not stored as the brief fixes it. WHY: the contract under test is what the stored columns mean to the screen. HOW: seed amount_minor 1700000, rate 20.0000 and usd_cents 85000.',
  ).toEqual([1700000, '20.0000', 85000])
  expect(
    noMethod?.method,
    'WHAT: no stored send carries a null method. WHY: a row stored before a method was ever asked for is exactly the case this contract covers. HOW: seed one send with no method.',
  ).toBeNull()

  // Act: offer the ledger a method it does not know, and a rufiyaa row with no rate
  const unknownMethod = await offerStoredRow(stack, offered, {
    kind: 'send',
    currency: 'USD',
    amount_minor: 1000,
    rate: null,
    usd_cents: 1000,
    entry_date: '2026-10-01',
    person_name: MARIYAM,
    method: 'venmo',
  })
  const rufiyaaWithoutARate = await offerStoredRow(stack, offered, {
    kind: 'send',
    currency: 'MVR',
    amount_minor: 1000,
    rate: null,
    usd_cents: 1000,
    entry_date: '2026-10-01',
    person_name: MARIYAM,
  })
  const keptOne = await offerStoredRow(stack, offered, {
    kind: 'send',
    currency: 'MVR',
    amount_minor: 1700000,
    rate: '20.0000',
    usd_cents: 85000,
    entry_date: '2026-10-01',
    person_name: MARIYAM,
    method: 'transfer',
  })

  // Assert: what the ledger keeps, what it refuses, and what the two mean on the screen
  expect(
    unknownMethod,
    'WHAT: the ledger kept a method outside cash, cheque and transfer. WHY: a word the app can never read would be drawn as nothing or invented, and the three words are the whole of it. HOW: hold the three known words, and null, in the stored row itself.',
  ).not.toBeNull()
  expect(
    rufiyaaWithoutARate,
    'WHAT: the ledger kept a rufiyaa row with no rate. WHY: a rufiyaa figure with no rate has no dollars behind it, so a sub-line built from it would state a rate the owner never gave. HOW: keep a rate on every rufiyaa row, and on no other.',
  ).not.toBeNull()
  expect(
    keptOne,
    'WHAT: the ledger refused a rufiyaa send with its rate and its method. WHY: that is the very row the Statement must read back. HOW: keep the three known method words and a rate on a rufiyaa row.',
  ).toBeNull()

  // And the real screen, reading through the real adapter, reads those two rows as stored
  await givenTheOwnerIsSignedIn(page, seven)
  await whenTheOwnerTapsStatement(page)
  const mvrRow = statement(page).locator(`[data-statement-list="sent"] [data-statement-row="${mvr!.id}"]`)
  await expect(
    mvrRow,
    'WHAT: the stored rufiyaa send has no row of its own on the statement. WHY: every stored send is one numbered row, named by the entry it came from. HOW: carry the entry\'s own id on its row.',
  ).toHaveCount(1)
  await expect(
    mvrRow.locator('[data-statement-sub]'),
    "WHAT: the rufiyaa row's sub-line does not read 'Transfer' alone. WHY: it is the stored method and nothing else now: the rufiyaa figure and the rate are read in the MVR column, so repeating them here would state the same money twice. HOW: word the stored method alone under the person.",
  ).toHaveText(sublineOf(mvr!) ?? '')
  await expect(
    mvrRow,
    `WHAT: the rufiyaa row does not read '${mvrFigure(1700000)}${inlineRate('20.0000')}' in its MVR column. WHY: it is read from the stored laari and the stored rate: a padded rate would read '@20.00' and a rounded figure would state an amount the ledger does not hold. HOW: write the stored rufiyaa figure behind the prefix 'MVR' and append the stored rate behind '@', with no trailing zeros.`,
  ).toContainText(`${mvrFigure(mvr!.amount_minor)}${inlineRate(mvr!.rate ?? '')}`)
  await expect(
    mvrRow,
    'WHAT: the rufiyaa row\'s dollars are not the marked reading of the dollars it stores. WHY: converting the rufiyaa figure a second time moves the owner\'s money by the rounding, and brackets round that figure read as money the owner is not sure of. HOW: draw the stored dollars, marked and with no brackets.',
  ).toContainText(convertedFigure(mvr!.usd_cents))

  const noMethodRow = statement(page).locator(`[data-statement-list="sent"] [data-statement-row="${noMethod!.id}"]`)
  await expect(
    noMethodRow,
    'WHAT: the send stored with no method has no row of its own. WHY: a row stored before a method was asked for is still a send the owner made. HOW: list it like any other send.',
  ).toHaveCount(1)
  await expect(
    noMethodRow.locator('[data-statement-sub]'),
    'WHAT: a send stored with no method still has a sub-line. WHY: a null method is nothing said, never a default: a sub-line there could only invent how the money changed hands. HOW: draw no sub-line at all for a dollar send with no stored method.',
  ).toHaveCount(0)
  expect(
    (await noMethodRow.innerText()).match(/Cash|Cheque|Transfer/g),
    'WHAT: the row stored with no method utters one of the three method words. WHY: the owner would read a way the money changed hands that they never recorded. HOW: say nothing in its place.',
  ).toBeNull()
})

test('the statement modules depend inward only', async () => {
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
  const statementDomain = read('src/domain/statement.ts')
  const statementUi = read('src/ui/statement.ts')

  // Act: look at what every module names
  const importsOf = (source: string): readonly string[] =>
    Array.from(source.matchAll(/from\s+'([^']+)'/g)).map((match) => match[1] ?? '')
  const namesTheDocument = (source: string): boolean =>
    /\b(document|window|HTMLElement|HTMLDivElement|Element)\b/.test(source)

  const domainOffenders = filesIn('src/domain')
    .map((file) => ({ file, source: read(file) ?? '' }))
    .filter(
      (module) =>
        namesTheDocument(module.source) ||
        importsOf(module.source).some((name) => name.includes('adapters') || name.includes('supabase')),
    )
    .map((module) => module.file)
  const uiOffenders = filesIn('src/ui')
    .map((file) => ({ file, source: read(file) ?? '' }))
    .filter((module) =>
      importsOf(module.source).some(
        (name) =>
          name.includes('adapters') ||
          name.includes('supabase') ||
          (name.startsWith('./') && !name.startsWith('./motion')),
      ),
    )
    .map((module) => module.file)
  const composers = [...filesIn('src/domain'), ...filesIn('src/ui'), 'src/main.ts']
    .filter((file) => importsOf(read(file) ?? '').some((name) => name.includes('adapters/supabase')))
    .filter((file) => file !== 'src/main.ts')

  // Assert: the two new modules exist and the law holds over every module it governs
  expect(
    statementDomain === null ? 'missing' : 'present',
    'WHAT: there is no module owning the statement\'s meaning. WHY: the order, the figures and the sub-lines are decided once, away from the DOM, so a screen cannot quietly decide money. HOW: own that projection in the statement\'s domain module.',
  ).toBe('present')
  expect(
    statementUi === null ? 'missing' : 'present',
    'WHAT: there is no module owning the statement\'s screen. WHY: the screen is a function from the read ledger to DOM and decides nothing about money itself. HOW: own the screen in the statement\'s UI module.',
  ).toBe('present')
  expect(
    domainOffenders,
    'WHAT: a module that decides meaning names the document or an adapter. WHY: meaning that can touch the DOM or the database cannot be read, reused or trusted on its own. HOW: keep the domain to values in and values out.',
  ).toEqual([])
  expect(
    uiOffenders,
    'WHAT: a screen module imports something other than the ports, the meaning modules and the motion. WHY: a screen that reaches an adapter decides where its data comes from, which is the composition root\'s job alone. HOW: pass the read outcome in.',
  ).toEqual([])
  expect(
    composers,
    'WHAT: a module other than the composition root names an adapter. WHY: one place composing the adapters is what keeps every other module testable and replaceable. HOW: compose the adapters in the composition root alone.',
  ).toEqual([])
  const writing = ['addEntry', 'removeEntry', 'addPerson'].filter((operation) =>
    (statementUi ?? '').includes(operation),
  )
  expect(
    writing,
    'WHAT: the statement screen names an operation that writes to the ledger. WHY: the Statement only reports: a writing operation within its reach could change the money it is reporting. HOW: give the screen the read outcome and nothing that writes.',
  ).toEqual([])
})

// ===== The generated ledgers =====

/** The seed is a constant of this spec, printed with any failing ledger. */
const GENERATOR_SEED = 20261019

/** A small deterministic source of numbers, so the ledgers below never drift. */
const numbersFrom = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const DATE_POOL_ONE_YEAR = ['2026-01-05', '2026-03-17', '2026-07-01', '2026-09-14', '2026-12-28'] as const

/**
 * One generated entry. The dollars it stores are deliberately unrelated to a rufiyaa
 * amount and its rate, so a screen that converts a second time instead of reading the
 * stored dollars is caught.
 */
const generatedEntry = (
  next: () => number,
  index: number,
  options: { readonly sendsOnly: boolean; readonly oneDay: boolean },
): EntrySeed => {
  const kind = options.sendsOnly || next() < 0.6 ? 'send' : 'receive'
  const currency = next() < 0.5 ? 'MVR' : 'USD'
  const dates = options.oneDay ? (['2026-04-04'] as const) : DATE_POOL_ONE_YEAR
  const entryDate = dates[Math.floor(next() * dates.length)] ?? '2026-04-04'
  const amountMinor = 1 + Math.floor(next() * 5_000_000)
  const rateScaled = 1 + Math.floor(next() * 99_999_999)
  const methods = ['cash', 'cheque', 'transfer', null] as const
  const method = methods[Math.floor(next() * methods.length)] ?? null
  return {
    kind,
    currency,
    amountMinor,
    rate: currency === 'MVR' ? (rateScaled / 10_000).toFixed(4) : null,
    usdCents: 1 + Math.floor(next() * 900_000),
    entryDate,
    savedAt: `${entryDate}T0${index % 10}:${String(index % 60).padStart(2, '0')}:00Z`,
    personName: kind === 'send' ? (next() < 0.5 ? AHMED : MARIYAM) : undefined,
    method: options.sendsOnly && index === 0 ? null : method,
  }
}

/** The eight ledgers this value is judged over, including the four that must be there. */
const generatedLedgers = (): ReadonlyArray<{ label: string; entries: readonly EntrySeed[] }> => {
  const next = numbersFrom(GENERATOR_SEED)
  const build = (
    size: number,
    options: { sendsOnly?: boolean; oneDay?: boolean } = {},
  ): readonly EntrySeed[] =>
    Array.from({ length: size }, (_unused, index) =>
      generatedEntry(next, index, {
        sendsOnly: options.sendsOnly ?? false,
        oneDay: options.oneDay ?? false,
      }),
    )

  const fourDecimalRate = build(4).map((entry, index) =>
    index === 0
      ? { ...entry, kind: 'send' as const, currency: 'MVR' as const, rate: '15.4257', personName: AHMED }
      : entry,
  )

  return [
    { label: 'nothing recorded at all', entries: [] },
    { label: 'one send', entries: build(1, { sendsOnly: true }) },
    { label: 'sends only, one of them with no method', entries: build(5, { sendsOnly: true }) },
    { label: 'a rufiyaa send whose rate has four decimals', entries: fourDecimalRate },
    { label: 'everything on one day', entries: build(6, { oneDay: true }) },
    { label: 'both kinds across a year', entries: build(9) },
    { label: 'the longest this generator draws', entries: build(12) },
  ]
}

/** Stores one ledger, reads it through a page load, and answers with every disagreement. */
const readLedgerAndJudge = async (
  page: Page,
  entries: readonly EntrySeed[],
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

  const stored = await readStoredLedger(stack, generated)
  const reading = await readStatement(page)
  const reasons: string[] = []
  if (!reading.present) return ['there is no statement screen to read']

  const expectedRows = expectedSentRows(stored)
  const expectedTexts = expectedRows.map(asRowText)
  if (reading.rows.map((row) => row.no).join(',') !== expectedRows.map((row) => row.no).join(',')) {
    reasons.push(`numbers read ${reading.rows.map((row) => row.no).join(',')} not ${expectedRows.map((row) => row.no).join(',')}`)
  }
  if (reading.rowTexts.join(' / ') !== expectedTexts.join(' / ')) {
    reasons.push(`rows read '${reading.rowTexts.join(' / ')}' not '${expectedTexts.join(' / ')}'`)
  }
  const figures = expectedFigures(stored)
  const expectedTotals = [
    ['sent', String(figures.sent), usdWithSign(figures.sent)],
    ['paid', String(figures.paid), usdWithSign(figures.paid)],
    ['balance', String(figures.balance), usdWithSign(figures.balance)],
  ]
  const readTotals = reading.totals.map((total) => [total.which, total.cents, total.text])
  if (JSON.stringify(readTotals) !== JSON.stringify(expectedTotals)) {
    reasons.push(`figures read ${JSON.stringify(readTotals)} not ${JSON.stringify(expectedTotals)}`)
  }
  const foot = expectedFoot(stored)
  if (JSON.stringify(reading.foot) !== JSON.stringify(foot)) {
    reasons.push(`footer read ${JSON.stringify(reading.foot)} not ${JSON.stringify(foot)}`)
  }
  if (reading.above.length > 0 || reading.headings > 0) {
    reasons.push(`${JSON.stringify(reading.above)} stands above the card and ${reading.headings} headings are inside the pane`)
  }
  if (reading.writingControls !== 0) {
    reasons.push(`${reading.writingControls} controls that record money are on the screen`)
  }
  if (reading.pageScrolls) {
    reasons.push('the page itself scrolls at this length')
  }
  return reasons
}

/** Takes one entry away at a time while the ledger still disagrees, and reports it. */
const smallestStillFailing = async (
  page: Page,
  entries: readonly EntrySeed[],
): Promise<{ entries: readonly EntrySeed[]; reasons: readonly string[] }> => {
  let smallest = entries
  let reasons = await readLedgerAndJudge(page, smallest)
  let attempts = 0
  const BUDGET = 12
  for (let shrinking = true; shrinking && attempts < BUDGET; ) {
    shrinking = false
    for (let index = 0; index < smallest.length && attempts < BUDGET; index += 1) {
      const candidate = smallest.filter((_unused, at) => at !== index)
      attempts += 1
      const candidateReasons = await readLedgerAndJudge(page, candidate)
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
