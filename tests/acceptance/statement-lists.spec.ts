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

// The two lists of the Statement, as the owner reads them: a segmented pill named
// Statement lists offers Sent for Abbaas and Paid back by Abbaas, the sent list is the
// one the Statement opens on, and a tap on the other shows every repayment oldest first
// with its stored method and its own total, while the balance card and the
// pill stay exactly where they were.
//
// Judged only through the declared public port: the BUILT bundle as Chrome loads it over
// the served origin, at 360 by 780. Nothing here imports a module of src/; the stimulus
// is stored rows, the reading is the document, and every expected figure, word, order and
// count is derived in this file from what the ledger actually stores, so the oracle cannot
// echo back whatever the screen happens to draw.
//
// Where the expected values come from.
//   - The figures and the wording are the stored rows read back outside the browser, put
//     in order here, summed here and worded here. The four seeded repayments add up to
//     $16,000.00, stated below as a constant so a wrong sum cannot pass unnoticed.
//   - The colours, the words and the pill's measurements are the design board's own.
//   - The empty ledger is read once, in its own scenario; the generated ledgers run from
//     one entry up to twelve, so no case is observed twice with the same assertion.

const PASSWORD_FIELD = 'input[type="password"]'
const VIEWPORT = { width: 360, height: 780 } as const

/** The separator the board draws between the parts of a footer line. */
const DOT = '·'

/** Sub-pixel layout rounding: a box that "has not moved" may still differ by a whisker. */
const PIXEL = 1
/** The endpoint the bundle reads the ledger from, as the browser sees it. */
const ENTRIES_ENDPOINT = '**/rest/v1/entries**'
/** What a failed read says, as the port words it. */
const UNREADABLE = 'Could not load the ledger. Try again.'

// ===== The domain vocabulary this oracle speaks =====

/** The two lists the pill switches between. */
type Which = 'sent' | 'back'

/** The accessible names the owner reads, and taps. */
const PILL_NAME = 'Statement lists'
const SENT_TAB = 'Sent for Abbaas'
const BACK_TAB = 'Paid back by Abbaas'
const TAB_NAME: Record<Which, string> = { sent: SENT_TAB, back: BACK_TAB }

type Method = 'cash' | 'cheque' | 'transfer'

/** The word the owner reads for a stored method; a null method says nothing at all. */
const METHOD_WORDS: Record<Method, string> = {
  cash: 'Cash',
  cheque: 'Cheque',
  transfer: 'Transfer',
}

/** The board's colours, as the browser computes them. */
const SENT_THUMB = 'rgb(36, 80, 138)'
const BACK_THUMB = 'rgb(15, 111, 104)'
const PILL_BED = 'rgb(227, 233, 231)'
const SELECTED_INK = 'rgb(255, 255, 255)'
const RESTING_INK = 'rgb(76, 95, 91)'
const BACK_FIGURE_INK = 'rgb(15, 111, 104)'
const BACK_FOOT_BED = 'rgb(224, 240, 237)'
const BACK_FOOT_INK = 'rgb(11, 87, 80)'

/** The board's own pill: 44 px tall, radius 14, a thumb of radius 10 half the pill less 6. */
const PILL_HEIGHT = 44
const PILL_RADIUS = '14px'
const THUMB_RADIUS = '10px'
const THUMB_INSET = 6

/** Where a panel lies against the phone's own width. */
type Place = 'absent' | 'inside' | 'outside' | 'partly'

/** One row of either list, as the owner reads it across the row. */
type RowReading = {
  readonly id: string
  readonly no: string
  readonly cells: readonly string[]
  readonly usd: string
  readonly usdInk: string
  readonly hasPerson: boolean
  readonly hasSub: boolean
  readonly subText: string | null
  readonly text: string
}

/** One list panel, as the owner reads it. */
type ListReading = {
  readonly place: Place
  readonly name: string | null
  readonly head: readonly string[]
  readonly rows: readonly RowReading[]
  readonly foot: {
    readonly count: string | null
    readonly cents: string | null
    readonly text: string
    readonly bed: string
    readonly ink: string
  } | null
}

/** The pill, as the owner reads it. */
type PillReading = {
  readonly present: boolean
  readonly name: string | null
  readonly height: number
  readonly bed: string
  readonly radius: string
  readonly width: number
  readonly tabs: ReadonlyArray<{ readonly name: string; readonly selected: string | null; readonly ink: string }>
  readonly thumb: { readonly bed: string; readonly radius: string; readonly width: number } | null
}

/** The whole Statement screen, as the owner reads it. */
type ScreenReading = {
  readonly present: boolean
  readonly shown: string | null
  readonly pill: PillReading
  readonly sent: ListReading
  readonly back: ListReading
  readonly alerts: number
  readonly writingControls: number
  readonly pageScrolls: boolean
}

// ===== The independent oracle: what the stored rows mean, worded here =====

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

const dollars = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** The day and short month a date reads as, with no leading zero: '2026-09-17' is '17 Sep'. */
const shortDateNoYear = (date: string): string => {
  const parts = date.split('-')
  const month = MONTHS[Number(parts[1]) - 1] ?? parts[1] ?? ''
  return `${Number(parts[2])} ${month}`.trim()
}

/** A USD figure as a footer and the card read it, and as a row cell reads it unsigned. */
const usdWithSign = (cents: number): string => `$${dollars.format(Math.abs(cents) / 100)}`
const usdNoSign = (cents: number): string => dollars.format(Math.abs(cents) / 100)

/** A stored rate as a sub-line words it: no trailing zeros, at most four decimals. */
const plainRate = (stored: string): string =>
  stored.includes('.') ? stored.replace(/0+$/, '').replace(/\.$/, '') : stored

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

/** The kind of entry each list holds: the sends on one side, the repayments on the other. */
const KIND_OF: Record<Which, 'send' | 'receive'> = { sent: 'send', back: 'receive' }

/** The rows one list holds, in the order the owner reads them. */
const storedRowsOf = (stored: readonly StoredLedgerRow[], which: Which): readonly StoredLedgerRow[] =>
  oldestFirst(stored.filter((row) => row.kind === KIND_OF[which]))

/** The word a stored method means in a Method cell; a null or unknown token says nothing. */
const methodWordOf = (row: StoredLedgerRow): string =>
  row.method === null ? '' : (METHOD_WORDS[row.method as Method] ?? '')

/** The numbers a list's rows carry: 1 upward within that list alone. */
const expectedNumbers = (count: number): readonly string[] =>
  Array.from({ length: count }, (_unused, index) => String(index + 1))

/** What a list's footer says, counts and sums, from its own rows alone. */
const expectedFoot = (
  stored: readonly StoredLedgerRow[],
  which: Which,
): { count: string; cents: string; text: string } => {
  const rows = storedRowsOf(stored, which)
  const cents = rows.reduce((sum, row) => sum + row.usd_cents, 0)
  const words = which === 'sent' ? 'Total sent' : 'Total paid back'
  return {
    count: String(rows.length),
    cents: String(cents),
    text: `${words} ${DOT} ${countLabel(rows.length)} ${usdWithSign(cents)}`,
  }
}

// ===== The stimulus: the stored ledgers the owner signs in to =====

const ACCOUNT_NINE = { email: 'owner-lists-a@abbaas.test', password: 'lists-password-a1' } as const
const ACCOUNT_EMPTY = { email: 'owner-lists-b@abbaas.test', password: 'lists-password-b2' } as const
const ACCOUNT_SENDS_ONLY = { email: 'owner-lists-c@abbaas.test', password: 'lists-password-c3' } as const
const ACCOUNT_BACKS_ONLY = { email: 'owner-lists-d@abbaas.test', password: 'lists-password-d4' } as const
const ACCOUNT_GENERATED = { email: 'owner-lists-g@abbaas.test', password: 'lists-password-g5' } as const
const ACCOUNT_LONG = { email: 'owner-lists-l@abbaas.test', password: 'lists-password-l6' } as const
const ACCOUNT_OFFERED = { email: 'owner-lists-r@abbaas.test', password: 'lists-password-r7' } as const

const AHMED = 'Ahmed Shifaz'
const MARIYAM = 'Mariyam Nisha'

