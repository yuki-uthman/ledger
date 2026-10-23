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

// What the owner reads here: the Sent for Abbaas list in four columns -- Date, Paid to,
// MVR and USD -- where a send made in rufiyaa reads its own rufiyaa figure with the prefix
// 'MVR' and its rate beside it, and the dollars that entry stores with no brackets round
// them, and a send made in dollars reads its dollar figure and an em dash. No number is
// drawn in any row, and the line under the person names how the money changed hands and
// nothing else.
//
// Judged only through the declared public port: the BUILT bundle as Chrome loads it over
// the served loopback origin, at 360 by 780, with the local stack behind it. Nothing here
// imports a module of src/: the stimulus is stored rows, the reading is the document, and
// every expected figure is derived in this file from what the ledger stores, so the oracle
// cannot echo back whatever the screen happens to draw.
//
// Every figure, rate and name below is invented. This repository is public, and no figure
// of the owner's own ledger is written anywhere in it.
//
// Two notes on the readings.
//   - A row's MVR cell appends its figure and its rate with no whitespace between them, so
//     the cell's own text reads 'MVR10,000@20' while the owner sees the gap the board draws.
//     This oracle therefore reads the figure and the rate as two readings, never as one
//     joined string.
//   - A rufiyaa send's dollars are the dollars its entry STORES, never a second conversion
//     of its rufiyaa amount. The generated ledgers store dollars unrelated to the rate,
//     which is what makes that law falsifiable.

const PASSWORD_FIELD = 'input[type="password"]'
const VIEWPORT = { width: 360, height: 780 } as const

/** The separator the board draws between the parts of a footer line. */
const DOT = '·'
/** The mark that stands where a rufiyaa figure is absent: an em dash, not a hyphen. */
const EM_DASH = '—'
/** The endpoint the bundle reads the ledger from, as the browser sees it. */
const ENTRIES_ENDPOINT = '**/rest/v1/entries**'
/** What a failed read says, as the port words it. */
const UNREADABLE = 'Could not load the ledger. Try again.'

// ===== The domain vocabulary this oracle speaks =====

type Method = 'cash' | 'cheque' | 'transfer'

/** The word the owner reads for a stored method; a method stored as nothing says nothing. */
const METHOD_WORDS: Record<Method, string> = {
  cash: 'Cash',
  cheque: 'Cheque',
  transfer: 'Transfer',
}

/** One reading of the screen: its text and where it stands. */
type Drawn = {
  readonly text: string
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
}

/** What a row's MVR cell reads: a rufiyaa figure with its rate, or the placeholder. */
type MvrCellReading = {
  readonly found: boolean
  readonly text: string
  readonly figure: Drawn | null
  readonly rate: Drawn | null
  readonly placeholder: Drawn | null
  readonly rateFollowsTheFigure: boolean
  /**
   * How far the reading runs past the left edge of its own column. The cell never wraps
   * and gathers its readings to its right edge, so a reading too wide for the column runs
   * out of it towards the party column; a reading that fits answers nothing over, which
   * is zero or less.
   */
  readonly runsOverTheColumn: number
}

/** What a row's USD cell reads: a marked dollar figure, or the converted one beside it. */
type UsdCellReading = {
  readonly found: boolean
  readonly text: string
  readonly figure: Drawn | null
  readonly converted: string | null
}

/** One row of the sending list, as the owner reads it across the row. */
type SentRowReading = {
  readonly id: string
  readonly place: string
  readonly cells: number
  readonly date: string
  readonly person: string
  readonly sub: string | null
  readonly mvr: MvrCellReading
  readonly usd: UsdCellReading
}

/** The column header of the sending list, as the owner reads it. */
type HeadReading = {
  readonly found: boolean
  readonly words: readonly string[]
  readonly columns: readonly (string | null)[]
  readonly cells: readonly Drawn[]
  /** Whether each header word's centre lies within the extent of the first row's cell of the same index (true when no row exists). */
  readonly overTheRowCells: boolean
}

/** The sending list, its furniture and the rest of the screen, in one reading. */
type SendingListReading = {
  readonly present: boolean
  readonly shown: string | null
  readonly name: string | null
  readonly head: HeadReading
  readonly rows: readonly SentRowReading[]
  readonly foot: {
    readonly count: string | null
    readonly cents: string | null
    readonly text: string
  } | null
  readonly card: ReadonlyArray<{
    readonly which: string
    readonly cents: string | null
    readonly text: string
  }>
  readonly writingControls: number
  readonly alerts: number
}

/** A list this value does not change, read cell by cell to prove it did not change. */
type PlainListReading = {
  readonly words: readonly string[]
  readonly places: readonly string[]
  readonly figures: readonly string[]
  readonly foot: string | null
}

// ===== The independent oracle: what the stored rows mean, worded here =====

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

const grouped = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const groupedWithMinor = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** The day and short month a date reads as: '2026-09-14' is '14 Sep'. Every date seeded here is of one year. */
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

/** The marked whole reading of stored dollars: '$1,500', '$1,500.50'. */
const usdFigure = (cents: number): string => `$${minorFigure(cents)}`
/** The reading, with no brackets, of the dollars a rufiyaa send stores: '$500', '$649.35'. */
const convertedFigure = (cents: number): string => usdFigure(cents)
/** The marked reading of stored laari: 'MVR10,000', 'MVR10,000.50'. */
const mvrFigure = (laari: number): string => `MVR${minorFigure(laari)}`
/** A figure as the card and the two footers read it, always to two decimals. */
const twoDecimalFigure = (cents: number): string => `$${groupedWithMinor.format(Math.abs(cents) / 100)}`

/** A stored rate as the owner reads it beside a figure: no trailing zeros and no padding. */
const plainRate = (stored: string): string =>
  stored.includes('.') ? stored.replace(/0+$/, '').replace(/\.$/, '') : stored
/** The rate as it stands inline in the MVR cell, behind its mark. */
const inlineRate = (stored: string): string => `@${plainRate(stored)}`

/** What this app calls a number of entries. */
const countLabel = (count: number): string => {
  if (count <= 0) return 'No entries'
  if (count === 1) return '1 entry'
  return `${count} entries`
}

/** The line under the person: the stored method's word alone, or nothing at all. */
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

/** The sends of a stored ledger, in the order the owner reads them. */
const sendsOf = (stored: readonly StoredLedgerRow[]): readonly StoredLedgerRow[] =>
  oldestFirst(stored.filter((row) => row.kind === 'send'))
/** The repayments of a stored ledger, in the same order. */
const repaymentsOf = (stored: readonly StoredLedgerRow[]): readonly StoredLedgerRow[] =>
  oldestFirst(stored.filter((row) => row.kind === 'receive'))

/** What one stored send means in the two currency columns and under the person. */
type ExpectedRow = {
  readonly place: string
  readonly date: string
  readonly person: string
  readonly sub: string | null
  /** The rufiyaa figure, or null when this send was made in dollars. */
  readonly mvr: string | null
  /** The inline rate, or null when there is no rate to read. */
  readonly rate: string | null
  readonly usd: string
  readonly rufiyaa: boolean
}

/** Every sent row the stored ledger means, derived from the stored columns alone. */
const expectedRows = (stored: readonly StoredLedgerRow[]): readonly ExpectedRow[] =>
  sendsOf(stored).map((row, index) => {
    const rufiyaa = row.currency === 'MVR'
    return {
      place: String(index + 1),
      date: shortDate(row.entry_date),
      person: row.person_name ?? '',
      sub: sublineOf(row),
      mvr: rufiyaa ? mvrFigure(row.amount_minor) : null,
      rate: rufiyaa && row.rate !== null ? inlineRate(row.rate) : null,
      usd: rufiyaa ? convertedFigure(row.usd_cents) : usdFigure(row.usd_cents),
      rufiyaa,
    }
  })

