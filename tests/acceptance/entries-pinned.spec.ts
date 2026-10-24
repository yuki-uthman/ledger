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

// The Entries screen the owner reads on their phone: the You and Abbaas card and the
// Entries heading keep their places, and only the list of entries moves, inside the one
// box of the pane that carries the entries-scroll hook. The page itself never scrolls,
// and the last entry stays reachable, clear of the Send and Receive buttons.
//
// Judged only through the declared public port: the BUILT bundle as Chrome loads it over
// the served origin, at 360 by 780. Nothing here imports a module of src/; the stimulus is
// stored rows and a scroll of the box that scrolls, and every reading is of the mounted
// page.
//
// Three notes on how these readings stay free of design values.
//   - The pinned place is read as the EQUALITY of the two figures' boxes and the heading's
//     box between two scroll positions, never as a distance from the top of the screen.
//   - The clearance of the last entry is read as a CONTAINMENT of boxes: the entry's box
//     above the buttons' box and inside the scrolling box's own box. No pixel count, no
//     gap and no padding is asserted anywhere, so every approved spacing is free to move.
//   - The single-scroller law is counted over EVERY box of the pane, not over the list a
//     case happens to read, so a box added inside the pane later is caught by the count
//     rather than missed by a selector.
//
// A ledger that fits the phone makes the pinned-place law vacuous. That is a SETUP failure
// with nothing observed, never a pass: the seeding step reads the stored list against the
// pane's own height, without the hook, and says so.

const PASSWORD_FIELD = 'input[type="password"]'
const VIEWPORT = { width: 360, height: 780 } as const

/** Sub-pixel layout rounding: a box that "has not moved" may still differ by a whisker. */
const PIXEL = 1
/** How long a reading waits for the pane to be laid out before it measures anything. */
const LAYOUT_BOUND_MS = 10_000

/** The one invented person every seeded send is made to. */
const MARIYAM = 'Mariyam Nisha'

// ===== The seeded ledgers: invented figures, chosen by their own length =====

const ACCOUNT_LONG = {
  email: 'owner-pinned-long@abbaas.test',
  password: 'pinned-long-password-1',
} as const
const ACCOUNT_ONE_DAY = {
  email: 'owner-pinned-one-day@abbaas.test',
  password: 'pinned-one-day-password-2',
} as const
const ACCOUNT_SHORT = {
  email: 'owner-pinned-short@abbaas.test',
  password: 'pinned-short-password-3',
} as const
const ACCOUNT_EMPTY = {
  email: 'owner-pinned-empty@abbaas.test',
  password: 'pinned-empty-password-4',
} as const
const ACCOUNT_SAVING = {
  email: 'owner-pinned-saving@abbaas.test',
  password: 'pinned-saving-password-5',
} as const

/** A send of invented dollars, dated and ordered so the list's order is decidable. */
const send = (index: number, date: string): EntrySeed => ({
  kind: 'send',
  currency: 'USD',
  amountMinor: 1_000 + index,
  rate: null,
  usdCents: 1_000 + index,
  entryDate: date,
  savedAt: `${date}T0${index % 10}:00:00Z`,
  personName: MARIYAM,
  method: (['cash', 'cheque', 'transfer', null] as const)[index % 4] ?? null,
})

/** More entries than fit the phone, over several days: the list the owner scrolls. */
const LONG_DAYS = 8
const LONG_PER_DAY = 5
const LONG_ROWS = LONG_DAYS * LONG_PER_DAY
const longLedger: readonly EntrySeed[] = Array.from({ length: LONG_ROWS }, (_unused, index) =>
  send(index, `2026-06-${String((index % LONG_DAYS) + 1).padStart(2, '0')}`),
)

/** One day's entries, taller than the phone: the list is a single group. */
const ONE_DAY = '2026-07-15'
const ONE_DAY_ROWS = 16
const oneDayLedger: readonly EntrySeed[] = Array.from({ length: ONE_DAY_ROWS }, (_unused, index) =>
  send(index, ONE_DAY),
)

/** A ledger that fits the phone, where there is nothing to scroll at all. */
const SHORT_ROWS = 1
const shortLedger: readonly EntrySeed[] = [send(0, '2026-05-04')]

/** What the owner saves while the list is scrolled, as the save button names it. */
const SAVED_DOLLARS = '25'
const SAVED_BUTTON = `Send · $${SAVED_DOLLARS}.00`

