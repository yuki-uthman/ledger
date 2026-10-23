# Product brief

## Request
    Change the two lists of the Statement tab in the Abbaas Ledger at /Users/Yuki/Claude/abbaas-ledger, on base commit 8535254 of main, under the feature statement-currency-columns, exactly as the design board https://claude.ai/artifact/7XuZXfpMUNa85Q6Crbgcf8 draws it in the variant the human chose: board E with option E4 and footer F1, that is the component SentColumns.dc.html with the props date=show, rate=inline, subtotal=line and converted=both and the MVR colour #9c4f10. On the sending side the owner reads the columns Date, Paid to, MVR and USD with no No. column; a rufiyaa send reads '10,000/- @20' in its MVR column and its dollar value in brackets, '($500)', in the USD column, a dollar send reads '$1,500' and a grey '—'; every row figure is whole with its own currency mark, each currency has its own colour, the two currency headers are centre aligned, and a three-line footer names what went in rufiyaa, what went in dollars and the total. The paid-back list drops its own No. column and reads its figures with the dollar mark. The rest of the screen is untouched: the balance card, the pill, the bottom bar, the motion and the theme stay as they are. The design is final and approved; this Request records it as confirmed decisions and does not reopen it.

## Outcomes
-     The owner opens the Statement tab and tells at a glance which sends went in rufiyaa and which in dollars, because each currency has its own column, its own mark and its own colour.
-     The owner reads, for a send made in rufiyaa, the rufiyaa figure and the rate used on one line in the MVR column, and the dollars that figure came to in the USD column beside it, so the rufiyaa send can be compared with the dollar sends and with the total.
-     The owner reads whole figures, because nothing is ever sent in decimals: a row drops a trailing '.00' and still shows real cents when the ledger holds them.
-     The owner reads the sent total split in three lines: what went in rufiyaa with its dollar value, what went in dollars, and the total of both, at every ledger, including one with no send in a currency.
-     The owner reads the paid-back list without a number column and with the dollar mark on every figure, in the teal that side already reads in.
-     The owner keeps today's screen: the balance card, the segmented pill, the bottom bar, the pinned header and footer, the scrolling rows and every motion read exactly as before.

## Scope

### In scope
-     The Sent for Abbaas column header reads the four words Date, Paid to, MVR and USD on the grid 40px minmax(0, 1fr) 90px 54px with a 6 px column gap — the board's grid with its MVR track widened from 84px to 90px, the 6 px coming out of the flexible Paid to column and the gap unchanged; the words MVR and USD are centre aligned and coloured #9c4f10 and #24508a, Date and Paid to stay left in #4c5f5b, and the header keeps today's 11 px, weight 700, uppercase and 0.06em letter spacing.
-     No No. column in either list, and no row number drawn anywhere on the Statement.
-     The MVR cell of a rufiyaa send: the rufiyaa figure with the prefix 'MVR' and no space after it, bold in #9c4f10, then the rate inline on the same line, written '@20' with no space and with no trailing zeros, 11.5 px in #4c5f5b with a 3 px gap; the cell is right aligned and stays on one line, so a row reads 'MVR10,000@20', and the widest cell the owner can send, 'MVR99,999@20', still reads on one line in the 90 px track at a 360 px screen.
-     The MVR cell of a dollar send: a grey em dash '—' in #5f706c.
-     The USD cell: a dollar send reads '$1,500' in #24508a at weight 700; a rufiyaa send reads the dollars that entry stores with no brackets, '$500', in the lighter blue #4f6f9c at weight 600, in the same cell as before; both are right aligned.
-     The row amount format: the mark always present ('$' before a dollar figure, 'MVR' before a rufiyaa figure with no space after it), thousands separators kept, a trailing '.00' dropped and real cents kept — '$1,500', 'MVR10,000', '$500', '$1,500.50', 'MVR10,000.50', '$649.35' — with no rounding anywhere. The stored cents and the stored rate, numeric(12,4) such as 15.4, are unchanged.
-     The grey sub-line under the person reads the stored method alone, 'Transfer'; the rufiyaa figure and the rate no longer appear there, and a send with no stored method has no sub-line at all.
-     The sent footer, three lines in one block on the existing #e7eef7 ground in #1b3f6e at 13 px weight 700, a 6 px gap and padding 10px 14px 12px: 'Sent in MVR · N entries' with the MVR subtotal in #9c4f10 followed by its dollar value in #4f6f9c with no brackets around it; 'Sent in USD · N entries' with the dollar subtotal in #24508a; a 1 px divider #cfdbea; 'Total Sent · N entries' with the total in #1b3f6e. Each line carries its label at the left and its figures at the right, as footer F1 draws it, with no dash character between them.
-     All three footer lines are drawn at every ledger, including one with no send in a currency, where the line reads its count as the app's existing entryCountLabel words it — 'Sent in MVR · No entries' — with 'MVR0' and '$0.00'.
-     Every total keeps the two decimals the board draws on a total: '$12,500.00', '$3,000.00', '$9,500.00' in this brief's stand-in figures, and the balance card's figures unchanged. Only row amounts drop '.00'. The MVR subtotal is written like an MVR amount, 'MVR60,000', with cents only when they are real.
-     The Paid back by Abbaas list: the three columns Date, Method and USD, with the word USD centred over its column as the sent list centres its currency headers and today's header colour kept, no number column, each figure right aligned and carrying the dollar mark under the same row rule ('$3,000', and '$3,000.25' when the cents are real), its teal #0f6f68 kept, and its one footer line unchanged, 'Total paid back · 3 entries' with '$9,000.00'. Its own grid is untouched; only the sent list's MVR track is widened.
-     The colour of each currency: #24508a for dollars on the header, the dollar row figures and the Sent-in-USD footer figure; #9c4f10 for rufiyaa on the header, the rufiyaa row figures and the Sent-in-MVR footer figure; #4f6f9c for the converted dollar value of a rufiyaa send, on its row and on the footer's MVR line; #4c5f5b for the inline rate; #5f706c for the em dash placeholder. Teal stays reserved for the paid-back side.
-     Everything else of the Statement unchanged: the mint balance card and its three figures, the segmented pill and its thumb, the panel shape and its 18 px radius, the zebra tints #ffffff and #fafcfb, the 1 px row rule #eef2f1, the pinned header and footer with only the rows scrolling, the bottom bar and every motion timing.
-     The public hooks: every data-* hook, role and accessible name the Statement and Home carry at 8535254 keeps its name and meaning, and the new cells — a row's rufiyaa figure, its inline rate, its converted value, its placeholder, and each of the three footer lines with its count and its cents — are readable by an acceptance test without reading any styling.
-     Every count on the Statement is worded by the app's existing entryCountLabel, so a line reads 'No entries', '1 entry' or '9 entries', on each of the three sent footer lines and on the paid-back footer alike.

