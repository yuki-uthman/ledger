import { test, expect, type Page } from '@playwright/test'
import {
  ORIGIN,
  buildBundle,
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

// What the owner reads here: the balance card at the top of the Statement, and nothing
// at all between any of its three words and that word's own figure. The Paid Back row
// reads no minus, and no other row reads a mark either: the three figures are three
// sums, each under its own word, and the words carry the direction the mark used to
// claim. A minus there told the owner that money which came back had been taken off
// twice (laws L-v3-no-sign, L-v3-signs-total and L-v3-figures-kept).
//
// Judged only through the declared public port: the BUILT bundle as Chrome loads it over
// the served loopback origin, at 360 by 780, with the local stack behind it. Nothing here
// imports a module of src/. The stimulus is stored rows, the reading is the document, and
// every expected word and figure is derived in this file from what the ledger actually
// stores, so the oracle cannot echo back whatever the screen happens to draw.
//
// Every figure, date and name below is invented. This repository is public, and no figure
// of the owner's own ledger is written anywhere in it.
//
// Three notes on the readings.
//   - The card is found from the three figures it holds, never from a hook the design does
//     not declare: the card is the nearest thing around all three of them.
//   - What stands before a figure is read as the WHOLE span between the row's word and that
//     row's own figure, not as one named cell. How many cells that span holds, and whether a
//     cell is there at all, are the screen's business; a mark drawn anywhere in that span by
//     any writer is read by the same reading.
//   - Each row is also read whole, so a mark added inside the word, inside the figure or
//     after it is read too. A mark drawn by a style rather than written as text carries no
//     reading at all and belongs to the owner's own check on the phone.
//
// Nothing here reads a colour, a size, a weight, a case, a gap, a padding, a radius, a grid
// track or a duration: two cards that differ only in one of those are the same card here.

const PASSWORD_FIELD = 'input[type="password"]'
const VIEWPORT = { width: 360, height: 780 } as const

// ===== The domain vocabulary this oracle speaks =====

/** One row of the balance card, as the owner reads it across the row. */
type CardRowReading = {
  /** Which of the three figures this row holds, as the row carries it. */
  readonly name: string
  /** The word the row opens with. */
  readonly word: string
  /** The figure this row reads. */
  readonly figure: string
  /** Whatever stands between that word and this row's own figure, read as one whole span. */
  readonly between: string
  /** The whole row, read as a screen reader would read it out: nothing of it is left out. */
  readonly whole: string
}

/** The balance card, as the owner reads it. */
type CardReading = {
  readonly present: boolean
  readonly rows: readonly CardRowReading[]
  /** Whether a drawn line stands above the Balance row, which the card's own sum needs. */
  readonly dividerAboveBalance: boolean
}

/** The three figures of the card, in cents, and the words they stand under. */
type CardFigures = {
  readonly sent: number
  readonly paid: number
  readonly balance: number
}

// ===== The independent oracle: what the stored rows mean, worded here =====

const dollars = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** A figure of the card, as the card words it: marked dollars with their cents, unsigned. */
const usdFigure = (cents: number): string => `$${dollars.format(Math.abs(cents) / 100)}`

/**
 * The three figures the stored rows add up to: the sum of the sends, the sum of the
 * repayments, and the unsigned difference between them. Taken from the stored rows and
 * never from the screen, so a card that draws its own arithmetic cannot pass.
 */
const expectedFigures = (rows: readonly StoredLedgerRow[]): CardFigures => {
  const sent = rows.filter((row) => row.kind === 'send').reduce((sum, row) => sum + row.usd_cents, 0)
  const paid = rows.filter((row) => row.kind === 'receive').reduce((sum, row) => sum + row.usd_cents, 0)
  return { sent, paid, balance: Math.abs(sent - paid) }
}

/** The three words the card reads, top to bottom. */
const WORDS = ['Total Sent', 'Paid Back', 'Balance'] as const

/** The three figures the card holds, in the order it reads them. */
const NAMES = ['sent', 'paid', 'balance'] as const

/** What each of the three rows reads as its figure, from the stored rows alone. */
const expectedFigureTexts = (figures: CardFigures): readonly string[] => [
  usdFigure(figures.sent),
  usdFigure(figures.paid),
  usdFigure(figures.balance),
]

/** What each row reads WHOLE: its word, then its own figure, and nothing else at all. */
const expectedWholeRows = (figures: CardFigures): readonly string[] =>
  expectedFigureTexts(figures).map((figure, index) => `${WORDS[index] ?? ''} ${figure}`)

/** Three empty readings: one for the span of each row, because no row reads a mark. */
const NOTHING_BETWEEN = ['', '', ''] as const

// ===== The stimulus: the stored ledgers the owner signs in to =====

const ACCOUNT_REPAID = { email: 'owner-card-signs-a@abbaas.test', password: 'card-signs-password-a1' } as const
const ACCOUNT_SENDS_ONLY = { email: 'owner-card-signs-b@abbaas.test', password: 'card-signs-password-b2' } as const
const ACCOUNT_EMPTY = { email: 'owner-card-signs-c@abbaas.test', password: 'card-signs-password-c3' } as const
const ACCOUNT_BACK_HEAVY = { email: 'owner-card-signs-d@abbaas.test', password: 'card-signs-password-d4' } as const

const AHMED = 'Ahmed Shifaz'
const MARIYAM = 'Mariyam Nisha'

/** The rufiyaa send both seeded ledgers open with: MVR10,000 at the rate 20, stored as $500. */
const MVR_SEND: EntrySeed = {
  kind: 'send',
  currency: 'MVR',
  amountMinor: 1000000,
  rate: '20.0000',
  usdCents: 50000,
  entryDate: '2026-09-12',
  savedAt: '2026-09-12T09:00:00Z',
  personName: AHMED,
  method: 'transfer',
}

/** The dollar send both seeded ledgers hold: $750, made in dollars. */
const USD_SEND: EntrySeed = {
  kind: 'send',
  currency: 'USD',
  amountMinor: 75000,
  rate: null,
  usdCents: 75000,
  entryDate: '2026-09-20',
  savedAt: '2026-09-20T09:00:00Z',
  personName: MARIYAM,
  method: null,
}

/** The one repayment: $300 come back. */
const REPAYMENT: EntrySeed = {
  kind: 'receive',
  currency: 'USD',
  amountMinor: 30000,
  rate: null,
  usdCents: 30000,
  entryDate: '2026-09-28',
  savedAt: '2026-09-28T09:00:00Z',
  method: 'cash',
}

/** A ledger with money out and money back: two sends and one repayment. */
const WITH_REPAYMENT: readonly EntrySeed[] = [MVR_SEND, USD_SEND, REPAYMENT]

/** A ledger with money out and nothing back, so the Paid Back figure is a total of zero. */
const SENDS_ONLY: readonly EntrySeed[] = [MVR_SEND, USD_SEND]

/** More money back than went out: $2,000 against the one rufiyaa send stored as $500. */
const BIG_REPAYMENT: EntrySeed = {
  kind: 'receive',
  currency: 'USD',
  amountMinor: 200000,
  rate: null,
  usdCents: 200000,
  entryDate: '2026-09-30',
  savedAt: '2026-09-30T09:00:00Z',
  method: 'transfer',
}

/** A ledger where more came back than went out, so the balance is read the other way round. */
const BACK_HEAVY: readonly EntrySeed[] = [MVR_SEND, BIG_REPAYMENT]

/** The figures those ledgers mean, stated so a wrong sum cannot pass unnoticed. */
const REPAID_SENT_CENTS = 125000
const REPAID_PAID_CENTS = 30000
const REPAID_BALANCE_CENTS = 95000

let stack: Stack
let served: ServedOrigin
let repaid: Account
let sendsOnly: Account
let emptyLedger: Account
let backHeavy: Account

test.use({ viewport: VIEWPORT })
// Not serial: each scenario signs in as its own owner and reads its own ledger, so one
// scenario's disagreement must not hide what the others observe.

test.beforeAll(async () => {
  stack = startLocalStack()
  buildBundle(stack)
  served = await serveDist()

  repaid = await createAccount(stack, ACCOUNT_REPAID)
  const repaidPeople = await seedPeopleByName(stack, repaid, [AHMED, MARIYAM])
  await replaceEntries(stack, repaid, WITH_REPAYMENT, repaidPeople)

  sendsOnly = await createAccount(stack, ACCOUNT_SENDS_ONLY)
  const sendsOnlyPeople = await seedPeopleByName(stack, sendsOnly, [AHMED, MARIYAM])
  await replaceEntries(stack, sendsOnly, SENDS_ONLY, sendsOnlyPeople)

  emptyLedger = await createAccount(stack, ACCOUNT_EMPTY)

  backHeavy = await createAccount(stack, ACCOUNT_BACK_HEAVY)
  const backHeavyPeople = await seedPeopleByName(stack, backHeavy, [AHMED])
  await replaceEntries(stack, backHeavy, BACK_HEAVY, backHeavyPeople)
})

test.afterAll(async () => {
  await served?.close()
})

// ===== The steps this oracle's scenarios are written in =====

const givenTheOwnerIsSignedIn = async (page: Page, account: Account): Promise<void> => {
  await page.goto(ORIGIN)
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen never appeared. WHY: every reading of the balance card starts from a signed-in owner. HOW: serve the built bundle and let it mount its sign-in screen.',
  ).toBeVisible()
  await page.getByLabel('Email').fill(account.email)
  await page.getByLabel('Password').fill(account.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(
    page.locator(PASSWORD_FIELD),
    'WHAT: the sign-in screen stayed up after Sign in. WHY: the owner cannot reach the Statement until the app lets them in. HOW: confirm the seeded account and let sign-in replace the screen.',
  ).toHaveCount(0)
}

/**
 * The marks the parts of an arriving screen carry while they are still moving. The card
 * stands outside the sliding part, but it does rise as the screen arrives, so every
 * reading below is taken from where the card came to rest.
 */
const partsStillMoving = (page: Page): Promise<readonly string[]> =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-motion], [data-enter-rise]'))
      .map((part) => part.getAttribute('data-motion') ?? `rise:${part.getAttribute('data-enter-rise')}`)
      .filter((mark) => ['view-slide', 'list-slide', 'list-enter'].includes(mark) || mark.startsWith('rise:'))
      .filter((mark) => !mark.endsWith('row')),
  )