let stack: Stack
let served: ServedOrigin
let long: Account
let oneDay: Account
let short: Account
let empty: Account
let saving: Account

test.use({ viewport: VIEWPORT })
// Not serial: each scenario signs in as its own owner and reads its own ledger, so one
// scenario's disagreement must not hide what the other four observe.

test.beforeAll(async () => {
  stack = startLocalStack()
  buildBundle(stack)
  served = await serveDist()

  long = await createAccount(stack, ACCOUNT_LONG)
  await replaceEntries(stack, long, longLedger, await seedPeopleByName(stack, long, [MARIYAM]))

  oneDay = await createAccount(stack, ACCOUNT_ONE_DAY)
  await replaceEntries(stack, oneDay, oneDayLedger, await seedPeopleByName(stack, oneDay, [MARIYAM]))

  short = await createAccount(stack, ACCOUNT_SHORT)
  await replaceEntries(stack, short, shortLedger, await seedPeopleByName(stack, short, [MARIYAM]))

  empty = await createAccount(stack, ACCOUNT_EMPTY)

  saving = await createAccount(stack, ACCOUNT_SAVING)
  await replaceEntries(stack, saving, longLedger, await seedPeopleByName(stack, saving, [MARIYAM]))
})

test.afterAll(async () => {
  await served?.close()
})

// ===== What the owner's screen says, read as boxes =====

