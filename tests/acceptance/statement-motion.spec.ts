import { test, expect, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
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

// Every switch of the Statement, drawn as one movement, as the owner sees it on their
// phone: a tap on a bottom-bar tab slides the mint pill and the two views together and
// raises the arriving Statement's heading, balance card, pill, rows and footer one after
// another; a tap on the pill slides the two lists and turns the thumb from blue to teal
// while the heading and the balance card do not move at all; and a phone that asks for
// reduced motion shows the same end screens at once, with nothing moving.
//
// Judged only through the declared public port: the BUILT bundle as Chrome loads it over
// the served origin, at 360 by 780, sampled frame by frame INSIDE the page. Nothing here
// imports a module of src/; the stimulus is taps on the public tabs, and the reading is
// the document - its motion attributes, its computed transforms and opacities, and the
// transition declarations the served stylesheet gives each named part.
//
// Where the expected values come from.
//   - The board's own motion math, stated once below as constants: a slide of 420 ms and a
//     rise of 360 ms, both on cubic-bezier(0.2, 0.8, 0.2, 1), each rise delayed by
//     120 + min(index, 14) x 22 ms, the leaving view resting at opacity 0.4, the lists
//     travelling by their own width plus 16 px and the thumb by its own width plus 4 px.
//   - Everything measured in pixels is measured against what the phone itself reports -
//     its own width, the track's own width, each panel's own width - never against a
//     number copied out of the product.
//   - Every figure, count and word read past the rest bound is derived here from the rows
//     the ledger actually stores, read back outside the browser, so a motion that quietly
//     changed what the screen says cannot pass.
//
// How the parts are found. The hooks values 1 and 2 already promise are used as they
// stand: the two bottom-bar tabs, the two panes, the statement screen, its tablist and
// thumb, its two list panels, its rows and its two footers. The TRACK and the LIST AREA
// carry no hook of their own, so each is DERIVED from those promises - the track is the
// element that holds both panes, the list area the element that holds both panels - and
// never invented as a new attribute.
//
// What a frame cannot tell us, stated so the reading is not overclaimed: the sampler sees
// one reading per animation frame, so it misses anything that happens between two frames,
// it cannot see what the eye calls smooth, and it says nothing about the compositor's own
// work. Every timing below is therefore judged on the frame grid, with the tolerance the
// board's own 'plus two frames' allows.

const PASSWORD_FIELD = 'input[type="password"]'
const VIEWPORT = { width: 360, height: 780 } as const

// ===== The board's motion math =====

/** How long a slide takes, and how long one part's rise takes. */
const SLIDE_MS = 420
const RISE_MS = 360
/** The delay law of a rise: 120 ms, then 22 ms more for each part, capped at part 14. */
const RISE_BASE_DELAY_MS = 120
const RISE_STEP_MS = 22
const RISE_INDEX_CAP = 14
/** The one curve every switch travels on, as the browser serves it back. */
const CURVE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
/** Where the view that is leaving rests, and where the one arriving rests. */
const LEAVING_OPACITY = 0.4
const ARRIVING_OPACITY = 1
/** The gap the two lists travel over, and the gap the thumb travels over. */
const LIST_GAP_PX = 16
const THUMB_GAP_PX = 4
/** The thumb's two colours, as the browser computes them. */
const SENT_THUMB = 'rgb(36, 80, 138)'
const BACK_THUMB = 'rgb(15, 111, 104)'
/** Everything of a switch rests by here, measured from the tap. */
const REST_BOUND_MS = 1200

/** One animation frame on this phone, and the slack the board's 'plus two frames' allows. */
const FRAME_MS = 17
const TWO_FRAMES_MS = 2 * FRAME_MS
/**
 * A delay is scheduled on a timer and observed on the frame grid, under the runner's own
 * load, so an absolute delay is read with three frames of slack rather than two.
 */
const DELAY_SLACK_MS = 3 * FRAME_MS
/** Sub-pixel rounding: a part that "has not moved" may still differ by a whisker. */
const PIXEL = 1
/** How long the sampler records: past the rest bound, so the rest is inside the recording. */
const WINDOW_MS = 1500

// ===== The domain vocabulary this oracle speaks =====

/** The two views the bottom bar switches between. */
type View = 'entries' | 'statement'
/** The two lists the pill switches between. */
type Which = 'sent' | 'back'

/** One tap the owner makes, and how long after the one before it. */
type Tap =
  | { readonly on: 'view'; readonly to: View; readonly afterMs: number }
  | { readonly on: 'list'; readonly to: Which; readonly afterMs: number }

/** The accessible names the owner reads, and taps. */
const SENT_TAB = 'Sent for Abbaas'
const BACK_TAB = 'Paid back by Abbaas'
const LIST_TAB_NAME: Record<Which, string> = { sent: SENT_TAB, back: BACK_TAB }

/** The data-motion values this feature's four motions declare. */
const VIEW_SLIDE = 'view-slide'
const VIEW_ENTER = 'view-enter'
const LIST_SLIDE = 'list-slide'
const LIST_ENTER = 'list-enter'

/** The order the arriving Statement's parts rise in, and the index each one rises at. */
const SCREEN_RISE_ORDER = ['heading', 'card', 'pill'] as const

/** The delay the board gives the part at this index. */
const riseDelayOf = (index: number): number =>
  RISE_BASE_DELAY_MS + Math.min(index, RISE_INDEX_CAP) * RISE_STEP_MS

// ===== What one frame of a switch holds =====

/** The transition the served stylesheet declares for one part, as the browser reports it. */
type Decl = {
  readonly duration: string
  readonly timing: string
  readonly property: string
}

/** One named part, as the page reads it in one frame. */
type PartSample = {
  readonly key: string
  readonly present: boolean
  /** The kind this part declares while it rises, or null when it declares none. */
  readonly rise: string | null
  readonly phase: string | null
  readonly motion: string | null
  /** The part's own travel, taken out of its computed transform. */
  readonly x: number
  readonly y: number
  readonly opacity: number
  readonly bed: string
  readonly box: { readonly left: number; readonly top: number; readonly width: number; readonly height: number }
  readonly decl: Decl
  /** The inline transform and opacity the part carries of its own, if any. */
  readonly inlineTransform: string
  readonly inlineOpacity: string
}

/** One sampled frame of a switch. */
type Frame = {
  readonly t: number
  /** Every data-motion value present anywhere in the document at this frame. */
  readonly motions: readonly string[]
  readonly parts: readonly PartSample[]
  /**
   * Parts displaced by an inline style of their own while neither they nor any ancestor
   * declares a motion: the frames this law forbids.
   */
  readonly undeclared: readonly string[]
  readonly viewportWidth: number
  readonly trackWidth: number
  readonly pageScrolls: boolean
  /** Controls that would write money, counted on the Statement at this frame. */
  readonly writingControls: number
  /** Which list panels lie inside the phone's own width at this frame. */
  readonly panelsInside: readonly string[]
}

/** The whole screen past the rest bound, read once. */
type RestReading = {
  readonly shown: string | null
  readonly statementShown: string | null
  /** Every element still claiming to move, named. */
  readonly stillClaiming: readonly string[]
  /** Every element still carrying an inline transform or opacity, named. */
  readonly stillStyled: readonly string[]
  readonly trackX: number
  readonly viewportWidth: number
  readonly panelsInside: readonly string[]
  readonly pageScrolls: boolean
}

/** The end screen, in the words and figures the owner reads. */
type EndScreen = {
  readonly shown: string | null
  readonly statementShown: string | null
  readonly heading: string
  readonly totals: readonly string[]
  readonly sentFoot: string | null
  readonly backFoot: string | null
  readonly rows: readonly string[]
  readonly tabs: readonly (string | null)[]
  readonly panelsInside: readonly string[]
}

declare global {
  interface Window {
    __recordSwitch: (durationMs: number) => Promise<Frame[]>
    __readRest: () => RestReading
    __readEndScreen: () => EndScreen
  }
}

// ===== The sampler, installed in the page before anything is tapped =====

const installSampler = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()

    /** How an element is named when it has to be reported: its hooks, or its tag. */
    const nameOf = (element: Element): string => {
      const hooks = Array.from(element.attributes)
        .filter((attribute) => attribute.name.startsWith('data-') || attribute.name === 'role')
        .map((attribute) => `${attribute.name}=${attribute.value}`)
      return hooks.length > 0 ? `${element.tagName.toLowerCase()}[${hooks.join(' ')}]` : element.tagName.toLowerCase()
    }

    const pane = (which: string): HTMLElement | null =>
      document.querySelector<HTMLElement>(`[data-pane="${which}"]`)

    /**
     * The track: the element that holds both panes. It carries no hook of its own, so it
     * is derived from the two panes rather than invented.
     */
    const trackOf = (): HTMLElement | null => {
      const entries = pane('entries')
      const statement = pane('statement')
      const parent = entries?.parentElement ?? null
      if (parent === null) return null
      return statement === null || parent.contains(statement) ? parent : null
    }

    const screenOf = (): HTMLElement | null =>
      document.querySelector<HTMLElement>('[data-screen="statement"]')

    const panelOf = (which: string): HTMLElement | null =>
      screenOf()?.querySelector<HTMLElement>(`[data-statement-list="${which}"]`) ?? null

    /** The list area: the element that holds both list panels. Derived, like the track. */
    const listAreaOf = (): HTMLElement | null => {
      const sent = panelOf('sent')
      const back = panelOf('back')
      const parent = sent?.parentElement ?? null
      if (parent === null) return null
      return back === null || parent.contains(back) ? parent : null
    }

    const headingOf = (): HTMLElement | null => {
      const screen = screenOf()
      if (screen === null) return null
      return (
        Array.from(screen.querySelectorAll<HTMLElement>('h1, h2, h3, [role="heading"]')).find(
          (element) => squash(element.textContent) === 'Statement',
        ) ?? null
      )
    }

    /** The balance card: the box that holds all three of its figures. */
    const cardOf = (): HTMLElement | null => {
      const screen = screenOf()
      if (screen === null) return null
      let node: HTMLElement | null = screen.querySelector<HTMLElement>('[data-statement-total="balance"]')
      while (node !== null && node !== screen && node.querySelector('[data-statement-total="sent"]') === null) {
        node = node.parentElement
      }
      return node === null || node === screen ? null : node
    }

    const pillOf = (): HTMLElement | null =>
      screenOf()?.querySelector<HTMLElement>('[role="tablist"]') ?? null

    const thumbOf = (): HTMLElement | null => {
      const pillElement = pillOf()
      if (pillElement === null) return null
      return (
        (Array.from(pillElement.children).find(
          (child) => child.getAttribute('aria-hidden') === 'true',
        ) as HTMLElement | undefined) ?? null
      )
    }

    const navBarOf = (): HTMLElement | null =>
      document.querySelector<HTMLElement>('[role="navigation"]')

    const navPillOf = (): HTMLElement | null =>
      navBarOf()?.querySelector<HTMLElement>('[aria-hidden="true"]') ?? null

    const rowsOf = (which: string): HTMLElement[] =>
      Array.from(panelOf(which)?.querySelectorAll<HTMLElement>('[data-statement-row]') ?? []).slice(0, 20)

    const footOf = (which: string): HTMLElement | null =>
      screenOf()?.querySelector<HTMLElement>(`[data-statement-foot="${which}"]`) ?? null

    /** Whether this element or any ancestor says a motion is running. */
    const declaresMotion = (element: Element | null): boolean => {
      let node: Element | null = element
      while (node !== null) {
        if (node.hasAttribute('data-motion') || node.hasAttribute('data-enter-rise')) return true
        node = node.parentElement
      }
      return false
    }

    const displacedByInlineStyle = (element: HTMLElement): boolean => {
      const transform = (element.style.transform ?? '').trim()
      const opacity = (element.style.opacity ?? '').trim()
      const movedByTransform = transform !== '' && transform !== 'none'
      const dimmedByOpacity = opacity !== '' && Number(opacity) < 1
      return movedByTransform || dimmedByOpacity
    }

    const named = (): ReadonlyArray<readonly [string, HTMLElement | null]> => {
      const pairs: Array<readonly [string, HTMLElement | null]> = [
        ['track', trackOf()],
        ['nav-pill', navPillOf()],
        ['pane-entries', pane('entries')],
        ['pane-statement', pane('statement')],
        ['screen', screenOf()],
        ['list-area', listAreaOf()],
        ['panel-sent', panelOf('sent')],
        ['panel-back', panelOf('back')],
        ['thumb', thumbOf()],
        ['heading', headingOf()],
        ['card', cardOf()],
        ['pill', pillOf()],
        ['sent-foot', footOf('sent')],
        ['back-foot', footOf('back')],
      ]
      for (const which of ['sent', 'back']) {
        rowsOf(which).forEach((row, index) => {
          pairs.push([`${which}-row-${index}`, row])
        })
      }
      return pairs
    }

    const absent = (key: string): unknown => ({
      key,
      present: false,
      rise: null,
      phase: null,
      motion: null,
      x: 0,
      y: 0,
      opacity: 1,
      bed: '',
      box: { left: 0, top: 0, width: 0, height: 0 },
      decl: { duration: '', timing: '', property: '' },
      inlineTransform: '',
      inlineOpacity: '',
    })

    const sampleOne = (key: string, element: HTMLElement | null): unknown => {
      if (element === null) return absent(key)
      const style = window.getComputedStyle(element)
      const matrix = new DOMMatrixReadOnly(style.transform === 'none' ? '' : style.transform)
      const rect = element.getBoundingClientRect()
      return {
        key,
        present: true,
        rise: element.getAttribute('data-enter-rise'),
        phase: element.getAttribute('data-enter-phase'),
        motion: element.getAttribute('data-motion'),
        x: matrix.m41,
        y: matrix.m42,
        opacity: Number(style.opacity),
        bed: style.backgroundColor,
        box: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        decl: {
          duration: style.transitionDuration,
          timing: style.transitionTimingFunction,
          property: style.transitionProperty,
        },
        inlineTransform: (element.style.transform ?? '').trim(),
        inlineOpacity: (element.style.opacity ?? '').trim(),
      }
    }

    const insideTheViewport = (element: HTMLElement | null): boolean => {
      if (element === null) return false
      const rect = element.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) return false
      return rect.left > -2 && rect.right < window.innerWidth + 2
    }

    const writingControls = (): number => {
      const screen = screenOf()
      if (screen === null) return 0
      return (
        screen.querySelectorAll('[data-box], [data-action]').length +
        Array.from(screen.querySelectorAll('button, a')).filter((control) =>
          ['Send', 'Receive'].includes(squash(control.textContent)),
        ).length
      )
    }

    const frameNow = (t: number): unknown => {
      const track = trackOf()
      const root = document.documentElement
      const undeclared = Array.from(document.querySelectorAll<HTMLElement>('body *'))
        .filter((element) => displacedByInlineStyle(element) && !declaresMotion(element))
        .map(nameOf)
        .slice(0, 5)
      return {
        t,
        motions: Array.from(
          document.querySelectorAll('[data-motion]'),
          (element) => element.getAttribute('data-motion') ?? '',
        ),
        parts: named().map(([key, element]) => sampleOne(key, element)),
        undeclared,
        viewportWidth: root.clientWidth,
        trackWidth: track === null ? 0 : track.getBoundingClientRect().width,
        pageScrolls: root.scrollHeight > root.clientHeight + 1 || root.scrollTop !== 0,
        writingControls: writingControls(),
        panelsInside: ['sent', 'back'].filter((which) => insideTheViewport(panelOf(which))),
      }
    }

    window.__recordSwitch = (durationMs: number) =>
      new Promise((resolve) => {
        const frames: unknown[] = []
        const started = performance.now()
        const tick = (): void => {
          const t = performance.now() - started
          frames.push(frameNow(t))
          if (t < durationMs) requestAnimationFrame(tick)
          else resolve(frames as Frame[])
        }
        requestAnimationFrame(tick)
      })

    window.__readRest = (): RestReading => {
      const track = trackOf()
      const trackStyle = track === null ? null : window.getComputedStyle(track)
      const matrix = new DOMMatrixReadOnly(
        trackStyle === null || trackStyle.transform === 'none' ? '' : trackStyle.transform,
      )
      const root = document.documentElement
      return {
        shown: document.querySelector('[data-shown]')?.getAttribute('data-shown') ?? null,
        statementShown: screenOf()?.getAttribute('data-statement-shown') ?? null,
        stillClaiming: Array.from(
          document.querySelectorAll('[data-motion], [data-enter-rise], [data-enter-phase]'),
          nameOf,
        ),
        stillStyled: Array.from(document.querySelectorAll<HTMLElement>('body *'))
          .filter(
            (element) =>
              (element.style.transform ?? '').trim() !== '' || (element.style.opacity ?? '').trim() !== '',
          )
          .map(nameOf),
        trackX: matrix.m41,
        viewportWidth: root.clientWidth,
        panelsInside: ['sent', 'back'].filter((which) => insideTheViewport(panelOf(which))),
        pageScrolls: root.scrollHeight > root.clientHeight + 1 || root.scrollTop !== 0,
      }
    }

    window.__readEndScreen = (): EndScreen => {
      const screen = screenOf()
      return {
        shown: document.querySelector('[data-shown]')?.getAttribute('data-shown') ?? null,
        statementShown: screen?.getAttribute('data-statement-shown') ?? null,
        heading: squash(headingOf()?.textContent),
        totals: Array.from(
          screen?.querySelectorAll('[data-statement-total]') ?? [],
          (total) => `${total.getAttribute('data-statement-total')}: ${squash(total.textContent)}`,
        ),
        sentFoot: footOf('sent') === null ? null : squash(footOf('sent')?.textContent),
        backFoot: footOf('back') === null ? null : squash(footOf('back')?.textContent),
        rows: Array.from(
          screen?.querySelectorAll('[data-statement-row]') ?? [],
          (row) => squash(row.textContent),
        ).slice(0, 8),
        tabs: Array.from(
          document.querySelectorAll('[data-view]'),
          (tab) => `${tab.getAttribute('data-view')}: ${tab.getAttribute('aria-current')}`,
        ).concat(
          Array.from(
            screen?.querySelectorAll('[role="tab"]') ?? [],
            (tab) => `${squash(tab.textContent)}: ${tab.getAttribute('aria-selected')}`,
          ),
        ),
        panelsInside: ['sent', 'back'].filter((which) => insideTheViewport(panelOf(which))),
      }
    }
  })
}

