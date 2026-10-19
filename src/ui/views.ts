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

/** The two views of the shell, in the order the bar offers them. */
const VIEWS = ['entries', 'statement'] as const

type View = (typeof VIEWS)[number]

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

/** One tab of the bar: the whole of the way into its view. */
const renderTab = (name: View): HTMLButtonElement => {
  const tab = document.createElement('button')
  tab.type = 'button'
  tab.className = 'views-tab'
  tab.dataset.view = name
  tab.textContent = VIEW_NAMES[name]
  return tab
}

/**
 * The mint pill, inside the half of the bar it rests on. The pill says nothing a
 * reader needs: the tab it lies under already says it with aria-current, so the
 * pill is hidden from anything that reads the page aloud.
 *
 * It travels by one half of the bar at every width, because the holder it sits
 * in is one half of the bar and moves by its own width. The board draws 195 px
 * on a frame 390 px wide, which is that same half.
 */
const renderPill = (): HTMLElement => {
  const holder = document.createElement('div')
  holder.className = 'views-pill-holder'
  const pill = document.createElement('span')
  pill.className = 'views-pill'
  pill.setAttribute('aria-hidden', 'true')
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
  track.append(renderPane('entries', panes.entries), renderPane('statement', panes.statement))

  const bar = document.createElement('nav')
  bar.className = 'views-nav'
  bar.setAttribute('aria-label', 'Views')
  const tabs: Readonly<Record<View, HTMLButtonElement>> = {
    entries: renderTab('entries'),
    statement: renderTab('statement'),
  }
  // The pill first, so it lies behind the words it rests under.
  bar.append(renderPill(), ...VIEWS.map((name) => tabs[name]))

  /** The whole of a switch: which view shows, and which tab says so. */
  const show = (shown: View): void => {
    shell.dataset.shown = shown
    for (const name of VIEWS) {
      tabs[name].setAttribute('aria-current', name === shown ? 'page' : 'false')
    }
  }
  for (const name of VIEWS) {
    tabs[name].addEventListener('click', () => show(name))
  }
  // The shell opens on the entries, which is the view the owner arrives at.
  show('entries')

  shell.append(track, bar)
  return shell
}
