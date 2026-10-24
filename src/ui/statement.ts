// The Statement screen: a function from the read ledger to one screen, as every
// screen in this app is.
//
// It decides nothing about money, order or wording. Every figure, date, count
// and sub-line it draws is read off src/domain/statement.ts; what this module
// owns is the board's own furniture - the four column words, the shape of the
// card and the panel - and the hooks a reader finds them by.
//
// It is READ-ONLY by construction: it is handed a read outcome and nothing that
// writes, so there is no operation within its reach that could change the money
// it reports. It draws no balance box and no Send or Receive control either, so
// the one screen that only reports offers nothing that records.
//
// The hooks, which every later value keeps:
//   - the screen carries data-screen="statement" and draws nothing above the
//     balance card: the view is named by its tab and by the pane's own
//     accessible name, so no heading of its own repeats that
//   - each card figure carries data-statement-total="sent|paid|balance" with
//     data-cents, and holds the figure and nothing else
//   - the screen carries data-statement-shown="sent|back", which is the whole
//     of the state the pill switches
//   - each panel is the tabpanel of its own tab and carries
//     data-statement-list="sent|back", its header
//     data-statement-head, its scrolling rows data-statement-rows and its
//     footer data-statement-foot with data-count and data-cents, each named by
//     the list it belongs to
//   - each line of the sending list's footer carries
//     data-statement-foot-line="mvr|usd|total" with its own data-count and
//     data-cents, and each of its figures says on data-reads what it is a
//     reading of; the block's own count and cents still read the total line, so
//     a reader that knew only the old hooks reads the same total as before
//   - the mark before the figure that says it reads the converted total is this
//     screen's own leaf: it stands inside that figure's detail box, says nothing
//     on data-reads, and is never part of the words the domain worded, so no
//     element that says what it reads carries it inside its own text. It is
//     drawn from that one saying and from nothing about a figure's value, so it
//     stands at every ledger - the empty one reads MVR0 and the mark with $0.00
//     - and exactly one of it stands in that footer
//   - each row carries data-statement-row="<entry id>" and data-no="<number>";
//     a send names its person on data-person and its sub-line on
//     data-statement-sub, and a repayment names its stored method token on
//     data-statement-method when one is stored
//   - a header cell of either list names its own column on
//     data-statement-column="date|party|method|mvr|usd", and a sent row carries
//     data-statement-mvr on its rufiyaa cell - with data-statement-rate on the
//     rate inside it and data-statement-converted on the one element that reads
//     the dollars that same send stores - and data-statement-usd on its dollar
//     cell, with data-converted saying whether that cell reads a converted
//     figure, which it says whether or not it reads a figure at all
//   - no hook says that a cell is empty: absence in a money column is carried by
//     the empty cell alone, so where a row has no figure to read in a column
//     nothing at all is drawn there, and there is no element such a hook could
//     stand on
//
// The place of a row of either list is still carried on data-no, and no number is
// drawn in the row: the order the owner reads is kept, and only its drawn number
// is gone.
//
// They are prefixed data-statement- because both panes stand in the one page at
// once: a bare data-total would answer for Home's totals as well.

import {
  SEPARATOR,
  statementOf,
  type SentFoot,
  type SentFootFigure,
  type SentFootLine,
  type StatementFigure,
  type StatementFigureName,
  type StatementList,
  type StatementMvrCell,
  type StatementRow,
} from '../domain/statement.js'
import type { ReadEntriesOutcome } from '../ports/ledger-store.js'
import { VIEW_SHOWN, riseParts, slideLists, type SwitchPart } from './motion.js'

/** What the card calls each of its three figures. */
const FIGURE_LABELS: Readonly<Record<StatementFigureName, string>> = {
  sent: 'Total Sent',
  paid: 'Paid Back',
  balance: 'Balance',
}

/**
 * The one place that owns the mark standing before a figure of the card, for
 * each of its three figures and for no other name. No figure takes a mark: the
 * card reads three sums, each under its own word, so a minus before the Paid
 * Back figure read as a figure made negative, telling the owner that money
 * which came back had been taken off twice.
 */
const FIGURE_SIGNS: Readonly<Record<StatementFigureName, string>> = {
  sent: '',
  paid: '',
  balance: '',
}

