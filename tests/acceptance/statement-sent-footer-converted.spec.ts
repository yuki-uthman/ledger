import { test, expect, type Locator, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
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
  readStoredLedger,
  replaceEntries,
  seedPeopleByName,
  type Account,
  type EntrySeed,
  type StoredLedgerRow,
} from '../support/accounts.js'

// What the owner reads here: under the sending list, the rufiyaa subtotal, and on the line
// UNDER it an arrow with the dollars those same rufiyaa were worth -- 'MVR14,000' and under
// it '→ $700.00'. The arrow is the screen's own mark beside the figure, never a word of the
// amount itself, and it stands at every ledger, the one holding nothing included, where that
// line reads 'MVR0' and the arrow with '$0.00'.
//
// Judged only through the declared public port: the BUILT bundle as Chrome loads it over the
// served loopback origin, at 360 by 780, with the local stack behind it. Nothing here imports
// a module of src/: the stimulus is stored rows, the reading is the mounted document, and
// every expected figure is derived in this file from what the ledger stores, so the oracle
// cannot echo back whatever the screen happens to draw. One reading is taken from a source
// file rather than the page -- the words the app stores for money, read as plain text out of
// their own string literals -- because a mark written into one of those words is exactly what
// no page reading can tell apart from a mark drawn beside it.
//
// Every figure, rate, date and name below is invented. This repository is public, and no
// figure of the owner's own ledger is written anywhere in it.
//
// How the arrangement is read: relationally and without a single length. The detail's box
// lying wholly below the subtotal's box inside the same line, no two leaf boxes of the footer
// overlapping, every leaf standing inside its own line's box and inside the viewport, and the
// three lines keeping the order they are drawn in, is the whole of what is asserted about the
// arrangement. Every size, gap, ink and weight of the mark and of its line is judged on the
// owner's phone and is asserted nowhere.
//
// How a figure is found: by what that figure SAYS it reads, never by its place among the
// leaves of its line. The mark is a leaf of its own with no figure in it, so the leaf after
// the subtotal is the mark and not the dollar total: a reading bound to the leaf order would
// read the mark as a figure.

const PASSWORD_FIELD = 'input[type="password"]'
const VIEWPORT = { width: 360, height: 780 } as const

/** The separator the board draws between a label and its count. */
const DOT = '·'
/** The screen's own mark before the converted total: a rightwards arrow, not a hyphen pair. */
const ARROW = '→'
/** The endpoint the bundle reads the ledger from, as the browser sees it. */
const ENTRIES_ENDPOINT = '**/rest/v1/entries**'
/** What a failed read says, as the port words it. */
const UNREADABLE = 'Could not load the ledger. Try again.'
/** The module that words the money of this screen, read as plain text for a written mark. */
const DOMAIN_STATEMENT_MODULE = path.join(repoRoot, 'src', 'domain', 'statement.ts')

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

/**
 * What a footer figure can say it is a reading OF: the whole closed set of four sayings, so
 * no case of it is reached by hope. The mark is drawn from this saying alone and from nothing
 * about a figure's value or its place.
 */
const SAYINGS = ['mvr', 'converted', 'usd', 'sent'] as const
type Saying = (typeof SAYINGS)[number]

/** The saying the mark stands before, which is the only one it stands before. */
const CONVERTED: Saying = 'converted'

/**
 * The hooks by which an element of this page says what it reads: a footer figure's saying,
 * the converted dollars of a sent row, the dollar cell that says it is a converted reading,
 * and a figure of the balance card. These are the elements the mark may never be written
 * inside, and their number is the population every count below is drawn from.
 */
const SAYING_HOOKS = [
  'data-reads',
  'data-statement-converted',
  'data-converted',
  'data-statement-total',
] as const

// ===== The independent oracle: what the stored sends mean, worded here =====

const grouped = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const groupedWithMinor = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Whole minor units as a rufiyaa figure reads them: grouped, with laari only when real. */
const minorFigure = (minor: number): string =>
  minor % 100 === 0 ? grouped.format(minor / 100) : groupedWithMinor.format(minor / 100)

/** The marked reading of stored laari: 'MVR14,000', 'MVR60,000.50', 'MVR0'. */
const mvrFigure = (laari: number): string => `MVR${minorFigure(laari)}`
/** A figure as every total and subtotal in dollars reads it: always two decimals. */
const twoDecimalFigure = (cents: number): string => `$${groupedWithMinor.format(cents / 100)}`

/** What this app calls a number of entries. */
const countLabel = (count: number): string => {
  if (count <= 0) return 'No entries'
  if (count === 1) return '1 entry'
  return `${count} entries`
}

const sendsOf = (stored: readonly StoredLedgerRow[]): readonly StoredLedgerRow[] =>
  stored.filter((row) => row.kind === 'send')
const centsOf = (rows: readonly StoredLedgerRow[]): number =>
  rows.reduce((sum, row) => sum + row.usd_cents, 0)
const laariOf = (rows: readonly StoredLedgerRow[]): number =>
  rows.reduce((sum, row) => sum + row.amount_minor, 0)
const rufiyaaSendsOf = (stored: readonly StoredLedgerRow[]): readonly StoredLedgerRow[] =>
  sendsOf(stored).filter((row) => row.currency === 'MVR')
const dollarSendsOf = (stored: readonly StoredLedgerRow[]): readonly StoredLedgerRow[] =>
  sendsOf(stored).filter((row) => row.currency === 'USD')

/** One leaf the owner reads on a footer line: its words, and what it says it reads. */
type ExpectedLeaf = {
  readonly text: string
  /** Null where the leaf says nothing: a label, or the screen's own mark. */
  readonly says: string | null
}

/** What one footer line means: its name, its pair, and the leaves it reads in order. */
type ExpectedLine = {
  readonly which: WhichLine
  readonly count: number
  readonly cents: number
  readonly leaves: readonly ExpectedLeaf[]
}

/**
 * The three lines the stored sends mean, derived from the stored currency and the stored
 * minor units alone. The rufiyaa line reads four leaves: its label with its count, the laari
 * its rufiyaa sends add up to, the screen's own mark, and the dollars those same sends store.
 * The dollar line and the total line read their label and their own one figure.
 */
