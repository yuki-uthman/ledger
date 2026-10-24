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
  /**
   * In mid-screen, on the strip the two screens stand on. The strip spans the
   * whole screen in every frame, including every frame of a slide, which is why
   * a drag begun here can take hold of screens that are still moving.
   */
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
 * The place a named start resolves to on the page as it stands, and the screen it
 * was resolved against: the middle of the card, of the scrolling box, or of the
 * strip, moved just far enough inside the glass that the whole stated travel
 * stays on it.
 *
 * WHY the start is moved rather than left in the middle. A finger that goes down
 * where the page is not, or that is carried off the glass, is not a gesture at
 * all: the browser delivers no touch to anything, and a reading of the page then
 * says only that nothing happened - which is indistinguishable from a product
 * that refused the swipe. So the start is placed inside the visible part of the
 * named box AND inside the window less the travel, which keeps the stimulus the
 * spec stated exactly as it stated it - the same travel, the same time, the same
 * named place - while making it reach the page. When no such place exists, this
 * refuses loudly instead of touching nothing.
 *
 * WHY mid-screen means the strip and not a pane. The strip the two screens stand
 * on spans the whole screen in every frame, while a pane is off to the side for
 * the whole of a slide: resolving mid-screen against the pane of the view being
 * read put the finger past the right edge of the glass for the first tenth of
 * every slide, so a drag meant to take hold of moving screens took hold of
 * nothing.
 */
const placeOf = (
  page: Page,
  place: GesturePlace,
  dx: number,
  dy: number,
): Promise<Point & { readonly width: number; readonly height: number }> =>
  page
    .evaluate(
      ({ which, acrossBy, downBy }) => {
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
        // A box takes the owner's scroll when it holds more content than fits it
        // AND its own overflow lets that content be scrolled. A figure whose text
        // merely measures taller than its line box by a rounding clips nothing and
        // moves nothing: a finger put there would be a finger on a word, not on a
        // list.
        const takesAScroll = (element: HTMLElement): boolean => {
          if (element.scrollHeight - element.clientHeight <= 1) return false
          const overflow = window.getComputedStyle(element).overflowY
          return overflow === 'auto' || overflow === 'scroll' || overflow === 'overlay'
        }
        const scrollers = Array.from(pane.querySelectorAll<HTMLElement>('*'))
          .concat(pane)
          .filter(takesAScroll)
          .sort((one, other) => depthOf(one) - depthOf(other))
        // The strip: the element that holds both panes. It carries no hook of its
        // own, so it is derived from the panes the shell promises.
        const track = document.querySelector<HTMLElement>('[data-pane="entries"]')?.parentElement
        const chosen =
          which === 'card'
            ? (pane.querySelector<HTMLElement>('[data-entry]') ??
              pane.querySelector<HTMLElement>('[data-statement-row]') ??
              pane)
            : which === 'list'
              ? (scrollers.at(-1) ?? pane)
              : (track ?? pane)
        const box = chosen.getBoundingClientRect()
        // Mid-screen is read against the strip alone, which is on the glass in
        // every frame; the other two places are read inside the pane that holds
        // them, so a finger never goes down on the bottom bar.
        const held = which === 'pane' ? box : pane.getBoundingClientRect()
        const width = window.innerWidth
        const height = window.innerHeight
        // The part of the chosen box that is actually on the glass.
        const left = Math.max(box.left, held.left, 0)
        const right = Math.min(box.right, held.right, width)
        const top = Math.max(box.top, held.top, 0)
        const bottom = Math.min(box.bottom, held.bottom, height)
        const says = `the ${which} place reads ${Math.round(box.left)} to ${Math.round(box.right)} across and ${Math.round(box.top)} to ${Math.round(box.bottom)} down, of which ${Math.round(left)} to ${Math.round(right)} and ${Math.round(top)} to ${Math.round(bottom)} is on a screen ${width} by ${height}, and the travel asked for is ${acrossBy} across and ${downBy} down`
        if (right - left < 1 || bottom - top < 1) {
          return { refusal: `nothing of ${says}`, width, height }
        }
        // The start is kept inside the visible box AND inside the glass less the
        // travel, so the finger goes down on the page and stays on it throughout.
        const lowX = Math.max(Math.ceil(left), 0, -acrossBy)
        const highX = Math.min(Math.floor(right) - 1, width - 1, width - 1 - acrossBy)
        const lowY = Math.max(Math.ceil(top), 0, -downBy)
        const highY = Math.min(Math.floor(bottom) - 1, height - 1, height - 1 - downBy)
        if (lowX > highX || lowY > highY) {
          return { refusal: `no start keeps the whole travel on the glass: ${says}`, width, height }
        }
        const middleX = Math.round((left + right) / 2)
        const middleY = Math.round((top + bottom) / 2)
        return {
          point: {
            x: Math.min(Math.max(middleX, lowX), highX),
            y: Math.min(Math.max(middleY, lowY), highY),
          },
          width,
          height,
        }
      },
      { which: place, acrossBy: dx, downBy: dy },
    )
    .then((resolved) => {
      if (!resolved.point) {
        // A helper that throws says so in its own words, so a run that could not
        // put a finger on the page is reported as a setup failure and never as a
        // product that refused the gesture.
        throw new Error(
          `A finger could not be put on the page: ${resolved.refusal ?? 'the place could not be read'}. The gesture was not dispatched at all, so nothing about the product was observed. Name a place the whole gesture fits on, or state a shorter travel.`,
        )
      }
      return { ...resolved.point, width: resolved.width, height: resolved.height }
    })