### Out of scope
Applicability: applicable
Reason:     The human named these exclusions, and the theme decision ('do not change the overall design or the theme of the screen') keeps the rest of the screen out of this Request.
-     The Home and Entries list, which keeps today's wording, figures and hooks.
-     The entry form, the Send and Receive sheets and the entry sheet: they still accept cents and non-integer rates and are not changed.
-     The mint balance card, its three figures and their two decimals.
-     The segmented pill, the bottom navigation bar and every motion timing; the footer keeps rising as one part.
-     The Supabase schema and the stored data: no column, no rate and no cent is migrated or rounded.
-     The receiving side's colour and footer wording beyond dropping its No. column and adding the dollar mark to its row figures.
-     A dark theme, sorting, filtering, a chosen period and export, none of which the board draws.
-     The open odds and ends: placeholder payment dates and old branches.

## Jobs to be done

### Human
- [confirmed] When I read the sending side of the statement, I want to see which transaction was sent in rufiyaa and which in dollars, so I can tell the two kinds of send apart without reading each line.
- [confirmed] When a send was made in rufiyaa, I want to read what that rufiyaa amount came to in dollars, faintly beside it in the USD column, so I can compare it with the dollar sends and with the total.
- [confirmed] When I read a figure in this list, I want it whole and with its own mark, because nothing is ever sent in decimals and '$' or 'MVR' tells me the currency at once.
- [confirmed] When I read the total at the bottom, I want it split into what went in rufiyaa and what went in dollars before the total of both, so I know how much of the account each currency carries.
- [confirmed] When the list changes, I want the rest of the screen to stay as it is, so I do not have to learn the screen again.

### LLM
- [proposed] When I check one row against a transfer slip, I want the rufiyaa figure and the rate I used on the same line, so I can match the entry to the slip without opening it.

## User journey

| Step | Human emotion | Status |
| --- | --- | --- |
| The owner taps Statement in the bottom bar and reads the balance card, which is unchanged. | not explored | confirmed |
| The owner reads the Sent for Abbaas list and tells the rufiyaa sends from the dollar sends by their own columns, marks and colours, with no number column in the way. | not explored | confirmed |
| The owner reads one rufiyaa row: 'MVR10,000@20' on the MVR side and '$500' on the USD side. | not explored | confirmed |
| The owner reads a dollar row: '$1,500' on the USD side and a grey dash on the MVR side. | not explored | confirmed |
| The owner scrolls the rows; the centred currency headers and the footer stay in place. | not explored | confirmed |
| The owner reads the three footer lines: what went in rufiyaa with its dollar value, what went in dollars, and the total of both. | not explored | confirmed |
| The owner taps 'Paid back by Abbaas' and reads Date, Method and USD with the dollar mark on every figure, in teal. | not explored | confirmed |
| The owner checks the whole screen on their own phone before approving integration. | not explored | confirmed |

Qualitative journey arc (stated emotions; NOT measured intensity)
```text
[confirmed] 1. The owner taps Statement in the bottom bar and reads the balance card, which is unchanged.
    emotion: UNKNOWN (not explored)
    |
    v
[confirmed] 2. The owner reads the Sent for Abbaas list and tells the rufiyaa sends from the dollar sends by their own columns, marks and colours, with no number column in the way.
    emotion: UNKNOWN (not explored)
    |
    v
[confirmed] 3. The owner reads one rufiyaa row: 'MVR10,000@20' on the MVR side and '$500' on the USD side.
    emotion: UNKNOWN (not explored)
    |
    v
[confirmed] 4. The owner reads a dollar row: '$1,500' on the USD side and a grey dash on the MVR side.
    emotion: UNKNOWN (not explored)
    |
    v
[confirmed] 5. The owner scrolls the rows; the centred currency headers and the footer stay in place.
    emotion: UNKNOWN (not explored)
    |
    v
[confirmed] 6. The owner reads the three footer lines: what went in rufiyaa with its dollar value, what went in dollars, and the total of both.
    emotion: UNKNOWN (not explored)
    |
    v
[confirmed] 7. The owner taps 'Paid back by Abbaas' and reads Date, Method and USD with the dollar mark on every figure, in teal.
    emotion: UNKNOWN (not explored)
    |
    v
[confirmed] 8. The owner checks the whole screen on their own phone before approving integration.
    emotion: UNKNOWN (not explored)
```

