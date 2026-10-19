# Product brief

## Request
    Build the Statement view in the Abbaas Ledger at /Users/Yuki/Claude/abbaas-ledger, on base commit 16a5e1f, exactly as the design board https://claude.ai/artifact/7XuZXfpMUNa85Q6Crbgcf8 (version 13) draws it: a bottom navigation bar 84 px high with the two tabs Entries and Statement, the Entries tab keeping today's Home unchanged, and a read-only Statement tab that shows the mint balance card with Total Sent, Paid Back and Balance, a segmented pill that switches between the Sent for Abbaas and Paid back by Abbaas lists, a pinned layout in which only the rows scroll, and the board's motion for every switch. The design is final and approved; this Request records it as confirmed decisions and does not reopen it.

## Outcomes
-     The owner opens the Statement tab from the bottom bar and reads, on one phone screen, the total sent for Abbaas, the total Abbaas paid back, and the balance between the two of them, in USD.
-     The owner reads every send as a numbered row with its date, the person the owner paid, the method and the USD figure, and a footer that names the number of entries and the total.
-     The owner switches to the paid-back list with one tap and reads every repayment as a numbered row with its date, its method and its USD figure, with its own footer total.
-     The owner keeps the figures on screen while reading the rows: the balance card, the pill and each list's column header and footer stay in place while only the rows scroll, and the page itself never scrolls.
-     The owner follows the change from one screen to the next, because the panes and the lists slide and the new rows rise one after another; a phone that asks for reduced motion shows the same screens with no transition at all.
-     The owner keeps today's Home: the Entries tab shows the same You and Abbaas boxes, received lines, day-grouped cards and Send and Receive buttons as before.

## Scope

### In scope
-     A bottom navigation bar, 84 px high, white, with a 1 px top border #dfe6e4, holding the two tabs Entries and Statement; a mint pill #e0f0ed, 56 by 30 px, radius 999 px, lies under the active tab; the active tab's ink is #0b5750 and the inactive tab's is #4c5f5b; the active tab carries aria-current=page and the other aria-current=false; the bar is labelled Views.
-     The Entries tab: today's Home, unchanged in behaviour, wording and public hooks.
-     The Statement tab: a read-only screen with no You or Abbaas box, no Send or Receive button, and no control that writes anything.
-     The Statement pane starts with the balance card: nothing is drawn above it, and the pane itself carries the accessible name Statement so a screen reader still names the view.
-     The balance card: background #e0f0ed, radius 24 px, padding 14 px 16 px 16 px, rows laid out on the grid minmax(0, 1fr) 14px 120px with tabular figures, holding 'Total Sent' with its figure in #24508a, 'Paid Back' with a '−' in the middle column and its figure in #0f6f68, a 1 px divider #c9e4df, and 'Balance' in Manrope 800 at 15 px with its figure in Manrope 800 at 22 px, both in #0b5750.
-     The segmented pill: a tablist named 'Statement lists', 44 px high, background #e3e9e7, radius 14 px, padding 4 px, with the two tabs 'Sent for Abbaas' and 'Paid back by Abbaas'; the thumb is radius 10 px and its colour is #24508a on the sent list and #0f6f68 on the paid-back list; the selected tab's ink is #ffffff and the other's #4c5f5b.
-     The Sent for Abbaas list: a white panel with radius 18 px, the column header 'No. · Date · Paid to · USD' on the grid 22px 44px minmax(0, 1fr) 70px, one row for each send with its number, its date, the person paid with a sub-line under the name, and its USD figure in #24508a, alternating row tints #ffffff and #fafcfb, and the footer 'Total sent · N entries' with the total, on #e7eef7 in #1b3f6e.
-     The sub-line of a send: the method first, then the rufiyaa figure and its rate when the entry was made in MVR; 'Transfer · MVR 17,000 @ 20' for an MVR entry and 'Transfer' for a USD one.
-     The Paid back by Abbaas list: the same panel and grid with the column header 'No. · Date · Method · USD', one row for each repayment with its number, its date, its method and its USD figure in #0f6f68, and the footer 'Total paid back · N entries' with the total, on #e0f0ed in #0b5750.
-     The pinned layout: the balance card, the pill and each list's column header and footer never move; only the rows scroll, inside an overflow-y: auto area in a flex: 1, min-height: 0 container; the page itself never scrolls at any list length.
-     The motion of the app's own motion.ts model: SLIDE 420 ms, RISE 360 ms, curve cubic-bezier(0.2, 0.8, 0.2, 1); the navigation pill and the two panes slide together and the leaving pane fades to 0.4; the pill thumb slides the two lists the same way and turns from blue to teal; the arriving parts rise in the order balance card, pill, rows, footer, the card at 120 ms and each later part 22 ms after the one before it, to a limit of 14 steps; prefers-reduced-motion turns every transition off.
-     The palette and type of the board: ground #f4f7f6, ink #0d1f1c, muted #4c5f5b, blue card #e1e6ef with tint #e7eef7, teal card #dbe8e6, Manrope 700 and 800 for headings and figures, Source Sans 3 for body text.
-     The Statement's own public hooks, so an acceptance test can judge it without reading its styling, and the survival of every public hook Home already carries.

