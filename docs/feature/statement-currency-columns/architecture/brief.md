## Shared design

### Facts (Shared design)

- S-purpose: The Statement tab's sending list reads every send in its own MVR
  and USD column with its own mark and colour, its sent footer splits the total
  into a rufiyaa line, a dollar line and a total line, and the paid-back list
  reads its figures with the dollar mark, while the balance card, the pill, the
  bottom bar, the theme and every motion stay as they are.
- S-c-stored-minor: Stored amounts are whole minor units: US cents for a USD
  entry and laari for an MVR entry. This feature reads them and writes nothing.
- S-c-rate-range: supabase/migrations/0001_account_scoped_ledger.sql:23 stores
  rate as numeric(12,4), required for an MVR entry and null for every other
  kind, so a rufiyaa send carries a rate of at most four decimals and a dollar
  send carries none.
- S-c-no-upper-bound: The authority states no upper bound on one amount, on a
  rate or on the number of entries a ledger holds, so every figure and footer
  rule must hold at any magnitude and any length the stored types allow.
- S-c-row-figure-rule: A row figure always carries its mark, keeps its thousands
  separators, drops a trailing '.00' and keeps real cents, and nothing is
  rounded: '$1,500', 'MVR10,000', '$500', '$1,500.50', 'MVR10,000.50',
  '$649.35'. The dollar mark is '$' before the figure and the rufiyaa mark is
  the prefix 'MVR' with no space after it.
- S-c-total-two-decimals: Every total and subtotal keeps two decimals, except
  the rufiyaa subtotal, which is written like a rufiyaa amount with cents only
  when they are real.
- S-c-count-wording: Every count on the Statement is worded by entryCountLabel
  at src/domain/ledger-view.ts:130, which reads 'No entries', '1 entry' or 'N
  entries'.
- S-c-board-grid: The sent list's header and rows stand on the grid 40px
  minmax(0, 1fr) 90px 54px with a 6 px column gap, the header padded 10px 14px
  8px over a 1 px #cfd9d6 rule, each row padded 8px 14px over a 1 px #eef2f1
  rule at 12.5 px with tabular figures, and the MVR and USD cells right aligned.
  The board draws 84 px for the MVR column, so this design is 6 px wider there
  and the party column is 6 px narrower: the deviation buys room for the widest
  rufiyaa reading the owner's ledger can hold.
  Amended by statement-shell-polish (docs/feature/statement-shell-polish/architecture/brief.md): the grid's own measures, the MVR track among them, are re-tuned by that batch's approved prototype, and a rufiyaa send's MVR cell now stands two lines high. Every measure named here is a design value that no spec reads, the owner's phone being its only check.
- S-c-board-colours: The colours are #24508a for dollars, #9c4f10 for rufiyaa,
  #4f6f9c at weight 600 for the converted dollar value of a rufiyaa send, which
  carries no brackets, #4c5f5b for the inline rate and the left-hand header
  words, #5f706c for the em dash placeholder, #1b3f6e on the #e7eef7 ground for
  a sent footer, #cfdbea for the footer divider and #0f6f68 for the paid-back
  figures.
- S-c-header-type: A column header cell reads 11 px, weight 700, uppercase with
  0.06em letter spacing in #4c5f5b, and a currency word is centred over its own
  column while the left-hand words stay left.
- S-c-header-type-deviation: src/ui/theme.css:2530 gives .statement-head-row 11
  px in the muted ink and declares no weight, no uppercase and no letter
  spacing, so adding the weight, the uppercase and the 0.06em that the authority
  names is wider than the stylesheet today and changes the header words of both
  lists.
- S-c-back-grid-deviation: The authority draws no grid for the paid-back list,
  so its three columns stand on 40px minmax(0, 1fr) 70px with the sent list's 6
  px gap: the date width and the gap follow the sent list while the figure
  column keeps the 70 px it has today, which a two-decimal figure needs.
- S-c-untouched: formatUsdCents at src/domain/money.ts:40, the balance card and
  its three figures, Home and Entries, the entry form and its sheets, the pill,
  the bottom bar, every motion timing, the zebra tints, the panel shape, the
  Supabase schema and the stored data are unchanged.
  Amended by statement-shell-polish (docs/feature/statement-shell-polish/architecture/brief.md): this records what this feature left alone, not a standing promise. That later batch removes the minus before the balance card's Paid Back figure, wraps the Entries area in the one box that scrolls, and gives the bottom bar an icon above each word.
- S-c-privacy: The repository is public, so every figure in an authority, a test
  or a document is an invented stand-in and no figure of the owner's own ledger
  is written anywhere in the repository.
- S-c-public-port: The only public driving port is the built bundle as Chrome
  loads it over the served loopback origin at 360x780, with the local Supabase
  stack on ports 54420-54424 and the origin on 4317, and one Playwright run at a
  time, serialised by the mkdir lock at
  /Users/Yuki/Claude/abbaas-ledger/.git/playwright.lock.
- S-c-hooks-kept: Every data-* hook, role and accessible name the Statement and
  Home carry at commit 8535254 keeps its name and its meaning, data-no included,
  and each new cell carries its own hook so a test reads it without reading
  styling.
  Amended by statement-shell-polish (docs/feature/statement-shell-polish/architecture/brief.md): data-statement-placeholder is removed with the mark it named, data-statement-converted is added on the converted dollars of a rufiyaa send, and data-converted stays on that row's USD cell, which now reads nothing. Every other hook, role and accessible name keeps its name and its meaning.
- S-c-read-only: The Statement screen is handed a read outcome and nothing that
  writes, so no operation within its reach can change the money it reports.
- S-t-money: src/domain/money.ts owns how a figure is worded, so the row
  formatters are added beside formatUsdCents without changing it.
- S-t-domain: src/domain/statement.ts owns what every row and every footer line
  of the Statement says, so the MVR cell carrier, the marked dollar figure and
  the three-line sent footer are owned there.
- S-t-ui: src/ui/statement.ts owns the furniture of the screen: the column
  words, the cells of a row, the footer block, the mark that stands for an
  absent figure and the hooks a reader finds them by.
- S-t-css: src/ui/theme.css owns the grid, the alignment, the type and the
  colours of both lists.
- S-d-algebra-domain: Domain layer. States: a stored entry of kind send or
  receive, in USD or MVR, with whole minor units and a rate only where one is
  stored. Operations: statementOf, listOf, rowOf, mvrCellOf, sentFootOf and the
  figure formatters. Observations: a row's date, person, sub-line, MVR cell and
  USD cell, and the three sent footer lines. Equality: two ledgers are equal
  when every row reading and every footer reading agrees. Laws: a row's dollars
  are the dollars its entry stores; the rufiyaa and dollar footer lines
  partition the sends by currency; the total line is the sum of the two; and
  every figure is worded by one formatter.
- S-d-algebra-application: Application and port layer. The driving port hands
  the screen one ReadEntriesOutcome, whose outcomes are a read list of entries
  and a retry carrying its own message. Laws: a retry draws the spoken notice
  and no figure and no row; a read list draws its header and its footer at every
  length, the empty ledger included.
- S-d-algebra-adapter: Adapter and integration layer. The Supabase adapter
  decodes stored rows into entries; a decoded MVR row carries its stored rate
  and a decoded USD row carries none. Law: no figure drawn by this feature
  converts a rufiyaa amount a second time, so a stored dollar figure reaches the
  USD cell and the footer unchanged.
- S-d-algebra-infra: Infrastructure and recovery layer. A failed read is one
  refusal with its spoken message, retried only by reopening the tab; nothing is
  cached, nothing is written and no retry loop exists, so there is no partial
  state to recover and no compensation to design.
- S-d-carrier-mvr: src/domain/statement.ts owns StatementMvrCell, the choice
  type of what a row's MVR cell reads: a dollar send carries no rufiyaa figure
  at all, and a rufiyaa send carries its marked rufiyaa figure, its inline rate
  text where a rate is stored, and the marked reading, with no brackets, of the
  dollars it stores.
  Amended by statement-shell-polish (docs/feature/statement-shell-polish/architecture/brief.md): the choice type and its three readings are unchanged, but the rate is no longer inline after the figure: the rate, the arrow the screen draws and the marked reading of the stored dollars now stand together on the line under the rufiyaa figure.
- S-d-carrier-usd: src/domain/statement.ts owns usdFigure, the marked whole
  reading of the dollars a row stores, which is what a sent dollar row and a
  paid-back row both read in their USD column.
- S-d-carrier-foot: src/domain/statement.ts owns SentFoot, a three-place tuple
  of the rufiyaa line, the dollar line and the total line, each with its label,
  its count, its count label, its cents and its own figure texts, so a sent
  footer with fewer than three lines cannot be built.
- S-d-carrier-effects: The only effect carrier is ReadEntriesOutcome, owned by
  src/ports/ledger-store.ts; the only per-process state is which list is shown,
  held on the screen's data-statement-shown attribute and read back by shownList
  at src/ui/statement.ts:332; this feature declares no error type of its own.
- S-d-closure-safety: Safety is BLOCKED at DESIGN: no checker was executed, the
  owner waived formal verification for this Request, and the exclusions rest
  only on the TypeScript compiler that npm run build runs over the annotated
  paths.
- S-d-closure-inhabitation: Inhabitation is PASS at DESIGN and
  DESIGNED_NOT_BUILT at runtime: a stored row admitted by the migration reaches
  statementOf, then mvrCellOf and sentFootOf, then renderStatement, then the
  drawn cell a reading observes, with no cycle and no bootstrap needed.
- S-d-closure-reachability: Public reachability is PASS at DESIGN and
  DESIGNED_NOT_BUILT at runtime: every new cell and footer line is read through
  the built bundle over the served origin, which is the only public port this
  feature has.
- S-d-closure-liveness: Liveness does not apply: the Statement is one
  synchronous pure projection drawn in a single paint, with no queue, no retry
  loop, no scheduler and no progress obligation to state.
- S-d-fv-waiver: Formal verification is waived by the owner for this Request, so
  every claim a checker would have carried stays INDETERMINATE with that waiver
  as its reason, and none of them is reported as passed.
- S-d-fv-mapping: Without the waiver the figure, partition and sum laws would go
  to Quint as invariants over a bounded ledger of a few entries; no temporal
  property and therefore no TLC run would be selected, because every claim here
  is a finite local totality claim; and no proof assistant would be selected,
  because no claim is a general theorem over an unbounded structure.
- S-d-fv-absent: quint, tlc, apalache and agda resolve nowhere on this host, so
  no checker could have run even if the waiver had not been given.
- S-d-type-exclusion-mvr: The MVR cell carrier excludes a dollar row carrying a
  converted dollar figure and a rufiyaa row carrying no rufiyaa figure. Only
  mvrCellOf in src/domain/statement.ts builds it; a cast, a JSON decode or a
  writer outside src/ could still present a row shape the compiler never saw;
  and the harm would be a row stating money the ledger does not hold.
- S-d-type-exclusion-foot: The three-place sent footer excludes a footer with a
  missing currency line. Only sentFootOf builds it; a screen that drew fewer
  lines than it is handed could still hide one, which is why the three drawn
  lines are observed and not only the type; and the harm would be a currency
  split the owner reads as absent.
- S-d-type-admitted-rate: A rufiyaa entry with no stored rate is admitted, not
  excluded: the carrier holds a null rate text and the row reads its rufiyaa
  figure with no rate clause. What makes that row unreachable through the real
  adapter is the migration's own constraint, not the type.
- S-d-type-strength: The strength of every exclusion here is the TypeScript
  compiler that npm run build runs with noEmit over the annotated paths. It is
  not a proof: a cast, an unchecked decode or a writer outside src/ can still
  build an excluded state.
- S-d-type-cannot-distinguish: A drawn cell's text cannot distinguish which
  module worded it, so no text observation of this design tells a figure the
  domain worded from a figure the screen worded; only the source-reading
  architectural case tells them apart.
- S-d-repr-change: The row's dollar reading changes representation from the
  unsigned two-decimal text withoutCurrencySign produced to the marked row text:
  the cents are the same cents, a figure with real cents differs only by the
  leading mark, and a whole figure differs by the mark and the dropped '.00'.
  Both directions of that claim are stated as the row-figure law and are checked
  over generated ledgers.
- S-d-repr-preserved: formatUsdCents stays the one owner of dollar grouping:
  every new dollar formatter is derived from its output, so a row figure, a
  subtotal and a card figure can never group or round the same cents
  differently.
- S-d-pbt-properties: The properties checked over generated ledgers are: every
  sent row reads the dollars its own entry stores; a dollar send reads its
  marked whole figure and the em dash placeholder; a rufiyaa send reads its
  marked rufiyaa figure, its inline rate and its stored dollars with the dollar
  mark and no brackets; the three footer lines partition the sends and sum to
  the total line; a paid-back row reads its marked dollars; and no drawn figure
  is rounded away from the stored minor units.
- S-d-pbt-generator: The generator is the repository's own seeded ledger
  generator at tests/acceptance/statement-sent.spec.ts:1385, which stores its
  rows through the real adapter: whole and fractional cents, whole and
  fractional laari, integer and four-decimal rates, dollars unrelated to the
  stored rate, ledgers of a few dozen rows, and the separate 500-row length
  case.
- S-d-pbt-seed: The seed is a printed constant of the spec, so a failing ledger
  is replayed exactly. This repository has no property-testing library, so a
  failing case is reported whole with its seed and minimised by hand; that
  absence of automatic shrinking is a stated limit of this evidence.
- S-d-pbt-independent: Every expected reading is derived in the oracle from the
  stored rows alone and never read back from the screen, so a screen that words
  a figure its own way falsifies the property instead of confirming it.
- S-d-res-stressor-rate: Stressor, negating the assumption that a rufiyaa entry
  always stores a rate: a stored MVR row with a null rate must still read its
  rufiyaa figure and its stored dollars, may degrade to no rate clause at all,
  must never read an invented rate or the word null, and leaves the residue that
  the owner can still tell the two currencies apart.
- S-d-res-stressor-length: Stressor, negating the assumption that a ledger is
  short: 500 rows must still read the header and all three footer lines with the
  page itself never scrolling, may degrade in scrolling smoothness, must never
  count only the rows in sight, and leaves the residue of a correct total.
- S-d-res-stressor-read: Stressor, negating the assumption that the read
  succeeds: a failed read must still speak its notice, may degrade to no figure
  and no row at all, must never draw zero figures over an empty list as though
  the ledger were empty, and leaves the residue that nothing false is stated
  about the money.
- S-d-res-stressor-currency: Stressor, negating the assumption that every send
  is in one of two currencies: a stored send in a third currency must still be
  listed and counted in the total line, and must never be dropped or silently
  added to a currency line it does not belong to. The design admits that such a
  row has no currency line of its own and carries it as an unknown state.
- S-d-res-spof: The single point of failure is src/domain/statement.ts: every
  figure of both lists is worded there, so one wrong formatter misstates the
  whole screen. The remaining obligation is that each value's oracle observes
  whole row readings and whole footer readings derived from stored rows, and its
  owner is the acceptance designer.
- S-d-res-bypass: The design cannot stop a writer outside src/ storing a row the
  migration admits but this feature does not draw, nor a cast or an unchecked
  decode introducing a row shape the compiler never saw, nor a process failure
  mid-read, which reads as a failed read. Those obligations stay with the
  migration's constraints and the ledger store's decoder, and their owner is the
  ledger store.
- S-d-res-second-walk: A second set of stressors, not used to derive the design,
  was walked against the finished design. A person name long enough to fill the
  party column shows the 90 px and 54 px columns clipping the name and not the
  figures. A rate of four stored decimals shows the inline rate growing by three
  characters inside the 90 px cell, which is the narrowest place of the design,
  where the 'MVR' prefix makes every rufiyaa reading three characters wider than
  its figure alone, so such a reading runs past the column the owner's own
  figures fit inside. A ledger with no entry at all shows the three footer lines
  reading 'No entries' with 'MVR0', '$0.00' and '$0.00'. A tap on the pill while
  the rows are mid-scroll shows the footer still rising as one part.
- S-d-res-states: Admitted: a ledger of any length, a rufiyaa row with no stored
  rate, a row with real cents or real laari, a repayment with no stored method,
  an empty ledger and a failed read. Excluded by the carriers: a dollar row with
  a converted figure, a rufiyaa row with no rufiyaa figure, and a sent footer
  with fewer than three lines. Unknown: a stored send in a currency that is
  neither USD nor MVR, whose risk owner is the ledger store's decoder.
- S-d-reuse-money: formatUsdCents is referenced from nine modules of this app,
  so it is read and never changed. Two functions are added beside it:
  formatUsdWhole, which drops a trailing '.00' from its output and words every
  row dollar figure, the converted value of a rufiyaa send among them; and
  formatMvrAmount, which puts the prefix 'MVR' before formatMvrLaari and words
  every rufiyaa figure, the footer's rufiyaa subtotal among them. Every footer
  dollar figure, the converted one included, keeps formatUsdCents and its two
  decimals.
- S-d-reuse-count: entryCountLabel stays the one owner of how a count is worded,
  on each of the three sent footer lines and on the paid-back footer alike.
- S-d-reuse-dash: The em dash that stands where a rufiyaa figure is absent is
  the screen's own furniture, as the card's minus sign at src/ui/statement.ts:47
  already is: the domain says there is no rufiyaa figure and the screen draws
  the mark that stands for it.
  Amended by statement-shell-polish (docs/feature/statement-shell-polish/architecture/brief.md): the mark is gone. Absence in a money column is carried by the empty cell alone, the em dash with its hook, its constant and its style is removed, and the balance card's minus sign is removed with it, so the Paid Back figure reads unsigned.
- S-d-reuse-no-conversion: laariToUsdCents at src/domain/money.ts:70 is
  deliberately not called by this feature: a row's and a footer's dollars are
  the dollars the entries store, so converting a rufiyaa figure a second time
  would move the owner's money by the rounding.
- S-d-supersede: This feature supersedes these sections of
  docs/product/architecture/brief.md: F-c-rate- text and V1-d-sent-row, because
  the rufiyaa figure and the rate move out of the sub-line into the MVR column;
  F-c-usd-column and V1-c-row-cells, because a row figure now carries its mark
  and drops a trailing '.00'; F-c-order and F-ob-rows, because no row number is
  drawn while the oldest-first order and the row's own place are kept; and
  V1-c-sent-panel, because the sent header reads four different words on a new
  grid. F-c-stored- cents, F-d-hooks, F-d-domain-owner and F-d-reuse-money are
  confirmed unchanged.
- S-d-confirm-order: The brief's proposal on a row's place is confirmed, not
  changed: the projection keeps its oldest-first order and its 1-upward place,
  data-no stays on every row of both lists, and only the drawn number goes.
- S-d-confirm-empty: The brief's proposal on the edge cases is confirmed, not
  changed: an empty ledger reads the card at zero, no row, all three sent footer
  lines at zero and the unchanged paid-back line, and a failed read reads the
  spoken notice with no row.
