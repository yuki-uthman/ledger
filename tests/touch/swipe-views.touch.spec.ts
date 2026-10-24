import { test, expect, type Browser, type Locator, type Page } from '@playwright/test'
import {
  ORIGIN,
  buildBundle,
  serveDist,
  startLocalStack,
  type ServedOrigin,
  type Stack,
} from '../support/local-stack.js'
import { createAccount, seedHistory, type Account } from '../support/accounts.js'
import { touchDrag, type GesturePlace } from '../support/touch-drag.js'

// A sideways swipe of one finger, as the owner makes it on their phone: begun
// anywhere on the screen, it carries Entries and Statement with the finger,
// settles on one of the two screens when the finger lifts, and opens nothing
// that happened to be under the finger.
//
// Judged through the declared public port only: the BUILT bundle as Chrome loads
// it over the served loopback origin, driven by REAL TOUCH - a touch start, a
// series of moves with real time between them, and an end, dispatched through a
// DevTools session on the page. Nothing here imports a module of src/. The
// reading is the document: which screen the shell says is shown, which single
// tab is marked as the current one, where the strip and the pill stand while the
// finger is down, which parts of the arriving screen declared their rise, what
// scrolled, and whether a sheet is open.
//
// WHY touch and not the mouse. The gesture answers the primary touch pointer
// alone, so a mouse drag switches nothing and every existing mouse-driven spec
// keeps its meaning exactly. That is also why this spec lives in a directory of
// its own, scanned by the touch-enabled project alone.
//
// Where the expected results come from. The two screen names and the tab that
// names the shown one are the shell's own, promised hooks. Everything measured
// sideways is measured against what the phone itself reports - the pane's own
// width - never against a number copied out of the product. Each gesture is
// stated so that it falls clearly on one side of the owner's bounds: a flick is
// fast and long, a spring-back is slow and short, a slow pass is slow and long.
// The bounds themselves - how fast is fast and how far is far - are the rule's
// own behaviour and are read at the rule's own port, in the unit test over
// generated releases, never here.
//
// What this reading cannot tell, stated so it is not overclaimed: it samples one
// reading per animation frame, so it misses whatever happens between two frames
// and says nothing about what the eye calls smooth; and a dispatched finger is
// not the owner's finger, so how the flick FEELS stays theirs to judge on the
// phone. Durations, curves, inks, sizes and gaps are not read at all.

const PASSWORD_FIELD = 'input[type="password"]'

/** The two screens the swipe carries, in the order the bar offers them. */
type View = 'entries' | 'statement'

/** How long a settling slide is given before the screen is read at rest. */
const REST_BOUND_MS = 1200
/** How long a gesture's frames are recorded: past the rest bound. */
const WINDOW_MS = 1600
/** A share of one screen's width: the slack allowed for sub-pixel rounding. */
const A_WHISKER = 0.02
/** A share of one screen's width: more than this between two frames is a jump. */
const A_JUMP = 0.6
/** Longer than the window in which the click that ended a swipe is swallowed. */
const AFTER_THE_SWALLOW_MS = 500

const ACCOUNT = {
  email: 'owner-swipe-views@abbaas.test',
  password: 'swipe-views-password-1',
} as const

const SEEDED_PERSON = 'Mariyam Nisha'

// An invented ledger: a rufiyaa send of MVR10,000 at the rate 20 stored as $500,
// a dollar send of $750, a repayment of $300, and then enough small sends that
// both screens hold more rows than the phone can show, so a list that scrolls on
// its own is there to be dragged.
const MVR_SEND_CENTS = 50000
const USD_SEND_CENTS = 75000
const PAYMENT_CENTS = 30000
const FILLER_SENDS = 12

const deviceToday = (): string => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
const TODAY = deviceToday()

let stack: Stack
let served: ServedOrigin
let account: Account

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  stack = startLocalStack()
  buildBundle(stack)
  served = await serveDist()
  account = await createAccount(stack, ACCOUNT)
  await seedHistory(
    stack,
    account,
    [SEEDED_PERSON],
    [
      {
        kind: 'send',
        currency: 'MVR',
        amountMinor: 1000000,
        rate: '20.0000',
        usdCents: MVR_SEND_CENTS,
        entryDate: TODAY,
        savedAt: `${TODAY}T03:00:00.000Z`,
        personName: SEEDED_PERSON,
      },
      {
        kind: 'send',
        currency: 'USD',
        amountMinor: USD_SEND_CENTS,
        rate: null,
        usdCents: USD_SEND_CENTS,
        entryDate: TODAY,
        savedAt: `${TODAY}T04:00:00.000Z`,
        personName: SEEDED_PERSON,
      },
      {
        kind: 'receive',
        currency: 'USD',
        amountMinor: PAYMENT_CENTS,
        rate: null,
        usdCents: PAYMENT_CENTS,
        entryDate: TODAY,
        savedAt: `${TODAY}T05:00:00.000Z`,
      },
      ...Array.from({ length: FILLER_SENDS }, (_unused, index) => ({
        kind: 'send' as const,
        currency: 'USD' as const,
        amountMinor: 1100 + index * 100,
        rate: null,
        usdCents: 1100 + index * 100,
        entryDate: TODAY,
        savedAt: `${TODAY}T0${6 + Math.floor(index / 6)}:${String(10 + index).padStart(2, '0')}:00.000Z`,
        personName: SEEDED_PERSON,
      })),
    ],
  )
})

test.afterAll(async () => {
  await served?.close()
})

// ===== What one frame of a gesture holds, and the screen at rest =====