/**
 * The mark this screen draws before the dollars some rufiyaa came to: beside a
 * rate in a sent row's rufiyaa cell, and before the sent footer's reading of
 * what its rufiyaa were worth. It is this screen's own reading of 'became', and
 * no part of what the domain words, which is why it is written here once and in
 * no string of the domain.
 */
const BECAME = '→'

/**
 * One cell of a column header: the word the owner reads, and the name of the
 * column it heads.
 *
 * The two are one value, and the name is not optional, because a word with no
 * column named under it is a header a reading cannot find its cells by: every
 * header cell of both lists names the column it stands over.
 */
type HeadColumn = {
  readonly word: string
  readonly name: string
}

const named = (word: string, name: string): HeadColumn => ({ word, name })

/**
 * The four words that make the four cells of a sent row readable, each naming its
 * own column: no number is drawn in a sent row, so no word promises one.
 */
const SENT_COLUMNS: readonly HeadColumn[] = [
  named('Date', 'date'),
  named('Paid to', 'party'),
  named('MVR', 'mvr'),
  named('USD', 'usd'),
]

/**
 * The three words that make the three cells of a repayment readable: a repayment
 * names a way the money came back and not a person, and this list holds one
 * currency, so its own currency word stands over the only figure column there is.
 */
const BACK_COLUMNS: readonly HeadColumn[] = [
  named('Date', 'date'),
  named('Method', 'method'),
  named('USD', 'usd'),
]

/** Which of the two lists this is; the one piece of state the pill switches. */
type ShownList = 'sent' | 'back'

/** The two lists, in the order the pill offers them. */
const LISTS = ['sent', 'back'] as const

/** What each list is called, on its tab and on its own panel alike. */
const LIST_NAMES: Readonly<Record<ShownList, string>> = {
  sent: 'Sent for Abbaas',
  back: 'Paid back by Abbaas',
}

/**
 * The id a list's panel is found by, so its own tab can name it with
 * aria-controls: one statement screen is built per paint, so the two ids are
 * unique in the page.
 */
const panelId = (which: ShownList): string => `statement-list-${which}`

/** What the paid-back list's footer calls its own total; the sending list's words are its own. */
const BACK_TOTAL_LABEL = 'Total paid back'

/**
 * How one list's footer reads what that list adds up to: a function from that
 * footer's own reading to the one part the panel places under its rows. It is
 * the list's own, as its row renderer is, so what a footer reads is never
 * decided inside the panel the two lists share - and the two lists do not read
 * the same thing, the sending list's footer standing on three lines of its own
 * while the paid-back list's stands on its list alone.
 */
type FootRenderer<Reading> = (reading: Reading) => HTMLElement

/**
 * One panel of this screen, which is all a panel needs to be drawn: the two
 * panels differ in their name, their column words, and the rows and the footer
 * handed to them, and in nothing else.
 */
type Panel<Reading> = {
  readonly which: ShownList
  readonly columns: readonly HeadColumn[]
  readonly list: StatementList
  /** How one of its rows is read across: a send names a person, a repayment a way. */
  readonly row: (row: StatementRow) => HTMLElement
  /** How its own footer reads what it adds up to. */
  readonly foot: FootRenderer<Reading>
  /** What that footer reads, which the panel places and never looks into. */
  readonly footReading: Reading
}

const element = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
): HTMLElementTagNameMap[K] => {
  const made = document.createElement(tag)
  made.className = className
  return made
}

/** One cell: a named box holding one reading and nothing else. */
const cell = (className: string, text: string): HTMLElement => {
  const made = element('span', className)
  made.textContent = text
  return made
}

/**
 * Appends the cells of one line with a space between each.
 *
 * A line of this screen is read across, as one sentence - '1 14 Sep Mariyam
 * Nisha Transfer 2,007.00' - so two cells appended tight against each other
 * would run their words together for anything that reads the line rather than
 * the boxes. A whitespace-only text node draws nothing and takes no place of
 * its own in a grid or a flex column.
 */
const appendCells = (parent: HTMLElement, cells: readonly Node[]): void => {
  cells.forEach((part, index) => {
    if (index > 0) parent.append(' ')
    parent.append(part)
  })
}

/**
 * The mint balance card: Total Sent, Paid Back, a divider, and the Balance in
 * the large type the board draws. The figure itself carries the hook and the
 * cents, so what a reader reads there is the figure alone. The mark of a row
 * comes only from the one table of signs, which gives none to any of the three,
 * and the cell it stands in is still drawn, keeping its place in the grid.
 */
