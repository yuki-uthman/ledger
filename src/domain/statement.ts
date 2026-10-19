// The Statement as a pure projection of the account's entries: the period it
// covers, the three figures of its balance card, and the numbered rows of its
// lists with every word each row reads.
//
// Values in, values out. This module names no DOM, no port adapter and no
// Supabase client, so the meaning of the statement - what it covers, in which
// order, summed how, worded how - is decided once, here, where it can be read
// and reused on its own. The screen that draws it decides none of it.
//
// WHY the derived TEXT lives here and not on the screen. A figure, a date, a
// count and a sub-line are all readings of stored values, and a screen that
// worded them itself would be a second owner of what the owner's money says.
// The screen owns only the board's own furniture - the heading, the column
// words, the colours - which say the same thing at every ledger length.
//
// The rule, in one line: the sent rows are the entries of kind send, oldest
// first, numbered 1 upward; the three figures are the sum of the sends, the sum
// of the repayments and the unsigned difference of the two; and a row's dollars
// are the dollars that row stores, never a rufiyaa figure converted again.

import { balanceOf } from './balance.js'
import { entryCountLabel, shortDayLabel } from './ledger-view.js'
import { formatMvrLaari, formatRatePlain, formatUsdCents } from './money.js'

/**
 * The middle dot the board draws between the parts of one line. Exported
 * because the panels' own footers join their words with the same separator, and
 * one line of the screen reading a different dot would be the board drawn twice.
 */
export const SEPARATOR = '·'

/** The en dash the board draws between the two ends of the period. */
const RANGE_DASH = '–'

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
   * 'Transfer · MVR 17,000 @ 20', or null when the entry stores nothing to say:
   * a row with no sub-line is a single line, not a line of nothing.
   */
  readonly subline: string | null
  readonly usdCents: number
  /** The dollars this row stores, unsigned: '2,007.00'. */
  readonly usdText: string
}

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
  /** 'You and Abbaas · 14 Sep – 14 Oct 2026 · in USD'. */
  readonly period: string
  /** The three figures in the order the card reads them, top to bottom. */
  readonly figures: readonly StatementFigure[]
  readonly sent: StatementList
}

/** The three words this app can read; a token outside them says nothing. */
const METHOD_WORDS: Readonly<Record<string, string>> = {
  cash: 'Cash',
  cheque: 'Cheque',
  transfer: 'Transfer',
}

/**
 * The word a stored method reads as. A null method, and a token this app cannot
 * name, both say nothing: the owner would otherwise read a way the money
 * changed hands that nobody ever recorded.
 */
const methodWord = (method: string | null): string | null => {
  if (method === null) return null
  const word: string | undefined = METHOD_WORDS[method]
  return word ?? null
}

/**
 * The USD column of a list is headed USD and the period line already says in
 * USD, so a row's figure is read without its sign. It is taken off the ONE
 * formatter that words every USD figure in this app, so a row and the card can
 * never group or round their dollars differently.
 */
const withoutCurrencySign = (figure: string): string => figure.replace('$', '')

/** A date with its year, as the ends of the period name it: '14 Oct 2026'. */
const dateWithYear = (date: string): string => {
  const label = shortDayLabel(date)
  // A date the store could not have stored carries no year to name.
  return label === date ? date : `${label} ${date.slice(0, 4)}`
}

/** The year a stored date falls in, which decides how the two ends are worded. */
const yearOf = (date: string): string => date.slice(0, 4)

/**
 * What a send's sub-line names: the stored method first, then, for a rufiyaa
 * entry, the rufiyaa figure and the rate the owner gave. Null when the entry
 * stores neither - a dollar send with no stored method is one line.
 *
 * A rufiyaa entry with no stored rate names its figure and no rate clause at
 * all: a rate nobody gave cannot be printed, and no figure here is computed
 * from one.
 */
const sublineOf = (entry: StatementEntry): string | null => {
  const word = methodWord(entry.method)
  const rufiyaa =
    entry.currency === 'MVR' && entry.rate !== null
      ? `MVR ${formatMvrLaari(entry.amountMinor)} @ ${formatRatePlain(entry.rate)}`
      : null
  const parts = [word, rufiyaa].filter((part): part is string => part !== null)
  return parts.length === 0 ? null : parts.join(` ${SEPARATOR} `)
}

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
  // The dollars the entry STORES. A rufiyaa figure converted a second time
  // would move the owner's money by the rounding.
  usdCents: entry.usdCents,
  usdText: withoutCurrencySign(formatUsdCents(entry.usdCents)),
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

/**
 * The period the statement covers, worded from the first and last day the owner
 * recorded: the year is named once at the end when both ends fall in it, on
 * each end when they do not, once when every entry falls on one day, and not at
 * all when there is no entry, where a date would claim a day nobody recorded.
 */
const periodOf = (entries: readonly StatementEntry[]): string =>
  // One line of the board: its parts, joined by the board's own separator. The
  // days are one part of it, or no part at all on an empty ledger.
  ['You and Abbaas', ...daysCovered(entries), 'in USD'].join(` ${SEPARATOR} `)

/**
 * The days the entries cover, as the one part of the period line that names
 * them, or nothing at all when there is no entry: a date invented there would
 * claim a day nobody recorded.
 */
const daysCovered = (entries: readonly StatementEntry[]): readonly string[] => {
  if (entries.length === 0) return []
  const dates = entries.map((entry) => entry.entryDate).sort()
  const first = dates[0] ?? ''
  const last = dates[dates.length - 1] ?? ''
  // Every entry on one day: that day, named once.
  if (first === last) return [dateWithYear(first)]
  // The year is named once at the end when both ends fall in it, and on each
  // end when they do not.
  return yearOf(first) === yearOf(last)
    ? [`${shortDayLabel(first)} ${RANGE_DASH} ${dateWithYear(last)}`]
    : [`${dateWithYear(first)} ${RANGE_DASH} ${dateWithYear(last)}`]
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
    period: periodOf(entries),
    figures: [
      { which: 'sent', cents: balance.sentCents, text: formatUsdCents(balance.sentCents) },
      { which: 'paid', cents: balance.paidBackCents, text: formatUsdCents(balance.paidBackCents) },
      // Never signed: which side holds the money is not what this row claims.
      { which: 'balance', cents: balance.amountCents, text: formatUsdCents(balance.amountCents) },
    ],
    sent: listOf(entries, 'send'),
  }
}