// ===== The stimulus: one owner, one person and nine entries, as the design states =====

const ACCOUNT_NINE = { email: 'owner-motion-a@abbaas.test', password: 'motion-password-a1' } as const
const ACCOUNT_LONG = { email: 'owner-motion-b@abbaas.test', password: 'motion-password-b2' } as const

const AHMED = 'Ahmed Shifaz'

const dayOf = (index: number): string => `2026-09-${String((index % 28) + 1).padStart(2, '0')}`

/** The five sends and four repayments both lists are read from. */
const FIVE_SENDS: readonly EntrySeed[] = [
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 200700,
    rate: null,
    usdCents: 200700,
    entryDate: '2026-09-14',
    savedAt: '2026-09-14T09:00:00Z',
    personName: AHMED,
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
    currency: 'USD',
    amountMinor: 9000,
    rate: null,
    usdCents: 9000,
    entryDate: '2026-09-29',
    savedAt: '2026-09-29T09:00:00Z',
    personName: AHMED,
    method: null,
  },
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 100000,
    rate: null,
    usdCents: 100000,
    entryDate: '2026-10-03',
    savedAt: '2026-10-03T09:00:00Z',
    personName: AHMED,
    method: 'cheque',
  },
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 50000,
    rate: null,
    usdCents: 50000,
    entryDate: '2026-10-14',
    savedAt: '2026-10-14T09:00:00Z',
    personName: AHMED,
    method: 'cash',
  },
]

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