### Out of scope
Applicability: applicable
Reason:     The human named these exclusions in the Request, and the board holds rejected concepts that must not be built.
-     A heading and a period line at the top of the Statement, which the human removed after the phone check.
-     A dark theme, including the board's dark balance-card branch.
-     The board's rejected balance-card concepts HeroTiles, HeroBar and HeroBox; only the box branch of Statement.dc.html is the approved card.
-     Any change to the Send form, the Receive form or the entry sheet.
-     Any change to storage, the database schema or the cloud project.
-     A way to open an entry's sheet from a Statement row; the Statement is read-only in this Request.
-     Sorting, filtering, searching or a date range the owner can choose.
-     Export of the Statement in any form.
-     The open odds and ends: placeholder payment dates, old branches, the Supabase signup setting and the Excel copy.

## Jobs to be done

### Human
- [confirmed] When I want to know where I stand with Abbaas, I want to read the total I sent, the total Abbaas paid back and the balance between us on one screen, so I can see the whole account without adding anything up myself.
- [confirmed] When I want to check one payment I made for Abbaas, I want to read every send as a numbered row with its date, the person I paid, the method and the USD figure, so I can find that payment and name it.
- [confirmed] When I look at the two sides of the account, I want to switch between what I sent and what Abbaas paid back with one tap, so I can compare them without losing the totals from view.
- [confirmed] When I open the Statement on my phone, I want the figures first, so I do not spend a line of the screen on a title that tells me what I already tapped.

### LLM
- [proposed] When I talk to Abbaas about the money, I want the figures to stay in view while I read the rows, so I can answer a question about one entry and the total in the same breath.
- [proposed] When I keep this record instead of a spreadsheet, I want the app's own figures to agree with what I entered, so I can trust the app as the record.

## User journey

| Step | Human emotion | Status |
| --- | --- | --- |
| The owner opens the app and lands on the Entries tab, which is today's Home. | not explored | confirmed |
| The owner taps Statement in the bottom bar. The pill slides under it and the panes slide together. | not explored | confirmed |
| The owner reads the balance card at the top of the screen: the total sent, the total paid back and the balance. | not explored | confirmed |
| The owner reads the Sent for Abbaas list and scrolls the rows. The card, the pill, the column header and the footer stay in place. | not explored | confirmed |
| The owner taps 'Paid back by Abbaas'. The thumb turns teal, the lists slide and the new rows rise. | not explored | confirmed |
| The owner reads the repayments and their footer total, then taps back to the sent list to compare the two. | not explored | confirmed |
| The owner taps Entries and returns to Home to record a new entry. | not explored | proposed |

