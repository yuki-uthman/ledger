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

// What the owner reads here: under the sending list, one block of three lines -- what went
// out in rufiyaa with its dollar value beside it and no brackets round it, what went out in
// dollars, and, under a thin divider, the total of both -- each line with its label at the left, its figures at
// the right and its count worded the way this app words a count. The lines are all there at
// every ledger, the one with nothing in it included.
//
// Judged only through the declared public port: the BUILT bundle as Chrome loads it over the
// served loopback origin, at 360 by 780, with the local stack behind it. Nothing here imports
// a module of src/: the stimulus is stored rows, the reading is the document, and every
// expected figure is derived in this file from what the ledger stores, so the oracle cannot
// echo back whatever the screen happens to draw.
//
// Every figure, rate, date and name below is invented. This repository is public, and no
// figure of the owner's own ledger is written anywhere in it.
//
// Three notes on the readings.
//   - A line's label and its figures are read as separate readings, never as one joined
//     string: they carry different colours and stand at opposite edges of the line.
//   - A line's own count and cents are read as well as its words, because the two cannot
//     tell on each other: a line could word a count its own attribute does not hold.
//   - Cents are dollar cents on every line, the rufiyaa line included, where they are the
//     dollars those rufiyaa sends store. The rufiyaa amount itself is read as its figure.

const PASSWORD_FIELD = 'input[type="password"]'
const VIEWPORT = { width: 360, height: 780 } as const

/** The separator the board draws between a label and its count. */
const DOT = '·'
/** The endpoint the bundle reads the ledger from, as the browser sees it. */
const ENTRIES_ENDPOINT = '**/rest/v1/entries**'
/** What a failed read says, as the port words it. */
const UNREADABLE = 'Could not load the ledger. Try again.'

// ===== The colours, the ground and the divider the board fixes, as the browser reports them

const USD_INK = 'rgb(36, 80, 138)'
const MVR_INK = 'rgb(156, 79, 16)'
const CONVERTED_INK = 'rgb(79, 111, 156)'
const FOOT_INK = 'rgb(27, 63, 110)'
const FOOT_GROUND = 'rgb(231, 238, 247)'
const DIVIDER_INK = 'rgb(207, 219, 234)'
const DIVIDER_WIDTH = '1px'
const PAID_BACK_GROUND = 'rgb(224, 240, 237)'
const PAID_BACK_FOOT_INK = 'rgb(11, 87, 80)'
const PAID_BACK_INK = 'rgb(15, 111, 104)'
const BALANCE_INK = 'rgb(11, 87, 80)'
const FOOT_SIZE = 13
const FOOT_WEIGHT = '700'
const FOOT_GAP = '6px'
const FOOT_PADDING = '10px 14px 12px'
/** The mark that stands where a rufiyaa figure is absent in a row: an em dash, not a hyphen. */
const EM_DASH = '—'

// ===== The domain vocabulary this oracle speaks =====

/** Which of the three lines a reading belongs to, as the owner reads them down the block. */
const LINES = ['mvr', 'usd', 'total'] as const
type WhichLine = (typeof LINES)[number]

/** The label each line reads, with the capital the last line keeps. */
const LINE_LABELS: Record<WhichLine, string> = {
  mvr: 'Sent in MVR',
  usd: 'Sent in USD',
  total: 'Total Sent',
}

/** One reading of the screen: its text, how it is inked and set, and where it stands. */
type Drawn = {
  readonly text: string
  readonly ink: string
  readonly weight: string
  readonly size: number
  readonly left: number
  readonly right: number
  readonly bottom: number
  readonly atTheLeftEdge: boolean
  readonly atTheRightEdge: boolean
}

/** One line of the sent footer, as the owner reads it across the line. */
type FootLineReading = {
  /** Which line this is, as the line itself says. */
  readonly which: string | null
  /** What the line says about how many sends it holds, and about their dollars. */
  readonly count: string | null
  readonly cents: string | null
  readonly text: string
  /** The label and the figures of this line, in the order they are drawn. */
  readonly leaves: readonly Drawn[]
  readonly height: number
  /** The line above this one, when a line is drawn there. */
  readonly dividerWidth: string
  readonly dividerInk: string
  /** Whether every reading of this line sits on one baseline. */
  readonly sharedBaseline: boolean
}

/** The sent footer block, the list above it and the rest of the screen, in one reading. */
type SentFootReading = {
  readonly present: boolean
  readonly found: boolean
  readonly ground: string
  readonly ink: string
  readonly size: number
  readonly weight: string
  readonly gap: string
  readonly padding: string
  /** What the block itself says, which a reader of the old hooks still reads. */
  readonly blockCount: string | null
  readonly blockCents: string | null
  readonly lines: readonly FootLineReading[]
  /** Whether the block stands inside the scrolling rows instead of under them. */
  readonly insideTheScrollingRows: boolean
  readonly top: number
  readonly bottom: number
  /** Whether all three lines hang in the one block, so they arrive together. */
  readonly linesInOneBlock: boolean
  readonly rows: readonly (readonly string[])[]
  readonly card: ReadonlyArray<{
    readonly which: string
    readonly cents: string | null
    readonly text: string
    readonly ink: string
  }>
  readonly alerts: number
  readonly writingControls: number
}

/** The paid-back footer, which this value leaves exactly as it reads today. */
type BackFootReading = {
  readonly found: boolean
  readonly text: string
  readonly count: string | null
  readonly cents: string | null
  readonly ground: string
  readonly ink: string
  readonly lines: number
  readonly figureInks: readonly string[]
}

// ===== The independent oracle: what the stored sends mean, worded here =====

const grouped = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const groupedWithMinor = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Whole minor units as a row reads them: grouped, with two decimals only when real. */
const minorFigure = (minor: number): string =>
  minor % 100 === 0 ? grouped.format(minor / 100) : groupedWithMinor.format(minor / 100)

/** The marked reading of stored laari: 'MVR60,000', 'MVR60,000.50', 'MVR0'. */
const mvrFigure = (laari: number): string => `MVR${minorFigure(laari)}`
/** A figure as every total and subtotal in dollars reads it: always two decimals. */
const twoDecimalFigure = (cents: number): string => `$${groupedWithMinor.format(cents / 100)}`
/** The marked whole reading a row uses: '$1,500', '$1,500.50'. */
const usdRowFigure = (cents: number): string => `$${minorFigure(cents)}`
/** A stored rate as a row reads it beside its figure, behind its mark. */
const inlineRate = (stored: string): string =>
  `@${stored.includes('.') ? stored.replace(/0+$/, '').replace(/\.$/, '') : stored}`

/** What this app calls a number of entries. */
const countLabel = (count: number): string => {
  if (count <= 0) return 'No entries'
  if (count === 1) return '1 entry'
  return `${count} entries`
}

/** Oldest first: by entry date, then by the instant it was saved, then by its id. */
const oldestFirst = (rows: readonly StoredLedgerRow[]): readonly StoredLedgerRow[] =>
  [...rows].sort(
    (left, right) =>
      left.entry_date.localeCompare(right.entry_date) ||
      left.saved_at.localeCompare(right.saved_at) ||
      left.id.localeCompare(right.id),
  )

const sendsOf = (stored: readonly StoredLedgerRow[]): readonly StoredLedgerRow[] =>
  oldestFirst(stored.filter((row) => row.kind === 'send'))
const repaymentsOf = (stored: readonly StoredLedgerRow[]): readonly StoredLedgerRow[] =>
  oldestFirst(stored.filter((row) => row.kind === 'receive'))
const centsOf = (rows: readonly StoredLedgerRow[]): number =>
  rows.reduce((sum, row) => sum + row.usd_cents, 0)
const laariOf = (rows: readonly StoredLedgerRow[]): number =>
  rows.reduce((sum, row) => sum + row.amount_minor, 0)

/** What one footer line means: its label with its count worded, its figures and its pair. */
type ExpectedLine = {
  readonly which: WhichLine
  readonly label: string
  readonly count: number
  readonly cents: number
  readonly figures: readonly string[]
}