const renderCard = (figures: readonly StatementFigure[]): HTMLElement => {
  const card = element('div', 'statement-card')
  for (const figure of figures) {
    // The one line the card draws across itself, above its last figure.
    if (figure.which === 'balance') card.append(element('div', 'statement-card-divider'))
    const row = element('div', 'statement-card-row')
    row.dataset.statementFigure = figure.which
    const amount = cell('statement-card-figure', figure.text)
    amount.dataset.statementTotal = figure.which
    amount.dataset.cents = String(figure.cents)
    appendCells(row, [
      cell('statement-card-label', FIGURE_LABELS[figure.which]),
      cell('statement-card-sign', FIGURE_SIGNS[figure.which]),
      amount,
    ])
    card.append(row)
  }
  return card
}

/**
 * One cell of a column header: its word, and the name of the column it heads, so
 * a reader finds a column without reading any styling.
 */
const renderHeadCell = (column: HeadColumn): HTMLElement => {
  const made = cell('statement-head-cell', column.word)
  made.dataset.statementColumn = column.name
  return made
}

/** The cells every row of either list opens with: its place and its day. */
const renderLine = (row: StatementRow): HTMLElement => {
  const line = element('li', 'statement-row')
  line.dataset.statementRow = row.entryId
  line.dataset.no = String(row.no)
  return line
}

/** The person paid, with the stored method under their name where one is stored. */
const renderParty = (row: StatementRow): HTMLElement => {
  const party = element('div', 'statement-party')
  const person = cell('statement-person', row.personName)
  // The person's own id stays on the part naming the person, as Home carries it.
  person.dataset.person = row.personId ?? ''
  const partyCells: Node[] = [person]
  if (row.subline !== null) {
    const sub = cell('statement-sub', row.subline)
    sub.dataset.statementSub = ''
    partyCells.push(sub)
  }
  appendCells(party, partyCells)
  return party
}

/**
 * The rufiyaa cell of one sent row: a rufiyaa send's own figure, and under it one
 * further reading of the rate it was sent at, the mark this screen draws and the
 * dollars that same send stores. A send made in dollars draws nothing at all
 * here, and the cell is still drawn: absence in a money column is carried by the
 * empty cell alone, because a mark standing for a missing figure reads in a money
 * column as a figure of its own.
 *
 * The three readings under the figure are appended TIGHT against each other,
 * unlike every other pair of cells on this screen: the gap the owner sees is the
 * board's own, so anything that reads this cell as text reads one figure and what
 * it came to rather than readings with typed spaces between them.
 *
 * The stored dollars carry the converted hook, so a reader finds what a rufiyaa
 * send was worth without parsing the cell; exactly one element of the row carries
 * it, because one function draws this cell.
 */
const renderMvrCell = (reading: StatementMvrCell): HTMLElement => {
  const mvr = element('span', 'statement-mvr')
  mvr.dataset.statementMvr = ''
  if (reading.currency === 'USD') return mvr
  mvr.append(cell('statement-mvr-figure', reading.figure))
  const detail = element('span', 'statement-mvr-detail')
  // The mark is drawn only inside the branch that reads a rate: a mark with
  // nothing before it would read as a reading of its own.
  if (reading.rateText !== null) {
    const rate = cell('statement-mvr-rate', reading.rateText)
    rate.dataset.statementRate = ''
    detail.append(rate, cell('statement-mvr-arrow', BECAME))
  }
  const converted = cell('statement-mvr-converted', reading.convertedText)
  converted.dataset.statementConverted = ''
  detail.append(converted)
  mvr.append(detail)
  return mvr
}

/**
 * What a sent row's dollar cell reads, and which of the two kinds of reading that
 * is: the dollars a dollar send moved, or the reading of the dollars a
 * rufiyaa send stores. Both are worded by the module that owns what a row says;
 * this only says which of the two this row stands for.
 */
const usdReadingOf = (row: StatementRow): { readonly text: string; readonly converted: boolean } =>
  row.mvrCell.currency === 'MVR'
    ? { text: '', converted: true }
    : { text: row.usdFigure, converted: false }

/**
 * The dollar cell of one sent row. It says on itself whether it reads a converted
 * figure, so a reader tells money that left from what a rufiyaa send was worth
 * without parsing the figure, and the board inks and weights the two from that
 * same reading.
 */