Qualitative journey arc (stated emotions; NOT measured intensity)
```text
[confirmed] 1. The owner opens the app and lands on the Entries tab, which is today's Home.
    emotion: UNKNOWN (not explored)
    |
    v
[confirmed] 2. The owner taps Statement in the bottom bar. The pill slides under it and the panes slide together.
    emotion: UNKNOWN (not explored)
    |
    v
[confirmed] 3. The owner reads the balance card at the top of the screen: the total sent, the total paid back and the balance.
    emotion: UNKNOWN (not explored)
    |
    v
[confirmed] 4. The owner reads the Sent for Abbaas list and scrolls the rows. The card, the pill, the column header and the footer stay in place.
    emotion: UNKNOWN (not explored)
    |
    v
[confirmed] 5. The owner taps 'Paid back by Abbaas'. The thumb turns teal, the lists slide and the new rows rise.
    emotion: UNKNOWN (not explored)
    |
    v
[confirmed] 6. The owner reads the repayments and their footer total, then taps back to the sent list to compare the two.
    emotion: UNKNOWN (not explored)
    |
    v
[proposed] 7. The owner taps Entries and returns to Home to record a new entry.
    emotion: UNKNOWN (not explored)
```

## Gherkin scenarios

### The owner reads the account totals at the top of the Statement tab (confirmed)
```gherkin
Given the ledger holds sends and repayments in USD and in MVR
And the owner is on the Entries tab
When the owner taps Statement in the bottom navigation bar
Then the Statement tab is the current one and the mint pill lies under it
And the balance card is the first thing in the pane and reads the total sent, the total paid back with a minus sign, and the balance
And no heading and no period line is drawn above the card
And the pane is still named Statement
And the screen shows no You or Abbaas box and no Send or Receive button
```

### The owner finds one send in the sent list (confirmed)
```gherkin
Given the ledger holds a USD send by transfer and an MVR send of 17,000 at the rate 20
When the owner opens the Statement tab
Then the sent list is headed 'No. · Date · Paid to · USD'
And the rows run oldest first and are numbered 1 upward
And the MVR send reads the sub-line 'Transfer · MVR 17,000 @ 20' under the person paid
And the USD send reads the sub-line 'Transfer'
And the footer reads 'Total sent · 2 entries' with the total of the two USD figures
```

### The owner switches to the repayments and back (confirmed)
```gherkin
Given the owner is on the Statement tab reading the sent list
When the owner taps 'Paid back by Abbaas'
Then that tab is selected and the pill thumb is teal
And the list is headed 'No. · Date · Method · USD' and reads one row for each repayment
And the footer reads 'Total paid back · N entries' with the total
And the balance card has not moved
When the owner taps 'Sent for Abbaas'
Then the sent list is shown again with its own footer
```

### Only the rows scroll (confirmed)
```gherkin
Given the ledger holds more rows than one screen can show
When the owner opens the Statement tab and scrolls the rows to the end
Then the balance card, the pill, the column header and the footer are still in the same place
And the page itself has not scrolled
```

### An entry with no stored method says nothing in its place (confirmed)
```gherkin
Given the ledger holds a USD send with no stored method and a repayment with no stored method
When the owner opens the Statement tab
Then that send's row is a single line with no sub-line and reads none of the words Cash, Cheque or Transfer
When the owner taps 'Paid back by Abbaas'
Then that repayment's Method cell is empty and reads none of the three words
```

### An empty ledger reads as an empty statement (confirmed)
```gherkin
Given the account holds no entries
When the owner opens the Statement tab
Then the balance card is the first thing in the pane and reads $0.00 for the total sent, the total paid back and the balance
And the sent list shows its column header, no rows, and the footer 'Total sent · No entries' with $0.00
```

### The arriving Statement rises from the card downward (confirmed)
```gherkin
Given the owner is on the Entries tab
When the owner taps Statement
Then the panes slide together over 420 ms and the leaving pane fades to 0.4
And the balance card rises first, then the pill, then the rows, then the footer
And each part starts 22 ms after the one before it, the card at 120 ms
```

### A phone that asks for reduced motion shows the same screens at once (confirmed)
```gherkin
Given the phone asks for reduced motion
When the owner taps Statement and then taps 'Paid back by Abbaas'
Then each end screen is shown at once with no transition
And every figure, row and footer reads the same as on a phone that allows motion
```

