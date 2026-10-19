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
//   - the panel carries data-statement-list="sent", its header
//     data-statement-head="sent", its scrolling rows data-statement-rows="sent"
//     and its footer data-statement-foot="sent" with data-count and data-cents
//   - each row carries data-statement-row="<entry id>" and data-no="<number>",
//     names its person on data-person and its sub-line on data-statement-sub
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

/**
 * One panel of this screen, which is all a panel needs to be drawn: the two
 * panels differ in their name, their column words, their total's word and the
 * rows handed to them, and in nothing else.
 */
type Panel = {
  readonly which: 'sent' | 'back'
  /** What the region is called: 'Sent for Abbaas'. */
  readonly label: string
  readonly columns: readonly string[]
  /** What its footer calls its own total: 'Total sent'. */
  readonly totalLabel: string
  readonly list: StatementList
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

/** One row: its number, its date, the person paid with the sub-line, its dollars. */
const renderRow = (row: StatementRow): HTMLElement => {
  const line = element('li', 'statement-row')
  line.dataset.statementRow = row.entryId
  line.dataset.no = String(row.no)

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
 * One panel of the statement: its column header, its scrolling rows and its
 * footer. The header and the footer stand OUTSIDE the scrolling area, which is
 * what keeps the column words and the total in sight while the rows are read.
 *
 * The list's name is taken as an argument because the two panels of this screen
 * differ in nothing but their name, their words and the rows handed to them.
 */
const renderPanel = ({ which, label, columns, totalLabel, list }: Panel): HTMLElement => {
  const panel = element('section', 'statement-panel')
  panel.dataset.statementList = which
  panel.setAttribute('role', 'region')
  panel.setAttribute('aria-label', label)

  const head = element('div', 'statement-head-row')
  head.dataset.statementHead = which
  appendCells(
    head,
    columns.map((word) => cell('statement-head-cell', word)),
  )

  const rows = element('ul', 'statement-rows')
  rows.dataset.statementRows = which
  for (const row of list.rows) rows.append(renderRow(row))

  const foot = element('div', 'statement-foot')
  foot.dataset.statementFoot = which
  foot.dataset.count = String(list.count)
  foot.dataset.cents = String(list.totalCents)
  appendCells(foot, [
    cell('statement-foot-label', `${totalLabel} ${SEPARATOR} ${list.countLabel}`),
    cell('statement-foot-total', list.totalText),
  ])

  panel.append(head, rows, foot)
  return panel
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
  screen.append(
    renderPanel({
      which: 'sent',
      label: 'Sent for Abbaas',
      columns: SENT_COLUMNS,
      totalLabel: 'Total sent',
      list: statement.sent,
    }),
  )
  return screen
}