/** One sampled frame while a finger is down or a slide is running. */
type StripFrame = {
  readonly t: number
  /** Where the strip stands, counted in screens from Entries. */
  readonly share: number | null
  /** Where the pill stands, counted in halves of the bar from Entries. */
  readonly pillShare: number | null
  readonly shown: string | null
  /** Every kind of motion anything in the document declares at this frame. */
  readonly motions: readonly string[]
  /** Every kind of part that declares it is rising at this frame. */
  readonly rises: readonly string[]
}

/** The whole screen once nothing is moving any more. */
type SwipeRest = {
  readonly shown: string | null
  /** The screens whose tab is marked as the current one. */
  readonly current: readonly string[]
  readonly tabs: number
  readonly share: number | null
  readonly paneWidth: number
  /** Everything still claiming to move. */
  readonly claiming: readonly string[]
  /** The parts of the shell still displaced by an inline style of their own. */
  readonly displaced: readonly string[]
  readonly sheets: number
  readonly pageScrollsSideways: boolean
}

/** How far each box of the screen being read has been scrolled. */
type ScrollReading = readonly { readonly name: string; readonly top: number }[]

/** The elements inside the strip that keep the sideways gesture for themselves. */
type GestureReading = { readonly inside: number; readonly holders: readonly string[] }

declare global {
  interface Window {
    __recordStrip: (durationMs: number) => Promise<StripFrame[]>
    __readSwipeRest: () => SwipeRest
    __readScrolls: () => ScrollReading
    __readGestureHolders: () => GestureReading
  }
}

/**
 * The reader, installed in the page before anything is signed in. It names no
 * element this feature does not already promise: the shell by data-shown, the
 * panes by data-pane, the tabs by data-view. The TRACK and the PILL carry no
 * hook of their own, so each is derived - the track is the element that holds
 * both panes, the pill holder the one part of the bar that is hidden from a
 * reader - and never invented as a new attribute.
 */
const installReader = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    const nameOf = (element: Element): string => {
      const hooks = Array.from(element.attributes)
        .filter((attribute) => attribute.name.startsWith('data-') || attribute.name === 'role')
        .map((attribute) => `${attribute.name}=${attribute.value}`)
      return hooks.length > 0
        ? `${element.tagName.toLowerCase()}[${hooks.join(' ')}]`
        : element.tagName.toLowerCase()
    }
    const shell = (): HTMLElement | null => document.querySelector<HTMLElement>('[data-shown]')
    const paneOf = (which: string): HTMLElement | null =>
      document.querySelector<HTMLElement>(`[data-pane="${which}"]`)
    const trackOf = (): HTMLElement | null => paneOf('entries')?.parentElement ?? null
    const pillOf = (): HTMLElement | null =>
      document.querySelector<HTMLElement>('[aria-label="Views"] [aria-hidden="true"]')
    const travelOf = (element: Element | null): number | null => {
      if (!element) return null
      const drawn = window.getComputedStyle(element).transform
      if (!drawn || drawn === 'none') return 0
      const matrix = new DOMMatrixReadOnly(drawn)
      return matrix.m41
    }
    /** Where the strip stands, in screens from Entries: 0 on Entries, 1 on the Statement. */
    const shareOf = (): number | null => {
      const pane = paneOf('entries')
      const travel = travelOf(trackOf())
      const width = pane?.getBoundingClientRect().width ?? 0
      if (travel === null || width <= 0) return null
      return -travel / width
    }
    const pillShareOf = (): number | null => {
      const holder = pillOf()
      const travel = travelOf(holder)
      const width = holder?.getBoundingClientRect().width ?? 0
      if (travel === null || width <= 0) return null
      return travel / width
    }
    const motionsNow = (): string[] =>
      Array.from(document.querySelectorAll('[data-motion]')).map(
        (element) => element.getAttribute('data-motion') ?? '',
      )
    const risesNow = (): string[] =>
      Array.from(document.querySelectorAll('[data-enter-rise]')).map(
        (element) => element.getAttribute('data-enter-rise') ?? '',
      )
    const sideways = (): boolean => {
      const root = document.scrollingElement ?? document.documentElement
      return root.scrollWidth > root.clientWidth + 1 || root.scrollLeft !== 0
    }

    window.__recordStrip = (durationMs) =>
      new Promise<StripFrame[]>((settle) => {
        const frames: StripFrame[] = []
        const began = performance.now()
        const sample = (): void => {
          const at = performance.now()
          frames.push({
            t: at - began,
            share: shareOf(),
            pillShare: pillShareOf(),
            shown: shell()?.getAttribute('data-shown') ?? null,
            motions: motionsNow(),
            rises: risesNow(),
          })
          if (at - began >= durationMs) settle(frames)
          else requestAnimationFrame(sample)
        }
        requestAnimationFrame(sample)
      })

    window.__readSwipeRest = () => {
      const tabs = Array.from(document.querySelectorAll<HTMLElement>('[data-view]'))
      const shellNow = shell()
      const parts = [trackOf(), pillOf(), paneOf('entries'), paneOf('statement')]
      return {
        shown: shellNow?.getAttribute('data-shown') ?? null,
        current: tabs
          .filter((tab) => tab.getAttribute('aria-current') === 'page')
          .map((tab) => tab.getAttribute('data-view') ?? ''),
        tabs: tabs.length,
        share: shareOf(),
        paneWidth: paneOf('entries')?.getBoundingClientRect().width ?? 0,
        claiming: Array.from(document.querySelectorAll('[data-motion]')).map(nameOf),
        displaced: parts
          .filter(
            (part): part is HTMLElement =>
              part !== null && (part.style.transform !== '' || part.style.opacity !== ''),
          )
          .map(nameOf),
        sheets: document.querySelectorAll('[data-entry-sheet]').length,
        pageScrollsSideways: sideways(),
      }
    }

    window.__readScrolls = () => {
      const shown = shell()?.getAttribute('data-shown') ?? 'entries'
      const pane = paneOf(shown)
      if (!pane) return []
      // A box takes the owner's scroll when it holds more content than fits it
      // AND its own overflow lets that content be scrolled. A figure whose text
      // merely measures taller than its line box by a rounding clips nothing and
      // moves nothing, so counting it as a box that scrolls would let a drag that
      // moved nothing at all read as a drag that moved something.
      const takesAScroll = (element: HTMLElement): boolean => {
        if (element.scrollHeight - element.clientHeight <= 1) return false
        const overflow = window.getComputedStyle(element).overflowY
        return overflow === 'auto' || overflow === 'scroll' || overflow === 'overlay'
      }
      return [pane, ...Array.from(pane.querySelectorAll<HTMLElement>('*'))]
        .filter(takesAScroll)
        .map((element) => ({ name: nameOf(element), top: element.scrollTop }))
    }

    window.__readGestureHolders = () => {
      const track = trackOf()
      if (!track) return { inside: 0, holders: [] }
      const inside = Array.from(track.querySelectorAll<HTMLElement>('*'))
      // The ways of leaving the sideways move to the swipe while the browser
      // keeps the scroll down the screen.
      const leavesItToTheSwipe = new Set(['pan-y', 'pan-y pinch-zoom', 'none'])
      return {
        inside: inside.length,
        holders: inside
          .filter((element) => !leavesItToTheSwipe.has(window.getComputedStyle(element).touchAction))
          .map(nameOf),
      }
    }
  })
}