/**
 * A longer ledger, for the one claim a short one cannot carry: the delay law stops
 * growing at part fourteen, so every part from there on rises together.
 */
const SENDS_PAST_THE_CAP = 16
const LONG_SENDS: readonly EntrySeed[] = Array.from({ length: SENDS_PAST_THE_CAP }, (_unused, index) => ({
  kind: 'send' as const,
  currency: 'USD' as const,
  amountMinor: 10000 + index,
  rate: null,
  usdCents: 10000 + index,
  entryDate: dayOf(index),
  savedAt: `${dayOf(index)}T0${index % 10}:00:00Z`,
  personName: AHMED,
  method: 'cash' as const,
}))

let stack: Stack
let served: ServedOrigin
let nine: Account
let long: Account
let storedNine: readonly StoredLedgerRow[]

test.use({ viewport: VIEWPORT })

test.beforeAll(async () => {
  stack = startLocalStack()
  buildBundle(stack)
  served = await serveDist()

  nine = await createAccount(stack, ACCOUNT_NINE)
  const ninePeople = await seedPeopleByName(stack, nine, [AHMED])
  await replaceEntries(stack, nine, NINE, ninePeople)
  storedNine = await readStoredLedger(stack, nine)

  long = await createAccount(stack, ACCOUNT_LONG)
  const longPeople = await seedPeopleByName(stack, long, [AHMED])
  await replaceEntries(stack, long, LONG_SENDS, longPeople)
})

test.afterAll(async () => {
  await served?.close()
})

// ===== The steps this oracle's scenarios are written in =====

const navTab = (page: Page, to: View): Locator => page.locator(`[data-view="${to}"]`)
const listTab = (page: Page, to: Which): Locator => page.getByRole('tab', { name: LIST_TAB_NAME[to] })
const statement = (page: Page): Locator => page.locator('[data-screen="statement"]')

/** A phone that records every frame, set either to allow motion or to ask for less of it. */
const givenAPhoneThatRecordsEveryFrame = async (
  browser: Browser,
  motion: 'allowed' | 'reduced',
): Promise<{ context: BrowserContext; page: Page }> => {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    reducedMotion: motion === 'reduced' ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  await installSampler(page)
  return { context, page }
}

const givenTheOwnerIsSignedIn = async (page: Page, account: Account): Promise<void> => {
  await page.goto(ORIGIN)
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen never appeared. WHY: every switch of the Statement is read from a signed-in owner. HOW: serve the built bundle and let it mount its sign-in screen.',
  ).toBeVisible()
  await page.getByLabel('Email').fill(account.email)
  await page.getByLabel('Password').fill(account.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen stayed up after Sign in. WHY: the owner cannot reach the Statement until the app lets them in. HOW: confirm the seeded account and let sign-in replace the screen.',
  ).toHaveCount(0)
}

/** Waits until the owner's own entries are on the screen, so no paint is still pending. */
const givenTheOwnerIsReadingTheirEntries = async (page: Page): Promise<void> => {
  await expect(
    page.locator('[data-pane="entries"] [data-entry]').first(),
    'WHAT: the entries pane listed nothing. WHY: a switch is only one movement if the screen it leaves is finished painting. HOW: list the stored entries on the Entries tab before the first tap.',
  ).toBeVisible()
  await expect
    .poll(async () => (await page.evaluate(() => window.__readRest())).stillClaiming.length, {
      message:
        'WHAT: something was still claiming to move before the first tap. WHY: a switch can only be read from a screen at rest. HOW: let the opening motion finish and clear its own attributes.',
      timeout: 15_000,
    })
    .toBe(0)
}

/** Starts the recording and hands back the pending frames, so taps land while it samples. */
const whileEveryFrameIsRecorded = (page: Page): Promise<Frame[]> =>
  page.evaluate((ms) => window.__recordSwitch(ms), WINDOW_MS)

/**
 * One tap, as a finger makes it: no waiting for the tab to stand still, because the whole
 * point of these scenarios is a tap that lands while something is already travelling.
 */
const tap = async (page: Page, what: Tap): Promise<void> => {
  if (what.afterMs > 0) await page.waitForTimeout(what.afterMs)
  const target = what.on === 'view' ? navTab(page, what.to) : listTab(page, what.to)
  const name =
    what.on === 'view' ? `the ${what.to === 'entries' ? 'Entries' : 'Statement'} tab` : LIST_TAB_NAME[what.to]
  await expect(
    target,
    `WHAT: there is no ${name} on the screen to tap. WHY: a tap on it is the whole stimulus of this switch, so without it there is nothing to start. HOW: draw the bottom bar's two tabs and the Statement's two list tabs.`,
  ).toBeVisible()
  await target.click({ force: true, timeout: 10_000 })
}

const whenTheOwnerTapsTheStatementTab = async (page: Page): Promise<void> => {
  await expect(
    navTab(page, 'statement'),
    'WHAT: there is no Statement tab to tap on the bottom bar. WHY: a tap on that tab is the only way the switch can be started. HOW: draw the bottom bar with its Entries and Statement tabs.',
  ).toBeVisible()
  await tap(page, { on: 'view', to: 'statement', afterMs: 0 })
}

const whenTheOwnerTapsTheList = async (page: Page, to: Which): Promise<void> => {
  await expect(
    listTab(page, to),
    `WHAT: there is no tab named ${LIST_TAB_NAME[to]} to tap. WHY: the pill's two tabs are how the owner moves between what they sent and what Abbaas paid back. HOW: offer both tabs in the pill named Statement lists.`,
  ).toBeVisible()
  await tap(page, { on: 'list', to, afterMs: 0 })
}

/** Opens the Statement and waits until the whole of that switch has come to rest. */
const givenTheOwnerIsOnTheStatement = async (page: Page): Promise<void> => {
  await whenTheOwnerTapsTheStatementTab(page)
  await expect(
    statement(page),
    'WHAT: tapping Statement showed no statement screen. WHY: the tap is what brings the heading, the balance card, the pill and the lists into the phone. HOW: show the pane whose screen carries data-screen=statement.',
  ).toBeVisible()
  await thenEveryPartHasComeToRest(page)
}

/** Waits until nothing claims to move and nothing carries a style of its own any more. */
const thenEveryPartHasComeToRest = async (page: Page): Promise<RestReading> => {
  await expect
    .poll(
      async () => {
        const rest = await page.evaluate(() => window.__readRest())
        return rest.stillClaiming.length + rest.stillStyled.length
      },
      {
        message: `WHAT: parts of the switch were still claiming to move, or still carrying a transform or an opacity of their own, after ${REST_BOUND_MS} ms. WHY: every started motion ends, so no switch may leave the app between two screens. HOW: remove each data-motion the moment its own motion ends and leave every part with no inline style at all.`,
        timeout: REST_BOUND_MS + 2_000,
      },
    )
    .toBe(0)
  return page.evaluate(() => window.__readRest())
}

// ===== Reading the recording =====

const partOf = (frame: Frame, key: string): PartSample =>
  frame.parts.find((part) => part.key === key) ?? {
    key,
    present: false,
    rise: null,
    phase: null,
    motion: null,
    x: 0,
    y: 0,
    opacity: 1,
    bed: '',
    box: { left: 0, top: 0, width: 0, height: 0 },
    decl: { duration: '', timing: '', property: '' },
    inlineTransform: '',
    inlineOpacity: '',
  }

/** The frames in which this part declares the named motion. */
const framesDeclaring = (frames: readonly Frame[], key: string, motion: string): readonly Frame[] =>
  frames.filter((frame) => partOf(frame, key).motion === motion)

/** The frame at which a part first moves towards its resting place, from where it was held. */
const firstMovementOf = (frames: readonly Frame[], key: string): number | null => {
  const held = frames.find((frame) => Math.abs(partOf(frame, key).y) > PIXEL)
  if (held === undefined) return null
  const heldY = Math.abs(partOf(held, key).y)
  const moving = frames.find(
    (frame) => frame.t > held.t && Math.abs(partOf(frame, key).y) < heldY - 0.5,
  )
  return moving?.t ?? null
}

/** The frame at which a part has arrived: no displacement left and fully painted. */
const arrivalOf = (frames: readonly Frame[], key: string, after: number): number | null =>
  frames.find(
    (frame) =>
      frame.t > after && Math.abs(partOf(frame, key).y) <= PIXEL && partOf(frame, key).opacity > 0.99,
  )?.t ?? null

/** The keys of the parts that rise when the whole Statement arrives, in the board's order. */
const arrivingScreenParts = (rows: number): readonly string[] => [
  ...SCREEN_RISE_ORDER,
  ...Array.from({ length: rows }, (_unused, index) => `sent-row-${index}`),
  'sent-foot',
]

/** The properties a part is allowed to transition, as a set of words. */
const transitionedProperties = (declaration: string): readonly string[] =>
  declaration
    .split(',')
    .map((word) => word.trim())
    .filter((word) => word !== '' && word !== 'none')
    .sort()

// ===== The independent oracle: what the stored rows mean, worded here =====

const dollars = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const usd = (cents: number): string => `$${dollars.format(Math.abs(cents) / 100)}`