/**
 * The footer of the sending list: three lines in the order they are drawn, read as the one
 * block of text they stand in. The rufiyaa line reads the laari the sends stored in MVR add
 * up to, with the dollars those same sends store beside it and no brackets round them; the
 * dollar line reads the sends
 * stored in USD; the total line reads every send, whatever its currency. Each count is worded
 * as this app words a count, every figure keeps its two decimals except the rufiyaa subtotal,
 * which reads like a rufiyaa amount, and the block's own count and cents are still the total
 * line's, so a reader that knew only the old hooks still reads the total. All three lines
 * stand at every ledger, the empty one included.
 */
const expectedFoot = (
  stored: readonly StoredLedgerRow[],
): { count: string; cents: string; text: string } => {
  const sends = sendsOf(stored)
  const centsOf = (group: readonly StoredLedgerRow[]): number =>
    group.reduce((sum, row) => sum + row.usd_cents, 0)
  const inRufiyaa = sends.filter((row) => row.currency === 'MVR')
  const inDollars = sends.filter((row) => row.currency === 'USD')
  const laari = inRufiyaa.reduce((sum, row) => sum + row.amount_minor, 0)
  return {
    count: String(sends.length),
    cents: String(centsOf(sends)),
    text: [
      `Sent in MVR ${DOT} ${countLabel(inRufiyaa.length)} ${mvrFigure(laari)} ${twoDecimalFigure(centsOf(inRufiyaa))}`,
      `Sent in USD ${DOT} ${countLabel(inDollars.length)} ${twoDecimalFigure(centsOf(inDollars))}`,
      `Total Sent ${DOT} ${countLabel(sends.length)} ${twoDecimalFigure(centsOf(sends))}`,
    ].join(' '),
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
 * the text is not a figure of this app at all -- a figure in brackets among them, because
 * no figure of this list carries brackets any more.
 */
const minorUnitsStated = (drawn: string): number | null => {
  const bare = drawn
    .replace(/^\$/, '')
    .replace(/^MVR/, '')
    .replace(/,/g, '')
  if (!/^\d+(\.\d{2})?$/.test(bare)) return null
  const [whole, minor] = bare.split('.')
  return Number(whole) * 100 + Number(minor ?? '0')
}

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

const ACCOUNT_COLUMNS = { email: 'owner-columns-a@abbaas.test', password: 'columns-password-a1' } as const
const ACCOUNT_EMPTY = { email: 'owner-columns-b@abbaas.test', password: 'columns-password-b2' } as const
const ACCOUNT_METHODS = { email: 'owner-columns-c@abbaas.test', password: 'columns-password-c3' } as const
const ACCOUNT_ROUND_TRIP = { email: 'owner-columns-d@abbaas.test', password: 'columns-password-d4' } as const
const ACCOUNT_LONG_NAME = { email: 'owner-columns-e@abbaas.test', password: 'columns-password-e5' } as const
const ACCOUNT_WIDEST = { email: 'owner-columns-f@abbaas.test', password: 'columns-password-f5' } as const
const ACCOUNT_GENERATED = { email: 'owner-columns-g@abbaas.test', password: 'columns-password-g6' } as const
const ACCOUNT_OFFERED = { email: 'owner-columns-r@abbaas.test', password: 'columns-password-r7' } as const

const AHMED = 'Ahmed Shifaz'
const MARIYAM = 'Mariyam Nisha'
/** A name long enough to fill the party column, which is where it must give way. */
const LONG_NAME = 'Abdul Raheem Mohamed Ibrahim Didi'

/**
 * The six sends the brief words this list by, and one repayment so the card and the
 * paid-back list are not empty: a rufiyaa send at a whole rate, one with real laari, one
 * at a rate with a decimal, a whole dollar send, one with real cents, and a send stored
 * with no method at all.
 */
const SENDING_LEDGER: readonly EntrySeed[] = [
  {
    kind: 'send',
    currency: 'MVR',
    amountMinor: 1_000_000,
    rate: '20.0000',
    usdCents: 50_000,
    entryDate: '2026-09-14',
    savedAt: '2026-09-14T09:00:00Z',
    personName: MARIYAM,
    method: 'transfer',
  },
  {
    kind: 'send',
    currency: 'MVR',
    amountMinor: 1_000_050,
    rate: '20.0000',
    usdCents: 50_003,
    entryDate: '2026-09-18',
    savedAt: '2026-09-18T09:00:00Z',
    personName: AHMED,
    method: 'transfer',
  },
  {
    kind: 'send',
    currency: 'MVR',
    amountMinor: 1_000_000,
    rate: '15.4000',
    usdCents: 64_935,
    entryDate: '2026-09-22',
    savedAt: '2026-09-22T09:00:00Z',
    personName: AHMED,
    method: 'transfer',
  },
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 150_000,
    rate: null,
    usdCents: 150_000,
    entryDate: '2026-09-26',
    savedAt: '2026-09-26T09:00:00Z',
    personName: MARIYAM,
    method: 'transfer',
  },
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 150_050,
    rate: null,
    usdCents: 150_050,
    entryDate: '2026-09-30',
    savedAt: '2026-09-30T09:00:00Z',
    personName: MARIYAM,
    method: 'transfer',
  },
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 72_000,
    rate: null,
    usdCents: 72_000,
    entryDate: '2026-10-04',
    savedAt: '2026-10-04T09:00:00Z',
    personName: AHMED,
    method: null,
  },
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
 * What those six sends read, stated as constants so a wrong derivation above cannot pass
 * unnoticed: a rufiyaa figure with its prefix and its inline rate and the stored dollars
 * with no brackets, or a marked dollar figure and the placeholder, with the stored method
 * alone under the person. A null rufiyaa figure means the placeholder stands in its place.
 */
const SENDING_LEDGER_READS: readonly ExpectedRow[] = [
  { place: '1', date: '14 Sep', person: MARIYAM, sub: 'Transfer', mvr: 'MVR10,000', rate: '@20', usd: '$500', rufiyaa: true },
  { place: '2', date: '18 Sep', person: AHMED, sub: 'Transfer', mvr: 'MVR10,000.50', rate: '@20', usd: '$500.03', rufiyaa: true },
  { place: '3', date: '22 Sep', person: AHMED, sub: 'Transfer', mvr: 'MVR10,000', rate: '@15.4', usd: '$649.35', rufiyaa: true },
  { place: '4', date: '26 Sep', person: MARIYAM, sub: 'Transfer', mvr: null, rate: null, usd: '$1,500', rufiyaa: false },
  { place: '5', date: '30 Sep', person: MARIYAM, sub: 'Transfer', mvr: null, rate: null, usd: '$1,500.50', rufiyaa: false },
  { place: '6', date: '4 Oct', person: AHMED, sub: null, mvr: null, rate: null, usd: '$720', rufiyaa: false },
]

/** Three sends whose only difference is how the money changed hands. */
const METHOD_LEDGER: readonly EntrySeed[] = [
  {
    kind: 'send',
    currency: 'MVR',
    amountMinor: 500_000,
    rate: '18.0000',
    usdCents: 27_778,
    entryDate: '2026-08-03',
    savedAt: '2026-08-03T09:00:00Z',
    personName: AHMED,
    method: 'cash',
  },
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 45_000,
    rate: null,
    usdCents: 45_000,
    entryDate: '2026-08-07',
    savedAt: '2026-08-07T09:00:00Z',
    personName: MARIYAM,
    method: 'cheque',
  },
  {
    kind: 'send',
    currency: 'MVR',
    amountMinor: 123_400,
    rate: '17.5000',
    usdCents: 7_051,
    entryDate: '2026-08-11',
    savedAt: '2026-08-11T09:00:00Z',
    personName: AHMED,
    method: null,
  },
]