const expectedFootLines = (stored: readonly StoredLedgerRow[]): readonly ExpectedLine[] => {
  const sends = sendsOf(stored)
  const inRufiyaa = rufiyaaSendsOf(stored)
  const inDollars = dollarSendsOf(stored)
  const labelLeaf = (which: WhichLine, count: number): ExpectedLeaf => ({
    text: `${LINE_LABELS[which]} ${DOT} ${countLabel(count)}`,
    says: null,
  })
  return [
    {
      which: 'mvr',
      count: inRufiyaa.length,
      cents: centsOf(inRufiyaa),
      leaves: [
        labelLeaf('mvr', inRufiyaa.length),
        { text: mvrFigure(laariOf(inRufiyaa)), says: 'mvr' },
        { text: ARROW, says: null },
        { text: twoDecimalFigure(centsOf(inRufiyaa)), says: CONVERTED },
      ],
    },
    {
      which: 'usd',
      count: inDollars.length,
      cents: centsOf(inDollars),
      leaves: [
        labelLeaf('usd', inDollars.length),
        { text: twoDecimalFigure(centsOf(inDollars)), says: 'usd' },
      ],
    },
    {
      which: 'total',
      count: sends.length,
      cents: centsOf(sends),
      leaves: [labelLeaf('total', sends.length), { text: twoDecimalFigure(centsOf(sends)), says: 'sent' }],
    },
  ]
}

/** The same three lines, read down to the fields they are judged on. */
const linesMeant = (stored: readonly StoredLedgerRow[]): ReadonlyArray<Record<string, unknown>> =>
  expectedFootLines(stored).map((line) => ({
    which: line.which,
    count: line.count,
    cents: line.cents,
    leaves: line.leaves.map((leaf) => ({ text: leaf.text, says: leaf.says })),
  }))

/**
 * The marks a module writes into its own words, read out of its own string literals. A
 * template's interpolation is masked first, so a value put into a sentence can never be
 * mistaken for a written mark.
 */