/**
 * The three lines the stored sends mean, derived from the stored currency and the stored
 * minor units alone: the rufiyaa line from the sends stored in MVR with their laari summed
 * and their stored dollars beside them with no brackets, the dollar line from the sends stored in USD, and
 * the total line from every send, whatever currency it is stored in.
 */
const expectedFootLines = (stored: readonly StoredLedgerRow[]): readonly ExpectedLine[] => {
  const sends = sendsOf(stored)
  const inRufiyaa = sends.filter((row) => row.currency === 'MVR')
  const inDollars = sends.filter((row) => row.currency === 'USD')
  return [
    {
      which: 'mvr',
      label: `${LINE_LABELS.mvr} ${DOT} ${countLabel(inRufiyaa.length)}`,
      count: inRufiyaa.length,
      cents: centsOf(inRufiyaa),
      figures: [mvrFigure(laariOf(inRufiyaa)), twoDecimalFigure(centsOf(inRufiyaa))],
    },
    {
      which: 'usd',
      label: `${LINE_LABELS.usd} ${DOT} ${countLabel(inDollars.length)}`,
      count: inDollars.length,
      cents: centsOf(inDollars),
      figures: [twoDecimalFigure(centsOf(inDollars))],
    },
    {
      which: 'total',
      label: `${LINE_LABELS.total} ${DOT} ${countLabel(sends.length)}`,
      count: sends.length,
      cents: centsOf(sends),
      figures: [twoDecimalFigure(centsOf(sends))],
    },
  ]
}

/** One drawn line, read down to the fields the three lines are judged on. */
const linesRead = (reading: SentFootReading): ReadonlyArray<Record<string, unknown>> =>
  reading.lines.map((line) => ({
    which: line.which,
    label: line.leaves[0]?.text ?? null,
    count: line.count === null ? null : Number(line.count),
    cents: line.cents === null ? null : Number(line.cents),
    figures: line.leaves.slice(1).map((figure) => figure.text),
  }))

/** The same shape, meant by the stored sends. */
const linesMeant = (stored: readonly StoredLedgerRow[]): ReadonlyArray<Record<string, unknown>> =>
  expectedFootLines(stored).map((line) => ({
    which: line.which,
    label: line.label,
    count: line.count,
    cents: line.cents,
    figures: line.figures,
  }))

/** What each card figure means, which this value leaves exactly as it is. */
const expectedCard = (
  stored: readonly StoredLedgerRow[],
): ReadonlyArray<{ which: string; cents: string; text: string }> => {
  const sent = centsOf(sendsOf(stored))
  const paid = centsOf(repaymentsOf(stored))
  return [
    { which: 'sent', cents: String(sent), text: twoDecimalFigure(sent) },
    { which: 'paid', cents: String(paid), text: twoDecimalFigure(paid) },
    { which: 'balance', cents: String(Math.abs(sent - paid)), text: twoDecimalFigure(Math.abs(sent - paid)) },
  ]
}

/** What the two currency cells of each sent row read, which this value does not touch. */
const expectedRowCells = (stored: readonly StoredLedgerRow[]): ReadonlyArray<readonly string[]> =>
  sendsOf(stored).map((row) =>
    row.currency === 'MVR'
      ? [
          `${mvrFigure(row.amount_minor)}${row.rate === null ? '' : inlineRate(row.rate)}`,
          usdRowFigure(row.usd_cents),
        ]
      : [EM_DASH, usdRowFigure(row.usd_cents)],
  )

/**
 * The currency marks a module writes itself, read out of its own string literals: a dollar
 * mark anywhere in a literal, or the rufiyaa prefix joined to another reading. The bare
 * word 'MVR' is the column word this screen draws and the currency it compares a stored
 * row against, so it counts as a written mark only where it is joined to something else --
 * a template with a value put into it, or a literal concatenated onto a figure.
 */