## Gherkin scenarios

### The owner tells a rufiyaa send from a dollar send in the sent list (confirmed)
```gherkin
Given the ledger holds a send of 10,000 rufiyaa at the rate 20 and a send of 1,500 dollars
When the owner opens the Statement tab
Then the sent list is headed Date, Paid to, MVR, USD and draws no No. column and no row number
And the words MVR and USD are centred over their columns, MVR in #9c4f10 and USD in #24508a
And the rufiyaa send reads 'MVR10,000@20' in its MVR column and '$500' in its USD column
And the dollar send reads '$1,500' in its USD column and the grey em dash '—' in its MVR column
And no '/-' mark and no bracket is drawn anywhere in either column
And the amounts in both columns are right aligned
```

### The widest rufiyaa send the owner can make still reads on one line (confirmed)
```gherkin
Given the ledger holds a send of 99,999 rufiyaa at the rate 20, the largest the owner ever sends
When the owner opens the Statement tab on a 360 px wide screen
Then the MVR cell reads 'MVR99,999@20' on one line, with no wrap and no clipped character
And the Date, Paid to and USD columns keep their own contents on one line
And the header words MVR and USD stay centred over their columns
```

### A rufiyaa send reads its rate inline and its dollars faintly beside it (confirmed)
```gherkin
Given the ledger holds a send of 15,000 rufiyaa at the rate 15.4
When the owner opens the Statement tab
Then the rufiyaa figure is bold in #9c4f10 with the prefix 'MVR' and no space after it, and the rate follows it on the same line as '@15.4' in grey #4c5f5b
And the rate carries no space after the '@' and no trailing zero
And the dollar value of that row is drawn with no brackets in the lighter blue #4f6f9c at weight 600, in the USD cell of that row
And the sub-line under the person reads 'Transfer' alone, with no rufiyaa figure and no rate
```

### A row figure drops a trailing .00 and keeps real cents (confirmed)
```gherkin
Given the ledger holds a send of 1,500 dollars and a send of 1,500 dollars and 50 cents
And the ledger holds a send of 10,000 rufiyaa at the rate 20 and a send of 10,000 rufiyaa and 50 laari at the rate 20
And the ledger holds a send of 10,000 rufiyaa at the rate 15.4, which the ledger stores as 649 dollars and 35 cents
When the owner opens the Statement tab
Then the whole dollar send reads '$1,500' and the one with cents reads '$1,500.50'
And the send of whole rufiyaa reads 'MVR10,000' and the one with laari reads 'MVR10,000.50'
And the send at the rate 20 reads its converted value as '$500' and the send at the rate 15.4 reads '$649.35'
And no figure on the screen is rounded to a different amount than the ledger stores
```

### The sent footer names each currency before the total (confirmed)
```gherkin
Given the ledger holds 4 rufiyaa sends of MVR60,000 worth 3,000 dollars and 5 dollar sends worth 9,500 dollars
When the owner opens the Statement tab
Then the footer reads three lines on the #e7eef7 ground in #1b3f6e
And the first line reads 'Sent in MVR · 4 entries' with 'MVR60,000' in #9c4f10 and '$3,000.00' in #4f6f9c
And no bracket is drawn around that line's dollar value
And the second line reads 'Sent in USD · 5 entries' with '$9,500.00' in #24508a
And a 1 px #cfdbea divider stands above the last line
And the last line reads 'Total Sent · 9 entries' with '$12,500.00'
And each line carries its label at the left and its figures at the right, with no dash between them
And every footer figure keeps two decimals except the rufiyaa subtotal, which is written like a rufiyaa amount with the 'MVR' prefix
```

### A ledger with no rufiyaa send still reads all three footer lines (confirmed)
```gherkin
Given the ledger holds dollar sends only
When the owner opens the Statement tab
Then the footer still reads all three lines
And the rufiyaa line reads 'Sent in MVR · No entries' with 'MVR0' and '$0.00'
And the dollar line and the total line read the same figure, each with two decimals
When one rufiyaa send is added to the ledger
Then the rufiyaa line reads '1 entry', as the app already words a count of one
```

### The paid-back list reads without a number column and with the dollar mark (confirmed)
```gherkin
Given the ledger holds a repayment of 3,000 dollars by cash and a repayment of 3,000 dollars and 25 cents with no stored method
When the owner opens the Statement tab and taps 'Paid back by Abbaas'
Then the list is headed Date, Method, USD and draws no No. column and no row number
And the word USD is centred over its column in today's header colour while the figures below stay right aligned
And the first repayment reads 'Cash' and '$3,000' in teal #0f6f68
And the second repayment leaves its Method cell empty and reads '$3,000.25'
And the footer reads one line, 'Total paid back · 2 entries', with the total in two decimals
And the balance card has not moved
```