const marksWrittenIn = (plain: string): readonly string[] => {
  const ANY_LITERAL = /`(?:[^`\\]|\\.)*`|'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g
  const masked = plain.replace(/\$\{/g, '@{')
  return Array.from(masked.matchAll(ANY_LITERAL))
    .map((match) => match[0])
    .filter((literal) => literal.includes(ARROW))
}

// ===== The reading: what the mounted page offers a reader =====

/** One box, as the page gives it: four edges and the two lengths they make. */
type Box = {
  readonly top: number
  readonly right: number
  readonly bottom: number
  readonly left: number
  readonly width: number
  readonly height: number
}

/** One leaf of a footer line, as the owner reads it. */
type LeafReading = {
  readonly text: string
  /** What this leaf says it reads, or null where it says nothing. */
  readonly says: string | null
  /** Whether this leaf is the screen's own mark: a leaf holding the mark and nothing else. */
  readonly isTheMark: boolean
  /** Whether a mark stands in the same box as this leaf, beside it. */
  readonly boxedWithTheMark: boolean
  /** Whether this leaf stands wholly inside its own line's box. */
  readonly insideItsLine: boolean
  /** Whether this leaf stands wholly inside the viewport, so none of it is cut off. */
  readonly insideTheViewport: boolean
  readonly box: Box
}

/** One line of the sent footer. */
type LineReading = {
  readonly which: string | null
  readonly count: string | null
  readonly cents: string | null
  readonly text: string
  readonly leaves: readonly LeafReading[]
  readonly box: Box
}

/** The sent footer, the page around it, and the marks anywhere on either. */
type FooterReading = {
  readonly present: boolean
  readonly found: boolean
  readonly blockCount: string | null
  readonly blockCents: string | null
  readonly lines: readonly LineReading[]
  /** The population every count of the footer is drawn from. */
  readonly footerLeaves: number
  /** How many leaves of the footer are the screen's own mark. */
  readonly marksAmongFooterLeaves: number
  /** How many marks stand anywhere in the footer's own words, leaf or not. */
  readonly marksInTheFooterText: number
  /** The population the page-wide count is drawn from: every element that says what it reads. */
  readonly elementsThatSayWhatTheyRead: number
  /** How many of those carry a mark inside their OWN words, their children's words apart. */
  readonly sayingElementsHoldingTheMark: number
  readonly rows: number
  readonly cardFigures: number
  readonly alerts: number
}

/**
 * Reads the sent footer in one pass: its three lines, each line's leaves in the order they
 * are drawn with what each says it reads and the box it stands in, the marks of the footer
 * and of the whole page, and what else the screen draws. Answers even when there is no
 * footer at all, so a failed read is a reading of its own and never a crash.
 */
const readTheSendingListFooter = (page: Page): Promise<FooterReading> =>
  page.evaluate(
    ({ mark, sayingHooks }): FooterReading => {
      const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()
      const boxOf = (part: Element): Box => {
        const box = part.getBoundingClientRect()
        return {
          top: box.top,
          right: box.right,
          bottom: box.bottom,
          left: box.left,
          width: box.width,
          height: box.height,
        }
      }
      /** The words an element writes itself, its children's words left out. */
      const ownText = (part: Element): string =>
        squash(
          Array.from(part.childNodes)
            .filter((node) => node.nodeType === 3)
            .map((node) => node.textContent ?? '')
            .join(' '),
        )
      const occurrences = (text: string, needle: string): number => text.split(needle).length - 1

      const sayingSelector = sayingHooks.map((hook) => `[${hook}]`).join(',')
      const saying = Array.from(document.querySelectorAll(sayingSelector))
      const sayingWithTheMark = saying.filter((part) => ownText(part).includes(mark)).length

      const screen = document.querySelector('[data-screen="statement"]')
      const alerts = document.querySelectorAll('[data-pane="statement"] [role="alert"]').length
      const nothingDrawn = {
        blockCount: null,
        blockCents: null,
        lines: [] as readonly LineReading[],
        footerLeaves: 0,
        marksAmongFooterLeaves: 0,
        marksInTheFooterText: 0,
        rows: 0,
        cardFigures: 0,
      }
      if (screen === null) {
        return {
          present: false,
          found: false,
          ...nothingDrawn,
          elementsThatSayWhatTheyRead: saying.length,
          sayingElementsHoldingTheMark: sayingWithTheMark,
          alerts,
        }
      }

      const block = screen.querySelector('[data-statement-foot="sent"]')
      const rows = screen.querySelectorAll('[data-statement-list="sent"] [data-statement-row]').length
      const cardFigures = screen.querySelectorAll('[data-statement-total]').length
      if (block === null) {
        return {
          present: true,
          found: false,
          ...nothingDrawn,
          rows,
          cardFigures,
          elementsThatSayWhatTheyRead: saying.length,
          sayingElementsHoldingTheMark: sayingWithTheMark,
          alerts,
        }
      }

      /** The leaf elements of one line, in the order they are drawn, the empty ones dropped. */
      const leafElementsOf = (line: Element): readonly Element[] => {
        const leaves = Array.from(line.querySelectorAll('*')).filter(
          (part) => part.children.length === 0 && squash(part.textContent) !== '',
        )
        return leaves.length === 0 ? [line] : leaves
      }
      const isTheMark = (part: Element): boolean => squash(part.textContent) === mark

      const lineElements = Array.from(block.querySelectorAll('[data-statement-foot-line]'))
      const viewportWidth = window.innerWidth
      const within = (inner: Box, outer: Box): boolean =>
        inner.left >= outer.left - 0.5 &&
        inner.right <= outer.right + 0.5 &&
        inner.top >= outer.top - 0.5 &&
        inner.bottom <= outer.bottom + 0.5

      const lines: readonly LineReading[] = lineElements.map((line) => {
        const lineBox = boxOf(line)
        const leaves: readonly LeafReading[] = leafElementsOf(line).map((part) => {
          const parent = part.parentElement
          const box = boxOf(part)
          return {
            text: squash(part.textContent),
            says: part.getAttribute('data-reads'),
            isTheMark: isTheMark(part),
            boxedWithTheMark:
              parent !== null &&
              Array.from(parent.children).some(
                (sibling) => sibling !== part && sibling.children.length === 0 && isTheMark(sibling),
              ),
            insideItsLine: within(box, lineBox),
            insideTheViewport: box.left >= -0.5 && box.right <= viewportWidth + 0.5,
            box,
          }
        })
        return {
          which: line.getAttribute('data-statement-foot-line'),
          count: line.getAttribute('data-count'),
          cents: line.getAttribute('data-cents'),
          text: squash(line.textContent),
          leaves,
          box: lineBox,
        }
      })

      const everyLeaf = lines.flatMap((line) => line.leaves)
      return {
        present: true,
        found: true,
        blockCount: block.getAttribute('data-count'),
        blockCents: block.getAttribute('data-cents'),
        lines,
        footerLeaves: everyLeaf.length,
        marksAmongFooterLeaves: everyLeaf.filter((leaf) => leaf.isTheMark).length,
        marksInTheFooterText: occurrences(squash(block.textContent), mark),
        rows,
        cardFigures,
        elementsThatSayWhatTheyRead: saying.length,
        sayingElementsHoldingTheMark: sayingWithTheMark,
        alerts,
      }
    },
    { mark: ARROW, sayingHooks: SAYING_HOOKS as readonly string[] },
  )

/** The leaves of one named line, read down to their words and their saying. */
const leavesRead = (reading: FooterReading, which: WhichLine): ReadonlyArray<Record<string, unknown>> =>
  (reading.lines.find((line) => line.which === which)?.leaves ?? []).map((leaf) => ({
    text: leaf.text,
    says: leaf.says,
  }))

/** The three drawn lines, read down to the fields the stored sends mean. */
const linesRead = (reading: FooterReading): ReadonlyArray<Record<string, unknown>> =>
  reading.lines.map((line) => ({
    which: line.which,
    count: line.count === null ? null : Number(line.count),
    cents: line.cents === null ? null : Number(line.cents),
    leaves: line.leaves.map((leaf) => ({ text: leaf.text, says: leaf.says })),
  }))

/** The one leaf of a line that says it reads the named thing, or nothing where there is none. */
const figureSaying = (reading: FooterReading, says: Saying): LeafReading | undefined =>
  reading.lines.flatMap((line) => line.leaves).find((leaf) => leaf.says === says)

/** Where the mark stands among the leaves of its line, and what follows it. */
const markPlace = (
  reading: FooterReading,
): { readonly line: string | null; readonly followedBy: string | null; readonly marks: number } => {
  const marks = reading.lines.flatMap((line) =>
    line.leaves.map((leaf, index) => ({ line, leaf, index })).filter((at) => at.leaf.isTheMark),
  )
  const first = marks[0]
  if (first === undefined) return { line: null, followedBy: null, marks: 0 }
  return {
    line: first.line.which,
    followedBy: first.line.leaves[first.index + 1]?.says ?? null,
    marks: marks.length,
  }
}

// ===== The stimulus: the stored ledgers the owner signs in to =====

const ACCOUNT_MAIN = { email: 'owner-arrow-a@abbaas.test', password: 'arrow-password-a1' } as const
const ACCOUNT_BOTH = { email: 'owner-arrow-b@abbaas.test', password: 'arrow-password-b2' } as const
const ACCOUNT_EMPTY = { email: 'owner-arrow-c@abbaas.test', password: 'arrow-password-c3' } as const
const ACCOUNT_LAARI = { email: 'owner-arrow-d@abbaas.test', password: 'arrow-password-d4' } as const
const ACCOUNT_MANY = { email: 'owner-arrow-e@abbaas.test', password: 'arrow-password-e5' } as const
const ACCOUNT_GENERATED = { email: 'owner-arrow-f@abbaas.test', password: 'arrow-password-f6' } as const

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

const repayment = (usdCents: number, entryDate: string): EntrySeed => ({
  kind: 'receive',
  currency: 'USD',
  amountMinor: usdCents,
  rate: null,
  usdCents,
  entryDate,
  savedAt: `${entryDate}T09:00:00Z`,
  method: 'cash',
})

/**
 * The month this footer is worded by: two rufiyaa sends, 10,000 rufiyaa at the rate 20 stored
 * as 500 dollars and 4,000 rufiyaa at the same rate stored as 200 dollars, and one send of
 * 750 dollars. Its footer therefore reads 14,000 rufiyaa with the arrow and 700 dollars under
 * it, 750 dollars on the dollar line and 1,450 dollars on the total line.
 */
const MAIN_LEDGER: readonly EntrySeed[] = [
  send('MVR', 1_000_000, 50_000, '2026-09-02', '20.0000', MARIYAM),
  send('MVR', 400_000, 20_000, '2026-09-06', '20.0000'),
  send('USD', 75_000, 75_000, '2026-09-18'),
]

/**
 * What those three sends read, stated as constants as well as derived, so a wrong derivation
 * in this oracle cannot pass unnoticed.
 */
const MAIN_READS: readonly ExpectedLine[] = [
  {
    which: 'mvr',
    count: 2,
    cents: 70_000,
    leaves: [
      { text: 'Sent in MVR · 2 entries', says: null },
      { text: 'MVR14,000', says: 'mvr' },
      { text: ARROW, says: null },
      { text: '$700.00', says: 'converted' },
    ],
  },
  {
    which: 'usd',
    count: 1,
    cents: 75_000,
    leaves: [
      { text: 'Sent in USD · 1 entry', says: null },
      { text: '$750.00', says: 'usd' },
    ],
  },
  {
    which: 'total',
    count: 3,
    cents: 145_000,
    leaves: [
      { text: 'Total Sent · 3 entries', says: null },
      { text: '$1,450.00', says: 'sent' },
    ],
  },
]

/** One rufiyaa send, one dollar send and one repayment of 300 dollars, all in one month. */
const BOTH_LEDGER: readonly EntrySeed[] = [
  send('MVR', 1_000_000, 50_000, '2026-08-05', '20.0000'),
  send('USD', 75_000, 75_000, '2026-08-09', null, MARIYAM),
  repayment(30_000, '2026-08-14'),
]

/**
 * Rufiyaa sends in the millions whose laari do not add up to whole rufiyaa: the longest
 * figure this app words, beside a dollar total that keeps its two decimals.
 */
const LAARI_LEDGER: readonly EntrySeed[] = [
  send('MVR', 777_777_725, 38_888_886, '2026-07-04', '20.0000'),
  send('MVR', 666_666_650, 33_333_333, '2026-07-08', '20.0000', MARIYAM),
  send('USD', 1_500_025, 1_500_025, '2026-07-12'),
]

/** A month long enough that its rows must be scrolled, and with no rufiyaa send in it. */
const MANY_LEDGER: readonly EntrySeed[] = Array.from({ length: 60 }, (_unused, index) => ({
  ...send('USD', 1_000 + index, 1_000 + index, '2026-06-01'),
  savedAt: `2026-06-01T${String(Math.floor(index / 60)).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}:00Z`,
}))

let stack: Stack
let served: ServedOrigin
let main: Account
let both: Account
let emptyLedger: Account
let laari: Account
let many: Account
let generated: Account
let generatedPeople: ReadonlyMap<string, string>

test.use({ viewport: VIEWPORT })

test.beforeAll(async () => {
  stack = startLocalStack()
  buildBundle(stack)
  served = await serveDist()

  main = await createAccount(stack, ACCOUNT_MAIN)
  await replaceEntries(stack, main, MAIN_LEDGER, await seedPeopleByName(stack, main, [AHMED, MARIYAM]))

  both = await createAccount(stack, ACCOUNT_BOTH)
  await replaceEntries(stack, both, BOTH_LEDGER, await seedPeopleByName(stack, both, [AHMED, MARIYAM]))

  emptyLedger = await createAccount(stack, ACCOUNT_EMPTY)

  laari = await createAccount(stack, ACCOUNT_LAARI)
  await replaceEntries(stack, laari, LAARI_LEDGER, await seedPeopleByName(stack, laari, [AHMED, MARIYAM]))

  many = await createAccount(stack, ACCOUNT_MANY)
  await replaceEntries(stack, many, MANY_LEDGER, await seedPeopleByName(stack, many, [AHMED]))

  generated = await createAccount(stack, ACCOUNT_GENERATED)
  generatedPeople = await seedPeopleByName(stack, generated, [AHMED, MARIYAM])
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
        'WHAT: the screen was still moving two seconds after the tap. WHY: every box and edge this oracle takes is taken from where the screen came to rest, so a box read mid-slide would judge an arrangement the owner never sees. HOW: finish the slide and the arriving footer\'s rise, and drop each part\'s mark as it stops.',
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

/** Writes the mark into the words of one figure that says what it reads, through the page. */
const whenAMarkIsPutInsideAFiguresOwnWords = (page: Page): Promise<boolean> =>
  page.evaluate((mark) => {
    const figure = document.querySelector('[data-reads]')
    if (figure === null) return false
    figure.textContent = `${mark}${figure.textContent ?? ''}`
    return true
  }, ARROW)

/** Every pair of leaf boxes of the footer that overlap each other, named as the owner reads them. */
const overlappingLeafBoxes = (reading: FooterReading): readonly string[] => {
  const leaves = reading.lines.flatMap((line) =>
    line.leaves.map((leaf) => ({ where: `${line.which ?? 'a line with no name'}: '${leaf.text}'`, box: leaf.box })),
  )
  const overlapping: string[] = []
  for (let outer = 0; outer < leaves.length; outer += 1) {
    for (let inner = outer + 1; inner < leaves.length; inner += 1) {
      const left = leaves[outer]
      const right = leaves[inner]
      if (left === undefined || right === undefined) continue
      const crosses =
        left.box.left < right.box.right - 0.5 &&
        right.box.left < left.box.right - 0.5 &&
        left.box.top < right.box.bottom - 0.5 &&
        right.box.top < left.box.bottom - 0.5
      if (crosses) overlapping.push(`${left.where} over ${right.where}`)
    }
  }
  return overlapping
}

// ===== The scenarios =====

test('the sending list footer reads the rufiyaa subtotal with the dollars they were worth under it', async ({
  page,
}) => {
  // Given a month holding two rufiyaa sends and one dollar send
  const stored = await readStoredLedger(stack, main)
  expect(
    expectedFootLines(stored),
    'WHAT: the ledger seeded for this reading is not the month this footer is worded by. WHY: the three lines below are stated as constants as well as derived, so a wrong derivation in this oracle cannot pass unnoticed. HOW: seed 10,000 and 4,000 rufiyaa at the rate 20, stored as 500 and 200 dollars, and one send of 750 dollars.',
  ).toEqual(MAIN_READS)
  await givenTheOwnerIsSignedIn(page, main)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the rufiyaa line reads its subtotal, then the arrow, then the dollars those rufiyaa
  // were worth, and the other two lines each read their own figure (law L-foot-arrow)
  const reading = await readTheSendingListFooter(page)
  expect(
    linesRead(reading),
    "WHAT: the footer does not read the rufiyaa subtotal, the screen's own arrow and the dollars those rufiyaa were worth, with the dollar line and the total line each reading their own figure. WHY: this is where the owner reads what went out in rufiyaa and what that money was worth: a missing arrow leaves two amounts reading as one line, and a missing or wrong figure misstates the month's money. HOW: draw the subtotal, then the arrow as the screen's own leaf, then the figure that says it reads the converted total, and leave the dollar line and the total line exactly as they read.",
  ).toEqual(linesMeant(stored))
  expect(
    markPlace(reading),
    "WHAT: the arrow does not stand on the rufiyaa line immediately before the figure that says it reads the converted total. WHY: the arrow is what tells the owner the figure under the subtotal is those same rufiyaa in dollars; before any other figure it claims a conversion that never happened. HOW: draw the one arrow from the figure's own saying, immediately before the figure that says it reads the converted total.",
  ).toEqual({ line: 'mvr', followedBy: CONVERTED, marks: 1 })
  expect(
    [reading.blockCount, reading.blockCents],
    'WHAT: the footer block no longer carries the count and the cents of its total line. WHY: a reader that knows only the block is still told how many sends there were and what they were worth; the arrow adds a reading and must remove none. HOW: keep the block reading the total line\'s own count and cents.',
  ).toEqual([String(sendsOf(stored).length), String(centsOf(sendsOf(stored)))])
})

for (const ledgerCase of [
  { title: 'a month of rufiyaa sends and one dollar send', account: () => main },
  { title: 'a month holding a rufiyaa send, a dollar send and a repayment', account: () => both },
  { title: 'a month holding nothing at all', account: () => emptyLedger },
]) {
  test(`the arrow is the screen's own and no figure reads it inside its own words: ${ledgerCase.title}`, async ({
    page,
  }) => {
    // Arrange: that month, read through the served page
    const stored = await readStoredLedger(stack, ledgerCase.account())
    await givenTheOwnerIsSignedIn(page, ledgerCase.account())

    // Act: the owner taps the Statement tab
    await whenTheOwnerTapsStatement(page)

    // Assert: one arrow in the footer, before the converted total, and inside no figure's own
    // words anywhere on the page (laws L-v2-mark-outside and AT-v2-mark-ssot)
    const reading = await readTheSendingListFooter(page)
    expect(
      [reading.elementsThatSayWhatTheyRead > 0, reading.sayingElementsHoldingTheMark],
      "WHAT: either the page offers no element that says what it reads, or one of them carries the arrow inside its own words. WHY: a figure whose own words hold the arrow is read by the owner as part of an amount, and every check of that figure against the stored sends then fails on a mark instead of telling the owner the money disagrees. HOW: draw the arrow as the screen's own leaf beside the figure, and never inside the words of anything that says what it reads.",
    ).toEqual([true, 0])
    expect(
      [reading.footerLeaves > 0, reading.marksAmongFooterLeaves, reading.marksInTheFooterText],
      'WHAT: the sent footer does not hold exactly one arrow, counted both as a leaf of its own and as a mark anywhere in the footer\'s words. WHY: no arrow leaves the dollar total reading as a second amount of the subtotal\'s line, and two arrows read as two conversions. HOW: draw one arrow in the footer, as one leaf, from the one figure that says it reads the converted total.',
    ).toEqual([true, 1, 1])
    expect(
      figureSaying(reading, CONVERTED)?.text,
      'WHAT: the figure that says it reads the converted total is not the dollar wording of what this month\'s rufiyaa sends store. WHY: that figure is the money the owner actually sent, read in dollars; a figure derived from anything else states an amount they never sent. HOW: word that figure from the dollars the rufiyaa sends of the month store, summed once, and re-convert nothing.',
    ).toBe(twoDecimalFigure(centsOf(rufiyaaSendsOf(stored))))
  })
}

