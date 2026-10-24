// The shell: the one screen the app mounts for the Home route, holding the two
// views side by side and the bar that moves between them.
//
// It is a function from the pane contents to DOM, as every screen in this app
// is, and it decides nothing about what a pane holds: each view is handed to it
// already built, and it neither reads one nor writes to one. It knows the two
// views by name and by nothing else.
//
// WHY each view gets a pane of its own. Home fixes two things to the foot of the
// screen - its bottom buttons and the fade over the list - and a fixed element
// is placed against the nearest ancestor that carries a transform, or the
// viewport when none does. The two views stand on a track that is moved sideways
// to switch between them, so Home's furniture would otherwise be placed against
// that moving track and the fade would cover the statement's rows.
//
// The cure is the pane: it carries a transform of its OWN, so it is the
// containing block of the fixed furniture of the screen inside it, it is exactly
// as tall as the track, and it is the only thing of its screen that scrolls.
// Measured in this repository's own Chromium (2026-10-19): a pane that is both
// the containing block and the scrolling element carries the bottom bar away
// with the list (the bar's top ran from 700 px to -1320 px), so the pane holds
// its height and the screen inside it is what scrolls.
//
// WHY a switch moves no DOM. A tap writes one attribute on the shell and the two
// aria-current values, and nothing else: nothing is read, re-rendered or
// unmounted. Repainting the view behind the tap would throw away where the owner
// had scrolled to and cancel any motion running inside it, and reading the
// ledger again could answer differently from the read both panes were built
// from. The resting place of the track and of the bar's pill are drawn from that
// one attribute alone, so the value that adds motion adds transitions over these
// same states and reworks nothing.
//
// The hooks, which every later value keeps:
//   - the shell carries data-shown="entries|statement"
//   - each pane carries data-pane="entries|statement" and the accessible name
//     Entries or Statement
//   - the bar is named Views; each tab carries data-view="entries|statement" and
//     aria-current="page" on the one showing, "false" on the other
//   - each tab holds exactly one drawing, before its word and hidden from any
//     reading of the page, so the word alone is what the tab is called
//
// WHY the arriving screen is TOLD it has arrived. The shell is the only thing
// that knows the moment a view becomes the one being read, and the screen inside
// the pane is the only thing that knows which of its own parts assemble on
// arrival. So the shell says no more than "you are the view now", on the screen
// it was handed, and the screen answers for its own parts: the shell still
// decides nothing about what a pane holds.

import { VIEW_SHOWN, slideViews } from './motion.js'
import { SWIPE_SLOP_PX, swipeAt, swipeOutcome, type SwipeRelease, type ViewIndex } from './swipe.js'

/** The two views of the shell, in the order the bar offers them. */
const VIEWS = ['entries', 'statement'] as const

type View = (typeof VIEWS)[number]

/**
 * How long the one click a release raises is swallowed for. Past it the shell
 * hears clicks again, so a deliberate tap a moment after a swipe opens its sheet
 * exactly as it always did.
 */
const SWALLOW_MS = 300

/** A tab's ink part-way through a swipe: the active ink at 1, the muted ink at 0. */
const inkAt = (on: number): string =>
  `color-mix(in srgb, var(--abbaas-deep) ${(on * 100).toFixed(1)}%, var(--muted))`

/** What each view is called, on its pane and on its tab alike. */
const VIEW_NAMES: Readonly<Record<View, string>> = {
  entries: 'Entries',
  statement: 'Statement',
}

/** What each view hands the shell: its screen, already built. */
export type Panes = {
  /** Home, as renderHome returns it. */
  readonly entries: HTMLElement
  /** The statement, as renderStatement returns it. */
  readonly statement: HTMLElement
}

/**
 * The pane one view lives in: its own containing block, named so an oracle and a
 * reader of the screen can both say which view they are looking at.
 */
