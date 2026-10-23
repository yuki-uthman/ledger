// The Statement as a pure projection of the account's entries: the three
// figures of its balance card, the numbered rows of its lists with every word
// each row reads, and the three lines the sending list's footer reads.
//
// Values in, values out. This module names no DOM, no port adapter and no
// Supabase client, so the meaning of the statement - what it covers, in which
// order, summed how, worded how - is decided once, here, where it can be read
// and reused on its own. The screen that draws it decides none of it.
//
// WHY the derived TEXT lives here and not on the screen. A figure, a date, a
// count and a sub-line are all readings of stored values, and a screen that
// worded them itself would be a second owner of what the owner's money says.
// The screen owns only the board's own furniture - the column words, the
// colours, the shape of a card - which says the same thing at every ledger
// length.
//
// The rule, in one line: the sent rows are the entries of kind send and the
// paid-back rows exactly those of kind receive, each oldest first and numbered 1
// upward within its own list; the three figures are the sum of the sends, the
// sum of the repayments and the unsigned difference of the two; and a row's
// dollars are the dollars that row stores, never a rufiyaa figure converted
// again.

import { balanceOf } from './balance.js'
import { entryCountLabel, shortDayLabel } from './ledger-view.js'
import {
  formatMvrAmount,
  formatRatePlain,
  formatUsdCents,
  formatUsdWhole,
} from './money.js'

/**
 * The middle dot the board draws between the parts of one line. Exported
 * because the panels' own footers join their words with the same separator, and
 * one line of the screen reading a different dot would be the board drawn twice.
 */
export const SEPARATOR = '·'

/** The part of an entry this projection depends on; a wider entry satisfies it. */
export type StatementEntry = {
  readonly id: string
  readonly kind: 'send' | 'receive'
  readonly currency: 'USD' | 'MVR'
  /** US cents for USD, laari for MVR. */
  readonly amountMinor: number
  /** Rufiyaa per one US dollar, or null where none was ever stored. */
  readonly rate: number | null
  readonly usdCents: number
  /** YYYY-MM-DD. */
  readonly entryDate: string
  readonly savedAt: string
  readonly personId: string | null
  readonly personName: string | null
  /**
   * The stored token, read as a word only when it is one this app knows. It is
   * typed as the stored text rather than as the three known words so a token
   * from outside them is read as nothing said, never as a thrown error and
   * never as an invented default.
   */
  readonly method: string | null
}

/**
 * The way the money changed hands, as a row can read it: the token the ledger
 * stores AND the word it reads as, together or not at all.
 *
 * The two are one value because neither is readable without the other: a word
 * with no token would name a way nobody recorded, and a token with no word
 * would print raw storage at the owner. A stored token this app cannot name
 * therefore yields no method at all rather than a half of one.
 */
export type StatementMethod = {
  /** The token as the ledger stores it: 'cash'. */
  readonly token: string
  /** The word the owner reads: 'Cash'. */
  readonly word: string
}

/**
 * What a row's MVR cell reads: a send made in rufiyaa reads its own marked
 * rufiyaa figure, the rate it was sent at where the ledger stores one, and the
 * marked reading, with no brackets, of the dollars THAT SAME entry stores; a
 * send made in dollars has no rufiyaa reading at all.
 *
 * The two are one choice type, and not one cell with empty fields, because they
 * exclude each other: no value of this type carries a converted dollar figure
 * unless it is a rufiyaa send, and none is a rufiyaa send without its rufiyaa
 * figure. A row could otherwise be built stating money the ledger does not hold,
 * or hiding the currency a send was made in. The exclusion holds for every value
 * the compiler sees; a cast or an unchecked decode can still present a shape it
 * never saw, which is the ledger store's obligation and not this type's.
 */
export type StatementMvrCell =
  | { readonly currency: 'USD' }
  | {
      readonly currency: 'MVR'
      /** The rufiyaa this entry moved: 'MVR10,000', 'MVR10,000.50'. */
      readonly figure: string
      /** '@20', or null where the ledger stores no rate to read. */
      readonly rateText: string | null
      /** What the dollars this entry stores read as beside its rufiyaa: '$500'. */
      readonly convertedText: string
    }