test('no words this app stores for money carry the arrow', async () => {
  // Arrange: the module that words every figure of this screen, read as plain text
  const plain = readFileSync(DOMAIN_STATEMENT_MODULE, 'utf8')

  // Act: its own string literals are read for a written arrow
  const written = marksWrittenIn(plain)

  // Assert: none of them writes it (law L-v2-mark-outside, refuted law R-v2-mark-domain)
  expect(
    written,
    'WHAT: a word this app stores for money writes the arrow into its own text. WHY: the arrow is the screen\'s furniture, not part of an amount: written into the wording, it would travel into every reading that compares a footer figure with the stored sends, and the figure would no longer be the wording of an amount. HOW: leave the wording the amount alone and let the screen draw the arrow beside it as its own leaf.',
  ).toEqual([])
})

for (const ledgerCase of [
  { title: 'two rufiyaa sends and one dollar send', account: () => main },
  { title: 'rufiyaa sends in the millions with real laari', account: () => laari },
]) {
  test(`the dollars those rufiyaa were worth stand on a line of their own under the subtotal: ${ledgerCase.title}`, async ({
    page,
  }) => {
    // Arrange: that month, read through the served page
    await givenTheOwnerIsSignedIn(page, ledgerCase.account())

    // Act: the owner taps the Statement tab
    await whenTheOwnerTapsStatement(page)

    // Assert: the detail lies wholly below the subtotal, nothing overlaps and nothing is cut
    // off (laws L-v2-stacked and the long-figure stressor V2-d-stress-long-figure)
    const reading = await readTheSendingListFooter(page)
    const subtotal = figureSaying(reading, 'mvr')
    const converted = figureSaying(reading, CONVERTED)
    const theMark = reading.lines.flatMap((line) => line.leaves).find((leaf) => leaf.isTheMark)
    expect(
      [subtotal !== undefined, converted !== undefined, theMark !== undefined],
      'WHAT: the rufiyaa line does not offer its subtotal, its arrow and the figure that says it reads the converted total. WHY: the arrangement below can only be read once all three are drawn; a missing one is a line the owner cannot read at all. HOW: draw the subtotal, the arrow and the converted figure on the rufiyaa line at every ledger.',
    ).toEqual([true, true, true])
    expect(
      [
        converted !== undefined && subtotal !== undefined && converted.box.top >= subtotal.box.bottom - 0.5,
        theMark !== undefined && subtotal !== undefined && theMark.box.top >= subtotal.box.bottom - 0.5,
      ],
      'WHAT: the arrow and the dollar total do not stand wholly below the rufiyaa subtotal. WHY: beside the subtotal the two figures read as two amounts of one line, which is exactly what the line under it exists to part: the owner must read one rufiyaa amount and, under it, what it was worth. HOW: draw the figures of the rufiyaa line as a column, so the box holding the arrow and the converted figure takes its own height under the subtotal.',
    ).toEqual([true, true])
    expect(
      overlappingLeafBoxes(reading),
      'WHAT: two readings of the footer are drawn over each other. WHY: a figure under another figure cannot be read at all, and the owner cannot tell a covered amount from a wrong one. HOW: give the arrow and its figure their own height in the line, so no reading of the footer is drawn over another.',
    ).toEqual([])
    expect(
      reading.lines.flatMap((line) =>
        line.leaves
          .filter((leaf) => !leaf.insideItsLine || !leaf.insideTheViewport)
          .map((leaf) => `${line.which ?? 'a line with no name'}: '${leaf.text}'`),
      ),
      'WHAT: a reading of the footer stands outside its own line, or outside the screen. WHY: a figure cut off at the edge of the screen or spilling out of its line is money the owner cannot read, and the longest figures this app words are the ones that would be cut. HOW: let the rufiyaa line take the height its two figures need, and keep every reading inside its line and inside the screen.',
    ).toEqual([])
    expect(
      reading.lines.map((line) => line.which),
      'WHAT: the three lines are not drawn rufiyaa, dollars and total in that order. WHY: the owner reads the two currencies first and their total last; another order reads as a different statement about the month. HOW: draw the rufiyaa line, then the dollar line, then the total line.',
    ).toEqual([...LINES])
    expect(
      reading.lines.every(
        (line, index) => index === 0 || line.box.top >= (reading.lines[index - 1]?.box.bottom ?? 0) - 0.5,
      ),
      'WHAT: the lines of the footer no longer stand one under the other in the order they are drawn. WHY: a line standing beside or above the line drawn before it reads as a different split of the month. HOW: keep each line wholly below the line drawn before it, whatever height the rufiyaa line takes.',
    ).toBe(true)
  })
}

