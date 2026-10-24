import { test, expect, type Locator, type Page } from '@playwright/test'
import {
  ORIGIN,
  buildBundle,
  serveDist,
  startLocalStack,
  type ServedOrigin,
  type Stack,
} from '../support/local-stack.js'
import {
  createAccount,
  replaceEntries,
  seedPeopleByName,
  type Account,
  type EntrySeed,
} from '../support/accounts.js'

// The names a reading finds this batch's new content by, held over the WHOLE mounted page
// rather than over the rows one screen happens to read (F-at-hook-ssot):
//
//   - the dollars a rufiyaa send stores are exposed on exactly ONE hooked element in that
//     send's own row, and on no element of a dollar send's row;
//   - the dollar cell of a rufiyaa send still says of itself that it reads a converted
//     figure, and reads nothing;
//   - the rufiyaa cell of a dollar send reads nothing at all;
//   - no element of the page marks an absent figure with the removed placeholder hook:
//     absence is carried by an empty cell;
//   - the one box of the Entries pane that scrolls is the box the entries-scroll hook names.
//
// Judged only through the declared public port: the BUILT bundle as Chrome loads it over
// the served origin, at 360 by 780. Nothing here imports a module of src/. Both panes and
// both statement lists are mounted in the one page, so a placeholder left anywhere in the
// app is counted here wherever it stands.
//
// This oracle reads the hook CONTRACT and nothing else. What the Entries screen pins, how
// many of its boxes may scroll and how clear the last entry stands of the bottom buttons
// are read by the Entries screen's own oracle; what each cell and footer line reads, by the
// statement's own.

const PASSWORD_FIELD = 'input[type="password"]'
const VIEWPORT = { width: 360, height: 780 } as const

/** Sub-pixel layout rounding: a box that holds "no more than fits it" may differ by a whisker. */
const PIXEL = 1

// ===== The seeded ledger: invented figures, each row told apart by who was paid =====

/** The one person the rufiyaa send was made to, so that row is found without reading it. */
const RUFIYAA_PERSON = 'Mariyam Nisha'
/** The one person the dollar send was made to. */
const DOLLAR_PERSON = 'Hawwa Ali'
/** Everyone else: the entries that only make the ledger longer than the phone. */
const FILLER_PERSON = 'Ahmed Shifaz'

/** MVR10,000 sent at the rate 20 and stored as $500. */
const RUFIYAA_LAARI = 1_000_000
const RUFIYAA_RATE = '20.0000'
const RUFIYAA_USD_CENTS = 50_000
/** A send of $750. */
const DOLLAR_USD_CENTS = 75_000
/** A repayment of $300, so the paid-back list is not empty either. */
const REPAID_USD_CENTS = 30_000

/** How many extra sends are stored, so the entries list is longer than the phone. */
const FILLER_ROWS = 30

const ACCOUNT_HOOKS = {
  email: 'owner-hooks@abbaas.test',
  password: 'shell-hooks-password-1',
} as const

const LEDGER: readonly EntrySeed[] = [
  {
    kind: 'send',
    currency: 'MVR',
    amountMinor: RUFIYAA_LAARI,
    rate: RUFIYAA_RATE,
    usdCents: RUFIYAA_USD_CENTS,
    entryDate: '2026-09-14',
    savedAt: '2026-09-14T09:00:00Z',
    personName: RUFIYAA_PERSON,
    method: 'transfer',
  },
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: DOLLAR_USD_CENTS,
    rate: null,
    usdCents: DOLLAR_USD_CENTS,
    entryDate: '2026-09-18',
    savedAt: '2026-09-18T09:00:00Z',
    personName: DOLLAR_PERSON,
    method: 'cash',
  },
  {
    kind: 'receive',
    currency: 'USD',
    amountMinor: REPAID_USD_CENTS,
    rate: null,
    usdCents: REPAID_USD_CENTS,
    entryDate: '2026-09-20',
    savedAt: '2026-09-20T09:00:00Z',
    method: 'cash',
  },
  ...Array.from({ length: FILLER_ROWS }, (_unused, index): EntrySeed => {
    const date = `2026-08-${String((index % 28) + 1).padStart(2, '0')}`
    return {
      kind: 'send',
      currency: 'USD',
      amountMinor: 1_000 + index,
      rate: null,
      usdCents: 1_000 + index,
      entryDate: date,
      savedAt: `${date}T0${index % 10}:00:00Z`,
      personName: FILLER_PERSON,
      method: 'cash',
    }
  }),
]

