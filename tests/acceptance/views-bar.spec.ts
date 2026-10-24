import { test, expect, type Locator, type Page } from '@playwright/test'
import {
  ORIGIN,
  buildBundle,
  serveDist,
  startLocalStack,
  type ServedOrigin,
  type Stack,
} from '../support/local-stack.js'
import { createAccount, replaceEntries, seedPeopleByName, type Account, type EntrySeed } from '../support/accounts.js'

// The bottom bar the owner reads: each view offered as a drawing above its word, and
// one tab saying which view is being read.
//
// Judged only through the declared public port: the BUILT bundle as Chrome loads it
// over the served origin, at 360 by 780. Nothing here imports a module of src/; the
// stimulus is a tap, and the reading is the document the owner's phone would read
// aloud. The two words this oracle expects are stated here, so the bar cannot pass by
// agreeing with itself.
//
// What this oracle asserts about the bar, and nothing else:
//   - every tab the bar offers is named by its own word alone - Entries or Statement -
//     and the drawing it holds is kept out of that name;
//   - every tab holds exactly one drawing element, which with everything inside it is
//     hidden from a reading of the page and carries no title or description of its own;
//   - that drawing's box stands above the box of the tab's own word, which is a
//     relation between two boxes and no measure of either;
//   - exactly one tab carries the current-view mark, naming the view the shell says is
//     shown, on arrival and after a tap on either tab, and a tap on the tab already
//     being read changes nothing.
//
// What is left to the owner's phone, and is asserted NOWHERE here: where the pill
// rests around the drawing, the drawing's size and ink, and how far a press dims the
// drawing and the word. Every reading of those is a reading of a design value.
//
// A note on the two boxes. The word's box is taken from the tab's own text, wherever
// that text stands, so a word standing bare and a word wrapped in an element are read
// alike, and a word that wraps onto two lines is read as the one box it occupies. A
// box with no height means the bar was read before the bundle's stylesheet laid it
// out: nothing is then observed about where the drawing stands, and the run says so as
// a setup failure rather than passing on two empty boxes.

const PASSWORD_FIELD = 'input[type="password"]'
const VIEWPORT = { width: 360, height: 780 } as const

/** What each view of the bar is called, in the order the bar offers them. */
const VIEW_WORDS = ['Entries', 'Statement'] as const

/** The view marks of those same two views, in the same order. */
const VIEWS = ['entries', 'statement'] as const

type View = (typeof VIEWS)[number]

/**
 * Sub-pixel layout rounding: two boxes that touch may still be reported a whisker
 * apart. It is a rounding allowance of the reading, not a measure of the bar.
 */
const SUB_PIXEL = 0.5

/** The owner this oracle reads the bar as. */
const ACCOUNT = { email: 'owner-views-bar@abbaas.test', password: 'views-bar-password-4' } as const

/** A person the seeded sends are made to. */
const MARIYAM = 'Mariyam Nisha'

/**
 * The seeded invented ledger: one rufiyaa send of MVR10,000 at the rate 20 stored as
 * $500, and one dollar send of $750. The bar reads no figure, so these rows are here
 * only to put the owner on the screen they really arrive at.
 */
const SEEDED: readonly EntrySeed[] = [
  {
    kind: 'send',
    currency: 'MVR',
    amountMinor: 1000000,
    rate: '20.0000',
    usdCents: 50000,
    entryDate: '2026-09-10',
    savedAt: '2026-09-10T09:00:00Z',
    personName: MARIYAM,
    method: 'cash',
  },
  {
    kind: 'send',
    currency: 'USD',
    amountMinor: 75000,
    rate: null,
    usdCents: 75000,
    entryDate: '2026-09-18',
    savedAt: '2026-09-18T09:00:00Z',
    personName: MARIYAM,
    method: 'transfer',
  },
]

let stack: Stack
let served: ServedOrigin
let owner: Account

test.use({ viewport: VIEWPORT })

test.beforeAll(async () => {
  stack = startLocalStack()
  buildBundle(stack)
  served = await serveDist()

  owner = await createAccount(stack, ACCOUNT)
  const people = await seedPeopleByName(stack, owner, [MARIYAM])
  await replaceEntries(stack, owner, SEEDED, people)
})