// ===== The domain vocabulary this oracle speaks =====

/** The gestures the owner makes, each clearly on one side of their own bounds. */
const A_FLICK_TO_THE_STATEMENT = { dx: -200, dy: 0, steps: 8, ms: 120 } as const
const A_FLICK_TO_THE_ENTRIES = { dx: 200, dy: 0, steps: 8, ms: 120 } as const
const A_SLOW_DRAG_PAST_THE_MIDDLE = { dx: -230, dy: 0, steps: 10, ms: 900 } as const
const A_SHORT_SLOW_DRAG = { dx: -30, dy: 0, steps: 6, ms: 600 } as const
const A_SLOW_DRAG_PAST_THE_END = { dx: 170, dy: 0, steps: 8, ms: 700 } as const
const A_DRAG_DOWN_THE_SCREEN = { dx: 0, dy: -170, steps: 8, ms: 700 } as const
const A_DIAGONAL_FLICK = { dx: -200, dy: 110, steps: 8, ms: 150 } as const

const givenTheOwnerIsReadingTheirEntries = async (page: Page): Promise<void> => {
  await installReader(page)
  await page.goto(ORIGIN)
  await expect(page.locator(PASSWORD_FIELD)).toBeVisible()
  await page.getByLabel('Email').fill(account.email)
  await page.getByLabel('Password').fill(account.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.locator(PASSWORD_FIELD)).toHaveCount(0)
  await thenEverythingHasComeToRest(page)
  await expect(page.locator('[data-shown]')).toHaveAttribute('data-shown', 'entries')
}

/**
 * The Statement reached by tapping its tab, waited for in that order on purpose:
 * the screen says it is the one being read BEFORE its slide is over, and before
 * it says so nothing is moving at all - so waiting for rest first would be
 * satisfied by a switch that had not begun. The screen is therefore waited for
 * with an assertion that retries, and only then is the slide let finish.
 */
const givenTheOwnerIsOnTheStatement = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Statement' }).tap()
  await expect(page.locator('[data-shown]')).toHaveAttribute('data-shown', 'statement', {
    timeout: REST_BOUND_MS + 1000,
  })
  await thenEverythingHasComeToRest(page)
}

