// Acceptance support: a finger on the served page.
//
// The swipe is a touch gesture, so the only honest way to drive it is to put a
// real touch point on the built bundle and move it. Playwright's own mouse
// cannot: the gesture answers the primary TOUCH pointer alone, which is why
// every existing mouse-driven spec keeps its meaning. So the drag is dispatched
// through a Chrome DevTools session on the page under test, as a touch start, a
// series of moves with real time between them, and an end - exactly the shape
// the browser reports when a finger does it.
//
// WHY the moves really wait. The gesture reads how FAST the finger was going at
// the lift, and the browser stamps each touch event with the moment it was
// dispatched. A burst of moves with no time between them is therefore not a
// slow drag at all; it is an infinitely fast one. Each move waits its own share
// of the gesture's stated duration, so a flick is fast because it IS fast and a
// slow drag is slow for the same reason.
//
// WHY the start place is NAMED rather than given in pixels. The owner's claim is
// that a swipe works ANYWHERE - in mid-screen, on a card, on a list that
// scrolls on its own - so a spec says where the finger goes down in those words
// and this helper finds that place on the page it is handed. Nothing here
// asserts anything: it is a finger, not a reading.
import type { BrowserContext, Page } from '@playwright/test'

/** Where on the screen the finger goes down, in the words the owner uses. */
export type GesturePlace =
  /** On an entry card of the screen being read. */
  | 'card'
  /** On the box of the screen being read that scrolls on its own. */
  | 'list'
  /** In mid-screen, on the pane of the view being read itself. */
  | 'pane'

/** One gesture of one finger, as a spec states it. */
export type Gesture = {
  readonly from: GesturePlace
  /** How far the finger travels across the screen, positive to the right. */
  readonly dx: number
  /** How far it travels down the screen, positive downwards. */
  readonly dy: number
  /** How many moves the travel is reported in. Zero moves is a tap. */
  readonly steps: number
  /** How long the whole travel takes, which is what makes it a flick or a drag. */
  readonly ms: number
  /**
   * How the finger leaves the screen: lifted, which is what a finger normally
   * does, or taken away by the browser, which it may do at any moment instead.
   */
  readonly end?: 'lift' | 'cancel'
  /** A second finger that goes down and lifts again while this drag is live. */
  readonly secondFinger?: boolean
}

type Point = { readonly x: number; readonly y: number }
type Session = Awaited<ReturnType<BrowserContext['newCDPSession']>>

/** One session per page: attaching twice to the same page is refused. */
const sessions = new WeakMap<Page, Promise<Session>>()

const sessionFor = (page: Page): Promise<Session> => {
  const open = sessions.get(page)
  if (open) return open
  const fresh = page.context().newCDPSession(page)
  sessions.set(page, fresh)
  return fresh
}

const touchPoint = (at: Point, id: number) => ({ x: at.x, y: at.y, force: 1, id })

/**
 * The place a named start resolves to on the page as it stands: the middle of
 * the card, of the scrolling box, or of the pane of the view being read, kept
 * inside both that pane and the window so the finger never goes down on the
 * bottom bar or off the screen.
 */
const placeOf = (page: Page, place: GesturePlace): Promise<Point> =>
  page.evaluate((which) => {
    const shell = document.querySelector('[data-shown]')
    const shown = shell?.getAttribute('data-shown') ?? 'entries'
    const pane = document.querySelector<HTMLElement>(`[data-pane="${shown}"]`) ?? document.body
    const depthOf = (element: Element): number => {
      let depth = 0
      let walk: Element | null = element
      while (walk) {
        depth += 1
        walk = walk.parentElement
      }
      return depth
    }
    const scrollers = Array.from(pane.querySelectorAll<HTMLElement>('*'))
      .concat(pane)
      .filter((element) => element.scrollHeight - element.clientHeight > 1)
      .sort((one, other) => depthOf(one) - depthOf(other))
    const chosen =
      which === 'card'
        ? (pane.querySelector<HTMLElement>('[data-entry]') ??
          pane.querySelector<HTMLElement>('[data-statement-row]') ??
          pane)
        : which === 'list'
          ? (scrollers.at(-1) ?? pane)
          : pane
    const box = chosen.getBoundingClientRect()
    const held = pane.getBoundingClientRect()
    // The part of the chosen box that is actually on the screen, inside its pane.
    const left = Math.max(box.left, held.left, 0)
    const right = Math.min(box.right, held.right, window.innerWidth)
    const top = Math.max(box.top, held.top, 0)
    const bottom = Math.min(box.bottom, held.bottom, window.innerHeight)
    return { x: Math.round((left + right) / 2), y: Math.round((top + bottom) / 2) }
  }, place)

/**
 * Puts one finger down at the named place, moves it by the stated travel over
 * the stated time, and takes it off again. A gesture with no moves is a tap.
 */
export const touchDrag = async (page: Page, gesture: Gesture): Promise<void> => {
  const session = await sessionFor(page)
  const start = await placeOf(page, gesture.from)
  const steps = Math.max(0, Math.trunc(gesture.steps))
  const wait = steps > 0 ? Math.max(0, gesture.ms) / steps : 0
  const secondAt = steps > 0 && gesture.secondFinger === true ? Math.ceil(steps / 2) : -1

  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [touchPoint(start, 0)],
  })

  let at = start
  for (let step = 1; step <= steps; step += 1) {
    if (wait > 0) await page.waitForTimeout(wait)
    at = {
      x: start.x + (gesture.dx * step) / steps,
      y: start.y + (gesture.dy * step) / steps,
    }
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [touchPoint(at, 0)],
    })
    if (step === secondAt) {
      // A second finger, reported as the whole set of points that are down, then
      // as the set that is left: the one that began the drag.
      const second = { x: Math.max(4, at.x - 40), y: Math.max(4, at.y - 40) }
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [touchPoint(at, 0), touchPoint(second, 1)],
      })
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [touchPoint(at, 0)],
      })
    }
  }

  await session.send('Input.dispatchTouchEvent', {
    type: gesture.end === 'cancel' ? 'touchCancel' : 'touchEnd',
    touchPoints: [],
  })
}