const STORED_SENDS = LEDGER.filter((entry) => entry.kind === 'send').length
const STORED_ROWS = LEDGER.length

// ===== The independent oracle: what the stored rows mean, worded here =====

const dollarsWithCents = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Stored cents as a dollar figure, with the trailing cents dropped when they are zero. */
const wholeDollars = (cents: number): string =>
  `$${dollarsWithCents.format(cents / 100)}`.replace(/\.00$/, '')

/** The dollars the seeded rufiyaa send stores, as the owner reads them under its figure. */
const CONVERTED_READING = wholeDollars(RUFIYAA_USD_CENTS)

let stack: Stack
let served: ServedOrigin
let owner: Account

test.use({ viewport: VIEWPORT })

test.beforeAll(async () => {
  stack = startLocalStack()
  buildBundle(stack)
  served = await serveDist()
  owner = await createAccount(stack, ACCOUNT_HOOKS)
  await replaceEntries(
    stack,
    owner,
    LEDGER,
    await seedPeopleByName(stack, owner, [RUFIYAA_PERSON, DOLLAR_PERSON, FILLER_PERSON]),
  )
})

test.afterAll(async () => {
  await served?.close()
})

// ===== What the page says, read by the names the batch fixes =====

/** One row of a statement list, read by the hooks this contract fixes. */
type RowReading = {
  /** Who was paid, which is how this row is told from the others. */
  readonly party: string
  /** How many elements of THIS row carry the converted-dollars hook. */
  readonly convertedHooks: number
  /** What the hooked element of this row reads, or null when it has none. */
  readonly converted: string | null
  /** What the rufiyaa cell of this row reads. */
  readonly mvr: string
  /** What the dollar cell of this row reads. */
  readonly usd: string
  /** Whether the dollar cell says of itself that it reads a converted figure. */
  readonly usdNamesItself: boolean
}

type HookReading = {
  readonly rows: readonly RowReading[]
  /** Elements carrying the converted-dollars hook inside a row of either list. */
  readonly convertedHooksInRows: number
  /** Rows holding more than one of them. */
  readonly rowsWithTwo: number
  /** Elements of the whole page still marking an absence with the removed hook. */
  readonly placeholders: number
}

type EntriesHookReading = {
  readonly pane: boolean
  /** Elements of the WHOLE page carrying the entries-scroll hook. */
  readonly hookedInThePage: number
  /** Elements of the Entries pane carrying it. */
  readonly hookedInThePane: number
  /** Every box of the Entries pane holding more content than fits it, named for a reader. */
  readonly overflowing: readonly string[]
  /** Whether each of those boxes is the one the hook names. */
  readonly everyScrollingBoxIsHooked: boolean
  /** Elements of the whole page still marking an absence with the removed hook. */
  readonly placeholders: number
}

const entriesPane = (page: Page): Locator => page.locator('[data-pane="entries"]')
const statementScreen = (page: Page): Locator => page.locator('[data-screen="statement"]')
const sentRows = (page: Page): Locator => page.locator('[data-statement-list="sent"] [data-statement-row]')