## Quint scenarios

_Not run: no Quint model was executed for this brief._

## Observations
-     On a 360 px wide phone the app shows a bottom navigation bar 84 px high with the two tabs Entries and Statement; the mint pill lies under the active tab and that tab carries aria-current=page. The Entries tab shows today's Home, unchanged. A tap on Statement shows a read-only Statement screen that starts at the mint balance card: nothing is drawn above the card, and the card reads Total Sent in blue, Paid Back with a '−' in teal, a divider, and the Balance in large teal type. The pane is still named Statement for a screen reader. Under the card the Sent for Abbaas list reads the column header 'No. · Date · Paid to · USD', one numbered row for each send oldest first with its date, the person paid, a sub-line reading the method first and then the rufiyaa figure and rate for an MVR entry, and its USD figure, and the footer 'Total sent · 17 entries' with the total. The Statement shows no You or Abbaas box and no Send or Receive button. Only the rows scroll: the balance card and the list's column header and footer stay in place, and the page itself never scrolls. An empty ledger shows the same screen with $0.00 figures, no rows and the footer 'Total sent · No entries'.
-     On the Statement screen a segmented pill named 'Statement lists' sits under the balance card and offers the two tabs 'Sent for Abbaas' and 'Paid back by Abbaas'. The sent tab is selected when the Statement opens and the pill's thumb is blue under it. A tap on 'Paid back by Abbaas' selects that tab, turns the thumb teal, and shows the paid-back list with the column header 'No. · Date · Method · USD', one numbered row for each repayment oldest first with its date, its stored method and its USD figure in teal, and the footer 'Total paid back · 6 entries' with the total; a repayment with no stored method leaves its Method cell empty. A tap back on 'Sent for Abbaas' shows the sent list again. The balance card and the pill stay in place through both switches, each list's column header and footer stay in place, and only the rows of the shown list scroll.
-     Every switch is drawn as one movement. A tap on a navigation tab slides the mint pill and the two panes together over 420 ms on the curve cubic-bezier(0.2, 0.8, 0.2, 1), fades the leaving pane to 0.4, and raises the arriving Statement's parts one after another over 360 ms in the order balance card, pill, rows, footer, the card starting at 120 ms and each later part 22 ms after the one before it, to a limit of 14 steps. A tap on the pill slides the two lists the same way, turns the thumb from blue to teal, and raises the arriving list's rows and footer in the same order, while the balance card does not move at all. On a phone that asks for reduced motion the same taps show the same end screens at once, with no transition.