/** One laid-out box, as the page offers it to a reader. */
type BoxReading = {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/**
 * One reading of the whole Entries pane: which of its boxes hold more content than fits
 * them, which of them carries the entries-scroll hook, where the pinned parts stand, what
 * the list holds, and whether the last entry stands clear of the two bottom buttons.
 */
type PaneReading = {
  readonly pane: boolean
  /** Every box of the pane whose content is taller than itself, named for a reader. */
  readonly overflowing: readonly string[]
  /** How many elements of the pane carry the entries-scroll hook. */
  readonly hooked: number
  /** Whether the hooked box is one of the boxes that hold more than fits them. */
  readonly hookedOverflows: boolean
  /** Whether the Entries screen inside the pane is one of them. */
  readonly screenOverflows: boolean
  /** Whatever the hooked box says to a screen reader, which must be nothing at all. */
  readonly hookedSpeaks: readonly string[]
  /** Whether the hooked box has anything of its own left to scroll. */
  readonly hookedHasRoom: boolean
  readonly you: BoxReading | null
  readonly abbaas: BoxReading | null
  readonly heading: BoxReading | null
  readonly rows: number
  readonly days: number
  /** How far the hooked box has been scrolled, or -1 when there is no such box. */
  readonly scrollTop: number
  readonly pageHasMoreThanFits: boolean
  readonly pageTop: number
  /** Whether the last entry's box stands above the box of the two bottom buttons. */
  readonly lastEntryAboveTheButtons: boolean | null
  /** Whether the last entry's box lies wholly inside the scrolling box's own box. */
  readonly lastEntryInsideTheBox: boolean | null
  /** Whether the empty-ledger hint stands wholly inside the pane, uncut. */
  readonly hintWhollyInThePane: boolean | null
  /** Whether the newest card of the list lies wholly inside the scrolling box. */
  readonly newestEntryInsideTheBox: boolean | null
}

const entriesPane = (page: Page): Locator => page.locator('[data-pane="entries"]')
const entryCards = (page: Page): Locator => entriesPane(page).locator('[data-entry]')

/** One snapshot of the pane, taken in the page, so every law reads the same layout. */
const readTheEntriesPane = async (page: Page): Promise<PaneReading> =>
  page.evaluate((pixel: number): PaneReading => {
    const rectOf = (element: Element | null): BoxReading | null => {
      if (element === null) return null
      const rect = element.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    }
    const root = document.documentElement
    const nothing: PaneReading = {
      pane: false,
      overflowing: [],
      hooked: 0,
      hookedOverflows: false,
      screenOverflows: false,
      hookedSpeaks: [],
      hookedHasRoom: false,
      you: null,
      abbaas: null,
      heading: null,
      rows: 0,
      days: 0,
      scrollTop: -1,
      pageHasMoreThanFits: root.scrollHeight > root.clientHeight + pixel,
      pageTop: root.scrollTop,
      lastEntryAboveTheButtons: null,
      lastEntryInsideTheBox: null,
      hintWhollyInThePane: null,
      newestEntryInsideTheBox: null,
    }
    const pane = document.querySelector('[data-pane="entries"]')
    if (pane === null) return nothing

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
    const hookedBoxes = boxes.filter((element) => element.hasAttribute('data-entries-scroll'))
    const hooked = hookedBoxes[0] ?? null
    const screen = pane.querySelector<HTMLElement>('[data-screen="home"]')
    const cards = Array.from(pane.querySelectorAll<HTMLElement>('[data-entry]'))
    const last = cards[cards.length - 1] ?? null
    const newest = cards[0] ?? null

    const hookedRect = rectOf(hooked)
    const insideTheHookedBox = (element: HTMLElement | null): boolean | null => {
      const rect = rectOf(element)
      if (rect === null || hookedRect === null) return null
      return (
        rect.y >= hookedRect.y - pixel &&
        rect.y + rect.height <= hookedRect.y + hookedRect.height + pixel &&
        rect.x >= hookedRect.x - pixel &&
        rect.x + rect.width <= hookedRect.x + hookedRect.width + pixel
      )
    }

    const sendRect = rectOf(pane.querySelector('[data-action="send"]'))
    const receiveRect = rectOf(pane.querySelector('[data-action="receive"]'))
    const buttonsTop =
      sendRect === null || receiveRect === null ? null : Math.min(sendRect.y, receiveRect.y)
    const lastRect = rectOf(last)

    const hintRect = rectOf(pane.querySelector('[data-empty-hint]'))
    const paneRect = rectOf(pane)

    return {
      pane: true,
      overflowing: tall.map(nameOf),
      hooked: hookedBoxes.length,
      hookedOverflows: hooked !== null && tall.includes(hooked),
      screenOverflows: screen !== null && tall.includes(screen),
      hookedSpeaks:
        hooked === null
          ? []
          : ['role', 'aria-label', 'aria-labelledby'].filter((spoken) =>
              hooked.hasAttribute(spoken),
            ),
      hookedHasRoom: hooked !== null && takesAScroll(hooked),
      you: rectOf(pane.querySelector('[data-box="you"]')),
      abbaas: rectOf(pane.querySelector('[data-box="abbaas"]')),
      heading: rectOf(pane.querySelector('h2')),
      rows: cards.length,
      days: pane.querySelectorAll('[data-day]').length,
      scrollTop: hooked?.scrollTop ?? -1,
      pageHasMoreThanFits: root.scrollHeight > root.clientHeight + pixel,
      pageTop: root.scrollTop,
      lastEntryAboveTheButtons:
        lastRect === null || buttonsTop === null
          ? null
          : lastRect.y + lastRect.height <= buttonsTop + pixel,
      lastEntryInsideTheBox: insideTheHookedBox(last),
      hintWhollyInThePane:
        hintRect === null || paneRect === null
          ? null
          : hintRect.height > 0 &&
            hintRect.y >= paneRect.y - pixel &&
            hintRect.y + hintRect.height <= paneRect.y + paneRect.height + pixel,
      newestEntryInsideTheBox: insideTheHookedBox(newest),
    }
  }, PIXEL)

/** Two boxes are the same box when nothing but sub-pixel rounding tells them apart. */
const sameBox = (before: BoxReading | null, after: BoxReading | null): boolean =>
  before !== null &&
  after !== null &&
  Math.abs(before.x - after.x) <= PIXEL &&
  Math.abs(before.y - after.y) <= PIXEL &&
  Math.abs(before.width - after.width) <= PIXEL &&
  Math.abs(before.height - after.height) <= PIXEL

/** A box, worded for a failure message. */
const wordBox = (box: BoxReading | null): string =>
  box === null ? 'nowhere at all' : `${Math.round(box.x)},${Math.round(box.y)}`

// ===== The steps these scenarios are written in =====

const givenTheOwnerIsSignedIn = async (page: Page, account: Account): Promise<void> => {
  await page.goto(ORIGIN)
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen never appeared. WHY: every reading of the Entries screen starts from a signed-in owner. HOW: serve the built bundle and let it mount its sign-in screen.',
  ).toBeVisible()
  await page.getByLabel('Email').fill(account.email)
  await page.getByLabel('Password').fill(account.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen stayed up after Sign in. WHY: the owner cannot reach their entries until the app lets them in. HOW: confirm the seeded account and let sign-in replace the screen.',
  ).toHaveCount(0)
}