/** The five sends of the month: two in rufiyaa, one of them with no stored method. */
const FIVE_SENDS: readonly EntrySeed[] = [
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

/** The four repayments: one by cash, one by cheque, one with nothing stored, one by transfer. */
const FOUR_REPAYMENTS: readonly EntrySeed[] = [
  {
    kind: 'receive',
    currency: 'USD',
    amountMinor: 500000,
    rate: null,
    usdCents: 500000,
    entryDate: '2026-09-17',
    savedAt: '2026-09-17T09:00:00Z',
    method: 'cash',
  },
  {
    kind: 'receive',
    currency: 'USD',
    amountMinor: 600000,
    rate: null,
    usdCents: 600000,
    entryDate: '2026-09-23',
    savedAt: '2026-09-23T09:00:00Z',
    method: 'cheque',
  },
  {
    kind: 'receive',
    currency: 'USD',
    amountMinor: 300000,
    rate: null,
    usdCents: 300000,
    entryDate: '2026-10-02',
    savedAt: '2026-10-02T09:00:00Z',
    method: null,
  },
  {
    kind: 'receive',
    currency: 'USD',
    amountMinor: 200000,
    rate: null,
    usdCents: 200000,
    entryDate: '2026-10-08',
    savedAt: '2026-10-08T09:00:00Z',
    method: 'transfer',
  },
]

const NINE: readonly EntrySeed[] = [...FIVE_SENDS, ...FOUR_REPAYMENTS]

/** What the four seeded repayments add up to, stated so a wrong sum cannot pass unnoticed. */
const BACK_TOTAL_CENTS = 1600000
const BACK_ROW_COUNT = 4
/** The dates and the method words those four repayments mean, oldest first. */
const BACK_DATES = ['17 Sep', '23 Sep', '2 Oct', '8 Oct'] as const
const BACK_METHOD_WORDS = ['Cash', 'Cheque', '', 'Transfer'] as const

/** How long the ledger of the long-ledger owner is, and how it is made. */
const LONG_LEDGER_ROWS = 500

const longLedgerOfRepayments = (rows: number): readonly EntrySeed[] =>
  Array.from({ length: rows }, (_unused, index) => {
    const day = (index % 28) + 1
    const month = (index % 12) + 1
    const stamp = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return {
      kind: 'receive' as const,
      currency: 'USD' as const,
      amountMinor: 1000 + index,
      rate: null,
      usdCents: 1000 + index,
      entryDate: stamp,
      savedAt: `${stamp}T0${index % 10}:${String(index % 60).padStart(2, '0')}:00Z`,
      method: (['cash', 'cheque', 'transfer', null] as const)[index % 4] ?? null,
    }
  })

let stack: Stack
let served: ServedOrigin
let nine: Account
let emptyAccount: Account
let sendsOnly: Account
let backsOnly: Account
let generated: Account
let long: Account
let offered: Account
let generatedPeople: ReadonlyMap<string, string>

test.use({ viewport: VIEWPORT })
// Not serial: each scenario signs in as its own owner and reads its own ledger, so one
// scenario's disagreement cannot hide what the others observe.

test.beforeAll(async () => {
  stack = startLocalStack()
  buildBundle(stack)
  served = await serveDist()

  nine = await createAccount(stack, ACCOUNT_NINE)
  const ninePeople = await seedPeopleByName(stack, nine, [AHMED, MARIYAM])
  await replaceEntries(stack, nine, NINE, ninePeople)

  emptyAccount = await createAccount(stack, ACCOUNT_EMPTY)

  sendsOnly = await createAccount(stack, ACCOUNT_SENDS_ONLY)
  const sendsOnlyPeople = await seedPeopleByName(stack, sendsOnly, [AHMED, MARIYAM])
  await replaceEntries(stack, sendsOnly, FIVE_SENDS, sendsOnlyPeople)

  backsOnly = await createAccount(stack, ACCOUNT_BACKS_ONLY)
  await replaceEntries(stack, backsOnly, FOUR_REPAYMENTS)

  generated = await createAccount(stack, ACCOUNT_GENERATED)
  generatedPeople = await seedPeopleByName(stack, generated, [AHMED, MARIYAM])

  long = await createAccount(stack, ACCOUNT_LONG)
  await replaceEntries(stack, long, longLedgerOfRepayments(LONG_LEDGER_ROWS))

  offered = await createAccount(stack, ACCOUNT_OFFERED)
})

test.afterAll(async () => {
  await served?.close()
})

// ===== The steps this oracle's scenarios are written in =====

const statementTab = (page: Page): Locator => page.locator('[data-view="statement"]')
const entriesTab = (page: Page): Locator => page.locator('[data-view="entries"]')
const statement = (page: Page): Locator => page.locator('[data-screen="statement"]')
const statementPane = (page: Page): Locator => page.locator('[data-pane="statement"]')
const listTab = (page: Page, which: Which): Locator => page.getByRole('tab', { name: TAB_NAME[which] })

const givenTheOwnerIsSignedIn = async (page: Page, account: Account): Promise<void> => {
  await page.goto(ORIGIN)
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen never appeared. WHY: every reading of the two lists starts from a signed-in owner. HOW: serve the built bundle and let it mount its sign-in screen.',
  ).toBeVisible()
  await page.getByLabel('Email').fill(account.email)
  await page.getByLabel('Password').fill(account.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen stayed up after Sign in. WHY: the owner cannot reach the Statement until the app lets them in. HOW: confirm the seeded account and let sign-in replace the screen.',
  ).toHaveCount(0)
}

/** Which list the screen says it shows, and where each panel lies against the phone. */
const readPlaces = (
  page: Page,
): Promise<{ shown: string | null; sent: Place; back: Place }> =>
  page.evaluate(() => {
    const placeOf = (element: Element | null): 'absent' | 'inside' | 'outside' | 'partly' => {
      if (!element) return 'absent'
      const rect = element.getBoundingClientRect()
      const width = window.innerWidth
      if (rect.width === 0 && rect.height === 0) return 'absent'
      if (rect.left > -2 && rect.right < width + 2) return 'inside'
      if (rect.right <= 2 || rect.left >= width - 2) return 'outside'
      return 'partly'
    }
    const screen = document.querySelector('[data-screen="statement"]')
    return {
      shown: screen?.getAttribute('data-statement-shown') ?? null,
      sent: placeOf(screen?.querySelector('[data-statement-list="sent"]') ?? null),
      back: placeOf(screen?.querySelector('[data-statement-list="back"]') ?? null),
    }
  })

/** Waits until the switch has come to rest on the named list, and says so when it never does. */
const theShownListComesToRest = async (page: Page, which: Which): Promise<void> => {
  const resting = which === 'sent' ? 'sent | inside | outside' : 'back | outside | inside'
  await expect
    .poll(
      async () => {
        const places = await readPlaces(page)
        return `${places.shown} | ${places.sent} | ${places.back}`
      },
      {
        message: `WHAT: the Statement never came to rest showing the ${which === 'sent' ? 'sent' : 'paid-back'} list alone, reading its shown attribute and where each panel lies. WHY: exactly one list is shown at a time, and a panel resting half-way or two panels on screen tell the owner nothing. HOW: write the shown list as one attribute and place the shown panel in the viewport and the other wholly outside it.`,
        timeout: 15_000,
      },
    )
    .toBe(resting)
}