test('a figure that reads anything but those dollars is drawn with no arrow beside it', async ({ page }) => {
  // Arrange: a month holding both currencies and a repayment
  await givenTheOwnerIsSignedIn(page, both)

  // Act: the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Assert: only the converted figure is boxed with the arrow, and the footer's leaves part
  // into labels, figures and the one arrow with nothing left over (claim X-v2-mark)
  const reading = await readTheSendingListFooter(page)
  expect(
    reading.lines.flatMap((line) =>
      line.leaves
        .filter((leaf) => leaf.says !== null)
        .map((leaf) => [leaf.says, leaf.boxedWithTheMark] as const),
    ),
    'WHAT: a figure that says it reads something other than those dollars is drawn with the arrow beside it in its own box, or the converted figure is drawn without it. WHY: the arrow is decided by what a figure says it reads and by nothing else; beside the rufiyaa subtotal, the dollars sent or the total it claims a conversion that never happened. HOW: draw the arrow and its box only around the figure that says it reads the converted total, and leave every other figure exactly the element it is now.',
  ).toEqual([
    ['mvr', false],
    [CONVERTED, true],
    ['usd', false],
    ['sent', false],
  ])
  const leaves = reading.lines.flatMap((line) => line.leaves)
  expect(
    [
      leaves.filter((leaf) => leaf.says === null && !leaf.isTheMark).length +
        leaves.filter((leaf) => leaf.says !== null).length +
        leaves.filter((leaf) => leaf.isTheMark).length,
      reading.footerLeaves,
    ],
    'WHAT: the leaves of the footer do not part into its labels, its figures and the one arrow with nothing left over. WHY: a leaf that is neither a label, nor a figure that says what it reads, nor the arrow is a reading the owner is given and nobody accounts for. HOW: draw the footer as three labels, the figures of its three lines and the one arrow, and nothing else.',
  ).toEqual([reading.footerLeaves, leaves.length])
})