const givenAPhoneThatAsksForLessMotion = async (browser: Browser): Promise<Page> => {
  const context = await browser.newContext({ hasTouch: true, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await givenTheOwnerIsReadingTheirEntries(page)
  return page
}

/** The frames of whatever happens next, sampled in the page itself. */
const whileEveryFrameIsRecorded = (page: Page): Promise<StripFrame[]> =>
  page.evaluate((ms) => window.__recordStrip(ms), WINDOW_MS)

const whenTheOwnerSwipes = (
  page: Page,
  from: GesturePlace,
  gesture: { readonly dx: number; readonly dy: number; readonly steps: number; readonly ms: number },
  how: { readonly end?: 'lift' | 'cancel'; readonly secondFinger?: boolean } = {},
): Promise<void> => touchDrag(page, { from, ...gesture, ...how })

const whenTheOwnerTapsTheCard = (page: Page): Promise<void> => firstCard(page).tap()

const firstCard = (page: Page): Locator =>
  page.locator('[data-pane="entries"] [data-entry]').first()

const thenEverythingHasComeToRest = async (page: Page): Promise<void> => {
  await expect(page.locator('[data-motion]')).toHaveCount(0, { timeout: REST_BOUND_MS + 1000 })
}

/**
 * A sheet the owner asked for, waited for and then read at rest.
 *
 * WHY the wait, and why it cannot be the rest wait alone. A tap on a card is
 * answered on the page's own hash, so the sheet is painted a moment after the
 * finger leaves - and the rise it then declares is what the rest wait watches
 * for. Waiting for rest first therefore proves nothing: before the sheet exists
 * nothing is moving, so that wait is already satisfied and a reading taken
 * straight after it can run before the sheet was ever built. So the sheet itself
 * is waited for, with an assertion that retries until it is there, and only then
 * is the screen read at rest. This is about WHEN the reading is taken, never
 * about what it may say.
 */
const thenTheSheetHasOpened = async (page: Page): Promise<void> => {
  await expect(
    page.locator('[data-entry-sheet]'),
    'WHAT: no sheet was ever built for the card that was tapped, however long the reading waited. WHY: a tap on an entry is the owner asking to see it, and this reading is only evidence about the swipe if an ordinary tap does open one. HOW: keep the card tap opening its own sheet.',
  ).toHaveCount(1, { timeout: REST_BOUND_MS + 1000 })
  await thenEverythingHasComeToRest(page)
}

/** A sheet the owner has closed, waited for and gone from the page. */
const thenTheSheetHasGone = async (page: Page): Promise<void> => {
  await expect(
    page.locator('[data-entry-sheet]'),
    'WHAT: the sheet the owner closed was still on the page, however long the reading waited. WHY: the swipe that follows is only read honestly from a screen with nothing over it. HOW: keep Close taking the sheet off the page.',
  ).toHaveCount(0, { timeout: REST_BOUND_MS + 1000 })
  await thenEverythingHasComeToRest(page)
}

const theScreenAtRest = async (page: Page): Promise<SwipeRest> => {
  await thenEverythingHasComeToRest(page)
  return page.evaluate(() => window.__readSwipeRest())
}

const thenTheScreenBeingReadIs = async (page: Page, view: View): Promise<SwipeRest> => {
  // The screen the gesture settled on is waited for before anything is read at
  // rest: a switch is announced on the shell the moment it is decided and its
  // slide runs afterwards, so a reading taken straight after the rest wait could
  // be taken before the switch had begun, when nothing was moving yet and that
  // wait was already satisfied. The same claim is then read again off one
  // snapshot below, together with the tabs and the place of the strip, so the
  // page and that snapshot cannot disagree unnoticed.
  await expect(
    page.locator('[data-shown]'),
    `WHAT: the shell never came to read ${view}, however long the reading waited. WHY: a swipe is only a way of changing screens, so the screen it leaves behind is the whole of what the owner gets for it. HOW: hand the release to the rule and show the screen it answers.`,
  ).toHaveAttribute('data-shown', view, { timeout: REST_BOUND_MS + 1000 })
  const rest = await theScreenAtRest(page)
  expect(
    rest.shown,
    `WHAT: after the finger lifted the shell says ${rest.shown} is being read, not ${view}. WHY: a swipe is only a way of changing screens, so the screen it leaves behind is the whole of what the owner gets for it; one that settles on the wrong side undoes their gesture. HOW: hand the release to the rule and show the screen it answers.`,
  ).toBe(view)
  expect(
    rest.current,
    `WHAT: the tabs marked as the current screen read ${rest.current.join(', ') || 'none'} while ${view} is being read, out of ${rest.tabs} tabs. WHY: the bar is what tells the owner where they are, and a reader aloud has nothing else to go by: two marked tabs or none leaves them lost. HOW: write which screen is shown and both tab marks in the one place a tap already writes them.`,
  ).toEqual([view])
  expect(
    rest.share,
    `WHAT: the strip came to rest ${rest.share} screens from the Entries while ${view} is being read. WHY: a strip left between the two screens shows half of each, with no way back but another gesture. HOW: let the release settle the strip on exactly one screen.`,
  ).toBeCloseTo(view === 'entries' ? 0 : 1, 1)
  return rest
}

const thenTheStripFollowedTheFinger = (frames: readonly StripFrame[]): void => {
  const shares = frames.map((frame) => frame.share).filter((share): share is number => share !== null)
  const between = shares.filter((share) => share > A_WHISKER && share < 1 - A_WHISKER)
  expect(
    between.length,
    `WHAT: the two screens never stood between the Entries and the Statement at any frame of the drag; the strip read ${shares
      .slice(0, 6)
      .map((share) => share.toFixed(2))
      .join(' ')}. WHY: the owner is carrying the screens with their finger, and a strip that only jumps at the lift is not a swipe at all - they cannot see where they are taking it or change their mind. HOW: draw the strip at the share the rule gives for the travel so far, at every move.`,
  ).toBeGreaterThan(0)
  const pills = frames
    .map((frame) => frame.pillShare)
    .filter((share): share is number => share !== null)
  const pillBetween = pills.filter((share) => share > A_WHISKER && share < 1 - A_WHISKER)
  expect(
    pillBetween.length,
    `WHAT: the pill never stood between the two tabs while the screens were being carried; it read ${pills
      .slice(0, 6)
      .map((share) => share.toFixed(2))
      .join(' ')}. WHY: the pill is the owner's own answer to "where am I going", so a pill that waits for the lift makes the drag read as nothing happening. HOW: draw the pill at the same share as the strip at every move.`,
  ).toBeGreaterThan(0)
}

const thenTheArrivingScreenRose = (frames: readonly StripFrame[]): void => {
  const declared = frames.flatMap((frame) => frame.motions)
  expect(
    Array.from(new Set(declared)),
    'WHAT: no part of the page ever declared the arrival of the screen the swipe reached. WHY: the Statement assembles itself when it becomes the screen being read, and the owner is told the figures are theirs by that rise; a screen that simply appears after a swipe reads as a screen that was always there. HOW: tell the arriving screen it is the view now, with the same message a tab tap sends.',
  ).toContain('view-enter')
  const rose = Array.from(new Set(frames.flatMap((frame) => frame.rises)))
  for (const part of ['switch-card', 'switch-pill', 'switch-row'] as const) {
    expect(
      rose,
      `WHAT: the arriving Statement raised ${rose.join(', ') || 'nothing'}, without its ${part.replace('switch-', '')}. WHY: the owner reads the Statement from its balance card down through its rows, so each of those parts rises in turn exactly as it does after a tap; one that stays behind reads as a part that failed to load. HOW: send the arrival message once, and let the Statement raise its own parts as it already does.`,
    ).toContain(part)
  }
}

const thenNothingRose = (frames: readonly StripFrame[]): void => {
  const declared = Array.from(new Set(frames.flatMap((frame) => frame.motions)))
  expect(
    declared.filter((motion) => motion === 'view-enter'),
    `WHAT: a release that changed no screen still announced an arrival, declaring ${declared.join(', ')}. WHY: nothing arrived - the owner let go and stayed where they were - so rows that rise again read as figures that were just recomputed. HOW: tell the arriving screen only when the screen actually changed.`,
  ).toEqual([])
  expect(
    Array.from(new Set(frames.flatMap((frame) => frame.rises))),
    'WHAT: parts of the screen rose after a release that changed nothing. WHY: a rise is how a screen says it has just arrived, and this one never left. HOW: let the strip spring back without announcing anything.',
  ).toEqual([])
}

const thenNoSheetIsOpen = async (page: Page): Promise<void> => {
  const rest = await theScreenAtRest(page)
  expect(
    rest.sheets,
    `WHAT: ${rest.sheets} entry sheet was open over the screen the swipe reached. WHY: the finger lifts on whatever it was dragging - usually a card - and a sheet opening behind the swipe takes the owner somewhere they never asked to go, over the screen they did ask for. HOW: swallow the one click that follows a release, and take that swallow off again a moment later.`,
  ).toBe(0)
}

const thenThePageNeverScrolledSideways = (rest: SwipeRest): void => {
  expect(
    rest.pageScrollsSideways,
    'WHAT: the page itself can be scrolled sideways after the gesture. WHY: the swipe moves the two screens inside the strip, not the page; a page that slides sideways leaves the bar and the furniture half off the phone with nothing to grab. HOW: keep the strip inside a box that clips it, whatever the drag does.',
  ).toBe(false)
}

// ===== The gesture, screen by screen =====

/**
 * Law V5-L-follow (the card case), law V5-L-settle (the flick case), law
 * V5-L-rise (a release that changed the screen) and law L-shown-agrees (a
 * switching release): a flick begun in mid-screen on an entry card carries both
 * screens and the pill with the finger and leaves the Statement being read, with
 * its own tab marked and its parts risen.
 */
test('a flick begun on a card carries both screens and leaves the Statement being read, risen', async ({
  page,
}) => {
  // Given the owner reading their entries on a phone with a finger
  await givenTheOwnerIsReadingTheirEntries(page)
  const recording = whileEveryFrameIsRecorded(page)

  // When they flick sideways from an entry card towards the Statement
  await whenTheOwnerSwipes(page, 'card', A_FLICK_TO_THE_STATEMENT)

  // Then both screens followed the finger, the Statement is being read, and it rose
  const frames = await recording
  thenTheStripFollowedTheFinger(frames)
  const rest = await thenTheScreenBeingReadIs(page, 'statement')
  thenTheArrivingScreenRose(frames)
  thenThePageNeverScrolledSideways(rest)
})

/**
 * Law V5-L-settle (the short slow case) and law V5-L-rise (a release that
 * changed nothing), with law L-shown-agrees for a staying release: a drag too
 * short and too slow to count springs back to the screen it began on and
 * announces nothing.
 */
test('a short slow drag springs back to the screen it began on and announces nothing', async ({
  page,
}) => {
  // Given the owner reading their entries
  await givenTheOwnerIsReadingTheirEntries(page)
  const recording = whileEveryFrameIsRecorded(page)

  // When they drag a little way sideways, slowly, and let go
  await whenTheOwnerSwipes(page, 'card', A_SHORT_SLOW_DRAG)

  // Then the screens come back to the entries, with nothing announced
  const frames = await recording
  thenTheStripFollowedTheFinger(frames)
  const rest = await thenTheScreenBeingReadIs(page, 'entries')
  thenNothingRose(frames)
  thenThePageNeverScrolledSideways(rest)
})

/**
 * Law V5-L-settle (the slow pass case): a drag slow enough not to be a flick
 * still switches once it has carried the screens well past the middle.
 */
test('a slow drag carried well across leaves the other screen being read', async ({ page }) => {
  // Given the owner reading their entries
  await givenTheOwnerIsReadingTheirEntries(page)

  // When they drag the screens slowly most of the way across and let go
  await whenTheOwnerSwipes(page, 'pane', A_SLOW_DRAG_PAST_THE_MIDDLE)

  // Then the Statement is the screen being read
  await thenTheScreenBeingReadIs(page, 'statement')
})

/**
 * Law V5-L-follow (the list case) and law V5-L-settle, in the other direction: a
 * drag begun on a list that scrolls on its own carries the strip just as one
 * begun on a card does, and the owner can come back the way they went.
 */
test('a flick begun on a list that scrolls carries both screens back to the entries', async ({
  page,
}) => {
  // Given the owner reading the Statement, whose own list scrolls
  await givenTheOwnerIsReadingTheirEntries(page)
  await givenTheOwnerIsOnTheStatement(page)
  const listBefore = await page
    .locator('[data-statement-shown]')
    .first()
    .getAttribute('data-statement-shown')
  const recording = whileEveryFrameIsRecorded(page)

  // When they flick sideways from that list, back towards their entries
  await whenTheOwnerSwipes(page, 'list', A_FLICK_TO_THE_ENTRIES)

  // Then both screens followed the finger and the entries are being read
  const frames = await recording
  thenTheStripFollowedTheFinger(frames)
  const rest = await thenTheScreenBeingReadIs(page, 'entries')
  thenThePageNeverScrolledSideways(rest)

  // And the Statement's own two lists were left exactly as they were: a sideways
  // swipe switches the two SCREENS, and never what is sent for what is paid back
  const listAfter = await page
    .locator('[data-statement-shown]')
    .first()
    .getAttribute('data-statement-shown')
  expect(
    listAfter,
    `WHAT: a sideways swipe left the Statement reading ${listAfter} where it had been reading ${listBefore}. WHY: the swipe is the owner's way between their entries and their statement; moving what the Statement itself shows at the same time changes two things for one gesture and they asked for one. HOW: let the swipe settle the strip only, and leave the Statement's own two lists to their own tabs.`,
  ).toBe(listBefore)
})

/**
 * Law V5-L-follow (the past-the-end case) and the stressor of a drag that runs
 * off the end: the strip follows the finger past the last screen, but gives less
 * than the finger asks for, and settles back on the screen it began on.
 */
test('a drag that runs past the last screen resists and stays where it began', async ({ page }) => {
  // Given the owner reading their entries, the first of the two screens
  await givenTheOwnerIsReadingTheirEntries(page)
  const before = await theScreenAtRest(page)
  const recording = whileEveryFrameIsRecorded(page)

  // When they drag away from the Statement, past the end of the strip, and let go
  await whenTheOwnerSwipes(page, 'pane', A_SLOW_DRAG_PAST_THE_END)

  // Then the strip went past the end by far less than the finger travelled
  const frames = await recording
  const shares = frames.map((frame) => frame.share).filter((share): share is number => share !== null)
  const furthest = Math.min(...shares, 0)
  const asked = A_SLOW_DRAG_PAST_THE_END.dx / before.paneWidth
  expect(
    furthest,
    `WHAT: the strip never went past the end of the two screens at all; the furthest it stood was ${furthest.toFixed(2)} screens from the Entries. WHY: a strip that stops dead at the end tells the owner nothing about why their finger stopped working; a little give says "there is nothing this way" while they are still holding it. HOW: let the strip follow the finger past either end, by a fraction of what it travelled.`,
  ).toBeLessThan(-A_WHISKER)
  expect(
    Math.abs(furthest),
    `WHAT: past the end the strip travelled ${Math.abs(furthest).toFixed(2)} screens while the finger asked for ${Math.abs(asked).toFixed(2)}. WHY: past the end there is nothing to show, so following the finger fully leaves the owner holding an empty screen. HOW: give only a fraction of the travel once the strip is past an end.`,
  ).toBeLessThan(Math.abs(asked) - A_WHISKER)

  // And the entries are still the screen being read
  const rest = await thenTheScreenBeingReadIs(page, 'entries')
  thenThePageNeverScrolledSideways(rest)
})

/**
 * Law V5-L-no-sheet, with its three cases: the lift that ends a swipe over a
 * card opens nothing, a touch that never passed for a drag is an ordinary tap
 * that opens its sheet, and a tap made a moment after a release opens its sheet
 * as it always did.
 */
test('the lift that ends a swipe over a card opens nothing, while a tap still opens its sheet', async ({
  page,
}) => {
  // Given the owner reading their entries, where a tap on a card opens its sheet
  await givenTheOwnerIsReadingTheirEntries(page)
  await whenTheOwnerTapsTheCard(page)
  await thenTheSheetHasOpened(page)
  const opened = await page.evaluate(() => window.__readSwipeRest())
  expect(
    opened.sheets,
    'WHAT: tapping an entry card opened no sheet, so this reading cannot say the swipe is what kept one shut. WHY: a swallowed click is only evidence if an unswallowed one opens something. HOW: keep the card tap opening its own sheet.',
  ).toBe(1)
  await page.getByRole('button', { name: 'Close' }).tap()
  await thenTheSheetHasGone(page)

  // When they swipe from that same card and lift their finger on it
  await whenTheOwnerSwipes(page, 'card', A_FLICK_TO_THE_STATEMENT)

  // Then no sheet is open over the screen the swipe reached
  await thenTheScreenBeingReadIs(page, 'statement')
  await thenNoSheetIsOpen(page)

  // And a deliberate tap, a moment later, opens its sheet again
  await whenTheOwnerSwipes(page, 'card', A_FLICK_TO_THE_ENTRIES)
  await thenTheScreenBeingReadIs(page, 'entries')
  await page.waitForTimeout(AFTER_THE_SWALLOW_MS)
  await whenTheOwnerTapsTheCard(page)
  await thenTheSheetHasOpened(page)
  const again = await page.evaluate(() => window.__readSwipeRest())
  expect(
    again.sheets,
    'WHAT: a tap made well after the swipe had settled opened no sheet. WHY: the swallow exists to drop the one click a release raises, not to make the screen deaf: the owner who swipes and then deliberately taps a card must get its sheet. HOW: take the swallow off again shortly after the release.',
  ).toBe(1)
})

/**
 * Law V5-L-scroll and the refusal V5-b-f-slop, over both lists: a drag more down
 * the screen than across it scrolls the box under the finger and leaves the
 * screen being read exactly as it was, and the page itself never scrolls
 * sideways.
 */
for (const place of [
  { title: 'their entries', view: 'entries' as const },
  { title: 'the Statement', view: 'statement' as const },
]) {
  test(`a drag down ${place.title} scrolls the list under the finger and keeps that screen`, async ({
    page,
  }) => {
    // Given the owner reading a screen whose list is longer than the phone
    await givenTheOwnerIsReadingTheirEntries(page)
    if (place.view === 'statement') await givenTheOwnerIsOnTheStatement(page)
    const before = await page.evaluate(() => window.__readScrolls())
    expect(
      before.length,
      `WHAT: no box of ${place.title} can be scrolled at all, so a drag down it would prove nothing. WHY: this reading is only evidence when there is more to read than the phone shows. HOW: seed more entries than fit the screen.`,
    ).toBeGreaterThan(0)

    // When they drag up the screen, to read further down the list
    await whenTheOwnerSwipes(page, 'list', A_DRAG_DOWN_THE_SCREEN)

    // Then a box of that screen scrolled, and the screen being read is unchanged
    const after = await page.evaluate(() => window.__readScrolls())
    const moved = after.filter(
      (slot, index) => slot.top > (before[index]?.top ?? 0) + 1,
    )
    expect(
      moved.length,
      `WHAT: none of the ${before.length} boxes of ${place.title} that can scroll moved under a finger dragged down it. WHY: the swipe takes the sideways move and must give the up-and-down one back, or the owner can no longer read past the end of their list. HOW: leave the vertical gesture to the browser and claim only the sideways one.`,
    ).toBeGreaterThan(0)
    const rest = await thenTheScreenBeingReadIs(page, place.view)
    thenThePageNeverScrolledSideways(rest)
  })
}

/**
 * Law V5-L-gesture-everywhere, the architectural obligation V5-AT-gesture-everywhere:
 * no element inside the strip keeps the sideways gesture for itself, counted over
 * every element inside it rather than sampled, so a box a later value adds inside
 * the strip cannot escape the rule either.
 */
test('no part of the two screens keeps the sideways swipe for itself', async ({ page }) => {
  // Given the whole page of a seeded ledger, both screens with their cards and lists
  await givenTheOwnerIsReadingTheirEntries(page)

  // When every element inside the strip is read for the gesture it keeps
  const reading = await page.evaluate(() => window.__readGestureHolders())

  // Then none of them keeps the sideways one
  expect(
    reading.inside,
    'WHAT: the strip holds no elements at all, so counting the ones that keep the gesture proves nothing. WHY: this claim is an absence over everything inside the strip, which is empty only if the screens were never built. HOW: read the page once both screens are mounted.',
  ).toBeGreaterThan(0)
  expect(
    reading.holders,
    `WHAT: ${reading.holders.length} of the ${reading.inside} elements inside the strip keep the sideways gesture for themselves: ${reading.holders.slice(0, 5).join(', ')}. WHY: every box inside the strip that scrolls answers only to its own rule, so one that keeps the sideways move makes the swipe work in some places and not others - and the owner cannot tell which. HOW: declare the rule on the strip AND on every element inside it, in the one place the strip's own rule lives.`,
  ).toEqual([])
})

/**
 * Law L-shown-agrees (the tap case) under a finger: the bar still switches the
 * screens when it is tapped rather than dragged, and marks its tab, so the swipe
 * takes nothing away from the way the owner switched before.
 */
test('tapping a tab still switches the screens and marks that tab', async ({ page }) => {
  // Given the owner reading their entries
  await givenTheOwnerIsReadingTheirEntries(page)

  // When they tap the Statement tab with a finger
  await page.getByRole('button', { name: 'Statement' }).tap()

  // Then the Statement is being read, with its tab marked as the current one
  await thenTheScreenBeingReadIs(page, 'statement')
})

/**
 * The constraint V5-c-touch-only: the gesture answers the primary touch pointer
 * alone, so a drag made with a desktop pointer switches nothing. This is what
 * keeps every existing mouse-driven reading of the two screens meaning exactly
 * what it meant before the swipe existed.
 */
test('a drag made with a desktop pointer switches nothing', async ({ page }) => {
  // Given the owner reading their entries, with the pointer over an entry card
  await givenTheOwnerIsReadingTheirEntries(page)
  const box = await firstCard(page).boundingBox()
  expect(
    box,
    'WHAT: no entry card could be found to drag a pointer across. WHY: this reading is only evidence if the pointer really was dragged over the screens. HOW: seed the entries the drag begins on.',
  ).not.toBeNull()

  // The pointer starts near the card's own right edge, so the whole drag stays on
  // the page: a pointer carried off the glass is delivered to nothing, and this
  // reading is about the KIND of pointer, never about where the screen ends.
  const glass = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }))
  const across = 200
  const from = {
    x: Math.min(box!.x + box!.width - 4, glass.width - 1),
    y: Math.min(box!.y + box!.height / 2, glass.height - 1),
  }
  expect(
    from.x - across >= 0,
    `WHAT: a drag of ${across} across would carry the pointer off a screen ${glass.width} wide from ${Math.round(from.x)}. WHY: a pointer off the glass is delivered to nothing, so the reading would say the gesture was ignored when it was never made. HOW: begin the drag far enough in for the whole of it to stay on the page.`,
  ).toBe(true)

  // When that pointer is pressed, dragged right across the screen and let go
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  for (let step = 1; step <= 8; step += 1) {
    await page.mouse.move(from.x - (across * step) / 8, from.y)
  }
  await page.mouse.up()

  // Then the entries are still the screen being read
  await thenTheScreenBeingReadIs(page, 'entries')
})