/** One row of a statement list, as the owner reads it across the row. */
export type StatementRow = {
  /** The entry this row came from, so a reader can name which row is which. */
  readonly entryId: string
  /** Its place in the oldest-first order, from 1. */
  readonly no: number
  /** '14 Sep'. */
  readonly dateLabel: string
  readonly personId: string | null
  readonly personName: string
  /**
   * 'Transfer', or null when the ledger stores no method this app can name: a
   * row with no sub-line is a single line, not a line of nothing.
   */
  readonly subline: string | null
  /**
   * The way this entry's money changed hands, or null where the ledger stores
   * nothing this app can name: a repayment with no stored method reads as an
   * empty cell, never as a word of the screen's own.
   */
  readonly method: StatementMethod | null
  /** What this row's rufiyaa column reads, which is what says in which currency it was sent. */
  readonly mvrCell: StatementMvrCell
  readonly usdCents: number
  /**
   * The marked whole reading of the dollars this row stores: '$1,500',
   * '$1,500.50'. It is the ONE dollar reading a row of either list carries,
   * because both lists now read their figures marked: a second, unmarked
   * reading beside it would be two ways to word the same cents, and the next
   * reader could not tell which of them the owner is meant to see.
   */
  readonly usdFigure: string
}

/** Which of the three lines of the sending list's footer this is, as they are read down the block. */
export type SentFootLineName = 'mvr' | 'usd' | 'total'

/**
 * What one figure of the sent footer is a reading OF: the rufiyaa that went out,
 * what those same rufiyaa were worth in dollars, the dollars that went out, or
 * the total of both.
 *
 * It is carried beside the figure's own text because what a figure MEANS is part
 * of what the footer says, while the ink that meaning is drawn in is the board's.
 * A screen that read the meaning off the text would be parsing money it was
 * handed already worded.
 */
export type SentFootReading = 'mvr' | 'converted' | 'usd' | 'sent'

/** One figure of a footer line: what it reads, and the words it reads in. */
export type SentFootFigure = {
  readonly reads: SentFootReading
  /** 'MVR60,000', '$3,000.00', '$9,500.00'. */
  readonly text: string
}

/**
 * One line of the sending list's footer: what it is called, how many sends it
 * holds in words and in number, what those sends store in dollars, and the
 * figures it reads at its right.
 *
 * Its count and its cents stand beside its figures so a reader is told how many
 * sends made a line up and how much they were worth without parsing the words:
 * a line whose figures and whose pair disagreed could not be told apart from a
 * line that was never given either.
 */
export type SentFootLine = {
  readonly which: SentFootLineName
  /** 'Sent in MVR'; the count is worded beside it, never inside it. */
  readonly label: string
  readonly count: number
  /** 'No entries', '1 entry' or 'N entries', as this app words a count. */
  readonly countLabel: string
  readonly cents: number
  /** At least one, because a line with no figure would read as a label alone. */
  readonly figures: readonly [SentFootFigure, ...SentFootFigure[]]
}

/**
 * What the sending list's footer reads: the rufiyaa line, the dollar line and
 * the total line, in the order they are drawn.
 *
 * It is a three-place tuple and not a list because all three lines stand at
 * EVERY ledger, the empty one included: a list could be built one line short,
 * and the owner would read a currency split with a currency missing from it -
 * which they could not tell from 'nothing went out in that currency'. The
 * exclusion holds for every value the compiler sees; a screen handed three lines
 * could still draw two, which is why the drawn lines are observed as well.
 */
export type SentFoot = readonly [SentFootLine, SentFootLine, SentFootLine]

/** One list of the statement: its rows, and what its own footer adds up to. */
export type StatementList = {
  readonly rows: readonly StatementRow[]
  readonly count: number
  /** 'No entries', '1 entry' or 'N entries', as this app words a count. */
  readonly countLabel: string
  readonly totalCents: number
  /** '$4,596.35'. */
  readonly totalText: string
}

/** Which figure of the balance card this is; the hook a reader finds it by. */
export type StatementFigureName = 'sent' | 'paid' | 'balance'

/** One figure of the balance card, in cents and in words. */
export type StatementFigure = {
  readonly which: StatementFigureName
  readonly cents: number
  /** '$4,596.35'. */
  readonly text: string
}