test('an arrow put inside a figure\'s own words is reported, not passed over', async ({ page }) => {
  // Arrange: a clean reading of the month this footer is worded by
  await givenTheOwnerIsSignedIn(page, main)
  await whenTheOwnerTapsStatement(page)
  const clean = await readTheSendingListFooter(page)

  // Act: the arrow is put inside the words of one figure that says what it reads
  const written = await whenAMarkIsPutInsideAFiguresOwnWords(page)

  // Assert: the reading that found none now finds one, so a clean page was looked at and
  // genuinely found clean (claim X-v2-mark, its bypass V2-x-mark-bypass)
  const after = await readTheSendingListFooter(page)
  expect(
    [written, clean.sayingElementsHoldingTheMark, after.sayingElementsHoldingTheMark],
    'WHAT: putting the arrow inside the words of a figure did not change what this reading reports. WHY: a reading that answers "no figure holds the arrow" whatever the page says cannot tell a clean footer from one that hid the mark inside an amount, and every other count of this oracle rests on it. HOW: read the words each element writes itself, its children\'s words left out, so a mark written into a figure is reported rather than passed over.',
  ).toEqual([true, 0, 1])
})

test('a month with nothing in it still reads the arrow with a dollar total of nothing', async ({ page }) => {
  // Given an owner who has recorded nothing at all
  const stored = await readStoredLedger(stack, emptyLedger)
  expect(
    stored.length,
    'WHAT: the ledger seeded for the empty reading is not empty. WHY: this reading exists to state what the footer says when nothing went out at all. HOW: seed an account with no entry of any kind.',
  ).toBe(0)
  await givenTheOwnerIsSignedIn(page, emptyLedger)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the rufiyaa line still reads no entries, nothing in rufiyaa, the arrow and nothing
  // in dollars (bound V2-c-empty-ledger, stressor V2-d-stress-empty)
  const reading = await readTheSendingListFooter(page)
  expect(
    leavesRead(reading, 'mvr'),
    "WHAT: a month in which nothing went out does not read 'No entries' with 'MVR0', the arrow and '$0.00'. WHY: the arrow is drawn from what a figure says it reads and from nothing about its value, so no ledger may drop it: a line that loses its arrow or its figure at zero cannot be told from a footer that forgot the currency altogether. HOW: draw all four readings of the rufiyaa line at every ledger, reading a month with no rufiyaa send at none and at zero.",
  ).toEqual([
    { text: `${LINE_LABELS.mvr} ${DOT} ${countLabel(0)}`, says: null },
    { text: 'MVR0', says: 'mvr' },
    { text: ARROW, says: null },
    { text: '$0.00', says: CONVERTED },
  ])
  expect(
    [reading.found, reading.lines.length, reading.lines.map((line) => [line.count, line.cents])],
    'WHAT: an empty month has no footer, has fewer than three lines, or has a line without its own count and cents. WHY: a footer the owner cannot find reads as a screen that never loaded, a short footer hides a currency, and a line without its pair cannot be read except by its words. HOW: draw the block with all three of its lines, each carrying its own count and cents, at every ledger.',
  ).toEqual([
    true,
    3,
    [
      ['0', '0'],
      ['0', '0'],
      ['0', '0'],
    ],
  ])
})