- S-d-confirm-llm-job: The brief's proposed job of checking one row against a
  transfer slip is confirmed as already served by the inline rate of the MVR
  cell, and it adds no obligation of its own.
- S-d-open-none: No item of the brief is left open and nothing waits on the
  human: the design board is final, the formal-verification waiver is recorded,
  and the two technical details the authority does not draw - the paid-back grid
  and the header type the stylesheet lacks - are decided here as deviations.
- S-d-spec-migration: Three existing specs assert readings this feature
  replaces, and the acceptance designer migrates each in the value that replaces
  it: tests/acceptance/statement-sent.spec.ts for the header words, the drawn
  number, the sub-line and the 'no mark in a row' case;
  tests/acceptance/statement-lists.spec.ts for the shared row reader, the
  unsigned figure derivation, the paid-back header and the generated law; and
  tests/acceptance/statement-motion.spec.ts for the sent footer's text.
- S-d-refuted-dropzeros: Refuted law: that every figure of the Statement drops a
  trailing '.00'. A total keeps its two decimals, so the law holds only over row
  figures and the rufiyaa subtotal. Its scope was wrong, not its carrier.
- S-d-refuted-onecell: Refuted law: that one USD cell text serves both kinds of
  send. A dollar send reads '$1,500' at weight 700 in #24508a while a rufiyaa
  send reads '$500' at weight 600 in #4f6f9c, so the carrier had to become a
  choice type rather than one text field.
  Amended by statement-shell-polish (docs/feature/statement-shell-polish/architecture/brief.md): the law stays refuted and the carrier stays a choice type; its evidence changes, because a rufiyaa send's USD cell now reads nothing at all while still saying it is a converted reading, and the dollars that send stores are read in its MVR cell.
- S-d-paradigm: The paradigm is functional and is read from the repository, not
  chosen: both statement modules are functions from values to values and from
  values to DOM, and tests/acceptance/statement-lists.spec.ts:1303 already fails
  if either declares a class. Each domain decision is owned by the module that
  holds its data - money wording by src/domain/money.ts, row and footer wording
  by src/domain/statement.ts - and the screen keeps only furniture.
- S-d-hook-contract: The new hooks are: data-statement-column on each header
  cell, naming date, party, method, mvr or usd; data-statement-mvr on a row's
  MVR cell, with data-statement-rate on its inline rate and
  data-statement-placeholder on the em dash; data-statement-usd on a row's USD
  cell with data-converted saying whether it reads the converted dollar value of
  a rufiyaa send; and data-statement-foot-line on each sent footer line, naming
  mvr, usd or total, each with its own data-count and data-cents.
  Amended by statement-shell-polish (docs/feature/statement-shell-polish/architecture/brief.md): data-statement-placeholder is removed with the em dash it marked; data-statement-converted is added on the converted dollars a rufiyaa send reads in its MVR cell; and data-converted stays on a row's USD cell, saying that the cell is the converted reading of a rufiyaa send, which now reads no text at all. The other hooks of this contract are unchanged.
- S-d-mvr-cell-spacing: A row's MVR cell appends its figure span and its rate
  span with no whitespace text node between them and a 3 px left margin on the
  rate, so the cell's own text reads 'MVR10,000@20' while the owner sees the 3
  px gap the authority draws. An oracle therefore reads the figure and the rate
  as two spans and not as one joined string.
  Amended by statement-shell-polish (docs/feature/statement-shell-polish/architecture/brief.md): the cell no longer joins the two spans on one line. The figure stands on a line of its own and the rate, the arrow and the stored dollars on the line under it, so the cell reads 'MVR10,000' and under it '@20 → $500', and an oracle reads the figure, the rate and the converted dollars as three spans, each by its own hook.
- S-ru-usd-cents: The one owner of dollar grouping in this app, read by nine
  modules: it is reused and not changed, and the new row formatters are derived
  from its output.
- S-ru-mvr-laari: Already words laari with its separators and only real cents,
  which is exactly the rufiyaa row rule, so it is reused and the prefix 'MVR' is
  put before it.
- S-ru-rate-plain: Already words a rate with no trailing zeros and at most four
  decimals, which is the inline rate the authority draws, so it is reused
  unchanged.
- S-ru-count-label: Already words every count this app states, so each of the
  three new footer lines reads its count through it.
- S-ru-without-sign: Its only reference site is the row it words, and a row
  figure now carries its mark, so it is replaced by the marked formatters rather
  than extended.
- S-ru-row-of: Already builds one row from one entry; it is extended with the
  MVR cell carrier and the marked dollar figure.
- S-ru-list-of: Already projects one kind of entry into rows, a count, a count
  label and a total; it is extended so the sending list also carries its
  three-line footer.
- S-ru-subline-of: Already words a sub-line from the stored method and the
  rufiyaa clause; it is extended to word the method alone.
- S-ru-render-panel: Already draws a header, a scrolling area and a footer for
  both lists; it is extended so each list supplies its own footer, as each
  already supplies its own row.
- S-ru-render-sent: Already draws one sent row; it is extended with the MVR cell
  and the marked USD cell and loses its drawn number.
- S-ru-render-back: Already draws one repayment row; it is extended to read the
  marked dollar figure and loses its drawn number.
- S-ru-render-line: Already opens every row with its entry id and its place,
  which the authority keeps, so it is reused unchanged.
- S-ru-minus: The precedent that a mark standing for something the domain does
  not say is the screen's own furniture; it is reused as the reason the em dash
  lives in the screen.
- S-ru-sent-columns: The four words of the sent header; extended to Date, Paid
  to, MVR and USD.
- S-ru-back-columns: The four words of the paid-back header; extended to Date,
  Method and USD.
- S-ru-grid-css: The one grid both lists stand on; extended into the two grids
  the authority and this design name.
- S-ru-usd-css: The rule that inks and right-aligns a row's dollar cell;
  extended with the dollar, rufiyaa and converted colours.
- S-ru-foot-css: The rule that paints a footer on its tinted bed; extended with
  the sent footer's three lines, its gap and its divider.
- S-ru-usd-whole: No formatter drops a trailing '.00', and changing
  formatUsdCents would change the card, Home and every total, so this one is
  created beside it.
- S-ru-mvr-amount: No formatter writes a rufiyaa figure with the prefix 'MVR',
  and the entry sheet's reading of a rufiyaa figure must stay as it is, so this
  one is created.
- S-ru-mvr-cell: No type says what a row's MVR cell reads, and a nullable field
  for each part would leave a dollar row with a converted figure representable,
  so a choice type is created.
- S-ru-sent-foot: No type says what a sent footer reads, and the three lines
  must exist at every ledger, so a three-place tuple is created.
- S-pf-na: No preserving move belongs to the shared scope: the one move this
  feature needs, giving the panel its own footer renderer as it already has its
  own row renderer, is measured inside the value that splits the sent footer.
- S-ag-hooks-producer: src/ui/statement.ts produces the Statement's data-* hook
  contract; this feature adds cells and hooks and renames none.
- S-ag-hooks-sent-spec: This spec reads the sent header words, the drawn number,
  the sub-line and the absence of a mark in a row, each of which this feature
  replaces, so its cases are migrated with the value that replaces them.
- S-ag-hooks-lists-spec: This spec reads both lists through one row reader that
  takes the last cell as the figure and derives an unsigned two-decimal
  expectation, so its reader and its derivation are migrated.
- S-ag-hooks-motion-spec: This spec reads the sent footer's text while judging
  the rise of the footer, so its footer text is migrated while every motion
  expectation stays as it is.
- S-ag-usd-producer: formatUsdCents keeps its name, its signature and its
  two-decimal output, so every module that words a dollar figure through it is
  unaffected.
- S-ag-usd-home: Home reads its figures through the unchanged formatter and is
  out of scope.
- S-ag-usd-sheet: The entry sheet reads its figures through the unchanged
  formatter and is out of scope.
- S-ag-usd-statement-domain: src/domain/statement.ts stops wording a row figure
  through withoutCurrencySign and words it through the new marked formatters,
  which is the one consumer of this contract that changes.
- S-ag-stored-producer: The migration keeps every column, every constraint and
  every stored value: no column, no rate and no cent is migrated.
- S-ag-stored-port: The ledger store keeps decoding the same stored row shape,
  so its outcome type and its entries are unchanged.
- S-at-obligation: The statement modules depend inward only and the screen words
  no money: no module of src/domain names the document or an adapter, no module
  of src/ui names an adapter, neither statement module declares a class, the
  screen names no writing operation, and src/ui/statement.ts carries no currency
  mark, no Intl formatter and no arithmetic on an amount, so every figure it
  draws is one the domain worded.
- S-ct-obligation: A stored entry row read back through the real local Supabase
  stack reads on the screen as its own stored minor units and its own stored
  rate, with no cent and no rate decimal lost.
- S-ct-observation: The oracle stores, through the real adapter, a rufiyaa send
  with laari and a four-decimal rate and a dollar send with real cents, then
  reads the drawn MVR, rate and USD cells of those same rows and compares them
  with expectations derived from the stored values alone.
- S-ic-target: This path is changed by this feature's own values and carries no
  other owner's contract.
- S-ic-test-migrated: This spec asserts a reading this feature replaces, so the
  acceptance designer migrates its cases in the value that replaces them.
- S-ic-consumer-unchanged: This consumer reads a contract this feature leaves
  exactly as it is.
- S-ic-consumer-migrated: This consumer is the one place inside the domain that
  stops wording a row figure the old way.
- S-ic-build-unchanged: No dependency, script, test-discovery rule or support
  file changes, so the build metadata, the manifest and the lock stay as they
  are.
- S-ic-runtime-unchanged: No column, constraint, rate or cent is migrated, so
  the stored data and its schema stay as they are.
- S-b-driving: The driving port is the built bundle's Statement screen as Chrome
  paints it over the served origin: renderStatement at src/ui/statement.ts:360
  is handed one read outcome and returns the whole screen.
- S-b-driven-store: The driven port is ReadEntriesOutcome at
  src/ports/ledger-store.ts, whose Supabase adapter is composed only in
  src/main.ts.
- S-b-driven-dom: The second driven side is the document itself, which only
  src/ui names.
- S-b-direction: Dependencies point inward: the screen imports the ports, the
  meaning modules and the motion, the meaning modules import nothing but each
  other, and only the composition root names an adapter.
- S-b-fail-read: The ledger cannot be read.
- S-b-fail-read-obs: The screen draws the port's own message, spoken through an
  alert role, and no figure and no row at all.
- S-b-fail-rate: A stored rufiyaa row carries no rate.
- S-b-fail-rate-obs: The row reads its rufiyaa figure and its stored dollars
  with no rate clause, and the figure is never computed from a rate nobody
  stored.
- S-b-fail-method: A stored row carries a method token this app cannot name.
- S-b-fail-method-obs: The sub-line and the Method cell say nothing rather than
  inventing a word, and no method hook is carried.
- S-b-fail-currency: A stored send names a currency that is neither USD nor MVR.
- S-b-fail-currency-obs: The row is still listed and still counted in the total
  line, with no rufiyaa figure drawn; which currency line should hold it is
  indeterminate and stays with the ledger store.
- S-po-observation: On the phone the owner reads the Statement tab and tells the
  rufiyaa sends from the dollar sends by their own columns, marks and colours,
  reads the sent total split into a rufiyaa line, a dollar line and a total
  line, and reads the paid-back figures with the dollar mark, while the rest of
  the screen reads as before.
- S-po-stimulus: A ledger seeded through the real stack with rufiyaa sends at an
  integer and at a four-decimal rate, dollar sends with and without real cents
  and repayments with and without a stored method, read by signing in to the
  built bundle over the served origin and tapping Statement.
- S-po-expected: Every drawn cell and every footer line equals the reading the
  oracle derives from the stored rows alone, and src/ui/statement.ts still names
  no currency mark, no Intl formatter and no arithmetic on an amount.
- S-po-falsifier: Wording one figure in the screen instead of the domain, or
  drawing fewer than three sent footer lines, fails the oracle: the
  source-reading case names the screen's own mark or formatter, and the footer
  case names the missing line.
- S-adr-context: The sending list must read two currencies at once while the
  dollar wording of the whole app, the balance card and Home stay exactly as
  they are, and the design board fixes every colour, word, alignment and grid of
  the result.
- S-adr-decision: A row's MVR cell becomes one choice type in
  src/domain/statement.ts, the sent footer becomes a three-place tuple there,
  and two formatters derived from formatUsdCents and formatMvrLaari word every
  row figure and the rufiyaa subtotal, while src/ui/statement.ts keeps only the
  grid, the words of a header, the mark that stands for an absent figure and the
  hooks.
- S-adr-alt-screen: Wording the new figures in the screen was rejected: two
  modules would then decide what the owner's money says, and the repository's
  own architectural case already forbids it.
- S-adr-alt-formatter: Changing formatUsdCents to drop a trailing '.00' was
  rejected: nine modules read it, and the card and every total must keep their
  two decimals.
- S-adr-alt-nullable: Keeping one nullable text field per currency cell instead
  of a choice type was rejected: a dollar row carrying a converted figure would
  stay representable and the screen would branch on null instead of on a named
  case.
- S-adr-cons-one-owner: Every figure of the Statement is decided in one module,
  so one wrong formatter misstates the whole screen, which is why each value's
  oracle observes whole row and whole footer readings.
- S-adr-cons-shapes: The MVR cell carrier and the footer tuple are new public
  shapes of the domain module, so a later list that needs a third currency
  extends the choice type instead of adding a field.
- S-adr-cons-header: Adding the weight, the uppercase and the letter spacing the
  authority names changes the look of both lists' header words, which is wider
  than the stylesheet today.
- S-ob-mvr-desc: What a row's MVR cell reads: the marked rufiyaa figure and the
  inline rate of a rufiyaa send, or nothing where the send was made in dollars.
- S-ob-mvr-blind: It cannot distinguish two rufiyaa sends of the same amount at
  the same rate on the same day, and it cannot tell which module worded the
  text.
- S-ob-usd-desc: What a row's USD cell reads: the marked whole dollar figure of
  a dollar send, or the marked reading, with no brackets, of the dollars a
  rufiyaa send stores.
- S-ob-usd-blind: It cannot distinguish stored dollars from dollars converted a
  second time when the rate happens to make them equal, which is why the
  generated ledgers store dollars unrelated to their rate.
- S-ob-sub-desc: What the grey sub-line under a person reads: the stored
  method's word, or nothing at all.
- S-ob-sub-blind: It cannot distinguish a row stored with no method from a row
  stored with a token this app cannot name.
- S-ob-foot-desc: What the sent footer reads: three lines, each with its label,
  its count wording and its own figures.
- S-ob-foot-blind: It cannot distinguish which entries made up a line's count,
  only how many and how much.
- S-ob-src-desc: What the screen module's own bytes name: a currency mark, an
  Intl formatter, arithmetic on an amount, an adapter import, a class or a
  writing operation.
- S-ob-src-blind: It cannot distinguish a figure that is correct from a figure
  that is merely worded in the right module.
- S-eq-def: Two ledgers are equal for this design when every row's MVR cell, USD
  cell and sub-line, and all three sent footer lines, read the same text.
- S-gen-domain: Ledgers of sends and repayments stored through the real adapter:
  whole and fractional cents, whole and fractional laari, integer and
  four-decimal rates, dollars unrelated to the stored rate, methods present,
  absent and unknown, and dates that collide so the oldest-first order is
  exercised.
- S-gen-seed: One printed constant seed per spec, so a failing ledger is
  replayed exactly; with no property-testing library in this repository there is
  no automatic shrinking, and a failing case is reported whole and minimised by
  hand.
- S-gen-inc-whole-usd: A dollar send of whole dollars.
- S-gen-inc-cents-usd: A dollar send with real cents.
- S-gen-inc-whole-mvr: A rufiyaa send of whole rufiyaa at an integer rate.
- S-gen-inc-laari-mvr: A rufiyaa send with real laari at a four-decimal rate.
- S-gen-inc-no-mvr: A ledger with no rufiyaa send at all.
- S-gen-inc-no-usd: A ledger with no dollar send at all.
- S-gen-inc-empty: A ledger with no entry at all.
- S-law-stored-dollars: Every dollar figure this feature draws is the dollars
  its own entry stores: no row and no footer line converts a rufiyaa amount a
  second time.
- S-law-row-mark: A row figure carries its mark, keeps its separators, drops a
  trailing '.00' and keeps real cents, so it equals its two-decimal reading with
  the mark added and a trailing '.00' removed.
- S-law-no-rounding: No drawn figure differs from the stored minor units it
  reads by any amount: dropping '.00' is the only text a figure ever loses.
- S-law-foot-partition: The rufiyaa line counts and sums exactly the sends
  stored in MVR and the dollar line exactly the sends stored in USD, so the two
  counts add up to the number of sends.
- S-law-foot-total: The total line's cents are the sum of the rufiyaa line's
  cents and the dollar line's cents, and its count is the count of all sends.
- S-law-count-wording: Every count on the Statement reads 'No entries' at none,
  '1 entry' at one and 'N entries' above one.
- S-law-totals-decimals: Every total and subtotal keeps two decimals, except the
  rufiyaa subtotal, which reads like a rufiyaa amount.
- S-law-retry: A retry outcome draws the spoken notice and no figure and no row,
  and never draws zero figures over an empty list.
- S-law-screen-silent: The screen module names no currency mark, no Intl
  formatter, no arithmetic on an amount, no adapter, no class and no writing
  operation.
- S-law-case-count-none: A ledger with no send reads 'No entries' on all three
  footer lines.
- S-law-case-count-one: A ledger with one rufiyaa send reads '1 entry' on its
  rufiyaa line.
- S-law-case-count-many: A ledger with several sends in each currency reads 'N
  entries' on every line.
- S-law-case-totals: The brief's stand-in ledger reads 'MVR60,000', '$3,000.00',
  '$9,500.00' and '$12,500.00'.
- S-law-case-retry: A read refused by the endpoint reads the spoken notice with
  no row.
- S-law-case-source: The bytes of src/ui/statement.ts, read from the repository
  as the existing architectural case already reads them.
- S-law-reason-finite: The case is one closed reading of a finite set of
  alternatives, so the finite cases exhaust it and a generated domain would add
  nothing.
- S-law-falsifier-dollars: A screen that recomputed a rufiyaa row's dollars from
  its rate reads a figure the ledger does not store whenever the stored dollars
  and the conversion differ.
- S-law-falsifier-mark: A figure drawn through the unchanged two-decimal
  formatter reads '1,500.00' where the law demands '$1,500'.
- S-law-falsifier-rounding: A figure drawn through a formatter with fewer
  decimals reads a rounded amount the ledger does not hold.
- S-law-falsifier-partition: A footer that counted a rufiyaa send on the dollar
  line leaves the two counts no longer adding up to the number of sends.
- S-law-falsifier-total: A total line summed from its own query instead of from
  the two lines disagrees with them as soon as a third currency or a dropped row
  exists.