const whenTheOwnerOpensTheStatement = async (page: Page): Promise<void> => {
  const tab = page.locator('[data-view="statement"]')
  await expect(
    tab,
    'WHAT: there is no Statement tab to tap on the bottom bar. WHY: a tap on that tab is the only way to the balance card, so without it the card is unreachable. HOW: draw the bottom bar with its Entries and Statement tabs.',
  ).toBeVisible()
  await tab.click()
  await expect(
    page.locator('[data-screen="statement"]'),
    'WHAT: tapping Statement showed no statement screen. WHY: the tap is what brings the balance card into the viewport. HOW: show the pane whose screen carries data-screen=statement.',
  ).toBeVisible()
  await expect
    .poll(() => partsStillMoving(page), {
      message:
        'WHAT: the screen was still arriving two seconds after the tap. WHY: every reading of the card below is taken from where the card came to rest, so a reading taken mid-flight would judge a card the owner never sees standing still. HOW: finish the arriving screen\'s rise, and drop each part\'s mark as it stops.',
      timeout: 2_000,
    })
    .toEqual([])
}

/**
 * Reads the balance card as the owner reads it, found from the three figures it holds
 * rather than from any hook the design does not declare: the card is the nearest thing
 * around all three of them. Answers, for each row in the order it is drawn, which figure
 * it holds, its word, its figure, the WHOLE span standing between that word and that
 * figure, and the whole row read out; and whether a line is drawn above the Balance row.
 */