const renderPane = (name: View, screen: HTMLElement): HTMLElement => {
  const pane = document.createElement('div')
  pane.className = 'pane'
  pane.dataset.pane = name
  // A pane the owner can be moved into must say what it is.
  pane.setAttribute('role', 'region')
  pane.setAttribute('aria-label', VIEW_NAMES[name])
  pane.append(screen)
  return pane
}

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * The shapes the slot builder can draw, and no others. A drawing may name only a
 * shape from this set, so the table cannot ask for a shape that would come out of
 * the builder as nothing and leave a tab with an empty slot.
 */
type IconShapeName = 'path' | 'rect'

/** One shape of a drawing: what is drawn, and what it is drawn with. */
type IconShape = readonly [IconShapeName, Readonly<Record<string, string>>]

/**
 * A view's drawing: at least one shape. A view cannot be offered with no shape to
 * draw, so a tab cannot end up with a slot that holds nothing.
 */
type IconDrawing = readonly [IconShape, ...IconShape[]]

/** Hands an element the attributes it is drawn with, and gives it back. */
const drawnWith = <T extends Element>(element: T, attributes: Readonly<Record<string, string>>): T => {
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value)
  return element
}

/**
 * The square every tab's drawing is inked on: 24 units wide, stroked in the ink
 * the tab is carrying, so the drawing crosses with the word and the pill.
 *
 * It is hidden from anything that reads the page aloud, because the word alone
 * names a view: a drawing that could be read would give the bar a second owner of
 * what a view is called, and the two could drift apart unseen.
 */
const ICON_CANVAS: Readonly<Record<string, string>> = {
  width: '22',
  height: '22',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2.2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': 'true',
}

/**
 * The board's drawing for each tab, keyed by the same closed set of views as the
 * words, so a view can be offered neither without a word nor without a drawing.
 */
const TAB_ICONS: Readonly<Record<View, IconDrawing>> = {
  entries: [
    ['path', { d: 'M12 3v18' }],
    ['rect', { x: '3', y: '5', width: '7', height: '5', rx: '1.5' }],
    ['rect', { x: '14', y: '13', width: '7', height: '5', rx: '1.5' }],
  ],
  statement: [
    ['rect', { x: '3.5', y: '4', width: '17', height: '16', rx: '2.5' }],
    ['path', { d: 'M3.5 9h17M3.5 14.5h17M10 9v11' }],
  ],
}

/**
 * A tab's drawing, in the slot that stands it above the word. The drawing carries
 * the hiding and holds no title and no description of its own, so everything
 * inside it is hidden with it and the tab reads as its word and nothing else.
 */
const renderTabIcon = (name: View): HTMLElement => {
  const slot = document.createElement('span')
  slot.className = 'views-tab-icon'
  const svg = drawnWith(document.createElementNS(SVG_NS, 'svg'), ICON_CANVAS)
  for (const [shape, attributes] of TAB_ICONS[name]) {
    svg.append(drawnWith(document.createElementNS(SVG_NS, shape), attributes))
  }
  slot.append(svg)
  return slot
}

/**
 * One tab of the bar: the whole of the way into its view. It is the one place
 * that decides what a tab holds - its drawing, then the word that names it - so
 * the bar gains a drawing and loses no reading.
 */
const renderTab = (name: View): HTMLButtonElement => {
  const tab = document.createElement('button')
  tab.type = 'button'
  tab.className = 'views-tab'
  tab.dataset.view = name
  tab.append(renderTabIcon(name), VIEW_NAMES[name])
  return tab
}

/**
 * The mint pill, inside the half of the bar it rests on. Neither the pill nor the
 * holder it travels in says anything a reader needs - the tab it lies under
 * already says it with aria-current - so the whole of it is hidden from anything
 * that reads the page aloud, on the holder that carries it.
 *
 * It travels by one half of the bar at every width, because the holder it sits
 * in is one half of the bar and moves by its own width. The board draws 195 px
 * on a frame 390 px wide, which is that same half.
 */
const renderPill = (): HTMLElement => {
  const holder = document.createElement('div')
  holder.className = 'views-pill-holder'
  holder.setAttribute('aria-hidden', 'true')
  const pill = document.createElement('span')
  pill.className = 'views-pill'
  holder.append(pill)
  return holder
}