const centsOfKind = (rows: readonly StoredLedgerRow[], kind: 'send' | 'receive'): number =>
  rows.filter((row) => row.kind === kind).reduce((sum, row) => sum + row.usd_cents, 0)

const countOfKind = (rows: readonly StoredLedgerRow[], kind: 'send' | 'receive'): number =>
  rows.filter((row) => row.kind === kind).length

/** What this app calls a number of entries. */
const countLabel = (count: number): string =>
  count <= 0 ? 'No entries' : count === 1 ? '1 entry' : `${count} entries`

/** The three figures the balance card holds, as the stored rows add up. */
const expectedTotals = (rows: readonly StoredLedgerRow[]): readonly string[] => {
  const sent = centsOfKind(rows, 'send')
  const back = centsOfKind(rows, 'receive')
  return [`sent: ${usd(sent)}`, `back: ${usd(back)}`, `balance: ${usd(sent - back)}`]
}

/** What each footer says, counted and summed against the rows the ledger actually stores. */
const expectedFoot = (rows: readonly StoredLedgerRow[], which: Which): string => {
  const kind = which === 'sent' ? 'send' : 'receive'
  const count = countOfKind(rows, kind)
  const words = which === 'sent' ? 'Total sent' : 'Total paid back'
  return `${words} · ${countLabel(count)} ${usd(centsOfKind(rows, kind))}`
}

// ===== The tap sequences this oracle generates =====

/** The seed of every generated sequence: a constant of this spec, printed on failure. */
const SEED = 20261019

/** The gaps a second tap can arrive after, in milliseconds. */
const GAPS = [0, 60, 200, 600] as const
/**
 * A pill tab the owner cannot reach yet cannot be tapped: while the Statement is still
 * sliding in, its pill is off the side of the phone, so a pill tap is only generated once
 * the Statement is the arriving view and the slide is at least this far along.
 */
const PILL_REACHABLE_AFTER_MS = 200

/** A small, repeatable pseudo-random source, so every run reads the same sequences. */
const sourceFrom = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

/** Where a sequence of taps leaves the two switches, worked out here and not read back. */
const endStateOf = (taps: readonly Tap[]): { view: View; list: Which } => {
  let view: View = 'entries'
  let list: Which = 'sent'
  for (const what of taps) {
    if (what.on === 'view') view = what.to
    else list = what.to
  }
  return { view, list }
}

/**
 * The generated domain: sequences of one to four taps on the four tabs, with gaps of
 * 0, 60, 200 and 600 ms, every one of them starting from the Entries tab. The three cases
 * the design names are included by construction rather than hoped for: a single tap on
 * each of the four tabs, two taps inside one slide on the two tabs of the same switch,
 * and a navigation tap and a pill tap inside one slide.
 */
const generatedSequences = (): readonly Tap[][] => {
  const must: Tap[][] = [
    [{ on: 'view', to: 'statement', afterMs: 0 }],
    [
      { on: 'view', to: 'statement', afterMs: 0 },
      { on: 'view', to: 'entries', afterMs: 600 },
    ],
    [
      { on: 'view', to: 'statement', afterMs: 0 },
      { on: 'list', to: 'back', afterMs: 600 },
    ],
    [
      { on: 'view', to: 'statement', afterMs: 0 },
      { on: 'list', to: 'back', afterMs: 600 },
      { on: 'list', to: 'sent', afterMs: 600 },
    ],
    [
      { on: 'view', to: 'statement', afterMs: 0 },
      { on: 'view', to: 'entries', afterMs: 60 },
    ],
    [
      { on: 'view', to: 'statement', afterMs: 0 },
      { on: 'list', to: 'back', afterMs: 600 },
      { on: 'list', to: 'sent', afterMs: 60 },
    ],
    [
      { on: 'view', to: 'statement', afterMs: 0 },
      { on: 'list', to: 'back', afterMs: PILL_REACHABLE_AFTER_MS },
    ],
  ]

  const random = sourceFrom(SEED)
  const pick = <T>(choices: readonly T[]): T => choices[Math.floor(random() * choices.length)]!
  const grown: Tap[][] = []
  for (let sequence = 0; sequence < 5; sequence += 1) {
    const taps: Tap[] = [{ on: 'view', to: 'statement', afterMs: 0 }]
    const length = 2 + Math.floor(random() * 3)
    while (taps.length < length) {
      const gap = pick(GAPS)
      const onAView = random() < 0.5
      const where = endStateOf(taps)
      if (onAView) {
        taps.push({ on: 'view', to: where.view === 'entries' ? 'statement' : 'entries', afterMs: gap })
      } else if (where.view === 'statement' && gap >= PILL_REACHABLE_AFTER_MS) {
        taps.push({ on: 'list', to: where.list === 'sent' ? 'back' : 'sent', afterMs: gap })
      } else {
        taps.push({ on: 'view', to: 'statement', afterMs: gap })
      }
    }
    grown.push(taps)
  }
  return [...must, ...grown]
}

/** A sequence, in the words a reader of a failure needs. */
const wordsOf = (taps: readonly Tap[]): string =>
  taps
    .map((what) =>
      what.on === 'view'
        ? `${what.afterMs} ms later tap the ${what.to === 'entries' ? 'Entries' : 'Statement'} tab`
        : `${what.afterMs} ms later tap ${LIST_TAB_NAME[what.to]}`,
    )
    .join(', ')

/** Plays one sequence from the Entries tab, recording every frame of it. */
const playFrom = async (page: Page, account: Account, taps: readonly Tap[]): Promise<Frame[]> => {
  await givenTheOwnerIsSignedIn(page, account)
  await givenTheOwnerIsReadingTheirEntries(page)
  const recording = whileEveryFrameIsRecorded(page)
  for (const what of taps) {
    await tap(page, what)
  }
  return recording
}

// ===========================================================================
// The scenarios
// ===========================================================================

/**
 * Law V3-L-slide, on the navigation switch: the track, the navigation pill and the two
 * panes travel between exactly the resting states the stylesheet declares, over 420 ms on
 * the one curve, and nothing else about them is transitioned.
 */
test('a tap on Statement slides the mint pill and the two views together as one movement', async ({
  browser,
}) => {
  // Given a phone that records every frame, with the owner reading their own entries
  const { context, page } = await givenAPhoneThatRecordsEveryFrame(browser, 'allowed')
  await givenTheOwnerIsSignedIn(page, nine)
  await givenTheOwnerIsReadingTheirEntries(page)

  // When they tap Statement, while every frame is recorded
  const recording = whileEveryFrameIsRecorded(page)
  await whenTheOwnerTapsTheStatementTab(page)
  const frames = await recording

  // Then the track declares the slide and travels one whole phone width over 420 ms
  const sliding = framesDeclaring(frames, 'track', VIEW_SLIDE)
  expect(
    sliding.length,
    `WHAT: no frame of the tap showed the track declaring ${VIEW_SLIDE}. WHY: the slide is what tells the owner the two views are one strip moving under their finger, and the attribute is how any reader knows a motion is running. HOW: put ${VIEW_SLIDE} on the element that holds both panes for as long as they travel.`,
  ).toBeGreaterThan(1)
  const first = sliding[0]!
  const width = first.viewportWidth
  expect(
    Math.abs(partOf(first, 'track').x),
    'WHAT: the track was already away from the Entries view in the first frame of the slide. WHY: a slide that starts at its destination is a jump, not a movement. HOW: let the track travel from where it rests rather than being placed at the end state.',
  ).toBeLessThanOrEqual(width / 4)
  const travel = sliding.map((frame) => partOf(frame, 'track').x)
  expect(
    travel.every((x, index) => index === 0 || x <= travel[index - 1]! + PIXEL),
    `WHAT: the track turned back on itself while sliding: ${travel.map((x) => Math.round(x)).join(' ')}. WHY: one tap is one movement in one direction, so a track that goes forwards and back reads as two. HOW: travel from one resting state to the other without reversing.`,
  ).toBe(true)
  expect(
    Math.min(...travel),
    'WHAT: the track travelled past the Statement view, further than one phone width. WHY: the two views are exactly one width apart, so anything further shows an empty strip. HOW: rest the track at minus one half of its own width.',
  ).toBeGreaterThanOrEqual(-width - PIXEL)
  const arrived = sliding.find((frame) => Math.abs(partOf(frame, 'track').x + width) <= PIXEL)
  expect(
    arrived === undefined ? null : arrived.t - first.t,
    `WHAT: the track did not reach the Statement view within ${SLIDE_MS} ms and two frames of the first frame of its slide. WHY: the board gives every slide 420 ms: slower and the phone feels stuck, faster and the movement is not seen. HOW: transition the track over ${SLIDE_MS} ms.`,
  ).toBeLessThanOrEqual(SLIDE_MS + TWO_FRAMES_MS)

  // And the navigation pill travels one half of the bar, over the same frames
  const navPillTravel = sliding.map((frame) => partOf(frame, 'nav-pill').x)
  const barHalf = partOf(first, 'nav-pill').box.width
  expect(
    Math.max(...navPillTravel) - Math.min(...navPillTravel),
    'WHAT: the mint pill under the tabs did not travel one half of the bar while the views slid. WHY: the pill is what names the view the owner is in, so it has to arrive with them. HOW: travel the pill by its own width, on the same curve and over the same 420 ms.',
  ).toBeGreaterThanOrEqual(barHalf - PIXEL)

  // And the leaving view fades to 0.4 while the arriving one comes up to 1
  const settled = sliding[sliding.length - 1]!
  expect(
    Math.min(...sliding.map((frame) => partOf(frame, 'pane-entries').opacity)),
    `WHAT: the Entries view never faded towards ${LEAVING_OPACITY} while it slid away. WHY: the fading view is how the owner sees which of the two they are leaving. HOW: travel the leaving pane's opacity to ${LEAVING_OPACITY}.`,
  ).toBeLessThanOrEqual(LEAVING_OPACITY + 0.05)
  expect(
    partOf(settled, 'pane-statement').opacity,
    `WHAT: the arriving Statement did not come up to full strength. WHY: the view the owner moved to is the one they are reading, so it cannot stay dimmed. HOW: travel the arriving pane's opacity to ${ARRIVING_OPACITY}.`,
  ).toBeGreaterThanOrEqual(0.95)

  // And the stylesheet serves exactly the slide the board draws, on nothing else
  const decl = partOf(first, 'track').decl
  expect(
    [decl.duration, decl.timing, transitionedProperties(decl.property)],
    `WHAT: while the track declared its slide, the served stylesheet did not give it 420 ms on ${CURVE} for its transform alone; it served duration ${decl.duration}, timing ${decl.timing} and property ${decl.property}. WHY: the duration and the curve ARE the movement the board draws, and a second transitioned property moves something the board never moves. HOW: declare transform alone, over 0.42s, on that curve.`,
  ).toEqual(['0.42s', CURVE, ['transform']])
  const paneDecl = partOf(first, 'pane-entries').decl
  expect(
    [paneDecl.duration, paneDecl.timing, transitionedProperties(paneDecl.property)],
    `WHAT: while the views slid, the leaving pane's served transition was duration ${paneDecl.duration}, timing ${paneDecl.timing} and property ${paneDecl.property}. WHY: the fade of the leaving view travels with the slide, on the same curve and over the same time, and nothing else about a pane may travel. HOW: declare opacity alone, over 0.42s, on that curve.`,
  ).toEqual(['0.42s', CURVE, ['opacity']])

  await context.close()
})