const readBalanceCard = (page: Page): Promise<CardReading> =>
  page.evaluate((): CardReading => {
    const squash = (text: string | null | undefined): string => (text ?? '').replace(/\s+/g, ' ').trim()
    const absent: CardReading = { present: false, rows: [], dividerAboveBalance: false }
    const screen = document.querySelector('[data-screen="statement"]')
    if (screen === null) return absent
    const figures = Array.from(screen.querySelectorAll('[data-statement-total]'))
    const first = figures[0]
    if (first === undefined) return absent

    // The card is the nearest ancestor of the first figure that holds all of them.
    let climbing: Element | null = first.parentElement
    for (;;) {
      if (climbing === null) return absent
      const probe = climbing
      if (figures.every((figure) => probe.contains(figure))) break
      climbing = climbing.parentElement
    }
    const card = climbing

    /** The part of the card that holds this figure: the row the owner reads across. */
    const rowOf = (figure: Element): Element => {
      let row: Element = figure
      while (row.parentElement !== null && row.parentElement !== card) row = row.parentElement
      return row
    }
    const rows = figures.map(rowOf)

    /** The whole span between the row's own word and this row's figure, read as one text. */
    const betweenTheWordAndTheFigure = (row: Element, figure: Element): string => {
      const parts = Array.from(row.children)
      const at = parts.findIndex((part) => part.contains(figure))
      return parts
        .slice(1, at < 0 ? parts.length : at)
        .map((part) => squash(part.textContent))
        .join(' ')
        .trim()
    }

    /** Whether a line is drawn above the Balance row: a part of its own before it, or its own top edge. */
    const dividerAbove = (): boolean => {
      const balanceAt = figures.findIndex(
        (figure) => figure.getAttribute('data-statement-total') === 'balance',
      )
      const balanceRow = balanceAt < 0 ? null : (rows[balanceAt] ?? null)
      if (balanceRow === null) return false
      const before = balanceRow.previousElementSibling
      if (before !== null && !rows.includes(before)) {
        const line = before.getBoundingClientRect()
        // One pixel of slack is sub-pixel layout rounding only, never a drawn size.
        return line.width > 0 && line.height > 0 && line.bottom <= balanceRow.getBoundingClientRect().top + 1
      }
      return Number.parseFloat(window.getComputedStyle(balanceRow).borderTopWidth) > 0
    }

    return {
      present: true,
      rows: rows.map((row, index) => {
        const figure = figures[index] as Element
        return {
          name: figure.getAttribute('data-statement-total') ?? '',
          word: squash(row.firstElementChild?.textContent),
          figure: squash(figure.textContent),
          between: betweenTheWordAndTheFigure(row, figure),
          whole: squash(row.textContent),
        }
      }),
      dividerAboveBalance: dividerAbove(),
    }
  })