test.afterAll(async () => {
  await served?.close()
})

// ===== What the bar offers a reader =====

/** A box of the reading: where it stands and how tall it is, never how wide or far. */
type Box = { readonly y: number; readonly height: number }

/** What one tab of the bar offers a reader. */
type TabReading = {
  /** The view this tab is the way into. */
  readonly view: string | null
  /** The tab's own word, the drawing left out of it. */
  readonly word: string
  /** How many drawings the tab holds, each hidden from a reading of the page. */
  readonly drawings: number
  /** Any name or description found inside those drawings. */
  readonly namesInsideTheDrawing: readonly string[]
  /** The current-view mark the tab carries. */
  readonly currentMark: string | null
  /** The box of the one drawing, when the tab holds exactly one. */
  readonly drawingBox: Box | null
  /** The box of the tab's own word. */
  readonly wordBox: Box | null
}

/** The whole bar in one reading, answering even when there is no bar at all. */
type BarReading = {
  readonly present: boolean
  /** The view the shell says is shown. */
  readonly shown: string | null
  readonly tabs: readonly TabReading[]
}

/** The current-view marks of the bar at one arrival, with the tabs they were drawn from. */
type BarMarks = {
  readonly at: string
  readonly shown: string | null
  readonly marked: readonly string[]
  readonly unmarked: readonly string[]
  readonly tabs: number
}

const theBar = (page: Page): Locator => page.getByRole('navigation', { name: 'Views' })
const theTabsOfTheBar = (page: Page): Locator => theBar(page).getByRole('button')
const theTabOf = (page: Page, view: View): Locator => theBar(page).locator(`[data-view="${view}"]`)
const theEntriesOfHome = (page: Page): Locator => page.locator('[data-pane="entries"] [data-entry]')

/** Reads the whole bar in one pass: what each tab offers, and which view is shown. */
const readTheBar = (page: Page): Promise<BarReading> =>
  page.evaluate(() => {
    const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()
    const HIDDEN = '[aria-hidden="true"]'
    const shown = document.querySelector('[data-shown]')?.getAttribute('data-shown') ?? null
    const bar = document.querySelector('nav[aria-label="Views"]')
    if (bar === null) return { present: false, shown, tabs: [] }

    const boxOf = (rect: DOMRect): { y: number; height: number } => ({ y: rect.y, height: rect.height })

    // Every way into a view the bar offers a reader, in the order it offers them. A
    // hidden part of the bar offers nothing, so it is no tab.
    const tabs = Array.from(bar.querySelectorAll('button, [role="button"]')).filter(
      (tab) => tab.closest(HIDDEN) === null,
    )

    return {
      present: true,
      shown,
      tabs: tabs.map((tab) => {
        // A drawing is a hidden thing the tab holds. What lies inside a hidden thing is
        // part of that same drawing, never a second one.
        const drawings = Array.from(tab.querySelectorAll(HIDDEN)).filter(
          (part) => part.parentElement === null || part.parentElement.closest(HIDDEN) === null,
        )
        const theOneDrawing = drawings.length === 1 ? (drawings[0] ?? null) : null
        const namesInsideTheDrawing = drawings
          .flatMap((drawing) => [drawing, ...Array.from(drawing.querySelectorAll('*'))])
          .flatMap((part) => [
            squash(part.getAttribute('aria-label')),
            squash(part.getAttribute('title')),
            part.tagName.toLowerCase() === 'title' ? squash(part.textContent) : '',
          ])
          .filter((name) => name !== '')

        // The tab's own word, wherever its text stands: every piece of text that is not
        // part of a drawing, read as the one box those pieces occupy together.
        const walker = document.createTreeWalker(tab, NodeFilter.SHOW_TEXT)
        const pieces: Text[] = []
        for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
          const holder = node.parentElement
          if (holder !== null && holder.closest(HIDDEN) !== null) continue
          if (squash(node.textContent) === '') continue
          pieces.push(node as Text)
        }
        const first = pieces[0] ?? null
        const last = pieces[pieces.length - 1] ?? null
        let wordBox: { y: number; height: number } | null = null
        if (first !== null && last !== null) {
          const word = document.createRange()
          word.setStartBefore(first)
          word.setEndAfter(last)
          wordBox = boxOf(word.getBoundingClientRect())
        }

        return {
          view: tab.getAttribute('data-view'),
          word: squash(pieces.map((piece) => piece.textContent ?? '').join(' ')),
          drawings: drawings.length,
          namesInsideTheDrawing,
          currentMark: tab.getAttribute('aria-current'),
          drawingBox: theOneDrawing === null ? null : boxOf(theOneDrawing.getBoundingClientRect()),
          wordBox,
        }
      }),
    }
  })