/**
 * Law V3-L-slide, on the pill switch: the two list panels and the thumb travel between
 * exactly their resting states, by their own width plus the board's gap, over 420 ms.
 */
test('a tap on Paid back by Abbaas slides the two lists across and turns the thumb teal', async ({
  browser,
}) => {
  // Given the owner on the Statement, reading what they sent, with every frame recorded
  const { context, page } = await givenAPhoneThatRecordsEveryFrame(browser, 'allowed')
  await givenTheOwnerIsSignedIn(page, nine)
  await givenTheOwnerIsReadingTheirEntries(page)
  await givenTheOwnerIsOnTheStatement(page)

  // When they tap Paid back by Abbaas
  const recording = whileEveryFrameIsRecorded(page)
  await whenTheOwnerTapsTheList(page, 'back')
  const frames = await recording

  // Then the list area declares the slide, and each panel travels its own width and the gap
  const sliding = framesDeclaring(frames, 'list-area', LIST_SLIDE)
  expect(
    sliding.length,
    `WHAT: no frame of the pill tap showed the list area declaring ${LIST_SLIDE}. WHY: the two lists are one strip moving under the owner's finger, and the attribute is how any reader knows that motion is running. HOW: put ${LIST_SLIDE} on the element that holds both panels for as long as they travel.`,
  ).toBeGreaterThan(1)
  const first = sliding[0]!
  const sentWidth = partOf(first, 'panel-sent').box.width
  const backWidth = partOf(first, 'panel-back').box.width
  const sentTravel = sliding.map((frame) => partOf(frame, 'panel-sent').x)
  const backTravel = sliding.map((frame) => partOf(frame, 'panel-back').x)
  expect(
    Math.min(...sentTravel),
    `WHAT: the sent list did not travel off to the left by its own width and the board's ${LIST_GAP_PX} px gap. WHY: the list leaving has to clear the phone, gap and all, or its last column shows beside the arriving one. HOW: travel the sent panel to minus its own width less ${LIST_GAP_PX} px.`,
  ).toBeLessThanOrEqual(-(sentWidth + LIST_GAP_PX) + PIXEL)
  expect(
    Math.max(...backTravel),
    `WHAT: the paid-back list did not come in from the right by its own width and the board's ${LIST_GAP_PX} px gap. WHY: the arriving list enters from the side the owner tapped towards. HOW: travel the paid-back panel from plus its own width and ${LIST_GAP_PX} px.`,
  ).toBeGreaterThanOrEqual(backWidth + LIST_GAP_PX - PIXEL)
  const landed = sliding.find(
    (frame) => Math.abs(partOf(frame, 'panel-back').x) <= PIXEL && frame.t > first.t,
  )
  expect(
    landed === undefined ? null : landed.t - first.t,
    `WHAT: the paid-back list did not come to rest within ${SLIDE_MS} ms and two frames of the first frame of its slide. WHY: the board gives this slide the same 420 ms as every other switch. HOW: transition the panels over ${SLIDE_MS} ms on ${CURVE}.`,
  ).toBeLessThanOrEqual(SLIDE_MS + TWO_FRAMES_MS)

  // And the thumb travels its own width and the gap, from blue to teal
  const thumbTravel = sliding.map((frame) => partOf(frame, 'thumb').x)
  const thumbWidth = partOf(first, 'thumb').box.width
  expect(
    Math.max(...thumbTravel) - Math.min(...thumbTravel),
    `WHAT: the pill's thumb did not travel its own width and the board's ${THUMB_GAP_PX} px gap. WHY: the thumb is what tells the owner which list they are reading. HOW: travel the thumb by its own width plus ${THUMB_GAP_PX} px.`,
  ).toBeGreaterThanOrEqual(thumbWidth + THUMB_GAP_PX - PIXEL)
  const beds = sliding.map((frame) => partOf(frame, 'thumb').bed)
  expect(
    [beds[0], beds[beds.length - 1]],
    `WHAT: the thumb did not travel from ${SENT_THUMB} to ${BACK_THUMB} across the slide; it read ${beds[0]} then ${beds[beds.length - 1]}. WHY: the colour is the board's own signal that the owner has crossed from what they sent to what came back. HOW: travel the thumb's background colour between those two colours over the slide.`,
  ).toEqual([SENT_THUMB, BACK_THUMB])
  const thumbDecl = partOf(first, 'thumb').decl
  expect(
    [thumbDecl.duration, thumbDecl.timing, transitionedProperties(thumbDecl.property)],
    `WHAT: while the lists slid, the thumb's served transition was duration ${thumbDecl.duration}, timing ${thumbDecl.timing} and property ${thumbDecl.property}. WHY: its place and its colour are the only two things that travel, over the same 420 ms and the same curve as every other switch. HOW: declare background-color and transform alone, over 0.42s, on ${CURVE}.`,
  ).toEqual(['0.42s', CURVE, ['background-color', 'transform']])

  await context.close()
})

/**
 * Law V3-L-rise-order, with the board's delay law V3-c-rise: the arriving parts first move
 * in the order heading, balance card, pill, rows, footer, each one delayed by
 * 120 + min(index, 14) x 22 ms, and each one's own travel lasts 360 ms.
 */
const RISE_LEDGERS = [
  { title: 'nine entries', rows: 5, accountOf: (): Account => nine },
  { title: 'a long list of sends', rows: SENDS_PAST_THE_CAP, accountOf: (): Account => long },
] as const