const givenTheOwnerIsReadingTheirEntries = async (page: Page, rows: number): Promise<void> => {
  await expect(
    entriesPane(page),
    'WHAT: the owner has no entries pane to read. WHY: the Entries screen is what the app opens on, and every law here is a law of that pane. HOW: mount the entries pane for the signed-in owner.',
  ).toHaveCount(1)
  await expect(
    entryCards(page),
    `WHAT: the entries pane does not list one card for each of the ${rows} stored entries. WHY: the owner's list is what scrolls, so nothing below can be observed until their whole ledger is listed. HOW: list one card per stored entry on the Entries screen.`,
  ).toHaveCount(rows)
  await expect(
    page.locator('[data-motion]'),
    'WHAT: something on the Entries screen was still moving. WHY: a box read mid-flight is read where it is passing, not where it rests, and every law here is about resting boxes. HOW: let the opening entrance finish before anything is measured.',
  ).toHaveCount(0)
}

/**
 * The seeding this oracle needs: the stored list is taller than the pane it lives in. Read
 * from the stored list and the pane alone, with no hook in it, so a ledger that simply fits
 * the phone ends the run as a setup failure with nothing observed, never as a pass of a law
 * that cannot bite.
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
      `The seeded ledger fits the phone: the stored list is ${Math.round(room?.list ?? 0)} tall inside a pane of ${Math.round(room?.pane ?? 0)}. Nothing about the pinned place was observed by this run; it did not read a failing case, it never reached one. Seed more entries than fit the screen.`,
    )
  }
}

/**
 * The stimulus: the box the design names takes the list's scroll, and it is scrolled to its
 * end as a finger would scroll it. A pane not yet laid out reports no overflow at all, so
 * the step waits for that box to report more content than fits it before it measures, and
 * answers with where the box came to rest.
 */
const whenTheEntriesListIsScrolledToItsEnd = async (page: Page): Promise<number> => {
  await expect
    .poll(
      () => readTheEntriesPane(page).then((reading) => reading.hooked === 1 && reading.hookedHasRoom),
      {
        message:
          'WHAT: the entries pane never offered exactly one box, carrying the entries-scroll hook, holding more entries than fit it. WHY: the owner scrolls the list and nothing else, so the list must live in one box of its own that takes the remaining room and the vertical scroll; with no such box there is nothing to scroll and nothing to pin the card and the heading against. HOW: wrap the entries area in one box carrying data-entries-scroll, give it the remaining room and the vertical scroll, and leave the card and the heading above it.',
        timeout: LAYOUT_BOUND_MS,
      },
    )
    .toBe(true)

  return page.evaluate(async () => {
    const box = document.querySelector<HTMLElement>('[data-pane="entries"] [data-entries-scroll]')
    if (box === null) return 0
    box.scrollTop = box.scrollHeight
    await new Promise((settle) => requestAnimationFrame(() => requestAnimationFrame(() => settle(null))))
    return box.scrollTop
  })
}

const thenTheListReallyTravelled = (travelled: number): void => {
  expect(
    travelled,
    `WHAT: the entries list came to rest ${travelled} from its start, so it never moved. WHY: a list that cannot scroll is not pinned, it is simply short, and every pinned reading below would then pass for free. HOW: let the one hooked box hold the whole list and take the vertical scroll.`,
  ).toBeGreaterThan(0)
}

/** The single-scroller law, counted over every box of the pane. */
const thenOnlyTheHookedBoxScrolls = (reading: PaneReading): void => {
  expect(
    [reading.overflowing.length, reading.hooked, reading.hookedOverflows, reading.screenOverflows],
    `WHAT: the entries pane holds ${reading.overflowing.length} box(es) with more content than fits them (${reading.overflowing.join(', ') || 'none'}) and ${reading.hooked} box(es) carrying the entries-scroll hook. WHY: two boxes that scroll at once mean a scroll started on the card carries the card and the heading off the top, and a reading that looks for "the box that scrolls" then judges whichever one it meets first, so the screen the owner knows is not the screen a spec judges. HOW: clip the Entries screen inside its pane to the pane's own height and let only the hooked box below the card and the heading take the remaining room and the scroll.`,
  ).toEqual([1, 1, true, false])
}