### The rest of the Statement is untouched (confirmed)
```gherkin
Given the owner is on the Statement tab
When the owner reads the screen and scrolls the rows to the end
Then the balance card reads the same three figures with two decimals as before
And the pill, the bottom bar, the panel shape, the zebra tints and the row rule read as before
And the column header and the footer stay in place while only the rows scroll
And a tap on the pill and a tap on a navigation tab play the same motion as before
```

## Quint scenarios

_Not run: no Quint model was executed for this brief._

## Observations
-     On the phone the Statement tab's Sent for Abbaas list reads the four columns Date, Paid to, MVR and USD, with no No. column and no number drawn in any row. The words MVR and USD sit centred over their columns, MVR in amber-brown #9c4f10 and USD in blue #24508a, while Date and Paid to stay left in #4c5f5b and every amount below stays right aligned. A send made in rufiyaa reads its rufiyaa figure and its rate on one line in the MVR column, 'MVR10,000@20', the figure bold in #9c4f10 with the prefix 'MVR' and no space after it, and the rate small and grey in #4c5f5b with no space before it beyond the 3 px gap and no trailing zeros in it, and reads the dollars that entry stores in the USD column with no brackets, '$500', in the lighter blue #4f6f9c at weight 600. A send made in dollars reads '$1,500' in #24508a in the USD column and a grey em dash '—' in #5f706c in the MVR column. Every row figure carries its mark and its thousands separators, drops a trailing '.00' and keeps real cents, so a dollar send of 1,500 dollars and 50 cents reads '$1,500.50', a rufiyaa send of 10,000 rufiyaa and 50 laari reads 'MVR10,000.50', and a converted value of 649 dollars and 35 cents reads '$649.35'; nothing is rounded. The grey sub-line under the person now reads the method alone, 'Transfer', and a send with no stored method has no sub-line at all. The list's footer still reads today's one line, 'Total sent · 9 entries' with '$12,500.00'. The balance card, the pill, the bottom bar, the zebra tints and every motion read exactly as before.
-     The Sent for Abbaas footer reads three lines in one block on the existing #e7eef7 ground in #1b3f6e at 13 px weight 700: 'Sent in MVR · 4 entries' with 'MVR60,000' in #9c4f10 followed by '$3,000.00' in #4f6f9c, then 'Sent in USD · 5 entries' with '$9,500.00' in #24508a, then a 1 px divider #cfdbea, then 'Total Sent · 9 entries' with '$12,500.00'. Each line carries its label at the left and its figures at the right, with no dash between them and no brackets around the MVR line's dollar value. Every footer figure keeps two decimals, except the rufiyaa subtotal, which is written like a rufiyaa amount with the 'MVR' prefix and cents only when they are real, 'MVR60,000.50'. All three lines are drawn at every ledger: one with no rufiyaa send still reads its MVR line as 'Sent in MVR · No entries' with 'MVR0' and '$0.00', and one with no dollar send still reads its USD line at zero. Every count on a line is worded by the app's existing entryCountLabel, so it reads 'No entries', '1 entry' or 'N entries'. The footer stays pinned under the scrolling rows and rises as one part, as it does today.
-     The Paid back by Abbaas list reads the three columns Date, Method and USD with the word USD centred over its column in today's header colour, with no No. column and no number drawn in any row, and each repayment's figure stays right aligned and reads with the dollar mark under the same row rule as the sent list: '$3,000' for a whole figure and '$3,000.25' when the cents are real, in the teal #0f6f68 that side reads in today. A repayment with no stored method still leaves its Method cell empty. Its footer is unchanged and reads one line, 'Total paid back · 3 entries' with '$9,000.00'. A tap on the pill still switches between the two lists with the same slide and rise, and the balance card does not move.