/**
 * The marks of the parts of a switch that are still moving, named by their own journey or
 * kind: a sliding track, a sliding pair of panels, and the arriving screen's card,
 * pill, panel and pinned parts. Two marks are left out on purpose. A row rising or crossing
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

const whenTheOwnerOpensTheStatement = async (page: Page): Promise<void> => {
  await expect(
    statementTab(page),
    'WHAT: there is no Statement tab to tap on the bottom bar. WHY: a tap on that tab is the only way into the Statement and its two lists. HOW: draw the bottom bar with its Entries and Statement tabs.',
  ).toBeVisible()
  await statementTab(page).click()
  await expect(
    statement(page),
    'WHAT: tapping Statement showed no statement screen. WHY: the tap is what brings the pill and both lists into the viewport. HOW: show the pane whose screen carries data-screen=statement.',
  ).toBeVisible()
  await theShownListComesToRest(page, 'sent')
  await thenEveryPartHasComeToRest(page)
}

const whenTheOwnerTapsTheList = async (page: Page, which: Which): Promise<void> => {
  await expect(
    listTab(page, which),
    `WHAT: there is no tab named ${TAB_NAME[which]} to tap. WHY: the pill's two tabs are how the owner moves between what they sent and what Abbaas paid back. HOW: offer both tabs in a tablist named ${PILL_NAME}.`,
  ).toBeVisible()
  await listTab(page, which).click()
  await theShownListComesToRest(page, which)
  await thenEveryPartHasComeToRest(page)
}

/** Reads the pill and both lists in one pass, answering even when the screen is not there. */
const readScreen = (page: Page): Promise<ScreenReading> =>
  page.evaluate((): ScreenReading => {
    const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()
    const placeOf = (element: Element | null): Place => {
      if (!element) return 'absent'
      const rect = element.getBoundingClientRect()
      const width = window.innerWidth
      if (rect.width === 0 && rect.height === 0) return 'absent'
      if (rect.left > -2 && rect.right < width + 2) return 'inside'
      if (rect.right <= 2 || rect.left >= width - 2) return 'outside'
      return 'partly'
    }
    const root = document.documentElement
    const pageScrolls = root.scrollHeight > root.clientHeight + 1 || root.scrollTop !== 0
    const noList: ListReading = { place: 'absent', name: null, head: [], rows: [], foot: null }
    const noPill: PillReading = {
      present: false,
      name: null,
      height: 0,
      bed: '',
      radius: '',
      width: 0,
      tabs: [],
      thumb: null,
    }
    const screen = document.querySelector('[data-screen="statement"]')
    if (!screen) {
      return {
        present: false,
        shown: null,
        pill: noPill,
        sent: noList,
        back: noList,
        alerts: document.querySelectorAll('[data-pane="statement"] [role="alert"]').length,
        writingControls: 0,
        pageScrolls,
      }
    }

    const readList = (which: string): ListReading => {
      const panel = screen.querySelector(`[data-statement-list="${which}"]`)
      if (!panel) return noList
      const head = Array.from(screen.querySelectorAll(`[data-statement-head="${which}"] > *`)).map((cell) =>
        squash(cell.textContent),
      )
      const rows: RowReading[] = Array.from(panel.querySelectorAll('[data-statement-row]')).map((row) => {
        const cells = Array.from(row.children)
        const last = cells[cells.length - 1] ?? row
        const sub = row.querySelector('[data-statement-sub]')
        return {
          id: row.getAttribute('data-statement-row') ?? '',
          no: row.getAttribute('data-no') ?? '',
          cells: cells.map((cell) => squash(cell.textContent)),
          usd: squash(last.textContent),
          usdInk: window.getComputedStyle(last).color,
          hasPerson: row.querySelector('[data-person]') !== null,
          hasSub: sub !== null,
          subText: sub === null ? null : squash(sub.textContent),
          text: squash(row.textContent),
        }
      })
      const footElement = screen.querySelector(`[data-statement-foot="${which}"]`)
      const footStyle = footElement === null ? null : window.getComputedStyle(footElement)
      return {
        place: placeOf(panel),
        name: panel.getAttribute('aria-label'),
        head,
        rows,
        foot:
          footElement === null || footStyle === null
            ? null
            : {
                count: footElement.getAttribute('data-count'),
                cents: footElement.getAttribute('data-cents'),
                text: squash(footElement.textContent),
                bed: footStyle.backgroundColor,
                ink: footStyle.color,
              },
      }
    }

    const tablist = screen.querySelector('[role="tablist"]')
    const tablistStyle = tablist === null ? null : window.getComputedStyle(tablist)
    const thumbElement =
      tablist === null
        ? null
        : (Array.from(tablist.children).find((child) => child.getAttribute('aria-hidden') === 'true') ?? null)
    const thumbStyle = thumbElement === null ? null : window.getComputedStyle(thumbElement)
    const pill: PillReading =
      tablist === null || tablistStyle === null
        ? noPill
        : {
            present: true,
            name: tablist.getAttribute('aria-label'),
            height: Math.round(tablist.getBoundingClientRect().height),
            bed: tablistStyle.backgroundColor,
            radius: tablistStyle.borderTopLeftRadius,
            width: tablist.getBoundingClientRect().width,
            tabs: Array.from(tablist.querySelectorAll('[role="tab"]')).map((tab) => ({
              name: squash(tab.textContent),
              selected: tab.getAttribute('aria-selected'),
              ink: window.getComputedStyle(tab).color,
            })),
            thumb:
              thumbElement === null || thumbStyle === null
                ? null
                : {
                    bed: thumbStyle.backgroundColor,
                    radius: thumbStyle.borderTopLeftRadius,
                    width: thumbElement.getBoundingClientRect().width,
                  },
          }

    const writingControls =
      screen.querySelectorAll('[data-box], [data-action]').length +
      Array.from(screen.querySelectorAll('button, a')).filter((control) =>
        ['Send', 'Receive'].includes(squash(control.textContent)),
      ).length

    return {
      present: true,
      shown: screen.getAttribute('data-statement-shown'),
      pill,
      sent: readList('sent'),
      back: readList('back'),
      alerts: document.querySelectorAll('[data-pane="statement"] [role="alert"]').length,
      writingControls,
      pageScrolls,
    }
  })

/** The box of one part of the screen, read only once the part is really there. */
const boxOf = async (
  locator: Locator,
  what: string,
): Promise<{ x: number; y: number; width: number; height: number }> => {
  await expect(
    locator,
    `WHAT: ${what} is not on the screen to measure. WHY: the steady layout is a claim about where that part stays through a switch. HOW: draw it inside the statement pane.`,
  ).toBeVisible()
  const box = await locator.boundingBox()
  if (!box) throw new Error(`${what} has no layout box`)
  return box
}

/** What stands above the balance card inside the Statement, and any heading inside it. */
const readWhatStandsAboveTheCard = (page: Page): Promise<{ above: readonly string[]; headings: number }> =>
  page.evaluate(() => {
    const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()
    const screen = document.querySelector('[data-screen="statement"]')
    if (!screen) return { above: ['there is no statement screen at all'], headings: 0 }
    const chain: Element[] = []
    for (let part: Element | null = screen.querySelector('[data-statement-total]'); part !== null && part !== screen; part = part.parentElement) {
      chain.push(part)
    }
    const cardPart = chain[chain.length - 1] ?? null
    const above: string[] = []
    if (cardPart === null) return { above: ['there is no balance card inside the pane'], headings: 0 }
    for (const part of Array.from(screen.children)) {
      if (part === cardPart) break
      above.push(`${part.tagName.toLowerCase()} '${squash(part.textContent).slice(0, 40)}'`)
    }
    return { above, headings: screen.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]').length }
  })

/** The two boxes that must not move: the balance card and the pill. */
const readSteadyBoxes = async (
  page: Page,
): Promise<Record<'card' | 'pill', { x: number; y: number; width: number; height: number }>> => ({
  card: await boxOf(statement(page).locator('[data-statement-total="balance"]'), "the balance card's Balance figure"),
  pill: await boxOf(statement(page).getByRole('tablist', { name: PILL_NAME }), 'the pill'),
})

/** Scrolls one list's rows area to its end and says how far it travelled. */
const scrollRowsToTheEnd = (page: Page, which: Which): Promise<number> =>
  page.evaluate((list) => {
    const area = document.querySelector(`[data-statement-rows="${list}"]`)
    if (!area) return -1
    area.scrollTop = area.scrollHeight
    return area.scrollTop
  }, which)

// ===== The scenarios =====