/**
 * Puts one finger down at the named place, moves it by the stated travel over
 * the stated time, and takes it off again. A gesture with no moves is a tap.
 */
export const touchDrag = async (page: Page, gesture: Gesture): Promise<void> => {
  const session = await sessionFor(page)
  const start = await placeOf(page, gesture.from, gesture.dx, gesture.dy)
  const steps = Math.max(0, Math.trunc(gesture.steps))
  const wait = steps > 0 ? Math.max(0, gesture.ms) / steps : 0
  const secondAt = steps > 0 && gesture.secondFinger === true ? Math.ceil(steps / 2) : -1

  /**
   * Every point of every touch, checked against the glass before it is sent. A
   * point off the glass is delivered to nothing, so the page would simply report
   * that nothing happened - which is what a product refusing the gesture looks
   * like. Refusing here, in this helper's own words, keeps the two apart: the
   * run reports a setup failure and no case can pass by never being touched.
   */
  const onTheGlass = (at: Point, what: string): Point => {
    if (at.x < 0 || at.x > start.width - 1 || at.y < 0 || at.y > start.height - 1) {
      throw new Error(
        `A touch of this gesture would land off the screen: ${what} at ${Math.round(at.x)},${Math.round(at.y)} on a screen ${start.width} by ${start.height}, for a ${gesture.from} start at ${start.x},${start.y} travelling ${gesture.dx} across and ${gesture.dy} down. A finger off the glass is delivered to nothing, so nothing about the product would be observed. State a travel that fits the screen, or a place that leaves room for it.`,
      )
    }
    return at
  }

  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [touchPoint(onTheGlass(start, 'the finger goes down'), 0)],
  })

  let at: Point = start
  for (let step = 1; step <= steps; step += 1) {
    if (wait > 0) await page.waitForTimeout(wait)
    at = onTheGlass(
      {
        x: start.x + (gesture.dx * step) / steps,
        y: start.y + (gesture.dy * step) / steps,
      },
      `move ${step} of ${steps}`,
    )
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [touchPoint(at, 0)],
    })
    if (step === secondAt) {
      // A second finger, reported as the whole set of points that are down, then
      // as the set that is left: the one that began the drag.
      const second = onTheGlass(
        { x: Math.max(4, at.x - 40), y: Math.max(4, at.y - 40) },
        'the second finger goes down',
      )
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