/** A rufiyaa send with real laari at a four-decimal rate, and a dollar send with real cents. */
const ROUND_TRIP_LEDGER: readonly EntrySeed[] = [
  {
    kind: 'send',
    currency: 'MVR',
    amountMinor: 2_345_678,
    rate: '13.7519',
    usdCents: 170_567,
    entryDate: '2026-07-06',
    savedAt: '2026-07-06T09:00:00Z',
    personName: AHMED,
    method: 'transfer',
  },
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 98_707,
    rate: null,
    usdCents: 98_707,
    entryDate: '2026-07-09',
    savedAt: '2026-07-09T09:00:00Z',
    personName: MARIYAM,
    method: 'cheque',
  },
]

/** Two sends to a name long enough to fill the party column, one at a four-decimal rate. */
const LONG_NAME_LEDGER: readonly EntrySeed[] = [
  {
    kind: 'send',
    currency: 'MVR',
    amountMinor: 999_999,
    rate: '19.2583',
    usdCents: 51_923,
    entryDate: '2026-06-02',
    savedAt: '2026-06-02T09:00:00Z',
    personName: LONG_NAME,
    method: 'transfer',
  },
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 1_234_567,
    rate: null,
    usdCents: 1_234_567,
    entryDate: '2026-06-06',
    savedAt: '2026-06-06T09:00:00Z',
    personName: LONG_NAME,
    method: 'transfer',
  },
]

/**
 * The widest rufiyaa send the owner can make: five digits at a two-character rate, which
 * is the longest reading the MVR column ever has to hold. Its stored dollars are what that
 * send came to.
 */
const WIDEST_LEDGER: readonly EntrySeed[] = [
  {
    kind: 'send',
    currency: 'MVR',
    amountMinor: 9_999_900,
    rate: '20.0000',
    usdCents: 500_000,
    entryDate: '2026-05-12',
    savedAt: '2026-05-12T09:00:00Z',
    personName: AHMED,
    method: 'transfer',
  },
]

let stack: Stack
let served: ServedOrigin
let columns: Account
let empty: Account
let methods: Account
let roundTrip: Account
let longName: Account
let widest: Account
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

  columns = await createAccount(stack, ACCOUNT_COLUMNS)
  await replaceEntries(stack, columns, SENDING_LEDGER, await seedPeopleByName(stack, columns, [AHMED, MARIYAM]))

  empty = await createAccount(stack, ACCOUNT_EMPTY)

  methods = await createAccount(stack, ACCOUNT_METHODS)
  await replaceEntries(stack, methods, METHOD_LEDGER, await seedPeopleByName(stack, methods, [AHMED, MARIYAM]))

  roundTrip = await createAccount(stack, ACCOUNT_ROUND_TRIP)
  await replaceEntries(
    stack,
    roundTrip,
    ROUND_TRIP_LEDGER,
    await seedPeopleByName(stack, roundTrip, [AHMED, MARIYAM]),
  )

  longName = await createAccount(stack, ACCOUNT_LONG_NAME)
  await replaceEntries(stack, longName, LONG_NAME_LEDGER, await seedPeopleByName(stack, longName, [LONG_NAME]))

  widest = await createAccount(stack, ACCOUNT_WIDEST)
  await replaceEntries(stack, widest, WIDEST_LEDGER, await seedPeopleByName(stack, widest, [AHMED]))

  generated = await createAccount(stack, ACCOUNT_GENERATED)
  generatedPeople = await seedPeopleByName(stack, generated, [AHMED, MARIYAM])

  offered = await createAccount(stack, ACCOUNT_OFFERED)
  await seedPeopleByName(stack, offered, [MARIYAM])
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
    'WHAT: the sign-in screen never appeared. WHY: every reading of the sending list starts from a signed-in owner. HOW: serve the built bundle and let it mount its sign-in screen.',
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

const whenTheOwnerTapsStatement = async (page: Page): Promise<void> => {
  await expect(
    statementTab(page),
    'WHAT: there is no Statement tab to tap on the bottom bar. WHY: a tap on that tab is the only way into the Statement, so without it the sending list is unreachable. HOW: draw the bottom bar with its Entries and Statement tabs.',
  ).toBeVisible()
  await statementTab(page).click()
  await expect(
    statement(page),
    'WHAT: tapping Statement showed no statement screen. WHY: the tap is what brings the sending list into the viewport. HOW: show the pane whose screen carries data-screen=statement.',
  ).toBeVisible()
  await thenEveryPartHasComeToRest(page)
}

const whenTheOwnerTapsThePaidBackList = async (page: Page): Promise<void> => {
  const tab = page.getByRole('tab', { name: 'Paid back by Abbaas' })
  await expect(
    tab,
    'WHAT: there is no tab named Paid back by Abbaas to tap. WHY: the pill is how the owner moves to what Abbaas paid back, and this value leaves that list as it is. HOW: keep both tabs of the pill.',
  ).toBeVisible()
  await tab.click()
  await expect(
    statement(page),
    'WHAT: the screen does not say it is showing the paid-back list after the tap. WHY: which list is shown is one attribute, which this value does not touch. HOW: write data-statement-shown=back on the tap.',
  ).toHaveAttribute('data-statement-shown', 'back')
  await thenEveryPartHasComeToRest(page)
}

/**
 * Reads the sending list in one pass: its column header, every row across its cells with
 * the two currency readings, the footer, the card above it and whatever on the screen
 * could record money. Answers even when the screen is not there at all.
 */