test('the statement opens on what the owner sent, and offers the paid-back list beside it', async ({
  page,
}) => {
  // Given an owner with a month of sends and repayments recorded
  await givenTheOwnerIsSignedIn(page, nine)

  // When the owner opens the Statement
  await whenTheOwnerOpensTheStatement(page)

  // Then a pill offers both lists, the sent one is selected, and its thumb is blue under it
  const reading = await readScreen(page)
  expect(
    reading.pill.name,
    `WHAT: the Statement has no pill named '${PILL_NAME}'. WHY: the pill is how the owner is told there are two lists and which one they are reading. HOW: draw a tablist with that accessible name above the panels.`,
  ).toBe(PILL_NAME)
  expect(
    reading.pill.tabs.map((tab) => tab.name),
    `WHAT: the pill does not offer exactly '${SENT_TAB}' and '${BACK_TAB}'. WHY: those two names are what tell the owner which way round the money went. HOW: draw two tabs with those names, in that order.`,
  ).toEqual([SENT_TAB, BACK_TAB])
  expect(
    reading.pill.tabs.map((tab) => tab.selected),
    'WHAT: the Statement does not open with the sent tab selected and the other not. WHY: exactly one list is being read, and the owner opens on what they sent. HOW: carry aria-selected=true on the shown tab and false on the other.',
  ).toEqual(['true', 'false'])
  expect(
    reading.shown,
    'WHAT: the statement screen does not say it is showing the sent list. WHY: the shown list is one attribute, which is the whole of this state. HOW: carry data-statement-shown=sent when the Statement is built.',
  ).toBe('sent')
  expect(
    reading.pill.thumb?.bed,
    `WHAT: the thumb under the selected tab is not the blue of the sent list. WHY: the colour is the owner's glance-check of which list they are in. HOW: paint the thumb ${SENT_THUMB} on the sent list.`,
  ).toBe(SENT_THUMB)
  expect(
    reading.pill.tabs.map((tab) => tab.ink),
    'WHAT: the selected tab and the resting tab are not inked white and grey-green. WHY: the selected word must read against the thumb and the other against the pill. HOW: ink the selected tab white and the other one the board\'s resting grey-green.',
  ).toEqual([SELECTED_INK, RESTING_INK])
  expect(
    [reading.pill.height, reading.pill.bed, reading.pill.radius, reading.pill.thumb?.radius],
    'WHAT: the pill is not the board\'s pill: 44 px tall, on its own pale bed, rounded 14, with a thumb rounded 10. WHY: the board is the authority for every size and colour of this screen. HOW: draw the pill the board draws.',
  ).toEqual([PILL_HEIGHT, PILL_BED, PILL_RADIUS, THUMB_RADIUS])
  expect(
    Math.abs((reading.pill.thumb?.width ?? 0) - (reading.pill.width / 2 - THUMB_INSET)),
    'WHAT: the thumb does not span one half of the pill less six pixels. WHY: a thumb under both tabs, or under neither, names no list at all. HOW: give the thumb the width the board gives it.',
  ).toBeLessThanOrEqual(PIXEL)
  const top = await readWhatStandsAboveTheCard(page)
  expect(
    [top.above, top.headings],
    'WHAT: something stands above the balance card inside the Statement, or a heading is drawn inside the pane. WHY: the owner asked to start at the figures, so the card is the first part of this screen and the view names itself through its tab and the pane. HOW: draw the card first inside the pane, with no heading and no line of dates before it.',
  ).toEqual([[], 0])
  await expect(
    page.getByRole('region', { name: 'Statement' }),
    'WHAT: the statement pane is not named Statement. WHY: dropping the heading must not cost an owner using a screen reader the name of the view they are in. HOW: keep the pane\'s accessible name Statement.',
  ).toHaveCount(1)
  expect(
    [reading.sent.name, reading.back.name],
    `WHAT: the two panels are not still named '${SENT_TAB}' and '${BACK_TAB}'. WHY: the owner reading a list with a screen reader must be told which list it is. HOW: keep those accessible names on the two panels.`,
  ).toEqual([SENT_TAB, BACK_TAB])
  expect(
    [reading.sent.place, reading.back.place],
    'WHAT: the Statement does not open with the sent panel in the viewport and the paid-back panel wholly outside it. WHY: both panels stand in the document at once, so the one not being read must be off the phone rather than hidden away. HOW: place both panels in one area and move the other out of view.',
  ).toEqual(['inside', 'outside'])
})

test('a tap on the paid-back list reads every repayment oldest first, its stored method and its own total', async ({
  page,
}) => {
  // Given an owner reading the statement, with the ledger read once already
  let entryReads = 0
  await page.route(ENTRIES_ENDPOINT, async (route) => {
    if (route.request().method() === 'GET') entryReads += 1
    await route.continue()
  })
  await givenTheOwnerIsSignedIn(page, nine)
  await whenTheOwnerOpensTheStatement(page)
  const readsBeforeTheTap = entryReads
  const stored = await readStoredLedger(stack, nine)
  const repayments = storedRowsOf(stored, 'back')

  // When the owner taps the paid-back list
  await whenTheOwnerTapsTheList(page, 'back')

  // Then the paid-back list reads, oldest first, what the ledger stores
  const reading = await readScreen(page)
  const foot = expectedFoot(stored, 'back')
  expect(
    [repayments.length, Number(foot.cents)],
    'WHAT: the stored repayments are not the four rows adding to $16,000.00 this oracle expects. WHY: the footer and the rows are judged against the stored ledger, so the stimulus must be the one the design fixes. HOW: seed the four repayments of 500000, 600000, 300000 and 200000 cents.',
  ).toEqual([BACK_ROW_COUNT, BACK_TOTAL_CENTS])

  expect(
    reading.pill.tabs.map((tab) => tab.selected),
    'WHAT: the tap did not move the selection to the paid-back tab. WHY: exactly one tab is selected, and it must be the one the owner tapped. HOW: exchange the two aria-selected values on a tap.',
  ).toEqual(['false', 'true'])
  expect(
    reading.shown,
    'WHAT: the screen does not say it is showing the paid-back list. WHY: the shown list is one attribute, and it is the whole of this state. HOW: write data-statement-shown=back on the tap.',
  ).toBe('back')
  expect(
    reading.pill.thumb?.bed,
    `WHAT: the thumb stayed blue on the paid-back list. WHY: the colour is what tells the owner, at a glance, that they are reading what came back. HOW: paint the thumb ${BACK_THUMB} on the paid-back list.`,
  ).toBe(BACK_THUMB)
  expect(
    [reading.back.place, reading.sent.place],
    'WHAT: the paid-back panel is not in the viewport with the sent panel wholly outside it. WHY: the owner reads one list at a time, and both panels stand in the document at once. HOW: move the shown panel in and the other out.',
  ).toEqual(['inside', 'outside'])
  expect(
    reading.back.head,
    'WHAT: the paid-back column header does not read No., Date, Method and USD. WHY: those four words are what make the four cells of a repayment readable. HOW: draw the header the board draws for this list.',
  ).toEqual(['No.', 'Date', 'Method', 'USD'])
  expect(
    reading.back.rows.map((row) => row.no),
    'WHAT: the repayments are not numbered 1 upward in document order. WHY: the numbering is how the owner counts what Abbaas paid back. HOW: number the repayments 1 upward within their own list, oldest first.',
  ).toEqual(expectedNumbers(repayments.length))
  expect(
    reading.back.rows.map((row) => row.id),
    'WHAT: the paid-back rows are not the stored repayments, oldest first. WHY: a missing, extra or misplaced repayment misstates what came back. HOW: list every stored repayment once, by entry date, then by the instant it was saved, then by its id.',
  ).toEqual(repayments.map((row) => row.id))
  expect(
    reading.back.rows.map((row) => row.cells.slice(0, 4)),
    'WHAT: a repayment does not read its number, its stored date, its stored method and its stored dollars across the row. WHY: this list is the statement of what came back: a wrong date, a wrong method or a wrong figure misstates it. HOW: build each row from its own stored entry.',
  ).toEqual(
    repayments.map((row, index) => [
      String(index + 1),
      shortDateNoYear(row.entry_date),
      methodWordOf(row),
      usdNoSign(row.usd_cents),
    ]),
  )
  expect(
    [reading.back.rows.map((row) => row.cells[1] ?? ''), reading.back.rows.map((row) => row.cells[2] ?? '')],
    'WHAT: the four repayments do not read 17 Sep, 23 Sep, 2 Oct and 8 Oct with Cash, Cheque, nothing and Transfer. WHY: those are the days and the ways the money came back, and the row stored without a method must say nothing in its place. HOW: word each cell from the stored entry and invent nothing for a missing method.',
  ).toEqual([[...BACK_DATES], [...BACK_METHOD_WORDS]])
  expect(
    reading.back.rows.map((row) => row.usdInk),
    'WHAT: a paid-back figure is not inked the board\'s teal. WHY: the colour is what separates money that came back from money that went out. HOW: ink this list\'s figures teal.',
  ).toEqual(repayments.map(() => BACK_FIGURE_INK))
  expect(
    reading.back.rows.filter((row) => row.text.includes('$')).length,
    'WHAT: a paid-back row prints a currency sign. WHY: the column is headed USD and every figure on this screen is in US dollars. HOW: draw each row\'s figure unsigned.',
  ).toBe(0)
  expect(
    reading.back.rows.filter((row) => row.hasPerson || row.hasSub).length,
    'WHAT: a repayment names a person or carries a sub-line. WHY: a repayment names nobody and has no rate or rufiyaa figure to word, so anything there would be invented. HOW: build a repayment row from its number, its date, its method and its dollars alone.',
  ).toBe(0)
  expect(
    [reading.back.foot?.count, reading.back.foot?.cents, reading.back.foot?.text],
    'WHAT: the paid-back footer does not read Total paid back with the count and the total of its own rows. WHY: the footer is the owner\'s check that the list and the card agree. HOW: count the stored repayments and add their stored dollars.',
  ).toEqual([foot.count, foot.cents, foot.text])
  expect(
    [reading.back.foot?.bed, reading.back.foot?.ink],
    'WHAT: the paid-back footer is not on the board\'s pale teal bed in its deep teal ink. WHY: the board is the authority for the colours of this screen. HOW: paint the footer as the board paints it.',
  ).toEqual([BACK_FOOT_BED, BACK_FOOT_INK])
  expect(
    reading.writingControls,
    'WHAT: the paid-back list offers something that records money. WHY: the Statement only reports: a balance box or a Send or Receive control here would let the owner write from a screen that reports. HOW: draw no data-box, no data-action and no control named Send or Receive on this screen.',
  ).toBe(0)
  expect(
    entryReads - readsBeforeTheTap,
    'WHAT: switching lists read the ledger again. WHY: both lists are built from one read, so the two can never disagree and a switch costs the owner nothing. HOW: switch on the shown attribute alone, reading nothing.',
  ).toBe(0)
})

