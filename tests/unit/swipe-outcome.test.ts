import { beforeAll, describe, expect, test } from 'vitest'

// The rule that decides a swipe: given one release of the strip - which screen
// the finger started on, how far it travelled across, how fast it was going when
// it lifted and how wide one screen is - where does the strip stand, and which
// screen does it settle on?
//
// Judged through the rule's own public port: its exported functions, called from
// the unit runner's default environment, where there is no document at all. That
// absence is the point: the rule decides over numbers, touches no element and
// keeps nothing between calls, so a reading of the page inside it fails here.
//
// Where the expected answers come from. They are worked out in this file from
// the owner's own bounds - how fast counts as a flick, how far counts as across,
// and the give the strip has past either end - never from what the rule answers.
// The bounds live here because they ARE the behaviour the owner tuned: the whole
// gesture reads differently when one of them moves. How the swipe then LOOKS on
// the page is read in the touch spec instead, which states each gesture clearly
// on one side of these bounds and asserts no number of its own.
//
// The releases are generated from one fixed seed, printed with any failure, so a
// failing release is replayed exactly. The four releases that stand on a bound
// are built into the stream rather than hoped for, and a reading of its own says
// every branch of the rule was actually reached.

/** The two screens, by the index of the order the bar offers them in. */
type ViewIndex = 0 | 1

/** One release of the strip, as the shell reports it. */
type SwipeRelease = {
  /** The screen the finger started on. */
  readonly from: ViewIndex
  /** How far the finger travelled across, positive towards the right of the screen. */
  readonly travel: number
  /** How fast it was going when it lifted, in pixels a millisecond, with its direction. */
  readonly speed: number
  /** How wide one screen is. */
  readonly width: number
}

type Rule = {
  readonly swipeAt: (release: SwipeRelease) => number
  readonly swipeOutcome: (release: SwipeRelease) => number
}

// ===== The owner's own bounds, and the answers they give =====

/** Faster than this, in pixels a millisecond, and the lift is a flick. */
const A_FLICK = 0.4
/** Further than this share of one screen, and a slow lift settles on the other one. */
const ACROSS = 0.3
/** The share of the travel the strip gives once it is past either end. */
const THE_GIVE_PAST_THE_END = 0.25

const otherThan = (view: ViewIndex): ViewIndex => (view === 0 ? 1 : 0)

/** Where the strip stands for a release, worked out here from the bounds alone. */
const expectedShare = (release: SwipeRelease): number => {
  if (!(release.width > 0)) return release.from
  const raw = release.from - release.travel / release.width
  if (raw < 0) return raw * THE_GIVE_PAST_THE_END
  if (raw > 1) return 1 + (raw - 1) * THE_GIVE_PAST_THE_END
  return raw
}

/** Which screen a release settles on, worked out here from the bounds alone. */
const expectedView = (release: SwipeRelease): ViewIndex => {
  if (!(release.width > 0)) return release.from
  if (Math.abs(release.speed) > A_FLICK) return release.speed > 0 ? 0 : 1
  const moved = Math.abs(expectedShare(release) - release.from)
  return moved > ACROSS ? otherThan(release.from) : release.from
}

// ===== The releases this rule is asked about =====

const SEED = 20261023
const HOW_MANY = 200

/** This file's own generator: one fixed seed, so every release is replayable. */
const releasesFrom = (seed: number): SwipeRelease[] => {
  let state = seed
  const next = (): number => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
  return Array.from({ length: HOW_MANY - ON_A_BOUND.length }, () => {
    const width = 240 + Math.floor(next() * 241)
    return {
      from: (next() < 0.5 ? 0 : 1) as ViewIndex,
      travel: Math.round((next() * 4 - 2) * width),
      speed: next() * 4 - 2,
      width,
    }
  })
}

/**
 * The releases that stand exactly on a bound, or outside the strip altogether.
 * Both comparisons are strict, so a release standing exactly on a bound belongs
 * to the slower, staying branch; these are built into the stream because no
 * amount of generation reliably lands on a boundary.
 */
const ON_A_BOUND: readonly SwipeRelease[] = [
  // Exactly at the flick bound: not a flick, so decided by how far it went.
  { from: 0, travel: -10, speed: A_FLICK, width: 360 },
  // Exactly at the across bound: short of it, so it stays.
  { from: 0, travel: -0.3 * 360, speed: 0.1, width: 360 },
  // Well past the end of the strip, where the give applies.
  { from: 0, travel: 600, speed: 0.1, width: 300 },
  // A screen that has not been laid out at all.
  { from: 0, travel: 120, speed: 0.1, width: 0 },
]

const RELEASES: readonly SwipeRelease[] = [...ON_A_BOUND, ...releasesFrom(SEED)]

