// The Statement screen: a function from the read ledger to one screen, as every
// screen in this app is.
//
// It decides nothing about money, order or wording. Every figure, date, count
// and sub-line it draws is read off src/domain/statement.ts; what this module
// owns is the board's own furniture - the heading, the four column words, the
// shape of the card and the panel - and the hooks a reader finds them by.
//
// It is READ-ONLY by construction: it is handed a read outcome and nothing that
// writes, so there is no operation within its reach that could change the money
// it reports. It draws no balance box and no Send or Receive control either, so
// the one screen that only reports offers nothing that records.
//
// The hooks, which every later value keeps:
//   - the screen carries data-screen="statement"
//   - each card figure carries data-statement-total="sent|paid|balance" with
//     data-cents, and holds the figure and nothing else
//   - the screen carries data-statement-shown="sent|back", which is the whole
//     of the state the pill switches
//   - each panel is the tabpanel of its own tab and carries
//     data-statement-list="sent|back", its header
//     data-statement-head, its scrolling rows data-statement-rows and its
//     footer data-statement-foot with data-count and data-cents, each named by
//     the list it belongs to
//   - each row carries data-statement-row="<entry id>" and data-no="<number>";
//     a send names its person on data-person and its sub-line on
//     data-statement-sub, and a repayment names its stored method token on
//     data-statement-method when one is stored
//
// They are prefixed data-statement- because both panes stand in the one page at
// once: a bare data-total would answer for Home's totals as well.

import {
  SEPARATOR,
  statementOf,
  type StatementFigure,
  type StatementFigureName,
  type StatementList,
  type StatementRow,
} from '../domain/statement.js'
import type { ReadEntriesOutcome } from '../ports/ledger-store.js'

/** The board's own minus, in the middle column of the Paid Back row. */
const MINUS = '−'

/** What the card calls each of its three figures. */
const FIGURE_LABELS: Readonly<Record<StatementFigureName, string>> = {
  sent: 'Total Sent',
  paid: 'Paid Back',
  balance: 'Balance',
}

/** The sign that stands before a figure: only a repayment takes one off. */
const FIGURE_SIGNS: Readonly<Record<StatementFigureName, string>> = {
  sent: '',
  paid: MINUS,
  balance: '',
}

/** The four words that make the four cells of a sent row readable. */
const SENT_COLUMNS = ['No.', 'Date', 'Paid to', 'USD'] as const

/** The same four cells of a repayment, which names a way and not a person. */
const BACK_COLUMNS = ['No.', 'Date', 'Method', 'USD'] as const

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

/** What each list's footer calls its own total. */
const TOTAL_LABELS: Readonly<Record<ShownList, string>> = {
  sent: 'Total sent',
  back: 'Total paid back',
}

/**
 * One panel of this screen, which is all a panel needs to be drawn: the two
 * panels differ in their name, their column words, their total's word and the
 * rows handed to them, and in nothing else.
 */