for (const settled of [
  { label: 'with a repayment stored without a method', account: () => nine },
  { label: 'with nothing paid back yet', account: () => sendsOnly },
] as const) {
  test(`a look at the paid-back list and back leaves the sent list and the screen as they were, ${settled.label}`, async ({
    page,
  }) => {
    // Given an owner reading the sent list of their statement
    await givenTheOwnerIsSignedIn(page, settled.account())
    await whenTheOwnerOpensTheStatement(page)
    const stored = await readStoredLedger(stack, settled.account())
    const before = await readScreen(page)
    const boxesBefore = await readSteadyBoxes(page)
    expect(
      before.sent.rows.map((row) => row.id),
      'WHAT: the sent list does not hold the stored sends before the switch. WHY: a round trip that restores an empty list restores nothing, so the reading taken first must be the real one. HOW: list every stored send on the sent panel.',
    ).toEqual(storedRowsOf(stored, 'sent').map((row) => row.id))

    // When the owner looks at what came back and taps straight back
    await whenTheOwnerTapsTheList(page, 'back')
    await whenTheOwnerTapsTheList(page, 'sent')

    // Then every reading of the sent list is what it was, and nothing around it moved
    const after = await readScreen(page)
    const boxesAfter = await readSteadyBoxes(page)
    expect(
      [after.shown, after.pill.tabs.map((tab) => tab.selected), after.pill.thumb?.bed],
      'WHAT: tapping back does not return the Statement to the sent list, selected and blue. WHY: a switch there and back must leave the owner exactly where they started. HOW: write the shown attribute, both aria-selected values and the thumb colour on every tap.',
    ).toEqual(['sent', ['true', 'false'], SENT_THUMB])
    expect(
      [after.sent.head, after.sent.rows.map((row) => row.text), after.sent.foot],
      'WHAT: the sent list does not read exactly as it did before the round trip. WHY: looking at what came back and returning changes nothing the owner can see about what they sent. HOW: switch the shown panel rather than rebuilding either list.',
    ).toEqual([before.sent.head, before.sent.rows.map((row) => row.text), before.sent.foot])
    expect(
      after.sent.rows.map((row) => [row.id, row.no, row.subText]),
      'WHAT: a sent row lost its number, its place or its sub-line in the round trip. WHY: the sub-line is the stored method and, for a rufiyaa send, its figure and rate: losing it in a switch misstates the entry. HOW: keep the rows mounted and move the panel.',
    ).toEqual(before.sent.rows.map((row) => [row.id, row.no, row.subText]))
    const ratedRows = storedRowsOf(stored, 'sent').filter((row) => row.rate !== null)
    expect(
      ratedRows.map(
        (row) =>
          after.sent.rows.find((seen) => seen.id === row.id)?.subText?.includes(`@ ${plainRate(row.rate ?? '')}`) ??
          false,
      ),
      'WHAT: a rufiyaa send\'s sub-line does not name its stored rate with no trailing zeros after the round trip. WHY: a padded rate reads \'@ 20.00\' where the owner gave 20, which states a rate they never gave. HOW: word the rate with no trailing zeros, and keep the row through a switch.',
    ).toEqual(ratedRows.map(() => true))
    for (const part of ['card', 'pill'] as const) {
      expect(
        Math.abs(boxesAfter[part].y - boxesBefore[part].y) + Math.abs(boxesAfter[part].x - boxesBefore[part].x),
        `WHAT: the ${part === 'card' ? 'balance card' : 'pill'} moved across the two switches. WHY: only the lists move: a card or a pill that shifts makes the screen jump under the owner's thumb. HOW: switch the panels inside their own area, leaving everything above it alone.`,
      ).toBeLessThanOrEqual(PIXEL)
    }
    expect(
      after.pageScrolls,
      'WHAT: the page itself can scroll after the round trip. WHY: a page that scrolls carries the bottom bar and the figures off the phone. HOW: keep every scrolling area inside a pane of exactly the viewport height.',
    ).toBe(false)
    const balanceFigure = await statement(page).locator('[data-statement-total="balance"]').innerText()
    expect(
      /[-−]/.test(balanceFigure),
      'WHAT: the Balance figure carries a sign. WHY: the balance is the unsigned difference between what went out and what came back, so a minus there would read as money owed the other way. HOW: show the balance unsigned.',
    ).toBe(false)
  })
}

for (const oneSided of [
  { label: 'nothing sent yet', account: () => backsOnly, emptyList: 'sent' as Which, fullList: 'back' as Which },
  { label: 'nothing paid back yet', account: () => sendsOnly, emptyList: 'back' as Which, fullList: 'sent' as Which },
] as const) {
  test(`with ${oneSided.label}, each list still stands on its own and only one is shown`, async ({ page }) => {
    // Arrange an owner whose ledger holds only one kind of entry
    await givenTheOwnerIsSignedIn(page, oneSided.account())
    await whenTheOwnerOpensTheStatement(page)
    const stored = await readStoredLedger(stack, oneSided.account())

    // Act: read both lists, by tapping the one that is not shown
    const opened = await readScreen(page)
    await whenTheOwnerTapsTheList(page, 'back')
    const switched = await readScreen(page)

    // Assert: exactly one tab and one panel at a time, and the one-sided lists read true
    expect(
      [
        opened.pill.tabs.filter((tab) => tab.selected === 'true').length,
        switched.pill.tabs.filter((tab) => tab.selected === 'true').length,
      ],
      'WHAT: a one-sided ledger leaves none or both of the pill\'s tabs selected. WHY: exactly one list is being read at any moment, whatever the ledger holds. HOW: write both aria-selected values together on every tap.',
    ).toEqual([1, 1])
    expect(
      [
        [opened.sent.place, opened.back.place],
        [switched.sent.place, switched.back.place],
      ],
      'WHAT: a one-sided ledger does not keep exactly one panel in the viewport. WHY: an empty list is still a list the owner may read, and two panels on screen name neither. HOW: place the shown panel in the viewport and the other wholly outside, at every ledger shape.',
    ).toEqual([
      ['inside', 'outside'],
      ['outside', 'inside'],
    ])
    expect(
      [opened.pill.thumb?.bed, switched.pill.thumb?.bed],
      'WHAT: the thumb does not take the colour of the list being shown on a one-sided ledger. WHY: the colour names the list, not the rows in it. HOW: paint the thumb from the shown list alone.',
    ).toEqual([SENT_THUMB, BACK_THUMB])
    const emptyReading = oneSided.emptyList === 'sent' ? switched.sent : switched.back
    const fullReading = oneSided.fullList === 'sent' ? switched.sent : switched.back
    expect(
      [emptyReading.rows.length, emptyReading.head.length > 0, emptyReading.foot?.count, emptyReading.foot?.cents],
      'WHAT: the list with nothing in it has no column header or does not count none. WHY: the owner must be able to read that one side of the ledger is genuinely empty, not missing. HOW: draw the header and a footer of No entries and $0.00 for an empty list.',
    ).toEqual([0, true, '0', '0'])
    expect(
      [fullReading.rows.map((row) => row.id), fullReading.foot?.count],
      'WHAT: the list that holds every entry does not hold them all, numbered from its own rows. WHY: with one kind only, every stored entry belongs to one list and none to the other. HOW: split the read ledger by kind and number each list from its own rows.',
    ).toEqual([storedRowsOf(stored, oneSided.fullList).map((row) => row.id), String(stored.length)])
  })
}