- S-law-independent-dollars: The oracle reads the dollars each seeded row stores
  and compares them with the drawn cell.
- S-law-independent-mark: The oracle derives the marked text from the stored
  minor units in its own code.
- S-law-independent-rounding: The oracle compares the drawn text with the stored
  minor units it seeded, never with a figure read back from the screen.
- S-law-independent-partition: The oracle partitions its own seeded rows by
  stored currency and counts them itself.
- S-law-independent-total: The oracle sums the stored dollars of its own seeded
  sends.
- S-excl-mvr-prop: A row of the sending list cannot be built with a converted
  dollar figure unless it is a rufiyaa send, and cannot be built as a rufiyaa
  send with no rufiyaa figure.
- S-excl-mvr-harm: A row would state money the ledger does not hold, which is
  the one thing this screen exists not to do.
- S-excl-mvr-input: A decoded entry whose currency is USD or MVR, with whole
  minor units and a rate only where one is stored.
- S-excl-mvr-obs: The drawn MVR and USD cells of that row, read through the
  built bundle.
- S-excl-mvr-bypass-cast: A cast or an unchecked JSON decode can still hand the
  projection a row shape the compiler never saw.
- S-excl-mvr-bypass-writer: A writer outside src/ can store a row the migration
  admits but this design does not draw.
- S-excl-foot-prop: A sent footer cannot be built with fewer than three lines,
  and a currency line cannot be built without its count and its cents.
- S-excl-foot-harm: The owner would read a currency split as absent, or a count
  the figures do not match.
- S-excl-foot-input: The sends of one read ledger, in any order and any number,
  the empty ledger included.
- S-excl-foot-obs: The three drawn footer lines with their counts and their
  figures.
- S-excl-foot-bypass-screen: A screen that drew fewer lines than it is handed
  could still hide one, which is why the three lines are observed and not only
  typed.
- S-adm-any-length: A ledger of any length, including none and including 500
  rows.
- S-adm-no-rate: A rufiyaa send with no stored rate, which reads with no rate
  clause.
- S-adm-real-cents: A row with real cents or real laari, which keeps them.
- S-adm-no-method: A row with no stored method or an unknown token, which says
  nothing in its place.
- S-adm-failed-read: A failed read, which speaks its notice and lists nothing.
- S-unk-third-currency: A stored send in a currency that is neither USD nor MVR:
  it is listed and counted in the total line, and which currency line should
  hold it is undecided.
- S-unk-owner: The ledger store's decoder owns that risk, because it is the
  boundary that admits the row.
- S-cl-subject: The Statement tab's two lists, as this feature draws them.
- S-cl-safety-stmt: No row and no footer line of the Statement can be built
  stating money the ledger does not hold.
- S-cl-safety-note: No checker ran: the owner waived formal verification and no
  checker is installed, so this claim rests on the compiler and on the observed
  oracles, which is why it is not PASS.
- S-cl-safety-assume: The claim assumes that every row reaching the projection
  was decoded by the ledger store and that no writer outside src/ bypassed the
  migration's constraints.
- S-cl-inhab-stmt: At least one intended reading of each kind - a rufiyaa row, a
  dollar row and all three footer lines - can be built from admitted stored
  rows.
- S-cl-inhab-input: A seeded rufiyaa send with laari and a four-decimal rate, a
  seeded dollar send with real cents, and a seeded repayment, all stored through
  the real adapter.
- S-cl-inhab-obs: The drawn MVR cell, the drawn USD cell and the three drawn
  footer lines.
- S-cl-reach-stmt: Those readings are reachable at the public port: the built
  bundle over the served origin draws them where a reading can observe them.
- S-cl-reach-obs: The Statement screen as Chrome paints it at 360x780 after
  signing in and tapping Statement.
- S-cl-runtime-note: Nothing of this feature is built yet, so no runtime
  observation exists and the runtime axis is DESIGNED_NOT_BUILT rather than
  OBSERVED.
- S-cl-live-na: Liveness does not apply: one synchronous pure projection drawn
  in a single paint has no progress obligation, no queue, no scheduler and no
  fairness assumption to state.
- S-model-na: No model is delivered: the owner waived formal verification for
  this Request and no checker is installed on this host, so there is no model
  file, no run and no mutant to cite.
- S-scen-na: No scenario is delivered: a scenario is read from the raw trace of
  a model run, and no model was run under the recorded waiver.
- S-c-mvr-cell-fit: The widest rufiyaa reading this list can hold is
  'MVR99,999@20'. The owner states that no send ever carries laari and that five
  digits is the maximum, in their own words 'but there is no possibility of
  laari ever..' and 'maximum digit would be 5 digits. it would not go 100,000.
  99,999 is maximum width', and every rate of this ledger reads two characters.
  That reading needs about 85 px at the phone's 360 px width, so the MVR column
  is 90 px instead of the board's 84 px: the 5 px left over carry the difference
  between the fallback type family these widths were taken in and the web family
  the phone reads, and the 6 px come from the party column. The cell never wraps
  and gathers its figure and its rate to its right edge, so a reading wider than
  its column runs towards the party column, which is the one reading allowed to
  give way, and no figure is ever clipped. Outside the owner's stated range a
  reading still runs over: 'MVR10,000@15.4' needs about 94 px and
  'MVR10,000.50@20' about 102 px, and the residue the design accepts there is
  that a party name filling its own column, where it is already cut with an
  ellipsis, can have its last characters run over while the figures stay whole.

### Targets (Shared design)

| Path | Decision | Reason |
|---|---|---|
| `src/domain/money.ts` | EXTEND | S-t-money |
| `src/domain/statement.ts` | EXTEND | S-t-domain |
| `src/ui/statement.ts` | EXTEND | S-t-ui |
| `src/ui/theme.css` | EXTEND | S-t-css |

### Paradigm (Shared design)

functional

### Decisions (Shared design)

S-d-algebra-domain, S-d-algebra-application, S-d-algebra-adapter,
S-d-algebra-infra, S-d-carrier-mvr, S-d-carrier-usd, S-d-carrier-foot,
S-d-carrier-effects, S-d-closure-safety, S-d-closure-inhabitation,
S-d-closure-reachability, S-d-closure-liveness, S-d-fv-waiver, S-d-fv-mapping,
S-d-fv-absent, S-d-type-exclusion-mvr, S-d-type-exclusion-foot,
S-d-type-admitted-rate, S-d-type-strength, S-d-type-cannot-distinguish,
S-d-repr-change, S-d-repr-preserved, S-d-pbt-properties, S-d-pbt-generator,
S-d-pbt-seed, S-d-pbt-independent, S-d-res-stressor-rate,
S-d-res-stressor-length, S-d-res-stressor-read, S-d-res-stressor-currency,
S-d-res-spof, S-d-res-bypass, S-d-res-second-walk, S-d-res-states,
S-d-reuse-money, S-d-reuse-count, S-d-reuse-dash, S-d-reuse-no-conversion,
S-d-supersede, S-d-confirm-order, S-d-confirm-empty, S-d-confirm-llm-job,
S-d-open-none, S-d-spec-migration, S-d-refuted-dropzeros, S-d-refuted-onecell,
S-d-paradigm, S-d-hook-contract, S-d-mvr-cell-spacing

### Oracle (Shared design)

tests/acceptance/statement-sent.spec.ts

### Acceptance supports (Shared design)

```json
[
  "tests/support/oracle-observation.mjs",
  "tests/support/local-stack.ts",
  "tests/support/accounts.ts"
]
```

### Oracle verification index (Shared design)

```json
0
```

### Purpose (Shared design)

S-purpose

### Constraints (Shared design)

S-c-stored-minor, S-c-rate-range, S-c-no-upper-bound, S-c-row-figure-rule,
S-c-total-two-decimals, S-c-count-wording, S-c-board-grid, S-c-board-colours,
S-c-header-type, S-c-header-type-deviation, S-c-back-grid-deviation,
S-c-untouched, S-c-privacy, S-c-public-port, S-c-hooks-kept, S-c-read-only,
S-c-mvr-cell-fit

### Inherits (Shared design)

None

### Boundaries (Shared design)