## Decisions
-     Confirmed by the human: 'In the statement view, on the sending side, not the receiving side ... we can send in USD or MVR. In the table, we want to have two lanes or two columns. One is MVR, and another one is USD. So it's more clear which transaction was sent in MVR and which one was sent in USD. And when it was sent in MVR, we also want to display how much that MVR would amount to USD. So it can be a bit faint color or in a bracket. In the USD column.' The board answered with both at once: faint, in the lighter blue #4f6f9c at weight 600, AND in brackets, '($500)'. The bracket half of that answer is superseded by the owner's correction of 2026-10-23: the faint colour, the weight and the USD column all stay, the brackets go, so the converted value now reads '$500'.
-     Confirmed by the human: 'Keep as much of the current theme and the design ... do not change the overall design or the theme of the screen.' The balance card, the pill, the bottom bar, the motion and the palette stay as they are.
-     Confirmed by the human: board E, so the Date column is kept and the sent list reads Date, Paid to, MVR, USD.
-     Confirmed by the human: 'drop the decimal for all the transaction. it is never sent in decimal. always a whole digit.' Read with the Q2 answer below, this drops a trailing '.00' from a row figure and keeps real cents when the ledger holds them.
-     Confirmed by the human: option E4, so the rate sits inline after the rufiyaa amount on one line, in small grey text, written '@20' with no space and with no trailing zeros, which is the repo's existing formatRatePlain reading ('@20', '@15.4').
-     Confirmed by the human: 'put a currency symbol. $1000 for USD, 1000/- for MVR.' Thousands separators are kept, so a dollar row reads '$1,000'. The rufiyaa half of this decision — the '/-' mark — is superseded by the owner's correction of 2026-10-23 ('switch the symbol from 1000/- -> MVR1000'), so a rufiyaa row now reads 'MVR1,000'. The dollar half stands unchanged.
-     Confirmed by the human: 'the header MVR USD shud be center aligned.' The amounts below the two headers stay right aligned.
-     Confirmed by the human: 'remove the No column.'
-     Confirmed by the human: footer F1, three lines in the same style — 13 px, weight 700, #1b3f6e on the existing #e7eef7 ground, with a thin #cfdbea divider above the last line: 'Sent in MVR · 4 entries' with 'MVR60,000' and '$3,000.00' (the same line read '60,000/- ($3,000.00)' before the 2026-10-23 correction), 'Sent in USD · 5 entries' with '$9,500.00', then, in the human's words, 'then Total Sent with the same style', 'Total Sent · 9 entries' with '$12,500.00'. The last line's label therefore reads 'Total Sent' with a capital S, where today's single-line footer reads 'Total sent'.
-     Confirmed by the board's F1 branch, which is the design authority this Request names: each footer line carries its label at the left and its figures at the right of the same line. The em dash in the Request's prose ('Sent in MVR · 4 entries — 60,000/-', written there in the pre-correction rufiyaa form that the preserved Request text keeps) stands for that gap and is not a character the screen draws.
-     Confirmed by the human: 'assign different color to each currency.' USD is the existing blue #24508a on the header, the dollar row figures and the Sent-in-USD footer figure; MVR is the amber-brown #9c4f10 on the header, the rufiyaa row figures and the Sent-in-MVR footer figure. The converted value stays the lighter blue #4f6f9c at weight 600, now with no brackets around it; the inline rate stays grey #4c5f5b, the em dash placeholder stays grey #5f706c, and teal stays reserved for the paid-back side.
-     Confirmed by the human: a dollar send shows a grey em dash '—' in the MVR column, so an empty cell never reads as a missing figure.
-     Confirmed by the human: the sub-line under the person shows only the method, 'Transfer'. The rufiyaa amount and the rate no longer appear there, because the MVR column now reads both.
-     Confirmed by the human, answer A to Q2 on cents: a row amount drops '.00' but keeps real cents — '$1,500', 'MVR10,000', '$649.35' in the marks the 2026-10-23 correction sets. The app still accepts cents and a non-integer rate, the entry form is not changed, and nothing is rounded anywhere.
-     Reading of two confirmed decisions, not a new choice: the Q2 list writes a dollar figure with cents as '1,500.50' with no mark, while decision 6 ('put a currency symbol. $1000 for USD') and the Q3 answer ('$3,000') make the mark general. The cents rule governs the decimals and the mark rule governs the mark, so a dollar row with real cents reads '$1,500.50', and a rufiyaa row with real laari reads 'MVR10,000.50', with the 'MVR' prefix before the figure as the 2026-10-23 correction writes it.
-     Confirmed by the human, answer A to Q3 on the paid-back list: remove its No. column too, so it reads Date, Method, USD; show its amounts as '$3,000' under the same row rule; keep its teal colour and its one-line footer.
-     Confirmed by the human, answer B to Q4 on a currency with no sends: always show all three footer lines, so a ledger with no rufiyaa send still reads its MVR line with 'MVR0' and '$0.00'.
-     Confirmed by the human, answer A to Q5 on totals: every total keeps the two decimals the board draws on a total — '$12,500.00', '$3,000.00', '$9,500.00' in this brief's stand-in figures — and the balance card's figures are unchanged; only row amounts drop '.00'. The MVR subtotal figure is written like an MVR amount, 'MVR60,000', with cents only when they are real, 'MVR60,000.50'.
-     Confirmed: the design board https://claude.ai/artifact/7XuZXfpMUNa85Q6Crbgcf8, in the chosen variant E + E4 + F1 (props date=show, rate=inline, subtotal=line, converted=both, mvrColor #9c4f10), is final and approved. It is the authority for every colour, size, word and alignment named here, and nothing in it is reopened by this Request except three points changed after the phone check on 2026-10-23: the rufiyaa mark, the brackets around a converted value, and the width of the MVR track, widened from the board's 84 px to 90 px so the longest rufiyaa cell the owner can send still fits at a 360 px screen. Where the board draws '1,000/-' and '($500)', the screen now reads 'MVR1,000' and '$500', and where it draws an 84 px MVR track the grid now reads 90 px; everything else the board draws stands.
-     Confirmed: before integration the human checks the result on their own phone, and integration and push happen only with the human's approval.
-     Confirmed by the owner at the phone check on 2026-10-23, in their own words: 'on MVR column / remove the bracket ($1000). / switch the symbol from 1000/- -> MVR1000'. Asked whether the footer's 'Sent in MVR' line, which showed the same old forms ('60,000/-' and '($3,000.00)'), should change the same way as the rows, the owner answered: 'Footer too'. So, everywhere on the Statement: a rufiyaa amount is written with the prefix 'MVR' and no space, keeping its thousands separators, dropping a trailing '.00' and keeping real laari — 'MVR10,000', 'MVR10,000.50' — and the '/-' mark is gone; the rate still follows inline, small and grey, with the 3 px gap and no space character, so a rufiyaa cell reads 'MVR10,000@20' as the preview the owner selected draws it. The converted dollar value of a rufiyaa send loses its brackets and reads '$500' or '$649.35', still in the lighter blue #4f6f9c at weight 600 and in the same USD cell, which does not move. The footer's MVR line reads 'Sent in MVR · 4 entries' with 'MVR60,000' in #9c4f10 followed by '$3,000.00' in #4f6f9c, and at zero reads 'MVR0' and '$0.00'; the MVR subtotal shows laari only when they are real, 'MVR60,000.50', while every dollar total keeps its two decimals. This supersedes, for rufiyaa, the earlier decision 'put a currency symbol. $1000 for USD, 1000/- for MVR.' — its dollar half stands — and supersedes the bracket half of the earlier converted-value decision, whose faint colour stands. Nothing else changes by this correction: the columns, the colours, the header and its centring, a dollar send's '$1,500', the grey em dash, the paid-back list, the counts, the total line and every motion read as already decided. The longer rufiyaa cell did force a measurement of the MVR track, which the next two entries record.
-     Confirmed by the owner on 2026-10-23, asked how wide a rufiyaa cell has to be, in their own words: 'but there is no possibility of laari ever..' and 'maximum digit would be 5 digits. it would not go 100,000. 99,999 is maximum width'. So a single rufiyaa send is at most five digits and never carries laari, and the widest rufiyaa cell the sent list ever draws is 'MVR99,999' with its inline rate. This is a fact about the amounts the owner sends, not a change to the format rules: the screen still prints real laari if the ledger ever holds them and still rounds nothing, so 'MVR10,000.50' stays the stated reading of a stored half rufiyaa and simply does not occur in practice. The owner's words bound one send, not the footer's MVR subtotal, which is a sum drawn on a full-width line and is therefore not held to five digits.
-     Host's choice under the owner's constraint, not the owner's number and not the board's: the architect measured 'MVR10,000@20' at about 85 px, which no longer fits the board's 84 px MVR track at a 360 px screen, so the MVR track is widened from 84 px to 90 px and the sent grid reads 40px minmax(0, 1fr) 90px 54px. The 6 px column gap is unchanged and the 6 px comes out of the flexible Paid to column, which is 6 px narrower. The owner confirmed only the range of the amounts ('5 digits', 'no laari'); 90 px is the host's reading of what that range needs and is open to the owner's correction at the next phone check. The Paid back by Abbaas list keeps its own grid untouched, and nothing else of the layout moves.
-     Open question, not decided and not blocking this Request: the owner's words name the MVR column of the Statement, and Home and the Entries list stay out of scope, so after this correction they keep today's rufiyaa wording while the Statement reads 'MVR10,000'. Whether Home and Entries should read the new form too is a separate product decision for the owner; this Request changes nothing there.
-     Decision: a row's dollars stay the dollars that entry stores. The screen still never converts rufiyaa a second time, so the converted value in the USD column is the same figure Home and the entry sheet read, and the Sent-in-MVR footer figure is the sum of those stored dollars.
-     Decision: this Request extends the Statement feature's one existing walking skeleton — sign in, read the ledger, paint the Statement — and starts no second one. Its three values each change wording, columns and colour inside that path.
-     Confirmed by the human, answer A to Q7 on the count of zero and of one: every count on the Statement keeps the wording of the app's existing entryCountLabel, so a line reads 'No entries', '1 entry' or 'N entries'. A ledger with no rufiyaa send therefore reads 'Sent in MVR · No entries' with 'MVR0' and '$0.00', and the same rule words the dollar line, the total line and the paid-back footer. This agrees with the previous Request's confirmed decision, so the '0 entries' of the Q4 example is not drawn.
-     Confirmed by the human, answer A to Q8 on the paid-back header: the word USD is centred over its column on the Paid back by Abbaas list too, so both lists follow one header rule, while the figures below it stay right aligned. The paid-back header keeps today's colour; the human's answer does not change it.
-     Proposal, not a human decision: the oldest-first order and the 1-upward numbering of the domain projection stay as they are, and only the drawn number goes. The row hook that names a row's place may therefore stay, so the order remains readable by a test while no number is drawn.
-     Fact from the schema, not a proposal: supabase/migrations/0001_account_scoped_ledger.sql makes rate required for an MVR entry and null for every other, so a rufiyaa send with no stored rate cannot exist and every rufiyaa row reads its inline rate.
-     Proposal, edge case the board does not draw: an empty ledger reads the same screen as today, with the card at $0.00, no rows, and all three sent footer lines at zero plus the unchanged paid-back line; a failed read still shows the spoken notice and no rows.
-     Supplied fact, for the human's own phone check and not for an oracle: the phone check seeds a local sample ledger that is not in this repository; its footer lines must add up to the card's Total Sent. Real figures move with every saved entry, so an acceptance test seeds its own entries.
-     Privacy, confirmed by the human (Q9 = A, then option C on 2026-10-23): this repository is public, so every ledger figure in this brief is an invented stand-in (4 rufiyaa sends of MVR60,000 worth $3,000.00, 5 dollar sends worth $9,500.00, $12,500.00 in all, 3 repayments of $9,000.00). Where a decision quotes the human's own example, its words are kept and only the figures are replaced. The human's phone check reads the real sample from a local seed script that never enters the repository.
-     Formal verification: waived, as in the previous Request. No checker is installed on this machine (quint, tlc and apalache are absent) and the Statement stays read-only, so the Quint section is 'not_run' and the human's earlier waiver is carried unchanged.
-     typesafe: unavailable. No Jev key and no configuration entry exist on this machine, so every judgment in this brief was made locally.
-     Process: this DISCUSS is parked as a GitHub issue and a later session resumes at DESIGN, so everything the architect needs is written here rather than left in the conversation.
-     Business motivation: not supplied beyond the human's own words, 'so it's more clear which transaction was sent in MVR and which one was sent in USD'. No further benefit is claimed.