test('the arrow and its dollar total read the same after the rows are scrolled', async ({ page }) => {
  // Given a month long enough that its rows must be scrolled, with nothing sent in rufiyaa
  const stored = await readStoredLedger(stack, many)
  await givenTheOwnerIsSignedIn(page, many)
  await whenTheOwnerTapsStatement(page)
  const before = await readTheSendingListFooter(page)

  // When the owner scrolls the rows to their end
  await whenTheOwnerScrollsTheRowsToTheEnd(page)

  // Then the footer reads exactly what it read before, and the arrangement still holds
  // (stimulus V2-o-stimulus, admitted state V2-case-dollars-only)
  const after = await readTheSendingListFooter(page)
  expect(
    linesRead(after),
    'WHAT: the footer does not read what this month stores after its rows are scrolled. WHY: the owner reads the footer under the moving rows: a reading that changes with the scroll states a different month at the bottom of the same screen. HOW: draw the footer once from the read ledger and leave it where it stands while the rows scroll.',
  ).toEqual(linesMeant(stored))
  expect(
    linesRead(after),
    'WHAT: the footer reads one thing before the rows are scrolled and another after. WHY: nothing about the money changed, so neither may the reading. HOW: keep the footer outside the scrolling rows, drawn once.',
  ).toEqual(linesRead(before))
  expect(
    [markPlace(after), overlappingLeafBoxes(after)],
    'WHAT: after the scroll the one arrow no longer stands on the rufiyaa line before the converted total, or two readings of the footer are drawn over each other. WHY: the arrangement the owner reads at the bottom of the screen must survive the rows moving under it. HOW: leave the footer and its column outside the scrolling area.',
  ).toEqual([{ line: 'mvr', followedBy: CONVERTED, marks: 1 }, []])
})