for (const ledger of RISE_LEDGERS) {
  test(`the arriving statement raises its heading, card, pill, rows and footer one after another, with ${ledger.title}`, async ({
    browser,
  }) => {
    // Given a phone that records every frame, with the owner reading their own entries
    const { context, page } = await givenAPhoneThatRecordsEveryFrame(browser, 'allowed')
    await givenTheOwnerIsSignedIn(page, ledger.accountOf())
    await givenTheOwnerIsReadingTheirEntries(page)

    // When they tap Statement
    const recording = whileEveryFrameIsRecorded(page)
    await whenTheOwnerTapsTheStatementTab(page)
    const frames = await recording

    // Then the arriving screen declares its entrance, and every part declares its own rise
    expect(
      framesDeclaring(frames, 'screen', VIEW_ENTER).length,
      `WHAT: no frame showed the arriving statement declaring ${VIEW_ENTER}. WHY: the whole arrival is one motion, and its root is what says so until the last part has rested. HOW: put ${VIEW_ENTER} on the statement screen from before the first part is displaced until the last one rests.`,
    ).toBeGreaterThan(1)
    const keys = arrivingScreenParts(ledger.rows)
    const tapAt = frames.find((frame) => partOf(frame, 'track').motion === VIEW_SLIDE)?.t ?? 0
    const moments = keys.map((key) => ({ key, at: firstMovementOf(frames, key) }))
    const never = moments.filter((moment) => moment.at === null).map((moment) => moment.key)
    expect(
      never,
      `WHAT: these parts of the arriving statement never moved at all: ${never.join(', ')}. WHY: the arrival is the heading, the balance card, the pill, every row and the footer rising one after another; a part that is simply there was never raised. HOW: raise each of those parts from below, in the board's order.`,
    ).toEqual([])
    const rising = frames.filter((frame) => partOf(frame, 'heading').rise !== null)
    expect(
      rising.length,
      'WHAT: the heading never declared that it was rising. WHY: a part displaced without saying so cannot be told apart from a part drawn in the wrong place. HOW: have each rising part carry its own rise attribute while it travels.',
    ).toBeGreaterThan(0)
    const headingDecl = rising[0]!.parts.find((part) => part.key === 'heading')!.decl
    expect(
      [headingDecl.duration, headingDecl.timing, transitionedProperties(headingDecl.property)],
      `WHAT: while the heading rose, the served stylesheet gave it duration ${headingDecl.duration}, timing ${headingDecl.timing} and property ${headingDecl.property}. WHY: a rise is 360 ms of place and strength on the one curve, and nothing else about the part may travel. HOW: declare opacity and transform alone, over 0.36s, on ${CURVE}.`,
    ).toEqual(['0.36s', CURVE, ['opacity', 'transform']])

    // And they move in the board's order, each at its own delay, each travelling 360 ms
    const timed = moments.map((moment) => ({ key: moment.key, at: moment.at! }))
    const outOfOrder = timed.filter(
      (moment, index) => index > 0 && moment.at < timed[index - 1]!.at - TWO_FRAMES_MS,
    )
    expect(
      outOfOrder.map((moment) => `${moment.key} at ${Math.round(moment.at)} ms`),
      `WHAT: these parts moved before the part they follow: ${outOfOrder.map((moment) => moment.key).join(', ')}. Read in order, the parts first moved at ${timed.map((moment) => `${moment.key} ${Math.round(moment.at - tapAt)}`).join(', ')} ms after the tap. WHY: the order heading, balance card, pill, rows, footer is how the screen assembles itself for the owner; raised together or backwards it is one flash. HOW: delay each part by 120 + min(index, 14) x 22 ms in exactly that order.`,
    ).toEqual([])
    const wrongDelay = timed.filter((moment, index) => {
      const expected = riseDelayOf(Math.min(index, RISE_INDEX_CAP))
      return Math.abs(moment.at - tapAt - expected) > DELAY_SLACK_MS
    })
    expect(
      wrongDelay.map(
        (moment) =>
          `${moment.key} moved ${Math.round(moment.at - tapAt)} ms after the tap, not ${riseDelayOf(timed.indexOf(moment))} ms`,
      ),
      `WHAT: these parts did not first move at the delay the board gives them: ${wrongDelay.map((moment) => moment.key).join(', ')}. WHY: the delay law 120 + min(index, 14) x 22 ms is what makes the arrival one sweep instead of a stack of separate movements, and the cap at part fourteen is what keeps a long list from arriving slowly. HOW: delay part ${0} by 120 ms and every later part by 22 ms more, stopping at part 14.`,
    ).toEqual([])
    const slowOrInstant = timed
      .map((moment) => ({ ...moment, arrival: arrivalOf(frames, moment.key, moment.at) }))
      .filter(
        (moment) =>
          moment.arrival === null ||
          moment.arrival - moment.at > RISE_MS + TWO_FRAMES_MS ||
          moment.arrival - moment.at < FRAME_MS,
      )
    expect(
      slowOrInstant.map((moment) => `${moment.key} took ${moment.arrival === null ? 'forever' : Math.round(moment.arrival - moment.at)} ms`),
      `WHAT: these parts did not travel for the 360 ms the board gives a rise: ${slowOrInstant.map((moment) => moment.key).join(', ')}. WHY: a rise that lands in one frame is a jump the owner never sees, and one that never lands leaves the screen unfinished. HOW: travel each part over ${RISE_MS} ms from where it is held.`,
    ).toEqual([])

    await context.close()
  })
}

/**
 * Law V3-L-steady, and the pill clause of the rise law V3-c-rise: through a pill switch the
 * heading and the balance card do not move at all, while the arriving list's own rows and
 * footer rise in index order.
 */
test('switching lists leaves the heading and the balance card exactly where they were', async ({
  browser,
}) => {
  // Given the owner on the Statement, reading what they sent, with every frame recorded
  const { context, page } = await givenAPhoneThatRecordsEveryFrame(browser, 'allowed')
  await givenTheOwnerIsSignedIn(page, nine)
  await givenTheOwnerIsReadingTheirEntries(page)
  await givenTheOwnerIsOnTheStatement(page)

  // When they tap Paid back by Abbaas
  const recording = whileEveryFrameIsRecorded(page)
  await whenTheOwnerTapsTheList(page, 'back')
  const frames = await recording

  // Then the heading and the card hold one box and one strength in every frame of the switch
  const switching = frames.filter((frame) => frame.motions.length > 0)
  expect(
    switching.length,
    'WHAT: no frame of the pill tap showed any motion running at all. WHY: the claim that the heading and the card stay still is empty unless the switch they stay still through actually ran. HOW: declare the list slide and the arriving list\'s entrance while they travel.',
  ).toBeGreaterThan(1)
  for (const key of ['heading', 'card'] as const) {
    const boxes = switching.map((frame) => partOf(frame, key).box)
    const opacities = switching.map((frame) => partOf(frame, key).opacity)
    const moved = boxes.filter(
      (box) => Math.abs(box.left - boxes[0]!.left) > PIXEL || Math.abs(box.top - boxes[0]!.top) > PIXEL,
    )
    expect(
      moved.map((box) => `${Math.round(box.left)},${Math.round(box.top)}`),
      `WHAT: the ${key === 'heading' ? 'heading' : 'balance card'} moved during a pill tap, reading ${boxes
        .slice(0, 4)
        .map((box) => `${Math.round(box.left)},${Math.round(box.top)}`)
        .join(' ')}. WHY: the pill switches the LIST, not the screen: a heading or a card that shifts makes the owner look again at figures that never changed. HOW: move only the two list panels and the thumb on a pill tap.`,
    ).toEqual([])
    expect(
      Math.max(...opacities) - Math.min(...opacities),
      `WHAT: the ${key === 'heading' ? 'heading' : 'balance card'} changed strength during a pill tap, between ${Math.min(...opacities)} and ${Math.max(...opacities)}. WHY: a figure that dims and brightens reads as a figure that was recomputed. HOW: leave the heading and the card out of the pill switch's motion altogether.`,
    ).toBeLessThanOrEqual(0.01)
  }

  // And the arriving list declares its own entrance and raises its rows in index order
  expect(
    framesDeclaring(frames, 'panel-back', LIST_ENTER).length,
    `WHAT: the arriving paid-back list never declared ${LIST_ENTER}. WHY: the arriving list's rows rise as one motion, and its panel is what says that motion is running. HOW: put ${LIST_ENTER} on the arriving panel until its last row and its footer rest.`,
  ).toBeGreaterThan(1)
  const rowKeys = [...Array.from({ length: 4 }, (_unused, index) => `back-row-${index}`), 'back-foot']
  const timed = rowKeys.map((key) => ({ key, at: firstMovementOf(frames, key) }))
  const never = timed.filter((moment) => moment.at === null).map((moment) => moment.key)
  expect(
    never,
    `WHAT: these parts of the arriving list never rose: ${never.join(', ')}. WHY: the arriving list is read from its first row to its total, so each of them is raised in turn. HOW: raise the arriving list's rows and its footer, in the order they are read.`,
  ).toEqual([])
  const ordered = timed.map((moment) => moment.at!)
  const steps = ordered.slice(1).map((at, index) => at - ordered[index]!)
  expect(
    steps.filter((step) => step < -TWO_FRAMES_MS).length,
    `WHAT: the arriving list's parts first moved out of order, at ${ordered.map((at) => Math.round(at)).join(' ')} ms. WHY: rows that arrive backwards read as a list being shuffled rather than filled. HOW: raise them in index order, each ${RISE_STEP_MS} ms after the one before it.`,
  ).toBe(0)
  const wrongStep = steps.filter((step) => Math.abs(step - RISE_STEP_MS) > DELAY_SLACK_MS)
  expect(
    wrongStep.map((step) => `${Math.round(step)} ms`),
    `WHAT: the gap between one arriving part and the next was not the board's ${RISE_STEP_MS} ms; the gaps read ${steps.map((step) => Math.round(step)).join(' ')} ms. WHY: the same delay law governs every rise of this feature, so a list that fills at another pace belongs to another design. HOW: delay each part ${RISE_STEP_MS} ms after the one before it, by the same law as the whole screen's arrival.`,
  ).toEqual([])

  await context.close()
})

/**
 * Law V3-L-reduced, the refusal V3-b-f3 and the reduced-motion stressor: a phone that asks
 * for reduced motion runs no transition and no rise at all, nothing ever declares a motion,
 * no part is ever displaced, and the end screen reads exactly as it does with motion
 * allowed. Both cases the design names are played: the four single taps, and a navigation
 * tap and a pill tap inside one slide.
 */
const REDUCED_CASES = [
  {
    title: 'one tap at a time',
    taps: [
      { on: 'view', to: 'statement', afterMs: 0 },
      { on: 'list', to: 'back', afterMs: 600 },
      { on: 'list', to: 'sent', afterMs: 600 },
      { on: 'view', to: 'entries', afterMs: 600 },
      { on: 'view', to: 'statement', afterMs: 600 },
    ] as readonly Tap[],
  },
  {
    title: 'a tab tap and a pill tap at once',
    taps: [
      { on: 'view', to: 'statement', afterMs: 0 },
      { on: 'list', to: 'back', afterMs: PILL_REACHABLE_AFTER_MS },
    ] as readonly Tap[],
  },
] as const