## Decisions
-     Confirmed by the human on 2026-10-19 after the phone check: the Statement has no heading and no sub-heading. The screen starts right at the summary balance card, so no 'Statement' title and no 'You and Abbaas · <first date> – <last date> · in USD' line is drawn at all. The pane keeps the accessible name Statement, so a screen reader still names the view and the navigation tab still reads Statement.
-     Confirmed by the human: the design board version 13 is final and approved, and the app must match it, except where the human corrects it after a phone check, as above. The board is the authority for every colour, size, word and timing named here; nothing else in it is reopened.
-     Confirmed by the human: before integration the human checks the result on their own phone, and integration happens only with the human's approval.
-     Confirmed: the Statement is read-only. It holds no You or Abbaas box, no Send or Receive button and no control that writes, so a tap on the Statement tab can never change the ledger.
-     Confirmed: every public data-* hook, role and accessible name Home renders at 16a5e1f stays unchanged on the Entries tab.
-     Confirmed: both panes live in one track 200 % wide that slides, as the board draws; the Entries pane keeps its own scrolling area and the Statement pane does not scroll as a whole.
-     Decision: the Statement reads the usdCents already stored on each entry and the totals balance.ts already computes (sentCents, paidBackCents, amountCents). It never converts rufiyaa again, so a row's USD figure on the Statement is the same figure Home and the entry sheet show.
-     Decision: the rows run oldest first and are numbered 1 upward in that order, as the board's script numbers them. Home stays newest first; the two orders answer two different questions and both are deliberate.
-     Decision: the USD column shows the figure without a currency sign, because the column is headed USD and the dates are in the rows. The balance card keeps its '$' as the board draws it.
-     Decision: a row's date reads as day and short month without a leading zero, for example '14 Sep', which is the board's own format. This is shorter than Home's 'Thu 8 Oct' because the Statement already groups nothing by day.
-     Confirmed by the human's text and the board: the rate in a send's sub-line is written with no trailing zeros, so a rate of 20 reads '@ 20', a rate of 15.4 reads '@ 15.4' and a rate of 15.425 reads '@ 15.425', with at most the four decimals the rate is stored to. The entry sheet keeps its own '20.00 MVR per $1' unchanged, because the sheet names the rate as a figure of its own and the sub-line only says which rate the rufiyaa figure was turned at.
-     Decision: a stored method is the first thing a send's sub-line says, as the human asked: 'Transfer · MVR 17,000 @ 20'. The words are the same three words Home already reads from the stored token: Cash, Cheque and Transfer.
-     Decision, edge case the board does not draw: an entry with no stored method says nothing in place of one, which is the rule Home already follows. A USD send with no method therefore has no sub-line at all and is a single line; an MVR send with no method reads 'MVR 17,000 @ 20' with no leading separator; a repayment with no method leaves its Method cell empty and carries no method hook. No word is invented for a missing method.
-     Decision, edge case the board does not draw: on an empty ledger the Statement still starts at the balance card and still shows both lists. The card reads $0.00, $0.00 and $0.00; each list shows its column header, no rows, and a footer that reads 'Total sent · No entries' or 'Total paid back · No entries' with $0.00.
-     Decision: a footer's count is worded by the repo's existing entryCountLabel, so it reads 'No entries', '1 entry' or '17 entries'. This matches the board's '17 entries' and answers the empty and single-row cases with one rule.
-     Decision: the Balance row shows its figure unsigned, as every figure in this app is shown. Which side holds the money is already read on Home; the Statement states the amount between the two people.
-     Decision: the Statement's own public hooks, in the pattern the repo already uses. The screen carries data-screen=statement. Each navigation tab carries data-view=entries or data-view=statement, and the active one carries aria-current=page. Each balance-card row carries data-statement-total=sent, data-statement-total=paid or data-statement-total=balance with data-cents=<cents>. The pill is a tablist named 'Statement lists' whose tabs are named 'Sent for Abbaas' and 'Paid back by Abbaas' and carry aria-selected. Each panel is a tabpanel with the same name and carries data-statement-list=sent or data-statement-list=back. Each row carries data-statement-row=<entry id> and data-no=<number>. A send's sub-line carries data-statement-sub when it has one. A repayment's method cell carries data-statement-method=<stored token> when a method is stored. Each footer carries data-statement-foot=sent or data-statement-foot=back with data-count and data-cents.
-     Decision: the Statement's hook names are prefixed data-statement-* because both panes are in the document at the same time; a bare data-total would then match Home's totals as well.
-     Decision on slicing: value 1 is this Request's walking skeleton for the Statement, and it extends the app's one existing end-to-end path (sign in, read the ledger, paint the DOM) rather than starting a second one. Value 1 shows the Sent list alone, with no pill, so the first value is whole and readable on a phone; value 2 adds the pill and the second list, which is when the board's end state is reached.
-     Supplied fact, for the human's own check and not for the oracle: on the live data today the Statement reads sent $29,011.00, paid back $24,000.00 and balance $5,011.00, over 23 entries, 17 sends and 6 repayments. These figures move as soon as a new entry is saved, so an acceptance test seeds its own entries and asserts on those.
-     Assumption: the Statement shows the whole ledger, every entry of the signed-in account, with no period the owner can choose. The board draws no such control and the Request names none.
-     Assumption: a failed ledger read on the Statement says so the way Home already does, with a spoken notice and no rows, so an empty ledger and a failed read never look alike.
-     Business motivation: not supplied by the human. The Request names the experience to build, not the benefit it buys.