test('a ledger that cannot be read says so instead of an arrow at zero', async ({ page }) => {
  // Given the ledger cannot be reached from the phone
  await page.route(ENTRIES_ENDPOINT, async (route) => {
    if (route.request().method() === 'GET') {
      await route.abort('failed')
      return
    }
    await route.continue()
  })
  await givenTheOwnerIsSignedIn(page, main)

  // When the owner taps the Statement tab
  await whenTheOwnerTapsStatement(page)

  // Then the screen speaks the one message the read gave it and draws no footer at all
  // (failure V2-b-f-read-cond, stressor V2-d-stress-failed-read)
  await expect(
    statementPane(page).getByRole('alert'),
    'WHAT: the Statement does not speak one alert after a failed read. WHY: the owner must be told the ledger could not be read, not shown a footer. HOW: speak the message the read answers with, and draw no list and no footer.',
  ).toHaveText(UNREADABLE)
  const reading = await readTheSendingListFooter(page)
  expect(
    [reading.found, reading.lines.length, reading.rows, reading.cardFigures, reading.marksInTheFooterText],
    'WHAT: a failed read still drew the footer, a line of it, a row, a card figure or an arrow. WHY: a rufiyaa line reading zero with an arrow states a month in which nothing went out in rufiyaa, which is a different and false statement about money the owner may well have sent. HOW: draw the alert alone when the read failed.',
  ).toEqual([false, 0, 0, 0, 0])
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
 * construction rather than hoped for: whole rufiyaa, rufiyaa with real laari, whole dollars,
 * dollars with real cents, and an amount large enough that no figure of the footer may assume
 * a small one.
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

/**
 * The spread of ledgers these two laws are judged over, with the ledgers that must be there
 * drawn by construction rather than hoped for: nothing at all, no rufiyaa send, no dollar
 * send, real laari, and a mixed month of a dozen entries.
 */
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
    { label: 'no rufiyaa send at all', entries: drawn(6, ['dollars, whole', 'dollars, with cents']) },
    { label: 'no dollar send at all', entries: drawn(6, ['rufiyaa, whole', 'rufiyaa, with laari']) },
    { label: 'real cents and real laari across a year', entries: drawn(9, ['rufiyaa, with laari', 'dollars, with cents']) },
    { label: 'a dozen entries in both currencies', entries: drawn(12) },
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

/**
 * Judges one footer for its arrow: exactly one, before the one figure that says it reads the
 * converted total, with that figure reading the dollars this ledger's rufiyaa sends store and
 * every other figure drawn with no arrow at all. What the arrow is judged against is computed
 * here from the stored rows alone, never from anything the screen drew.
 */
const judgeTheOneArrow: Judge = async (page: Page): Promise<readonly string[]> => {
  const stored = await readStoredLedger(stack, generated)
  const reading = await readTheSendingListFooter(page)
  if (!reading.present) return ['there is no statement screen to read']
  if (!reading.found) return ['there is no sent footer to read']
  const reasons: string[] = []

  if (reading.marksAmongFooterLeaves !== 1 || reading.marksInTheFooterText !== 1) {
    reasons.push(
      `the footer holds ${reading.marksAmongFooterLeaves} arrow leaves and ${reading.marksInTheFooterText} arrows in its words, of ${reading.footerLeaves} leaves, where one of each is meant`,
    )
  }
  const place = markPlace(reading)
  if (place.line !== 'mvr' || place.followedBy !== CONVERTED) {
    reasons.push(
      `the arrow stands on the ${place.line ?? 'no'} line before a figure that says it reads '${place.followedBy ?? 'nothing'}', not before the converted total on the rufiyaa line`,
    )
  }
  if (reading.sayingElementsHoldingTheMark !== 0) {
    reasons.push(
      `${reading.sayingElementsHoldingTheMark} of the ${reading.elementsThatSayWhatTheyRead} elements that say what they read carry the arrow inside their own words`,
    )
  }
  const converted = figureSaying(reading, CONVERTED)
  const meant = twoDecimalFigure(centsOf(rufiyaaSendsOf(stored)))
  if (converted === undefined || converted.text !== meant) {
    reasons.push(
      `the converted total reads '${converted?.text ?? 'nothing'}', while the rufiyaa sends of this ledger store ${centsOf(rufiyaaSendsOf(stored))} cents, which is ${meant}`,
    )
  }
  if (converted !== undefined && !converted.boxedWithTheMark) {
    reasons.push('the converted total is not drawn in the same box as the arrow')
  }
  const withAnArrowBesideThem = reading.lines
    .flatMap((line) => line.leaves)
    .filter((leaf) => leaf.says !== null && leaf.says !== CONVERTED && leaf.boxedWithTheMark)
    .map((leaf) => `${leaf.says ?? ''} ('${leaf.text}')`)
  if (withAnArrowBesideThem.length > 0) {
    reasons.push(`these figures are drawn with an arrow beside them: ${withAnArrowBesideThem.join(', ')}`)
  }
  return reasons
}

/**
 * Judges one footer for the three lines it keeps: their order, their labels with the count
 * worded as this app words a count, their own count and cents, and the block's own pair. The
 * three lines are built here from the stored rows alone.
 */
const judgeTheThreeLinesAreKept: Judge = async (page: Page): Promise<readonly string[]> => {
  const stored = await readStoredLedger(stack, generated)
  const reading = await readTheSendingListFooter(page)
  if (!reading.present) return ['there is no statement screen to read']
  if (!reading.found) return ['there is no sent footer to read']
  const reasons: string[] = []

  const drawn = linesRead(reading)
  const meant = linesMeant(stored)
  if (JSON.stringify(drawn) !== JSON.stringify(meant)) {
    reasons.push(`the lines read ${JSON.stringify(drawn)} not ${JSON.stringify(meant)}`)
  }
  if (reading.lines.map((line) => line.which).join(',') !== LINES.join(',')) {
    reasons.push(`the lines are drawn ${reading.lines.map((line) => line.which).join(',')} not ${LINES.join(',')}`)
  }
  const sends = sendsOf(stored)
  if (reading.blockCount !== String(sends.length) || reading.blockCents !== String(centsOf(sends))) {
    reasons.push(
      `the block carries ${reading.blockCount} sends and ${reading.blockCents} cents, stored ${sends.length} and ${centsOf(sends)}`,
    )
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
 * smallest ledger that still disagrees, so the case is replayed exactly. This repository has
 * no property-testing library pinned, so there is no automatic shrinking and the smallest
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

test('every month reads one arrow, and only before the dollars its rufiyaa were worth', async ({ page }) => {
  // Arrange: the owner signed in to the account every generated ledger is written into
  await givenTheOwnerIsSignedIn(page, generated)

  // Act: each ledger of the spread is stored and read through the Statement tab
  const failing = await firstFailing(page, generatedLedgers(), judgeTheOneArrow)

  // Assert: over the whole spread exactly one arrow, before the one converted total, whose
  // figure is the dollar wording of that ledger's own rufiyaa sends (law L-v2-mark-only)
  expect(
    await reportOf(page, failing, judgeTheOneArrow),
    "WHAT: a generated month does not read exactly one arrow before the one figure that says it reads the converted total, or that figure is not the dollar wording of what its own rufiyaa sends store. WHY: the arrow is what tells the owner a figure is rufiyaa read in dollars: missing it, doubled, or standing before another figure, it states a conversion the ledger never holds, and a figure derived from anything but the stored dollars states money the owner never sent. HOW: draw the arrow from the figure's saying alone, once, immediately before the converted total, and word that figure from the dollars the rufiyaa sends store.",
  ).toBe('')
})

test('every month keeps the footer three lines with their counts and their dollars', async ({ page }) => {
  // Arrange: the owner signed in to the account every generated ledger is written into
  await givenTheOwnerIsSignedIn(page, generated)

  // Act: each ledger of the spread is stored and read through the Statement tab
  const failing = await firstFailing(page, generatedLedgers(), judgeTheThreeLinesAreKept)

  // Assert: over the whole spread the three lines keep their order, their labels, their own
  // count and cents and the block's pair (law L-v2-lines-kept)
  expect(
    await reportOf(page, failing, judgeTheThreeLinesAreKept),
    'WHAT: a generated month no longer reads its three footer lines in their order, each with its label, its worded count, its own count and its own cents, with the block carrying the total line\'s pair. WHY: the arrow adds a reading to this footer and must remove none: a line, a label or a pair lost to it leaves the owner reading a different split of their month. HOW: add the arrow beside the converted total and leave every other reading of the three lines and of the block exactly as it is.',
  ).toBe('')
})
