// The shell: the one screen the app mounts for the Home route, and the owner of
// each view's own pane.
//
// It is a function from the pane contents to DOM, as every screen in this app is,
// and it decides nothing about what a pane holds: Home is handed to it already
// built, and it neither reads it nor writes to it.
//
// WHY the shell exists before anything of the Statement does. Home fixes two
// things to the foot of the screen - its bottom buttons and the fade over the
// list - and a fixed element is placed against the nearest ancestor that carries
// a transform, or the viewport when none does. The Statement puts the two views
// side by side on a track that is moved sideways to switch between them, so
// Home's furniture would otherwise be placed against that moving track and the
// fade would cover the Statement's rows.
//
// The cure is this pane: it carries a transform of its OWN, so it is the
// containing block of the fixed furniture of the screen inside it, it is exactly
// the dynamic viewport height, and it is the only thing of its screen that
// scrolls. Measured in this repository's own Chromium (2026-10-19): a pane that
// is both the containing block and the scrolling element carries the bottom bar
// away with the list (the bar's top ran from 700 px to -1320 px), so the pane
// holds its height and the screen inside it is what scrolls.
//
// The pane's hooks, which every later value keeps:
//   - the pane carries data-pane="entries" and the accessible name Entries
//
// The navigation bar, the second pane and the track that switches between them
// are not here: this file is introduced by the preserving move alone, which adds
// no view and changes nothing the owner can see. With one pane the shell is
// exactly the viewport and the pane fills it, so every box Home draws is where
// it was.

/** What each view hands the shell: its screen, already built. */
export type Panes = {
  /** Home, as renderHome returns it. */
  readonly entries: HTMLElement
}

/**
 * The pane one view lives in: its own containing block, named so an oracle and a
 * reader of the screen can both say which view they are looking at.
 */
const renderPane = (name: 'entries', label: string, screen: HTMLElement): HTMLElement => {
  const pane = document.createElement('div')
  pane.className = 'pane'
  pane.dataset.pane = name
  // A pane the owner can be moved into must say what it is.
  pane.setAttribute('role', 'region')
  pane.setAttribute('aria-label', label)
  pane.append(screen)
  return pane
}

/**
 * The shell, holding the panes of the Home route. It carries no data-screen of
 * its own, so the only screens the document names are the ones inside it.
 */
export const renderViews = (panes: Panes): HTMLElement => {
  const shell = document.createElement('section')
  shell.className = 'screen views'
  shell.append(renderPane('entries', 'Entries', panes.entries))
  return shell
}