const readTheHooks = async (page: Page): Promise<HookReading> =>
  page.evaluate((): HookReading => {
    const textOf = (element: Element | null): string => (element?.textContent ?? '').trim()
    const sent = Array.from(
      document.querySelectorAll<HTMLElement>('[data-statement-list="sent"] [data-statement-row]'),
    )
    const everyRow = Array.from(document.querySelectorAll<HTMLElement>('[data-statement-row]'))
    const rows = sent.map((row): RowReading => {
      const hooks = row.querySelectorAll('[data-statement-converted]')
      const usdCell = row.querySelector('[data-statement-usd]')
      return {
        party: textOf(row.querySelector('[data-person]')) || textOf(row.querySelector('[data-statement-column="party"]')),
        convertedHooks: hooks.length,
        converted: hooks.length === 0 ? null : textOf(hooks[0] ?? null),
        mvr: textOf(row.querySelector('[data-statement-mvr]')),
        usd: textOf(usdCell),
        usdNamesItself: usdCell !== null && usdCell.hasAttribute('data-converted'),
      }
    })
    return {
      rows,
      convertedHooksInRows: everyRow.reduce(
        (total, row) => total + row.querySelectorAll('[data-statement-converted]').length,
        0,
      ),
      rowsWithTwo: everyRow.filter((row) => row.querySelectorAll('[data-statement-converted]').length > 1)
        .length,
      placeholders: document.querySelectorAll('[data-statement-placeholder]').length,
    }
  })

const readTheEntriesHook = async (page: Page): Promise<EntriesHookReading> =>
  page.evaluate((pixel: number): EntriesHookReading => {
    const pane = document.querySelector('[data-pane="entries"]')
    const placeholders = document.querySelectorAll('[data-statement-placeholder]').length
    const hookedInThePage = document.querySelectorAll('[data-entries-scroll]').length
    if (pane === null) {
      return {
        pane: false,
        hookedInThePage,
        hookedInThePane: 0,
        overflowing: [],
        everyScrollingBoxIsHooked: false,
        placeholders,
      }
    }
    const boxes = [pane as HTMLElement, ...Array.from(pane.querySelectorAll<HTMLElement>('*'))]
    const nameOf = (element: HTMLElement): string => {
      const classes = String(element.className ?? '').trim()
      const hook = element.hasAttribute('data-entries-scroll') ? '[data-entries-scroll]' : ''
      return `${element.tagName.toLowerCase()}${classes === '' ? '' : `.${classes.split(/\s+/).join('.')}`}${hook}`
    }
    // A box takes the owner's scroll when it holds more content than fits it AND its own
    // overflow lets that content be scrolled. A span whose text merely measures taller than
    // its line box clips nothing and moves nothing, so it is not a box that scrolls.
    const takesAScroll = (element: HTMLElement): boolean => {
      if (element.scrollHeight <= element.clientHeight + pixel) return false
      const overflow = getComputedStyle(element).overflowY
      return overflow === 'auto' || overflow === 'scroll' || overflow === 'overlay'
    }
    const tall = boxes.filter(takesAScroll)
    return {
      pane: true,
      hookedInThePage,
      hookedInThePane: pane.querySelectorAll('[data-entries-scroll]').length,
      overflowing: tall.map(nameOf),
      everyScrollingBoxIsHooked:
        tall.length > 0 && tall.every((element) => element.hasAttribute('data-entries-scroll')),
      placeholders,
    }
  }, PIXEL)

// ===== The steps these scenarios are written in =====

const givenTheOwnerIsSignedIn = async (page: Page): Promise<void> => {
  await page.goto(ORIGIN)
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen never appeared. WHY: every reading of this app starts from a signed-in owner. HOW: serve the built bundle and let it mount its sign-in screen.',
  ).toBeVisible()
  await page.getByLabel('Email').fill(owner.email)
  await page.getByLabel('Password').fill(owner.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen stayed up after Sign in. WHY: the owner reaches neither their entries nor their statement until the app lets them in. HOW: confirm the seeded account and let sign-in replace the screen.',
  ).toHaveCount(0)
}