/** Nothing of the pane scrolls at all, and the hooked box is nonetheless there. */
const thenNothingOfThePaneScrollsAndTheBoxIsStillThere = (reading: PaneReading): void => {
  expect(
    [reading.overflowing.length, reading.hooked, reading.hookedHasRoom],
    `WHAT: a ledger that fits the phone left ${reading.overflowing.length} box(es) of the entries pane with more content than fits them (${reading.overflowing.join(', ') || 'none'}) and ${reading.hooked} box(es) carrying the entries-scroll hook. WHY: when the whole ledger is in sight nothing may scroll, and the box the list lives in must still be exactly one: a screen that grows a second scroller on a short ledger would grow it on a long one too. HOW: keep one hooked box below the card and the heading, holding the remaining room, whether or not the list fills it.`,
  ).toEqual([0, 1, false])
}

const thenThePinnedPartsKeptTheirBoxes = (before: PaneReading, after: PaneReading): void => {
  expect(
    [sameBox(before.you, after.you), sameBox(before.abbaas, after.abbaas), sameBox(before.heading, after.heading)],
    `WHAT: with the list scrolled, the owner's own figure stood at ${wordBox(after.you)} where it had stood at ${wordBox(before.you)}, Abbaas's at ${wordBox(after.abbaas)} where it had stood at ${wordBox(before.abbaas)}, and the Entries heading at ${wordBox(after.heading)} where it had stood at ${wordBox(before.heading)}. WHY: the two figures the owner reads first and the heading of the list are what they check the list against, so they must stay put however far the list travels. HOW: keep them outside the box that scrolls, in a column that holds the pane's height.`,
  ).toEqual([true, true, true])
}

const thenThePageItselfHasNothingToScroll = (reading: PaneReading): void => {
  expect(
    [reading.pageHasMoreThanFits, reading.pageTop],
    `WHAT: with the entries scrolled, the page itself ${reading.pageHasMoreThanFits ? 'had more than fits it' : 'had nothing to scroll'} and stood at ${reading.pageTop}. WHY: a page that scrolls carries the bottom bar and the two figures off the phone, whatever the ledger grows to. HOW: keep the screen exactly the pane's height and everything that scrolls a box inside it.`,
  ).toEqual([false, 0])
}

const thenTheLastEntryStandsClearOfTheButtons = (reading: PaneReading): void => {
  expect(
    [reading.lastEntryAboveTheButtons, reading.lastEntryInsideTheBox],
    'WHAT: at the end of the scroll the owner\'s last entry did not stand wholly above the Send and Receive buttons, or did not lie wholly inside the box that scrolls. WHY: the oldest entry is the one the owner scrolls down to read, and an entry that ends under the two buttons cannot be read or tapped at all. HOW: keep the room for the buttons at the END of the box that scrolls, not as the screen\'s own padding below it.',
  ).toEqual([true, true])
}

const thenTheListStillHoldsEveryStoredEntry = (
  before: PaneReading,
  after: PaneReading,
  rows: number,
  days: number,
): void => {
  expect(
    [before.rows, before.days, after.rows, after.days],
    `WHAT: the entries pane listed ${before.rows} cards in ${before.days} day groups before the scroll and ${after.rows} in ${after.days} after it, where the stored ledger holds ${rows} entries on ${days} day(s). WHY: the box the entries now live in may lose nothing and double nothing: a scroll is how a list is read, never what it holds. HOW: draw one card per stored entry, grouped by its day, inside the box that scrolls.`,
  ).toEqual([rows, days, rows, days])
}

/** The hooked box is silent: it carries the hook and says nothing to a screen reader. */
const thenTheScrollingBoxSaysNothing = (reading: PaneReading): void => {
  expect(
    reading.hookedSpeaks,
    `WHAT: the box the entries scroll in speaks to a screen reader through ${reading.hookedSpeaks.join(', ') || 'nothing'}. WHY: a page read aloud must read the card, the heading and the entries in the same order as before: the box exists to hold a scroll, not to be announced. HOW: carry the hook alone on it, with no role and no name.`,
  ).toEqual([])
}

// ===== The scenarios =====

/**
 * The laws V6-L-pinned, V6-L-page-still, V6-L-clearance and V6-L-rows-kept over the long
 * ledger, with the construction claims V6-X-one-scroller, V6-X-hook and V6-X-clearance, and
 * the architecture obligation V6-AT-one-scroller counted over the whole pane.
 */