/**
 * The refusal V5-b-f-cancel and the stressor of a pointer the browser takes
 * away: a drag the browser cancels instead of reporting its lift still settles
 * on one of the two screens, with the bar agreeing.
 */
test('a swipe the browser takes away still settles on one screen', async ({ page }) => {
  // Given the owner reading their entries
  await givenTheOwnerIsReadingTheirEntries(page)

  // When the browser takes the finger away in the middle of a flick
  await whenTheOwnerSwipes(page, 'card', A_FLICK_TO_THE_STATEMENT, { end: 'cancel' })

  // Then the screens settle on the Statement, as the flick asked
  await thenTheScreenBeingReadIs(page, 'statement')
  await thenNoSheetIsOpen(page)
})

/**
 * The refusal V5-b-f-second and the stressor of a second finger: a second touch
 * that goes down and lifts while a drag is live is answered by nothing, so the
 * screen being read changes at most once, by the finger that began the drag.
 */
test('a second finger during a swipe changes nothing', async ({ page }) => {
  // Given the owner reading their entries
  await givenTheOwnerIsReadingTheirEntries(page)
  const recording = whileEveryFrameIsRecorded(page)

  // When a second finger goes down and lifts while they are flicking across
  await whenTheOwnerSwipes(page, 'card', A_FLICK_TO_THE_STATEMENT, { secondFinger: true })

  // Then the screen being read changed exactly once, to the Statement
  const frames = await recording
  const shownOverTime = frames
    .map((frame) => frame.shown)
    .filter((shown): shown is string => shown !== null)
  const changes = shownOverTime.filter((shown, index) => index > 0 && shown !== shownOverTime[index - 1])
  expect(
    changes.length,
    `WHAT: the screen being read changed ${changes.length} times during one drag, reading ${changes.join(' then ')}. WHY: one gesture is one decision; a second finger that also settles the strip leaves the owner somewhere neither of their fingers asked for. HOW: hold the pointer that began the drag and ignore every move, lift and cancel that is not its own.`,
  ).toBeLessThanOrEqual(1)
  await thenTheScreenBeingReadIs(page, 'statement')
})