/** The marks of one arrival, named by the arrival it was read at. */
const marksOf = (at: string, reading: BarReading): BarMarks => ({
  at,
  shown: reading.shown,
  marked: reading.tabs.filter((tab) => tab.currentMark === 'page').map((tab) => tab.view ?? tab.word),
  unmarked: reading.tabs
    .filter((tab) => tab.currentMark !== 'page')
    .map((tab) => `${tab.view ?? tab.word}: ${tab.currentMark ?? 'no mark'}`),
  tabs: reading.tabs.length,
})

/**
 * Where one tab's drawing stands in relation to its word, as a sentence rather than a
 * measure. A box with no height is the bar read before it was laid out: nothing is
 * then observed, which this reports as a setup failure rather than a passing reading.
 */
const whereTheDrawingStands = (tab: TabReading): string => {
  const drawing = tab.drawingBox
  const word = tab.wordBox
  const named = tab.word === '' ? (tab.view ?? 'an unnamed') : tab.word
  if (drawing === null || word === null || drawing.height === 0 || word.height === 0) {
    throw new Error(
      `The bar was read before it was laid out: the ${named} tab's drawing or word has no box, so nothing was observed about where the drawing stands. Show the bar and let the bundle's stylesheet lay it out before reading it.`,
    )
  }
  return drawing.y + drawing.height <= word.y + SUB_PIXEL
    ? `${named}: the drawing stands above the word`
    : `${named}: the drawing does not stand above the word`
}

// ===== The steps this oracle's scenarios are written in =====

const givenTheOwnerIsReadingTheirLedger = async (page: Page): Promise<void> => {
  await page.goto(ORIGIN)
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen never appeared. WHY: the bar is read as the signed-in owner meets it. HOW: serve the built bundle and let it mount its sign-in screen.',
  ).toBeVisible()
  await page.getByLabel('Email').fill(owner.email)
  await page.getByLabel('Password').fill(owner.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen stayed up after Sign in. WHY: the owner cannot read the bar until the app lets them in. HOW: confirm the seeded account and let sign-in replace the screen.',
  ).toHaveCount(0)
  await expect(
    theEntriesOfHome(page),
    'WHAT: the owner never arrived on their own entries. WHY: the bar is read on the screen the owner really arrives at, with their ledger painted. HOW: read the seeded ledger and paint its entries before the bar is read.',
  ).toHaveCount(SEEDED.length)
  await expect(
    theBar(page),
    'WHAT: there is no bottom bar named Views to read. WHY: the bar is how the owner moves between their entries and the Statement, and nothing of it can be read while it is absent. HOW: draw a navigation bar with that accessible name at the foot of the screen.',
  ).toBeVisible()
}

/** What of a switch is still moving, so no reading is taken mid-slide. */
const partsStillSwitching = (page: Page): Promise<readonly string[]> =>
  page.evaluate(() => {
    const switching = ['view-slide', 'list-slide', 'list-enter']
    return Array.from(document.querySelectorAll('[data-motion]'))
      .map((part) => part.getAttribute('data-motion') ?? '')
      .filter((mark) => switching.includes(mark))
  })

const theSwitchComesToRest = async (page: Page): Promise<void> => {
  await expect
    .poll(() => partsStillSwitching(page), {
      message:
        'WHAT: the switch was still moving seconds after the tap. WHY: every reading this oracle takes after a tap is taken where the switch came to rest, so a reading taken mid-slide would judge a bar the owner never sees. HOW: finish the slide and drop each part\'s mark as it stops.',
      timeout: 5_000,
    })
    .toEqual([])
}