const renderUsdCell = (row: StatementRow): HTMLElement => {
  const reading = usdReadingOf(row)
  const usd = cell('statement-sent-usd', reading.text)
  usd.dataset.statementUsd = ''
  usd.dataset.converted = String(reading.converted)
  return usd
}

/** One sent row: its date, the person paid with the sub-line, and its two currency cells. */
const renderSentRow = (row: StatementRow): HTMLElement => {
  const line = renderLine(row)
  appendCells(line, [
    cell('statement-date', row.dateLabel),
    renderParty(row),
    renderMvrCell(row.mvrCell),
    renderUsdCell(row),
  ])
  return line
}

/**
 * One paid-back row across its three cells: its date, the way the money came
 * back, and the marked dollars that came back. A repayment names nobody, so it
 * carries no person and no sub-line: there is nothing stored on it to word there.
 *
 * Its figure is the same marked reading the sending list reads, worded by the
 * module that owns what a row says: the owner reads one screen, so a bare number
 * here beside a marked figure there would leave this list's currency unstated.
 *
 * The Method cell reads the word of the stored token and carries the token
 * itself, so a reader can check the word against the column it came from. A
 * repayment the ledger stores no method for - one saved before the column
 * existed, or stored with a token this app cannot name - reads as an empty cell
 * with no token on it, because nothing stored is nothing said.
 */
const renderBackRow = (row: StatementRow): HTMLElement => {
  const line = renderLine(row)
  const method = cell('statement-method', row.method?.word ?? '')
  if (row.method !== null) method.dataset.statementMethod = row.method.token
  appendCells(line, [
    cell('statement-date', row.dateLabel),
    method,
    cell('statement-usd', row.usdFigure),
  ])
  return line
}

/**
 * The block a list's footer stands in: named by the list it belongs to and
 * carrying what that list adds up to, so a reader reads the sum of a list
 * without reading its rows. Both footers stand in one of these, however many
 * lines they read inside it.
 */
const footBlock = (which: ShownList, count: number, cents: number): HTMLElement => {
  const foot = element('div', 'statement-foot')
  foot.dataset.statementFoot = which
  foot.dataset.count = String(count)
  foot.dataset.cents = String(cents)
  return foot
}

/** What stands at the left of a footer line: its own word, with its count beside it. */
const footLabel = (label: string, countLabel: string): string =>
  `${label} ${SEPARATOR} ${countLabel}`

/**
 * One figure of a sent footer line. It says on itself what it is a reading of -
 * the rufiyaa that went out, what those rufiyaa were worth, the dollars that
 * went out, the total of both - and the board inks it from that, so no ink here
 * is chosen by looking at a figure's text.
 *
 * The figure that reads what the rufiyaa were worth is handed its own detail
 * box, with this screen's mark drawn as a leaf of its own before it. Which
 * figure takes the mark is decided by what that figure says it reads and by
 * nothing about its text, so a figure of any other reading is the one span it
 * has always been, and no mark can reach the words the domain worded: the mark
 * is appended beside the figure, never into it.
 */
const renderFootFigure = (figure: SentFootFigure): HTMLElement => {
  const drawn = cell('statement-foot-figure', figure.text)
  drawn.dataset.reads = figure.reads
  if (figure.reads !== 'converted') return drawn
  const detail = element('span', 'statement-foot-detail')
  // Through appendCells, so the line reads '... MVR14,000 → $700.00' as one
  // sentence rather than running the mark into the figure behind it.
  appendCells(detail, [cell('statement-mvr-arrow', BECAME), drawn])
  return detail
}

/**
 * One line of the sent footer: its word with its count at the left, and the
 * figures of its own currency at the right. The line names which of the three it
 * is and carries the count and the cents of the sends it holds, so that line is
 * read without reading any styling and never through its neighbours.
 */
const renderFootLine = (line: SentFootLine): HTMLElement => {
  const drawn = element('div', 'statement-foot-line')
  drawn.dataset.statementFootLine = line.which
  drawn.dataset.count = String(line.count)
  drawn.dataset.cents = String(line.cents)
  const figures = element('span', 'statement-foot-figures')
  appendCells(figures, line.figures.map(renderFootFigure))
  appendCells(drawn, [cell('statement-foot-label', footLabel(line.label, line.countLabel)), figures])
  return drawn
}

/**
 * The sending list's own footer: its three lines in one block, the total last.
 *
 * All three are drawn at every ledger because the footer is handed three, and
 * the block itself still reads the total line's count and cents: a reader that
 * knew only the one line this footer used to be is still told how many sends
 * there were and how much they were worth.
 */