/**
 * The stressor of a diagonal drag: a finger that goes far in both directions but
 * further across is decided once, as a swipe, so the strip follows it across and
 * the box under it does not scroll at the same time.
 */
test('a diagonal drag carries the screens and does not scroll the list at the same time', async ({
  page,
}) => {
  // Given the owner reading their entries, whose list can be scrolled
  await givenTheOwnerIsReadingTheirEntries(page)
  const before = await page.evaluate(() => window.__readScrolls())
  const recording = whileEveryFrameIsRecorded(page)

  // When they drag far across and far down at once, further across
  await whenTheOwnerSwipes(page, 'list', A_DIAGONAL_FLICK)

  // Then the screens were carried, and nothing scrolled while they were
  const frames = await recording
  thenTheStripFollowedTheFinger(frames)
  await thenTheScreenBeingReadIs(page, 'statement')
  const after = await page.evaluate(() => window.__readScrolls())
  const scrolled = before.filter((slot, index) => Math.abs((after[index]?.top ?? 0) - slot.top) > 1)
  expect(
    scrolled.map((slot) => slot.name),
    `WHAT: ${scrolled.length} of the ${before.length} boxes that can scroll moved while the screens were being carried sideways. WHY: a screen that slides sideways while its list runs up at the same time reads as two gestures at once and the owner can aim neither. HOW: decide the gesture once, by the first move that passes the slop, and keep it.`,
  ).toEqual([])
})