## Values
| Observation | Dependencies |
| --- | --- |
| On a 360 px wide phone the app shows a bottom navigation bar 84 px high with the two tabs Entries and Statement; the mint pill lies under the active tab and that tab carries aria-current=page. The Entries tab shows today's Home, unchanged. A tap on Statement shows a read-only Statement screen that starts at the mint balance card: nothing is drawn above the card, and the card reads Total Sent in blue, Paid Back with a '−' in teal, a divider, and the Balance in large teal type. The pane is still named Statement for a screen reader. Under the card the Sent for Abbaas list reads the column header 'No. · Date · Paid to · USD', one numbered row for each send oldest first with its date, the person paid, a sub-line reading the method first and then the rufiyaa figure and rate for an MVR entry, and its USD figure, and the footer 'Total sent · 17 entries' with the total. The Statement shows no You or Abbaas box and no Send or Receive button. Only the rows scroll: the balance card and the list's column header and footer stay in place, and the page itself never scrolls. An empty ledger shows the same screen with $0.00 figures, no rows and the footer 'Total sent · No entries'. |  |
| On the Statement screen a segmented pill named 'Statement lists' sits under the balance card and offers the two tabs 'Sent for Abbaas' and 'Paid back by Abbaas'. The sent tab is selected when the Statement opens and the pill's thumb is blue under it. A tap on 'Paid back by Abbaas' selects that tab, turns the thumb teal, and shows the paid-back list with the column header 'No. · Date · Method · USD', one numbered row for each repayment oldest first with its date, its stored method and its USD figure in teal, and the footer 'Total paid back · 6 entries' with the total; a repayment with no stored method leaves its Method cell empty. A tap back on 'Sent for Abbaas' shows the sent list again. The balance card and the pill stay in place through both switches, each list's column header and footer stay in place, and only the rows of the shown list scroll. | On a 360 px wide phone the app shows a bottom navigation bar 84 px high with the two tabs Entries and Statement; the mint pill lies under the active tab and that tab carries aria-current=page. The Entries tab shows today's Home, unchanged. A tap on Statement shows a read-only Statement screen that starts at the mint balance card: nothing is drawn above the card, and the card reads Total Sent in blue, Paid Back with a '−' in teal, a divider, and the Balance in large teal type. The pane is still named Statement for a screen reader. Under the card the Sent for Abbaas list reads the column header 'No. · Date · Paid to · USD', one numbered row for each send oldest first with its date, the person paid, a sub-line reading the method first and then the rufiyaa figure and rate for an MVR entry, and its USD figure, and the footer 'Total sent · 17 entries' with the total. The Statement shows no You or Abbaas box and no Send or Receive button. Only the rows scroll: the balance card and the list's column header and footer stay in place, and the page itself never scrolls. An empty ledger shows the same screen with $0.00 figures, no rows and the footer 'Total sent · No entries'. |
| Every switch is drawn as one movement. A tap on a navigation tab slides the mint pill and the two panes together over 420 ms on the curve cubic-bezier(0.2, 0.8, 0.2, 1), fades the leaving pane to 0.4, and raises the arriving Statement's parts one after another over 360 ms in the order balance card, pill, rows, footer, the card starting at 120 ms and each later part 22 ms after the one before it, to a limit of 14 steps. A tap on the pill slides the two lists the same way, turns the thumb from blue to teal, and raises the arriving list's rows and footer in the same order, while the balance card does not move at all. On a phone that asks for reduced motion the same taps show the same end screens at once, with no transition. | On a 360 px wide phone the app shows a bottom navigation bar 84 px high with the two tabs Entries and Statement; the mint pill lies under the active tab and that tab carries aria-current=page. The Entries tab shows today's Home, unchanged. A tap on Statement shows a read-only Statement screen that starts at the mint balance card: nothing is drawn above the card, and the card reads Total Sent in blue, Paid Back with a '−' in teal, a divider, and the Balance in large teal type. The pane is still named Statement for a screen reader. Under the card the Sent for Abbaas list reads the column header 'No. · Date · Paid to · USD', one numbered row for each send oldest first with its date, the person paid, a sub-line reading the method first and then the rufiyaa figure and rate for an MVR entry, and its USD figure, and the footer 'Total sent · 17 entries' with the total. The Statement shows no You or Abbaas box and no Send or Receive button. Only the rows scroll: the balance card and the list's column header and footer stay in place, and the page itself never scrolls. An empty ledger shows the same screen with $0.00 figures, no rows and the footer 'Total sent · No entries'., On the Statement screen a segmented pill named 'Statement lists' sits under the balance card and offers the two tabs 'Sent for Abbaas' and 'Paid back by Abbaas'. The sent tab is selected when the Statement opens and the pill's thumb is blue under it. A tap on 'Paid back by Abbaas' selects that tab, turns the thumb teal, and shows the paid-back list with the column header 'No. · Date · Method · USD', one numbered row for each repayment oldest first with its date, its stored method and its USD figure in teal, and the footer 'Total paid back · 6 entries' with the total; a repayment with no stored method leaves its Method cell empty. A tap back on 'Sent for Abbaas' shows the sent list again. The balance card and the pill stay in place through both switches, each list's column header and footer stay in place, and only the rows of the shown list scroll. |