const givenTheOwnerIsReadingTheirEntries = async (page: Page): Promise<void> => {
  await expect(
    entriesPane(page).locator('[data-entry]'),
    `WHAT: the entries pane did not list one card for each of the ${STORED_ROWS} stored entries. WHY: the hook this contract names belongs to the box those cards live in, so nothing can be read of it until they are all listed. HOW: list one card per stored entry on the Entries screen.`,
  ).toHaveCount(STORED_ROWS)
  await expect(
    page.locator('[data-motion]'),
    'WHAT: something on the Entries screen was still moving. WHY: a box read mid-flight reports the room it is passing through, not the room it holds. HOW: let the opening entrance finish before anything is measured.',
  ).toHaveCount(0)
}

/**
 * The seeding this contract needs on the Entries screen: the stored list is taller than the
 * pane it lives in. Read from the stored list and the pane alone, with no hook in it, so a
 * ledger that simply fits the phone ends the run as a setup failure with nothing observed,
 * never as a pass of a reading that cannot bite.
 */
const givenTheStoredEntriesAreTallerThanThePhone = async (page: Page): Promise<void> => {
  const room = await page.evaluate(() => {
    const pane = document.querySelector('[data-pane="entries"]')
    const list = document.querySelector('[data-entries]')
    if (pane === null || list === null) return null
    return {
      list: list.getBoundingClientRect().height,
      pane: pane.getBoundingClientRect().height,
    }
  })
  if (room === null || room.list <= room.pane) {
    throw new Error(
      `The seeded ledger fits the phone: the stored list is ${Math.round(room?.list ?? 0)} tall inside a pane of ${Math.round(room?.pane ?? 0)}. Nothing about the box that scrolls was observed by this run; it never reached that reading. Seed more entries than fit the screen.`,
    )
  }
}

const whenTheOwnerReadsTheirStatement = async (page: Page): Promise<void> => {
  await page.locator('[data-view="statement"]').click()
  await expect(
    statementScreen(page),
    'WHAT: tapping Statement showed no statement. WHY: the sent list is where the converted dollars are read. HOW: show the statement screen on its own tab.',
  ).toBeVisible()
  await expect(
    sentRows(page),
    `WHAT: the sent list did not hold one row for each of the ${STORED_SENDS} stored sends. WHY: this contract is about what each row of that list exposes, so every stored send must be listed first. HOW: list one row per stored send.`,
  ).toHaveCount(STORED_SENDS)
}

const oneRowPaid = (reading: HookReading, person: string): RowReading => {
  const found = reading.rows.filter((row) => row.party.includes(person))
  expect(
    found.length,
    `WHAT: the sent list holds ${found.length} rows naming ${person}, where the stored ledger holds exactly one send to them. WHY: each row of this reading is told from the others by who was paid, so a reading that cannot find its row would judge the wrong one. HOW: name the person each send was made to on its own row.`,
  ).toBe(1)
  return found[0]!
}

// ===== The scenarios =====

/**
 * The hook contract of the statement's rows, held over both lists of the mounted page
 * (F-at-hook-ssot): one hooked element per rufiyaa row and none per dollar row, the dollar
 * cell of a rufiyaa send naming itself and reading nothing, the rufiyaa cell of a dollar
 * send reading nothing, and the removed placeholder hook nowhere at all.
 */