```json
{
  "driving_port": {
    "ref": "S-b-driving"
  },
  "driven_ports": [
    {
      "ref": "S-b-driven-store"
    },
    {
      "ref": "S-b-driven-dom"
    }
  ],
  "dependency_direction": {
    "ref": "S-b-direction"
  },
  "failures": [
    {
      "condition": {
        "ref": "S-b-fail-read"
      },
      "outcome": "Retry",
      "observation": {
        "ref": "S-b-fail-read-obs"
      }
    },
    {
      "condition": {
        "ref": "S-b-fail-rate"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "S-b-fail-rate-obs"
      }
    },
    {
      "condition": {
        "ref": "S-b-fail-method"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "S-b-fail-method-obs"
      }
    },
    {
      "condition": {
        "ref": "S-b-fail-currency"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "S-b-fail-currency-obs"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Public oracle (Shared design)

```json
{
  "observation": {
    "ref": "S-po-observation"
  },
  "stimulus": {
    "ref": "S-po-stimulus"
  },
  "expected": {
    "ref": "S-po-expected"
  },
  "falsifier": {
    "ref": "S-po-falsifier"
  }
}
```

### Architectural tests (Shared design)

```json
{
  "obligations": [
    {
      "id": "archInwardAndSilent",
      "obligation": {
        "ref": "S-at-obligation"
      },
      "oracle": "tests/acceptance/statement-sent.spec.ts",
      "verification_index": 0
    }
  ],
  "applicability": "applicable"
}
```

### Contract tests (Shared design)

```json
{
  "obligations": [
    {
      "id": "ctStoredRow",
      "obligation": {
        "ref": "S-ct-obligation"
      },
      "contract": "Stored entry row",
      "producer": "supabase/migrations/0001_account_scoped_ledger.sql:23",
      "consumer": "src/ports/ledger-store.ts:1",
      "observation": {
        "ref": "S-ct-observation"
      },
      "oracle": "tests/acceptance/statement-sent.spec.ts",
      "verification_index": 0
    }
  ],
  "applicability": "applicable"
}
```

### Prefactoring (Shared design)

```json
{
  "reason": {
    "ref": "S-pf-na"
  },
  "applicability": "not_applicable"
}
```

### Agreement analysis (Shared design)

| Id | Contract | Role | Locator | Decision | Reason |
|---|---|---|---|---|---|
| hooksProducer | Statement DOM hook contract | producer | `src/ui/statement.ts:16` | MIGRATED | S-ag-hooks-producer |
| hooksSentSpec | Statement DOM hook contract | consumer | `tests/acceptance/statement-sent.spec.ts:484` | MIGRATED | S-ag-hooks-sent-spec |
| hooksListsSpec | Statement DOM hook contract | consumer | `tests/acceptance/statement-lists.spec.ts:579` | MIGRATED | S-ag-hooks-lists-spec |
| hooksMotionSpec | Statement DOM hook contract | consumer | `tests/acceptance/statement-motion.spec.ts:482` | MIGRATED | S-ag-hooks-motion-spec |
| usdProducer | USD figure wording | producer | `src/domain/money.ts:40` | UNCHANGED_COMPATIBLE | S-ag-usd-producer |
| usdHome | USD figure wording | consumer | `src/ui/home.ts:238` | UNCHANGED_COMPATIBLE | S-ag-usd-home |
| usdSheet | USD figure wording | consumer | `src/ui/entry-sheet.ts:197` | UNCHANGED_COMPATIBLE | S-ag-usd-sheet |
| usdStatement | USD figure wording | consumer | `src/domain/statement.ts:201` | MIGRATED | S-ag-usd-statement-domain |
| storedProducer | Stored entry row | producer | `supabase/migrations/0001_account_scoped_ledger.sql:23` | UNCHANGED_COMPATIBLE | S-ag-stored-producer |
| storedPort | Stored entry row | consumer | `src/ports/ledger-store.ts:1` | UNCHANGED_COMPATIBLE | S-ag-stored-port |

### Reuse analysis (Shared design)

| Symbol | Locator | Decision | Reason |
|---|---|---|---|
| formatUsdCents | `src/domain/money.ts:40` | REUSE | S-ru-usd-cents |
| formatMvrLaari | `src/domain/money.ts:87` | REUSE | S-ru-mvr-laari |
| formatRatePlain | `src/domain/money.ts:117` | REUSE | S-ru-rate-plain |
| entryCountLabel | `src/domain/ledger-view.ts:130` | REUSE | S-ru-count-label |
| withoutCurrencySign | `src/domain/statement.ts:159` | REPLACE | S-ru-without-sign |
| rowOf | `src/domain/statement.ts:190` | EXTEND | S-ru-row-of |
| listOf | `src/domain/statement.ts:214` | EXTEND | S-ru-list-of |
| sublineOf | `src/domain/statement.ts:170` | EXTEND | S-ru-subline-of |
| renderPanel | `src/ui/statement.ts:240` | EXTEND | S-ru-render-panel |
| renderSentRow | `src/ui/statement.ts:173` | EXTEND | S-ru-render-sent |
| renderBackRow | `src/ui/statement.ts:208` | EXTEND | S-ru-render-back |
| renderLine | `src/ui/statement.ts:165` | REUSE | S-ru-render-line |
| MINUS | `src/ui/statement.ts:47` | REUSE | S-ru-minus |
| SENT_COLUMNS | `src/ui/statement.ts:64` | EXTEND | S-ru-sent-columns |
| BACK_COLUMNS | `src/ui/statement.ts:67` | EXTEND | S-ru-back-columns |
| .statement-head-row and .statement-row grid | `src/ui/theme.css:2524` | EXTEND | S-ru-grid-css |
| .statement-usd | `src/ui/theme.css:2582` | EXTEND | S-ru-usd-css |
| .statement-foot | `src/ui/theme.css:2588` | EXTEND | S-ru-foot-css |
| formatUsdWhole | `src/domain/money.ts:118` | CREATE_NEW | S-ru-usd-whole |
| formatMvrAmount | `src/domain/money.ts:90` | CREATE_NEW | S-ru-mvr-amount |
| StatementMvrCell | `src/domain/statement.ts:99` | CREATE_NEW | S-ru-mvr-cell |
| SentFoot | `src/domain/statement.ts:110` | CREATE_NEW | S-ru-sent-foot |

### Impact closure (Shared design)

```json
{
  "items": [
    {
      "kind": "public_interface",
      "locator": "src/domain/money.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "S-ic-target"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/domain/statement.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "S-ic-target"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/ui/statement.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "S-ic-target"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/ui/theme.css",
      "decision": "CHANGED",
      "reason": {
        "ref": "S-ic-target"
      }
    },
    {
      "kind": "consumer",
      "locator": "src/domain/statement.ts:201",
      "decision": "MIGRATED",
      "reason": {
        "ref": "S-ic-consumer-migrated"
      }
    },
    {
      "kind": "consumer",
      "locator": "src/ui/home.ts:238",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "S-ic-consumer-unchanged"
      }
    },
    {
      "kind": "consumer",
      "locator": "src/ui/entry-sheet.ts:197",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "S-ic-consumer-unchanged"
      }
    },
    {
      "kind": "consumer",
      "locator": "src/ports/ledger-store.ts:1",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "S-ic-consumer-unchanged"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:484",
      "decision": "MIGRATED",
      "reason": {
        "ref": "S-ic-test-migrated"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:579",
      "decision": "MIGRATED",
      "reason": {
        "ref": "S-ic-test-migrated"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-motion.spec.ts:482",
      "decision": "MIGRATED",
      "reason": {
        "ref": "S-ic-test-migrated"
      }
    },
    {
      "kind": "fixture",
      "locator": "tests/support/oracle-observation.mjs",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "S-ic-build-unchanged"
      }
    },
    {
      "kind": "discovery",
      "locator": "tests/playwright.config.ts",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "S-ic-build-unchanged"
      }
    },
    {
      "kind": "manifest",
      "locator": "package.json",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "S-ic-build-unchanged"
      }
    },
    {
      "kind": "lock",
      "locator": "package-lock.json",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "S-ic-build-unchanged"
      }
    },
    {
      "kind": "runtime",
      "locator": "supabase/migrations/0001_account_scoped_ledger.sql:23",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "S-ic-runtime-unchanged"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Adr (Shared design)

```json
{
  "context": {
    "ref": "S-adr-context"
  },
  "decision": {
    "ref": "S-adr-decision"
  },
  "alternatives": [
    {
      "ref": "S-adr-alt-screen"
    },
    {
      "ref": "S-adr-alt-formatter"
    },
    {
      "ref": "S-adr-alt-nullable"
    }
  ],
  "consequences": [
    {
      "ref": "S-adr-cons-one-owner"
    },
    {
      "ref": "S-adr-cons-shapes"
    },
    {
      "ref": "S-adr-cons-header"
    }
  ],
  "status": "proposed",
  "applicability": "applicable"
}
```

### Architect handoff (Shared design)

```json
{
  "sections": [
    {
      "kind": "laws",
      "scope": "shared",
      "status": {
        "payload": {
          "observations": [
            {
              "id": "obMvrCell",
              "description": {
                "ref": "S-ob-mvr-desc"
              },
              "result_type": "string",
              "cannot_distinguish": {
                "ref": "S-ob-mvr-blind"
              }
            },
            {
              "id": "obUsdCell",
              "description": {
                "ref": "S-ob-usd-desc"
              },
              "result_type": "string",
              "cannot_distinguish": {
                "ref": "S-ob-usd-blind"
              }
            },
            {
              "id": "obSubLine",
              "description": {
                "ref": "S-ob-sub-desc"
              },
              "result_type": "string or nothing",
              "cannot_distinguish": {
                "ref": "S-ob-sub-blind"
              }
            },
            {
              "id": "obSentFoot",
              "description": {
                "ref": "S-ob-foot-desc"
              },
              "result_type": "three lines of label, count wording and figures",
              "cannot_distinguish": {
                "ref": "S-ob-foot-blind"
              }
            },
            {
              "id": "obScreenSource",
              "description": {
                "ref": "S-ob-src-desc"
              },
              "result_type": "string",
              "cannot_distinguish": {
                "ref": "S-ob-src-blind"
              }
            }
          ],
          "equality": {
            "under": [
              "obMvrCell",
              "obUsdCell",
              "obSubLine",
              "obSentFoot"
            ],
            "definition": {
              "ref": "S-eq-def"
            }
          },
          "constructors": [
            {
              "id": "statementOf",
              "signature": "(entries: readonly StatementEntry[]) => Statement"
            },
            {
              "id": "mvrCellOf",
              "signature": "(entry: StatementEntry) => StatementMvrCell"
            },
            {
              "id": "sentFootOf",
              "signature": "(sends: readonly StatementEntry[]) => SentFoot"
            },
            {
              "id": "formatUsdWhole",
              "signature": "(cents: number) => string"
            },
            {
              "id": "formatMvrAmount",
              "signature": "(laari: number) => string"
            },
            {
              "id": "renderStatement",
              "signature": "(ledger: ReadEntriesOutcome) => HTMLElement"
            }
          ],
          "generators": [
            {
              "id": "genLedger",
              "domain": {
                "ref": "S-gen-domain"
              },
              "size_bound": 40,
              "seed_policy": {
                "ref": "S-gen-seed"
              },
              "must_include": [
                {
                  "ref": "S-gen-inc-whole-usd"
                },
                {
                  "ref": "S-gen-inc-cents-usd"
                },
                {
                  "ref": "S-gen-inc-whole-mvr"
                },
                {
                  "ref": "S-gen-inc-laari-mvr"
                },
                {
                  "ref": "S-gen-inc-no-mvr"
                },
                {
                  "ref": "S-gen-inc-no-usd"
                },
                {
                  "ref": "S-gen-inc-empty"
                }
              ],
              "depth_bound": null
            }
          ],
          "laws": [
            {
              "id": "lawStoredDollars",
              "statement": {
                "ref": "S-law-stored-dollars"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::rowOf",
              "uses": [
                "obUsdCell"
              ],
              "treatment": {
                "generator": "genLedger",
                "independent_observation": {
                  "ref": "S-law-independent-dollars"
                },
                "falsifier": {
                  "description": {
                    "ref": "S-law-falsifier-dollars"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "lawRowMark",
              "statement": {
                "ref": "S-law-row-mark"
              },
              "kind": "roundtrip",
              "layer": "domain",
              "owner": "src/domain/money.ts::formatUsdWhole",
              "uses": [
                "obUsdCell",
                "obMvrCell"
              ],
              "treatment": {
                "generator": "genLedger",
                "independent_observation": {
                  "ref": "S-law-independent-mark"
                },
                "falsifier": {
                  "description": {
                    "ref": "S-law-falsifier-mark"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "lawNoRounding",
              "statement": {
                "ref": "S-law-no-rounding"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/money.ts::formatMvrAmount",
              "uses": [
                "obUsdCell",
                "obMvrCell"
              ],
              "treatment": {
                "generator": "genLedger",
                "independent_observation": {
                  "ref": "S-law-independent-rounding"
                },
                "falsifier": {
                  "description": {
                    "ref": "S-law-falsifier-rounding"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "lawFootPartition",
              "statement": {
                "ref": "S-law-foot-partition"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::sentFootOf",
              "uses": [
                "obSentFoot"
              ],
              "treatment": {
                "generator": "genLedger",
                "independent_observation": {
                  "ref": "S-law-independent-partition"
                },
                "falsifier": {
                  "description": {
                    "ref": "S-law-falsifier-partition"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "lawFootTotal",
              "statement": {
                "ref": "S-law-foot-total"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::sentFootOf",
              "uses": [
                "obSentFoot"
              ],
              "treatment": {
                "generator": "genLedger",
                "independent_observation": {
                  "ref": "S-law-independent-total"
                },
                "falsifier": {
                  "description": {
                    "ref": "S-law-falsifier-total"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "lawCountWording",
              "statement": {
                "ref": "S-law-count-wording"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::listOf",
              "uses": [
                "obSentFoot"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "S-law-case-count-none"
                  },
                  {
                    "ref": "S-law-case-count-one"
                  },
                  {
                    "ref": "S-law-case-count-many"
                  }
                ],
                "reason": {
                  "ref": "S-law-reason-finite"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "lawTotalsDecimals",
              "statement": {
                "ref": "S-law-totals-decimals"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::sentFootOf",
              "uses": [
                "obSentFoot"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "S-law-case-totals"
                  }
                ],
                "reason": {
                  "ref": "S-law-reason-finite"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "lawRetryDrawsNothing",
              "statement": {
                "ref": "S-law-retry"
              },
              "kind": "invariant",
              "layer": "application",
              "owner": "src/ui/statement.ts::renderStatement",
              "uses": [
                "obSentFoot",
                "obUsdCell"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "S-law-case-retry"
                  }
                ],
                "reason": {
                  "ref": "S-law-reason-finite"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "lawScreenSilent",
              "statement": {
                "ref": "S-law-screen-silent"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts",
              "uses": [
                "obScreenSource"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "S-law-case-source"
                  }
                ],
                "reason": {
                  "ref": "S-law-reason-finite"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            }
          ],
          "refuted": [
            {
              "id": "refDropZeros",
              "statement": {
                "ref": "S-d-refuted-dropzeros"
              },
              "cause": "law_scope",
              "counterexample": {
                "ref": "S-law-case-totals"
              },
              "run": null
            },
            {
              "id": "refOneUsdText",
              "statement": {
                "ref": "S-d-refuted-onecell"
              },
              "cause": "carrier",
              "counterexample": {
                "ref": "S-ob-usd-desc"
              },
              "run": null
            }
          ]
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "construction",
      "scope": "shared",
      "status": {
        "payload": {
          "claims": [
            {
              "id": "exclMvrCell",
              "proposition": {
                "ref": "S-excl-mvr-prop"
              },
              "harm": {
                "ref": "S-excl-mvr-harm"
              },
              "owner": "src/domain/statement.ts",
              "admitted_input": {
                "ref": "S-excl-mvr-input"
              },
              "constructor": "src/domain/statement.ts::mvrCellOf",
              "consumer": "src/ui/statement.ts::renderSentRow",
              "public_observation": {
                "ref": "S-excl-mvr-obs"
              },
              "bypass": [
                {
                  "ref": "S-excl-mvr-bypass-cast"
                },
                {
                  "ref": "S-excl-mvr-bypass-writer"
                }
              ],
              "strength": "gradual_checker"
            },
            {
              "id": "exclSentFoot",
              "proposition": {
                "ref": "S-excl-foot-prop"
              },
              "harm": {
                "ref": "S-excl-foot-harm"
              },
              "owner": "src/domain/statement.ts",
              "admitted_input": {
                "ref": "S-excl-foot-input"
              },
              "constructor": "src/domain/statement.ts::sentFootOf",
              "consumer": "src/ui/statement.ts::renderPanel",
              "public_observation": {
                "ref": "S-excl-foot-obs"
              },
              "bypass": [
                {
                  "ref": "S-excl-foot-bypass-screen"
                }
              ],
              "strength": "gradual_checker"
            }
          ],
          "admitted": [
            {
              "ref": "S-adm-any-length"
            },
            {
              "ref": "S-adm-no-rate"
            },
            {
              "ref": "S-adm-real-cents"
            },
            {
              "ref": "S-adm-no-method"
            },
            {
              "ref": "S-adm-failed-read"
            }
          ],
          "excluded": [
            {
              "ref": "S-excl-mvr-prop"
            },
            {
              "ref": "S-excl-foot-prop"
            }
          ],
          "unknown": [
            {
              "state": {
                "ref": "S-unk-third-currency"
              },
              "risk_owner": {
                "ref": "S-unk-owner"
              }
            }
          ]
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "model",
      "scope": "shared",
      "status": {
        "reason": {
          "ref": "S-model-na"
        },
        "tag": "not_applicable"
      }
    },
    {
      "kind": "closure",
      "scope": "shared",
      "status": {
        "payload": {
          "closures": [
            {
              "subject": {
                "ref": "S-cl-subject"
              },
              "safety": {
                "statement": {
                  "ref": "S-cl-safety-stmt"
                },
                "design": "BLOCKED",
                "design_note": {
                  "ref": "S-cl-safety-note"
                },
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": null,
                "assumptions": [
                  {
                    "ref": "S-cl-safety-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "lawStoredDollars",
                  "lawRowMark",
                  "lawNoRounding",
                  "lawFootPartition",
                  "lawFootTotal"
                ],
                "basis": {
                  "claims": [
                    "exclMvrCell",
                    "exclSentFoot"
                  ],
                  "tag": "constructed"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "S-cl-inhab-stmt"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "S-cl-runtime-note"
                },
                "assumptions": [
                  {
                    "ref": "S-c-rate-range"
                  }
                ],
                "runs": [],
                "laws": [
                  "lawRowMark",
                  "lawCountWording"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "S-cl-inhab-input"
                  },
                  "producer": "src/domain/statement.ts::statementOf",
                  "consumer": "src/ui/statement.ts::renderStatement",
                  "public_observation": {
                    "ref": "S-cl-inhab-obs"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "S-cl-reach-stmt"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": null,
                "assumptions": [
                  {
                    "ref": "S-c-public-port"
                  }
                ],
                "runs": [],
                "laws": [
                  "lawRetryDrawsNothing"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "S-po-stimulus"
                  },
                  "producer": "src/ui/statement.ts::renderStatement",
                  "consumer": "src/ui/theme.css",
                  "public_observation": {
                    "ref": "S-cl-reach-obs"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "reason": {
                  "ref": "S-cl-live-na"
                },
                "tag": "not_applicable"
              }
            }
          ]
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "scenarios",
      "scope": "shared",
      "status": {
        "reason": {
          "ref": "S-scen-na"
        },
        "tag": "not_applicable"
      }
    }
  ]
}
```

### Product change (Shared design)

Product change: required

### Verification (Shared design)

Verification command:

```sh
node tests/support/oracle-observation.mjs tests/acceptance/statement-sent.spec.ts
```

Verification command:

```sh
npm run build
```

## Value 2

### Facts (Value 2)

- B-purpose: The Sent for Abbaas footer reads three lines in one block: what
  went in rufiyaa with its dollar value beside it and no brackets round it, what
  went in dollars, and, under a thin divider, the total of both, each line with
  its label at the left and its figures at the right and its count worded as
  this app words a count.
- B-c-rows-stay: The sending list's columns, cells and row figures are already
  as the previous value draws them and nothing here changes a row.
- B-c-back-foot-stays: The paid-back footer keeps its one line, its words, its
  tinted teal bed and its hooks exactly as they are.
- B-c-foot-pinned: The footer stays outside the scrolling area and rises as one
  part, as it does today, so the three lines arrive together.
- B-c-zero-lines: All three lines are drawn at every ledger, so a ledger with no
  rufiyaa send reads 'Sent in MVR' with 'No entries', 'MVR0' and '$0.00', and a
  ledger with no dollar send reads its dollar line at zero.
- B-c-total-label: The last line's label reads 'Total Sent' with a capital S,
  where today's single line reads 'Total sent'.
- B-d-domain: src/domain/statement.ts gains sentFootOf, which takes the sends of
  the read ledger and returns SentFoot: the rufiyaa line from the sends stored
  in MVR, with their laari summed and worded by formatMvrAmount and their stored
  dollars summed and worded by formatUsdCents with no brackets round it; the
  dollar line from the sends stored in USD; and the total line from every send.
  Each line carries its count and its count label from entryCountLabel.
- B-d-partition: A line's membership is the stored currency of the entry, never
  a drawn text: a send stored in neither currency is counted on the total line
  alone, which is why the two currency counts are checked against the number of
  sends rather than assumed to exhaust it.
- B-d-ui: src/ui/statement.ts draws the sent footer as one block of three lines,
  each carrying data-statement-foot-line with its own data-count and data-cents,
  a divider above the last line, and the block's own data-statement-foot,
  data-count and data-cents still reading the total line, so a reader that knew
  only the old hooks still reads the total.
- B-d-panel: renderPanel takes a footer renderer per list as it already takes a
  row renderer, so the sending list draws three lines while the paid-back list
  keeps its one, and neither list's footer is decided by a branch inside the
  shared panel.
- B-d-css: src/ui/theme.css draws the sent footer block as a flex column with a
  6 px gap and padding 10px 14px 12px on the existing #e7eef7 ground in #1b3f6e
  at 13 px weight 700, each line spread between its label and its figures on a
  shared baseline, a 1 px #cfdbea divider above the last line, and the rufiyaa
  and dollar subtotal figures in their own currency inks.
- B-d-closure: Safety stays BLOCKED for this value, because no checker ran;
  inhabitation and public reachability are PASS on the route from the seeded
  sends through sentFootOf to the three drawn lines, and the runtime axis is
  DESIGNED_NOT_BUILT until the oracle runs.
- B-d-residual: Stressor for this value, negating the assumption that every send
  belongs to one of the two currency lines: a send stored in a third currency
  must still be counted on the total line, may degrade to appearing on no
  currency line, must never be dropped from the count or silently added to a
  line it does not belong to, and leaves the residue that the total still
  matches the card. A second stressor, not used to derive the design: a ledger
  of 500 sends must still read every line's count from the stored sends and not
  from the rows in sight.
- B-d-pbt: The properties of this value are checked over generated ledgers: the
  two currency lines partition the sends by stored currency, the total line's
  cents are the sum of the two lines' cents, every count reads as this app words
  a count, and the rufiyaa subtotal is the only footer figure without two
  decimals.
- B-d-migration: This value migrates the sent footer's expected text in four
  consumer specs, and the acceptance designer is the one who migrates each:
  tests/acceptance/statement-sent.spec.ts,
  tests/acceptance/statement-lists.spec.ts, the footer text
  tests/acceptance/statement-motion.spec.ts reads while judging the rise, and
  the footer expectation of the previous value's own oracle at
  tests/acceptance/statement-sent-columns.spec.ts:1032, whose one-line
  derivation at that spec's line 288 is migrated with it. Every motion
  expectation, every row expectation and the paid-back footer's expectation stay
  as they are.
- B-d-prefactor: Before any footer behaviour changes, the footer is moved out of
  renderPanel into a renderer the panel is given, drawing byte for byte what it
  draws today for both lists; the move is measured on the existing sent spec
  before and after, with no behaviour of either footer changed in between.
- B-ru-sent-foot: No type says what a sent footer reads, and three lines that
  must exist at every ledger are a three-place tuple rather than a list that
  could be short.
- B-ru-list-of: Already counts, words and totals one list's rows, so the sending
  list's footer is derived beside it in the module that already owns a footer's
  figures.
- B-ru-count-label: Already words every count this app states, so each of the
  three lines reads its count through it rather than wording its own.
- B-ru-render-panel: Already draws a header, a scrolling area and a footer and
  already takes a row renderer per list, so it takes a footer renderer the same
  way.
- B-ru-foot-css: The rule that paints a footer on its tinted bed, extended with
  the three lines, their gap and their divider.
- B-ru-mvr-amount: Already words a rufiyaa figure with its mark for a row, so
  the rufiyaa subtotal reads through the same formatter.
- B-pf-move: The footer is moved out of renderPanel into a per-list renderer the
  panel is handed, drawing exactly today's one line for both lists.
- B-pf-observation: Both footers keep their words, their counts, their cents and
  their hooks: the sent footer still reads 'Total sent' with its count and its
  two-decimal total, and the paid-back footer still reads 'Total paid back' on
  its teal bed.
- B-ag-foot-producer: src/ui/statement.ts produces the sent footer's text and
  hooks; this value adds two lines, a divider and the per-line hooks, and keeps
  the block's own hooks reading the total.
- B-ag-sent-spec: This spec derives the sent footer's whole expected text from
  the stored sends, which this value replaces with three lines.
- B-ag-lists-spec: This spec derives both footers from one helper, so its
  sending expectation changes while its paid-back expectation stays.
- B-ag-motion-spec: This spec reads the sent footer's text while judging that
  the footer rises as one part, so only that text changes.
- B-ag-columns-spec: The previous value's own oracle reads this footer as one
  line, because that value left it as it was; the three-line block and the
  one-line text are two readings of the same block and cannot both hold, so that
  expectation is migrated here by the acceptance designer while everything else
  it reads stays untouched.
- B-at-obligation: The footer's figures stay decided in src/domain/statement.ts:
  src/ui/statement.ts names no currency mark, no Intl formatter and no
  arithmetic on an amount after the three lines are drawn, and the screen still
  names no adapter, no class and no writing operation.
- B-ct-na: No party can change apart here: the three lines sum the same stored
  rows whose contract is already observed at shared scope, both the producer and
  the consumer of the footer live in one deployable and change in one commit,
  and no persisted or wire shape is touched.
- B-ic-target: This path carries this value's own change to the sent footer and
  no other owner's contract.
- B-ic-test: This spec asserts the sent footer's old text, so its expectation is
  migrated with this value.
- B-b-driving: The driving port is the Statement screen of the built bundle: the
  footer is drawn by renderPanel at src/ui/statement.ts:240 from the statement
  the domain projected.
- B-b-driven: The driven port is the read outcome of src/ports/ledger-store.ts,
  and the document the footer is drawn into is the other driven side.
- B-b-direction: The footer's figures come from the meaning module and the
  footer's shape from the screen; neither imports an adapter.
- B-b-fail-empty: The ledger holds no send at all.
- B-b-fail-empty-obs: All three lines are still drawn, each reading 'No entries'
  with 'MVR0', '$0.00' and '$0.00'.
- B-b-fail-third: A send is stored in a currency that is neither USD nor MVR.
- B-b-fail-third-obs: It is counted and summed on the total line, and on no
  currency line; which line should hold it is undecided.
- B-b-fail-read: The read of the ledger fails before any footer is drawn.
- B-b-fail-read-obs: No footer is drawn at all and the spoken notice stands
  alone.
- B-po-observation: The owner reads the sent footer and sees, in one block, what
  went in rufiyaa with its dollar value beside it in the lighter blue, what went
  in dollars, and the total of both under a thin divider, each line with its
  count in words.
- B-po-stimulus: A ledger seeded through the real stack with four rufiyaa sends
  worth $3,000.00 together and five dollar sends worth $9,500.00 together, read
  by signing in and tapping Statement; then a ledger with dollar sends only;
  then one rufiyaa send added to it.
- B-po-expected: The lines read 'Sent in MVR · 4 entries' with 'MVR60,000' and
  '$3,000.00', 'Sent in USD · 5 entries' with '$9,500.00' and 'Total Sent · 9
  entries' with '$12,500.00'; the dollars-only ledger reads 'Sent in MVR · No
  entries' with 'MVR0' and '$0.00'; and after one rufiyaa send is added that
  line reads '1 entry'.
- B-po-falsifier: A footer that hid a currency line at zero, counted a rufiyaa
  send on the dollar line, wrote the rufiyaa subtotal with two decimals or as
  '60,000/-', put brackets round the MVR line's dollar value, or read 'Total
  sent' with a small s fails the oracle on the line it did it to.
- B-ob-lines: What the three sent footer lines read: each line's label, its
  count wording and its own figures, in the order they are drawn.
- B-ob-lines-blind: They cannot say which entries made up a count, only how many
  and how much.
- B-ob-hooks: What each line's own count and cents attributes say.
- B-ob-hooks-blind: They cannot say whether the drawn text agrees with them;
  that is why both are read.
- B-eq: Two ledgers are equal for this value when all three footer lines read
  the same labels, the same count wordings, the same figures and the same
  per-line counts and cents.
- B-gen-domain: Ledgers of sends stored through the real adapter in either
  currency or in neither, with whole and fractional minor units and dollars
  unrelated to any rate, including ledgers missing one currency entirely and
  ledgers with no send at all.
- B-gen-seed: One printed constant seed for the footer ledgers, replayed exactly
  on a failure; with no property-testing library there is no automatic
  shrinking, so a failing ledger is reported whole and minimised by hand.
- B-gen-inc-both: A ledger with sends in both currencies.
- B-gen-inc-no-mvr: A ledger with no rufiyaa send.
- B-gen-inc-no-usd: A ledger with no dollar send.
- B-gen-inc-empty: A ledger with no send at all.
- B-gen-inc-cents: A ledger whose stored dollars carry real cents, so a subtotal
  is not a round figure.
- B-law-partition: The rufiyaa line counts and sums exactly the sends stored in
  MVR and the dollar line exactly those stored in USD, so neither line holds a
  send of the other currency.
- B-law-partition-ind: The oracle partitions its own seeded sends by stored
  currency and counts and sums them itself.
- B-law-partition-fal: A footer that read a send's drawn text instead of its
  stored currency puts a rufiyaa send on the dollar line as soon as one row's
  text is ambiguous.
- B-law-total: The total line's cents are the sum of the two currency lines'
  cents plus any send in neither currency, and its count is the number of sends.
- B-law-total-ind: The oracle sums the stored dollars of all its seeded sends
  and counts them.
- B-law-total-fal: A total summed from one currency line, or from the rows in
  sight, disagrees with the stored sends as soon as a currency is missing or the
  list is long.
- B-law-counts: Every line reads its count as this app words a count: 'No
  entries' at none, '1 entry' at one and 'N entries' above one.
- B-law-counts-case-zero: A ledger with no rufiyaa send reads 'Sent in MVR · No
  entries'.
- B-law-counts-case-one: A ledger with one rufiyaa send reads 'Sent in MVR · 1
  entry'.
- B-law-counts-case-many: A ledger with four rufiyaa sends reads 'Sent in MVR ·
  4 entries'.
- B-law-counts-reason: A count has exactly three wordings, so the three cases
  exhaust the law.
- B-law-decimals: Every footer figure keeps two decimals except the rufiyaa
  subtotal, which reads like a rufiyaa amount with cents only when they are
  real.
- B-law-decimals-case-round: A rufiyaa subtotal of whole rufiyaa reads
  'MVR60,000' beside '$3,000.00'.
- B-law-decimals-case-laari: A rufiyaa subtotal with real laari keeps its laari
  after its prefix 'MVR'.
- B-law-decimals-reason: A subtotal is either whole or not, so the two cases
  exhaust the law.
- B-law-three: All three lines are drawn at every ledger, the empty one
  included, and a divider stands above the last.
- B-law-three-case: A ledger with no send at all still reads three lines and one
  divider.
- B-law-three-reason: The footer's shape is one closed reading of three lines,
  so one case over the hardest ledger exhausts it.
- B-excl-prop: A sent footer of this value cannot be built with fewer than three
  lines, and no currency line can be built without its count and its cents.
- B-excl-harm: The owner would read the currency split as absent, or a count
  that its own figures do not match.
- B-excl-input: Every send of one read ledger, in any order and any number, a
  ledger with none included.
- B-excl-obs: The three drawn lines with their counts, their cents and their
  figures.
- B-excl-bypass-screen: A screen handed three lines could still draw two, which
  is why the drawn lines are observed and not only the type.
- B-excl-bypass-css: A stylesheet that collapsed a line to no height would hide
  it from the owner while the type still held it.
- B-adm-missing-currency: A ledger with no send in one currency, whose line
  reads at zero.
- B-adm-empty: A ledger with no send at all, whose three lines all read at zero.
- B-adm-long: A ledger of 500 sends, whose counts come from the stored sends.
- B-unk-third: A send stored in a currency that is neither USD nor MVR: which
  currency line should hold it is undecided.
- B-unk-owner: That risk belongs to the ledger store's decoder, the boundary
  that admits a row in an unknown currency.
- B-cl-subject: The Sent for Abbaas footer's three lines.
- B-cl-safety: No sent footer can be built that states a currency split its own
  sends do not add up to.
- B-cl-safety-note: No checker ran under the recorded waiver, so this claim
  rests on the compiler, on the tuple shape and on the observed lines rather
  than on a proof.
- B-cl-safety-assume: It assumes every send reaching the projection was decoded
  by the ledger store with its stored currency intact.
- B-cl-inhab: A footer reading a rufiyaa line, a dollar line and a total line
  can be built from admitted stored sends, including from none at all.
- B-cl-inhab-input: Four seeded rufiyaa sends and five seeded dollar sends, and
  separately a ledger with no send.
- B-cl-inhab-obs: The three drawn lines, each read with its label, its count
  wording and its figures.
- B-cl-inhab-assume: It assumes a send's stored currency is one the decoder
  preserved, and that the entryCountLabel wording is unchanged.
- B-cl-reach: Those three lines are reachable at the public port, where the
  built bundle draws them under the scrolling rows.
- B-cl-reach-obs: The pinned footer as Chrome paints it at 360x780 after signing
  in and tapping Statement.
- B-cl-reach-assume: It assumes the footer stays outside the scrolling area, as
  the panel draws it today.
- B-cl-runtime: No footer line of this value is built yet, so there is no
  runtime observation of it.
- B-cl-live: Liveness does not apply to this value: the footer is drawn in the
  same synchronous paint as its rows and has no progress obligation.
- B-adr-na: This value records no decision of its own beyond the shared ADR:
  footer F1 is the authority for the three lines, their order, their divider and
  their colours.
- B-model-na: No model is delivered for this value: the owner's waiver stands
  and no checker is installed on this host.
- B-scen-na: No scenario is delivered for this value: a scenario is read from a
  model trace, and no model was run for it.
- B-ru-usd-cents: Already words a two-decimal dollar figure, so the footer's
  dollar subtotals and the rufiyaa line's dollar value read through it unchanged
  and with no brackets.

### Targets (Value 2)

| Path | Decision | Reason |
|---|---|---|
| `src/domain/statement.ts` | EXTEND | B-d-domain |
| `src/ui/statement.ts` | EXTEND | B-d-ui |
| `src/ui/theme.css` | EXTEND | B-d-css |

### Paradigm (Value 2)

functional

### Decisions (Value 2)

B-d-domain, B-d-partition, B-d-ui, B-d-panel, B-d-css, B-d-closure,
B-d-residual, B-d-pbt, B-d-migration, B-d-prefactor, S-d-algebra-domain,
S-d-algebra-application, S-d-carrier-foot, S-d-carrier-effects, S-d-fv-waiver,
S-d-fv-absent, S-d-type-exclusion-foot, S-d-type-strength,
S-d-type-cannot-distinguish, S-d-pbt-seed, S-d-pbt-independent,
S-d-res-stressor-length, S-d-res-stressor-currency, S-d-res-spof,
S-d-reuse-count, S-d-reuse-money, S-d-confirm-empty, S-d-paradigm,
S-d-hook-contract, S-d-supersede, S-d-refuted-dropzeros

### Oracle (Value 2)

tests/acceptance/statement-sent-footer.spec.ts

### Acceptance supports (Value 2)

```json
[
  "tests/support/oracle-observation.mjs",
  "tests/support/local-stack.ts",
  "tests/support/accounts.ts"
]
```

### Oracle verification index (Value 2)

```json
0
```

### Purpose (Value 2)

B-purpose

### Constraints (Value 2)

S-c-stored-minor, S-c-no-upper-bound, S-c-total-two-decimals, S-c-count-wording,
S-c-board-colours, S-c-untouched, S-c-privacy, S-c-public-port, S-c-hooks-kept,
S-c-read-only, B-c-rows-stay, B-c-back-foot-stays, B-c-foot-pinned,
B-c-zero-lines, B-c-total-label

### Inherits (Value 2)

None

### Boundaries (Value 2)

```json
{
  "driving_port": {
    "ref": "B-b-driving"
  },
  "driven_ports": [
    {
      "ref": "B-b-driven"
    }
  ],
  "dependency_direction": {
    "ref": "B-b-direction"
  },
  "failures": [
    {
      "condition": {
        "ref": "B-b-fail-empty"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "B-b-fail-empty-obs"
      }
    },
    {
      "condition": {
        "ref": "B-b-fail-third"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "B-b-fail-third-obs"
      }
    },
    {
      "condition": {
        "ref": "B-b-fail-read"
      },
      "outcome": "Retry",
      "observation": {
        "ref": "B-b-fail-read-obs"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Public oracle (Value 2)

```json
{
  "observation": {
    "ref": "B-po-observation"
  },
  "stimulus": {
    "ref": "B-po-stimulus"
  },
  "expected": {
    "ref": "B-po-expected"
  },
  "falsifier": {
    "ref": "B-po-falsifier"
  }
}
```

### Architectural tests (Value 2)

```json
{
  "obligations": [
    {
      "id": "archFooterSilentScreen",
      "obligation": {
        "ref": "B-at-obligation"
      },
      "oracle": "tests/acceptance/statement-sent-footer.spec.ts",
      "verification_index": 0
    }
  ],
  "applicability": "applicable"
}
```

### Contract tests (Value 2)

```json
{
  "reason": {
    "ref": "B-ct-na"
  },
  "applicability": "not_applicable"
}
```

### Prefactoring (Value 2)

```json
{
  "existing_oracle": "tests/acceptance/statement-sent.spec.ts",
  "move": {
    "ref": "B-pf-move"
  },
  "preserved_observation": {
    "ref": "B-pf-observation"
  },
  "verification": [
    [
      "node",
      "tests/support/oracle-observation.mjs",
      "tests/acceptance/statement-sent.spec.ts"
    ]
  ],
  "acceptance_supports": [
    "tests/support/oracle-observation.mjs",
    "tests/support/local-stack.ts",
    "tests/support/accounts.ts"
  ],
  "applicability": "applicable"
}
```

### Agreement analysis (Value 2)

| Id | Contract | Role | Locator | Decision | Reason |
|---|---|---|---|---|---|
| footProducer | Sent footer contract | producer | `src/ui/statement.ts:261` | MIGRATED | B-ag-foot-producer |
| footSentSpec | Sent footer contract | consumer | `tests/acceptance/statement-sent.spec.ts:175` | MIGRATED | B-ag-sent-spec |
| footListsSpec | Sent footer contract | consumer | `tests/acceptance/statement-lists.spec.ts:200` | MIGRATED | B-ag-lists-spec |
| footMotionSpec | Sent footer contract | consumer | `tests/acceptance/statement-motion.spec.ts:482` | MIGRATED | B-ag-motion-spec |
| footColumnsSpec | Sent footer contract | consumer | `tests/acceptance/statement-sent-columns.spec.ts:1032` | MIGRATED | B-ag-columns-spec |

### Reuse analysis (Value 2)

| Symbol | Locator | Decision | Reason |
|---|---|---|---|
| SentFoot | `src/domain/statement.ts:110` | CREATE_NEW | B-ru-sent-foot |
| listOf | `src/domain/statement.ts:214` | EXTEND | B-ru-list-of |
| entryCountLabel | `src/domain/ledger-view.ts:130` | REUSE | B-ru-count-label |
| renderPanel | `src/ui/statement.ts:240` | EXTEND | B-ru-render-panel |
| .statement-foot | `src/ui/theme.css:2588` | EXTEND | B-ru-foot-css |
| formatUsdCents | `src/domain/money.ts:40` | REUSE | B-ru-usd-cents |
| formatMvrAmount | `src/domain/money.ts:90` | REUSE | B-ru-mvr-amount |

### Impact closure (Value 2)

```json
{
  "items": [
    {
      "kind": "public_interface",
      "locator": "src/domain/statement.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "B-ic-target"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/ui/statement.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "B-ic-target"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/ui/theme.css",
      "decision": "CHANGED",
      "reason": {
        "ref": "B-ic-target"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:175",
      "decision": "MIGRATED",
      "reason": {
        "ref": "B-ic-test"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:200",
      "decision": "MIGRATED",
      "reason": {
        "ref": "B-ic-test"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-motion.spec.ts:482",
      "decision": "MIGRATED",
      "reason": {
        "ref": "B-ic-test"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:1032",
      "decision": "MIGRATED",
      "reason": {
        "ref": "B-ic-test"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Adr (Value 2)

```json
{
  "reason": {
    "ref": "B-adr-na"
  },
  "applicability": "not_applicable"
}
```

### Architect handoff (Value 2)

```json
{
  "sections": [
    {
      "kind": "laws",
      "scope": "value:2",
      "status": {
        "payload": {
          "observations": [
            {
              "id": "v2ObLines",
              "description": {
                "ref": "B-ob-lines"
              },
              "result_type": "three lines of label, count wording and figures",
              "cannot_distinguish": {
                "ref": "B-ob-lines-blind"
              }
            },
            {
              "id": "v2ObHooks",
              "description": {
                "ref": "B-ob-hooks"
              },
              "result_type": "three pairs of count and cents",
              "cannot_distinguish": {
                "ref": "B-ob-hooks-blind"
              }
            }
          ],
          "equality": {
            "under": [
              "v2ObLines",
              "v2ObHooks"
            ],
            "definition": {
              "ref": "B-eq"
            }
          },
          "constructors": [
            {
              "id": "v2SentFootOf",
              "signature": "(sends: readonly StatementEntry[]) => SentFoot"
            },
            {
              "id": "v2RenderSentFoot",
              "signature": "(foot: SentFoot) => HTMLElement"
            },
            {
              "id": "v2RenderPanel",
              "signature": "(panel: Panel) => PanelParts"
            }
          ],
          "generators": [
            {
              "id": "v2GenLedgers",
              "domain": {
                "ref": "B-gen-domain"
              },
              "size_bound": 30,
              "seed_policy": {
                "ref": "B-gen-seed"
              },
              "must_include": [
                {
                  "ref": "B-gen-inc-both"
                },
                {
                  "ref": "B-gen-inc-no-mvr"
                },
                {
                  "ref": "B-gen-inc-no-usd"
                },
                {
                  "ref": "B-gen-inc-empty"
                },
                {
                  "ref": "B-gen-inc-cents"
                }
              ],
              "depth_bound": null
            }
          ],
          "laws": [
            {
              "id": "v2LawPartition",
              "statement": {
                "ref": "B-law-partition"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::sentFootOf",
              "uses": [
                "v2ObLines",
                "v2ObHooks"
              ],
              "treatment": {
                "generator": "v2GenLedgers",
                "independent_observation": {
                  "ref": "B-law-partition-ind"
                },
                "falsifier": {
                  "description": {
                    "ref": "B-law-partition-fal"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "v2LawTotal",
              "statement": {
                "ref": "B-law-total"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::sentFootOf",
              "uses": [
                "v2ObLines"
              ],
              "treatment": {
                "generator": "v2GenLedgers",
                "independent_observation": {
                  "ref": "B-law-total-ind"
                },
                "falsifier": {
                  "description": {
                    "ref": "B-law-total-fal"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "v2LawCounts",
              "statement": {
                "ref": "B-law-counts"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::listOf",
              "uses": [
                "v2ObLines"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "B-law-counts-case-zero"
                  },
                  {
                    "ref": "B-law-counts-case-one"
                  },
                  {
                    "ref": "B-law-counts-case-many"
                  }
                ],
                "reason": {
                  "ref": "B-law-counts-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "v2LawDecimals",
              "statement": {
                "ref": "B-law-decimals"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::sentFootOf",
              "uses": [
                "v2ObLines"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "B-law-decimals-case-round"
                  },
                  {
                    "ref": "B-law-decimals-case-laari"
                  }
                ],
                "reason": {
                  "ref": "B-law-decimals-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "v2LawThreeLines",
              "statement": {
                "ref": "B-law-three"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::renderPanel",
              "uses": [
                "v2ObLines",
                "v2ObHooks"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "B-law-three-case"
                  }
                ],
                "reason": {
                  "ref": "B-law-three-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            }
          ],
          "refuted": []
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "construction",
      "scope": "value:2",
      "status": {
        "payload": {
          "claims": [
            {
              "id": "v2ExclSentFoot",
              "proposition": {
                "ref": "B-excl-prop"
              },
              "harm": {
                "ref": "B-excl-harm"
              },
              "owner": "src/domain/statement.ts",
              "admitted_input": {
                "ref": "B-excl-input"
              },
              "constructor": "src/domain/statement.ts::sentFootOf",
              "consumer": "src/ui/statement.ts::renderPanel",
              "public_observation": {
                "ref": "B-excl-obs"
              },
              "bypass": [
                {
                  "ref": "B-excl-bypass-screen"
                },
                {
                  "ref": "B-excl-bypass-css"
                }
              ],
              "strength": "gradual_checker"
            }
          ],
          "admitted": [
            {
              "ref": "B-adm-missing-currency"
            },
            {
              "ref": "B-adm-empty"
            },
            {
              "ref": "B-adm-long"
            }
          ],
          "excluded": [
            {
              "ref": "B-excl-prop"
            }
          ],
          "unknown": [
            {
              "state": {
                "ref": "B-unk-third"
              },
              "risk_owner": {
                "ref": "B-unk-owner"
              }
            }
          ]
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "model",
      "scope": "value:2",
      "status": {
        "reason": {
          "ref": "B-model-na"
        },
        "tag": "not_applicable"
      }
    },
    {
      "kind": "closure",
      "scope": "value:2",
      "status": {
        "payload": {
          "closures": [
            {
              "subject": {
                "ref": "B-cl-subject"
              },
              "safety": {
                "statement": {
                  "ref": "B-cl-safety"
                },
                "design": "BLOCKED",
                "design_note": {
                  "ref": "B-cl-safety-note"
                },
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": null,
                "assumptions": [
                  {
                    "ref": "B-cl-safety-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "v2LawPartition",
                  "v2LawTotal"
                ],
                "basis": {
                  "claims": [
                    "v2ExclSentFoot"
                  ],
                  "tag": "constructed"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "B-cl-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "B-cl-runtime"
                },
                "assumptions": [
                  {
                    "ref": "B-cl-inhab-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "v2LawCounts",
                  "v2LawDecimals"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "B-cl-inhab-input"
                  },
                  "producer": "src/domain/statement.ts::sentFootOf",
                  "consumer": "src/ui/statement.ts::renderPanel",
                  "public_observation": {
                    "ref": "B-cl-inhab-obs"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "B-cl-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": null,
                "assumptions": [
                  {
                    "ref": "B-cl-reach-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "v2LawThreeLines"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "B-po-stimulus"
                  },
                  "producer": "src/ui/statement.ts::renderPanel",
                  "consumer": "src/ui/theme.css",
                  "public_observation": {
                    "ref": "B-cl-reach-obs"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "reason": {
                  "ref": "B-cl-live"
                },
                "tag": "not_applicable"
              }
            }
          ]
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "scenarios",
      "scope": "value:2",
      "status": {
        "reason": {
          "ref": "B-scen-na"
        },
        "tag": "not_applicable"
      }
    }
  ]
}
```

### Product change (Value 2)

Product change: required

### Verification (Value 2)

Verification command:

```sh
node tests/support/oracle-observation.mjs tests/acceptance/statement-sent-footer.spec.ts
```

Verification command:

```sh
npm run build
```

## Value 3

### Facts (Value 3)

- C-purpose: The Paid back by Abbaas list reads the three columns Date, Method
  and USD with no drawn row number, the word USD centred over its column in
  today's header colour, and every figure right aligned with the dollar mark
  under the same row rule as the sending list, in the teal that side already
  reads in.
- C-c-sent-stays: The sending list's columns, cells, row figures and three-line
  footer are already as the two previous values draw them and nothing here
  changes them.
- C-c-back-foot-stays: The paid-back footer keeps its one line, 'Total paid
  back' with its count and its two-decimal total, on its tinted teal bed.
- C-c-teal: The paid-back figures keep the teal #0f6f68 and the footer keeps its
  teal bed and deep teal ink: teal stays reserved for the money that came back.
- C-c-method-empty: A repayment the ledger stores no nameable method for still
  leaves its Method cell empty and carries no method hook.
- C-c-pill: The pill still switches the two lists with the same slide and rise
  and the balance card does not move.
- C-d-domain: src/domain/statement.ts has the paid-back row read usdFigure, the
  marked whole reading of the dollars it stores, and usdText together with
  withoutCurrencySign are removed, because nothing reads them once both lists
  read their own marked figures.
- C-d-ui: src/ui/statement.ts draws the paid-back header as Date, Method and USD
  with data-statement-column on each cell and the currency word centred, drops
  the drawn number from the repayment row while renderLine keeps data-no, and
  keeps the Method cell's word and its stored token hook.
- C-d-css: src/ui/theme.css gives the paid-back header and rows the grid 40px
  minmax(0, 1fr) 70px with the sending list's 6 px column gap, centres the USD
  header word in today's header ink, right-aligns the figure cell and keeps the
  teal of this list's figures and footer.
- C-d-closure: Safety stays BLOCKED for this value, because no checker ran;
  inhabitation and public reachability are PASS on the route from a seeded
  repayment through the row projection to the drawn teal figure, and the runtime
  axis is DESIGNED_NOT_BUILT until the oracle runs.
- C-d-residual: Stressor for this value, negating the assumption that a
  repayment is stored in dollars: a repayment stored in rufiyaa must still read
  the dollars it stores with the dollar mark, may degrade to showing no rufiyaa
  figure anywhere on this list, and must never read a bracketed converted
  figure, because this list has no MVR column to compare it with. A second
  stressor, not used to derive the design: a repayment with exactly 25 stored
  cents must read '$3,000.25' and not a rounded figure.
- C-d-pbt: The properties of this value are checked over generated ledgers:
  every repayment reads its own stored dollars with the mark under the row rule,
  the Method cell reads the stored token's word or nothing, and no figure is
  rounded away from the stored cents.
- C-d-migration: This value migrates two consumer specs, and the acceptance
  designer is the one who migrates each: in
  tests/acceptance/statement-lists.spec.ts the paid-back header words, the
  expected cell positions of a repayment row, the unsigned figure derivation for
  that list and the generated law's own figure expectation; and in the first
  value's own oracle at tests/acceptance/statement-sent-columns.spec.ts:1375 the
  four header words, the drawn places and the unsigned two-decimal figures of
  that same list. The footer expectation, the teal of the figures and every
  motion expectation stay as they are in both.
- C-d-removal: Removing usdText and withoutCurrencySign is part of this value
  and not a later cleanup: once the paid-back row reads usdFigure, a second
  dollar reading on the row type would be a field no reader uses and a second
  way to word the same cents.
- C-ru-row-of: Already builds one row from one entry and already carries the
  marked dollar figure from the first value, so this value only removes the
  reading nothing uses.
- C-ru-render-back: Already draws one repayment row, so the number cell is
  dropped and the figure's source changed there.
- C-ru-back-columns: The four words of the paid-back header, extended to the
  three the authority names.
- C-ru-without-sign: Its only reference site was the paid-back row's reading,
  which now reads the marked figure, so it is replaced rather than kept.
- C-ru-usd-figure: Already created for the sending list, so the paid-back list
  reads the same marked formatter instead of a second one of its own.
- C-ru-back-css: The rules that ink this list's figures and footer teal,
  extended with its own grid and its centred currency header.
- C-pf-na: No preserving move is needed: the panel already takes its own row
  renderer and its own footer renderer, so the paid-back cells change in place
  with nothing to move first.
- C-ag-back-producer: src/ui/statement.ts produces the cells of a repayment row;
  this value drops the number cell and changes the figure's reading, and keeps
  the method hook and data-no.
- C-ag-lists-spec: This spec reads the paid-back header words, a repayment's
  cells by position and an unsigned two-decimal figure, all of which this value
  replaces.
- C-ag-lists-empty: This spec also reads the paid-back header on an empty
  ledger, which must read the three new words there too.
- C-ag-columns-spec: The first value's own oracle reads this list's four header
  words, its drawn places and its unsigned two-decimal figures, because that
  value left the list as it was; all three are replaced here, so that case is
  migrated by the acceptance designer, while the teal it also reads and the
  footer line it also reads stay exactly as they are.
- C-ag-footer-spec: The second value's own oracle reads this list's footer as
  one line on its teal bed with its own count and cents, and the teal of the
  figures beside it; this value changes none of those, so that case keeps
  reading what it reads today and needs no migration.
- C-at-obligation: The paid-back figures stay decided in
  src/domain/statement.ts: src/ui/statement.ts names no currency mark, no Intl
  formatter and no arithmetic on an amount after this list reads its marked
  figures, and the screen still names no adapter, no class and no writing
  operation.
- C-ct-na: No party can change apart here: the repayment rows read the same
  stored usd_cents whose contract is already observed at shared scope, both the
  producer and the consumer of the row live in one deployable and change in one
  commit, and no persisted or wire shape is touched.
- C-ic-target: This path carries this value's own change to the paid-back list
  and no other owner's contract.
- C-ic-test: This spec asserts a paid-back reading this value replaces, so its
  cases are migrated with it.
- C-ic-compatible: This spec reads only the paid-back footer, its bed, its ink
  and the teal of the figures beside it, none of which this value changes, so it
  keeps reading what it reads today.
- C-b-driving: The driving port is the Statement screen of the built bundle: the
  paid-back panel is drawn by renderPanel at src/ui/statement.ts:240 from the
  statement the domain projected.
- C-b-driven: The driven port is the read outcome of src/ports/ledger-store.ts,
  and the document this list is drawn into is the other driven side.
- C-b-direction: The repayment's figure comes from the meaning module and its
  cells from the screen; neither imports an adapter.
- C-b-fail-method: A repayment stores no method, or a token this app cannot
  name.
- C-b-fail-method-obs: Its Method cell is empty, it carries no method hook, and
  no method word appears anywhere in the row.
- C-b-fail-mvr: A repayment is stored in rufiyaa.
- C-b-fail-mvr-obs: It reads the dollars it stores with the dollar mark, and no
  rufiyaa figure and no bracketed figure is drawn on this list.
- C-b-fail-read: The read of the ledger fails before either list is drawn.
- C-b-fail-read-obs: Neither list is drawn at all and the spoken notice stands
  alone.
- C-po-observation: The owner taps 'Paid back by Abbaas' and reads Date, Method
  and USD with no number column, the word USD centred over its column, '$3,000'
  against a repayment by cash and '$3,000.25' against one with real cents and no
  stored method, every figure right aligned in teal.
- C-po-stimulus: A ledger seeded through the real stack with a repayment of
  $3,000 stored with the method cash and a repayment of $3,000.25 stored with no
  method, read by signing in, tapping Statement and tapping 'Paid back by
  Abbaas'.
- C-po-expected: The header reads those three words with the currency word
  centred, the first repayment reads 'Cash' and '$3,000', the second leaves its
  Method cell empty and reads '$3,000.25', both figures are teal and right
  aligned, and the footer still reads one line with its two-decimal total.
- C-po-falsifier: A list that kept its number column, read '3,000.00' without
  its mark, rounded '$3,000.25', invented a method word for the row that stores
  none or left the USD header word uncentred fails the oracle on the reading it
  did it to.
- C-ob-cells: What a repayment row reads across: its date, its method word or
  nothing, and its marked dollar figure.
- C-ob-cells-blind: They cannot tell a repayment stored with no method from one
  stored with a token this app cannot name.
- C-ob-head: What the paid-back header reads and which of its words is centred.
- C-ob-head-blind: It cannot say whether the figures below are aligned with the
  word above them, which is read separately.
- C-eq: Two paid-back lists are equal for this value when every row's date,
  method and marked figure read the same text in the same order under the same
  header.
- C-gen-domain: Ledgers of repayments stored through the real adapter: whole
  dollars and real cents, methods present, absent and unknown, dates that
  collide so the oldest-first order is exercised, and a repayment stored in
  rufiyaa.
- C-gen-seed: One printed constant seed for the repayments, replayed exactly on
  a failure; with no property-testing library there is no automatic shrinking,
  so a failing ledger is reported whole and minimised by hand.
- C-gen-inc-whole: A repayment of whole dollars, which must read its mark and no
  decimals.
- C-gen-inc-cents: A repayment with real cents, which must keep them.
- C-gen-inc-no-method: A repayment with no stored method, whose Method cell must
  stay empty.
- C-gen-inc-unknown-method: A repayment stored with a token this app cannot
  name, which must say nothing in its place.
- C-law-figures: Every repayment reads the dollars its own entry stores, with
  the dollar mark, its separators, a trailing '.00' dropped and real cents kept.
- C-law-figures-ind: The oracle derives each expected figure from the cents it
  seeded on that row.
- C-law-figures-fal: A row drawn through the unchanged two-decimal formatter
  reads '3,000.00' where the law demands '$3,000'.
- C-law-no-round: No drawn repayment figure differs from the stored cents it
  reads: only a trailing '.00' is ever dropped.
- C-law-no-round-ind: The oracle compares each drawn figure with the cents it
  seeded, never with a figure read back from the screen.
- C-law-no-round-fal: A figure worded with fewer decimals reads an amount the
  ledger does not hold, as a repayment of exactly 25 cents shows.
- C-law-method: A repayment's Method cell reads the word of its stored token,
  and reads nothing at all where the ledger stores no token this app can name.
- C-law-method-case-known: A repayment stored with the token cash reads 'Cash'
  and carries that token on its hook.
- C-law-method-case-none: A repayment stored with no method reads an empty cell
  with no hook.
- C-law-method-case-unknown: A repayment stored with a token this app cannot
  name reads an empty cell with no hook.
- C-law-method-reason: The stored method is one of a closed set plus nothing
  nameable, so the three cases exhaust the reading.
- C-law-head: The paid-back header reads Date, Method, USD with the currency
  word centred over its own column and no number column at all.
- C-law-head-case-seeded: The header of a seeded ledger reads those three words
  in that order.
- C-law-head-case-empty: The header of an empty ledger reads the same three
  words.
- C-law-head-reason: The header is one fixed reading of three words, so a seeded
  ledger and an empty one exhaust it.
- C-excl-prop: A paid-back row cannot be built reading an unmarked dollar
  figure, and cannot be built carrying a method hook with no stored token.
- C-excl-harm: The owner would read a figure whose currency is unstated, or a
  way the money came back that nobody recorded.
- C-excl-input: A decoded entry of kind receive, with whole stored cents and a
  method only where one is stored.
- C-excl-obs: The drawn Method cell and the drawn USD cell of that row, read
  through the built bundle.
- C-excl-bypass-cast: A cast or an unchecked decode can still present a
  repayment shape the compiler never saw.
- C-excl-bypass-css: A stylesheet that hid the mark would leave the reading
  incomplete even though the type holds it, which is why the drawn text is
  observed.
- C-adm-no-method: A repayment with no stored method or an unknown token, whose
  cell stays empty.
- C-adm-cents: A repayment with real cents, which keeps them.
- C-adm-mvr: A repayment stored in rufiyaa, which still reads the dollars it
  stores.
- C-unk-mvr-reading: Whether a rufiyaa repayment should ever show its rufiyaa
  figure on this list is undecided: the authority draws no MVR column here.
- C-unk-owner: The product owner owns that risk, because only a new drawing
  decision can settle it.
- C-cl-subject: The Paid back by Abbaas list's three columns and its marked
  figures.
- C-cl-safety: No repayment row can be built stating a figure whose currency is
  unstated or a method nobody recorded.
- C-cl-safety-note: No checker ran under the recorded waiver, so this claim
  rests on the compiler and on the observed repayment cells rather than on a
  proof.
- C-cl-safety-assume: It assumes every repayment reaching the projection was
  decoded by the ledger store with its stored cents and its stored token intact.
- C-cl-inhab: A repayment reading 'Cash' with '$3,000' and a repayment reading
  an empty Method cell with '$3,000.25' can both be built from admitted stored
  rows.
- C-cl-inhab-input: Two seeded repayments, one stored with the method cash and
  one stored with no method and real cents.
- C-cl-inhab-obs: The two drawn repayment rows, each read cell by cell.
- C-cl-inhab-assume: It assumes the three method words this app knows are
  unchanged and that a stored token outside them still says nothing.
- C-cl-reach: Those readings are reachable at the public port: tapping 'Paid
  back by Abbaas' in the built bundle draws them for a reading to observe.
- C-cl-reach-obs: The paid-back panel as Chrome paints it at 360x780 after the
  pill is tapped.
- C-cl-reach-assume: It assumes both panels stand in the document at once and
  the pill switches which one is in the viewport, as the screen draws it today.
- C-cl-runtime: No cell of this value is built yet, so there is no runtime
  observation of it.
- C-cl-live: Liveness does not apply to this value: the list is drawn in the
  same synchronous paint as the screen and the pill's switch moves no money.
- C-adr-na: This value records no decision of its own beyond the shared ADR,
  except the paid-back grid the authority does not draw, which the shared
  constraints already carry as a deviation.
- C-model-na: No model is delivered for this value: the owner's waiver stands
  and no checker is installed here.
- C-scen-na: No scenario is delivered for this value: a scenario is read from a
  model trace, and no model was run for this list.

### Targets (Value 3)

| Path | Decision | Reason |
|---|---|---|
| `src/domain/statement.ts` | EXTEND | C-d-domain |
| `src/ui/statement.ts` | EXTEND | C-d-ui |
| `src/ui/theme.css` | EXTEND | C-d-css |

### Paradigm (Value 3)

functional

### Decisions (Value 3)

C-d-domain, C-d-ui, C-d-css, C-d-closure, C-d-residual, C-d-pbt, C-d-migration,
C-d-removal, S-d-algebra-domain, S-d-algebra-application, S-d-algebra-adapter,
S-d-carrier-usd, S-d-carrier-effects, S-d-fv-waiver, S-d-fv-absent,
S-d-type-strength, S-d-type-cannot-distinguish, S-d-repr-change,
S-d-repr-preserved, S-d-pbt-seed, S-d-pbt-independent, S-d-res-spof,
S-d-res-bypass, S-d-reuse-money, S-d-reuse-count, S-d-confirm-order,
S-d-paradigm, S-d-hook-contract, S-d-supersede

### Oracle (Value 3)

tests/acceptance/statement-back-columns.spec.ts

### Acceptance supports (Value 3)

```json
[
  "tests/support/oracle-observation.mjs",
  "tests/support/local-stack.ts",
  "tests/support/accounts.ts"
]
```

### Oracle verification index (Value 3)

```json
0
```

### Purpose (Value 3)

C-purpose

### Constraints (Value 3)

S-c-stored-minor, S-c-no-upper-bound, S-c-row-figure-rule,
S-c-total-two-decimals, S-c-count-wording, S-c-board-colours, S-c-header-type,
S-c-back-grid-deviation, S-c-untouched, S-c-privacy, S-c-public-port,
S-c-hooks-kept, S-c-read-only, C-c-sent-stays, C-c-back-foot-stays, C-c-teal,
C-c-method-empty, C-c-pill

### Inherits (Value 3)

None

### Boundaries (Value 3)

```json
{
  "driving_port": {
    "ref": "C-b-driving"
  },
  "driven_ports": [
    {
      "ref": "C-b-driven"
    }
  ],
  "dependency_direction": {
    "ref": "C-b-direction"
  },
  "failures": [
    {
      "condition": {
        "ref": "C-b-fail-method"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "C-b-fail-method-obs"
      }
    },
    {
      "condition": {
        "ref": "C-b-fail-mvr"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "C-b-fail-mvr-obs"
      }
    },
    {
      "condition": {
        "ref": "C-b-fail-read"
      },
      "outcome": "Retry",
      "observation": {
        "ref": "C-b-fail-read-obs"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Public oracle (Value 3)

```json
{
  "observation": {
    "ref": "C-po-observation"
  },
  "stimulus": {
    "ref": "C-po-stimulus"
  },
  "expected": {
    "ref": "C-po-expected"
  },
  "falsifier": {
    "ref": "C-po-falsifier"
  }
}
```

### Architectural tests (Value 3)

```json
{
  "obligations": [
    {
      "id": "archBackSilentScreen",
      "obligation": {
        "ref": "C-at-obligation"
      },
      "oracle": "tests/acceptance/statement-back-columns.spec.ts",
      "verification_index": 0
    }
  ],
  "applicability": "applicable"
}
```

### Contract tests (Value 3)

```json
{
  "reason": {
    "ref": "C-ct-na"
  },
  "applicability": "not_applicable"
}
```

### Prefactoring (Value 3)

```json
{
  "reason": {
    "ref": "C-pf-na"
  },
  "applicability": "not_applicable"
}
```

### Agreement analysis (Value 3)

| Id | Contract | Role | Locator | Decision | Reason |
|---|---|---|---|---|---|
| backProducer | Paid-back row contract | producer | `src/ui/statement.ts:208` | MIGRATED | C-ag-back-producer |
| backListsSpec | Paid-back row contract | consumer | `tests/acceptance/statement-lists.spec.ts:823` | MIGRATED | C-ag-lists-spec |
| backEmptySpec | Paid-back row contract | consumer | `tests/acceptance/statement-lists.spec.ts:1004` | MIGRATED | C-ag-lists-empty |
| backColumnsSpec | Paid-back row contract | consumer | `tests/acceptance/statement-sent-columns.spec.ts:1375` | MIGRATED | C-ag-columns-spec |
| backFooterSpec | Paid-back row contract | consumer | `tests/acceptance/statement-sent-footer.spec.ts:1056` | UNCHANGED_COMPATIBLE | C-ag-footer-spec |

### Reuse analysis (Value 3)

| Symbol | Locator | Decision | Reason |
|---|---|---|---|
| rowOf | `src/domain/statement.ts:190` | EXTEND | C-ru-row-of |
| renderBackRow | `src/ui/statement.ts:208` | EXTEND | C-ru-render-back |
| BACK_COLUMNS | `src/ui/statement.ts:67` | EXTEND | C-ru-back-columns |
| withoutCurrencySign | `src/domain/statement.ts:159` | REPLACE | C-ru-without-sign |
| formatUsdWhole | `src/domain/money.ts:118` | REUSE | C-ru-usd-figure |
| .statement-panel[data-statement-list='back'] rules | `src/ui/theme.css:2701` | EXTEND | C-ru-back-css |

### Impact closure (Value 3)

```json
{
  "items": [
    {
      "kind": "public_interface",
      "locator": "src/domain/statement.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "C-ic-target"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/ui/statement.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "C-ic-target"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/ui/theme.css",
      "decision": "CHANGED",
      "reason": {
        "ref": "C-ic-target"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:823",
      "decision": "MIGRATED",
      "reason": {
        "ref": "C-ic-test"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:1004",
      "decision": "MIGRATED",
      "reason": {
        "ref": "C-ic-test"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:1375",
      "decision": "MIGRATED",
      "reason": {
        "ref": "C-ic-test"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-footer.spec.ts:1056",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "C-ic-compatible"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Adr (Value 3)

```json
{
  "reason": {
    "ref": "C-adr-na"
  },
  "applicability": "not_applicable"
}
```

### Architect handoff (Value 3)

```json
{
  "sections": [
    {
      "kind": "laws",
      "scope": "value:3",
      "status": {
        "payload": {
          "observations": [
            {
              "id": "v3ObCells",
              "description": {
                "ref": "C-ob-cells"
              },
              "result_type": "three cells of text",
              "cannot_distinguish": {
                "ref": "C-ob-cells-blind"
              }
            },
            {
              "id": "v3ObHead",
              "description": {
                "ref": "C-ob-head"
              },
              "result_type": "three words and one alignment",
              "cannot_distinguish": {
                "ref": "C-ob-head-blind"
              }
            }
          ],
          "equality": {
            "under": [
              "v3ObCells",
              "v3ObHead"
            ],
            "definition": {
              "ref": "C-eq"
            }
          },
          "constructors": [
            {
              "id": "v3RowOf",
              "signature": "(entry: StatementEntry, index: number) => StatementRow"
            },
            {
              "id": "v3RenderBackRow",
              "signature": "(row: StatementRow) => HTMLElement"
            }
          ],
          "generators": [
            {
              "id": "v3GenRepayments",
              "domain": {
                "ref": "C-gen-domain"
              },
              "size_bound": 30,
              "seed_policy": {
                "ref": "C-gen-seed"
              },
              "must_include": [
                {
                  "ref": "C-gen-inc-whole"
                },
                {
                  "ref": "C-gen-inc-cents"
                },
                {
                  "ref": "C-gen-inc-no-method"
                },
                {
                  "ref": "C-gen-inc-unknown-method"
                }
              ],
              "depth_bound": null
            }
          ],
          "laws": [
            {
              "id": "v3LawFigures",
              "statement": {
                "ref": "C-law-figures"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::rowOf",
              "uses": [
                "v3ObCells"
              ],
              "treatment": {
                "generator": "v3GenRepayments",
                "independent_observation": {
                  "ref": "C-law-figures-ind"
                },
                "falsifier": {
                  "description": {
                    "ref": "C-law-figures-fal"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "v3LawNoRounding",
              "statement": {
                "ref": "C-law-no-round"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::rowOf",
              "uses": [
                "v3ObCells"
              ],
              "treatment": {
                "generator": "v3GenRepayments",
                "independent_observation": {
                  "ref": "C-law-no-round-ind"
                },
                "falsifier": {
                  "description": {
                    "ref": "C-law-no-round-fal"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "v3LawMethod",
              "statement": {
                "ref": "C-law-method"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::rowOf",
              "uses": [
                "v3ObCells"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "C-law-method-case-known"
                  },
                  {
                    "ref": "C-law-method-case-none"
                  },
                  {
                    "ref": "C-law-method-case-unknown"
                  }
                ],
                "reason": {
                  "ref": "C-law-method-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "v3LawHeader",
              "statement": {
                "ref": "C-law-head"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::renderPanel",
              "uses": [
                "v3ObHead"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "C-law-head-case-seeded"
                  },
                  {
                    "ref": "C-law-head-case-empty"
                  }
                ],
                "reason": {
                  "ref": "C-law-head-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            }
          ],
          "refuted": []
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "construction",
      "scope": "value:3",
      "status": {
        "payload": {
          "claims": [
            {
              "id": "v3ExclBackRow",
              "proposition": {
                "ref": "C-excl-prop"
              },
              "harm": {
                "ref": "C-excl-harm"
              },
              "owner": "src/domain/statement.ts",
              "admitted_input": {
                "ref": "C-excl-input"
              },
              "constructor": "src/domain/statement.ts::rowOf",
              "consumer": "src/ui/statement.ts::renderBackRow",
              "public_observation": {
                "ref": "C-excl-obs"
              },
              "bypass": [
                {
                  "ref": "C-excl-bypass-cast"
                },
                {
                  "ref": "C-excl-bypass-css"
                }
              ],
              "strength": "gradual_checker"
            }
          ],
          "admitted": [
            {
              "ref": "C-adm-no-method"
            },
            {
              "ref": "C-adm-cents"
            },
            {
              "ref": "C-adm-mvr"
            }
          ],
          "excluded": [
            {
              "ref": "C-excl-prop"
            }
          ],
          "unknown": [
            {
              "state": {
                "ref": "C-unk-mvr-reading"
              },
              "risk_owner": {
                "ref": "C-unk-owner"
              }
            }
          ]
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "model",
      "scope": "value:3",
      "status": {
        "reason": {
          "ref": "C-model-na"
        },
        "tag": "not_applicable"
      }
    },
    {
      "kind": "closure",
      "scope": "value:3",
      "status": {
        "payload": {
          "closures": [
            {
              "subject": {
                "ref": "C-cl-subject"
              },
              "safety": {
                "statement": {
                  "ref": "C-cl-safety"
                },
                "design": "BLOCKED",
                "design_note": {
                  "ref": "C-cl-safety-note"
                },
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": null,
                "assumptions": [
                  {
                    "ref": "C-cl-safety-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "v3LawFigures",
                  "v3LawNoRounding"
                ],
                "basis": {
                  "claims": [
                    "v3ExclBackRow"
                  ],
                  "tag": "constructed"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "C-cl-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "C-cl-runtime"
                },
                "assumptions": [
                  {
                    "ref": "C-cl-inhab-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "v3LawMethod"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "C-cl-inhab-input"
                  },
                  "producer": "src/domain/statement.ts::rowOf",
                  "consumer": "src/ui/statement.ts::renderBackRow",
                  "public_observation": {
                    "ref": "C-cl-inhab-obs"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "C-cl-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": null,
                "assumptions": [
                  {
                    "ref": "C-cl-reach-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "v3LawHeader"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "C-po-stimulus"
                  },
                  "producer": "src/ui/statement.ts::renderPanel",
                  "consumer": "src/ui/theme.css",
                  "public_observation": {
                    "ref": "C-cl-reach-obs"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "reason": {
                  "ref": "C-cl-live"
                },
                "tag": "not_applicable"
              }
            }
          ]
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "scenarios",
      "scope": "value:3",
      "status": {
        "reason": {
          "ref": "C-scen-na"
        },
        "tag": "not_applicable"
      }
    }
  ]
}
```

### Product change (Value 3)

Product change: required

### Verification (Value 3)

Verification command:

```sh
node tests/support/oracle-observation.mjs tests/acceptance/statement-back-columns.spec.ts
```

Verification command:

```sh
npm run build
```

## Value 1

### Facts (Value 1)

- A-purpose: The Sent for Abbaas list reads the four columns Date, Paid to, MVR
  and USD with no drawn row number: a rufiyaa send reads its marked rufiyaa
  figure with its inline rate in the MVR column and its stored dollars with no
  brackets in the USD column, a dollar send reads its marked dollar figure and a
  grey em dash, and the sub-line reads the stored method alone.
- A-c-foot-stays: The sent footer still reads today's one line, 'Total sent'
  with its count and its two-decimal total: splitting it into three lines is the
  next value's delta and nothing here changes it.
- A-c-back-stays: The paid-back list still reads its four columns with its drawn
  number and its unsigned two-decimal figures: its own reading is a later value
  and nothing here changes it.
- A-c-cell-widths: The MVR cell has 90 px and the USD cell 54 px, so a long
  person name gives way in the party column while a figure and its inline rate
  are never clipped; the widest reading the cell must hold is a five-digit
  rufiyaa figure with the prefix 'MVR' and a two-character rate, which fits
  inside the column, while a wider reading, such as one at a four-decimal rate,
  runs over the end of the party column instead of wrapping or losing a digit.
- A-d-domain: src/domain/statement.ts gains mvrCellOf, which builds
  StatementMvrCell from one entry, and usdFigure on StatementRow, the marked
  whole reading of the dollars the entry stores; sublineOf is narrowed to the
  stored method's word alone, so a dollar send with no stored method still has
  no sub-line.
- A-d-money: src/domain/money.ts gains formatUsdWhole and formatMvrAmount beside
  the untouched formatUsdCents, and a rufiyaa row's rate text is formatRatePlain
  prefixed with '@'.
- A-d-transitional: usdText and withoutCurrencySign stay in place for the
  paid-back row alone until the value that changes that list: the sending row
  reads usdFigure, so the two lists keep their own readings while this value is
  the only one landed.
- A-d-ui: src/ui/statement.ts draws the sent header as Date, Paid to, MVR and
  USD with data-statement-column on each cell, drops the drawn number from the
  sent row while renderLine keeps data-no, and draws the MVR cell and the USD
  cell with their own hooks; the em dash placeholder is the screen's own mark.
- A-d-css: src/ui/theme.css gives the sent header and the sent row the grid 40px
  minmax(0, 1fr) 90px 54px with a 6 px column gap, centres the two currency
  words, right-aligns the two figure cells, inks the dollar, rufiyaa, converted,
  rate and placeholder readings, and keeps the zebra tints and the row rule.
- A-d-closure: Safety stays BLOCKED for this value, because no checker ran;
  inhabitation and public reachability are PASS on the route from a seeded
  rufiyaa row through mvrCellOf to the drawn MVR cell, and the runtime axis is
  DESIGNED_NOT_BUILT until the oracle runs.
- A-d-residual: Stressor for this value, negating the assumption that a person
  name is short: a name long enough to fill the party column must leave the MVR
  and USD cells readable, may degrade to a clipped name, must never wrap a
  figure away from its rate, and leaves the residue that both currency readings
  stay whole. A second stressor, not used to derive the design: a rufiyaa send
  whose stored dollars are nothing like its rate times its amount still reads
  the stored dollars, which is what makes the stored-dollars law falsifiable.
- A-d-pbt: The properties of this value are checked over the seeded ledgers:
  every sent row's MVR and USD cells read what the stored row says, a dollar
  send draws the placeholder and no rufiyaa figure, and no drawn figure is
  rounded away from the stored minor units.
- A-d-migration: This value migrates, in
  tests/acceptance/statement-sent.spec.ts, the header words, the drawn-number
  reading, the sub-line derivation and the case that forbids a mark in a row,
  and in tests/acceptance/statement-lists.spec.ts the shared row reader's cell
  positions and its unsigned figure derivation for the sending list alone.
- A-d-oracle-note: The oracle of this value reads the MVR cell's figure span and
  rate span separately, because the cell carries no whitespace between them and
  the 3 px gap is drawn by a margin.
- A-ru-mvr-cell: No existing type says what a row's MVR cell reads, so the
  choice type is created in the module that already owns what a row says.
- A-ru-row-of: Already builds one row from one entry, so the MVR cell and the
  marked dollar figure are added to it rather than decided anywhere else.
- A-ru-subline: Already words the sub-line from the stored method and the
  rufiyaa clause, so it is narrowed here instead of being replaced.
- A-ru-render-sent: Already draws one sent row and is the only caller-visible
  shape of that row, so the new cells are added there.
- A-ru-usd-whole: Nothing drops a trailing '.00' today, and the shared decision
  forbids changing the one dollar formatter, so this is created beside it.
- A-ru-rate-plain: Already words a rate with no trailing zeros, which is exactly
  the inline rate, so it is reused unchanged behind the '@'.
- A-ru-grid: The one grid both lists stand on today, extended with the sending
  list's four columns.
- A-pf-na: No preserving move is needed: the panel already takes its own row
  renderer, so the new cells are added inside renderSentRow with no movement of
  existing code first.
- A-ag-row-producer: src/ui/statement.ts produces the cells of a sent row; this
  value adds the MVR and USD cells and their hooks and renames none.
- A-ag-sent-spec: This spec reads the sent header words, the drawn number, the
  sub-line and the absence of a mark in a row, all of which this value replaces.
- A-ag-lists-spec: This spec's shared row reader takes a row's cells by position
  and derives an unsigned two-decimal figure, both of which change for the
  sending list in this value.
- A-ag-money-producer: formatUsdCents keeps its name, its signature and its
  two-decimal output, so the modules that word a dollar figure through it are
  untouched by this value.
- A-ag-home: Home words its figures through the unchanged formatter and is out
  of scope.
- A-ag-stored-producer: The migration is not touched by this value: every
  column, every constraint, every stored cent and every stored rate stays as it
  is, so the row this value reads is the row the migration already admits.
- A-ag-stored-port: The ledger store keeps decoding the same stored row into the
  same entries, so the MVR cell and the marked dollar figure are built from
  values whose shape this value does not change.
- A-at-obligation: src/ui/statement.ts still names no currency mark, no Intl
  formatter and no arithmetic on an amount after the MVR and USD cells are
  added, src/domain names no document and no adapter, neither statement module
  declares a class, and the screen names no writing operation.
- A-ct-obligation: A rufiyaa send stored with real laari and a four-decimal
  rate, and a dollar send stored with real cents, read back through the real
  local Supabase stack with no laari, no cent and no rate decimal lost.
- A-ct-observation: The oracle stores those two rows through the real adapter
  and then reads the drawn MVR figure, the drawn inline rate and the drawn USD
  cell of those same rows, comparing them with expectations derived from the
  stored values alone.
- A-ic-target: This path carries this value's own change to the sending row and
  no other owner's contract.
- A-ic-test: This spec asserts a sending-list reading this value replaces, so
  its cases are migrated with it.
- A-ic-unchanged: This consumer reads a contract this value leaves exactly as it
  is.
- A-b-driving: The driving port is the Statement screen of the built bundle:
  renderStatement at src/ui/statement.ts:360 takes one read outcome and returns
  the screen that holds the sending list.
- A-b-driven: The driven port is the read outcome of src/ports/ledger-store.ts;
  the document is the other driven side and only src/ui names it.
- A-b-direction: The screen imports the ports, the meaning modules and the
  motion; the meaning modules import no screen and no adapter.
- A-b-fail-rate: A stored rufiyaa send carries no rate.
- A-b-fail-rate-obs: Its MVR cell reads the rufiyaa figure with no rate clause
  and its USD cell still reads the stored dollars with no brackets.
- A-b-fail-zero: A stored send carries zero stored dollars.
- A-b-fail-zero-obs: The USD cell reads '$0' for a dollar send and, with no
  brackets, '$0' for the converted value of a rufiyaa send, and no cell is left
  blank.
- A-b-fail-read: The read of the ledger fails before any send is listed.
- A-b-fail-read-obs: The screen speaks the port's message and draws no header,
  no row and no figure of this list.
- A-po-observation: The owner reads the sending list and tells a rufiyaa send
  from a dollar send at a glance: 'MVR10,000@20' with '$500' on one row,
  '$1,500' with a grey em dash on another, four column words with the two
  currency words centred, and no number anywhere.
- A-po-stimulus: A ledger seeded through the real stack with a rufiyaa send of
  10,000 rufiyaa at the rate 20 storing $500, a rufiyaa send of 10,000 rufiyaa
  and 50 laari, a rufiyaa send at the rate 15.4 storing $649.35, a dollar send
  of $1,500, a dollar send of $1,500.50 and a send stored with no method, read
  by signing in and tapping Statement.
- A-po-expected: Each row's MVR figure, inline rate, USD cell, placeholder,
  sub-line and colour equals the reading the oracle derives from the stored row
  alone, and the header reads Date, Paid to, MVR, USD with the two currency
  words centred.
- A-po-falsifier: A screen that kept the drawn number, wrote the rufiyaa figure
  into the sub-line, drew '1,500.00' without its mark, wrote a rufiyaa figure as
  '10,000/-' or a converted value as '($500)', rounded '$649.35' or left a
  dollar send's MVR cell empty fails the oracle on the row it did it to.
- A-ob-mvr: What a sent row's MVR cell reads: the marked rufiyaa figure and its
  inline rate, or the em dash placeholder.
- A-ob-mvr-blind: It cannot tell two rufiyaa sends of equal amount and rate
  apart, and it cannot say which module worded the text.
- A-ob-usd: What a sent row's USD cell reads: the marked whole dollar figure, or
  the marked reading, with no brackets, of the dollars a rufiyaa send stores.
- A-ob-usd-blind: It cannot tell stored dollars from a second conversion when
  the rate makes the two equal.
- A-ob-sub: What the sub-line under the person reads: the stored method's word,
  or nothing.
- A-ob-sub-blind: It cannot tell a row stored with no method from one stored
  with a token this app cannot name.
- A-eq: Two sending lists are equal for this value when every row's MVR cell,
  USD cell and sub-line read the same text in the same order.
- A-gen-domain: Ledgers of sends stored through the real adapter: whole and
  fractional cents, whole and fractional laari, integer and four-decimal rates,
  dollars unrelated to the stored rate, methods present, absent and unknown.
- A-gen-seed: One printed constant seed for the sending rows, replayed exactly
  on a failure; with no property-testing library there is no automatic
  shrinking, so a failing ledger is reported whole and minimised by hand.
- A-gen-inc-usd-whole: A dollar send of whole dollars, which must read its mark
  and no decimals.
- A-gen-inc-usd-cents: A dollar send with real cents, which must keep them.
- A-gen-inc-mvr-rate: A rufiyaa send at a four-decimal rate, whose inline rate
  must read without trailing zeros.
- A-gen-inc-mvr-laari: A rufiyaa send with real laari, which must keep them
  after its prefix 'MVR'.
- A-gen-inc-no-method: A send stored with no method, which must have no sub-line
  at all.
- A-law-cells: Every sent row's MVR and USD cells read what its own stored row
  says: a rufiyaa send its marked laari figure, its inline rate and its stored
  dollars with the dollar mark and no brackets, a dollar send its marked dollar
  figure and the placeholder.
- A-law-cells-ind: The oracle derives both cells from the stored currency, minor
  units, rate and dollars of each seeded row.
- A-law-cells-fal: A row that read the converted figure in the MVR column, or
  the placeholder on a rufiyaa send, differs from the derived reading on that
  row.
- A-law-no-round: No drawn row figure differs from the stored minor units it
  reads: only a trailing '.00' is ever dropped.
- A-law-no-round-ind: The oracle compares each drawn figure with the minor units
  it seeded, never with a figure read back from the screen.
- A-law-no-round-fal: A figure worded by a formatter with fewer decimals reads
  an amount the ledger does not hold.
- A-law-sub: A sent row's sub-line reads the stored method's word and nothing
  else, and a row with no nameable stored method has no sub-line element at all.
- A-law-sub-case-method: A send stored with the token transfer reads 'Transfer'
  alone.
- A-law-sub-case-none: A send stored with no method has no sub-line element.
- A-law-sub-case-unknown: A send stored with a token this app cannot name has no
  sub-line element.
- A-law-sub-reason: The stored method is one of a closed set plus nothing
  stored, so the finite cases exhaust the reading.
- A-law-head: The sent header reads Date, Paid to, MVR, USD, with the two
  currency words centred over their own columns and no number column at all.
- A-law-head-case: The header of a seeded ledger and of an empty ledger both
  read those four words in that order.
- A-law-head-reason: The header is one fixed reading of four words, so one case
  over a seeded ledger and one over an empty one exhaust it.
- A-law-silent: src/ui/statement.ts names no currency mark, no Intl formatter
  and no arithmetic on an amount after this value.
- A-law-silent-case: The bytes of src/ui/statement.ts, read from the repository
  as the existing architectural case reads them.
- A-law-silent-reason: One module's own bytes are one closed reading, so a
  generated domain would add nothing.
- A-excl-prop: A sent row cannot be built with a converted dollar figure unless
  its entry is a rufiyaa send, and cannot be built as a rufiyaa send with no
  rufiyaa figure.
- A-excl-harm: The row would state money the ledger does not hold, or hide the
  currency a send was made in.
- A-excl-input: A decoded entry of kind send whose currency is USD or MVR, with
  whole minor units and a rate only where one is stored.
- A-excl-obs: The MVR cell and the USD cell this row draws, read through the
  built bundle at the phone's width.
- A-excl-bypass-cast: A cast or an unchecked decode can still hand the row
  projection a shape the compiler never saw.
- A-excl-bypass-css: A stylesheet that hid a cell would leave the reading absent
  even though the type holds it, which is why the drawn cells are observed.
- A-adm-no-rate: A rufiyaa send with no stored rate, whose MVR cell reads no
  rate clause.
- A-adm-real-minor: A send with real cents or real laari, which keeps them.
- A-adm-long-name: A person name long enough to fill the party column, which is
  clipped there.
- A-unk-third: A send stored in a currency that is neither USD nor MVR: its MVR
  cell reading is undecided.
- A-unk-owner: The ledger store's decoder owns that risk: it is the boundary
  that admits such a row into the projection.
- A-cl-subject: The Sent for Abbaas list's four columns and its two currency
  cells.
- A-cl-safety: No sent row can be built stating money its entry does not store,
  or hiding which currency it was sent in.
- A-cl-safety-note: No checker ran under the recorded waiver, so this claim
  rests on the compiler and on the observed row cells rather than on a proof.
- A-cl-safety-assume: It assumes every row reaching the projection was decoded
  by the ledger store and that the migration's constraints held.
- A-cl-inhab: A rufiyaa row reading 'MVR10,000@20' with '$500' and a dollar row
  reading '$1,500' with the placeholder can both be built from admitted stored
  rows.
- A-cl-inhab-input: Two seeded sends, one stored in MVR with a rate and one
  stored in USD, both admitted by the migration.
- A-cl-inhab-obs: The two drawn rows, each read cell by cell.
- A-cl-reach: Those two readings are reachable at the public port, where the
  built bundle draws them for a reading to observe.
- A-cl-reach-obs: The sending list as Chrome paints it at 360x780 after signing
  in and tapping Statement.
- A-cl-inhab-assume: It assumes the migration keeps a rate required for a
  rufiyaa send and absent for a dollar send, as it does today.
- A-cl-reach-assume: It assumes the built bundle is served over the loopback
  origin at 360x780 with the local stack running, which is the only way this
  list is read.
- A-cl-runtime: No row of this value is built yet, so there is no runtime
  observation of it.
- A-cl-live: Liveness does not apply to this value: one row's cells are drawn in
  the same synchronous paint as the screen, with no progress obligation of any
  kind.
- A-adr-na: This value records no decision of its own beyond the shared ADR: the
  board is the authority for every colour, word and alignment it draws, and the
  one carrier choice it rests on is already recorded there.
- A-model-na: No model is delivered for this value: the owner's waiver stands
  and no checker is installed, so there is no model file and no run to cite
  here.
- A-scen-na: No scenario is delivered for this value: a scenario is read from a
  model trace, and no model was run.

### Targets (Value 1)

| Path | Decision | Reason |
|---|---|---|
| `src/domain/money.ts` | EXTEND | A-d-money |
| `src/domain/statement.ts` | EXTEND | A-d-domain |
| `src/ui/statement.ts` | EXTEND | A-d-ui |
| `src/ui/theme.css` | EXTEND | A-d-css |

### Paradigm (Value 1)

functional

### Decisions (Value 1)

A-d-domain, A-d-money, A-d-transitional, A-d-ui, A-d-css, A-d-closure,
A-d-residual, A-d-pbt, A-d-migration, A-d-oracle-note, S-d-algebra-domain,
S-d-algebra-application, S-d-algebra-adapter, S-d-carrier-mvr, S-d-carrier-usd,
S-d-carrier-effects, S-d-fv-waiver, S-d-fv-absent, S-d-type-exclusion-mvr,
S-d-type-admitted-rate, S-d-type-strength, S-d-type-cannot-distinguish,
S-d-repr-change, S-d-repr-preserved, S-d-pbt-seed, S-d-pbt-independent,
S-d-res-stressor-rate, S-d-res-spof, S-d-res-bypass, S-d-reuse-money,
S-d-reuse-dash, S-d-reuse-no-conversion, S-d-confirm-order, S-d-paradigm,
S-d-hook-contract, S-d-mvr-cell-spacing, S-d-supersede, S-d-refuted-onecell

### Oracle (Value 1)

tests/acceptance/statement-sent-columns.spec.ts

### Acceptance supports (Value 1)

```json
[
  "tests/support/oracle-observation.mjs",
  "tests/support/local-stack.ts",
  "tests/support/accounts.ts"
]
```

### Oracle verification index (Value 1)

```json
0
```

### Purpose (Value 1)

A-purpose

### Constraints (Value 1)

S-c-stored-minor, S-c-rate-range, S-c-no-upper-bound, S-c-row-figure-rule,
S-c-count-wording, S-c-board-grid, S-c-board-colours, S-c-header-type,
S-c-header-type-deviation, S-c-untouched, S-c-privacy, S-c-public-port,
S-c-hooks-kept, S-c-read-only, A-c-foot-stays, A-c-back-stays, A-c-cell-widths,
S-c-mvr-cell-fit

### Inherits (Value 1)

None

### Boundaries (Value 1)

```json
{
  "driving_port": {
    "ref": "A-b-driving"
  },
  "driven_ports": [
    {
      "ref": "A-b-driven"
    }
  ],
  "dependency_direction": {
    "ref": "A-b-direction"
  },
  "failures": [
    {
      "condition": {
        "ref": "A-b-fail-rate"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "A-b-fail-rate-obs"
      }
    },
    {
      "condition": {
        "ref": "A-b-fail-zero"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "A-b-fail-zero-obs"
      }
    },
    {
      "condition": {
        "ref": "A-b-fail-read"
      },
      "outcome": "Retry",
      "observation": {
        "ref": "A-b-fail-read-obs"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Public oracle (Value 1)

```json
{
  "observation": {
    "ref": "A-po-observation"
  },
  "stimulus": {
    "ref": "A-po-stimulus"
  },
  "expected": {
    "ref": "A-po-expected"
  },
  "falsifier": {
    "ref": "A-po-falsifier"
  }
}
```

### Architectural tests (Value 1)

```json
{
  "obligations": [
    {
      "id": "archSilentScreen",
      "obligation": {
        "ref": "A-at-obligation"
      },
      "oracle": "tests/acceptance/statement-sent-columns.spec.ts",
      "verification_index": 0
    }
  ],
  "applicability": "applicable"
}
```

### Contract tests (Value 1)

```json
{
  "obligations": [
    {
      "id": "ctStoredMinorUnits",
      "obligation": {
        "ref": "A-ct-obligation"
      },
      "contract": "Stored entry row",
      "producer": "supabase/migrations/0001_account_scoped_ledger.sql:23",
      "consumer": "src/ports/ledger-store.ts:1",
      "observation": {
        "ref": "A-ct-observation"
      },
      "oracle": "tests/acceptance/statement-sent-columns.spec.ts",
      "verification_index": 0
    }
  ],
  "applicability": "applicable"
}
```

### Prefactoring (Value 1)

```json
{
  "reason": {
    "ref": "A-pf-na"
  },
  "applicability": "not_applicable"
}
```

### Agreement analysis (Value 1)

| Id | Contract | Role | Locator | Decision | Reason |
|---|---|---|---|---|---|
| rowProducer | Sent row cell contract | producer | `src/ui/statement.ts:173` | MIGRATED | A-ag-row-producer |
| sentSpec | Sent row cell contract | consumer | `tests/acceptance/statement-sent.spec.ts:484` | MIGRATED | A-ag-sent-spec |
| listsSpec | Sent row cell contract | consumer | `tests/acceptance/statement-lists.spec.ts:579` | MIGRATED | A-ag-lists-spec |
| moneyProducer | USD figure wording | producer | `src/domain/money.ts:40` | UNCHANGED_COMPATIBLE | A-ag-money-producer |
| homeConsumer | USD figure wording | consumer | `src/ui/home.ts:238` | UNCHANGED_COMPATIBLE | A-ag-home |
| storedProducerV1 | Stored entry row | producer | `supabase/migrations/0001_account_scoped_ledger.sql:23` | UNCHANGED_COMPATIBLE | A-ag-stored-producer |
| storedPortV1 | Stored entry row | consumer | `src/ports/ledger-store.ts:1` | UNCHANGED_COMPATIBLE | A-ag-stored-port |

### Reuse analysis (Value 1)

| Symbol | Locator | Decision | Reason |
|---|---|---|---|
| StatementMvrCell | `src/domain/statement.ts:99` | CREATE_NEW | A-ru-mvr-cell |
| rowOf | `src/domain/statement.ts:190` | EXTEND | A-ru-row-of |
| sublineOf | `src/domain/statement.ts:170` | EXTEND | A-ru-subline |
| renderSentRow | `src/ui/statement.ts:173` | EXTEND | A-ru-render-sent |
| formatUsdWhole | `src/domain/money.ts:118` | CREATE_NEW | A-ru-usd-whole |
| formatRatePlain | `src/domain/money.ts:117` | REUSE | A-ru-rate-plain |
| .statement-head-row and .statement-row grid | `src/ui/theme.css:2524` | EXTEND | A-ru-grid |

### Impact closure (Value 1)

```json
{
  "items": [
    {
      "kind": "public_interface",
      "locator": "src/domain/money.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "A-ic-target"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/domain/statement.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "A-ic-target"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/ui/statement.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "A-ic-target"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/ui/theme.css",
      "decision": "CHANGED",
      "reason": {
        "ref": "A-ic-target"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:484",
      "decision": "MIGRATED",
      "reason": {
        "ref": "A-ic-test"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:579",
      "decision": "MIGRATED",
      "reason": {
        "ref": "A-ic-test"
      }
    },
    {
      "kind": "consumer",
      "locator": "src/ui/home.ts:238",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "A-ic-unchanged"
      }
    },
    {
      "kind": "consumer",
      "locator": "src/ports/ledger-store.ts:1",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "A-ic-unchanged"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Adr (Value 1)

```json
{
  "reason": {
    "ref": "A-adr-na"
  },
  "applicability": "not_applicable"
}
```

### Architect handoff (Value 1)

```json
{
  "sections": [
    {
      "kind": "laws",
      "scope": "value:1",
      "status": {
        "payload": {
          "observations": [
            {
              "id": "v1ObMvr",
              "description": {
                "ref": "A-ob-mvr"
              },
              "result_type": "string",
              "cannot_distinguish": {
                "ref": "A-ob-mvr-blind"
              }
            },
            {
              "id": "v1ObUsd",
              "description": {
                "ref": "A-ob-usd"
              },
              "result_type": "string",
              "cannot_distinguish": {
                "ref": "A-ob-usd-blind"
              }
            },
            {
              "id": "v1ObSub",
              "description": {
                "ref": "A-ob-sub"
              },
              "result_type": "string or nothing",
              "cannot_distinguish": {
                "ref": "A-ob-sub-blind"
              }
            }
          ],
          "equality": {
            "under": [
              "v1ObMvr",
              "v1ObUsd",
              "v1ObSub"
            ],
            "definition": {
              "ref": "A-eq"
            }
          },
          "constructors": [
            {
              "id": "v1MvrCellOf",
              "signature": "(entry: StatementEntry) => StatementMvrCell"
            },
            {
              "id": "v1UsdFigure",
              "signature": "(cents: number) => string"
            },
            {
              "id": "v1SublineOf",
              "signature": "(entry: StatementEntry) => string | null"
            },
            {
              "id": "v1RenderSentRow",
              "signature": "(row: StatementRow) => HTMLElement"
            }
          ],
          "generators": [
            {
              "id": "v1GenSends",
              "domain": {
                "ref": "A-gen-domain"
              },
              "size_bound": 30,
              "seed_policy": {
                "ref": "A-gen-seed"
              },
              "must_include": [
                {
                  "ref": "A-gen-inc-usd-whole"
                },
                {
                  "ref": "A-gen-inc-usd-cents"
                },
                {
                  "ref": "A-gen-inc-mvr-rate"
                },
                {
                  "ref": "A-gen-inc-mvr-laari"
                },
                {
                  "ref": "A-gen-inc-no-method"
                }
              ],
              "depth_bound": null
            }
          ],
          "laws": [
            {
              "id": "v1LawCells",
              "statement": {
                "ref": "A-law-cells"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::mvrCellOf",
              "uses": [
                "v1ObMvr",
                "v1ObUsd"
              ],
              "treatment": {
                "generator": "v1GenSends",
                "independent_observation": {
                  "ref": "A-law-cells-ind"
                },
                "falsifier": {
                  "description": {
                    "ref": "A-law-cells-fal"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "v1LawNoRounding",
              "statement": {
                "ref": "A-law-no-round"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/money.ts::formatUsdWhole",
              "uses": [
                "v1ObMvr",
                "v1ObUsd"
              ],
              "treatment": {
                "generator": "v1GenSends",
                "independent_observation": {
                  "ref": "A-law-no-round-ind"
                },
                "falsifier": {
                  "description": {
                    "ref": "A-law-no-round-fal"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "v1LawSubline",
              "statement": {
                "ref": "A-law-sub"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/domain/statement.ts::sublineOf",
              "uses": [
                "v1ObSub"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "A-law-sub-case-method"
                  },
                  {
                    "ref": "A-law-sub-case-none"
                  },
                  {
                    "ref": "A-law-sub-case-unknown"
                  }
                ],
                "reason": {
                  "ref": "A-law-sub-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "v1LawHeader",
              "statement": {
                "ref": "A-law-head"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::renderPanel",
              "uses": [
                "v1ObMvr",
                "v1ObUsd"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "A-law-head-case"
                  }
                ],
                "reason": {
                  "ref": "A-law-head-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "v1LawScreenSilent",
              "statement": {
                "ref": "A-law-silent"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts",
              "uses": [
                "v1ObUsd"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "A-law-silent-case"
                  }
                ],
                "reason": {
                  "ref": "A-law-silent-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            }
          ],
          "refuted": []
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "construction",
      "scope": "value:1",
      "status": {
        "payload": {
          "claims": [
            {
              "id": "v1ExclMvrCell",
              "proposition": {
                "ref": "A-excl-prop"
              },
              "harm": {
                "ref": "A-excl-harm"
              },
              "owner": "src/domain/statement.ts",
              "admitted_input": {
                "ref": "A-excl-input"
              },
              "constructor": "src/domain/statement.ts::mvrCellOf",
              "consumer": "src/ui/statement.ts::renderSentRow",
              "public_observation": {
                "ref": "A-excl-obs"
              },
              "bypass": [
                {
                  "ref": "A-excl-bypass-cast"
                },
                {
                  "ref": "A-excl-bypass-css"
                }
              ],
              "strength": "gradual_checker"
            }
          ],
          "admitted": [
            {
              "ref": "A-adm-no-rate"
            },
            {
              "ref": "A-adm-real-minor"
            },
            {
              "ref": "A-adm-long-name"
            }
          ],
          "excluded": [
            {
              "ref": "A-excl-prop"
            }
          ],
          "unknown": [
            {
              "state": {
                "ref": "A-unk-third"
              },
              "risk_owner": {
                "ref": "A-unk-owner"
              }
            }
          ]
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "model",
      "scope": "value:1",
      "status": {
        "reason": {
          "ref": "A-model-na"
        },
        "tag": "not_applicable"
      }
    },
    {
      "kind": "closure",
      "scope": "value:1",
      "status": {
        "payload": {
          "closures": [
            {
              "subject": {
                "ref": "A-cl-subject"
              },
              "safety": {
                "statement": {
                  "ref": "A-cl-safety"
                },
                "design": "BLOCKED",
                "design_note": {
                  "ref": "A-cl-safety-note"
                },
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": null,
                "assumptions": [
                  {
                    "ref": "A-cl-safety-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "v1LawCells",
                  "v1LawNoRounding"
                ],
                "basis": {
                  "claims": [
                    "v1ExclMvrCell"
                  ],
                  "tag": "constructed"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "A-cl-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "A-cl-runtime"
                },
                "assumptions": [
                  {
                    "ref": "A-cl-inhab-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "v1LawCells"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "A-cl-inhab-input"
                  },
                  "producer": "src/domain/statement.ts::rowOf",
                  "consumer": "src/ui/statement.ts::renderSentRow",
                  "public_observation": {
                    "ref": "A-cl-inhab-obs"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "A-cl-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": null,
                "assumptions": [
                  {
                    "ref": "A-cl-reach-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "v1LawHeader"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "A-po-stimulus"
                  },
                  "producer": "src/ui/statement.ts::renderStatement",
                  "consumer": "src/ui/theme.css",
                  "public_observation": {
                    "ref": "A-cl-reach-obs"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "reason": {
                  "ref": "A-cl-live"
                },
                "tag": "not_applicable"
              }
            }
          ]
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "scenarios",
      "scope": "value:1",
      "status": {
        "reason": {
          "ref": "A-scen-na"
        },
        "tag": "not_applicable"
      }
    }
  ]
}
```

### Product change (Value 1)

Product change: required

### Verification (Value 1)

Verification command:

```sh
node tests/support/oracle-observation.mjs tests/acceptance/statement-sent-columns.spec.ts
```

Verification command:

```sh
npm run build
```