/** The whole statement of one read ledger. */
export type Statement = {
  /** The three figures in the order the card reads them, top to bottom. */
  readonly figures: readonly StatementFigure[]
  /** What the owner sent: the entries of kind send. */
  readonly sent: StatementList
  /** What came back: the entries of kind receive, numbered from its own rows. */
  readonly back: StatementList
  /** The three lines the sending list's footer reads, rufiyaa, dollars and total. */
  readonly sentFoot: SentFoot
}

/** The three words this app can read; a token outside them says nothing. */
const METHOD_WORDS: Readonly<Record<string, string>> = {
  cash: 'Cash',
  cheque: 'Cheque',
  transfer: 'Transfer',
}

/**
 * What a stored method reads as. A null method, and a token this app cannot
 * name, both say nothing: the owner would otherwise read a way the money
 * changed hands that nobody ever recorded. The token is carried beside its word
 * so a reader can check the cell against the column it came from, and the two
 * are built here together or not at all.
 */
const methodOf = (method: string | null): StatementMethod | null => {
  if (method === null) return null
  const word: string | undefined = METHOD_WORDS[method]
  return word === undefined ? null : { token: method, word }
}

/**
 * What a send's sub-line names: the word of the stored method and nothing else.
 * Null where the ledger stores nothing this app can name - a send with no
 * nameable method is one line.
 *
 * It names no figure and no rate. The rufiyaa this entry moved and the rate it
 * was sent at are read in the MVR column, and a second reading of them under the
 * person would state the same money twice.
 */
const sublineOf = (entry: StatementEntry): string | null => methodOf(entry.method)?.word ?? null

/**
 * What the MVR cell of this entry's row reads. A rufiyaa send reads its own
 * stored laari, the rate it was sent at where one is stored, and the dollars it
 * STORES: converting its rufiyaa figure a second time would move the
 * owner's money by the rounding. A dollar send has no rufiyaa reading, and the
 * mark that stands in its place is the screen's own furniture.
 *
 * A rufiyaa send with no stored rate is admitted, not excluded: it reads its
 * figure with no rate clause at all, because a rate nobody gave can only be
 * invented. What makes such a row unreachable through the real ledger is the
 * stored column's own constraint, not this type.
 */
const mvrCellOf = (entry: StatementEntry): StatementMvrCell =>
  entry.currency === 'MVR'
    ? {
        currency: 'MVR',
        figure: formatMvrAmount(entry.amountMinor),
        rateText: entry.rate === null ? null : `@${formatRatePlain(entry.rate)}`,
        convertedText: formatUsdWhole(entry.usdCents),
      }
    : { currency: 'USD' }

/** Oldest first: by the day the money moved, then by when it was saved, then by id. */
const oldestFirst = <E extends StatementEntry>(entries: readonly E[]): readonly E[] =>
  [...entries].sort(
    (left, right) =>
      left.entryDate.localeCompare(right.entryDate) ||
      left.savedAt.localeCompare(right.savedAt) ||
      left.id.localeCompare(right.id),
  )

/** One row, numbered by its place in that order. */
const rowOf = (entry: StatementEntry, index: number): StatementRow => ({
  entryId: entry.id,
  no: index + 1,
  dateLabel: shortDayLabel(entry.entryDate),
  personId: entry.personId,
  personName: entry.personName ?? '',
  subline: sublineOf(entry),
  method: methodOf(entry.method),
  mvrCell: mvrCellOf(entry),
  // The dollars the entry STORES. A rufiyaa figure converted a second time
  // would move the owner's money by the rounding.
  usdCents: entry.usdCents,
  usdFigure: formatUsdWhole(entry.usdCents),
})

/**
 * One list of the statement: the entries of one kind, oldest first and numbered
 * from 1, with the count and the total of those same rows. The footer's figures
 * are summed from the rows it stands under, so the words and the list cannot
 * disagree however long the ledger grows.
 *
 * It takes the kind as an argument because the two lists of this screen differ
 * in nothing but that: the paid-back list is this same projection of the
 * entries of kind receive.
 */