/**
 * The stressor of a strip grabbed mid-slide: a drag begun while the tap's own
 * slide is still running is taken from where the strip stands, so it never jumps
 * to the far side, and it still settles on one of the two screens.
 */
test('grabbing the screens while they are still sliding does not jump them across', async ({
  page,
}) => {
  // Given the owner has just tapped the Statement tab, whose slide is still running
  await givenTheOwnerIsReadingTheirEntries(page)
  const recording = whileEveryFrameIsRecorded(page)
  await page.getByRole('button', { name: 'Statement' }).tap()

  // When they grab the moving screens and flick them back
  await whenTheOwnerSwipes(page, 'pane', A_FLICK_TO_THE_ENTRIES)

  // Then the strip never jumped across between two frames
  const frames = await recording
  const shares = frames.map((frame) => frame.share).filter((share): share is number => share !== null)
  const jumps = shares
    .map((share, index) => (index === 0 ? 0 : Math.abs(share - shares[index - 1]!)))
    .filter((step) => step > A_JUMP)
  expect(
    jumps.map((step) => step.toFixed(2)),
    `WHAT: the strip jumped ${jumps.map((step) => step.toFixed(2)).join(', ')} screens between two frames while the finger took hold of it. WHY: the owner grabs what they can see; a strip that snaps to where their finger went down loses the screen they were looking at in one frame. HOW: read where the strip stands at the moment the drag becomes live and offset the finger's own start by it.`,
  ).toEqual([])

  // And the entries are being read, as the flick back asked
  await thenTheScreenBeingReadIs(page, 'entries')
})