const renderSentFoot: FootRenderer<SentFoot> = (lines) => {
  const [, , totalLine] = lines
  const foot = footBlock('sent', totalLine.count, totalLine.cents)
  appendCells(foot, lines.map(renderFootLine))
  return foot
}

/**
 * The paid-back list's own footer: its one line on its own tinted bed, its word
 * for its total with its count beside it, and then the total. Only the sending
 * side reads a currency split, so this footer stands as it always has.
 */
const renderBackFoot: FootRenderer<StatementList> = (list) => {
  const foot = footBlock('back', list.count, list.totalCents)
  appendCells(foot, [
    cell('statement-foot-label', footLabel(BACK_TOTAL_LABEL, list.countLabel)),
    cell('statement-foot-total', list.totalText),
  ])
  return foot
}

/**
 * One panel and the parts of it that rise when it arrives, in the order they are
 * read: its rows from the oldest down, and then its total.
 */
type PanelParts = {
  readonly panel: HTMLElement
  readonly rows: readonly HTMLElement[]
  readonly foot: HTMLElement
}

/**
 * One panel of the statement: its column header, its scrolling rows and its
 * footer. The header and the footer stand OUTSIDE the scrolling area, which is
 * what keeps the column words and the total in sight while the rows are read.
 *
 * The list it draws is taken as an argument because the two panels of this
 * screen differ in nothing but which list they are, the words of their header
 * and the shape of the rows and the footer handed to them. The panel places a
 * footer and reads none of it: what a footer says is its own list's.
 */
const renderPanel = <Reading,>({
  which,
  columns,
  list,
  row: renderOneRow,
  foot: renderOwnFoot,
  footReading,
}: Panel<Reading>): PanelParts => {
  const panel = element('section', 'statement-panel')
  panel.dataset.statementList = which
  panel.id = panelId(which)
  // The panel of the pill's own tab, named so a reader of either is told which
  // list it is.
  panel.setAttribute('role', 'tabpanel')
  panel.setAttribute('aria-label', LIST_NAMES[which])

  const head = element('div', 'statement-head-row')
  head.dataset.statementHead = which
  appendCells(head, columns.map(renderHeadCell))

  const rows = element('ul', 'statement-rows')
  rows.dataset.statementRows = which
  const lines = list.rows.map((row) => renderOneRow(row))
  rows.append(...lines)

  const foot = renderOwnFoot(footReading)

  panel.append(head, rows, foot)
  return { panel, rows: lines, foot }
}

/**
 * One tab of the pill: a button carrying the name of its list and saying, with
 * aria-selected, whether that list is the one being read.
 */
const renderListTab = (which: ShownList): HTMLButtonElement => {
  const tab = element('button', 'statement-tab')
  tab.type = 'button'
  tab.setAttribute('role', 'tab')
  // The panel this tab is the way into, so a reader moved to the tab is told
  // which list it opens.
  tab.setAttribute('aria-controls', panelId(which))
  tab.dataset.statementTab = which
  tab.textContent = LIST_NAMES[which]
  return tab
}

/**
 * The segmented pill the owner switches lists with: its thumb, then its two
 * tabs over it.
 *
 * The thumb says nothing a reader needs - the tab it lies under already says it
 * with aria-selected - so it is hidden from anything that reads the page aloud.
 * Where it rests and what colour it takes are drawn from the shown attribute
 * alone, so the value that adds motion adds transitions over these same states
 * and reworks nothing.
 */
const renderStatementPill = (
  tabs: readonly HTMLButtonElement[],
): { pill: HTMLElement; thumb: HTMLElement } => {
  const pill = element('div', 'statement-pill')
  pill.setAttribute('role', 'tablist')
  pill.setAttribute('aria-label', 'Statement lists')
  const thumb = element('span', 'statement-thumb')
  thumb.setAttribute('aria-hidden', 'true')
  // The thumb first, so it lies behind the words it rests under.
  pill.append(thumb, ...tabs)
  return { pill, thumb }
}

/**
 * The whole of the state a switch leaves: the one attribute that names the shown
 * list, and the two tabs that say which is being read. Nothing is read,
 * re-rendered or unmounted - both panels and every row of both stay as they were
 * built, so the figures cannot change under the tap and no scroll offset is
 * thrown away.
 */