const said = (release: SwipeRelease): string =>
  `from screen ${release.from}, travel ${release.travel}, speed ${release.speed.toFixed(3)}, screen width ${release.width} (seed ${SEED})`

// ===== The rule itself, asked for through its public port =====

let loaded: { readonly rule: Rule | null; readonly why: string }

/**
 * The rule's public export, loaded by its path rather than named in an import,
 * so a rule that is not there yet is a failed reading of this port and not a
 * file this test could not be built from.
 */
const loadTheRule = async (): Promise<{ rule: Rule | null; why: string }> => {
  const where = new URL('../../src/ui/swipe.js', import.meta.url).href
  try {
    const answered = (await import(/* @vite-ignore */ where)) as Record<string, unknown>
    const swipeAt = answered['swipeAt']
    const swipeOutcome = answered['swipeOutcome']
    if (typeof swipeAt !== 'function' || typeof swipeOutcome !== 'function') {
      return {
        rule: null,
        why: `it offers ${Object.keys(answered).join(', ') || 'nothing'}, and a swipe needs both the place of the strip and the screen it settles on`,
      }
    }
    return { rule: { swipeAt, swipeOutcome } as Rule, why: '' }
  } catch (reason) {
    return { rule: null, why: reason instanceof Error ? reason.message : String(reason) }
  }
}

beforeAll(async () => {
  loaded = await loadTheRule()
})

const theRule = (): Rule => {
  expect(
    loaded.rule,
    `WHAT: nothing answers a release of the strip: ${loaded.why}. WHY: the owner's swipe has to decide, from the numbers of their own gesture alone, where the strip stands and which screen they end on; while no rule owns that decision it can only be made inside the handler that also draws it, where none of its edges can be read. HOW: offer the place of the strip for a release and the screen that release settles on, over a record of the starting screen, the travel, the speed and the screen's width.`,
  ).not.toBeNull()
  return loaded.rule as Rule
}