/** The card, read only once it is really on the screen. */
const thenTheCardIsOnTheScreen = async (page: Page): Promise<CardReading> => {
  const reading = await readBalanceCard(page)
  expect(
    reading.present,
    'WHAT: the Statement shows no balance card to read. WHY: the three figures are why the owner opens this screen, so with no card there is nothing to read at all. HOW: draw the card with its three figures at the top of the statement pane.',
  ).toBe(true)
  return reading
}

// ===== The scenarios =====

test('the balance card reads what went out, what came back and the balance, with nothing standing between any word and its figure', async ({
  page,
}) => {
  // Given the owner has sent money in rufiyaa and in dollars, and has had some of it back
  await givenTheOwnerIsSignedIn(page, repaid)
  const stored = await readStoredLedger(stack, repaid)
  const figures = expectedFigures(stored)

  // When the owner opens the Statement
  await whenTheOwnerOpensTheStatement(page)

  // Then the card reads its three words and figures, and nothing stands before any figure
  const card = await thenTheCardIsOnTheScreen(page)

  expect(
    figures,
    'WHAT: the stored rows do not add up to the figures this oracle expects. WHY: the three figures are the sum of the stored sends, the sum of the repayments and their unsigned difference, so a wrong seed would judge the card against arithmetic the ledger never held. HOW: seed one rufiyaa send stored as $500, one dollar send of $750 and one repayment of $300.',
  ).toEqual({ sent: REPAID_SENT_CENTS, paid: REPAID_PAID_CENTS, balance: REPAID_BALANCE_CENTS })

  expect(
    card.rows.map((row) => row.between),
    'WHAT: something stands between a word of the balance card and that row\'s own figure: the Paid Back row reads a minus, or another row reads a mark of its own. WHY: the card reads three sums, each under its own word, so a mark before a figure reads as a figure made negative and told the owner that money which came back had been taken off twice. WHY NOT: nothing stands in its place either, no bracket and no second word. HOW: let the one place that owns the mark of every row give the Paid Back row an empty mark, like the other two, and draw nothing else between a word and its figure.',
  ).toEqual([...NOTHING_BETWEEN])

  expect(
    card.rows.map((row) => row.word),
    "WHAT: the balance card's three rows do not read 'Total Sent', 'Paid Back' and 'Balance', in that order. WHY: a figure with no word beside it tells the owner nothing about what it counts, and the order is what makes the third the sum of the first two; dropping the mark must not cost a row its word. HOW: label the three rows with those words, top to bottom.",
  ).toEqual([...WORDS])

  expect(
    card.rows.map((row) => row.figure),
    'WHAT: the three rows do not read the dollars the stored rows add up to. WHY: the owner opens the Statement for these three sums, and a card that loses a figure while losing its mark is worse than the minus was. HOW: read the sum of the sends, the sum of the repayments and their unsigned difference, each with its cents.',
  ).toEqual([...expectedFigureTexts(figures)])

  expect(
    card.dividerAboveBalance,
    'WHAT: there is no line across the card above the Balance row. WHY: the line is what separates the two figures the balance is made of from the balance itself, so the owner reads a sum and not a third amount. HOW: draw a line across the card, above the Balance row.',
  ).toBe(true)
})