const tapTheTab = async (page: Page, view: View): Promise<void> => {
  await expect(
    theTabOf(page, view),
    `WHAT: the bar offers no tab for the ${view} view to tap. WHY: a tap on its tab is the only way the owner reaches a view. HOW: draw one tab on the bar for every view the bar offers.`,
  ).toBeVisible()
  await theTabOf(page, view).click()
  await theSwitchComesToRest(page)
}

const whenTheOwnerReadsTheBar = (page: Page): Promise<BarReading> => readTheBar(page)

/** The owner taps the Statement tab and then the Entries tab, reading the bar at each arrival. */
const whenTheOwnerTapsEachTabInTurn = async (page: Page): Promise<readonly BarMarks[]> => {
  const onArrival = marksOf('on arrival', await readTheBar(page))
  await tapTheTab(page, 'statement')
  const afterStatement = marksOf('after the tap on Statement', await readTheBar(page))
  await tapTheTab(page, 'entries')
  const afterEntries = marksOf('after the tap on Entries', await readTheBar(page))
  return [onArrival, afterStatement, afterEntries]
}

const thenEachTabIsNamedByItsWordAloneAboveOneHiddenDrawing = async (
  page: Page,
  reading: BarReading,
): Promise<void> => {
  expect(
    reading.present,
    'WHAT: the bar was not there to read. WHY: everything this scenario observes is a reading of the bar. HOW: draw the bar named Views on the screen the owner arrives at.',
  ).toBe(true)
  expect(
    reading.tabs.map((tab) => tab.word),
    'WHAT: the bar does not offer the two views as their own words in order. WHY: the word is the single owner of what a view is called, and the bar may offer no view it cannot name. HOW: draw one tab for each view, reading Entries then Statement, and let the word be the whole of what the tab reads.',
  ).toEqual([...VIEW_WORDS])
  const tabs = theTabsOfTheBar(page)
  await expect(
    tabs,
    'WHAT: the bar does not offer exactly one tab a reader can take for each view. WHY: a count of tabs means nothing unless it is the count of the views the bar offers. HOW: offer the two views as two tabs and hide the rest of the bar from the reading.',
  ).toHaveCount(VIEW_WORDS.length)
  for (const [index, word] of VIEW_WORDS.entries()) {
    await expect(
      tabs.nth(index),
      `WHAT: the tab for ${word} is not named exactly ${word}. WHY: the word alone names a view, so a drawing or a label of its own would give the bar a second owner of what a view is called, and the two could drift apart unseen. HOW: keep the word as the whole of the tab's name and hide the drawing from the reading.`,
    ).toHaveAccessibleName(word)
  }
  expect(
    reading.tabs.map((tab) => `${tab.word}: ${tab.drawings}`),
    'WHAT: a tab of the bar does not hold exactly one drawing hidden from the reading. WHY: the owner reads each view as a drawing above its word, and a second drawing or a badge in a tab would make the bar say two things at once. HOW: put one drawing in each tab, hidden from the reading with everything inside it.',
  ).toEqual(VIEW_WORDS.map((word) => `${word}: 1`))
  expect(
    reading.tabs.flatMap((tab) => tab.namesInsideTheDrawing),
    'WHAT: a drawing in the bar carries a name or a description of its own. WHY: a page read aloud would then name the view twice, or name the shapes of the drawing instead of the view. HOW: leave the drawing without a title, a description or a label, so only the word names the view.',
  ).toEqual([])
  expect(
    reading.tabs.map(whereTheDrawingStands),
    'WHAT: a tab\'s drawing does not stand above the tab\'s word. WHY: the owner reads each view as a drawing with its word under it, so a drawing beside or below the word is a different bar. HOW: lay the drawing out above the word inside the tab.',
  ).toEqual(VIEW_WORDS.map((word) => `${word}: the drawing stands above the word`))
}