const readSendingList = (page: Page): Promise<SendingListReading> =>
  page.evaluate((): SendingListReading => {
    const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()
    /** The box of an element's own text, which is what the owner actually sees. */
    const textBox = (element: Element): DOMRect => {
      const range = document.createRange()
      range.selectNodeContents(element)
      const box = range.getBoundingClientRect()
      return box.width === 0 && box.height === 0 ? element.getBoundingClientRect() : box
    }
    const drawnOf = (element: Element | null): Drawn | null => {
      if (element === null) return null
      const text = textBox(element)
      return {
        text: squash(element.textContent),
        left: text.left,
        right: text.right,
        top: text.top,
        bottom: text.bottom,
      }
    }
    /**
     * The innermost reading inside a cell that is none of the readings already found: a
     * box drawn around the pair is passed over, so the figure itself is read and not its
     * wrapper.
     */
    const readingInside = (cell: Element, found: ReadonlyArray<Element | null>): Element | null => {
      const named = found.filter((part): part is Element => part !== null)
      const candidates = Array.from(cell.querySelectorAll('*')).filter(
        (part) =>
          squash(part.textContent) !== '' &&
          !named.includes(part) &&
          named.every((other) => !part.contains(other)),
      )
      return candidates[candidates.length - 1] ?? null
    }

    const noMvr: MvrCellReading = {
      found: false,
      text: '',
      figure: null,
      rate: null,
      placeholder: null,
      rateFollowsTheFigure: false,
      runsOverTheColumn: 0,
    }
    const noUsd: UsdCellReading = { found: false, text: '', figure: null, converted: null }
    const noHead: HeadReading = {
      found: false,
      words: [],
      columns: [],
      cells: [],
      overTheRowCells: false,
    }
    const screen = document.querySelector('[data-screen="statement"]')
    if (!screen) {
      return {
        present: false,
        shown: null,
        name: null,
        head: noHead,
        rows: [],
        foot: null,
        card: [],
        writingControls: 0,
        alerts: document.querySelectorAll('[data-pane="statement"] [role="alert"]').length,
      }
    }
    const panel = screen.querySelector('[data-statement-list="sent"]')
    const headElement = screen.querySelector('[data-statement-head="sent"]')
    const rowElements = Array.from(screen.querySelectorAll('[data-statement-list="sent"] [data-statement-row]'))

    const rows: SentRowReading[] = rowElements.map((row) => {
      const cells = Array.from(row.children)
      const mvrCell = row.querySelector('[data-statement-mvr]')
      const usdCell = row.querySelector('[data-statement-usd]')
      const rateElement = mvrCell === null ? null : mvrCell.querySelector('[data-statement-rate]')
      const placeholderElement =
        mvrCell === null ? null : mvrCell.querySelector('[data-statement-placeholder]')
      const figureElement = mvrCell === null ? null : readingInside(mvrCell, [rateElement, placeholderElement])
      const figure = drawnOf(figureElement)
      const rate = drawnOf(rateElement)
      const placeholder = drawnOf(placeholderElement)
      const usdFigureElement = usdCell === null ? null : (readingInside(usdCell, []) ?? usdCell)
      const leftmostReading = [figure, rate, placeholder]
        .filter((part): part is Drawn => part !== null)
        .map((part) => part.left)
      const runsOverTheColumn =
        mvrCell === null || leftmostReading.length === 0
          ? 0
          : mvrCell.getBoundingClientRect().left - Math.min(...leftmostReading)
      const sub = row.querySelector('[data-statement-sub]')
      const person = row.querySelector('[data-person]')
      return {
        id: row.getAttribute('data-statement-row') ?? '',
        place: row.getAttribute('data-no') ?? '',
        cells: cells.length,
        date: squash(cells[0]?.textContent),
        person: squash(person?.textContent),
        sub: sub === null ? null : squash(sub.textContent),
        mvr:
          mvrCell === null
            ? noMvr
            : {
                found: true,
                // Not squashed: whether a space stands between the figure and the rate is
                // itself one of the readings this oracle takes.
                text: (mvrCell.textContent ?? '').trim(),
                figure,
                rate,
                placeholder,
                rateFollowsTheFigure:
                  rate === null ||
                  figure === null ||
                  (rate.left >= figure.right - 1 && rate.top < figure.bottom && figure.top < rate.bottom),
                runsOverTheColumn,
              },
        usd:
          usdCell === null
            ? noUsd
            : {
                found: true,
                text: squash(usdCell.textContent),
                figure: drawnOf(usdFigureElement),
                converted: usdCell.getAttribute('data-converted'),
              },
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
        cells: headCells
          .map((cell) => drawnOf(cell))
          .filter((cell): cell is Drawn => cell !== null),
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

    const footElement = screen.querySelector('[data-statement-foot="sent"]')
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
      card: Array.from(screen.querySelectorAll('[data-statement-total]')).map((figure) => ({
        which: figure.getAttribute('data-statement-total') ?? '',
        cents: figure.getAttribute('data-cents'),
        text: squash(figure.textContent),
      })),
      writingControls: writing,
      alerts: document.querySelectorAll('[data-pane="statement"] [role="alert"]').length,
    }
  })

/** Reads a list this value does not change, cell by cell, to prove it still reads as before. */
const readPlainList = (page: Page, which: 'sent' | 'back'): Promise<PlainListReading> =>
  page.evaluate((list): PlainListReading => {
    const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()
    const screen = document.querySelector('[data-screen="statement"]')
    if (!screen) return { words: [], places: [], figures: [], foot: null }
    const rows = Array.from(screen.querySelectorAll(`[data-statement-list="${list}"] [data-statement-row]`))
    const lastCellOf = (row: Element): Element => {
      const cells = Array.from(row.children)
      return cells[cells.length - 1] ?? row
    }
    const foot = screen.querySelector(`[data-statement-foot="${list}"]`)
    return {
      words: Array.from(screen.querySelectorAll(`[data-statement-head="${list}"] > *`)).map((cell) =>
        squash(cell.textContent),
      ),
      places: rows.map((row) => row.getAttribute('data-no') ?? ''),
      figures: rows.map((row) => squash(lastCellOf(row).textContent)),
      foot: foot === null ? null : squash(foot.textContent),
    }
  }, which)

// ===== The scenarios =====

test('the sending list tells a rufiyaa send from a dollar send at a glance', async ({ page }) => {
  // Given the owner has sent money in rufiyaa and in dollars this month
  const stored = await readStoredLedger(stack, columns)
  expect(
    expectedRows(stored),
    'WHAT: the ledger seeded for this reading is not the one the brief words this list by. WHY: the readings below are stated as constants so a wrong derivation in this oracle cannot pass unnoticed. HOW: seed the six sends the brief names, oldest first.',
  ).toEqual(SENDING_LEDGER_READS)
  await givenTheOwnerIsSignedIn(page, columns)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the four column words stand over the four cells of every row
  const reading = await readSendingList(page)
  expect(
    [reading.present, reading.shown, reading.name],
    'WHAT: the sending list is not the list the Statement opens on. WHY: the owner opens this screen to read what they sent. HOW: show the panel named Sent for Abbaas when the Statement is built.',
  ).toEqual([true, 'sent', 'Sent for Abbaas'])
  expect(
    reading.head.words,
    'WHAT: the column header does not read Date, Paid to, MVR and USD. WHY: those four words are what make the cells of a row readable, and a No. column would promise a number this list no longer draws. HOW: head the sending list with those four words in that order.',
  ).toEqual(['Date', 'Paid to', 'MVR', 'USD'])
  expect(
    reading.head.columns,
    'WHAT: the header cells do not name their own columns. WHY: a reading of this list must find the date, the party and the two currency columns without reading styling. HOW: carry data-statement-column on each header cell.',
  ).toEqual(['date', 'party', 'mvr', 'usd'])
  expect(
    reading.head.overTheRowCells,
    'WHAT: a header word does not stand over the column it names. WHY: the owner reads a figure under the word that says which currency it is in. HOW: put the header and the rows on the same columns, so each header word sits over the cells of its own column.',
  ).toBe(true)
  // And every row reads its own currency in its own column, with no number drawn
  expect(
    [reading.rows.map((row) => row.place), reading.rows.map((row) => row.id)],
    'WHAT: the rows no longer say which place they hold or which entry they came from. WHY: the order is still read by its place and each row still names its own entry, even though no number is drawn. HOW: keep each row\'s place, numbered 1 upward oldest first, and its entry\'s own name.',
  ).toEqual([SENDING_LEDGER_READS.map((row) => row.place), sendsOf(stored).map((row) => row.id)])
  expect(
    reading.rows.map((row) => row.cells),
    'WHAT: a row still draws five cells. WHY: the No. column is gone, so a row reads its date, the person, its rufiyaa column and its dollar column and nothing else. HOW: draw four cells in each row.',
  ).toEqual(SENDING_LEDGER_READS.map(() => 4))
  expect(
    reading.rows.map((row) => [row.date, row.person, row.sub]),
    'WHAT: a row does not open with its own date, the person paid and the stored method alone. WHY: a number before the date promises a column that is gone, and a rufiyaa figure or a rate under the person states money in the wrong place. HOW: open the row with the date and word the line under the person from the stored method alone, with no line at all where no method is stored.',
  ).toEqual(SENDING_LEDGER_READS.map((row) => [row.date, row.person, row.sub]))
  expect(
    reading.rows.map((row) => [
      row.mvr.figure?.text ?? null,
      row.mvr.rate?.text ?? null,
      row.mvr.placeholder?.text ?? null,
    ]),
    "WHAT: the MVR column does not read a rufiyaa send's marked figure with its inline rate, and the placeholder on a dollar send. WHY: this column is where the owner sees what was actually sent in rufiyaa: a converted figure here, or an empty cell, hides the currency the money left in. HOW: draw the stored laari as a marked rufiyaa figure with its rate behind an '@', and the em dash where there is no rufiyaa figure.",
  ).toEqual(
    SENDING_LEDGER_READS.map((row) => [row.mvr, row.rate, row.mvr === null ? EM_DASH : null]),
  )
  expect(
    reading.rows.map((row) => row.usd.text),
    "WHAT: the USD column does not read a dollar send's marked figure and a rufiyaa send's stored dollars, with no brackets round either. WHY: the dollars of a rufiyaa send are the dollars its entry stores: converting its rufiyaa figure a second time moves the owner's money by the rounding, and brackets round a figure read as money the owner is not sure of. HOW: mark a dollar figure, drop a trailing '.00', keep real cents, and read the stored dollars of a rufiyaa send the same way, with no brackets.",
  ).toEqual(SENDING_LEDGER_READS.map((row) => row.usd))
  expect(
    reading.rows.map((row) => [/\/-/.test(row.mvr.text), /[()]/.test(`${row.mvr.text}${row.usd.text}`)]),
    "WHAT: a row still draws the old trailing rufiyaa mark, or a figure in brackets. WHY: the owner reads 'MVR10,000' and '$500': a mark after the figure and brackets round a dollar value are the two readings this list must no longer draw anywhere in either column. HOW: put the prefix 'MVR' before a rufiyaa figure and draw a converted dollar value bare.",
  ).toEqual(SENDING_LEDGER_READS.map(() => [false, false]))

  // And the figure and its rate read as one line, with no space typed between them
  expect(
    reading.rows.map((row) => row.mvr.rateFollowsTheFigure),
    'WHAT: the inline rate does not follow the rufiyaa figure on one line. WHY: a rate wrapped under its figure, or pushed away from it, reads as a second amount. HOW: append the rate after the figure on the same line.',
  ).toEqual(SENDING_LEDGER_READS.map(() => true))
  expect(
    reading.rows.map((row) => /\s@/.test(row.mvr.text)),
    'WHAT: a space stands between the rufiyaa figure and its rate. WHY: the gap the owner sees is drawn, not typed: a typed space reads differently wherever this cell is read as text. HOW: append the two readings with no whitespace between them.',
  ).toEqual(SENDING_LEDGER_READS.map(() => false))

  // And a reading can tell the two kinds of USD cell apart without reading the figure
  const marks = reading.rows.map((row) => row.usd.converted)
  const rufiyaaMark = marks[0]
  expect(
    [typeof rufiyaaMark, rufiyaaMark === marks[3]],
    'WHAT: the USD cell of a rufiyaa send and of a dollar send say the same thing about what they read. WHY: the two readings are worded alike now, so a reader must be able to tell a converted figure from money that left in dollars without parsing the text. HOW: say on each USD cell whether it reads a converted figure, differently for the two kinds.',
  ).toEqual(['string', false])
  expect(
    [marks.filter((mark) => mark === rufiyaaMark).length, reading.rows.length],
    'WHAT: the rows that say they read a converted figure are not exactly the rufiyaa sends of this list. WHY: every send is of one of the two kinds and of only one, so the two groups must add back up to the whole list. HOW: set that mark from the row\'s own currency.',
  ).toEqual([SENDING_LEDGER_READS.filter((row) => row.rufiyaa).length, SENDING_LEDGER_READS.length])

  // And the read-only screen is as it was, under the split footer
  expect(
    reading.foot,
    "WHAT: the footer no longer reads its three lines — 'Sent in MVR' with the rufiyaa subtotal and its dollar value, 'Sent in USD', and 'Total Sent' — each with its own count, while the block itself still carries the total's count and cents. WHY: the footer is the owner's check that the list and the card agree, and a split list is only checkable against a footer that splits the same way. HOW: draw all three lines at every ledger, count and sum each from the stored currency of the sends, and keep the block's own hooks reading the total line.",
  ).toEqual(expectedFoot(stored))
  expect(
    reading.writingControls,
    'WHAT: the Statement offers something that records money. WHY: this screen only reports: a box or a Send or Receive control there would let the owner write from a screen that cannot. HOW: draw no data-box, no data-action and no such control on this screen.',
  ).toBe(0)
})

test('the column words stand over the list even when nothing has been sent', async ({ page }) => {
  // Given an owner who has recorded nothing at all
  await givenTheOwnerIsSignedIn(page, empty)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the same four words head an empty list as they are over rows
  const reading = await readSendingList(page)
  expect(
    [reading.head.words, reading.rows.length],
    'WHAT: an empty sending list has no column header, or lists a row. WHY: the owner must be told what this list would hold before they have sent anything, and a row they never recorded is a lie about their money. HOW: draw the header at every ledger length, and a row for each stored send only.',
  ).toEqual([['Date', 'Paid to', 'MVR', 'USD'], 0])
  expect(
    reading.alerts,
    'WHAT: an empty ledger is reported as a failed read. WHY: an empty ledger and a read that failed must never look alike. HOW: speak an alert only when the read itself failed.',
  ).toBe(0)
})

test('the line under a person names how the money changed hands and nothing else', async ({ page }) => {
  // Given three sends that differ only in how the money changed hands
  const stored = await readStoredLedger(stack, methods)
  expect(
    expectedRows(stored).map((row) => row.sub),
    "WHAT: the three seeded sends are not one paid in cash, one by cheque and one stored with no method. WHY: those are the readings a stored method has, and this scenario is the one that exhausts them. HOW: seed exactly those three sends, oldest first.",
  ).toEqual(['Cash', 'Cheque', null])
  await givenTheOwnerIsSignedIn(page, methods)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then each line reads its own stored word, and the send stored with none has no line
  const reading = await readSendingList(page)
  expect(
    reading.rows.map((row) => row.sub),
    "WHAT: the three sends do not read 'Cash', 'Cheque' and no line at all. WHY: a word nobody recorded invents how the money changed hands, and a missing word hides it. HOW: word the line from the stored method, and draw no line where nothing is stored.",
  ).toEqual(['Cash', 'Cheque', null])
  expect(
    reading.rows.map((row) => /MVR|@/.test(row.sub ?? '')),
    'WHAT: a line under a person still carries a rufiyaa figure or a rate. WHY: the rufiyaa figure and its rate now read in the MVR column: left under the person as well they would state the same money twice. HOW: word the line from the stored method alone.',
  ).toEqual([false, false, false])
  expect(
    reading.rows.map((row) => [row.mvr.figure?.text ?? row.mvr.placeholder?.text ?? null, row.usd.text]),
    'WHAT: the two currency columns do not read these three sends as they are stored. WHY: narrowing the line under the person must not change what the columns say about the money. HOW: read the MVR and USD cells from the stored row.',
  ).toEqual(expectedRows(stored).map((row) => [row.mvr ?? EM_DASH, row.usd]))
})

test('every stored send reads its own currency in its own column', async ({ page }) => {
  // Arrange a spread of ledgers from a fixed seed, including the readings that must be there
  const ledgers = generatedLedgers()
  await givenTheOwnerIsSignedIn(page, generated)

  // Act: read each ledger through its own page load, keeping the first that disagrees
  const failing = await firstFailing(page, ledgers, judgeTheCurrencyColumns)

  // Assert: nothing disagreed; a failing ledger is reported at its smallest
  expect(
    await reportOf(page, failing, judgeTheCurrencyColumns),
    "WHAT: a generated ledger was not read as its stored rows mean it. WHY: this is the law that makes the two columns true of every ledger and not only of the seeded one: a rufiyaa send reads its own marked laari figure, its stored rate and its stored dollars with no brackets, a dollar send reads its marked dollar figure and the placeholder, and neither ever reads the other's shape. HOW: read the failing ledger printed above, which is the smallest one that still disagrees.",
  ).toBe('')
})

test('no drawn figure moves the money the ledger stores', async ({ page }) => {
  // Arrange the same spread of ledgers, read for what each figure states and not for its text
  const ledgers = generatedLedgers()
  await givenTheOwnerIsSignedIn(page, generated)

  // Act: read each ledger through its own page load, keeping the first that disagrees
  const failing = await firstFailing(page, ledgers, judgeNothingIsRounded)

  // Assert: every drawn figure states exactly the minor units it was seeded from
  expect(
    await reportOf(page, failing, judgeNothingIsRounded),
    "WHAT: a drawn figure states a different amount from the laari or the cents the ledger stores. WHY: a figure worded by a formatter with fewer decimals reads money the owner does not hold, and this list is what they check their money against. HOW: read the failing ledger printed above: every figure must state its own stored minor units, dropping only a trailing '.00'.",
  ).toBe('')
})

test('a long name gives way before the figures do', async ({ page }) => {
  // Given two sends to a name long enough to fill the party column, one at a four-decimal rate
  const stored = await readStoredLedger(stack, longName)
  await givenTheOwnerIsSignedIn(page, longName)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then both currency readings stay whole on one line
  const reading = await readSendingList(page)
  const expected = expectedRows(stored)
  expect(
    reading.rows.map((row) => [
      row.mvr.figure?.text ?? row.mvr.placeholder?.text ?? null,
      row.mvr.rate?.text ?? null,
      row.usd.text,
    ]),
    'WHAT: a long name left a currency reading short of what the ledger stores. WHY: the name is the one reading that may give way: the money and the rate it was sent at must stay whole however long the name is. HOW: let the party column take what is left and keep both currency cells at their own widths.',
  ).toEqual(expected.map((row) => [row.mvr ?? EM_DASH, row.rate, row.usd]))
  expect(
    reading.rows.map((row) => row.mvr.rateFollowsTheFigure),
    'WHAT: a four-decimal rate wrapped away from the figure it belongs to. WHY: a rate on a line of its own reads as a second amount, which is money the owner never sent. HOW: keep the figure and its rate on one line in a cell wide enough for the widest rate the ledger stores.',
  ).toEqual(expected.map(() => true))
  expect(
    reading.rows.map((row) => row.person),
    'WHAT: the row does not name the person the money went to. WHY: a clipped name is a degradation the owner accepts; a missing name is not. HOW: draw the stored name in the party column.',
  ).toEqual(expected.map((row) => row.person))
})


test('the widest rufiyaa send the owner can make still reads on one line', async ({ page }) => {
  // Given the ledger holds the largest rufiyaa send the owner ever makes
  const stored = await readStoredLedger(stack, widest)
  expect(
    expectedRows(stored).map((row) => [row.mvr, row.rate]),
    "WHAT: the ledger seeded for this reading is not the widest rufiyaa cell the owner can send. WHY: this reading exists for that one cell, five digits at a two-character rate, which is the longest the MVR column ever has to hold: a narrower send would not test the column at all. HOW: seed a send of 99,999 rufiyaa at the rate 20.",
  ).toEqual([['MVR99,999', '@20']])
  await givenTheOwnerIsSignedIn(page, widest)

  // When the owner taps the Statement tab on the phone's own width
  await whenTheOwnerTapsStatement(page)

  // Then that cell reads whole, on one line, inside its own column
  const reading = await readSendingList(page)
  const row = reading.rows[0]
  expect(
    row?.mvr.rateFollowsTheFigure,
    'WHAT: the widest rufiyaa cell wrapped its rate under its figure. WHY: a rate on a line of its own reads as a second amount, which is money the owner never sent. HOW: keep the figure and its rate on one line at the phone\'s width.',
  ).toBe(true)
  expect(
    row?.mvr.runsOverTheColumn ?? Number.POSITIVE_INFINITY,
    'WHAT: the widest rufiyaa cell runs out of its own column. WHY: this is the cell the column is sized for: a reading pushed out of it runs over the name beside it, where the owner reads two things at once. HOW: give the MVR column the width this pair needs at the phone\'s width.',
  ).toBeLessThanOrEqual(0)
  expect(
    [row?.mvr.figure?.text ?? null, row?.mvr.rate?.text ?? null],
    "WHAT: the widest rufiyaa cell does not read 'MVR99,999' with '@20' beside it. WHY: it is the largest send the owner makes, so a digit dropped or a rate lost here hides the amount they are most likely to be checking. HOW: word the figure from the stored laari and the rate from the stored decimals, however wide the pair comes out.",
  ).toEqual(['MVR99,999', '@20'])
  expect(
    [row?.date ?? null, row?.usd.text ?? null],
    'WHAT: the date or the dollar column gave up its own reading to make room for the widest rufiyaa cell. WHY: the party column is the one reading allowed to give way: a date or a dollar figure that moves instead reads as a different row. HOW: let the party column alone take what is left.',
  ).toEqual([expectedRows(stored)[0]?.date, expectedRows(stored)[0]?.usd])
})

test('real laari, real cents and a four-decimal rate survive the way to the screen', async ({ page }) => {
  // Arrange: two sends stored through the real stack, read back outside the browser
  const stored = await readStoredLedger(stack, roundTrip)
  const rufiyaa = stored.find((row) => row.currency === 'MVR')
  const dollars = stored.find((row) => row.currency === 'USD')
  expect(
    [rufiyaa?.amount_minor, rufiyaa?.rate, rufiyaa?.usd_cents, dollars?.usd_cents],
    'WHAT: the stack did not keep the laari, the rate decimals and the cents these two sends were stored with. WHY: the contract under test is what the stored columns still hold when the screen reads them back. HOW: keep the laari whole, the rate to its four decimals and the cents exact.',
  ).toEqual([2_345_678, '13.7519', 170_567, 98_707])
  await givenTheOwnerIsSignedIn(page, roundTrip)

  // Act: read those same two rows on the screen
  await whenTheOwnerTapsStatement(page)

  // Assert: every drawn reading is what the stored values mean, with nothing lost on the way
  const reading = await readSendingList(page)
  const rufiyaaRow = reading.rows.find((row) => row.mvr.rate !== null)
  const dollarRow = reading.rows.find((row) => row.mvr.placeholder !== null)
  expect(
    [rufiyaaRow?.mvr.figure?.text, rufiyaaRow?.mvr.rate?.text, rufiyaaRow?.usd.text],
    'WHAT: the rufiyaa send does not read the laari and the rate decimals the ledger stores. WHY: a lost laari or a rounded rate states a send the owner never made. HOW: word the figure from the stored laari and the rate from the stored decimals, with no padding and no rounding.',
  ).toEqual([
    mvrFigure(rufiyaa?.amount_minor ?? -1),
    inlineRate(rufiyaa?.rate ?? ''),
    convertedFigure(rufiyaa?.usd_cents ?? -1),
  ])
  expect(
    dollarRow?.usd.text,
    'WHAT: the dollar send does not read the cents the ledger stores. WHY: real cents dropped from a figure understate what the owner sent. HOW: keep the stored cents in the figure, and drop only a trailing pair of zeros.',
  ).toBe(usdFigure(dollars?.usd_cents ?? -1))
  expect(
    [minorUnitsStated(rufiyaaRow?.mvr.figure?.text ?? ''), minorUnitsStated(dollarRow?.usd.text ?? '')],
    'WHAT: a drawn figure does not state the whole minor units it was stored as. WHY: this is the round trip the owner trusts: what the stack keeps is what the screen says. HOW: draw the stored minor units, grouped and marked, and nothing else.',
  ).toEqual([rufiyaa?.amount_minor, dollars?.usd_cents])
})

test('the ledger keeps no send this list could not state honestly', async () => {
  // Arrange: the readings a stored send must carry before any screen can state it
  const wellFormed = {
    kind: 'send',
    currency: 'MVR',
    amount_minor: 1_000_050,
    rate: '15.4257',
    usd_cents: 64_935,
    entry_date: '2026-05-04',
    person_name: MARIYAM,
    method: 'transfer',
  }

  // Act: offer the ledger a send with no dollars, a rufiyaa send with no rate, a method this
  // app cannot name, and the same send well formed
  const noDollars = await offerStoredRow(stack, offered, {
    ...wellFormed,
    currency: 'USD',
    rate: null,
    amount_minor: 150_000,
    usd_cents: 0,
  })
  const noRate = await offerStoredRow(stack, offered, { ...wellFormed, rate: null })
  const unknownMethod = await offerStoredRow(stack, offered, {
    ...wellFormed,
    currency: 'USD',
    rate: null,
    method: 'venmo',
  })
  const kept = await offerStoredRow(stack, offered, wellFormed)

  // Assert: the three are refused where they are written, and the well-formed one is kept
  expect(
    noDollars,
    "WHAT: the ledger kept a send with no dollars at all. WHY: the USD column must always read an amount: a send with nothing in it would leave that cell blank or read '$0' for money that was never sent. HOW: hold a dollar amount on every stored send.",
  ).not.toBeNull()
  expect(
    noRate,
    'WHAT: the ledger kept a rufiyaa send with no rate. WHY: the MVR column reads the rate the rufiyaa was sent at: with none stored, that cell could only read an invented rate or the word nothing. HOW: hold a rate on every rufiyaa send, and on no other.',
  ).not.toBeNull()
  expect(
    unknownMethod,
    'WHAT: the ledger kept a method this app cannot name. WHY: the line under the person would then be absent, which the owner cannot tell from a send stored before methods were ever asked for. HOW: hold one of the three known words, or nothing, on a stored send.',
  ).not.toBeNull()
  expect(
    kept,
    'WHAT: the ledger refused a rufiyaa send with its laari, its four-decimal rate, its dollars and its method. WHY: that is the very send this list must read back, so a refusal here would leave nothing to observe at all. HOW: keep a well-formed send as it is written.',
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
  await givenTheOwnerIsSignedIn(page, columns)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the screen speaks the message the read gave it, and draws no column and no figure
  await expect(
    statementPane(page).getByRole('alert'),
    'WHAT: the Statement does not speak one alert after a failed read. WHY: the owner must be told the ledger could not be read, not shown a list with nothing in it. HOW: speak the message the read answers with, and draw no list.',
  ).toHaveText(UNREADABLE)
  const reading = await readSendingList(page)
  expect(
    [reading.head.found, reading.head.words.length, reading.rows.length, reading.foot, reading.card.length],
    'WHAT: a failed read still drew the column words, a row, a footer or a figure. WHY: four empty columns read as a month in which nothing was sent, which is a different and false statement. HOW: draw the alert alone when the read failed.',
  ).toEqual([false, 0, 0, null, 0])
})

test('the screen draws the currency readings without wording any money itself', async () => {
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
  const scales = code
    .split('\n')
    .map((line, index) => `${index + 1}: ${line.trim()}`)
    .filter((line) => /[*/%]/.test(line.slice(line.indexOf(':') + 1)))
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

  // Assert: the money is worded in one place, and the screen only draws it
  expect(
    screenSource === null ? 'missing' : 'present',
    "WHAT: there is no module owning the statement's screen. WHY: the two currency columns are drawn by one function from the read ledger to DOM, which decides nothing about money itself. HOW: own that screen in the statement's own screen module.",
  ).toBe('present')
  expect(
    marks,
    'WHAT: the screen writes a currency mark of its own. WHY: one place must word every figure, or a row, a card and a footer can mark or group the same money differently. HOW: take each marked figure from the module that owns what a row reads.',
  ).toEqual([])
  expect(
    wordsMoneyItself,
    'WHAT: the screen formats a number itself. WHY: a second formatter is a second rounding, and the owner would read two different amounts for one send. HOW: draw the text the meaning module has already worded.',
  ).toBe(false)
  expect(
    scales,
    'WHAT: the screen multiplies or divides something. WHY: scaling a stored amount on the screen is how a rufiyaa figure is converted a second time and the owner loses the rounding. HOW: leave every amount exactly as it arrives.',
  ).toEqual([])
  expect(
    domainOffenders,
    'WHAT: a module that decides meaning names the document or an adapter. WHY: meaning that can touch the DOM or the database cannot be read, reused or trusted on its own. HOW: keep the meaning modules to values in and values out.',
  ).toEqual([])
  expect(
    classes,
    'WHAT: a statement module declares a class. WHY: this app is written as functions from values to values and from values to DOM, and a second style in one module makes the rule unreadable. HOW: add the new cells as functions.',
  ).toEqual([])
  expect(
    writesFromTheScreen,
    'WHAT: the statement screen names an operation that writes to the ledger. WHY: this screen only reports: a writing operation within its reach could change the money it is reporting. HOW: give the screen the read outcome and nothing that writes.',
  ).toEqual([])
})

test('the balance card above the list reads exactly as before', async ({ page }) => {
  // Given the owner is reading a month of sends and one repayment
  const stored = await readStoredLedger(stack, columns)
  await givenTheOwnerIsSignedIn(page, columns)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the balance card still reads its three two-decimal figures
  const reading = await readSendingList(page)
  expect(
    reading.card.map((figure) => [figure.which, figure.cents, figure.text]),
    'WHAT: the balance card no longer reads its three figures to two decimals. WHY: the card is the first thing the owner looks at and this value does not touch it: the row rule applied there would restate the whole screen. HOW: leave the card figures worded as they are today.',
  ).toEqual(expectedCard(stored).map((figure) => [figure.which, figure.cents, figure.text]))
})

test('the paid-back list reads its own three columns and its one-line footer', async ({ page }) => {
  // Given the owner is reading the Statement of a ledger with a repayment in it
  const stored = await readStoredLedger(stack, columns)
  await givenTheOwnerIsSignedIn(page, columns)
  await whenTheOwnerTapsStatement(page)

  // When the owner taps the paid-back list
  await whenTheOwnerTapsThePaidBackList(page)

  // Then it reads its own three columns and its marked figures, and the footer it keeps
  const back = await readPlainList(page, 'back')
  const repayments = repaymentsOf(stored)
  expect(
    back.words,
    'WHAT: the paid-back list no longer reads Date, Method and USD over its three columns. WHY: the owner reads one screen: a list still headed by a number column the rows no longer draw names the wrong cells. HOW: head this list with Date, Method and USD and nothing else.',
  ).toEqual(['Date', 'Method', 'USD'])
  expect(
    back.figures,
    'WHAT: a repayment does not read the dollars it stores with the dollar mark under the row rule. WHY: a figure with no mark reads as a bare number beside the marked figures of the other list, and the two lists report the same money. HOW: have the paid-back row read the marked whole reading of its stored dollars.',
  ).toEqual(repayments.map((row) => usdFigure(row.usd_cents)))
  expect(
    back.foot,
    'WHAT: the paid-back footer no longer reads its own total. WHY: this value leaves that list and its footer exactly as they are. HOW: keep its one line, its count and its two-decimal total.',
  ).toBe(
    `Total paid back ${DOT} ${countLabel(repayments.length)} ${twoDecimalFigure(
      repayments.reduce((sum, row) => sum + row.usd_cents, 0),
    )}`,
  )
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

const DATE_POOL = ['2026-01-05', '2026-03-17', '2026-07-01', '2026-09-14', '2026-12-28'] as const

/**
 * The shapes a stored send of this app can take, each one named so it is reached by
 * construction rather than hoped for: the rare readings -- real laari, a four-decimal
 * rate, a whole dollar amount, real cents -- are drawn on purpose.
 */
const SEND_SHAPES = [
  'rufiyaa, whole, at a whole rate',
  'rufiyaa, with laari, at a whole rate',
  'rufiyaa, at a four-decimal rate',
  'dollars, whole',
  'dollars, with cents',
] as const
type SendShape = (typeof SEND_SHAPES)[number]

/** How the money changed hands, as a stored send may hold it, nothing included. */
const STORED_METHODS = ['cash', 'cheque', 'transfer', null] as const

/**
 * One generated entry of the named shape. The dollars a rufiyaa send stores are drawn
 * unrelated to its own amount and rate, so a screen that converts the rufiyaa figure a
 * second time instead of reading the stored dollars is caught. A dollar send stores the
 * very amount it was made in, as this app writes it.
 */
const generatedEntry = (
  next: () => number,
  index: number,
  shape: SendShape,
  kind: 'send' | 'receive',
): EntrySeed => {
  const entryDate = DATE_POOL[Math.floor(next() * DATE_POOL.length)] ?? '2026-07-01'
  const method = STORED_METHODS[Math.floor(next() * STORED_METHODS.length)] ?? null
  const wholeUnits = 1 + Math.floor(next() * 200_000)
  const realMinor = 1 + Math.floor(next() * 99)
  const rufiyaa = shape.startsWith('rufiyaa')
  const whole = shape === 'rufiyaa, whole, at a whole rate' || shape === 'dollars, whole'
  const amountMinor = whole ? wholeUnits * 100 : wholeUnits * 100 + realMinor
  const fourDecimalRate = (): number => {
    const drawn = 1 + Math.floor(next() * 9_999_998)
    return drawn % 10 === 0 ? drawn + 1 : drawn
  }
  const scaled = shape === 'rufiyaa, at a four-decimal rate' ? fourDecimalRate() : (1 + Math.floor(next() * 40)) * 10_000
  return {
    kind,
    currency: rufiyaa ? 'MVR' : 'USD',
    amountMinor,
    rate: rufiyaa ? (scaled / 10_000).toFixed(4) : null,
    usdCents: rufiyaa ? 1 + Math.floor(next() * 900_000) : amountMinor,
    entryDate,
    savedAt: `${entryDate}T0${index % 10}:${String(index % 60).padStart(2, '0')}:00Z`,
    personName: kind === 'send' ? (next() < 0.5 ? AHMED : MARIYAM) : undefined,
    method,
  }
}

/** The ledgers this value is judged over, including the readings that must be there. */
const generatedLedgers = (): ReadonlyArray<{ label: string; entries: readonly EntrySeed[] }> => {
  const next = numbersFrom(GENERATOR_SEED)
  const drawn = (size: number): readonly EntrySeed[] =>
    Array.from({ length: size }, (_unused, index) => {
      const shape = SEND_SHAPES[Math.floor(next() * SEND_SHAPES.length)] ?? 'dollars, whole'
      // A quarter of the entries are repayments, which this list must leave out.
      return generatedEntry(next, index, shape, next() < 0.75 ? 'send' : 'receive')
    })

  return [
    { label: 'nothing recorded at all', entries: [] },
    {
      label: 'one send of every shape, and one stored with no method',
      entries: [
        ...SEND_SHAPES.map((shape, index) => generatedEntry(next, index, shape, 'send')),
        {
          ...generatedEntry(next, SEND_SHAPES.length, 'rufiyaa, with laari, at a whole rate', 'send'),
          method: null,
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

/** Stores one ledger, reads it through a page load, and hands the reading to a judge. */
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

/** Judges one reading against the stored rows: the two currency cells, row by row. */
const judgeTheCurrencyColumns: Judge = async (page: Page): Promise<readonly string[]> => {
  const stored = await readStoredLedger(stack, generated)
  const reading = await readSendingList(page)
  if (!reading.present) return ['there is no statement screen to read']
  const expected = expectedRows(stored)
  const reasons: string[] = []

  if (reading.rows.length !== expected.length) {
    reasons.push(
      `${reading.rows.length} rows are listed, out of ${stored.length} stored entries of which ${expected.length} are sends`,
    )
  }
  const drawn = reading.rows.map((row) => ({
    place: row.place,
    person: row.person,
    sub: row.sub,
    mvr: row.mvr.figure?.text ?? null,
    rate: row.mvr.rate?.text ?? null,
    placeholder: row.mvr.placeholder?.text ?? null,
    usd: row.usd.text,
  }))
  const meant = expected.map((row) => ({
    place: row.place,
    person: row.person,
    sub: row.sub,
    mvr: row.mvr,
    rate: row.rate,
    placeholder: row.mvr === null ? EM_DASH : null,
    usd: row.usd,
  }))
  if (JSON.stringify(drawn) !== JSON.stringify(meant)) {
    reasons.push(`rows read ${JSON.stringify(drawn)} not ${JSON.stringify(meant)}`)
  }
  // The mark on a USD cell must part the rows into the rufiyaa sends and the dollar sends,
  // with nothing left over and nothing in both.
  const marksOf = (rufiyaa: boolean): ReadonlySet<string | null> =>
    new Set(reading.rows.filter((_row, index) => expected[index]?.rufiyaa === rufiyaa).map((row) => row.usd.converted))
  const onRufiyaa = marksOf(true)
  const onDollars = marksOf(false)
  if (onRufiyaa.size > 1 || onDollars.size > 1) {
    reasons.push(
      `the mark on a USD cell is not one reading per kind: ${JSON.stringify([...onRufiyaa])} on rufiyaa sends and ${JSON.stringify([...onDollars])} on dollar sends`,
    )
  }
  const shared = [...onRufiyaa].filter((mark) => onDollars.has(mark))
  if (shared.length > 0) {
    reasons.push(`a rufiyaa send and a dollar send say the same ${JSON.stringify(shared)} about reading a converted figure`)
  }
  return reasons
}

/** Judges one reading for what each figure STATES: the minor units behind its own text. */
const judgeNothingIsRounded: Judge = async (page: Page): Promise<readonly string[]> => {
  const stored = await readStoredLedger(stack, generated)
  const reading = await readSendingList(page)
  if (!reading.present) return ['there is no statement screen to read']
  const reasons: string[] = []

  sendsOf(stored).forEach((row, index) => {
    const drawnRow = reading.rows[index]
    if (drawnRow === undefined) {
      reasons.push(`the send of ${row.entry_date} has no row of its own`)
      return
    }
    const dollarText = drawnRow.usd.text
    const statedDollars = minorUnitsStated(dollarText)
    if (statedDollars !== row.usd_cents) {
      reasons.push(`'${dollarText}' states ${String(statedDollars)} cents, stored ${row.usd_cents}`)
    }
    if ((row.usd_cents % 100 === 0) !== !dollarText.includes('.')) {
      reasons.push(
        `'${dollarText}' ${dollarText.includes('.') ? 'keeps' : 'drops'} its decimals on ${row.usd_cents} stored cents`,
      )
    }
    if (!dollarText.includes('$')) {
      reasons.push(`'${dollarText}' carries no dollar mark`)
    }
    if (row.currency !== 'MVR') return
    const rufiyaaText = drawnRow.mvr.figure?.text ?? ''
    const statedLaari = minorUnitsStated(rufiyaaText)
    if (statedLaari !== row.amount_minor) {
      reasons.push(`'${rufiyaaText}' states ${String(statedLaari)} laari, stored ${row.amount_minor}`)
    }
    if ((row.amount_minor % 100 === 0) !== !rufiyaaText.includes('.')) {
      reasons.push(
        `'${rufiyaaText}' ${rufiyaaText.includes('.') ? 'keeps' : 'drops'} its decimals on ${row.amount_minor} stored laari`,
      )
    }
    if (!rufiyaaText.startsWith('MVR')) {
      reasons.push(`'${rufiyaaText}' carries no rufiyaa mark`)
    }
    const rateText = drawnRow.mvr.rate?.text ?? ''
    if (row.rate !== null && rateText !== inlineRate(row.rate)) {
      reasons.push(`'${rateText}' is not the stored rate ${row.rate}`)
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