for (const reduced of REDUCED_CASES) {
  test(`a phone that asks for less motion shows the same end screen at once, with ${reduced.title}`, async ({
    browser,
  }) => {
    // Given one phone that asks for reduced motion and one that allows it
    const quiet = await givenAPhoneThatRecordsEveryFrame(browser, 'reduced')
    const lively = await givenAPhoneThatRecordsEveryFrame(browser, 'allowed')

    // When the same taps are made on both
    const quietFrames = await playFrom(quiet.page, nine, reduced.taps)
    const livelyFrames = await playFrom(lively.page, nine, reduced.taps)

    // Then nothing on the quiet phone ever claimed to move, and nothing was ever displaced
    const claimed = quietFrames.flatMap((frame) => frame.motions)
    expect(
      Array.from(new Set(claimed)),
      `WHAT: a phone that asked for reduced motion still declared motions: ${Array.from(new Set(claimed)).join(', ')}. WHY: a phone set to reduced motion is telling the app that movement makes it unusable, so the switch must simply be done. HOW: ask for that setting before any switch starts and, when it is set, change the screen with no transition and no rise.`,
    ).toEqual([])
    const displaced = quietFrames.flatMap((frame) => frame.undeclared)
    expect(
      Array.from(new Set(displaced)),
      `WHAT: parts were displaced on the quiet phone: ${Array.from(new Set(displaced)).slice(0, 5).join(', ')}. WHY: with reduced motion asked for, every part is read in its final place from the first frame. HOW: skip the start states altogether rather than running them with no transition.`,
    ).toEqual([])

    // And both phones come to rest reading exactly the same screen
    const quietEnd = await thenEveryPartHasComeToRest(quiet.page).then(() =>
      quiet.page.evaluate(() => window.__readEndScreen()),
    )
    const livelyEnd = await thenEveryPartHasComeToRest(lively.page).then(() =>
      lively.page.evaluate(() => window.__readEndScreen()),
    )
    expect(
      livelyFrames.flatMap((frame) => frame.motions).length,
      'WHAT: the phone that allows motion declared no motion either, so the two readings agree for the wrong reason. WHY: this scenario is only evidence if the quiet phone is quiet while the other one moves. HOW: run the switch motions on a phone that has not asked for less of them.',
    ).toBeGreaterThan(0)
    expect(
      quietEnd,
      'WHAT: the quiet phone and the phone that allows motion came to rest on different screens. WHY: motion is a way of showing a change, never a change of its own: the same taps must leave the same heading, figures, rows, totals and tabs either way. HOW: paint the end state first and always, and let the motion be nothing but how the parts get there.',
    ).toEqual(livelyEnd)

    await quiet.context.close()
    await lively.context.close()
  })
}

/**
 * Law V3-L-declares, over the generated tap sequences of V3-G-taps, with V3-d-interrupt as
 * its independent observation: no part is displaced in a frame in which neither it nor any
 * ancestor declares a motion; the track never rests between the two views; and whatever the
 * sequence, the screen comes to rest on the last tap's state, worked out here.
 */
test('however fast the tabs are tapped, nothing is left standing between two screens', async ({
  browser,
}) => {
  const sequences = generatedSequences()
  const { context, page } = await givenAPhoneThatRecordsEveryFrame(browser, 'allowed')

  /** What one sequence disagreed with, in the owner's own terms; empty when it agreed. */
  const complaintsFrom = async (taps: readonly Tap[]): Promise<readonly string[]> => {
    const frames = await playFrom(page, nine, taps)
    const complaints: string[] = []
    const undeclared = Array.from(new Set(frames.flatMap((frame) => frame.undeclared)))
    if (undeclared.length > 0) {
      complaints.push(`parts were displaced while nothing said a motion was running: ${undeclared.join(', ')}`)
    }
    const stillAtRest = frames.filter((frame) => frame.motions.length === 0 && frame.trackWidth > 0)
    const halfWay = stillAtRest.filter((frame) => {
      const x = partOf(frame, 'track').x
      return Math.abs(x) > PIXEL && Math.abs(x + frame.viewportWidth) > PIXEL
    })
    if (halfWay.length > 0) {
      complaints.push(
        `the two views rested half-way across with nothing claiming to move, at ${halfWay
          .slice(0, 3)
          .map((frame) => `${Math.round(partOf(frame, 'track').x)} px`)
          .join(', ')}`,
      )
    }
    const panelsOnScreen = frames
      .filter((frame) => frame.motions.length === 0 && frame.parts.some((part) => part.key === 'panel-sent' && part.present))
      .filter((frame) => frame.panelsInside.length > 1)
    if (panelsOnScreen.length > 0) {
      complaints.push('both lists were inside the phone at once with nothing claiming to move')
    }
    const rest = await thenEveryPartHasComeToRest(page)
    const wanted = endStateOf(taps)
    if (rest.shown !== wanted.view) {
      complaints.push(`the screen came to rest showing ${rest.shown ?? 'nothing'} rather than the last tap's ${wanted.view}`)
    }
    if (wanted.view === 'statement' && rest.statementShown !== wanted.list) {
      complaints.push(
        `the Statement came to rest showing the ${rest.statementShown ?? 'no'} list rather than the last tap's ${wanted.list}`,
      )
    }
    const restingAt = wanted.view === 'entries' ? 0 : -rest.viewportWidth
    if (Math.abs(rest.trackX - restingAt) > PIXEL) {
      complaints.push(`the two views came to rest ${Math.round(rest.trackX)} px across, not at ${restingAt} px`)
    }
    return complaints
  }

  // Given, when and then, once per generated sequence: the taps are the stimulus, the
  // frames and the rest are the reading, and a disagreeing sequence is shortened until the
  // shortest one that still disagrees is the one reported.
  for (const sequence of sequences) {
    let failing: readonly Tap[] = sequence
    let complaints = await complaintsFrom(sequence)
    if (complaints.length > 0) {
      for (let shorter = failing.slice(0, -1); shorter.length > 0; shorter = shorter.slice(0, -1)) {
        const shorterComplaints = await complaintsFrom(shorter)
        if (shorterComplaints.length === 0) break
        failing = shorter
        complaints = shorterComplaints
      }
    }
    expect(
      complaints,
      `WHAT: these taps left the app disagreeing with itself: ${wordsOf(failing)} (the shortest sequence from seed ${SEED} that still disagrees). WHY: a second tap inside a running switch is neither dropped nor queued: the screen travels from wherever it is to the last tap's state, so no part may be displaced without saying so and nothing may be left standing between two screens. HOW: write the two attributes again on every tap and let the transitions travel on from where they are.`,
    ).toEqual([])
  }

  await context.close()
})

/**
 * Law V3-L-ends, with the rest bound V3-c-rest-bound: within 1200 ms of the last tap no
 * element declares a motion any more and no part carries a transform or an opacity of its
 * own, whatever sequence of taps was made.
 */
test('every switch is finished within a second and a fifth of the tap that started it', async ({
  browser,
}) => {
  const { context, page } = await givenAPhoneThatRecordsEveryFrame(browser, 'allowed')
  await givenTheOwnerIsSignedIn(page, nine)
  await givenTheOwnerIsReadingTheirEntries(page)

  for (const sequence of generatedSequences()) {
    // Arrange: the owner back on their entries, with nothing claiming to move
    await tap(page, { on: 'view', to: 'entries', afterMs: 0 })
    await thenEveryPartHasComeToRest(page)

    // Act: the whole sequence of taps, then exactly the rest bound and not a frame more
    for (const what of sequence) {
      await tap(page, what)
    }
    await page.waitForTimeout(REST_BOUND_MS)

    // Assert: nothing claims to move and nothing carries a style of its own
    const rest = await page.evaluate(() => window.__readRest())
    expect(
      [rest.stillClaiming, rest.stillStyled],
      `WHAT: ${REST_BOUND_MS} ms after the last of these taps - ${wordsOf(sequence)} (seed ${SEED}) - the app still claimed to be moving ${rest.stillClaiming.join(', ') || 'nothing'} and still carried its own transform or opacity on ${rest.stillStyled.join(', ') || 'nothing'}. WHY: every started motion ends: the slowest part of a switch is a row at index 14, whose rise is over 788 ms after the tap, so a phone still moving a second and a fifth later has left the owner between two screens. HOW: clear each motion's attribute the moment that motion ends and leave every part with no inline style at all.`,
    ).toEqual([[], []])
  }

  await context.close()
})

/**
 * The failure V3-b-f2: with the tab hidden in the middle of a switch, the frame callbacks
 * stop, and the next visible frame must show the end state of every part, because each rise
 * reads its progress from the clock rather than counting frames.
 */
test('a switch started and then left behind is finished when the owner comes back to it', async ({
  browser,
}) => {
  // Given the owner reading their entries, with another page ready to take the foreground
  const { context, page } = await givenAPhoneThatRecordsEveryFrame(browser, 'allowed')
  await givenTheOwnerIsSignedIn(page, nine)
  await givenTheOwnerIsReadingTheirEntries(page)

  // When they tap Statement and the app is put in the background mid-switch
  await whenTheOwnerTapsTheStatementTab(page)
  // The discriminator: a switch left behind is only left behind if one was running when the
  // owner looked away. Without this reading, a phone that simply jumps between screens
  // would answer this scenario by having nothing to interrupt.
  const midSwitch = await page.evaluate(() => window.__readRest())
  expect(
    midSwitch.stillClaiming,
    'WHAT: the instant after the tap, nothing on the screen claimed to be moving, so there was no switch to leave behind. WHY: this scenario is about a movement that is still running when the owner looks away: a screen that changes in one jump could never fail it, and a pass would mean nothing. HOW: declare the slide and the arrival from the first frame of the tap.',
  ).not.toEqual([])
  const other = await context.newPage()
  await other.goto('about:blank')
  await other.bringToFront()
  await page.waitForTimeout(REST_BOUND_MS)
  await page.bringToFront()
  await expect(
    statement(page),
    'WHAT: coming back to the app showed no statement screen. WHY: the owner tapped Statement before leaving, so that is the screen they come back to. HOW: let a switch finish on its own clock while the app is hidden.',
  ).toBeVisible()
  const frames = await whileEveryFrameIsRecorded(page)
  await other.close()

  // Then the very first visible frame shows every part at rest, with nothing left claiming
  const firstVisible = frames[0]!
  const displaced = firstVisible.parts.filter(
    (part) => part.present && (Math.abs(part.y) > PIXEL || part.inlineTransform !== ''),
  )
  expect(
    [firstVisible.motions, displaced.map((part) => part.key)],
    `WHAT: the first frame after coming back to the app still claimed to be moving ${firstVisible.motions.join(', ') || 'nothing'} and still had these parts displaced: ${displaced.map((part) => part.key).join(', ') || 'none'}. WHY: a phone whose frame callbacks stopped while the owner was elsewhere must not resume a half-finished arrival a minute later; the switch is measured on the clock, so by the time they look again it is simply done. HOW: read each rise's progress from the clock and let the end state stand when no frame was served.`,
  ).toEqual([[], []])
  expect(
    Math.abs(partOf(firstVisible, 'track').x + firstVisible.viewportWidth),
    'WHAT: the two views were not resting on the Statement when the owner came back. WHY: the tap was made before they left, so the end state is the Statement, whole. HOW: let the track rest at minus one half of its own width once the switch is over.',
  ).toBeLessThanOrEqual(PIXEL)

  await context.close()
})