/**
 * Law V5-L-reduced, over its two cases: with less motion asked for, the screens
 * still follow the finger - that movement is the owner's own - and the released
 * screen is shown at once, with nothing claiming to move and no part left
 * displaced.
 */
for (const quiet of [
  { title: 'a flick', gesture: A_FLICK_TO_THE_STATEMENT, settles: 'statement' as const },
  { title: 'a short slow drag', gesture: A_SHORT_SLOW_DRAG, settles: 'entries' as const },
]) {
  test(`on a phone that asks for less motion, ${quiet.title} follows the finger and lands at once`, async ({
    browser,
  }) => {
    // Given a phone that asks for less motion, reading the owner's entries
    const page = await givenAPhoneThatAsksForLessMotion(browser)
    const recording = whileEveryFrameIsRecorded(page)

    // When the owner swipes on it
    await whenTheOwnerSwipes(page, 'card', quiet.gesture)

    // Then the screens followed the finger, and nothing ever claimed to move
    const frames = await recording
    thenTheStripFollowedTheFinger(frames)
    const claimed = Array.from(new Set(frames.flatMap((frame) => frame.motions)))
    expect(
      claimed,
      `WHAT: a phone that asked for less motion still declared motions while the screens settled: ${claimed.join(', ')}. WHY: that setting is the owner telling the app movement makes it unusable, so the release must simply be done; their own finger carrying the screens is their movement, not the app's. HOW: hand the settling to the one owner of an arrival, which draws nothing when that setting is on.`,
    ).toEqual([])

    // And the released screen is read at once, with no part left displaced
    const rest = await thenTheScreenBeingReadIs(page, quiet.settles)
    expect(
      rest.displaced,
      `WHAT: after the finger lifted on a quiet phone these parts were still displaced by a style of their own: ${rest.displaced.join(', ')}. WHY: with less motion asked for the screen is read in its final place from the first frame; a strip left standing where the finger left it is the drag never finished. HOW: hand every part back to its resting place at the arrival, however the release settled.`,
    ).toEqual([])
    thenThePageNeverScrolledSideways(rest)
    await page.context().close()
  })
}
