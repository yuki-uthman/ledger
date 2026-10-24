// The rule that decides a swipe: where the strip of the two views stands while a
// finger carries it, and which view it settles on when the finger lifts.
//
// It is the one owner of the gesture's own numbers. The shell reads the pointer,
// builds one record of a release and draws the answer; it computes no band, no
// bound and no comparison of its own. This module reads no element, holds nothing
// between calls and imports nothing, so the same release always means the same
// thing and the whole of the decision can be read without a page at all.
//
// The three bounds are the owner's own, tuned on their phone: how far a finger
// moves before the gesture is read as sideways, how fast a lift counts as a
// flick, and how far across a slower lift must have carried the strip to settle
// on the other view. Both comparisons are strict, so a release standing exactly
// on a bound belongs to the slower, staying branch.
//
// WHY a release carries the width. The share of the strip is the travel measured
// in views, so it cannot be worked out without the width of one view. A phone
// that has not laid the views out yet reports no width at all, and a share
// divided by nothing is not a number: such a release is answered with the view
// the drag began on, before anything is divided.

/** The two views of the shell, by the index of the order the bar offers them in. */
export type ViewIndex = 0 | 1

/** One release of the strip, as the shell reports it from the pointer. */
export type SwipeRelease = {
  /** The view the finger started on. */
  readonly from: ViewIndex
  /** How far the finger travelled across, positive towards the right of the screen. */
  readonly travel: number
  /** How fast it was going at this moment, in pixels a millisecond, with its direction. */
  readonly speed: number
  /** How wide one view is. */
  readonly width: number
}

/** How far a finger moves before the gesture is read as sideways rather than a scroll. */
export const SWIPE_SLOP_PX = 8

/** A finger leaving faster than this settles on the view it was moving towards, whatever the distance. */
export const SWIPE_FLICK_PX_PER_MS = 0.4

/** A slower lift settles on the other view once the strip has moved past this share of a view. */
export const SWIPE_COMMIT = 0.3

/** The share of the travel the strip gives once it is past either end, so the edge is felt. */
export const SWIPE_GIVE_PAST_THE_END = 0.25

/** The other of the two views. */
const otherThan = (view: ViewIndex): ViewIndex => (view === 0 ? 1 : 0)

/**
 * Where the strip stands for a release, in views from the first one: 0 on the
 * Entries, 1 on the Statement. Past either end the strip gives only a fraction
 * of what the finger asks for, so the owner feels that there is nothing that way
 * while they are still holding it.
 */
export const swipeAt = (release: SwipeRelease): number => {
  if (!(release.width > 0)) return release.from
  const raw = release.from - release.travel / release.width
  if (raw < 0) return raw * SWIPE_GIVE_PAST_THE_END
  if (raw > 1) return 1 + (raw - 1) * SWIPE_GIVE_PAST_THE_END
  return raw
}

/**
 * Which of the two views a release settles on: a flick settles on the view the
 * finger was moving towards, whatever the distance; a slower lift settles on the
 * other view only once the strip has been carried past the commit bound, and on
 * the view it began on otherwise.
 *
 * The travel is read only through the share the strip stands at, so two releases
 * standing at the same share with the same speed are answered alike however they
 * got there.
 */
export const swipeOutcome = (release: SwipeRelease): ViewIndex => {
  if (!(release.width > 0)) return release.from
  if (Math.abs(release.speed) > SWIPE_FLICK_PX_PER_MS) return release.speed > 0 ? 0 : 1
  const moved = Math.abs(swipeAt(release) - release.from)
  return moved > SWIPE_COMMIT ? otherThan(release.from) : release.from
}