/**
 * The whole ground of the law that no row reads a mark: the card draws one row per figure
 * and holds exactly three, so a ledger with a repayment (above), a ledger with none, and a
 * ledger holding nothing at all are every kind of span there is. A wider ledger could add
 * no fourth row and no new kind of span (laws L-v3-no-sign and L-v3-figures-kept).
 */
const OTHER_LEDGERS = [
  {
    label: 'money sent and nothing back yet',
    account: (): Account => sendsOnly,
    sentCents: REPAID_SENT_CENTS,
    paidCents: 0,
  },
  {
    label: 'nothing in the ledger at all',
    account: (): Account => emptyLedger,
    sentCents: 0,
    paidCents: 0,
  },
  {
    label: 'more money back than went out',
    account: (): Account => backHeavy,
    sentCents: 50000,
    paidCents: 200000,
  },
] as const

for (const ledger of OTHER_LEDGERS) {
  test(`with ${ledger.label}, the card still reads its three words and figures with nothing standing between them`, async ({
    page,
  }) => {
    // Given the owner's ledger holds this much
    await givenTheOwnerIsSignedIn(page, ledger.account())
    const stored = await readStoredLedger(stack, ledger.account())
    const figures = expectedFigures(stored)

    // When the owner opens the Statement
    await whenTheOwnerOpensTheStatement(page)

    // Then all three rows are still drawn, and still read no mark before their figures
    const card = await thenTheCardIsOnTheScreen(page)

    expect(
      figures,
      `WHAT: the stored rows of the owner with ${ledger.label} do not add up to what this oracle expects. WHY: the mark of a row comes from the name of its figure and never from its amount, which only a seeded amount this oracle itself derived can show. HOW: seed exactly the sends and repayments this case names.`,
    ).toEqual({
      sent: ledger.sentCents,
      paid: ledger.paidCents,
      balance: Math.abs(ledger.sentCents - ledger.paidCents),
    })

    expect(
      card.rows.map((row) => row.between),
      `WHAT: with ${ledger.label}, something stands between a word of the card and that row's own figure. WHY: the mark of a row is decided by the name of its figure and never by its amount, so a figure that reads a total of zero must read no mark either, and a Paid Back row with nothing behind it must not grow one. HOW: let the one place that owns the mark of every row answer the same empty mark for every ledger.`,
    ).toEqual([...NOTHING_BETWEEN])

    expect(
      card.rows.map((row) => [row.name, row.word, row.figure]),
      `WHAT: with ${ledger.label}, the card does not read its three rows with their words and the dollars the stored rows add up to. WHY: a row that disappears when its figure is a total of zero loses the owner the very reading that tells them nothing came back yet. HOW: draw one row per figure, always three, each with its word and its own sum.`,
    ).toEqual(NAMES.map((name, index) => [name, WORDS[index], expectedFigureTexts(figures)[index]]))
  })
}

test('the balance card reads nothing but its three words and their figures, whatever else the screen draws around them', async ({
  page,
}) => {
  // Given the owner has sent money in both currencies and has had some of it back
  await givenTheOwnerIsSignedIn(page, repaid)
  const stored = await readStoredLedger(stack, repaid)
  const figures = expectedFigures(stored)

  // When the owner opens the Statement
  await whenTheOwnerOpensTheStatement(page)

  // Then each row of the card, read whole, is its word and its figure and nothing else
  const card = await thenTheCardIsOnTheScreen(page)

  expect(
    card.rows.map((row) => row.name),
    'WHAT: the balance card does not hold exactly the three figures named sent, paid and balance, in that order. WHY: every mark the card could read before a figure is decided for these three names and for no other, so a fourth figure, a missing one or a renamed one would read a mark nothing on this screen decides. HOW: draw one row for each of the three named figures, and no other row that holds a figure.',
  ).toEqual([...NAMES])

  expect(
    card.rows.map((row) => row.whole),
    'WHAT: a row of the balance card reads more than its word and its own figure: a mark, a bracket or a second word stands somewhere in it, wherever on the screen it was drawn from. WHY: the whole row is what the owner reads and what a screen reader reads out, so a mark added anywhere in the row - before the word, between the word and the figure, or after it - puts the sign back whatever decided to draw it. HOW: keep the mark of every card row coming from the one place that owns it, which now gives none, and draw nothing else inside a card row.',
  ).toEqual([...expectedWholeRows(figures)])
})