/**
 * The shell, holding the panes of the Home route and the bar between them. It
 * carries no data-screen of its own, so the only screens the page names are the
 * ones inside its panes.
 */
export const renderViews = (panes: Panes): HTMLElement => {
  const shell = document.createElement('section')
  shell.className = 'screen views'

  const track = document.createElement('div')
  track.className = 'views-track'
  const paneOf: Readonly<Record<View, HTMLElement>> = {
    entries: renderPane('entries', panes.entries),
    statement: renderPane('statement', panes.statement),
  }
  track.append(paneOf.entries, paneOf.statement)

  const bar = document.createElement('nav')
  bar.className = 'views-nav'
  bar.setAttribute('aria-label', 'Views')
  const tabs: Readonly<Record<View, HTMLButtonElement>> = {
    entries: renderTab('entries'),
    statement: renderTab('statement'),
  }
  const pill = renderPill()
  // The pill first, so it lies behind the words it rests under.
  bar.append(pill, ...VIEWS.map((name) => tabs[name]))

  /** The whole of the state a switch leaves: which view shows, and which tab says so. */
  const show = (shown: View): void => {
    shell.dataset.shown = shown
    for (const name of VIEWS) {
      tabs[name].setAttribute('aria-current', name === shown ? 'page' : 'false')
    }
  }

  /** The strip, the pill, the two fades and the two inks, drawn at `at` (0 Entries, 1 Statement). */
  const drawAt = (at: number): void => {
    const shown = Math.min(1, Math.max(0, at))
    track.style.transform = `translateX(${-50 * at}%)`
    pill.style.transform = `translateX(${100 * at}%)`
    paneOf.entries.style.opacity = String(1 - 0.6 * shown)
    paneOf.statement.style.opacity = String(0.4 + 0.6 * shown)
    tabs.entries.style.color = inkAt(1 - shown)
    tabs.statement.style.color = inkAt(shown)
  }

  /** Hands every part back to the resting state the stylesheet draws. */
  const undraw = (): void => {
    for (const part of [track, pill, paneOf.entries, paneOf.statement, tabs.entries, tabs.statement]) {
      part.style.removeProperty('transform')
      part.style.removeProperty('opacity')
      part.style.removeProperty('color')
    }
  }

  /**
   * The one owner of an arrival, whichever way the owner arrived: the slide is
   * declared on the strip and the pill BEFORE the state changes, because a
   * transition travels only over a state the stylesheet was already timing when
   * it changed; every part a drag drew is handed back to the resting state the
   * stylesheet draws; then the state is written, and the arriving screen is told
   * it is the view now - but only when the view actually changed, so nothing
   * rises twice and a spring back announces nothing.
   *
   * The tap and the release both come through here, so the two ways of arriving
   * cannot drift apart: there is one body to change.
   */
  const arrive = (shown: View): void => {
    const changed = shell.dataset.shown !== shown
    slideViews(track, pill)
    delete shell.dataset.dragging
    undraw()
    show(shown)
    if (changed) panes[shown].dispatchEvent(new CustomEvent(VIEW_SHOWN))
  }

  /** A tap on the view already being read switches nothing, so it draws nothing. */
  const switchTo = (shown: View): void => {
    if (shell.dataset.shown === shown) return
    arrive(shown)
  }
  for (const name of VIEWS) {
    tabs[name].addEventListener('click', () => switchTo(name))
  }

  // --- The swipe: the same arrival, carried by the owner's finger. ---

  /** How wide one view is, which is the half of the track a pane stands on. */
  const viewWidth = (): number => track.offsetWidth / 2

  /** Where the strip stands now, even part-way through a slide. */
  const stripAt = (): number => {
    const width = viewWidth()
    return width === 0 ? 0 : -new DOMMatrix(getComputedStyle(track).transform).m41 / width
  }

  /** The view index the shell says is being read, which is where a drag begins. */
  const shownIndex = (): ViewIndex => (shell.dataset.shown === VIEWS[1] ? 1 : 0)

  /**
   * The one finger the shell answers, while it is down. `live` says the gesture
   * has been decided to be the swipe's; until then the record is only pending and
   * the browser may still take the move for a scroll.
   */
  type Drag = {
    readonly id: number
    /** Where the finger went down, offset once by any strip it was grabbed mid-slide. */
    readonly x: number
    readonly y: number
    readonly from: ViewIndex
    readonly live: boolean
    readonly lastX: number
    readonly lastT: number
    readonly speed: number
  }
  let drag: Drag | null = null

  /** The release the rule is handed: the gesture's own numbers and nothing else. */
  const releaseOf = (held: Drag): SwipeRelease => ({
    from: held.from,
    travel: held.lastX - held.x,
    speed: held.speed,
    width: viewWidth(),
  })

  /**
   * The pending record met by a move: a move down the screen that is at least as
   * far down as across gives the gesture back to the browser's own scroll and
   * closes the record; a move far enough across makes the drag live; anything
   * shorter leaves it pending, so the gesture is decided exactly once.
   *
   * Becoming live, the strip is taken from where it STANDS rather than from where
   * a slide was taking it: the motion attributes come off so the drawing is a
   * direct write, and the finger's own start is offset by the difference.
   */
  const decide = (held: Drag, event: PointerEvent): Drag | null => {
    const across = event.clientX - held.x
    const down = event.clientY - held.y
    if (Math.abs(down) > SWIPE_SLOP_PX && Math.abs(down) >= Math.abs(across)) return null
    if (Math.abs(across) <= SWIPE_SLOP_PX) return held
    track.setPointerCapture(held.id)
    const standing = stripAt()
    delete track.dataset.motion
    delete pill.dataset.motion
    shell.dataset.dragging = ''
    return { ...held, live: true, x: event.clientX + (standing - held.from) * viewWidth() }
  }

  /** The record carried on to the next move, with the speed the finger is going at. */
  const tracking = (held: Drag, event: PointerEvent): Drag => {
    const since = event.timeStamp - held.lastT
    return {
      ...held,
      speed: since > 0 ? (event.clientX - held.lastX) / since : held.speed,
      lastX: event.clientX,
      lastT: event.timeStamp,
    }
  }

  /** The finger lifted off a drag, not a tap: nothing under it is clicked. */
  const swallowOneClick = (): void => {
    const swallow = (click: Event): void => {
      click.stopPropagation()
      click.preventDefault()
    }
    shell.addEventListener('click', swallow, { capture: true, once: true })
    window.setTimeout(() => shell.removeEventListener('click', swallow, { capture: true }), SWALLOW_MS)
  }

  track.addEventListener('pointerdown', (event) => {
    // The gesture is the finger's. A mouse, and any pointer that is not the
    // primary one, is left to the bar and to whatever lies under it.
    if (!event.isPrimary || event.pointerType === 'mouse') return
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      from: shownIndex(),
      live: false,
      lastX: event.clientX,
      lastT: event.timeStamp,
      speed: 0,
    }
  })

  track.addEventListener('pointermove', (event) => {
    const held = drag
    if (held === null || event.pointerId !== held.id) return
    const decided = held.live ? held : decide(held, event)
    if (decided === null || !decided.live) {
      drag = decided
      return
    }
    const moving = tracking(decided, event)
    drag = moving
    // The shell draws the share the rule answers; it bands nothing itself.
    drawAt(swipeAt(releaseOf(moving)))
  })

  /** The lift, or the cancel the browser may send in its place: one arrival, once. */
  const release = (event: PointerEvent): void => {
    const ended = drag
    if (ended === null || event.pointerId !== ended.id) return
    drag = null
    if (!ended.live) return
    arrive(VIEWS[swipeOutcome(releaseOf(ended))])
    swallowOneClick()
  }
  track.addEventListener('pointerup', release)
  track.addEventListener('pointercancel', release)
  // The shell opens on the entries, which is the view the owner arrives at.
  show('entries')

  shell.append(track, bar)
  return shell
}