const listOf = <E extends StatementEntry>(
  entries: readonly E[],
  kind: StatementEntry['kind'],
): StatementList => {
  const rows = oldestFirst(entries.filter((entry) => entry.kind === kind)).map(rowOf)
  const totalCents = rows.reduce((sum, row) => sum + row.usdCents, 0)
  return {
    rows,
    count: rows.length,
    countLabel: entryCountLabel(rows.length),
    totalCents,
    totalText: formatUsdCents(totalCents),
  }
}

/** What each line of the sending list's footer is called; the last keeps its capital S. */
const SENT_FOOT_LABELS: Readonly<Record<SentFootLineName, string>> = {
  mvr: 'Sent in MVR',
  usd: 'Sent in USD',
  total: 'Total Sent',
}

/** The stored rufiyaa of these sends, in whole laari. */
const laariOf = (sends: readonly StatementEntry[]): number =>
  sends.reduce((sum, entry) => sum + entry.amountMinor, 0)

/** The stored dollars of these sends, in whole cents. */
const centsOf = (sends: readonly StatementEntry[]): number =>
  sends.reduce((sum, entry) => sum + entry.usdCents, 0)

/**
 * One line of the footer: the sends it holds, counted and worded as this app
 * words a count, summed in the dollars those same sends store, with the figures
 * it reads at its right.
 *
 * Its count and its cents are taken off the very sends its figures are worded
 * from, so the words and the pair cannot disagree about one line's money.
 */
const footLineOf = (
  which: SentFootLineName,
  sends: readonly StatementEntry[],
  figures: readonly [SentFootFigure, ...SentFootFigure[]],
): SentFootLine => ({
  which,
  label: SENT_FOOT_LABELS[which],
  count: sends.length,
  countLabel: entryCountLabel(sends.length),
  cents: centsOf(sends),
  figures,
})

/**
 * What the sending list's footer reads: the rufiyaa sends with their laari summed
 * and the dollars they STORE beside it, the dollar sends with their
 * dollars, and every send on the total line.
 *
 * A line's membership is the STORED currency of a send and never a drawn text,
 * so a send stored in neither currency is counted on the total line alone rather
 * than added to a line it does not belong to: the two currency counts are
 * therefore read from their own sends and never assumed to exhaust the sends.
 *
 * The rufiyaa subtotal is worded as a rufiyaa amount, with its laari only where
 * they are real, because that is how every rufiyaa figure of this screen is
 * written; every figure in dollars keeps the two decimals a total is read by.
 */
export const sentFootOf = <E extends StatementEntry>(entries: readonly E[]): SentFoot => {
  const sends = entries.filter((entry) => entry.kind === 'send')
  const inRufiyaa = sends.filter((entry) => entry.currency === 'MVR')
  const inDollars = sends.filter((entry) => entry.currency === 'USD')
  return [
    footLineOf('mvr', inRufiyaa, [
      { reads: 'mvr', text: formatMvrAmount(laariOf(inRufiyaa)) },
      { reads: 'converted', text: formatUsdCents(centsOf(inRufiyaa)) },
    ]),
    footLineOf('usd', inDollars, [{ reads: 'usd', text: formatUsdCents(centsOf(inDollars)) }]),
    footLineOf('total', sends, [{ reads: 'sent', text: formatUsdCents(centsOf(sends)) }]),
  ]
}

/**
 * The statement of these entries, in any order they arrive in.
 *
 * The three figures are read from balanceOf, which stays the ONE owner of the
 * balance rule in this app: the card cannot say a balance the boxes on Home
 * would contradict.
 */
export const statementOf = <E extends StatementEntry>(entries: readonly E[]): Statement => {
  const balance = balanceOf(entries)
  return {
    figures: [
      { which: 'sent', cents: balance.sentCents, text: formatUsdCents(balance.sentCents) },
      { which: 'paid', cents: balance.paidBackCents, text: formatUsdCents(balance.paidBackCents) },
      // Never signed: which side holds the money is not what this row claims.
      { which: 'balance', cents: balance.amountCents, text: formatUsdCents(balance.amountCents) },
    ],
    sent: listOf(entries, 'send'),
    // The two lists are the SAME projection of the two kinds, so no entry can
    // be in both and none can be left out of its own.
    back: listOf(entries, 'receive'),
    // Read off the stored sends, not off the rows above it: a footer counted
    // from what is drawn would understate a ledger longer than the phone.
    sentFoot: sentFootOf(entries),
  }
}