const currencyMarksWritten = (plain: string): readonly string[] => {
  const ANY_LITERAL = /`(?:[^`\\]|\\.)*`|'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g
  // The opening of an interpolation is masked first, so a value put into a sentence is
  // never mistaken for a written dollar mark.
  const masked = plain.replace(/\$\{/g, '@{')
  const written: string[] = []
  for (const match of masked.matchAll(ANY_LITERAL)) {
    const literal = match[0]
    if (!/\$|MVR/.test(literal)) continue
    const joinedOn = masked
      .slice((match.index ?? 0) + literal.length)
      .trimStart()
      .startsWith('+')
    if (literal.slice(1, -1) === 'MVR' && !joinedOn) continue
    written.push(literal)
  }
  return written
}

// ===== The stimulus: the stored ledgers the owner signs in to =====

const ACCOUNT_BOTH = { email: 'owner-foot-a@abbaas.test', password: 'foot-password-a1' } as const
const ACCOUNT_DOLLARS_ONLY = { email: 'owner-foot-b@abbaas.test', password: 'foot-password-b2' } as const
const ACCOUNT_FIRST_RUFIYAA = { email: 'owner-foot-c@abbaas.test', password: 'foot-password-c3' } as const
const ACCOUNT_EMPTY = { email: 'owner-foot-d@abbaas.test', password: 'foot-password-d4' } as const
const ACCOUNT_LAARI = { email: 'owner-foot-e@abbaas.test', password: 'foot-password-e5' } as const
const ACCOUNT_LONG = { email: 'owner-foot-f@abbaas.test', password: 'foot-password-f6' } as const
const ACCOUNT_GENERATED = { email: 'owner-foot-g@abbaas.test', password: 'foot-password-g7' } as const
const ACCOUNT_OFFERED = { email: 'owner-foot-h@abbaas.test', password: 'foot-password-h8' } as const

const AHMED = 'Ahmed Shifaz'
const MARIYAM = 'Mariyam Nisha'

/** One stored send of this app, written in the fields the footer is derived from. */
const send = (
  currency: 'USD' | 'MVR',
  amountMinor: number,
  usdCents: number,
  entryDate: string,
  rate: string | null = null,
  personName: string = AHMED,
): EntrySeed => ({
  kind: 'send',
  currency,
  amountMinor,
  rate,
  usdCents,
  entryDate,
  savedAt: `${entryDate}T09:00:00Z`,
  personName,
  method: 'transfer',
})

/**
 * The month the brief words this footer by: four rufiyaa sends of 15,000 rufiyaa each,
 * worth 3,000 dollars together, and five dollar sends worth 9,500 dollars together, so the
 * three lines read 60,000 rufiyaa, 9,500 dollars and 12,500 dollars over nine sends. One
 * repayment stands beside them so the card and the paid-back list are not empty.
 */
const BOTH_CURRENCIES_LEDGER: readonly EntrySeed[] = [
  send('MVR', 1_500_000, 75_000, '2026-09-02', '20.0000', MARIYAM),
  send('MVR', 1_500_000, 75_000, '2026-09-06', '20.0000'),
  send('MVR', 1_500_000, 75_000, '2026-09-10', '20.0000'),
  send('MVR', 1_500_000, 75_000, '2026-09-14', '20.0000', MARIYAM),
  send('USD', 150_000, 150_000, '2026-09-18'),
  send('USD', 200_000, 200_000, '2026-09-22', null, MARIYAM),
  send('USD', 250_000, 250_000, '2026-09-26'),
  send('USD', 100_000, 100_000, '2026-09-30', null, MARIYAM),
  send('USD', 250_000, 250_000, '2026-10-04'),
  {
    kind: 'receive',
    currency: 'USD',
    amountMinor: 300_000,
    rate: null,
    usdCents: 300_000,
    entryDate: '2026-10-08',
    savedAt: '2026-10-08T09:00:00Z',
    method: 'cash',
  },
]

/**
 * What those nine sends read, stated as constants so a wrong derivation in this oracle
 * cannot pass unnoticed.
 */
const BOTH_CURRENCIES_READS: readonly ExpectedLine[] = [
  {
    which: 'mvr',
    label: 'Sent in MVR · 4 entries',
    count: 4,
    cents: 300_000,
    figures: ['MVR60,000', '$3,000.00'],
  },
  { which: 'usd', label: 'Sent in USD · 5 entries', count: 5, cents: 950_000, figures: ['$9,500.00'] },
  { which: 'total', label: 'Total Sent · 9 entries', count: 9, cents: 1_250_000, figures: ['$12,500.00'] },
]

/** A month in which nothing went out in rufiyaa at all. */
const DOLLARS_ONLY_LEDGER: readonly EntrySeed[] = [
  send('USD', 120_000, 120_000, '2026-08-05'),
  send('USD', 80_000, 80_000, '2026-08-09', null, MARIYAM),
]

/** The same month with one rufiyaa send added to it. */
const FIRST_RUFIYAA_LEDGER: readonly EntrySeed[] = [
  ...DOLLARS_ONLY_LEDGER,
  send('MVR', 250_000, 12_500, '2026-08-13', '20.0000'),
]

/** Two rufiyaa sends whose laari do not add up to whole rufiyaa, and one dollar send. */
const LAARI_LEDGER: readonly EntrySeed[] = [
  send('MVR', 3_000_025, 150_000, '2026-07-04', '20.0000'),
  send('MVR', 3_000_025, 150_000, '2026-07-08', '20.0000', MARIYAM),
  send('USD', 150_000, 150_000, '2026-07-12'),
]

/** Five hundred dollar sends and no rufiyaa send at all: a long month missing a currency. */
const LONG_LEDGER: readonly EntrySeed[] = Array.from({ length: 500 }, (_unused, index) => ({
  ...send('USD', 1_000, 1_000, '2026-06-01'),
  savedAt: `2026-06-01T${String(Math.floor(index / 60)).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}:00Z`,
}))

let stack: Stack
let served: ServedOrigin
let both: Account
let dollarsOnly: Account
let firstRufiyaa: Account
let emptyLedger: Account
let laari: Account
let long: Account
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

  both = await createAccount(stack, ACCOUNT_BOTH)
  await replaceEntries(stack, both, BOTH_CURRENCIES_LEDGER, await seedPeopleByName(stack, both, [AHMED, MARIYAM]))

  dollarsOnly = await createAccount(stack, ACCOUNT_DOLLARS_ONLY)
  await replaceEntries(
    stack,
    dollarsOnly,
    DOLLARS_ONLY_LEDGER,
    await seedPeopleByName(stack, dollarsOnly, [AHMED, MARIYAM]),
  )

  firstRufiyaa = await createAccount(stack, ACCOUNT_FIRST_RUFIYAA)
  await replaceEntries(
    stack,
    firstRufiyaa,
    FIRST_RUFIYAA_LEDGER,
    await seedPeopleByName(stack, firstRufiyaa, [AHMED, MARIYAM]),
  )

  emptyLedger = await createAccount(stack, ACCOUNT_EMPTY)

  laari = await createAccount(stack, ACCOUNT_LAARI)
  await replaceEntries(stack, laari, LAARI_LEDGER, await seedPeopleByName(stack, laari, [AHMED, MARIYAM]))

  long = await createAccount(stack, ACCOUNT_LONG)
  await replaceEntries(stack, long, LONG_LEDGER, await seedPeopleByName(stack, long, [AHMED]))

  generated = await createAccount(stack, ACCOUNT_GENERATED)
  generatedPeople = await seedPeopleByName(stack, generated, [AHMED, MARIYAM])

  offered = await createAccount(stack, ACCOUNT_OFFERED)
  await seedPeopleByName(stack, offered, [AHMED])
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
    'WHAT: the sign-in screen never appeared. WHY: every reading of the footer starts from a signed-in owner. HOW: serve the built bundle and let it mount its sign-in screen.',
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
        'WHAT: the screen was still moving two seconds after the tap. WHY: every box, edge and reading this oracle takes is taken from where the screen came to rest, so a reading taken mid-slide would judge a place the owner never sees. HOW: finish the slide and the arriving footer\'s rise, and drop each part\'s mark as it stops.',
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
    'WHAT: there is no Statement tab to tap on the bottom bar. WHY: a tap on that tab is the only way into the Statement, so without it the footer is unreachable. HOW: draw the bottom bar with its Entries and Statement tabs.',
  ).toBeVisible()
  await statementTab(page).click()
  await expect(
    statement(page),
    'WHAT: tapping Statement showed no statement screen. WHY: the tap is what brings the footer into the viewport. HOW: show the pane whose screen carries data-screen=statement.',
  ).toBeVisible()
  await thenEveryPartHasComeToRest(page)
}

const whenTheOwnerTapsThePaidBackList = async (page: Page): Promise<void> => {
  const tab = page.getByRole('tab', { name: 'Paid back by Abbaas' })
  await expect(
    tab,
    'WHAT: there is no tab named Paid back by Abbaas to tap. WHY: the pill is how the owner reaches the other footer, which this value leaves as it is. HOW: keep both tabs of the pill.',
  ).toBeVisible()
  await tab.click()
  await expect(
    statement(page),
    'WHAT: the screen does not say it is showing the paid-back list after the tap. WHY: which list is shown is one attribute, which this value does not touch. HOW: write data-statement-shown=back on the tap.',
  ).toHaveAttribute('data-statement-shown', 'back')
  await thenEveryPartHasComeToRest(page)
}

/** Scrolls the sending list's rows to their end, leaving the footer where it stands. */
const whenTheOwnerScrollsTheRowsToTheEnd = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    const rows = document.querySelector('[data-statement-rows="sent"]')
    if (rows !== null) rows.scrollTop = rows.scrollHeight
  })
  await expect(
    statement(page),
    'WHAT: the statement screen went away while the rows were scrolled. WHY: scrolling the rows is a reading, not a journey. HOW: keep the screen mounted while its rows scroll.',
  ).toBeVisible()
}

/**
 * Reads the sent footer in one pass: the block, its three lines with their labels, figures,
 * colours, edges, heights and dividers, what the block itself says, the two currency cells
 * of every row above it, the card and whatever on the screen could record money. Answers
 * even when the footer is not there at all.
 */
const readSentFoot = (page: Page): Promise<SentFootReading> =>
  page.evaluate((): SentFootReading => {
    const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()
    const NEAR = 1.5
    const empty = {
      ground: '',
      ink: '',
      size: 0,
      weight: '',
      gap: '',
      padding: '',
      blockCount: null,
      blockCents: null,
      lines: [] as readonly FootLineReading[],
      insideTheScrollingRows: false,
      top: 0,
      bottom: 0,
      linesInOneBlock: false,
    }
    const screen = document.querySelector('[data-screen="statement"]')
    const alerts = document.querySelectorAll('[data-pane="statement"] [role="alert"]').length
    if (screen === null) {
      return {
        present: false,
        found: false,
        ...empty,
        rows: [],
        card: [],
        alerts,
        writingControls: 0,
      }
    }

    const textBox = (element: Element): DOMRect => {
      const range = document.createRange()
      range.selectNodeContents(element)
      const box = range.getBoundingClientRect()
      return box.width === 0 && box.height === 0 ? element.getBoundingClientRect() : box
    }
    const drawnOf = (element: Element, within: Element): Drawn => {
      const style = window.getComputedStyle(element)
      const text = textBox(element)
      const field = within.getBoundingClientRect()
      return {
        text: squash(element.textContent),
        ink: style.color,
        weight: style.fontWeight,
        size: Number.parseFloat(style.fontSize),
        left: text.left,
        right: text.right,
        bottom: text.bottom,
        atTheLeftEdge: Math.abs(text.left - field.left) <= NEAR,
        atTheRightEdge: Math.abs(text.right - field.right) <= NEAR,
      }
    }

    const block = screen.querySelector('[data-statement-foot="sent"]')
    const lineElements = Array.from(screen.querySelectorAll('[data-statement-foot-line]'))
    const rowsArea = screen.querySelector('[data-statement-rows="sent"]')

    /** The readings of one line: its leaf elements, in the order they are drawn. */
    const leavesOf = (line: Element): readonly Drawn[] => {
      const leaves = Array.from(line.querySelectorAll('*')).filter(
        (part) => part.children.length === 0 && squash(part.textContent) !== '',
      )
      return (leaves.length === 0 ? [line] : leaves).map((part) => drawnOf(part, line))
    }

    /** The line standing above this one: a border of its own, or a thin part before it. */
    const dividerOf = (line: Element): { width: string; ink: string } => {
      const style = window.getComputedStyle(line)
      if (Number.parseFloat(style.borderTopWidth) > 0) {
        return { width: style.borderTopWidth, ink: style.borderTopColor }
      }
      const previous = line.previousElementSibling
      if (previous !== null && !previous.hasAttribute('data-statement-foot-line')) {
        const box = previous.getBoundingClientRect()
        if (box.height > 0 && box.height <= 2) {
          return {
            width: `${Math.round(box.height)}px`,
            ink: window.getComputedStyle(previous).backgroundColor,
          }
        }
      }
      return { width: '0px', ink: 'none' }
    }

    const lines: readonly FootLineReading[] = lineElements.map((line) => {
      const leaves = leavesOf(line)
      const divider = dividerOf(line)
      const first = leaves[0]
      return {
        which: line.getAttribute('data-statement-foot-line'),
        count: line.getAttribute('data-count'),
        cents: line.getAttribute('data-cents'),
        text: squash(line.textContent),
        leaves,
        height: line.getBoundingClientRect().height,
        dividerWidth: divider.width,
        dividerInk: divider.ink,
        sharedBaseline:
          first !== undefined && leaves.every((leaf) => Math.abs(leaf.bottom - first.bottom) <= NEAR),
      }
    })

    const blockStyle = block === null ? null : window.getComputedStyle(block)
    const blockBox = block === null ? null : block.getBoundingClientRect()

    const rows = Array.from(screen.querySelectorAll('[data-statement-list="sent"] [data-statement-row]')).map(
      (row) => {
        const cells = Array.from(row.children)
        return cells.slice(-2).map((cell) => squash(cell.textContent))
      },
    )

    const writing =
      screen.querySelectorAll('[data-box], [data-action]').length +
      Array.from(screen.querySelectorAll('button, a')).filter((control) =>
        ['Send', 'Receive'].includes(squash(control.textContent)),
      ).length

    return {
      present: true,
      found: block !== null,
      ground: blockStyle?.backgroundColor ?? '',
      ink: blockStyle?.color ?? '',
      size: blockStyle === null ? 0 : Number.parseFloat(blockStyle.fontSize),
      weight: blockStyle?.fontWeight ?? '',
      gap: blockStyle?.rowGap ?? '',
      padding:
        blockStyle === null
          ? ''
          : `${blockStyle.paddingTop} ${blockStyle.paddingRight} ${blockStyle.paddingBottom}`,
      blockCount: block?.getAttribute('data-count') ?? null,
      blockCents: block?.getAttribute('data-cents') ?? null,
      lines,
      insideTheScrollingRows: block !== null && rowsArea !== null && rowsArea.contains(block),
      top: blockBox?.top ?? 0,
      bottom: blockBox?.bottom ?? 0,
      linesInOneBlock:
        block !== null && lineElements.length > 0 && lineElements.every((line) => block.contains(line)),
      rows,
      card: Array.from(screen.querySelectorAll('[data-statement-total]')).map((figure) => ({
        which: figure.getAttribute('data-statement-total') ?? '',
        cents: figure.getAttribute('data-cents'),
        text: squash(figure.textContent),
        ink: window.getComputedStyle(figure).color,
      })),
      alerts,
      writingControls: writing,
    }
  })

/** Reads the paid-back footer, which this value leaves exactly as it reads today. */
const readBackFoot = (page: Page): Promise<BackFootReading> =>
  page.evaluate((): BackFootReading => {
    const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()
    const foot = document.querySelector('[data-statement-foot="back"]')
    if (foot === null) {
      return { found: false, text: '', count: null, cents: null, ground: '', ink: '', lines: 0, figureInks: [] }
    }
    const style = window.getComputedStyle(foot)
    return {
      found: true,
      text: squash(foot.textContent),
      count: foot.getAttribute('data-count'),
      cents: foot.getAttribute('data-cents'),
      ground: style.backgroundColor,
      ink: style.color,
      lines: foot.querySelectorAll('[data-statement-foot-line]').length,
      figureInks: Array.from(
        document.querySelectorAll('[data-statement-list="back"] [data-statement-row] > *:last-child'),
      ).map((cell) => window.getComputedStyle(cell).color),
    }
  })

// ===== The scenarios =====

test('the footer tells what went in rufiyaa, what went in dollars and the total', async ({ page }) => {
  // Given a month in which money went out in both currencies
  const stored = await readStoredLedger(stack, both)
  expect(
    expectedFootLines(stored),
    'WHAT: the ledger seeded for this reading is not the month this footer is worded by. WHY: the three lines below are stated as constants so a wrong derivation in this oracle cannot pass unnoticed. HOW: seed four rufiyaa sends worth 3,000 dollars together and five dollar sends worth 9,500 dollars together.',
  ).toEqual(BOTH_CURRENCIES_READS)
  await givenTheOwnerIsSignedIn(page, both)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the three lines read the rufiyaa, the dollars and the total of both, in that order
  const reading = await readSentFoot(page)
  expect(
    linesRead(reading),
    "WHAT: the footer does not read the rufiyaa line, the dollar line and the total line as the stored sends mean them. WHY: this block is where the owner reads what went out in each currency and what went out altogether: a wrong line here misstates the month's money. HOW: derive each line from the sends stored in its own currency, word its count the way this app words a count, and read the total over every send.",
  ).toEqual(linesMeant(stored))
  expect(
    reading.lines.map((line) => line.which),
    'WHAT: the three lines are not drawn rufiyaa, dollars and total in that order. WHY: the owner reads the two currencies first and their total last, under the divider; another order reads as a different statement. HOW: draw the rufiyaa line, then the dollar line, then the total line.',
  ).toEqual([...LINES])
  expect(
    reading.lines.map((line) => [line.leaves[0]?.atTheLeftEdge, line.leaves.at(-1)?.atTheRightEdge, line.sharedBaseline]),
    'WHAT: a line does not stand with its label at the left and its figures at the right on one baseline. WHY: the owner scans the labels down the left and the figures down the right: a figure that wanders is a figure they cannot compare. HOW: spread each line between its label and its figures on a shared baseline.',
  ).toEqual(LINES.map(() => [true, true, true]))
  expect(
    [
      reading.lines[0]?.leaves[1]?.ink,
      reading.lines[0]?.leaves[2]?.ink,
      reading.lines[1]?.leaves[1]?.ink,
      reading.lines.map((line) => line.leaves[0]?.ink),
    ],
    'WHAT: the figures of the two currency lines are not inked in their own currency colours over the footer ink. WHY: colour is how the owner tells rufiyaa from dollars and a converted value from money actually sent in dollars. HOW: ink the rufiyaa subtotal amber-brown, its dollar value the lighter blue, the dollar subtotal blue, and every label in the footer ink.',
  ).toEqual([MVR_INK, CONVERTED_INK, USD_INK, [FOOT_INK, FOOT_INK, FOOT_INK]])
})

test('a currency nobody sent this month still reads its own line at zero', async ({ page }) => {
  // Given a month in which money went out in dollars only
  const stored = await readStoredLedger(stack, dollarsOnly)
  await givenTheOwnerIsSignedIn(page, dollarsOnly)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the rufiyaa line is still there, reading no entries and nothing sent
  const reading = await readSentFoot(page)
  expect(
    linesRead(reading),
    "WHAT: a month with no rufiyaa send does not read its rufiyaa line at zero. WHY: a hidden line reads as a currency split the owner cannot see at all, and they cannot tell 'nothing went out in rufiyaa' from 'this footer forgot about rufiyaa'. HOW: draw all three lines at every ledger, reading the missing currency at none and at zero.",
  ).toEqual(linesMeant(stored))
  expect(
    [reading.lines[0]?.leaves[0]?.text, reading.lines[0]?.leaves.slice(1).map((figure) => figure.text)],
    "WHAT: the rufiyaa line of a dollars-only month does not read 'No entries' with 'MVR0' and '$0.00'. WHY: those are the readings that tell the owner nothing went out in rufiyaa this month. HOW: word a count of none the way this app words it, and read a subtotal of nothing as zero in both figures.",
  ).toEqual(['Sent in MVR · No entries', ['MVR0', '$0.00']])
})

test('the first rufiyaa send of the month makes that line read one entry', async ({ page }) => {
  // Given the same month with one rufiyaa send added to it
  const stored = await readStoredLedger(stack, firstRufiyaa)
  await givenTheOwnerIsSignedIn(page, firstRufiyaa)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the rufiyaa line reads one entry with that send's own figures
  const reading = await readSentFoot(page)
  expect(
    linesRead(reading),
    "WHAT: a month holding exactly one rufiyaa send does not read that line as one entry with its own figures. WHY: one is the count this app words differently from every other, and the owner reads it on the line of the currency they used once. HOW: word a count of one as '1 entry' and sum that single send on its own line and on the total.",
  ).toEqual(linesMeant(stored))
  expect(
    reading.lines[0]?.leaves[0]?.text,
    "WHAT: a single rufiyaa send is not read as '1 entry'. WHY: a line reading '1 entries' is the app speaking in a way it never speaks anywhere else. HOW: word every count through the one place this app words counts.",
  ).toBe('Sent in MVR · 1 entry')
})

test('all three lines and their divider are there even when nothing has been sent', async ({ page }) => {
  // Given an owner who has recorded nothing at all
  const stored = await readStoredLedger(stack, emptyLedger)
  await givenTheOwnerIsSignedIn(page, emptyLedger)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the footer still reads three lines at zero, under one thin divider, and says so
  const reading = await readSentFoot(page)
  expect(
    [reading.found, reading.lines.length, stored.length],
    'WHAT: an empty ledger has no footer, or has fewer than three lines. WHY: a footer the owner cannot find reads as a screen that has not loaded, and a short footer hides a currency. HOW: draw the block with all three of its lines at every ledger, the empty one included.',
  ).toEqual([true, 3, 0])
  expect(
    linesRead(reading),
    "WHAT: an empty ledger's three lines do not all read at zero. WHY: a month in which nothing went out must say exactly that, in all three lines, rather than leave the owner reading blanks. HOW: read a line with no send at all as 'No entries' with its zero figures.",
  ).toEqual(linesMeant(stored))
  expect(
    reading.lines.map((line) => [line.count, line.cents]),
    'WHAT: a line of an empty footer does not carry its own count and cents. WHY: a currency line without its pair cannot be read at all except by its text, so nothing could tell a line of zero from a line that was never given its figures. HOW: carry a count and a cents on every one of the three lines.',
  ).toEqual([
    ['0', '0'],
    ['0', '0'],
    ['0', '0'],
  ])
  expect(
    reading.lines.map((line) => line.height > 0),
    'WHAT: a footer line is drawn with no height at all. WHY: a line collapsed by the stylesheet is invisible to the owner while the screen still claims to hold it. HOW: leave every one of the three lines its own height on every ledger.',
  ).toEqual([true, true, true])
  expect(
    [reading.lines[2]?.dividerWidth, reading.lines[2]?.dividerInk],
    'WHAT: there is no thin divider above the last line. WHY: the divider is what tells the owner the last line is the total of the two above it and not a third currency. HOW: stand one hairline above the total line.',
  ).toEqual([DIVIDER_WIDTH, DIVIDER_INK])
  expect(
    [reading.lines[0]?.dividerWidth, reading.lines[1]?.dividerWidth],
    'WHAT: a divider stands above a currency line as well. WHY: a rule above every line parts the two currencies from each other, which is not what the block means. HOW: draw the divider above the last line alone.',
  ).toEqual(['0px', '0px'])
  expect(
    [reading.ground, reading.ink, reading.size, reading.weight, reading.gap, reading.padding],
    'WHAT: the footer block is no longer set on its own pale ground in its deep ink at the size and weight it reads today. WHY: the block is one reading the owner takes in at a glance, and this value adds lines to it without restyling the screen. HOW: keep the existing ground and ink, set the lines at 13 px weight 700 with a 6 px gap and the block padding the board draws.',
  ).toEqual([FOOT_GROUND, FOOT_INK, FOOT_SIZE, FOOT_WEIGHT, FOOT_GAP, FOOT_PADDING])
  expect(
    reading.alerts,
    'WHAT: an empty ledger is reported as a failed read. WHY: an empty ledger and a read that failed must never look alike: one is a quiet month, the other is money the owner cannot see. HOW: speak an alert only when the read itself failed.',
  ).toBe(0)
})

test('a rufiyaa subtotal with real laari keeps them while every dollar figure keeps two decimals', async ({
  page,
}) => {
  // Given two rufiyaa sends whose laari do not add up to whole rufiyaa
  const stored = await readStoredLedger(stack, laari)
  expect(
    laariOf(sendsOf(stored).filter((row) => row.currency === 'MVR')) % 100,
    'WHAT: the seeded rufiyaa sends add up to whole rufiyaa. WHY: this reading exists for the subtotal that has real laari in it, which is the only footer figure allowed to read other than two decimals. HOW: seed rufiyaa sends whose laari do not add up to a whole rufiyaa.',
  ).not.toBe(0)
  await givenTheOwnerIsSignedIn(page, laari)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the rufiyaa subtotal reads its laari while every dollar figure keeps its two decimals
  const reading = await readSentFoot(page)
  expect(
    linesRead(reading),
    "WHAT: the footer does not read a rufiyaa subtotal with real laari beside dollar figures at two decimals. WHY: the rufiyaa subtotal is written the way a rufiyaa amount is written, while every total in dollars keeps its two decimals: one rule applied to both would misstate one of them. HOW: word the rufiyaa subtotal as a rufiyaa amount, with its laari only when they are real, and keep two decimals on every dollar figure.",
  ).toEqual(linesMeant(stored))
  expect(
    reading.lines.flatMap((line) => line.leaves.slice(1).map((figure) => figure.text)),
    "WHAT: a footer figure does not keep its two decimals, or the rufiyaa subtotal was given two decimals it does not have. WHY: a total that drops its decimals reads as a round figure the owner does not hold, and a rufiyaa subtotal padded to two decimals reads unlike every other rufiyaa figure on the screen. HOW: keep '.00' on every dollar figure of the footer and on no rufiyaa subtotal of whole rufiyaa.",
  ).toEqual([
    mvrFigure(laariOf(sendsOf(stored).filter((row) => row.currency === 'MVR'))),
    twoDecimalFigure(centsOf(sendsOf(stored).filter((row) => row.currency === 'MVR'))),
    twoDecimalFigure(centsOf(sendsOf(stored).filter((row) => row.currency === 'USD'))),
    twoDecimalFigure(centsOf(sendsOf(stored))),
  ])
})

test('what each line says in words agrees with what it says in its own count and cents', async ({ page }) => {
  // Given a month in which money went out in both currencies
  const stored = await readStoredLedger(stack, both)
  await givenTheOwnerIsSignedIn(page, both)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then every line's pair matches its own words, and the block still reads the total
  const reading = await readSentFoot(page)
  const expectedLines = expectedFootLines(stored)
  expect(
    reading.lines.map((line) => [line.which, line.count, line.cents]),
    'WHAT: a line does not name itself, or does not carry the count and the cents of its own currency. WHY: these are the readings a test and a reader take without reading any styling: a line whose pair belongs to another currency reads as a split that was never sent. HOW: name each line and carry on it the count and the cents of the sends stored in that currency.',
  ).toEqual(expectedLines.map((line) => [line.which, String(line.count), String(line.cents)]))
  expect(
    reading.lines.map((line) => [line.text.includes(countLabel(Number(line.count))), line.text]),
    'WHAT: a line words a count its own attribute does not hold. WHY: the words and the pair are read by different readers, and a disagreement between them means one of the two is wrong about the money. HOW: word every line from the same count it carries.',
  ).toEqual(reading.lines.map((line) => [true, line.text]))
  expect(
    [reading.blockCount, reading.blockCents],
    'WHAT: the block itself no longer reads the total of the sending list. WHY: a reader that knew only the old footer hooks still asks the block how many sends there were and how much they were worth, and must still be told. HOW: keep the block\'s own count and cents reading the total line.',
  ).toEqual([String(expectedLines[2]?.count), String(expectedLines[2]?.cents)])
})

test('the two currency lines count and sum exactly the sends made in their own currency', async ({ page }) => {
  // Arrange a spread of ledgers from a fixed seed, including the ledgers that must be there
  const ledgers = generatedLedgers()
  await givenTheOwnerIsSignedIn(page, generated)

  // Act: read each ledger through its own page load, keeping the first that disagrees
  const failing = await firstFailing(page, ledgers, judgeTheCurrencySplit)

  // Assert: nothing disagreed; a failing ledger is reported at its smallest
  expect(
    await reportOf(page, failing, judgeTheCurrencySplit),
    "WHAT: a generated ledger's two currency lines did not count and sum exactly the sends stored in their own currency. WHY: this is the law that makes the split true of every ledger and not only of the seeded month: a line that took a send of the other currency, or dropped one of its own, tells the owner money went somewhere it never went. HOW: read the failing ledger printed above, which is the smallest one that still disagrees, and decide a line's membership from the stored currency of the send and from nothing drawn.",
  ).toBe('')
})

test('the total line is the two currency lines added up, counted from every stored send', async ({ page }) => {
  // Arrange the same spread of ledgers, read for what the last line adds up
  const ledgers = generatedLedgers()
  await givenTheOwnerIsSignedIn(page, generated)

  // Act: read each ledger through its own page load, keeping the first that disagrees
  const failing = await firstFailing(page, ledgers, judgeTheTotalAddsUp)

  // Assert: the total is the two lines together over every stored send
  expect(
    await reportOf(page, failing, judgeTheTotalAddsUp),
    'WHAT: a generated ledger read a total line that is not the two currency lines added up over every stored send. WHY: the total is what the owner checks their month against, and one summed from a single line or from the rows in sight disagrees with their money as soon as a currency is missing or the list is long. HOW: read the failing ledger printed above and sum the total line over every stored send, whatever currency it is stored in.',
  ).toBe('')
})

test('five hundred sends are all counted, and the currency nobody used still reads at zero', async ({ page }) => {
  // Given a month of five hundred dollar sends and no rufiyaa send at all
  const stored = await readStoredLedger(stack, long)
  expect(
    [sendsOf(stored).length, sendsOf(stored).filter((row) => row.currency === 'MVR').length],
    'WHAT: the long month seeded here is not five hundred sends with no rufiyaa send among them. WHY: this reading puts two hard cases on the footer at once: a list far longer than the viewport and a currency nobody used. HOW: seed five hundred dollar sends and no rufiyaa send.',
  ).toEqual([500, 0])
  await givenTheOwnerIsSignedIn(page, long)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then every stored send is counted, not only the rows in sight, and rufiyaa reads at zero
  const reading = await readSentFoot(page)
  expect(
    linesRead(reading),
    'WHAT: a long month is not counted from the sends it stores. WHY: a footer that counts the rows in sight tells the owner they sent far less than they did, which is the one number they check their month against. HOW: count and sum every stored send, however many there are and however few are in the viewport.',
  ).toEqual(linesMeant(stored))
  expect(
    [reading.lines[2]?.count, reading.lines[0]?.leaves[0]?.text],
    "WHAT: the total line does not read five hundred entries, or the unused currency does not read at none. WHY: these are the two readings the long month must still get right: the whole count, and a currency line standing at zero rather than vanishing. HOW: read the count from the stored sends and keep all three lines at every length.",
  ).toEqual(['500', 'Sent in MVR · No entries'])
  expect(
    reading.bottom <= VIEWPORT.height + 1,
    'WHAT: the footer of a five-hundred-send month is pushed off the bottom of the phone. WHY: the owner reads a long month by scrolling its rows, and a footer that leaves the screen takes the total with it. HOW: keep the footer outside the scrolling area, under the rows.',
  ).toBe(true)
})

test('the ledger keeps no send the footer could not place on a currency line', async () => {
  // Arrange: a well-formed rufiyaa send, as the footer must be able to read it
  const wellFormed = {
    kind: 'send',
    currency: 'MVR',
    amount_minor: 1_500_000,
    rate: '20.0000',
    usd_cents: 75_000,
    entry_date: '2026-05-04',
    person_name: AHMED,
    method: 'transfer',
  }

  // Act: offer the ledger a send in a third currency, and the same send well formed
  const thirdCurrency = await offerStoredRow(stack, offered, {
    ...wellFormed,
    currency: 'EUR',
    rate: null,
  })
  const kept = await offerStoredRow(stack, offered, wellFormed)

  // Assert: the third currency is refused where it is written, and the well-formed send is kept
  expect(
    thirdCurrency,
    'WHAT: the ledger kept a send in a currency that is neither dollars nor rufiyaa. WHY: the footer has a line for each of those two and no line for a third: such a send could only be counted in the total with no currency line of its own, so the split the owner reads would not add up to it. HOW: refuse a send in any other currency where it is written, which is the boundary that admits a stored row.',
  ).not.toBeNull()
  expect(
    kept,
    'WHAT: the ledger refused a rufiyaa send with its rate and its dollars. WHY: that is the very send the rufiyaa line must sum, so a refusal here would leave the footer nothing to read. HOW: keep a well-formed send as it is written.',
  ).toBeNull()
})

test('a ledger that cannot be read says so instead of a footer at zero', async ({ page }) => {
  // Given the ledger cannot be reached from the phone
  await page.route(ENTRIES_ENDPOINT, async (route) => {
    if (route.request().method() === 'GET') {
      await route.abort('failed')
      return
    }
    await route.continue()
  })
  await givenTheOwnerIsSignedIn(page, both)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the screen speaks the message the read gave it and draws no footer at all
  await expect(
    statementPane(page).getByRole('alert'),
    'WHAT: the Statement does not speak one alert after a failed read. WHY: the owner must be told the ledger could not be read, not shown a footer. HOW: speak the message the read answers with, and draw no list and no footer.',
  ).toHaveText(UNREADABLE)
  const reading = await readSentFoot(page)
  expect(
    [reading.found, reading.lines.length, reading.card.length],
    'WHAT: a failed read still drew the footer, a line of it or a figure. WHY: three lines at zero read as a month in which nothing went out, which is a different and false statement about the money. HOW: draw the alert alone when the read failed.',
  ).toEqual([false, 0, 0])
})

test('the three lines stay in sight together while the rows are scrolled', async ({ page }) => {
  // Given a month long enough that its rows must be scrolled
  await givenTheOwnerIsSignedIn(page, long)
  await whenTheOwnerTapsStatement(page)
  const before = await readSentFoot(page)

  // When the owner scrolls the rows to their end
  await whenTheOwnerScrollsTheRowsToTheEnd(page)

  // Then the block has not moved, stands outside the scrolling rows and holds all three lines
  const after = await readSentFoot(page)
  expect(
    [after.insideTheScrollingRows, after.linesInOneBlock, after.lines.length],
    'WHAT: the footer stands inside the scrolling rows, or its lines are not held in one block. WHY: the owner reads the three lines together while the rows move under them: a footer that scrolls away takes the total with it, and lines in separate blocks arrive at different moments. HOW: keep the one block of three lines outside the scrolling area, under the rows.',
  ).toEqual([false, true, 3])
  expect(
    Math.abs(after.top - before.top) <= 1,
    'WHAT: the footer moved while the rows were scrolled. WHY: it is pinned under the rows today and this value adds lines to it without unpinning it. HOW: leave the block where it stands while the rows scroll.',
  ).toBe(true)
})

test('the paid-back footer reads exactly as before', async ({ page }) => {
  // Given a month holding a repayment from Abbaas
  const stored = await readStoredLedger(stack, both)
  await givenTheOwnerIsSignedIn(page, both)
  await whenTheOwnerTapsStatement(page)

  // When the owner taps the paid-back list
  await whenTheOwnerTapsThePaidBackList(page)

  // Then its footer still reads one line, its own words and its two-decimal total
  const back = await readBackFoot(page)
  const repayments = repaymentsOf(stored)
  expect(
    [back.found, back.text, back.count, back.cents, back.lines],
    "WHAT: the paid-back footer no longer reads its one line, 'Total paid back' with its count and its two-decimal total, or it was given lines of its own. WHY: only the sending side gains a currency split here: changing both footers at once would leave the owner reading a screen nobody approved. HOW: keep the paid-back footer exactly as it is, as one line with its own count and cents.",
  ).toEqual([
    true,
    `Total paid back ${DOT} ${countLabel(repayments.length)} ${twoDecimalFigure(centsOf(repayments))}`,
    String(repayments.length),
    String(centsOf(repayments)),
    0,
  ])
  expect(
    [back.ground, back.ink, back.figureInks],
    'WHAT: the paid-back footer is no longer on its tinted teal bed, or its figures are no longer teal. WHY: teal is how the owner tells money that came back from money that went out, and this value does not touch it. HOW: leave that list, its bed and its colours as they are.',
  ).toEqual([PAID_BACK_GROUND, PAID_BACK_FOOT_INK, repayments.map(() => PAID_BACK_INK)])
})

test('the card above reads the same money as the total line, and the rows read as before', async ({ page }) => {
  // Given a month in which money went out in both currencies
  const stored = await readStoredLedger(stack, both)
  await givenTheOwnerIsSignedIn(page, both)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the card still reads its three two-decimal figures, and they agree with the total line
  const reading = await readSentFoot(page)
  expect(
    reading.card.map((figure) => [figure.which, figure.cents, figure.text]),
    'WHAT: the balance card no longer reads its three figures to two decimals. WHY: the card is the first thing the owner looks at and this value does not touch it. HOW: leave the card figures worded as they are today.',
  ).toEqual(expectedCard(stored).map((figure) => [figure.which, figure.cents, figure.text]))
  expect(
    reading.card.map((figure) => figure.ink),
    'WHAT: the three card figures are no longer inked as they were. WHY: the card keeps its own colours while the footer below it gains the two currency colours. HOW: leave the card inks untouched.',
  ).toEqual([USD_INK, PAID_BACK_INK, BALANCE_INK])
  expect(
    reading.rows,
    'WHAT: the rows above the footer no longer read their two currency cells as they do today. WHY: this value adds lines to the footer and changes no row: a row that changed with it would restate money the owner has already read. HOW: leave each row\'s rufiyaa and dollar cells exactly as they are.',
  ).toEqual(expectedRowCells(stored))
  expect(
    reading.card[0]?.cents,
    'WHAT: the card no longer states the same money the total line states. WHY: two readings of one month that disagree leave the owner with no way to tell which of the two is their money. HOW: sum the card and the total line over the same stored sends.',
  ).toBe(reading.lines[2]?.cents)
  expect(
    reading.writingControls,
    'WHAT: the Statement offers something that could record money. WHY: this screen only reports: anything within its reach that writes could change the very money it is reporting. HOW: give the screen the read outcome and nothing that writes.',
  ).toBe(0)
})

test('the screen draws the three lines without wording any money itself', async () => {
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
  const marks = currencyMarksWritten(plain)
  const code = plain.replace(LITERAL, '""')
  const wordsMoneyItself = /\b(Intl|NumberFormat|toLocaleString|toFixed)\b/.test(code)
  // Arithmetic the screen may not do: any scaling at all, and any sum or difference whose
  // own line names an amount or a count. Placing parts in their rising order is not money.
  const NAMES_MONEY = /\b\w*(cents|laari|amount|minor|total|subtotal|count)\w*\b/i
  const arithmetic = code
    .split('\n')
    .map((line, index) => `${index + 1}: ${line.trim()}`)
    .filter((line) => {
      const body = line.slice(line.indexOf(':') + 1)
      return /[*/%]/.test(body) || (/[+-]/.test(body) && NAMES_MONEY.test(body))
    })
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
  const classes = ['src/ui/statement.ts', 'src/domain/statement.ts'].filter((file) =>
    /\bclass\s+\w/.test(read(file) ?? ''),
  )
  const writesFromTheScreen = ['addEntry', 'removeEntry', 'addPerson', 'insert(', 'delete(', 'upsert('].filter(
    (operation) => (screenSource ?? '').includes(operation),
  )

  // Assert: the footer's figures are decided in one place, and the screen only draws them
  expect(
    screenSource === null ? 'missing' : 'present',
    "WHAT: there is no module owning the statement's screen. WHY: the three lines are drawn by one function from the read ledger to DOM, which decides nothing about money itself. HOW: own that screen in the statement's own screen module.",
  ).toBe('present')
  expect(
    marks,
    'WHAT: the screen writes a currency mark of its own. WHY: one place must word every figure, or a row, a card and a footer line can mark or group the same money differently. HOW: take each marked figure from the module that owns what the footer reads.',
  ).toEqual([])
  expect(
    wordsMoneyItself,
    'WHAT: the screen formats a number itself. WHY: a second formatter is a second rounding, and the owner would read two different amounts for one month. HOW: draw the text the meaning module has already worded.',
  ).toBe(false)
  expect(
    arithmetic,
    'WHAT: the screen adds, scales or divides something. WHY: a subtotal summed where the lines are drawn is a second answer about the owner\'s money, and the one the meaning module gives would no longer be the only one. HOW: leave every amount and every count exactly as it arrives.',
  ).toEqual([])
  expect(
    domainOffenders,
    'WHAT: a module that decides meaning names the document or an adapter. WHY: meaning that can touch the DOM or the database cannot be read, reused or trusted on its own. HOW: keep the meaning modules to values in and values out.',
  ).toEqual([])
  expect(
    classes,
    'WHAT: a statement module declares a class. WHY: this app is written as functions from values to values and from values to DOM, and a second style in one module makes the rule unreadable. HOW: add the footer as functions.',
  ).toEqual([])
  expect(
    writesFromTheScreen,
    'WHAT: the statement screen names an operation that writes to the ledger. WHY: this screen only reports: a writing operation within its reach could change the money it is reporting. HOW: give the screen the read outcome and nothing that writes.',
  ).toEqual([])
})

// ===== The generated ledgers =====

/** The seed is a constant of this spec, printed with any failing ledger so it is replayed exactly. */
const GENERATOR_SEED = 20261024

/** A small deterministic source of numbers, so the ledgers below never drift. */
const numbersFrom = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const DATE_POOL = ['2026-01-05', '2026-03-17', '2026-07-01', '2026-09-14', '2026-12-28'] as const

/**
 * The shapes a stored send of this app can take, each one named so it is reached by
 * construction rather than hoped for: whole rufiyaa, rufiyaa with real laari, whole
 * dollars, dollars with real cents, and an amount large enough that no figure of the
 * footer may assume a small one.
 */
const SEND_SHAPES = [
  'rufiyaa, whole',
  'rufiyaa, with laari',
  'dollars, whole',
  'dollars, with cents',
  'dollars, very large',
] as const
type SendShape = (typeof SEND_SHAPES)[number]

/**
 * One generated entry of the named shape. The dollars a rufiyaa send stores are drawn
 * unrelated to its own amount and rate, so a footer that converted the rufiyaa subtotal
 * itself instead of summing the stored dollars is caught.
 */
const generatedEntry = (
  next: () => number,
  index: number,
  shape: SendShape,
  kind: 'send' | 'receive',
): EntrySeed => {
  const entryDate = DATE_POOL[Math.floor(next() * DATE_POOL.length)] ?? '2026-07-01'
  const rufiyaa = shape.startsWith('rufiyaa') && kind === 'send'
  const veryLarge = shape === 'dollars, very large'
  const wholeUnits = veryLarge ? 90_000_000 + Math.floor(next() * 9_000_000) : 1 + Math.floor(next() * 200_000)
  const whole = shape === 'rufiyaa, whole' || shape === 'dollars, whole' || veryLarge
  const amountMinor = whole ? wholeUnits * 100 : wholeUnits * 100 + 1 + Math.floor(next() * 98)
  return {
    kind,
    currency: rufiyaa ? 'MVR' : 'USD',
    amountMinor,
    rate: rufiyaa ? `${(1 + Math.floor(next() * 40)).toString()}.0000` : null,
    usdCents: rufiyaa ? 1 + Math.floor(next() * 900_000) : amountMinor,
    entryDate,
    savedAt: `${entryDate}T0${index % 10}:${String(index % 60).padStart(2, '0')}:00Z`,
    personName: kind === 'send' ? (next() < 0.5 ? AHMED : MARIYAM) : undefined,
    method: 'transfer',
  }
}

/** The ledgers this footer is judged over, including the ledgers that must be there. */
const generatedLedgers = (): ReadonlyArray<{ label: string; entries: readonly EntrySeed[] }> => {
  const next = numbersFrom(GENERATOR_SEED)
  const drawn = (size: number, shapes: readonly SendShape[] = SEND_SHAPES): readonly EntrySeed[] =>
    Array.from({ length: size }, (_unused, index) => {
      const shape = shapes[Math.floor(next() * shapes.length)] ?? 'dollars, whole'
      // A quarter of the entries are repayments, which this footer must leave out.
      return generatedEntry(next, index, shape, next() < 0.75 ? 'send' : 'receive')
    })

  return [
    { label: 'nothing recorded at all', entries: [] },
    {
      label: 'one send of every shape',
      entries: SEND_SHAPES.map((shape, index) => generatedEntry(next, index, shape, 'send')),
    },
    { label: 'one send', entries: drawn(1) },
    { label: 'no rufiyaa send at all', entries: drawn(6, ['dollars, whole', 'dollars, with cents']) },
    { label: 'no dollar send at all', entries: drawn(6, ['rufiyaa, whole', 'rufiyaa, with laari']) },
    { label: 'real cents and real laari across a year', entries: drawn(9, ['rufiyaa, with laari', 'dollars, with cents']) },
    { label: 'a dozen entries in both currencies', entries: drawn(12) },
    { label: 'the longest this generator draws', entries: drawn(30) },
  ]
}

/** What a judge answers: every way one ledger's footer disagreed with its stored sends. */
type Judge = (page: Page) => Promise<readonly string[]>

/** Stores one ledger, reads it through a page load, and hands the footer to a judge. */
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
  return judge(page)
}

/** Judges one footer against the stored sends: the two currency lines, line by line. */
const judgeTheCurrencySplit: Judge = async (page: Page): Promise<readonly string[]> => {
  const stored = await readStoredLedger(stack, generated)
  const reading = await readSentFoot(page)
  if (!reading.present) return ['there is no statement screen to read']
  if (!reading.found) return ['there is no sent footer to read']
  const reasons: string[] = []

  const sends = sendsOf(stored)
  const inRufiyaa = sends.filter((row) => row.currency === 'MVR')
  const inDollars = sends.filter((row) => row.currency === 'USD')
  const inNeither = sends.filter((row) => row.currency !== 'MVR' && row.currency !== 'USD')

  const drawn = linesRead(reading)
  const meant = linesMeant(stored)
  if (JSON.stringify(drawn) !== JSON.stringify(meant)) {
    reasons.push(`the lines read ${JSON.stringify(drawn)} not ${JSON.stringify(meant)}`)
  }

  // The counts are checked against the sends the ledger holds, never assumed to exhaust
  // them: a send in neither currency belongs to no currency line and still to the total.
  const countOf = (which: WhichLine): number =>
    Number(reading.lines.find((line) => line.which === which)?.count ?? NaN)
  const centsOnLine = (which: WhichLine): number =>
    Number(reading.lines.find((line) => line.which === which)?.cents ?? NaN)
  if (countOf('mvr') + countOf('usd') + inNeither.length !== countOf('total')) {
    reasons.push(
      `the two currency lines count ${countOf('mvr')} and ${countOf('usd')} of the ${sends.length} stored sends, with ${inNeither.length} in neither currency, which does not add up to the ${countOf('total')} the total line counts`,
    )
  }
  if (centsOnLine('mvr') !== centsOf(inRufiyaa) || centsOnLine('usd') !== centsOf(inDollars)) {
    reasons.push(
      `the lines hold ${centsOnLine('mvr')} and ${centsOnLine('usd')} cents, stored ${centsOf(inRufiyaa)} and ${centsOf(inDollars)}`,
    )
  }
  const rufiyaaFigure = reading.lines.find((line) => line.which === 'mvr')?.leaves[1]?.text ?? ''
  if (rufiyaaFigure !== mvrFigure(laariOf(inRufiyaa))) {
    reasons.push(`'${rufiyaaFigure}' is not the ${laariOf(inRufiyaa)} laari the rufiyaa sends store`)
  }
  return reasons
}

/** Judges one footer for what its last line adds up, over every stored send. */
const judgeTheTotalAddsUp: Judge = async (page: Page): Promise<readonly string[]> => {
  const stored = await readStoredLedger(stack, generated)
  const reading = await readSentFoot(page)
  if (!reading.present) return ['there is no statement screen to read']
  if (!reading.found) return ['there is no sent footer to read']
  const reasons: string[] = []

  const sends = sendsOf(stored)
  const lineCents = (which: WhichLine): number =>
    Number(reading.lines.find((line) => line.which === which)?.cents ?? NaN)
  const total = reading.lines.find((line) => line.which === 'total')
  const totalCents = Number(total?.cents ?? NaN)
  const totalCount = Number(total?.count ?? NaN)

  if (totalCents !== lineCents('mvr') + lineCents('usd')) {
    reasons.push(
      `the total line holds ${totalCents} cents, while its two currency lines hold ${lineCents('mvr')} and ${lineCents('usd')}`,
    )
  }
  if (totalCents !== centsOf(sends)) {
    reasons.push(`the total line holds ${totalCents} cents, stored ${centsOf(sends)} over ${sends.length} sends`)
  }
  if (totalCount !== sends.length) {
    reasons.push(`the total line counts ${totalCount} of the ${sends.length} stored sends`)
  }
  const totalFigure = total?.leaves[1]?.text ?? ''
  if (totalFigure !== twoDecimalFigure(centsOf(sends))) {
    reasons.push(`'${totalFigure}' is not ${twoDecimalFigure(centsOf(sends))}`)
  }
  const drawnRows = reading.rows.length
  if (totalCount !== sends.length && totalCount === drawnRows) {
    reasons.push(`the total counts the ${drawnRows} rows in sight instead of the ${sends.length} stored sends`)
  }
  return reasons
}

/** The first generated ledger whose footer disagrees, or nothing when none does. */
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
 * has no property-testing library, so there is no automatic shrinking and the smallest
 * case is found by taking entries away one at a time, which is a stated limit of this
 * evidence.
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
      ]),
    )}; ` +
    `${
      smallest.reasons.length > 0
        ? smallest.reasons.join(' | ')
        : `no disagreement on the re-read, so the first reading was not repeatable; it read: ${failing.reasons.join(' | ')}`
    }`
  )
}