## Values
| Observation | Dependencies |
| --- | --- |
| On the phone the Statement tab's Sent for Abbaas list reads the four columns Date, Paid to, MVR and USD, with no No. column and no number drawn in any row. The words MVR and USD sit centred over their columns, MVR in amber-brown #9c4f10 and USD in blue #24508a, while Date and Paid to stay left in #4c5f5b and every amount below stays right aligned. A send made in rufiyaa reads its rufiyaa figure and its rate on one line in the MVR column, 'MVR10,000@20', the figure bold in #9c4f10 with the prefix 'MVR' and no space after it, and the rate small and grey in #4c5f5b with no space before it beyond the 3 px gap and no trailing zeros in it, and reads the dollars that entry stores in the USD column with no brackets, '$500', in the lighter blue #4f6f9c at weight 600. A send made in dollars reads '$1,500' in #24508a in the USD column and a grey em dash '—' in #5f706c in the MVR column. Every row figure carries its mark and its thousands separators, drops a trailing '.00' and keeps real cents, so a dollar send of 1,500 dollars and 50 cents reads '$1,500.50', a rufiyaa send of 10,000 rufiyaa and 50 laari reads 'MVR10,000.50', and a converted value of 649 dollars and 35 cents reads '$649.35'; nothing is rounded. The grey sub-line under the person now reads the method alone, 'Transfer', and a send with no stored method has no sub-line at all. The list's footer still reads today's one line, 'Total sent · 9 entries' with '$12,500.00'. The balance card, the pill, the bottom bar, the zebra tints and every motion read exactly as before. |  |
| The Sent for Abbaas footer reads three lines in one block on the existing #e7eef7 ground in #1b3f6e at 13 px weight 700: 'Sent in MVR · 4 entries' with 'MVR60,000' in #9c4f10 followed by '$3,000.00' in #4f6f9c, then 'Sent in USD · 5 entries' with '$9,500.00' in #24508a, then a 1 px divider #cfdbea, then 'Total Sent · 9 entries' with '$12,500.00'. Each line carries its label at the left and its figures at the right, with no dash between them and no brackets around the MVR line's dollar value. Every footer figure keeps two decimals, except the rufiyaa subtotal, which is written like a rufiyaa amount with the 'MVR' prefix and cents only when they are real, 'MVR60,000.50'. All three lines are drawn at every ledger: one with no rufiyaa send still reads its MVR line as 'Sent in MVR · No entries' with 'MVR0' and '$0.00', and one with no dollar send still reads its USD line at zero. Every count on a line is worded by the app's existing entryCountLabel, so it reads 'No entries', '1 entry' or 'N entries'. The footer stays pinned under the scrolling rows and rises as one part, as it does today. | On the phone the Statement tab's Sent for Abbaas list reads the four columns Date, Paid to, MVR and USD, with no No. column and no number drawn in any row. The words MVR and USD sit centred over their columns, MVR in amber-brown #9c4f10 and USD in blue #24508a, while Date and Paid to stay left in #4c5f5b and every amount below stays right aligned. A send made in rufiyaa reads its rufiyaa figure and its rate on one line in the MVR column, 'MVR10,000@20', the figure bold in #9c4f10 with the prefix 'MVR' and no space after it, and the rate small and grey in #4c5f5b with no space before it beyond the 3 px gap and no trailing zeros in it, and reads the dollars that entry stores in the USD column with no brackets, '$500', in the lighter blue #4f6f9c at weight 600. A send made in dollars reads '$1,500' in #24508a in the USD column and a grey em dash '—' in #5f706c in the MVR column. Every row figure carries its mark and its thousands separators, drops a trailing '.00' and keeps real cents, so a dollar send of 1,500 dollars and 50 cents reads '$1,500.50', a rufiyaa send of 10,000 rufiyaa and 50 laari reads 'MVR10,000.50', and a converted value of 649 dollars and 35 cents reads '$649.35'; nothing is rounded. The grey sub-line under the person now reads the method alone, 'Transfer', and a send with no stored method has no sub-line at all. The list's footer still reads today's one line, 'Total sent · 9 entries' with '$12,500.00'. The balance card, the pill, the bottom bar, the zebra tints and every motion read exactly as before. |
| The Paid back by Abbaas list reads the three columns Date, Method and USD with the word USD centred over its column in today's header colour, with no No. column and no number drawn in any row, and each repayment's figure stays right aligned and reads with the dollar mark under the same row rule as the sent list: '$3,000' for a whole figure and '$3,000.25' when the cents are real, in the teal #0f6f68 that side reads in today. A repayment with no stored method still leaves its Method cell empty. Its footer is unchanged and reads one line, 'Total paid back · 3 entries' with '$9,000.00'. A tap on the pill still switches between the two lists with the same slide and rise, and the balance card does not move. | On the phone the Statement tab's Sent for Abbaas list reads the four columns Date, Paid to, MVR and USD, with no No. column and no number drawn in any row. The words MVR and USD sit centred over their columns, MVR in amber-brown #9c4f10 and USD in blue #24508a, while Date and Paid to stay left in #4c5f5b and every amount below stays right aligned. A send made in rufiyaa reads its rufiyaa figure and its rate on one line in the MVR column, 'MVR10,000@20', the figure bold in #9c4f10 with the prefix 'MVR' and no space after it, and the rate small and grey in #4c5f5b with no space before it beyond the 3 px gap and no trailing zeros in it, and reads the dollars that entry stores in the USD column with no brackets, '$500', in the lighter blue #4f6f9c at weight 600. A send made in dollars reads '$1,500' in #24508a in the USD column and a grey em dash '—' in #5f706c in the MVR column. Every row figure carries its mark and its thousands separators, drops a trailing '.00' and keeps real cents, so a dollar send of 1,500 dollars and 50 cents reads '$1,500.50', a rufiyaa send of 10,000 rufiyaa and 50 laari reads 'MVR10,000.50', and a converted value of 649 dollars and 35 cents reads '$649.35'; nothing is rounded. The grey sub-line under the person now reads the method alone, 'Transfer', and a send with no stored method has no sub-line at all. The list's footer still reads today's one line, 'Total sent · 9 entries' with '$12,500.00'. The balance card, the pill, the bottom bar, the zebra tints and every motion read exactly as before. |