## Change intent
| Observation | Type | Description |
| --- | --- | --- |
| On a 360 px wide phone the app shows a bottom navigation bar 84 px high with the two tabs Entries and Statement; the mint pill lies under the active tab and that tab carries aria-current=page. The Entries tab shows today's Home, unchanged. A tap on Statement shows a read-only Statement screen that starts at the mint balance card: nothing is drawn above the card, and the card reads Total Sent in blue, Paid Back with a '−' in teal, a divider, and the Balance in large teal type. The pane is still named Statement for a screen reader. Under the card the Sent for Abbaas list reads the column header 'No. · Date · Paid to · USD', one numbered row for each send oldest first with its date, the person paid, a sub-line reading the method first and then the rufiyaa figure and rate for an MVR entry, and its USD figure, and the footer 'Total sent · 17 entries' with the total. The Statement shows no You or Abbaas box and no Send or Receive button. Only the rows scroll: the balance card and the list's column header and footer stay in place, and the page itself never scrolls. An empty ledger shows the same screen with $0.00 figures, no rows and the footer 'Total sent · No entries'. | feat | Add the Statement tab with totals and the sent list |
| On the Statement screen a segmented pill named 'Statement lists' sits under the balance card and offers the two tabs 'Sent for Abbaas' and 'Paid back by Abbaas'. The sent tab is selected when the Statement opens and the pill's thumb is blue under it. A tap on 'Paid back by Abbaas' selects that tab, turns the thumb teal, and shows the paid-back list with the column header 'No. · Date · Method · USD', one numbered row for each repayment oldest first with its date, its stored method and its USD figure in teal, and the footer 'Total paid back · 6 entries' with the total; a repayment with no stored method leaves its Method cell empty. A tap back on 'Sent for Abbaas' shows the sent list again. The balance card and the pill stay in place through both switches, each list's column header and footer stay in place, and only the rows of the shown list scroll. | feat | Show the paid-back list from the statement pill |
| Every switch is drawn as one movement. A tap on a navigation tab slides the mint pill and the two panes together over 420 ms on the curve cubic-bezier(0.2, 0.8, 0.2, 1), fades the leaving pane to 0.4, and raises the arriving Statement's parts one after another over 360 ms in the order balance card, pill, rows, footer, the card starting at 120 ms and each later part 22 ms after the one before it, to a limit of 14 steps. A tap on the pill slides the two lists the same way, turns the thumb from blue to teal, and raises the arriving list's rows and footer in the same order, while the balance card does not move at all. On a phone that asks for reduced motion the same taps show the same end screens at once, with no transition. | feat | Slide and rise the statement panes on every switch |