test('a rufiyaa send names its stored dollars on one hook, and nothing marks an absent figure', async ({
  page,
}) => {
  // Given the owner is signed in, with one rufiyaa send, one dollar send and a repayment stored
  await givenTheOwnerIsSignedIn(page)

  // When they read their statement
  await whenTheOwnerReadsTheirStatement(page)

  // Then the rufiyaa send's own row exposes its stored dollars on exactly one hooked element
  const reading = await readTheHooks(page)
  const rufiyaa = oneRowPaid(reading, RUFIYAA_PERSON)
  expect(
    [rufiyaa.convertedHooks, rufiyaa.converted],
    `WHAT: the row of the send made in rufiyaa exposes its stored dollars on ${rufiyaa.convertedHooks} hooked element(s), reading ${rufiyaa.converted ?? 'nothing'} where the stored row means ${CONVERTED_READING}. WHY: the dollars a rufiyaa send is worth are the figure the owner checks the balance against, and a reader must find them in one named place rather than by parsing a cell. HOW: expose the stored dollars of a rufiyaa send on exactly one element carrying the converted hook, reading the stored figure.`,
  ).toEqual([1, CONVERTED_READING])

  // And that row's dollar cell still names itself a converted reading and reads nothing
  expect(
    [rufiyaa.usd, rufiyaa.usdNamesItself],
    `WHAT: the dollar cell of the rufiyaa send reads "${rufiyaa.usd}" and ${rufiyaa.usdNamesItself ? 'names itself a converted reading' : 'no longer names itself a converted reading'}. WHY: the dollars of a rufiyaa send are read under its own figure, so repeating them in the dollar column would show the same money twice; the cell must still say which kind of reading it stands for. HOW: leave that cell empty and keep its converted name on it.`,
  ).toEqual(['', true])

  // And the rufiyaa cell of the dollar send reads nothing at all, with no hook of its own
  const dollar = oneRowPaid(reading, DOLLAR_PERSON)
  expect(
    [dollar.mvr, dollar.convertedHooks],
    `WHAT: the rufiyaa cell of the dollar send reads "${dollar.mvr}" and its row exposes ${dollar.convertedHooks} converted reading(s). WHY: money that never changed currency has no rufiyaa figure and nothing converted to show: a mark in that cell is a figure the owner has to decode. HOW: leave the rufiyaa cell of a dollar send empty and hook nothing in that row.`,
  ).toEqual(['', 0])

  // And over the whole page, that one hook stands once, and no absence is marked at all
  expect(
    [reading.convertedHooksInRows, reading.rowsWithTwo, reading.placeholders],
    `WHAT: the rows of this page hold ${reading.convertedHooksInRows} converted readings in all, ${reading.rowsWithTwo} row(s) hold two or more, and ${reading.placeholders} element(s) still mark an absent figure with the removed placeholder. WHY: a hook that stands twice leaves a reader to choose between them, and a placeholder left anywhere keeps the old mark alive on a screen nobody looked at. HOW: write the converted hook once in the one renderer that owns the cell, and carry absence as an empty cell.`,
  ).toEqual([1, 0, 0])
})

/**
 * The Entries clause of the hook contract (F-at-hook-ssot): the box of the Entries pane that
 * scrolls is the box the entries-scroll hook names, and that hook stands once in the page.
 * What stays pinned, how many boxes may scroll and how clear the last entry stands are read
 * by the Entries screen's own oracle, not here.
 */
test('the box the entries scroll in is the one the entries hook names', async ({ page }) => {
  // Given the owner is signed in, reading more entries than fit their phone
  await givenTheOwnerIsSignedIn(page)
  await givenTheOwnerIsReadingTheirEntries(page)
  await givenTheStoredEntriesAreTallerThanThePhone(page)

  // When their Entries screen is read, every box of it
  const reading = await readTheEntriesHook(page)

  // Then whatever scrolls there is the hooked box, and the hook stands once in the page
  expect(
    [reading.hookedInThePage, reading.hookedInThePane, reading.everyScrollingBoxIsHooked],
    `WHAT: the page carries the entries-scroll hook on ${reading.hookedInThePage} element(s), ${reading.hookedInThePane} of them in the Entries pane, where the boxes holding more than fits them are ${reading.overflowing.join(', ') || 'none'}. WHY: every spec of this batch finds the owner's scroll place by that one name: a hook on no box, on a second box, or on a box that is not the one that scrolls makes each of them read a different screen from the owner's. HOW: carry the hook in the one builder that makes that box, on the box that takes the remaining room and the vertical scroll.`,
  ).toEqual([1, 1, true])

  // And no absence is marked with the removed placeholder on this screen either
  expect(
    reading.placeholders,
    `WHAT: ${reading.placeholders} element(s) of the page still mark an absent figure with the removed placeholder hook. WHY: the mark is gone from the app and from its documentation, so a reader must not find it anywhere, on any screen. HOW: carry absence as an empty cell.`,
  ).toBe(0)
})