test('the entries list scrolls to its end while the two figures and the heading stay where they are', async ({
  page,
}) => {
  // Given the owner is reading a ledger of more entries than fit their phone
  await givenTheOwnerIsSignedIn(page, long)
  await givenTheOwnerIsReadingTheirEntries(page, LONG_ROWS)
  await givenTheStoredEntriesAreTallerThanThePhone(page)
  const before = await readTheEntriesPane(page)

  // When they scroll the list of entries to its end
  const travelled = await whenTheEntriesListIsScrolledToItsEnd(page)

  // Then the list really moved, and only the box the list lives in moved with it
  const after = await readTheEntriesPane(page)
  thenTheListReallyTravelled(travelled)
  thenOnlyTheHookedBoxScrolls(after)

  // And the two figures and the heading of the list stand exactly where they stood
  thenThePinnedPartsKeptTheirBoxes(before, after)

  // And the page itself still has nothing to scroll
  thenThePageItselfHasNothingToScroll(after)

  // And the last entry is reachable: wholly above the two buttons and wholly in the box
  thenTheLastEntryStandsClearOfTheButtons(after)

  // And the list holds the same entries, in the same day groups, as before the scroll
  thenTheListStillHoldsEveryStoredEntry(before, after, LONG_ROWS, LONG_DAYS)
})

/**
 * The law V6-L-clearance over a ledger whose entries all fall on one day: the last entry is
 * then the foot of a single group taller than the phone rather than of the last of many.
 */
test('a single long day of entries still ends clear of the two buttons', async ({ page }) => {
  // Given the owner is reading one day's entries, taller than their phone
  await givenTheOwnerIsSignedIn(page, oneDay)
  await givenTheOwnerIsReadingTheirEntries(page, ONE_DAY_ROWS)
  await givenTheStoredEntriesAreTallerThanThePhone(page)

  // When they scroll that one day to its end
  const travelled = await whenTheEntriesListIsScrolledToItsEnd(page)

  // Then the one group's last entry stands clear of the buttons, inside the scrolling box
  const after = await readTheEntriesPane(page)
  thenTheListReallyTravelled(travelled)
  expect(
    after.days,
    `WHAT: entries stored on one day were listed in ${after.days} day groups. WHY: this reading is about the foot of a SINGLE tall group: with the day split, the clearance below would be measured on the wrong entry. HOW: group the entries by their stored day.`,
  ).toBe(1)
  thenTheLastEntryStandsClearOfTheButtons(after)
})

/**
 * The law V6-L-one-scroller over the empty ledger, with V6-L-rows-kept's empty case, the
 * stressor V6-d-stress-empty and the silence of the box a page read aloud must not announce.
 */
test('an owner with no entries reads the hint whole, and nothing scrolls', async ({ page }) => {
  // Arrange: the owner has recorded nothing at all
  await givenTheOwnerIsSignedIn(page, empty)
  await givenTheOwnerIsReadingTheirEntries(page, 0)

  // Act: their Entries screen is read, every box of it
  const reading = await readTheEntriesPane(page)

  // Assert: the hint is whole, nothing scrolls, and the box the list would live in is there
  expect(
    [reading.hintWhollyInThePane, reading.rows, reading.days],
    `WHAT: an empty ledger showed its hint ${reading.hintWhollyInThePane === null ? 'nowhere at all' : reading.hintWhollyInThePane ? 'whole' : 'cut off by the screen'}, with ${reading.rows} cards in ${reading.days} day groups. WHY: an owner who has recorded nothing must be told what to do next, in full: a clipped column that squeezed the hint out of sight would leave them a blank screen. HOW: keep the hint above the box that scrolls, and let that box simply hold nothing.`,
  ).toEqual([true, 0, 0])
  thenNothingOfThePaneScrollsAndTheBoxIsStillThere(reading)
  thenTheScrollingBoxSaysNothing(reading)
  expect(
    [reading.you !== null, reading.abbaas !== null, reading.heading !== null],
    'WHAT: an empty ledger did not show the owner\'s own figure, Abbaas\'s figure and the Entries heading. WHY: the parts that stay put are the parts the owner reads first, and an empty ledger still reads them. HOW: keep the card and the heading above the box, whatever the ledger holds.',
  ).toEqual([true, true, true])
})