const showList = (
  statement: HTMLElement,
  tabs: Readonly<Record<ShownList, HTMLButtonElement>>,
  list: ShownList,
): void => {
  statement.dataset.statementShown = list
  for (const which of LISTS) {
    tabs[which].setAttribute('aria-selected', String(which === list))
  }
}

/** Which list is being read, which is the whole of this screen's own state. */
const shownList = (statement: HTMLElement): ShownList =>
  statement.dataset.statementShown === 'back' ? 'back' : 'sent'

/** The parts of an arriving list, in the order they are read, from this place on. */
const listRiseParts = (list: PanelParts, from: number): readonly SwitchPart[] => [
  ...list.rows.map((row, index) => ({ element: row, kind: 'switch-row' as const, index: from + index })),
  { element: list.foot, kind: 'switch-foot' as const, index: from + list.rows.length },
]

/** What the whole screen is assembled from: the card first, then the pill and the shown list. */
const screenRiseParts = (
  furniture: { readonly card: HTMLElement; readonly pill: HTMLElement },
  list: PanelParts,
): readonly SwitchPart[] => [
  { element: furniture.card, kind: 'switch-card' as const, index: 0 },
  { element: furniture.pill, kind: 'switch-pill' as const, index: 1 },
  ...listRiseParts(list, 2),
]

/**
 * The statement of this read ledger.
 *
 * A read that FAILED shows the port's own message, spoken, and no figure and no
 * row at all: $0.00 figures over an empty list would read as a ledger with
 * nothing in it, which is a different and false statement about the owner's
 * money. An empty ledger, by contrast, shows the whole screen - the card at
 * zero, the column words, and a footer saying so in words.
 */
export const renderStatement = (ledger: ReadEntriesOutcome): HTMLElement => {
  const screen = document.createElement('section')
  screen.dataset.screen = 'statement'
  screen.className = 'screen statement'

  if (ledger.outcome === 'retry') {
    const notice = element('p', 'statement-notice')
    notice.setAttribute('role', 'alert')
    notice.textContent = ledger.message
    screen.append(notice)
    return screen
  }

  const statement = statementOf(ledger.entries)
  const card = renderCard(statement.figures)
  screen.append(card)

  const tabs: Readonly<Record<ShownList, HTMLButtonElement>> = {
    sent: renderListTab('sent'),
    back: renderListTab('back'),
  }
  const { pill, thumb } = renderStatementPill(LISTS.map((which) => tabs[which]))
  screen.append(pill)

  // Both panels stand in one area, each filling it, so a switch moves no pinned
  // part of the screen and the list not being read waits off the phone.
  const panels: Readonly<Record<ShownList, PanelParts>> = {
    sent: renderPanel({
      which: 'sent',
      columns: SENT_COLUMNS,
      list: statement.sent,
      row: renderSentRow,
      foot: renderSentFoot,
      footReading: statement.sentFoot,
    }),
    back: renderPanel({
      which: 'back',
      columns: BACK_COLUMNS,
      list: statement.back,
      row: renderBackRow,
      foot: renderBackFoot,
      footReading: statement.back,
    }),
  }
  const area = element('div', 'statement-lists')
  area.append(panels.sent.panel, panels.back.panel)
  screen.append(area)

  /**
   * The pill switch, drawn as one movement: the slide is declared on the area and
   * the thumb BEFORE the state changes, because a transition travels only over a
   * state the stylesheet was already timing when it changed, and then the
   * arriving list raises its own rows and its total. The balance card is no part
   * of it, so it does not move at all.
   *
   * A tap on the list already being read switches nothing, so it draws nothing.
   */
  const switchList = (which: ShownList): void => {
    if (shownList(screen) === which) return
    slideLists(area, thumb)
    showList(screen, tabs, which)
    riseParts(panels[which].panel, listRiseParts(panels[which], 0), 'list-enter')
  }
  for (const which of LISTS) {
    tabs[which].addEventListener('click', () => switchList(which))
  }

  // The whole screen arriving, which only the shell knows the moment of: the
  // card, the pill and then the shown list's own rows and total.
  screen.addEventListener(VIEW_SHOWN, () => {
    riseParts(
      screen,
      screenRiseParts({ card, pill }, panels[shownList(screen)]),
      'view-enter',
    )
  })

  // The Statement opens on what the owner sent every time it is built, so a
  // switch is never carried across a paint.
  showList(screen, tabs, 'sent')
  return screen
}