test('an owner with nothing recorded reads both lists empty, and neither counts an entry', async ({ page }) => {
  // Given an owner who has recorded nothing at all
  await givenTheOwnerIsSignedIn(page, emptyAccount)
  await whenTheOwnerOpensTheStatement(page)

  // When the owner looks at what came back
  await whenTheOwnerTapsTheList(page, 'back')

  // Then both lists read their header, no row and a footer of none
  const reading = await readScreen(page)
  expect(
    reading.back.head,
    'WHAT: the paid-back column header is missing on an empty ledger. WHY: the owner must see what the list would hold before anything is in it. HOW: draw the header whether or not there is a row.',
  ).toEqual(['No.', 'Date', 'Method', 'USD'])
  expect(
    [reading.sent.rows.length, reading.back.rows.length],
    'WHAT: an empty ledger shows a row in one of the lists. WHY: a row the owner never recorded is a lie about their money. HOW: list a row for each stored entry of that kind and no other.',
  ).toEqual([0, 0])
  expect(
    [reading.back.foot?.text, reading.sent.foot?.text],
    `WHAT: the two footers of an empty ledger do not read 'Total paid back ${DOT} No entries $0.00' and 'Total sent ${DOT} No entries $0.00'. WHY: 'No entries' is how this app words a count of none, and both sides of an empty ledger are empty in the same way. HOW: word each count from the rows of its own list.`,
  ).toEqual([
    `Total paid back ${DOT} No entries $0.00`,
    `Total sent ${DOT} No entries $0.00`,
  ])
  expect(
    [reading.back.foot?.count, reading.back.foot?.cents, reading.sent.foot?.count, reading.sent.foot?.cents],
    'WHAT: an empty footer does not carry a count of 0 and a total of 0. WHY: the footer\'s own numbers are what a reader checks its words against. HOW: carry the count and the cents of the rows each footer sums.',
  ).toEqual(['0', '0', '0', '0'])
  expect(
    reading.alerts,
    'WHAT: an empty ledger is reported as a failed read. WHY: an empty ledger and a read that failed must never look alike. HOW: speak an alert only when the read itself failed.',
  ).toBe(0)
  expect(
    reading.writingControls,
    'WHAT: the empty statement offers something that records money. WHY: the Statement stays read-only at every ledger length, including none. HOW: draw no balance box, no action and no Send or Receive control on this screen.',
  ).toBe(0)
})

test('five hundred repayments still scroll inside their own list, and the total still counts every one', async ({
  page,
}) => {
  // Given an owner with five hundred repayments, reading the paid-back list
  await givenTheOwnerIsSignedIn(page, long)
  await whenTheOwnerOpensTheStatement(page)
  await whenTheOwnerTapsTheList(page, 'back')
  const head = statement(page).locator('[data-statement-head="back"]')
  const foot = statement(page).locator('[data-statement-foot="back"]')
  const headBefore = await boxOf(head, 'the paid-back column header')
  const footBefore = await boxOf(foot, 'the paid-back footer')
  const stored = await readStoredLedger(stack, long)

  // When the rows of that list are scrolled to their end
  const travelled = await scrollRowsToTheEnd(page, 'back')

  // Then the rows moved, the header and the footer did not, and the page did not scroll
  expect(
    travelled,
    'WHAT: the paid-back rows area did not scroll under five hundred repayments. WHY: a list that cannot scroll is not pinned, it is simply short, and the claim would be empty. HOW: let that list\'s rows area overflow and scroll inside its panel.',
  ).toBeGreaterThan(0)
  const headAfter = await boxOf(head, 'the paid-back column header')
  const footAfter = await boxOf(foot, 'the paid-back footer')
  expect(
    Math.abs(headAfter.y - headBefore.y),
    'WHAT: the paid-back column header scrolled away with its rows. WHY: an owner reading repayment four hundred must still see which column is which. HOW: keep the header outside the scrolling area.',
  ).toBeLessThanOrEqual(PIXEL)
  expect(
    Math.abs(footAfter.y - footBefore.y),
    'WHAT: the paid-back footer scrolled away with its rows. WHY: the total is what the owner checks the list against, at any length. HOW: keep the footer outside the scrolling area.',
  ).toBeLessThanOrEqual(PIXEL)
  expect(
    footAfter.y + footAfter.height <= VIEWPORT.height + PIXEL,
    'WHAT: the paid-back footer left the phone under five hundred repayments. WHY: a total the owner cannot see is a total they cannot check. HOW: keep the panel inside its pane, with the footer pinned at its foot.',
  ).toBe(true)
  const reading = await readScreen(page)
  expect(
    reading.pageScrolls,
    'WHAT: five hundred repayments made the page itself scroll. WHY: the page must never scroll, however long the ledger grows. HOW: keep every scrolling area inside a pane of exactly the viewport height.',
  ).toBe(false)
  const foot500 = expectedFoot(stored, 'back')
  expect(
    [reading.back.foot?.count, reading.back.foot?.cents, reading.back.foot?.text],
    `WHAT: the paid-back footer does not count and add all ${LONG_LEDGER_ROWS} stored repayments. WHY: a count that stops at what is drawn would understate what came back. HOW: count and sum the stored repayments, not the rows in sight.`,
  ).toEqual([foot500.count, foot500.cents, foot500.text])
})

test('taps on both switches at once leave exactly one view and one list showing', async ({ page }) => {
  // Given an owner on the statement, reading what they sent
  await givenTheOwnerIsSignedIn(page, nine)
  await whenTheOwnerOpensTheStatement(page)

  // When both pill tabs and both bottom-bar tabs are tapped inside one slide
  await listTab(page, 'back').click()
  await listTab(page, 'sent').click()
  await listTab(page, 'back').click()
  await entriesTab(page).click()
  await statementTab(page).click()

  // Then the last tap decides, with one tab current, one tab selected and one list shown
  await theShownListComesToRest(page, 'back')
  await thenEveryPartHasComeToRest(page)
  const reading = await readScreen(page)
  await expect(
    statementTab(page),
    'WHAT: after taps on both bottom-bar tabs inside one slide, the Statement tab does not say it is the current one. WHY: the end state is the last tap\'s, with exactly one view current. HOW: write both aria-current values on every tap, however fast they come.',
  ).toHaveAttribute('aria-current', 'page')
  await expect(
    entriesTab(page),
    'WHAT: both bottom-bar tabs claim to be current after fast taps. WHY: two current tabs tell the owner nothing about where they are. HOW: write both aria-current values together.',
  ).toHaveAttribute('aria-current', 'false')
  expect(
    [reading.shown, reading.pill.tabs.map((tab) => tab.selected)],
    'WHAT: fast taps on both pill tabs left the shown list disagreeing with the selected tab. WHY: the two attributes are the whole of this state, so they cannot be allowed to drift apart. HOW: write the shown attribute and both aria-selected values in one step.',
  ).toEqual(['back', ['false', 'true']])
  expect(
    [reading.sent.place, reading.back.place],
    'WHAT: after fast taps a panel is resting half-way, or both are on screen. WHY: an interrupted slide is allowed, but a panel stopped in the middle leaves the owner reading two lists at once. HOW: let a new tap retarget the slide, and settle on the last tap\'s list.',
  ).toEqual(['outside', 'inside'])
})

test('the statement opens on what the owner sent again after the app is loaded afresh', async ({ page }) => {
  // Given an owner who left the statement on the paid-back list
  await givenTheOwnerIsSignedIn(page, nine)
  await whenTheOwnerOpensTheStatement(page)
  await whenTheOwnerTapsTheList(page, 'back')

  // When the app is loaded again on the phone
  await page.reload()

  // Then the statement is built on the sent list once more, remembering no switch
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the reload asked the owner to sign in again. WHY: the claim is about what a fresh paint of the Statement shows, not about the session. HOW: keep the session on the phone.',
  ).toHaveCount(0)
  await whenTheOwnerOpensTheStatement(page)
  const reading = await readScreen(page)
  expect(
    [reading.shown, reading.pill.tabs.map((tab) => tab.selected), reading.pill.thumb?.bed],
    'WHAT: a fresh load reopens the Statement on the paid-back list. WHY: the Statement opens on what the owner sent every time it is built, so a switch is never carried across a paint. HOW: set the shown list to sent whenever the Statement screen is built.',
  ).toEqual(['sent', ['true', 'false'], SENT_THUMB])
  expect(
    [reading.sent.place, reading.back.place],
    'WHAT: a fresh load does not place the sent panel in the viewport. WHY: the list the screen says it shows is the list the owner must see. HOW: place the panels from the shown attribute as the screen is built.',
  ).toEqual(['inside', 'outside'])
})

test('a ledger that cannot be read shows neither list, and says so instead', async ({ page }) => {
  // Given the ledger cannot be reached from the phone
  await page.route(ENTRIES_ENDPOINT, async (route) => {
    if (route.request().method() === 'GET') {
      await route.abort('failed')
      return
    }
    await route.continue()
  })
  await givenTheOwnerIsSignedIn(page, nine)

  // When the owner taps the Statement tab
  await expect(
    statementTab(page),
    'WHAT: there is no Statement tab to tap after a failed read. WHY: the owner must still be able to reach the screen to be told what happened. HOW: draw the bottom bar whatever the read answered.',
  ).toBeVisible()
  await statementTab(page).click()

  // Then one alert speaks, and no pill, no list and no total is drawn at all
  await expect(
    statementPane(page).getByRole('alert'),
    'WHAT: the statement does not speak one alert after a failed read. WHY: the owner must be told the ledger could not be read, not shown an empty one. HOW: word the alert from the port\'s own message on this screen too.',
  ).toHaveText(UNREADABLE)
  await thenEveryPartHasComeToRest(page)
  const reading = await readScreen(page)
  expect(
    [
      reading.pill.present,
      reading.sent.place,
      reading.back.place,
      reading.sent.foot,
      reading.back.foot,
      reading.sent.rows.length + reading.back.rows.length,
    ],
    'WHAT: a failed read still drew the pill, a list panel or a footer total. WHY: a pill offering two empty lists with $0.00 totals reads as a ledger with nothing in it, which is a different and false statement. HOW: draw the alert alone when the read failed.',
  ).toEqual([false, 'absent', 'absent', null, null, 0])
})