describe('the rule that decides where a swipe lands', () => {
  /**
   * Law L-swipe-total, over the generated releases: every release is answered
   * with one of exactly two screens and a place on the strip that is a real
   * number. Nothing raises, nothing answers a third thing.
   */
  test('every release of the strip is answered with one of the two screens, and a real place', () => {
    // Arrange: every generated release, and the two screens there are
    const rule = theRule()
    const theTwoScreens = [0, 1]

    // Act: each of them is answered
    const answers = RELEASES.map((release) => ({
      release,
      view: rule.swipeOutcome(release),
      share: rule.swipeAt(release),
    }))

    // Assert: each answer is one of the two screens, at a real place
    const strangers = answers.filter((answer) => !theTwoScreens.includes(answer.view))
    expect(
      strangers.map((answer) => `${answer.view} for ${said(answer.release)}`),
      `WHAT: ${strangers.length} of the ${answers.length} releases were answered with something that is not one of the two screens. WHY: a strip left anywhere but on one of the two screens shows half of each, with no tab marked and no way back but another gesture. HOW: answer with the screen the release settles on and nothing else.`,
    ).toEqual([])
    const unreal = answers.filter((answer) => !Number.isFinite(answer.share))
    expect(
      unreal.map((answer) => `${answer.share} for ${said(answer.release)}`),
      `WHAT: ${unreal.length} of the ${answers.length} releases stood at a place that is not a real number. WHY: a place that is not a number is drawn as no movement at all and then compared against the bounds, so the screen the owner ends on is decided by chance. HOW: answer the starting place for a screen width that is not greater than zero, before anything is divided by it.`,
    ).toEqual([])
  })

  /**
   * Law L-swipe-flick, over the generated releases: a lift faster than the flick
   * bound settles on the screen the finger was moving towards, whatever the
   * distance and the width were. The expected screen is taken from the direction
   * of the generated speed alone, before the rule is asked.
   */
  test('a fast lift settles on the screen the finger was moving towards', () => {
    // Arrange: the generated releases that lift faster than a flick
    const rule = theRule()
    const flicks = RELEASES.filter(
      (release) => Math.abs(release.speed) > A_FLICK && release.width > 0,
    )
    expect(
      flicks.length,
      `WHAT: none of the ${RELEASES.length} releases lifted faster than a flick, so this reading says nothing (seed ${SEED}). WHY: a law is only evidence over releases that meet it. HOW: generate speeds on both sides of the flick bound.`,
    ).toBeGreaterThan(0)

    // Act: each of them is answered
    const answers = flicks.map((release) => ({
      release,
      view: rule.swipeOutcome(release),
      towards: release.speed > 0 ? 0 : 1,
    }))

    // Assert: each settled on the screen the finger was heading for
    const against = answers.filter((answer) => answer.view !== answer.towards)
    expect(
      against.map((answer) => `${said(answer.release)} settled on ${answer.view}`),
      `WHAT: ${against.length} of ${answers.length} fast lifts settled on the screen the finger was moving AWAY from. WHY: a flick is the owner throwing the screens in a direction; answering it by distance instead means a quick short flick does nothing and a slow long drag the owner changed their mind about goes through. HOW: when the lift is faster than the flick bound, take the direction of the lift and ignore the distance.`,
    ).toEqual([])
  })

  /**
   * Law L-swipe-commit, over the generated releases: a lift no faster than the
   * flick bound settles on the other screen exactly when the strip has been
   * carried further than the across bound from the screen it started on. The
   * expected screen is worked out here from the travel and the width.
   */
  test('a slow lift settles on the other screen exactly when it was carried far enough', () => {
    // Arrange: the generated releases that lift no faster than a flick
    const rule = theRule()
    const slow = RELEASES.filter(
      (release) => Math.abs(release.speed) <= A_FLICK && release.width > 0,
    )
    const past = slow.filter(
      (release) => Math.abs(expectedShare(release) - release.from) > ACROSS,
    )
    expect(
      [slow.length, past.length, slow.length - past.length].every((count) => count > 0),
      `WHAT: the slow releases do not cover both sides of the across bound: ${slow.length} slow, of which ${past.length} carried far enough (seed ${SEED}). WHY: a bound is only checked when releases fall on both sides of it. HOW: generate travels well inside and well beyond the across bound.`,
    ).toBe(true)

    // Act: each of them is answered
    const answers = slow.map((release) => ({
      release,
      view: rule.swipeOutcome(release),
      expected: expectedView(release),
    }))

    // Assert: each settled where the distance it was carried says
    const wrong = answers.filter((answer) => answer.view !== answer.expected)
    expect(
      wrong.map(
        (answer) =>
          `${said(answer.release)} stood at ${expectedShare(answer.release).toFixed(3)} and settled on ${answer.view} rather than ${answer.expected}`,
      ),
      `WHAT: ${wrong.length} of ${answers.length} slow lifts settled on the wrong screen for how far they had been carried. WHY: a slow drag is the owner looking: let go short and they expect to stay, let go well across and they expect to arrive. A release standing exactly on the bound is short of it, so it stays. HOW: compare the place the strip stands against the across bound from the starting screen, strictly.`,
    ).toEqual([])
  })

  /**
   * Law L-swipe-through-at, over the generated releases: the decision reads the
   * travel only through the place the strip stands, so two releases with the
   * same starting screen, the same speed and the same place are answered alike.
   * The second release is built by scaling the travel and the width together, so
   * the place is the same by construction.
   */
  test('two releases that stand at the same place are answered alike', () => {
    // Arrange: each generated release and a wider screen carried proportionally further
    const rule = theRule()
    const pairs = RELEASES.filter((release) => release.width > 0).map((release) => ({
      one: release,
      other: { ...release, travel: release.travel * 2, width: release.width * 2 },
    }))

    // Act: both of each pair are answered
    const answers = pairs.map((pair) => ({
      ...pair,
      viewOne: rule.swipeOutcome(pair.one),
      viewOther: rule.swipeOutcome(pair.other),
      shareOne: rule.swipeAt(pair.one),
      shareOther: rule.swipeAt(pair.other),
    }))

    // Assert: each pair stands at the same place and settles on the same screen
    const apart = answers.filter(
      (answer) =>
        answer.viewOne !== answer.viewOther ||
        Math.abs(answer.shareOne - answer.shareOther) > 1e-9,
    )
    expect(
      apart.map(
        (answer) =>
          `${said(answer.one)} stood at ${answer.shareOne} on ${answer.viewOne}, while the same place on a wider screen stood at ${answer.shareOther} on ${answer.viewOther}`,
      ),
      `WHAT: ${apart.length} of ${answers.length} pairs standing at the same place were answered differently. WHY: the owner reads the strip, not their own pixels: the same gesture on a wider phone carries the screens the same share of the way, so it must land the same way. HOW: decide from the place the strip stands, and let the travel reach the decision only through it.`,
    ).toEqual([])
  })

  /**
   * Law L-swipe-degenerate, over its two cases: a screen width that is not
   * greater than zero is answered with the screen the drag began on, and the
   * place is the starting one, so nothing that is not a number ever reaches the
   * comparison.
   */
  test('a screen that has not been laid out leaves the swipe where it began', () => {
    // Arrange: a release over a width of zero, and one over a negative width
    const rule = theRule()
    const degenerate: readonly SwipeRelease[] = [
      { from: 0, travel: 120, speed: 0.1, width: 0 },
      { from: 1, travel: -90, speed: -0.9, width: -360 },
    ]

    // Act: both are answered
    const answers = degenerate.map((release) => ({
      release,
      view: rule.swipeOutcome(release),
      share: rule.swipeAt(release),
    }))

    // Assert: each stayed on its starting screen, at its starting place
    const moved = answers.filter((answer) => answer.view !== answer.release.from)
    expect(
      moved.map((answer) => `${said(answer.release)} settled on ${answer.view}`),
      `WHAT: ${moved.length} release over a screen with no width of its own changed the screen being read. WHY: a phone that has not laid the screens out yet cannot say how far across the finger went, so honouring the gesture lands the owner somewhere decided by nothing. HOW: answer the starting screen whenever the width is not greater than zero.`,
    ).toEqual([])
    const adrift = answers.filter(
      (answer) => !Number.isFinite(answer.share) || answer.share !== answer.release.from,
    )
    expect(
      adrift.map((answer) => `${said(answer.release)} stood at ${answer.share}`),
      `WHAT: ${adrift.length} release over a screen with no width of its own stood somewhere other than its starting place. WHY: a place worked out by dividing by nothing is not a number, and the owner's strip is then drawn by chance. HOW: answer the starting place before anything is divided by the width.`,
    ).toEqual([])
  })

  /**
   * The generated stream itself, read for what it reached: every branch of the
   * rule and every release the design names as a case it must include. A full
   * domain on paper is not evidence that any value of it was answered.
   */
  test('the releases asked about reach every branch of the rule', () => {
    // Arrange: the whole stream, and the branches a release can fall in
    const branches = {
      'a flick': (release: SwipeRelease) => Math.abs(release.speed) > A_FLICK && release.width > 0,
      'a slow lift carried far enough': (release: SwipeRelease) =>
        Math.abs(release.speed) <= A_FLICK &&
        release.width > 0 &&
        Math.abs(expectedShare(release) - release.from) > ACROSS,
      'a slow lift short of the bound': (release: SwipeRelease) =>
        Math.abs(release.speed) <= A_FLICK &&
        release.width > 0 &&
        Math.abs(expectedShare(release) - release.from) <= ACROSS,
      'a release past the end of the strip': (release: SwipeRelease) =>
        release.width > 0 && (release.from - release.travel / release.width < 0 ||
          release.from - release.travel / release.width > 1),
      'a screen with no width': (release: SwipeRelease) => !(release.width > 0),
      'a start on each of the two screens': (release: SwipeRelease) => release.from === 1,
    }

    // Act: the stream is counted into those branches
    const counted = Object.entries(branches).map(([branch, holds]) => ({
      branch,
      how_many: RELEASES.filter(holds).length,
    }))

    // Assert: every branch was actually reached, out of the whole stream
    const missed = counted.filter((count) => count.how_many === 0).map((count) => count.branch)
    expect(
      missed,
      `WHAT: ${missed.length} branches of the rule were never reached by the ${RELEASES.length} releases asked about: ${missed.join(', ')} (seed ${SEED}). WHY: a reading over a wide domain proves only what it actually asked; a branch no release reaches is unchecked however many releases there were. HOW: build the releases that stand on each bound into the stream rather than hoping the generator lands on them.`,
    ).toEqual([])
  })

  /**
   * The architectural obligation V5-AT-dom-free-rule: the rule decides over
   * numbers alone. There is no document here at all, so a reading of the page
   * inside it cannot answer; and the same release asked twice is answered the
   * same way, so nothing is kept between calls.
   */
  test('the rule decides with no screen to read and nothing kept between calls', () => {
    // Arrange: an environment with no document, and every generated release
    expect(
      typeof document,
      'WHAT: this reading ran where a document exists, so a rule that read the page would pass it. WHY: the rule is the one owner of the decision and must not depend on anything being drawn; the absence of a document is what proves it. HOW: run the unit reading in the runner\'s plain environment.',
    ).toBe('undefined')
    const rule = theRule()

    // Act: each release is answered twice over
    const answers = RELEASES.map((release) => ({
      release,
      first: { view: rule.swipeOutcome(release), share: rule.swipeAt(release) },
      again: { view: rule.swipeOutcome(release), share: rule.swipeAt(release) },
    }))

    // Assert: both answers agree, for every release
    const drifted = answers.filter(
      (answer) =>
        answer.first.view !== answer.again.view ||
        !(Math.abs(answer.first.share - answer.again.share) < 1e-12),
    )
    expect(
      drifted.map(
        (answer) =>
          `${said(answer.release)} was answered ${answer.first.view} at ${answer.first.share} and then ${answer.again.view} at ${answer.again.share}`,
      ),
      `WHAT: ${drifted.length} of ${answers.length} releases were answered differently the second time they were asked. WHY: the owner's gesture must mean the same thing whenever it is made; a rule that remembers the last swipe makes the next one depend on it. HOW: decide from the release alone and keep nothing between calls.`,
    ).toEqual([])
  })
})