const thenOneTabSaysWhichViewIsBeingRead = (walk: readonly BarMarks[]): void => {
  expect(
    walk.map((arrival) => `${arrival.at}: shown ${arrival.shown ?? 'nothing'}, marked ${arrival.marked.join(' and ')}`),
    'WHAT: the tab marked as the current view does not name the view the shell says is shown. WHY: the mark is the only thing that tells the owner which view they are in, so a mark naming another view misleads them. HOW: write which view is shown and both current-view marks together, in the one switch.',
  ).toEqual([
    'on arrival: shown entries, marked entries',
    'after the tap on Statement: shown statement, marked statement',
    'after the tap on Entries: shown entries, marked entries',
  ])
  expect(
    walk.map((arrival) => `${arrival.at}: ${arrival.marked.length} of ${arrival.tabs} tabs marked`),
    'WHAT: the number of tabs marked as the current view is not one out of the tabs the bar offers. WHY: none marked leaves the owner nowhere, and two marked name two views at once; a second writer of that mark is what this refuses. HOW: let the one switch mark the shown tab and unmark every other tab in the same step.',
  ).toEqual(walk.map((arrival) => `${arrival.at}: 1 of ${VIEW_WORDS.length} tabs marked`))
  expect(
    walk.flatMap((arrival) => arrival.unmarked.map((tab) => `${arrival.at}: ${tab}`)),
    'WHAT: a tab that is not the current view does not say so. WHY: the tabs that are not current, together with the one that is, are the whole bar, so a silent tab leaves the reading of the bar incomplete. HOW: carry the current-view mark as false on every tab that is not showing.',
  ).toEqual([
    'on arrival: statement: false',
    'after the tap on Statement: entries: false',
    'after the tap on Entries: statement: false',
  ])
}

// ===== The scenarios =====

// The bar's reading, which this value fixes: one drawing a tab, hidden from the
// reading, standing above the word that alone names the view.
// Laws: V4at-tab-name; V4-d-algebra-adapter; V4-d-algebra-domain.
// Stressors: V4-d-stress-hidden, V4-d-stress-second-drawing, V4-d-stress-unlaid.
test('every tab of the bottom bar is named by its own word and holds one hidden drawing above it', async ({
  page,
}) => {
  // Given the owner arrives on their own entries, with the bar at the foot of the screen
  await givenTheOwnerIsReadingTheirLedger(page)

  // When the owner reads the bar they arrived on
  const reading = await whenTheOwnerReadsTheBar(page)

  // Then each tab reads its own word, with one hidden drawing standing above it
  await thenEachTabIsNamedByItsWordAloneAboveOneHiddenDrawing(page, reading)
})

// The bar's one state a reader is told by, across every arrival of the walk.
// Laws: V4at-one-current; V4-d-algebra-application.
// Stressor: V4-b-f-second-writer-cond.
test('exactly one tab says which view is being read, on arrival and after a tap on either tab', async ({ page }) => {
  // Given the owner arrives on their own entries, with the bar at the foot of the screen
  await givenTheOwnerIsReadingTheirLedger(page)

  // When the owner taps the Statement tab and then the Entries tab
  const walk = await whenTheOwnerTapsEachTabInTurn(page)

  // Then at every arrival one tab names the view being read and the other says it is not
  thenOneTabSaysWhichViewIsBeingRead(walk)
})

// A tap that asks for the view already being read.
// Law: V4-d-algebra-application (a tap on the tab already current changes nothing).
test('a tap on the tab already being read changes nothing', async ({ page }) => {
  // Given the owner arrived on their entries and tapped through to the Statement
  await givenTheOwnerIsReadingTheirLedger(page)
  await tapTheTab(page, 'statement')
  const before = marksOf('before the second tap', await readTheBar(page))

  // When the owner taps the Statement tab again
  await tapTheTab(page, 'statement')

  // Then the bar says exactly what it said before that tap
  const after = marksOf('before the second tap', await readTheBar(page))
  expect(
    after,
    'WHAT: a tap on the tab already being read changed what the bar says. WHY: the owner asked for the view they are already reading, so nothing of the bar may move, be written twice or be unmarked. HOW: let the switch return at once when the view asked for is the view already shown.',
  ).toEqual(before)
})