test('a stored method and a missing one read as recorded', async ({ page }) => {
  // Arrange: the stored repayments the design fixes, read back outside the browser
  const stored = await readStoredLedger(stack, nine)
  const byCash = stored.find((row) => row.kind === 'receive' && row.method === 'cash')
  const withoutAMethod = stored.find((row) => row.kind === 'receive' && row.method === null)
  expect(
    [byCash?.entry_date, byCash?.method],
    'WHAT: no repayment is stored on 17 September with the cash token. WHY: the contract under test is what the stored method column means to the Method cell. HOW: seed that repayment with method cash.',
  ).toEqual(['2026-09-17', 'cash'])
  expect(
    [withoutAMethod?.entry_date, withoutAMethod?.method],
    'WHAT: no repayment is stored on 2 October with no method at all. WHY: a repayment stored before the method column existed is exactly the case this contract covers. HOW: seed one repayment with no method.',
  ).toEqual(['2026-10-02', null])

  // Act: offer the ledger a method it cannot read, and a day that is not a date
  const unknownToken = await offerStoredRow(stack, offered, {
    kind: 'receive',
    currency: 'USD',
    amount_minor: 1000,
    rate: null,
    usd_cents: 1000,
    entry_date: '2026-10-01',
    method: 'venmo',
  })
  const notADate = await offerStoredRow(stack, offered, {
    kind: 'receive',
    currency: 'USD',
    amount_minor: 1000,
    rate: null,
    usd_cents: 1000,
    entry_date: 'the first of October',
    method: 'cash',
  })
  const knownToken = await offerStoredRow(stack, offered, {
    kind: 'receive',
    currency: 'USD',
    amount_minor: 1000,
    rate: null,
    usd_cents: 1000,
    entry_date: '2026-10-01',
    method: 'transfer',
  })

  // Assert: what the ledger refuses, and what the real screen reads through the real adapter
  expect(
    unknownToken,
    'WHAT: the ledger kept a method outside cash, cheque and transfer. WHY: a word the app can never read would be drawn as nothing or invented, and the three words are the whole of it. HOW: hold the three known tokens, and nothing stored, in the row itself.',
  ).not.toBeNull()
  expect(
    notADate,
    'WHAT: the ledger kept a repayment whose day is not a date. WHY: a row with no real day cannot be put in the oldest-first order the numbering rests on. HOW: keep a real date on every stored row.',
  ).not.toBeNull()
  expect(
    knownToken,
    'WHAT: the ledger refused a repayment with a known method on a real day. WHY: that is the very row the Method cell must read back. HOW: keep the three known tokens on a stored repayment.',
  ).toBeNull()

  await givenTheOwnerIsSignedIn(page, nine)
  await whenTheOwnerOpensTheStatement(page)
  await whenTheOwnerTapsTheList(page, 'back')
  const cashRow = statement(page).locator(`[data-statement-row="${byCash?.id ?? 'none'}"]`)
  const silentRow = statement(page).locator(`[data-statement-row="${withoutAMethod?.id ?? 'none'}"]`)
  await expect(
    cashRow,
    'WHAT: the repayment stored by cash has no row of its own. WHY: every stored repayment is one numbered row, named by the entry it came from. HOW: carry the entry\'s own id on its row.',
  ).toHaveCount(1)
  await expect(
    cashRow.locator('[data-statement-method]'),
    'WHAT: the cash repayment\'s Method cell does not carry the token the ledger stores. WHY: the cell reads the decoded stored token, never a word of the screen\'s own. HOW: carry data-statement-method with the stored token on the Method cell.',
  ).toHaveAttribute('data-statement-method', 'cash')
  await expect(
    cashRow.locator('[data-statement-method]'),
    'WHAT: the cash repayment\'s Method cell does not read Cash. WHY: cash is read as Cash: a cell that reads the raw token, or another word, misstates how the money came back. HOW: read the stored token as its own word.',
  ).toHaveText(METHOD_WORDS.cash)
  await expect(
    silentRow,
    'WHAT: the repayment stored with no method has no row of its own. WHY: a repayment stored before a method was ever asked for is still money that came back. HOW: list it like any other repayment.',
  ).toHaveCount(1)
  await expect(
    silentRow.locator('[data-statement-method]'),
    'WHAT: the repayment stored with no method carries a method hook. WHY: nothing stored means nothing said, so there is no token to carry. HOW: carry the hook only when a token is stored.',
  ).toHaveCount(0)
  expect(
    (await silentRow.innerText()).match(/Cash|Cheque|Transfer/g),
    'WHAT: the repayment stored with no method utters one of the three method words. WHY: the owner would read a way the money came back that they never recorded. HOW: leave that cell empty.',
  ).toBeNull()
})

test('the pill writes nothing and the lists depend inward only', async () => {
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
  const statementUi = read('src/ui/statement.ts')
  const statementDomain = read('src/domain/statement.ts')

  // Act: look at what each module names, and what decides the paid-back rows
  const importsOf = (source: string): readonly string[] =>
    Array.from(source.matchAll(/from\s+'([^']+)'/g)).map((match) => match[1] ?? '')
  const namesTheDocument = (source: string): boolean =>
    /\b(document|window|HTMLElement|HTMLDivElement|Element)\b/.test(source)
  const writingOperations = ['addEntry', 'removeEntry', 'addPerson', 'insert(', 'delete(', 'upsert(']

  const writesFromTheScreen = writingOperations.filter((operation) => (statementUi ?? '').includes(operation))
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
      importsOf(module.source).some((name) => name.includes('adapters') || name.includes('supabase')),
    )
    .map((module) => module.file)
  const classes = ['src/ui/statement.ts', 'src/domain/statement.ts'].filter((file) =>
    /\bclass\s+\w/.test(read(file) ?? ''),
  )

  // Assert: the screen can write nothing, and the meaning is decided away from the DOM
  expect(
    statementUi === null ? 'missing' : 'present',
    'WHAT: there is no module owning the statement\'s screen. WHY: the pill and both panels are one function from the read ledger to DOM, which decides nothing about money itself. HOW: own that screen in the statement\'s UI module.',
  ).toBe('present')
  expect(
    statementDomain === null ? 'missing' : 'present',
    'WHAT: there is no module owning the statement\'s meaning. WHY: which list a stored entry belongs to, its number and its method word are decided once, away from the DOM. HOW: own that projection in the statement\'s domain module.',
  ).toBe('present')
  expect(
    writesFromTheScreen,
    'WHAT: the statement screen names an operation that writes to the ledger. WHY: the pill only switches what is shown: a writing operation within its reach could change the money this screen is reporting. HOW: give the screen the read outcome and nothing that writes.',
  ).toEqual([])
  expect(
    domainOffenders,
    'WHAT: a module that decides meaning names the document or an adapter. WHY: meaning that can touch the DOM or the database cannot be read, reused or trusted on its own. HOW: keep the meaning modules to values in and values out.',
  ).toEqual([])
  expect(
    uiOffenders,
    'WHAT: a screen module names an adapter. WHY: a screen that reaches an adapter decides where its data comes from, which is the composition root\'s job alone. HOW: pass the read outcome in.',
  ).toEqual([])
  expect(
    classes,
    'WHAT: a statement module declares a class. WHY: this app is written as functions from values to values and from values to DOM, and a second style in one module makes the rule unreadable. HOW: add the paid-back list as functions.',
  ).toEqual([])
})