/**
 * The closure claim V3-cl-safety, with the constraints it protects: no motion changes a
 * figure, a row or a count; the page never scrolls through a switch; the Statement offers
 * nothing that writes at any frame; and Home is kept rather than repainted, so the list the
 * owner scrolled is where they left it.
 */
test('switching back and forth changes nothing the owner was reading', async ({ browser }) => {
  // Given the owner with their entries scrolled down, on a phone that records every frame
  const { context, page } = await givenAPhoneThatRecordsEveryFrame(browser, 'allowed')
  await givenTheOwnerIsSignedIn(page, nine)
  await givenTheOwnerIsReadingTheirEntries(page)
  const scrolledTo = await page.evaluate(() => {
    const scroller = Array.from(document.querySelectorAll<HTMLElement>('[data-pane="entries"] *')).find(
      (element) => element.scrollHeight > element.clientHeight + 1,
    )
    if (!scroller) return 0
    scroller.scrollTop = 120
    return scroller.scrollTop
  })

  // When they go to the Statement, across both lists, and back to their entries
  const recording = whileEveryFrameIsRecorded(page)
  await whenTheOwnerTapsTheStatementTab(page)
  await page.waitForTimeout(REST_BOUND_MS)
  await whenTheOwnerTapsTheList(page, 'back')
  await page.waitForTimeout(REST_BOUND_MS)
  const frames = await recording
  const end = await thenEveryPartHasComeToRest(page).then(() =>
    page.evaluate(() => window.__readEndScreen()),
  )

  // Then the figures and the footers still say what the stored rows mean
  expect(
    end.totals,
    `WHAT: after the switches the balance card no longer reads the three figures the ${storedNine.length} stored rows add up to. WHY: a motion is how a screen appears, never what it says: Total Sent, Paid Back and Balance are sums of the stored cents before and after any switch. HOW: draw the card from the rows the ledger holds and leave the motion out of the arithmetic.`,
  ).toEqual(expectedTotals(storedNine))
  expect(
    [end.sentFoot, end.backFoot],
    `WHAT: after the switches the two footers no longer count and add their own rows of the ${storedNine.length} stored ones. WHY: the footers are the owner's check that each list and the card agree, and a switch must not disturb either count. HOW: count and sum each list's stored rows, whatever motion just ran.`,
  ).toEqual([expectedFoot(storedNine, 'sent'), expectedFoot(storedNine, 'back')])
  expect(
    end.rows.length,
    `WHAT: the paid-back list does not hold one row for each of the ${countOfKind(storedNine, 'receive')} stored repayments. WHY: a motion that drops or doubles a row rewrites the ledger in front of the owner. HOW: draw one row per stored repayment and leave them alone while the panels travel.`,
  ).toBe(countOfKind(storedNine, 'receive'))

  // And nothing scrolled the page, and nothing that writes money appeared at any frame
  const scrolled = frames.filter((frame) => frame.pageScrolls)
  expect(
    scrolled.length,
    'WHAT: the page itself scrolled during a switch. WHY: a page that scrolls carries the bottom bar and the figures off the phone, and during a slide it would do so while the owner is mid-tap. HOW: keep the shell exactly the viewport height and every scrolling area inside a pane.',
  ).toBe(0)
  const writing = frames.filter((frame) => frame.writingControls > 0)
  expect(
    writing.length,
    'WHAT: a control that records money appeared on the Statement while a switch was running. WHY: the Statement only reports: a balance box or a Send or Receive button there, even for a few frames, offers the owner a way to write from a screen that cannot. HOW: draw no such control on the Statement, in any frame of any switch.',
  ).toBe(0)

  // And Home was kept, not repainted: the list is where the owner left it
  await tap(page, { on: 'view', to: 'entries', afterMs: 0 })
  await thenEveryPartHasComeToRest(page)
  const scrolledBack = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-pane="entries"] *')).find(
        (element) => element.scrollHeight > element.clientHeight + 1,
      )?.scrollTop ?? 0,
  )
  expect(
    scrolledBack,
    `WHAT: the owner's entries came back scrolled to ${scrolledBack} instead of the ${scrolledTo} they left. WHY: a switch moves the screen aside, it does not rebuild it: a rebuilt Home loses the owner's place and cancels whatever was moving inside it. HOW: keep both views mounted and switch between them by moving the strip that holds them.`,
  ).toBe(scrolledTo)
  await expect(
    page.locator('[data-pane="entries"] [data-entry]').first(),
    'WHAT: the entries pane no longer lists the owner\'s entries after the round trip. WHY: the Entries tab is today\'s Home, unchanged, and a switch away and back may not cost it anything. HOW: keep Home\'s own DOM across every switch.',
  ).toBeVisible()

  await context.close()
})

/**
 * The architecture obligation V3-AT-motion: the two new switches live in the one module that
 * owns motion, which still imports nothing of the domain, and each motion's attribute is
 * cleared when THAT motion ends rather than at the end of everything.
 */
test('the motion module stays free of the domain and clears its own attribute', async ({ browser }) => {
  // Arrange: the modules this value changes, read as they are committed
  const MODULES = ['src/ui/motion.ts', 'src/ui/views.ts', 'src/ui/statement.ts'] as const
  const sourceOf = (file: string): string | null => {
    const where = path.join(repoRoot, file)
    return existsSync(where) ? readFileSync(where, 'utf8') : null
  }
  const importsOf = (source: string): readonly string[] =>
    Array.from(source.matchAll(/^\s*import\s[^'"]*['"]([^'"]+)['"]/gm), (found) => found[1]!)
  expect(
    MODULES.filter((file) => sourceOf(file) === null),
    'WHAT: the modules that own the shell, the Statement and the motion of this app are not all there. WHY: the two new switches belong to the one module that owns movement, and the two screens hand it their own elements: without those modules there is nothing for this law to hold of. HOW: keep motion, the shell and the Statement each in its own module.',
  ).toEqual([])

  // Assert: motion knows nothing of money, and the screens hand it their own elements
  const motionImports = importsOf(sourceOf('src/ui/motion.ts') ?? '')
  expect(
    motionImports.filter((from) => /domain|adapters|ports/.test(from)),
    `WHAT: the module that owns motion imports ${motionImports.join(', ')}. WHY: nothing about a balance, an entry or a list may mean anything inside it: the moment motion reads the domain, a change to money becomes a change to movement. HOW: have the screens hand it their own elements and the kind of part each one is, and let it read nothing back.`,
  ).toEqual([])
  for (const screen of ['src/ui/views.ts', 'src/ui/statement.ts'] as const) {
    const source = sourceOf(screen) ?? ''
    expect(
      importsOf(source).filter((from) => /adapters|supabase/.test(from)),
      `WHAT: ${screen} reaches for an adapter of its own. WHY: only the composition root wires adapters; a screen that reaches past its ports can write where it was only meant to report. HOW: take what it needs as values and let the root compose the adapters.`,
    ).toEqual([])
    expect(
      /\bclass\s+\w/.test(source),
      `WHAT: ${screen} declares a class. WHY: this repository is functional throughout - pure projections, ports and screens as functions from values to DOM - and one class in a screen is the first of many. HOW: write it as a function from values to DOM.`,
    ).toBe(false)
  }

  // And each motion's own attribute is gone when that motion ends, not when the screen settles
  const { context, page } = await givenAPhoneThatRecordsEveryFrame(browser, 'allowed')
  await givenTheOwnerIsSignedIn(page, nine)
  await givenTheOwnerIsReadingTheirEntries(page)
  const recording = whileEveryFrameIsRecorded(page)
  await whenTheOwnerTapsTheStatementTab(page)
  const frames = await recording
  const slide = framesDeclaring(frames, 'track', VIEW_SLIDE)
  const enter = framesDeclaring(frames, 'screen', VIEW_ENTER)
  expect(
    [slide.length > 1, enter.length > 1],
    'WHAT: the navigation switch did not declare both of its motions - the slide of the two views and the arrival of the parts. WHY: the two motions have their own lengths, so each has to say when it is running. HOW: declare the slide on the strip that holds the panes and the arrival on the screen that arrives.',
  ).toEqual([true, true])
  const slideEnded = slide[slide.length - 1]!.t
  const enterEnded = enter[enter.length - 1]!.t
  expect(
    slideEnded - slide[0]!.t,
    `WHAT: the slide's own attribute outlasted the slide, standing for ${Math.round(slideEnded - slide[0]!.t)} ms. WHY: each attribute is removed the moment its OWN motion ends; one that lingers tells every reader - the owner's phone, the stylesheet and this oracle - that something is still moving when nothing is. HOW: remove the slide's attribute when the slide ends, and the arrival's when its last part rests.`,
  ).toBeLessThanOrEqual(SLIDE_MS + 2 * TWO_FRAMES_MS)
  expect(
    enterEnded,
    'WHAT: the arrival of the parts did not outlast the slide of the views. WHY: the parts keep rising after the strip has stopped, so their motion is the longer one and the two attributes cannot be cleared together. HOW: clear each one on its own ending.',
  ).toBeGreaterThan(slideEnded)

  await context.close()
})