## Change intent
| Observation | Type | Description |
| --- | --- | --- |
| On the phone the Statement tab's Sent for Abbaas list reads the four columns Date, Paid to, MVR and USD, with no No. column and no number drawn in any row. The words MVR and USD sit centred over their columns, MVR in amber-brown #9c4f10 and USD in blue #24508a, while Date and Paid to stay left in #4c5f5b and every amount below stays right aligned. A send made in rufiyaa reads its rufiyaa figure and its rate on one line in the MVR column, 'MVR10,000@20', the figure bold in #9c4f10 with the prefix 'MVR' and no space after it, and the rate small and grey in #4c5f5b with no space before it beyond the 3 px gap and no trailing zeros in it, and reads the dollars that entry stores in the USD column with no brackets, '$500', in the lighter blue #4f6f9c at weight 600. A send made in dollars reads '$1,500' in #24508a in the USD column and a grey em dash '—' in #5f706c in the MVR column. Every row figure carries its mark and its thousands separators, drops a trailing '.00' and keeps real cents, so a dollar send of 1,500 dollars and 50 cents reads '$1,500.50', a rufiyaa send of 10,000 rufiyaa and 50 laari reads 'MVR10,000.50', and a converted value of 649 dollars and 35 cents reads '$649.35'; nothing is rounded. The grey sub-line under the person now reads the method alone, 'Transfer', and a send with no stored method has no sub-line at all. The list's footer still reads today's one line, 'Total sent · 9 entries' with '$12,500.00'. The balance card, the pill, the bottom bar, the zebra tints and every motion read exactly as before. | feat | Read each send in its own MVR and USD column |
| The Sent for Abbaas footer reads three lines in one block on the existing #e7eef7 ground in #1b3f6e at 13 px weight 700: 'Sent in MVR · 4 entries' with 'MVR60,000' in #9c4f10 followed by '$3,000.00' in #4f6f9c, then 'Sent in USD · 5 entries' with '$9,500.00' in #24508a, then a 1 px divider #cfdbea, then 'Total Sent · 9 entries' with '$12,500.00'. Each line carries its label at the left and its figures at the right, with no dash between them and no brackets around the MVR line's dollar value. Every footer figure keeps two decimals, except the rufiyaa subtotal, which is written like a rufiyaa amount with the 'MVR' prefix and cents only when they are real, 'MVR60,000.50'. All three lines are drawn at every ledger: one with no rufiyaa send still reads its MVR line as 'Sent in MVR · No entries' with 'MVR0' and '$0.00', and one with no dollar send still reads its USD line at zero. Every count on a line is worded by the app's existing entryCountLabel, so it reads 'No entries', '1 entry' or 'N entries'. The footer stays pinned under the scrolling rows and rises as one part, as it does today. | feat | Split the sent total into rufiyaa, dollar and total lines |
| The Paid back by Abbaas list reads the three columns Date, Method and USD with the word USD centred over its column in today's header colour, with no No. column and no number drawn in any row, and each repayment's figure stays right aligned and reads with the dollar mark under the same row rule as the sent list: '$3,000' for a whole figure and '$3,000.25' when the cents are real, in the teal #0f6f68 that side reads in today. A repayment with no stored method still leaves its Method cell empty. Its footer is unchanged and reads one line, 'Total paid back · 3 entries' with '$9,000.00'. A tap on the pill still switches between the two lists with the same slide and rise, and the balance card does not move. | feat | Read the paid-back amounts with the dollar mark |