test('every stored ledger splits into its two lists, numbers each from its own rows and totals each from them', async ({
  page,
}) => {
  // Arrange a spread of ledgers from a fixed seed, including the cases that must be there
  const ledgers = generatedLedgers()
  await givenTheOwnerIsSignedIn(page, generated)

  // Act: read both lists of each ledger through its own page load, keeping the first that disagrees
  let failing: { label: string; entries: readonly EntrySeed[]; reasons: readonly string[] } | null = null
  for (const ledger of ledgers) {
    const reasons = await readBothListsAndJudge(page, ledger.entries)
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
      `${JSON.stringify(smallest.entries.map((entry) => [entry.kind, entry.entryDate, entry.usdCents, entry.method ?? null]))}; ` +
      `${smallest.reasons.length > 0 ? smallest.reasons.join(' | ') : `no disagreement on the re-read, so the first reading was not repeatable; it read: ${failing.reasons.join(' | ')}`}`
  }
  expect(
    report,
    'WHAT: a generated ledger was not split, numbered, worded and totalled as the stored rows mean it. WHY: these laws are what make the two lists true of every ledger and not only of the seeded one: every stored repayment is in the paid-back list and every send in the sent one, neither holds the other\'s entries, each is numbered 1 upward from its own rows, each Method cell reads its own stored token or says nothing, and each footer counts and adds its own rows. HOW: read the failing ledger printed above, which is the smallest one that still disagrees.',
  ).toBe('')
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

const DATE_POOL = ['2026-01-05', '2026-03-17', '2026-07-01', '2026-09-14', '2026-12-28'] as const

/** One generated entry, of either kind, with or without a stored method. */
const generatedEntry = (
  next: () => number,
  index: number,
  options: { readonly sendsOnly: boolean; readonly repaymentsOnly: boolean },
): EntrySeed => {
  const kind = options.repaymentsOnly ? 'receive' : options.sendsOnly || next() < 0.5 ? 'send' : 'receive'
  const currency = next() < 0.5 ? 'MVR' : 'USD'
  const entryDate = DATE_POOL[Math.floor(next() * DATE_POOL.length)] ?? '2026-07-01'
  const rateScaled = 1 + Math.floor(next() * 99_999_999)
  const methods = ['cash', 'cheque', 'transfer', null] as const
  const method = methods[Math.floor(next() * methods.length)] ?? null
  return {
    kind,
    currency,
    amountMinor: 1 + Math.floor(next() * 5_000_000),
    rate: currency === 'MVR' ? (rateScaled / 10_000).toFixed(4) : null,
    usdCents: 1 + Math.floor(next() * 900_000),
    entryDate,
    savedAt: `${entryDate}T0${index % 10}:${String(index % 60).padStart(2, '0')}:00Z`,
    personName: kind === 'send' ? (next() < 0.5 ? AHMED : MARIYAM) : undefined,
    method: index === 0 && options.repaymentsOnly ? null : method,
  }
}

/**
 * The ledgers this value's laws are judged over: from one entry up to twelve, every
 * proportion of the two kinds including each one alone, and a repayment stored with no
 * method. The ledger of nothing at all has its own scenario above, so it is not drawn
 * here as well.
 */
const generatedLedgers = (): ReadonlyArray<{ label: string; entries: readonly EntrySeed[] }> => {
  const next = numbersFrom(GENERATOR_SEED)
  const build = (
    size: number,
    options: { sendsOnly?: boolean; repaymentsOnly?: boolean } = {},
  ): readonly EntrySeed[] =>
    Array.from({ length: size }, (_unused, index) =>
      generatedEntry(next, index, {
        sendsOnly: options.sendsOnly ?? false,
        repaymentsOnly: options.repaymentsOnly ?? false,
      }),
    )

  return [
    { label: 'one repayment and nothing else', entries: build(1, { repaymentsOnly: true }) },
    { label: 'repayments only, the first of them with no stored method', entries: build(5, { repaymentsOnly: true }) },
    { label: 'sends only, so nothing came back', entries: build(6, { sendsOnly: true }) },
    { label: 'both kinds across a year', entries: build(9) },
    { label: 'the longest this generator draws', entries: build(12) },
  ]
}

/** Waits, without judging, until the screen rests on one list; false when it never does. */
const theShownListSettles = async (page: Page, which: Which, budgetMs = 8_000): Promise<boolean> => {
  const deadline = Date.now() + budgetMs
  for (;;) {
    const places = await readPlaces(page)
    const resting =
      places.shown === which &&
      places[which] === 'inside' &&
      places[which === 'sent' ? 'back' : 'sent'] === 'outside'
    if (resting) return true
    if (Date.now() >= deadline) return false
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

/** Stores one ledger, reads both its lists through a page load, and says what disagrees. */
const readBothListsAndJudge = async (
  page: Page,
  entries: readonly EntrySeed[],
): Promise<readonly string[]> => {
  await replaceEntries(stack, generated, entries, generatedPeople)
  await page.reload()
  if ((await page.locator(PASSWORD_FIELD).count()) > 0) return ['the reload asked the owner to sign in again']
  if ((await statementTab(page).count()) === 0) return ['the reloaded app offers no Statement tab']
  await statementTab(page).click()
  if ((await statement(page).count()) === 0) return ['there is no statement screen to read']
  if (!(await theShownListSettles(page, 'sent'))) return ['the statement did not come to rest on the sent list']
  if (!(await everyPartSettles(page))) return ['parts of the screen were still moving after the tap on Statement']
  if ((await listTab(page, 'back').count()) === 0) return [`the statement offers no '${BACK_TAB}' tab to tap`]
  await listTab(page, 'back').click()
  if (!(await theShownListSettles(page, 'back'))) return ['the statement did not come to rest on the paid-back list']
  if (!(await everyPartSettles(page))) return ['parts of the screen were still moving after the tap on the paid-back tab']

  const stored = await readStoredLedger(stack, generated)
  const reading = await readScreen(page)
  const reasons: string[] = []

  for (const which of ['sent', 'back'] as const) {
    const expectedRows = storedRowsOf(stored, which)
    const seen = which === 'sent' ? reading.sent : reading.back
    if (seen.rows.map((row) => row.id).join(',') !== expectedRows.map((row) => row.id).join(',')) {
      reasons.push(
        `the ${which} list holds ${JSON.stringify(seen.rows.map((row) => row.id))} not ${JSON.stringify(expectedRows.map((row) => row.id))}`,
      )
    }
    if (seen.rows.map((row) => row.no).join(',') !== expectedNumbers(expectedRows.length).join(',')) {
      reasons.push(
        `the ${which} list is numbered ${seen.rows.map((row) => row.no).join(',')} not ${expectedNumbers(expectedRows.length).join(',')}`,
      )
    }
    const foot = expectedFoot(stored, which)
    const seenFoot = [seen.foot?.count, seen.foot?.cents, seen.foot?.text]
    if (JSON.stringify(seenFoot) !== JSON.stringify([foot.count, foot.cents, foot.text])) {
      reasons.push(`the ${which} footer reads ${JSON.stringify(seenFoot)} not ${JSON.stringify(foot)}`)
    }
    if (seen.rows.map((row) => row.usd).join(',') !== expectedRows.map((row) => usdNoSign(row.usd_cents)).join(',')) {
      reasons.push(
        `the ${which} figures read ${seen.rows.map((row) => row.usd).join(',')} not ${expectedRows.map((row) => usdNoSign(row.usd_cents)).join(',')}`,
      )
    }
  }

  const repayments = storedRowsOf(stored, 'back')
  const seenMethods = reading.back.rows.map((row) => row.cells[2] ?? '')
  const meantMethods = repayments.map((row) => methodWordOf(row))
  if (seenMethods.join('|') !== meantMethods.join('|')) {
    reasons.push(`the Method cells read ${JSON.stringify(seenMethods)} not ${JSON.stringify(meantMethods)}`)
  }
  const drawnIds = [...reading.sent.rows, ...reading.back.rows].map((row) => row.id)
  if (new Set(drawnIds).size !== drawnIds.length) {
    reasons.push('an entry is drawn in both lists at once')
  }
  if (drawnIds.length !== stored.length) {
    reasons.push(`the two lists hold ${drawnIds.length} of the ${stored.length} stored entries between them`)
  }
  if (reading.pageScrolls) reasons.push('the page itself scrolls at this length')
  if (reading.writingControls !== 0) {
    reasons.push(`${reading.writingControls} controls that record money are on the screen`)
  }
  return reasons
}

/** Takes one entry away at a time while the ledger still disagrees, and reports it. */
const smallestStillFailing = async (
  page: Page,
  entries: readonly EntrySeed[],
): Promise<{ entries: readonly EntrySeed[]; reasons: readonly string[] }> => {
  let smallest = entries
  let reasons = await readBothListsAndJudge(page, smallest)
  let attempts = 0
  const BUDGET = 12
  for (let shrinking = true; shrinking && attempts < BUDGET; ) {
    shrinking = false
    for (let index = 0; index < smallest.length && attempts < BUDGET; index += 1) {
      const candidate = smallest.filter((_unused, at) => at !== index)
      attempts += 1
      const candidateReasons = await readBothListsAndJudge(page, candidate)
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