type Panel = {
  readonly which: ShownList
  readonly columns: readonly string[]
  readonly list: StatementList
  /** How one of its rows is read across: a send names a person, a repayment a way. */
  readonly row: (row: StatementRow) => HTMLElement
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

/** The heading and, unless the read failed, the period it covers. */
const renderHeading = (period: string | null): HTMLElement => {
  const heading = element('header', 'statement-heading')
  const title = element('h1', 'statement-title')
  title.textContent = 'Statement'
  heading.append(title)
  if (period !== null) {
    const line = element('p', 'statement-period')
    line.textContent = period
    heading.append(line)
  }
  return heading
}

/**
 * The mint balance card: Total Sent, Paid Back with its minus, a divider, and
 * the Balance in the large type the board draws. The figure itself carries the
 * hook and the cents, so what a reader reads there is the figure alone.
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

/** The cells every row of either list opens with: its place and its day. */
const renderLine = (row: StatementRow): HTMLElement => {
  const line = element('li', 'statement-row')
  line.dataset.statementRow = row.entryId
  line.dataset.no = String(row.no)
  return line
}

/** One sent row: its number, its date, the person paid with the sub-line, its dollars. */
const renderSentRow = (row: StatementRow): HTMLElement => {
  const line = renderLine(row)

  const party = element('div', 'statement-party')
  const person = cell('statement-person', row.personName)
  // The person's own id stays on the element naming the person, as Home carries it.
  person.dataset.person = row.personId ?? ''
  const partyCells: Node[] = [person]
  if (row.subline !== null) {
    const sub = cell('statement-sub', row.subline)
    sub.dataset.statementSub = ''
    partyCells.push(sub)
  }
  appendCells(party, partyCells)

  appendCells(line, [
    cell('statement-no', String(row.no)),
    cell('statement-date', row.dateLabel),
    party,
    cell('statement-usd', row.usdText),
  ])
  return line
}

/**
 * One paid-back row: its number, its date, the way the money came back, its
 * dollars. A repayment names nobody, so it carries no person and no sub-line:
 * there is nothing stored on it to word there.
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
    cell('statement-no', String(row.no)),
    cell('statement-date', row.dateLabel),
    method,
    cell('statement-usd', row.usdText),
  ])
  return line
}

/**
 * One panel of the statement: its column header, its scrolling rows and its
 * footer. The header and the footer stand OUTSIDE the scrolling area, which is
 * what keeps the column words and the total in sight while the rows are read.
 *
 * The list it draws is taken as an argument because the two panels of this
 * screen differ in nothing but which list they are, the words of their header
 * and the shape of the rows handed to them.
 */
const renderPanel = ({ which, columns, list, row: renderOneRow }: Panel): HTMLElement => {
  const panel = element('section', 'statement-panel')
  panel.dataset.statementList = which
  panel.id = panelId(which)
  // The panel of the pill's own tab, named so a reader of either is told which
  // list it is.
  panel.setAttribute('role', 'tabpanel')
  panel.setAttribute('aria-label', LIST_NAMES[which])

  const head = element('div', 'statement-head-row')
  head.dataset.statementHead = which
  appendCells(
    head,
    columns.map((word) => cell('statement-head-cell', word)),
  )

  const rows = element('ul', 'statement-rows')
  rows.dataset.statementRows = which
  for (const row of list.rows) rows.append(renderOneRow(row))

  const foot = element('div', 'statement-foot')
  foot.dataset.statementFoot = which
  foot.dataset.count = String(list.count)
  foot.dataset.cents = String(list.totalCents)
  appendCells(foot, [
    cell('statement-foot-label', `${TOTAL_LABELS[which]} ${SEPARATOR} ${list.countLabel}`),
    cell('statement-foot-total', list.totalText),
  ])

  panel.append(head, rows, foot)
  return panel
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
const renderStatementPill = (tabs: readonly HTMLButtonElement[]): HTMLElement => {
  const pill = element('div', 'statement-pill')
  pill.setAttribute('role', 'tablist')
  pill.setAttribute('aria-label', 'Statement lists')
  const thumb = element('span', 'statement-thumb')
  thumb.setAttribute('aria-hidden', 'true')
  // The thumb first, so it lies behind the words it rests under.
  pill.append(thumb, ...tabs)
  return pill
}

/**
 * The whole of a switch: the one attribute that names the shown list, and the
 * two tabs that say which is being read. Nothing is read, re-rendered or
 * unmounted - both panels and every row of both stay as they were built, so the
 * figures cannot change under the tap and no scroll offset is thrown away.
 */
const switchList = (statement: HTMLElement, list: ShownList): void => {
  statement.dataset.statementShown = list
  for (const which of LISTS) {
    const tab = statement.querySelector(`[data-statement-tab="${which}"]`)
    tab?.setAttribute('aria-selected', String(which === list))
  }
}

/**
 * The statement of this read ledger.
 *
 * A read that FAILED shows the port's own message, spoken, and no figure and no
 * row at all: $0.00 figures over an empty list would read as a ledger with
 * nothing in it, which is a different and false statement about the owner's
 * money. An empty ledger, by contrast, shows the whole screen - the card at
 * zero, the header, and a footer saying so in words.
 */
export const renderStatement = (ledger: ReadEntriesOutcome): HTMLElement => {
  const screen = document.createElement('section')
  screen.dataset.screen = 'statement'
  screen.className = 'screen statement'

  if (ledger.outcome === 'retry') {
    screen.append(renderHeading(null))
    const notice = element('p', 'statement-notice')
    notice.setAttribute('role', 'alert')
    notice.textContent = ledger.message
    screen.append(notice)
    return screen
  }

  const statement = statementOf(ledger.entries)
  screen.append(renderHeading(statement.period))
  screen.append(renderCard(statement.figures))

  const tabs: Readonly<Record<ShownList, HTMLButtonElement>> = {
    sent: renderListTab('sent'),
    back: renderListTab('back'),
  }
  screen.append(renderStatementPill(LISTS.map((which) => tabs[which])))

  // Both panels stand in one area, each filling it, so a switch moves no pinned
  // part of the screen and the list not being read waits off the phone.
  const lists = element('div', 'statement-lists')
  lists.append(
    renderPanel({ which: 'sent', columns: SENT_COLUMNS, list: statement.sent, row: renderSentRow }),
    renderPanel({ which: 'back', columns: BACK_COLUMNS, list: statement.back, row: renderBackRow }),
  )
  screen.append(lists)

  for (const which of LISTS) {
    tabs[which].addEventListener('click', () => switchList(screen, which))
  }
  // The Statement opens on what the owner sent every time it is built, so a
  // switch is never carried across a paint.
  switchList(screen, 'sent')
  return screen
}