/**
 * The law V6-L-one-scroller over a ledger that fits the phone, which is the stressor
 * V6-d-stress-short-list: the pinned-place law is vacuous there, and the law that still
 * bites is that no box of the pane scrolls.
 */
test('a ledger that fits the phone scrolls nothing at all', async ({ page }) => {
  // Arrange: the owner has recorded less than fills their phone
  await givenTheOwnerIsSignedIn(page, short)
  await givenTheOwnerIsReadingTheirEntries(page, SHORT_ROWS)

  // Act: their Entries screen is read, every box of it
  const reading = await readTheEntriesPane(page)

  // Assert: nothing scrolls, the one box is there, and the page has nothing to scroll
  thenNothingOfThePaneScrollsAndTheBoxIsStillThere(reading)
  thenThePageItselfHasNothingToScroll(reading)
  expect(
    [reading.rows, reading.days],
    `WHAT: a ledger of ${SHORT_ROWS} stored entry was listed as ${reading.rows} cards in ${reading.days} day groups. WHY: the box that holds the list must hold a short one as faithfully as a long one. HOW: draw one card per stored entry inside that box.`,
  ).toEqual([SHORT_ROWS, 1])
})

/**
 * The stressor V6-d-stress-save-growth: the list grows by a save while the owner has it
 * scrolled. The saved card and its ring are drawn inside the box that scrolls, the two
 * figures and the heading keep their boxes, and the pane still has that one box alone.
 */
test('an entry saved while the list is scrolled is drawn inside the list, not over it', async ({
  page,
}) => {
  // Given the owner has scrolled their long list of entries
  await givenTheOwnerIsSignedIn(page, saving)
  await givenTheOwnerIsReadingTheirEntries(page, LONG_ROWS)
  await givenTheStoredEntriesAreTallerThanThePhone(page)
  await whenTheEntriesListIsScrolledToItsEnd(page)
  const before = await readTheEntriesPane(page)

  // When they record one more send from there
  await page.locator('[data-action="send"]').click()
  const form = page.locator('[data-form="send"]')
  await expect(
    form,
    'WHAT: the Send button opened no form. WHY: the owner records a send from the screen they are reading, and this reading is about what a save does to that screen. HOW: open the send form on the Send button.',
  ).toBeVisible()
  const chip = page.locator('[data-person-chip]').filter({ hasText: MARIYAM })
  await expect(
    chip,
    `WHAT: the send form did not offer ${MARIYAM}, the person the stored sends were made to. WHY: a send names who was paid, and a saved person is chosen rather than typed again. HOW: offer every stored person as a chip.`,
  ).toHaveCount(1)
  await chip.click()
  await page.getByLabel('Amount sent').fill(SAVED_DOLLARS)
  const save = page.getByRole('button', { name: SAVED_BUTTON, exact: true })
  await expect(
    save,
    `WHAT: the send form offered no ${SAVED_BUTTON} to save with. WHY: the save is this reading's stimulus: without it the list never grows while the owner is reading it. HOW: name the save button after the value it will record.`,
  ).toBeEnabled()
  await save.click()

  // Then the new card is inside the box that scrolls, and the pinned parts have not moved
  await expect(
    entryCards(page),
    `WHAT: after saving one more send the entries pane did not list ${LONG_ROWS + 1} cards. WHY: a save adds one entry to the list the owner is reading, and the reading below is of that new card. HOW: list the saved entry with the rest.`,
  ).toHaveCount(LONG_ROWS + 1)
  await expect(
    page.locator('[data-motion]'),
    'WHAT: the saved entry was still moving when the screen was measured. WHY: a card read mid-flight is read where it is passing, not where it rests. HOW: let the save motion finish before anything is measured.',
  ).toHaveCount(0)
  const after = await readTheEntriesPane(page)
  expect(
    after.newestEntryInsideTheBox,
    'WHAT: the newest card did not lie wholly inside the box the entries scroll in. WHY: a card drawn outside that box travels over the pinned figures or under the buttons instead of into the list, and the owner watches their own save land in the wrong place. HOW: keep the entries area, with its spine and its ring, a child of the box that scrolls.',
  ).toBe(true)
  thenThePinnedPartsKeptTheirBoxes(before, after)
  thenOnlyTheHookedBoxScrolls(after)
})
