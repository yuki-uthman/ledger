## Shared design

### Facts (Shared design)

- F-purpose: Carry the owner's approved phone polish of the Statement, the
  bottom bar and the Entries screen into the source, and fix the common
  contracts the six values share: the hooks a reading finds the converted
  dollars and the Entries scroller by, the pure rule that decides a swipe, the
  touch-driven acceptance project and the unit runner that exercises that rule.
- F-c-no-design-values: A spec asserts what a screen reads, which element is
  shown, aria state, what a tap or a swipe does, and layout invariants worded
  without exact px. No spec asserts a colour, a font size, weight,
  letter-spacing or case, an exact px width, height, gap, padding, radius or
  grid track, or a motion duration, delay, curve or stagger.
- F-c-invented-figures: Every figure in a spec, a document or a commit message
  is invented and seeded by the spec itself: MVR10,000 at the rate 20 stored as
  $500, a send of $750, a repayment of $300. No real ledger figure, date or name
  is written anywhere, because the repository is public.
- F-c-src-uncommitted: The worker commits only tests and documents; src/ is left
  uncommitted in the branch, and the candidate commit is built by the
  verification step from the declared target paths. A src file that is not a
  declared target is left out of that candidate.
- F-c-prototype-reference: The reference for every design value is the owner's
  prototype patch at docs/feature/statement-shell-polish/prototype.patch,
  applied as uncommitted src/ at the start of the first value's craft. A design
  value is changed only when a gate fails, and the change is reported.
- F-c-oracle-vector: The acceptance vector of every value is node
  tests/support/oracle-observation.mjs \<spec>: it runs the repository's own
  pinned Playwright, prints the runner's own output on standard error and
  exactly one DES-ORACLE-OBSERVATION line on standard output, counted from the
  runner's json report, so a failed assertion and a broken environment never
  look alike.
- F-c-one-playwright-run: One Playwright run at a time: every run shares one
  local Supabase stack on ports 54420 to 54424 at origin 4317 and each spec
  resets the database, so runs are serialised with the mkdir lock. Both
  acceptance projects run inside that one serialised run.
- F-c-existing-project-unchanged: The existing phone-chromium project's own
  entry is left exactly as it is and keeps scanning only the acceptance
  directory the configuration names at its top, with its viewport of 360 by 780,
  isMobile false and no touch. The touch specs live in a directory of their own,
  which the new project names itself, so no spec is collected twice and no line
  of the existing entry is edited.
- F-c-rate-guaranteed: A rufiyaa entry always stores a rate that is not null and
  greater than zero: the database constraint at
  supabase/migrations/0001_account_scoped_ledger.sql:35 refuses any other row.
  The domain's own null guard stays exactly as it is and no spec states that
  case.
- F-c-swipe-two-views-only: A sideways swipe switches only between Entries and
  Statement. A swipe between the Sent and the Paid back lists inside the
  Statement is out of scope, and a vertical move still scrolls whatever is under
  the finger.
- F-c-reduced-motion: With reduced motion asked for, the two screens still
  follow the finger through a drag, because that movement is the owner's own,
  and the release shows the result at once: no slide and no spring back.
- F-c-phone-stop: The batch is judged on the owner's own phone against the look
  approved on the prototype before anything is landed, and main is pushed only
  after the owner says approved.
- F-c-no-new-dependency: No new runtime or development dependency is added: the
  manifest and the lockfile stay as they are, so the property checks are written
  with a seeded generator of the test's own and the unit runner is the vitest
  already pinned.
- F-c-viewport: Every acceptance observation is made on a 360 by 780 viewport
  against the built bundle served over a real loopback origin, never a dev
  server.
- F-t-statement: The Statement screen owns what a sent row's two currency cells
  read, what the footer's figures read and the sign before each balance-card
  figure. It gains the data-statement-converted hook on the converted dollars,
  loses the data-statement-placeholder mark with its NO_RUFIYAA constant, loses
  the MINUS constant, and its hook documentation is amended to say so.
- F-t-views: The shell owns the two panes, the bar and the one switch. It gains
  the tab icons and the pointer drag that carries the strip, and it hands the
  switch-or-stay decision to the pure rule module instead of deciding inline.
- F-t-home: The Entries screen owns its area; the area is wrapped in the one box
  that scrolls, carrying the data-entries-scroll hook, so the You and Abbaas
  card and the Entries heading above it keep their place.
- F-t-swipe: A new module owns the gesture's own data and the decision over it:
  the release record, the two-view index, the banded position of the strip and
  the switch-or-stay rule. It reads no DOM and holds no state, so it is
  exercised by the unit runner alone.
- F-t-theme: The stylesheet carries every design value of the batch and the
  gesture rule that the browser keeps the vertical scroll while a sideways move
  belongs to the swipe, declared on the track and on every element inside it.
- F-t-playwright: The acceptance configuration gains one more project and
  nothing else: a touch-enabled project that names its own scan directory,
  tests/touch, so a swipe is driven by real touch events while the existing
  project's entry is untouched.
- F-t-vitest: A unit-runner configuration confines test discovery to tests/unit
  and to the .test.ts name, because the runner's default pattern would otherwise
  collect the Playwright acceptance specs, and it passes when no unit test is
  there yet, so the unit gate is valid for every value of the batch. It leaves
  the build configuration untouched, and the runner's default node environment
  is what makes a DOM read in the pure module fail.
- F-d-hooks: The common reading contract of this batch: the converted dollars of
  a sent row are read through one element carrying data-statement-converted; the
  USD cell of a rufiyaa send keeps data-converted and reads nothing;
  data-statement-placeholder is gone from the page and from the documentation,
  absence being carried by an empty cell; the arrow before a converted figure is
  the UI's own span and never part of a domain string; and the one box of the
  Entries pane that scrolls carries data-entries-scroll. Every value's spec
  binds to these names.
- F-d-swipe-module: The switch-or-stay rule leaves the event handler and becomes
  the pure owner of the gesture's data in src/ui/swipe.ts: SwipeRelease holds
  the starting view index, the sideways travel, the speed at the lift and the
  pane width; swipeAt gives the banded share of the strip; swipeOutcome gives
  the view index the release settles on. The shell reads the pointer events,
  builds that record and draws the answer; it decides nothing about it.
- F-d-touch-project: The swipe is observed through real touch. A second
  acceptance project, phone-touch, sets hasTouch with the same viewport and
  keeps isMobile false, and names tests/touch as the directory it scans, where
  the touch specs live under the name .touch.spec.ts; a drag is dispatched
  through a Chrome DevTools session with a touch start, several moves and an
  end. One run of the configuration collects each spec exactly once, the
  existing project scanning the acceptance directory alone and the touch project
  scanning tests/touch alone, and the acceptance vector selects a touch spec by
  its path with no project flag.
- F-d-vitest-scope: The pure rule is exercised by the pinned vitest through npm
  run test:unit, from tests/unit/swipe-outcome.test.ts, with discovery confined
  by a configuration of its own to tests/unit and the .test.ts name and with an
  empty run passing, so the unit gate reads green from the first value of the
  batch rather than only once the rule's own test lands. The build configuration
  is not touched, so the deployed build cannot be changed by a test setting.
- F-d-paradigm-owners: The paradigm is functional and every owner is a value and
  a function over it: the domain keeps the per-currency reading as a union
  tagged on currency and keeps the footer's named readings; the Statement screen
  keeps the one table of signs and the one renderer per cell; the new rule
  module owns the gesture record and its decision. No decision about one value's
  data is left in a handler or a script, and no class is introduced.
- F-d-algebra-domain: Domain layer. States: a sent row read in rufiyaa with a
  rate and stored dollars, or read in dollars; a release of the strip, standing
  at a share with a speed, from one of the two views. Operations: the
  per-currency cell reading, the footer's named figures, swipeAt, swipeOutcome.
  Observations: the texts those readings carry, the banded share, the settled
  view index. Laws a test can check: a dollar send offers no rate and no
  converted dollars; swipeOutcome answers one of exactly two views for every
  release; a flick answers the direction of the finger whatever the distance; a
  slow release switches exactly when the banded share has passed the commit
  bound.
- F-d-algebra-application: Application and port layer. States: which view the
  shell shows and which tab is marked current; a drag live or not live.
  Operations: the tap switch, the pointer down, move and release, the arrival
  message to the pane. Observations: data-shown, the one aria-current tab, and
  the arrival the pane answers for. Laws a test can check: exactly one tab is
  marked current and it names the shown view, after a tap and after a release
  alike; a release that changes the view tells the arriving pane once; a release
  that changes nothing tells it nothing; the view shown after a release is the
  view the pure rule answered.
- F-d-algebra-adapter: Adapter layer, the DOM the page offers a reader. States:
  the mounted page for a seeded ledger. Operations: the renderers of the
  Statement, the shell and the Entries area. Observations: the hooked elements
  and the text inside them. Laws a test can check: every sent row of a rufiyaa
  send exposes its converted dollars on exactly one data-statement-converted
  element and its USD cell reads nothing; no element of the page carries
  data-statement-placeholder; the sent footer's converted figure is read with an
  arrow before it; the Entries pane has exactly one scrolling box and it is the
  one carrying data-entries-scroll.
- F-d-algebra-infrastructure: Infrastructure and recovery layer. States: the
  local stack up or down, the seeded account present or absent, a Chrome
  DevTools session attached or refused, a pointer cancelled by the browser.
  Operations: the acceptance vector's own install, the stack reset each spec
  makes, the drag dispatch, the pointer cancel path. Observations: the vector's
  one line, with what it observed, what failed on an assertion and what failed
  before any assertion. Laws a test can check: a run that could not reach its
  cases reports a setup failure and no assertion failure; a cancelled pointer
  settles the strip on one of the two views rather than leaving it between them.
- F-d-carriers: The typed carriers and their owners. Decisions:
  StatementMvrCell, tagged on currency, in the domain's statement module;
  SwipeRelease with ViewIndex as the union of 0 and 1, and swipeOutcome over it,
  in src/ui/swipe.ts; FIGURE_SIGNS as a readonly record over the closed union of
  the three figure names, in src/ui/statement.ts. Effects: the DOM writes of
  renderStatement, renderViews and renderEntriesArea, and the arrival event the
  shell dispatches. Errors: none is raised; a degenerate release answers with
  the starting view and a cancelled pointer takes the same release path.
  Per-process state: the live drag record held in the shell's closure and the
  data-dragging mark on the shell, which is internal and read by no spec.
- F-d-checkers: Claim to checker. The release state model, its no-middle-state
  safety and its refinement to the shell's switch were selected for Quint,
  because they are a small state model over a gesture. The progress claim, that
  every live drag reaches a settled view under weak fairness of the release
  action, was selected for TLC, because Quint's own temporal support cannot
  carry a fairness assumption for it. No proof obligation needs Agda: the laws
  are decidable over finite readings and a bounded numeric domain.
- F-d-waiver: Neither Quint, TLC, Apalache nor Agda is installed on this host;
  only a Java runtime is. The owner's standing waiver of the formal checkers for
  this read-only screen work, recorded in the repository's own working
  agreement, is the recorded authority for continuing without those proofs. The
  two selected claims, the release model's no-middle-state safety and its
  progress under fairness, therefore stay INDETERMINATE and their DESIGN axis
  stays BLOCKED; no native test, finite enumeration or argument is offered as
  their proof.
- F-d-closure-summary: Constructive closure of the shared contracts. Safety: the
  hook contract and the single Entries scroller PASS by construction and by
  argument; the release rule's no-middle-state claim is BLOCKED, its proof
  INDETERMINATE under the waiver. Inhabitation: PASS for all three subjects,
  each with an admitted seeded input, a named producer, a named consumer and a
  public reading. Public reachability: PASS for all three, each reaching the
  served page or the module's public import. Liveness: not applicable to the two
  rendering subjects, which are one synchronous pass with no waiting party;
  BLOCKED for the release rule's progress claim. Runtime: DESIGNED_NOT_BUILT
  everywhere, because the source change is the owner's prototype, not yet
  applied, and the new module does not exist yet.
- F-d-stress-nested-scroller: Stressor, negating the assumption that a gesture
  rule declared on the strip governs everything inside it: the owner starts the
  drag on a card or on the entries list, each of which is a scroll container of
  its own. Preserved observation: the strip follows the finger from anywhere on
  the screen. Allowed degradation: none. Forbidden outcome: a drag that moves
  nothing unless it starts at the screen edge. Residue: the rule is declared on
  the track and on every element inside it, and the specs drive a drag that
  starts in mid-screen on a card.
- F-d-stress-mid-slide: Stressor, negating the assumption that a drag starts
  from a strip at rest: the owner grabs the strip while the tap's slide is still
  running. Preserved observation: the strip is taken from where it stands and
  still settles on one of the two views. Allowed degradation: the settling slide
  is shorter than a full one. Forbidden outcome: a jump to the far side, or a
  strip left between the two views. Residue: the shell reads the strip's live
  position when the drag begins and offsets the finger's start by it; the
  data-shown value is written only by the release.
- F-d-stress-second-finger: Stressor, negating the assumption that one finger is
  on the screen: a second pointer goes down during a drag. Preserved
  observation: the drag answers to the pointer that began it and the view shown
  changes once. Allowed degradation: the second pointer does nothing at all.
  Forbidden outcome: two drags driving the strip at once, or a release by the
  wrong pointer. Residue: the drag record holds its pointer id, the strip
  captures that pointer, and every move and release is ignored unless its id
  matches.
- F-d-stress-zero-width: Stressor, negating the assumption that the pane has
  been laid out and has a width: a release arrives with a width of zero.
  Preserved observation: the view shown does not change and the strip rests on
  the starting view. Allowed degradation: the gesture is simply not honoured.
  Forbidden outcome: a share that is not a number reaching the comparison, and
  with it a settled view chosen by chance. Residue: the pure rule answers the
  starting view for any width that is not greater than zero, and that case is
  one of its checked cases.
- F-d-stress-click-swallow: Stressor, negating the assumption that a finger that
  lifts after a drag meant to tap: the lift lands on an entry card. Preserved
  observation: the view switches and no sheet opens. Allowed degradation: a
  deliberate tap made within a moment of a release is lost too. Forbidden
  outcome: a sheet opening behind a swipe. Residue: one capture-phase click is
  swallowed on the shell and the listener is removed shortly after, so an
  ordinary tap is unaffected a moment later.
- F-d-stress-reduced-motion: Stressor, negating the assumption that the arrival
  may be animated: the owner has asked for reduced motion. Preserved
  observation: the screens follow the finger through the drag and the released
  view shows at once. Allowed degradation: no slide and no spring back is drawn.
  Forbidden outcome: a motion that ends anywhere but its resting state, or a
  drag that stops following the finger. Residue: the drawing during a drag is a
  direct write that no transition governs, and the settling hands over to the
  motion owner, which already answers for reduced motion.
- F-d-spof: Single points of failure and construction bypasses. The data-shown
  attribute on the shell is one string and the single truth of which view is
  read: any writer outside the shell can set another value, and no type can stop
  it; the obligation to write it only through the shell's own switch stays with
  the shell's owner. The stylesheet's gesture rule is a second single point: a
  later selector that sets a different touch-action inside the track takes the
  drag away again, and the obligation to keep that rule on the track and
  everything inside it stays with the stylesheet's owner. The acceptance
  observation rests on one local stack and one seeded account; when either is
  absent nothing about the product is observed and the vector says so as a setup
  failure.
- F-d-bypasses: What the design cannot stop. A cast or a value shaped at the
  boundary can carry a figure name the sign table does not know, or a release
  record whose numbers are not numbers; the type checker that runs in the build
  rejects those only on annotated paths. The DOM is a public writable surface:
  anything on the page can add or remove a hook, so the hook contract is checked
  by a reading of the mounted page and never only by a type. A foreign process
  that stops the stack, and a browser that refuses a DevTools session, both end
  the observation rather than falsify the product, and the vector keeps them
  apart from an assertion failure.
- F-d-second-walk: A second set of stressors, not used to derive this design,
  walked against it. A release whose speed is exactly the flick bound: the rule
  is stated with a strict comparison, so the bound belongs to the slow branch
  and the answer is decided by the distance; it is a checked case rather than an
  open question. A drag of more than a full width in the wrong direction: the
  band gives a quarter past the end, so the share stays within the commit bound
  and the view does not change; the band is load-bearing, not decoration. A
  second rufiyaa send of the same figure in one list: the hook law is stated per
  row, so two rows each expose their own converted element and the reading stays
  unambiguous. A page read aloud: the tab icons are hidden from it and each tab
  still reads its own word, so the bar loses nothing by gaining an icon. An
  Entries list short enough to fit the phone: no box scrolls, the
  single-scroller law holds trivially, and the law that the card and the heading
  keep their place is then vacuous and is observed on a seeded long list
  instead.
- F-d-states: Admitted, excluded and unknown states. Admitted: a sent row in
  rufiyaa with a rate greater than zero and stored dollars; a sent row in
  dollars; a release with a positive width; a release with a width of zero,
  answered with the starting view; a cancelled pointer. Excluded: a rufiyaa row
  with no stored rate, which the database constraint refuses; a strip settled
  between the two views; a balance-card figure drawn with a sign other than the
  one its table gives; two boxes of the Entries pane scrolling at once; an
  element carrying data-statement-placeholder. Unknown, with the owner's phone
  check as their risk owner: whether a browser other than this repository's own
  Chromium applies the gesture rule to every nested scroll container alike, and
  whether a dispatched touch drag reproduces the timing of a real finger closely
  enough for the flick bound to feel as it did on the prototype.
- F-d-self-falsification: Three laws this design refutes rather than keeps. A
  gesture rule on the strip alone does not reach the scrolling boxes inside it,
  so the rule is declared on every element of the strip. A drawn em dash does
  not read as absence in a money column, so the empty cell carries it and the
  mark is gone. The dollars a rufiyaa send stores do not belong in the dollar
  column, because the row would then read the same money twice, so they stand
  under the rufiyaa figure and the dollar cell of such a row reads nothing.
- F-d-substrate: The test substrate. The driving port is the built bundle served
  over a loopback origin and read by the pinned Playwright at 360 by 780,
  through the existing supports: the stack helper that brings the local Supabase
  up and resets it, and the accounts helper that seeds and signs in an invented
  account. The acceptance vector is node tests/support/oracle-observation.mjs
  \<spec>, which installs the pinned dependencies itself when they are absent
  and prints the one observation line. The touch specs live in tests/touch under
  the name .touch.spec.ts, the directory the touch project scans, and both test
  directories lie inside the type-check project that already covers tests. The
  unit substrate is the pinned vitest in its default node environment, run by
  npm run test:unit over tests/unit, importing the pure module through its
  public export, with an empty run passing. The gates are npm run build, npm run
  test:unit and npm run test:acceptance over both projects in one serialised
  run.
- F-d-pbt: The broad laws of the pure rule are checked with generated releases
  through its public export: the starting view index, a sideways travel over
  plus or minus two widths, a speed over plus or minus two pixels a millisecond
  and a width of a phone's order. With no property library pinned, the test
  carries its own seeded generator: a fixed seed printed with any failure so the
  case is replayed exactly, and a hand shrink that halves the travel and the
  speed towards zero and reports the smallest release that still fails. The
  expected answer is computed in the test from the stated bounds, never from the
  module. The generated domain includes a release exactly at the commit bound,
  one exactly at the flick bound, one past the end of the strip and one of zero
  width.
- F-d-design-values-travel: The fifteen design values of the batch travel in the
  same source change as the behaviour: the gaps at the top, the bar, the
  buttons, the pill and the totals, the sizes and weights of the two detail
  lines, the rufiyaa and dollar column tracks, the bar's padding and the pill's
  place around the icon. They are judged on the owner's phone and are asserted
  in no spec; the equality this design states deliberately cannot tell two
  renderings apart that differ only in one of them.
- F-d-arch-check: Two architectural laws of this batch are checked. The hook
  contract is one law over the whole page, not a style: a reading of the mounted
  page finds the converted dollars on exactly one hooked element, finds no
  placeholder hook anywhere, and finds the Entries pane's one scrolling box to
  be the hooked one. The dependency direction is the other: the pure rule module
  is imported by the shell and imports nothing of the DOM, and the unit runner's
  node environment, where no document exists, is what falsifies a DOM read
  inside it.
- F-r-mvr-cell-type: The domain already owns the per-currency reading as a union
  tagged on currency, carrying the figure, the rate text or null, and the stored
  dollars. Nothing about the stored money changes, so the union is reused
  exactly as it is and only the renderer that reads it changes.
- F-r-foot-figure: The footer's figures are already named readings, one of them
  the converted total, computed once in the domain from the summed rufiyaa. The
  arrow is a span the UI draws before that same figure, so no new figure and no
  new domain string is introduced.
- F-r-figure-signs: The one table of signs stays the single owner of what stands
  before a balance-card figure; the entry for the paid-back figure becomes empty
  and the minus constant it referred to is removed with it.
- F-r-no-rufiyaa: The constant that drew the em dash, and the style that greyed
  it, have no remaining reader once absence is an empty cell; keeping either
  would leave a second way to say absence.
- F-r-entries-area: The Entries area has exactly one builder and one caller, so
  wrapping it in the hooked scroller changes the Entries screen in one place and
  every reading of a card keeps working through the box that now scrolls.
- F-r-views-shell: The shell already owns the one switch, the attribute that
  says which view is read, the two aria-current values and the arrival message.
  The swipe reuses that switch rather than opening a second way to change the
  view.
- F-r-slide-views: The settling of the strip and the pill is already the motion
  owner's, including its answer to reduced motion, so the release hands over to
  it rather than timing a slide of its own.
- F-r-release-inline: No symbol decides a gesture's outcome today: the rule
  would otherwise live inside the release handler, where the decision about the
  gesture's own data could not be read or checked apart from the DOM. It becomes
  the pure module's swipeOutcome, with the gesture's data as its record.
- F-r-playwright-projects: The acceptance configuration already owns the device
  setup as a list of projects, and a project may name the directory it scans for
  itself, so the touch project is added beside the existing one with a scan
  directory of its own and the existing entry is not edited at all.
- F-r-oracle-vector-reuse: The observation vector already runs the pinned
  runner, installs what is missing and prints the one line every value's oracle
  needs, so it is reused unchanged and nothing new is written to report an
  observation.
- F-r-vite-config: The build configuration could carry the unit runner's
  discovery, since the runner reads it, but it is the configuration of the
  bundle that every push deploys. The unit discovery goes into a configuration
  of its own instead, which the runner prefers over it and which the build never
  loads.
- F-a-columns-placeholder: This reading finds the rufiyaa figure by excluding
  the rate and the placeholder inside the cell, and reports the placeholder it
  found. With the placeholder gone and the rate and the converted dollars
  standing in a line of their own inside the cell, the reading is migrated to
  find the figure, the rate and the converted element by their own hooks.
- F-a-columns-usd: This case expects the em dash in a dollar send's rufiyaa cell
  and the converted dollars in a rufiyaa send's dollar cell. It is migrated to
  expect an empty rufiyaa cell with no mark, and an empty dollar cell that still
  names itself converted.
- F-a-sent-reading: This reading builds each row's expected rufiyaa text from
  the em dash and from the figure with the rate appended. It is migrated to the
  two-line reading: the figure, and under it the rate, the arrow and the stored
  dollars.
- F-a-sent-signs: This case expects the three balance-card signs to be an empty
  string, a minus and an empty string. It is migrated to three empty strings,
  which is what the card now reads.
- F-a-footer-reading: This reading expects the footer's rufiyaa line to read the
  subtotal alone, and uses the em dash for a line that reads none. It is
  migrated to the subtotal with the arrow and the converted total on the line
  under it.
- F-a-motion-scroller: This reading finds the scroller of the Entries pane as
  the first box inside it whose content is taller than itself. The pane now has
  an inner box that scrolls, so the reading is migrated to the hooked box, which
  is the one the design names.
- F-a-ring-clipper: This reading finds the ancestor that clips a card
  horizontally by its computed overflow, and asserts the card lies inside it.
  The new scrolling box is such an ancestor and contains the same cards, so the
  invariant holds unchanged and the reading needs no edit.
- F-a-no-h-scroll: This reading asserts that nothing escapes the viewport and
  that the page does not scroll sideways. The strip, the new scrolling box and
  the gesture rule all keep the page itself unscrollable, so the invariant holds
  unchanged.
- F-a-home-minus: This case asserts that the Home box reads no sign before a
  dollar figure. The sign that is removed is the Statement card's own, so this
  reading is unaffected.
- F-a-lists-balance: This case asserts that the balance figure carries no sign.
  The balance entry of the sign table was already empty and stays empty, so this
  reading is unaffected.
- F-a-p-mvr-cell: The producer of a sent row's two currency cells and of every
  hook inside them. It is migrated: the converted dollars gain their own hook,
  the placeholder hook and its mark are gone, and the documentation of the hooks
  at the head of the module is amended to match.
- F-a-p-foot-figure: The producer of the footer's figures. It is migrated: a
  figure that reads the converted total is drawn with an arrow span before it,
  inside a line of its own, and keeps the name that says what it is a reading
  of.
- F-a-p-signs: The producer of the sign before each balance-card figure. It is
  migrated: the paid-back entry becomes empty, so no row of the card reads a
  sign.
- F-a-p-entries-area: The producer of the Entries area. It is migrated: the area
  is wrapped in the one box that scrolls and that box carries the hook by which
  a reading finds it.
- F-a-p-views-shell: The producer of which view is shown and which tab is marked
  current. Those two hooks are unchanged and compatible: the swipe writes them
  through the same switch a tap uses, so every existing reading of them keeps
  its meaning.
- F-b-driving: The driving port is the mounted page of the built bundle, served
  over a loopback origin and read and driven as the owner's phone would: a tap,
  a touch drag dispatched through a DevTools session, and a scroll. The pure
  rule module has a second driving port of its own, its public export, driven by
  the unit runner.
- F-b-driven-ledger: The driven ledger store: the local Supabase stack the spec
  brings up, resets and seeds with invented entries. Nothing of this batch
  writes to it.
- F-b-driven-pointer: The driven input: the browser's pointer events, with
  pointer capture while a drag is live and a cancel the browser may send at any
  moment.
- F-b-driven-style: The driven stylesheet: the gesture rule that gives the
  vertical scroll to the browser and the sideways move to the swipe, declared on
  the strip and on every element inside it.
- F-b-driven-reduced: The driven environment: the reduced-motion preference,
  read by the stylesheet and by the motion owner, never by the pure rule.
- F-b-direction: Dependencies point inward. The pure rule module imports
  nothing. The shell imports the rule and the motion owner. The screens import
  the domain's readings. The domain imports nothing of the UI, and no module of
  the UI is imported by the domain. The specs import only the public page and
  the public export of the rule.
- F-b-f-width-cond: A release arrives before the pane has a width, so the width
  is zero.
- F-b-f-width-obs: The view shown does not change, the strip rests on the
  starting view, and the share the rule computes is a number.
- F-b-f-pointer-cond: The browser cancels the pointer in the middle of a drag.
- F-b-f-pointer-obs: The same release path runs, so the strip settles on one of
  the two views and the shown view and its current tab agree.
- F-b-f-second-cond: A second pointer goes down or is released while a drag is
  live.
- F-b-f-second-obs: Nothing answers it: the view shown changes once, by the
  pointer that began the drag.
- F-b-f-touch-cond: The touch project cannot attach a DevTools session, so no
  touch can be dispatched.
- F-b-f-touch-obs: The observation line reports a setup failure with nothing
  observed, never a failed assertion.
- F-b-f-stack-cond: The local stack is down, or the seeded account is missing.
- F-b-f-stack-obs: The observation line reports a setup failure with nothing
  observed, so a broken environment is never read as a red oracle.
- F-o-observation: On a phone reading a seeded ledger that holds one send of
  MVR10,000 at the rate 20 stored as $500, one send of $750 and more entries
  than fit the screen, the Statement's sent list reads the stored dollars of the
  rufiyaa send through exactly one element hooked data-statement-converted, that
  row's dollar cell reads nothing while still naming itself converted, the
  dollar send's rufiyaa cell reads nothing at all, no element of the page
  carries data-statement-placeholder, and on Entries the one box that scrolls is
  the box hooked data-entries-scroll while the card and the heading above it
  keep their place.
- F-o-stimulus: The bundle is built and served over the loopback origin, the
  owner signs in to the seeded account, reads the sent list of the Statement,
  returns to Entries and scrolls the list to its end.
- F-o-expected: The expected readings are computed in the spec from the seeded
  rows alone: MVR10,000 with the rate 20 and $500 under it, $750 in the dollar
  column of the dollar send, nothing in either cell that the design leaves
  empty, no placeholder element anywhere, and the hooked box as the single
  scroller, with the card's and the heading's boxes unmoved between the first
  and the last scroll position.
- F-o-falsifier: The spec fails when the converted dollars are read anywhere but
  the hooked element, when the dollar cell of a rufiyaa send reads a figure,
  when any element still carries the placeholder hook, when the Entries pane has
  no scrolling box or more than one, when that box is not the hooked one, or
  when the card or the heading moves while the list scrolls.
- F-adr-context: Six values of one approved batch change what three screens read
  and how the owner moves between two of them. They share four contracts: the
  names a reading finds the new content by, the rule that decides a swipe, the
  way a swipe is driven in a test, and where a unit test of that rule lives.
  Deciding them once keeps the six specs reading the same page and keeps the
  decision about the gesture out of the event handler.
- F-adr-decision: Fix the four shared contracts before the values: the hooks
  data-statement-converted and data-entries-scroll, the kept data-converted and
  the removed data-statement-placeholder; the pure rule module owning the
  release record, the banded share and the switch-or-stay answer; a second
  touch-enabled acceptance project that names tests/touch as its own scan
  directory and is added beside the existing project without editing it; and a
  unit discovery of its own, confined to tests/unit and passing while no unit
  test is there yet, leaving the build configuration untouched.
- F-adr-alt-keep-usd: Keep the converted dollars in the dollar column and the em
  dash in the empty rufiyaa cell, as they read today. Rejected: the row then
  reads the same money twice and the owner reads the dash as a figure.
- F-adr-alt-inline-rule: Leave the switch-or-stay rule inside the release
  handler and observe it only through the browser. Rejected: the decision about
  the gesture's own data would be unreadable apart from the DOM, every bound
  would be checked only through a dispatched drag, and the numeric edges would
  go unchecked.
- F-adr-alt-one-project: Give the single existing project touch and drive every
  spec through it. Rejected: it changes the device every existing spec is judged
  on, for the sake of one new behaviour.
- F-adr-alt-vite-test: Put the unit discovery in the build configuration, which
  the runner also reads. Rejected: that file configures the bundle every push
  deploys, and a test setting must not be able to change it.
- F-adr-con-specs: Seven existing acceptance readings are migrated in the values
  that change what they read, and two more are checked and left as they are. A
  reading now binds to a hook rather than to the shape of a cell, which is what
  makes the design values free to move.
- F-adr-con-two-runners: The repository gains a second acceptance project and
  its first unit test, so the gates are a build, a unit run and one serialised
  acceptance run over two projects.
- F-adr-con-unproven: The release model's no-middle-state safety and its
  progress under fairness stay unproven here: the checkers are absent and
  waived, so both claims stay INDETERMINATE and are carried instead by the pure
  rule's generated checks and by the owner's phone check.
- F-pf-na: No preserving move is made before the behaviour changes. The whole
  source change arrives as the owner's approved prototype applied in one step at
  the start of the first value's craft, and every existing oracle that reads the
  changed content is itself amended by this Request, so none of them is a green
  baseline a move could be measured against. The extraction of the pure rule
  moves code that this Request itself introduces, inside the value that
  introduces it.
- F-ct-na: Producer and consumer live in one deployable and change in the same
  candidate: the renderers and the specs that read them, and the pure rule and
  the shell that calls it. Nothing of this batch is persisted, sent over a wire
  or released on another schedule, so the primary oracle of each value covers
  the agreement and no separate contract test is needed.
- F-at-hook-ssot: The hook contract holds over the whole mounted page, not only
  over the rows a value happens to read: the converted dollars are exposed on
  exactly one hooked element per row, no element carries the removed placeholder
  hook, and the Entries pane's single scrolling box is the hooked one.
- F-at-pure-rule: The rule module stays free of the DOM and the dependency
  points one way: the shell imports the rule, the rule imports nothing, and the
  rule answers every release in a runner where no document exists.
- F-ic-statement: The Statement screen is changed: its cell and footer
  renderers, its sign table, its two removed constants and the hook
  documentation at its head.
- F-ic-views: The shell is changed: the tab icons, the pointer drag, the live
  drawing and the release that hands over to the pure rule and the motion owner.
- F-ic-home: The Entries screen is changed: the area is wrapped in the hooked
  box that scrolls.
- F-ic-swipe: The rule module is new: the release record, the two-view index,
  the banded share and the switch-or-stay answer.
- F-ic-theme: The stylesheet is changed: the design values of the batch and the
  gesture rule on the strip and everything inside it.
- F-ic-playwright: The acceptance configuration is changed by addition alone:
  one touch project that names its own scan directory. The existing project's
  entry is unchanged.
- F-ic-vitest: The unit discovery is new: it confines the runner to tests/unit
  and the .test.ts name and lets an empty run pass. It is outside both
  type-check projects and is exercised by the unit run itself.
- F-ob-converted: The text read on the element a sent row exposes as its
  converted dollars.
- F-ob-converted-cd: It cannot tell which element draws it, nor its ink, size or
  weight, nor whether a rate stands beside it.
- F-ob-usd-cell: The text of a sent row's dollar cell together with what that
  cell says about being a converted reading.
- F-ob-usd-cell-cd: It cannot tell the ink and the weight the board draws from
  that same saying, nor which currency the row was sent in beyond what the cell
  itself says.
- F-ob-placeholder: How many elements of the mounted page carry the placeholder
  hook.
- F-ob-placeholder-cd: It cannot tell which cell is empty, nor why it is empty.
- F-ob-foot-converted: What the sent footer's rufiyaa line reads on the figure
  named as the converted total, together with the mark drawn before it.
- F-ob-foot-converted-cd: It cannot tell the size, the ink or the gap above that
  line, nor where the line stands on the screen.
- F-ob-entries-scroller: Whether the one box of the Entries pane whose content
  is taller than itself is the box carrying the Entries scroll hook, and whether
  the card and the heading keep their boxes while it scrolls.
- F-ob-entries-scroller-cd: It cannot tell how far the box scrolls, nor its
  padding, nor the look of the fade over it.
- F-ob-shown: Which view the shell names as shown, together with the view named
  by the single tab marked as the current one.
- F-ob-shown-cd: It cannot tell the slide, the pill's travel, the inks, or the
  moment the arrival was drawn.
- F-ob-swipe-at: The share of the strip a release stands at, as the rule's own
  banded answer.
- F-ob-swipe-at-cd: It cannot tell how many pixels the finger travelled, nor the
  width that produced the share.
- F-ob-swipe-outcome: The view index a release settles on, as the rule answers
  it.
- F-ob-swipe-outcome-cd: It cannot tell the path the finger took to that
  release, its pauses or its pressure.
- F-eq: Two states of this batch are the same when no observation above tells
  them apart. Every colour, font size, weight, case, px width, height, gap,
  padding, radius and grid track, and every duration, delay, curve and stagger
  of this batch lies outside that set, so two renderings that differ only in one
  of them are equal here and no spec may separate them.
- F-gen-domain: A release of the strip: a starting view index of 0 or 1, a
  sideways travel over plus or minus two widths in whole pixels, a speed over
  plus or minus two pixels a millisecond, and a width from 240 to 480 pixels,
  with zero admitted as its own case.
- F-gen-seed: A fixed seed drives the test's own generator and is printed with
  any failure, so the failing release is replayed exactly; a failure is then
  shrunk by hand, halving the travel and the speed towards zero and reporting
  the smallest release that still fails.
- F-case-exact-commit: A release whose banded share stands exactly at the commit
  bound.
- F-case-exact-flick: A release whose speed stands exactly at the flick bound.
- F-case-past-end: A release whose raw share lies past either end of the strip.
- F-case-zero-width: A release whose width is zero.
- F-law-swipe-total: For every release of the generated domain the rule answers
  one of exactly two view indexes, and the share it computes is a finite number:
  it neither raises, nor answers nothing, nor answers a third thing.
- F-law-swipe-total-io: The test checks the answer against the two-view index
  set it states itself, and checks the share with a finiteness test of its own,
  never against a value the module computed.
- F-law-swipe-total-fals: A release for which the rule raises, answers nothing,
  answers a value outside the two-view set, or computes a share that is not a
  finite number.
- F-law-swipe-flick: When the speed at the lift is faster than the flick bound,
  the rule answers the view the finger was moving towards, whatever the travel
  and the width were.
- F-law-swipe-flick-io: The test derives the expected view from the sign of the
  generated speed alone, before calling the rule.
- F-law-swipe-flick-fals: A fast release towards one view that the rule answers
  with the other, or that it decides by distance.
- F-law-swipe-commit: When the speed is not faster than the flick bound, the
  rule answers the other view exactly when the banded share has moved past the
  commit share of the width from the starting view, and the starting view
  otherwise.
- F-law-swipe-commit-io: The test computes the banded share and compares it with
  the commit bound itself, from the generated travel and width, and derives the
  expected view from that comparison alone.
- F-law-swipe-commit-fals: A slow release past the commit bound that stays, or
  one short of it that switches; and a release exactly at the bound that is not
  treated as short of it.
- F-law-swipe-through-at: Two releases with the same starting view, the same
  speed and the same banded share are answered alike, whatever travel and width
  produced that share: the decision reads the travel only through the share.
- F-law-swipe-through-at-io: The test builds the second release by scaling the
  travel and the width together, so the share is the same by construction, and
  compares the two answers.
- F-law-swipe-through-at-fals: A pair of releases with the same share, speed and
  starting view that the rule answers differently.
- F-law-swipe-degenerate: For a width that is not greater than zero the rule
  answers the starting view and computes the starting share, so no share that is
  not a number reaches the comparison.
- F-law-swipe-degenerate-reason: The degenerate widths are a single boundary,
  not a domain: a width of zero and a negative width are the whole of it, so
  they are stated as cases rather than generated.
- F-case-negative-width: A release whose width is negative.
- F-law-hook-converted: A sent row made in rufiyaa exposes its stored dollars on
  exactly one element carrying the converted hook, and its dollar cell reads
  nothing while still naming itself a converted reading; a sent row made in
  dollars exposes no such element, and its rufiyaa cell reads nothing at all.
- F-law-hook-converted-reason: A sent row is made in one of two currencies and
  nothing else, so the two seeded rows, read together in one list, are the whole
  of the law's ground.
- F-law-no-placeholder: No element of the mounted page carries the placeholder
  hook, on either list and for either currency.
- F-law-no-placeholder-reason: The claim is an absence over the whole page, so
  one seeded ledger holding both currencies and a repayment settles it; a wider
  ledger could add no new kind of cell.
- F-law-foot-arrow: The sent footer's rufiyaa line reads its subtotal, and under
  it the converted total with an arrow drawn before it as the UI's own mark,
  while the dollar line and the total line each still read their own figure.
- F-law-foot-arrow-reason: The footer has exactly three lines and one converted
  figure, so two seeded ledgers, one with two rufiyaa sends and one with both
  currencies, are the whole of the law's ground.
- F-law-entries-scroller: Inside the Entries pane exactly one box has content
  taller than itself, that box is the one carrying the Entries scroll hook, and
  the card and the heading above it keep their boxes while it is scrolled to its
  end.
- F-law-entries-scroller-reason: The pane holds one list, so a seeded ledger
  longer than the screen and one shorter than it are the whole of the law's
  ground; the short list makes the claim vacuous and is why the long one is
  seeded.
- F-law-shown-agrees: Exactly one tab is marked as the current view and it names
  the view the shell says is shown, after a tap, after a release that changed
  the view and after a release that did not; and the view shown after a release
  is the one the pure rule answered.
- F-law-shown-agrees-reason: There are two views and three ways to arrive at one
  of them, a tap, a switching release and a staying release, so the six readings
  are the whole of the law's ground.
- F-case-mvr-send: A ledger holding one send of MVR10,000 at the rate 20, stored
  as $500.
- F-case-usd-send: A ledger holding one send of $750 made in dollars.
- F-case-both-sends: A ledger holding the rufiyaa send, the dollar send and one
  repayment of $300 together.
- F-case-two-mvr-sends: A ledger holding a send of MVR10,000 at the rate 20
  stored as $500 and a send of MVR4,000 at the rate 20 stored as $200.
- F-case-long-list: A ledger holding more entries than fit the phone.
- F-case-short-list: A ledger holding fewer entries than fit the phone.
- F-case-tap: The Statement tab tapped from Entries.
- F-case-release-switch: A release that the rule answers with the other view.
- F-case-release-stay: A release that the rule answers with the view it started
  from.
- F-ref-touch-action: A gesture rule declared on the strip alone decides the
  sideways move for every box inside it.
- F-ref-touch-action-cx: A drag begun on a card or on the entries list moved
  nothing, because each scrolling box inside the strip is a scroll container of
  its own and answers only to its own rule; only a drag begun at the screen edge
  moved the strip. The rule is therefore declared on the strip and on every
  element inside it.
- F-ref-dash: A drawn em dash in an empty rufiyaa cell tells the owner that this
  send left no rufiyaa.
- F-ref-dash-cx: In a money column the dash reads as a figure of its own, so
  absence is carried by the empty cell and the mark, its constant and its style
  are gone.
- F-ref-usd-cell: The dollars a rufiyaa send stores belong in the dollar column,
  beside the dollars that left as dollars.
- F-ref-usd-cell-cx: The row then reads the same money twice, once as what went
  out and once as what it was worth, so the stored dollars stand under the
  rufiyaa figure and the dollar cell of such a row reads nothing while still
  naming itself converted.
- F-x-view-index: A release settles on one of the two views and on nothing
  between them, because the rule answers an index that is the union of 0 and 1
  and has no third value to answer.
- F-x-view-index-harm: A strip left between the two views shows half of each
  screen, with no tab marked as the current one and no way back but another
  gesture.
- F-x-view-index-in: The release record the shell builds from the pointer
  events: the starting view index, the travel, the speed and the pane width.
- F-x-view-index-obs: The view the shell says is shown, and the single tab
  marked as current, after the release.
- F-x-view-index-bypass1: The attribute that says which view is shown is a
  string on the page: any writer outside the shell can set another value, and no
  type can stop it.
- F-x-view-index-bypass2: A cast, or a record shaped outside the module, can
  carry numbers that are not numbers into the rule; the checker that runs in the
  build rejects that only on annotated paths.
- F-x-signs: No figure of the balance card can be drawn with a sign the one
  table does not give it, because the table is a readonly record over the closed
  union of the three figure names and the renderer reads the sign only from it.
- F-x-signs-harm: A minus in front of the paid-back figure again, telling the
  owner that money that came back was taken off twice.
- F-x-signs-in: A seeded ledger of sends and one repayment, read as the card's
  three figures.
- F-x-signs-obs: The three signs the card reads between its words and its
  figures.
- F-x-signs-bypass: A figure name cast from stored data could reach the table
  outside its union; the build's checker rejects that only on annotated paths,
  and nothing on the page stops another writer from drawing a sign of its own.
- F-x-mvr-currency: The renderer cannot read a rate or stored dollars from a
  send made in dollars, because the cell reading is a union tagged on currency
  and only its rufiyaa case carries those fields.
- F-x-mvr-currency-harm: A dollar send drawn with a rate or with converted
  dollars, stating money the send never stored.
- F-x-mvr-currency-in: A seeded send made in dollars, read as its cell reading.
- F-x-mvr-currency-obs: What the dollar send's rufiyaa cell reads: nothing at
  all.
- F-x-mvr-currency-bypass: The page is a public writable surface: the union
  governs what is built, not what another writer may add to the cell afterwards.
- F-cl-hooks: The common reading contract of the batch: the converted hook, the
  kept converted saying on the dollar cell, the absent placeholder hook and the
  arrow drawn by the UI.
- F-cl-hooks-safety: No reading of the page can find the converted dollars in
  two places, or find a placeholder where a cell is empty: the renderers are the
  single writers of those cells and each draws from a reading tagged on
  currency.
- F-cl-hooks-inhab: A seeded rufiyaa send is read as a cell reading by the
  domain, drawn by the Statement renderer and read on the page as the figure
  with the rate, the arrow and the stored dollars under it.
- F-cl-hooks-reach: That reading is reached through the served page at the
  loopback origin, the only port a phone and a spec both use.
- F-cl-hooks-liveness: The rendering is one synchronous pass with no queue, no
  retry and no waiting party, so there is no progress claim to state about it.
- F-cl-hooks-runtime: Not yet observed: the hooks are not in the committed
  source, the owner's prototype carries only the cells, and the hooks are added
  in the craft of the values that own them.
- F-cl-hooks-assume: It rests on the domain keeping its reading tagged on
  currency, and on the renderers staying the single writers of those cells.
- F-cl-swipe: The switch-or-stay rule of the release: the banded share, the
  flick bound, the commit bound and the settled view.
- F-cl-swipe-safety: A release settles on one of the two views and never between
  them.
- F-cl-swipe-safety-blocked: Unchecked: this claim was selected for a Quint
  state model of the release and no checker is installed on this host. Under the
  owner's recorded waiver the proof stays INDETERMINATE and the claim stays
  BLOCKED; the rule's generated checks and the phone check carry it instead.
- F-cl-swipe-safety-runtime: Nothing is observed yet: the module does not exist
  and no run has been made.
- F-cl-swipe-inhab: A release record built from a real drag is answered by the
  rule with one of the two view indexes, which the shell writes as the shown
  view.
- F-cl-swipe-reach: The answer is reached twice over: on the served page as the
  view shown after a touch drag, and through the module's public export in the
  unit runner.
- F-cl-swipe-live: Every live drag reaches a settled view: no drag stays live
  after the finger has lifted or the pointer has been cancelled.
- F-cl-swipe-live-blocked: Unchecked: this progress claim was selected for TLC
  under weak fairness of the release action, because Quint's own temporal
  support cannot carry that assumption, and no checker is installed. Under the
  owner's recorded waiver the proof stays INDETERMINATE and the claim stays
  BLOCKED.
- F-cl-swipe-live-assume: It assumes the browser delivers either a pointer up or
  a pointer cancel for every captured pointer, which is the scheduling
  obligation of the browser and not of this design.
- F-cl-swipe-assume: It rests on the pane width being read at the moment of the
  drag, on one pointer driving one drag, and on the shell writing the shown view
  only through its own switch.
- F-cl-entries: The single scrolling box of the Entries pane, and the card and
  the heading pinned above it.
- F-cl-entries-safety: Two boxes of the pane cannot scroll at once: the screen
  inside the pane is clipped and holds its height, and the one box below the
  pinned parts takes the remaining room.
- F-cl-entries-safety-assume: It rests on the pane keeping its height, on the
  screen inside it being clipped rather than scrollable, and on the hook being
  carried by that one box alone.
- F-cl-entries-inhab: A seeded ledger longer than the screen is drawn as the
  Entries area inside the hooked box, which scrolls to its end while the card
  and the heading keep their boxes.
- F-cl-entries-reach: That reading is reached through the served page, by
  scrolling the hooked box as a finger would.
- F-cl-entries-liveness: Scrolling is the browser's own and this design neither
  queues nor defers anything, so there is no progress claim to state about it.
- F-cl-entries-runtime: Not yet observed: the wrapping box is in the owner's
  prototype, which is not applied, and its hook is added in craft.
- F-model-na: The selected checkers are absent. The release state model was
  selected for Quint and its progress claim for TLC, and neither Quint, TLC,
  Apalache nor Agda is installed on this host, where only a Java runtime is. The
  owner's standing waiver of the formal checkers for this work is the recorded
  authority for continuing, so no model file is delivered, no run is claimed,
  and the two claims that rest on them stay INDETERMINATE. The algebraic model
  itself is delivered as the laws of this scope.
- F-scenarios-na: A scenario of this scope is read from the trace of an executed
  model run, and no model was executed, because the checkers are absent and
  waived. The behavioural scenarios the owner approved are the ones already
  written in the product brief and the ones each value's oracle states.
- F-adr-alt-testignore: Keep the touch specs beside the acceptance specs and
  tell the existing project to ignore them. Rejected: the owner's decision is
  that the existing project stays as it is, and a scan directory named by the
  touch project itself reaches the same end without editing that entry.

### Targets (Shared design)

| Path | Decision | Reason |
|---|---|---|
| `src/ui/statement.ts` | EXTEND | F-t-statement |
| `src/ui/views.ts` | EXTEND | F-t-views |
| `src/ui/home.ts` | EXTEND | F-t-home |
| `src/ui/swipe.ts` | CREATE_NEW | F-t-swipe |
| `src/ui/theme.css` | EXTEND | F-t-theme |
| `tests/playwright.config.ts` | EXTEND | F-t-playwright |
| `vitest.config.ts` | CREATE_NEW | F-t-vitest |

### Paradigm (Shared design)

functional

### Decisions (Shared design)

F-d-hooks, F-d-swipe-module, F-d-touch-project, F-d-vitest-scope,
F-d-paradigm-owners, F-d-algebra-domain, F-d-algebra-application,
F-d-algebra-adapter, F-d-algebra-infrastructure, F-d-carriers, F-d-checkers,
F-d-waiver, F-d-closure-summary, F-d-stress-nested-scroller,
F-d-stress-mid-slide, F-d-stress-second-finger, F-d-stress-zero-width,
F-d-stress-click-swallow, F-d-stress-reduced-motion, F-d-spof, F-d-bypasses,
F-d-second-walk, F-d-states, F-d-self-falsification, F-d-substrate, F-d-pbt,
F-d-design-values-travel, F-d-arch-check

### Oracle (Shared design)

tests/acceptance/shell-hooks.spec.ts

### Acceptance supports (Shared design)

```json
[
  "tests/support/oracle-observation.mjs",
  "tests/support/accounts.ts",
  "tests/support/local-stack.ts"
]
```

### Oracle verification index (Shared design)

```json
0
```

### Purpose (Shared design)

F-purpose

### Constraints (Shared design)

F-c-no-design-values, F-c-invented-figures, F-c-src-uncommitted,
F-c-prototype-reference, F-c-oracle-vector, F-c-one-playwright-run,
F-c-existing-project-unchanged, F-c-rate-guaranteed, F-c-swipe-two-views-only,
F-c-reduced-motion, F-c-phone-stop, F-c-no-new-dependency, F-c-viewport

### Inherits (Shared design)

None

### Boundaries (Shared design)

```json
{
  "driving_port": {
    "ref": "F-b-driving"
  },
  "driven_ports": [
    {
      "ref": "F-b-driven-ledger"
    },
    {
      "ref": "F-b-driven-pointer"
    },
    {
      "ref": "F-b-driven-style"
    },
    {
      "ref": "F-b-driven-reduced"
    }
  ],
  "dependency_direction": {
    "ref": "F-b-direction"
  },
  "failures": [
    {
      "condition": {
        "ref": "F-b-f-width-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "F-b-f-width-obs"
      }
    },
    {
      "condition": {
        "ref": "F-b-f-pointer-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "F-b-f-pointer-obs"
      }
    },
    {
      "condition": {
        "ref": "F-b-f-second-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "F-b-f-second-obs"
      }
    },
    {
      "condition": {
        "ref": "F-b-f-touch-cond"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "F-b-f-touch-obs"
      }
    },
    {
      "condition": {
        "ref": "F-b-f-stack-cond"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "F-b-f-stack-obs"
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
    "ref": "F-o-observation"
  },
  "stimulus": {
    "ref": "F-o-stimulus"
  },
  "expected": {
    "ref": "F-o-expected"
  },
  "falsifier": {
    "ref": "F-o-falsifier"
  }
}
```

### Architectural tests (Shared design)

```json
{
  "obligations": [
    {
      "id": "AT-hook-ssot",
      "obligation": {
        "ref": "F-at-hook-ssot"
      },
      "oracle": "tests/acceptance/shell-hooks.spec.ts",
      "verification_index": 0
    },
    {
      "id": "AT-pure-rule",
      "obligation": {
        "ref": "F-at-pure-rule"
      },
      "oracle": "tests/unit/swipe-outcome.test.ts",
      "verification_index": 2
    }
  ],
  "applicability": "applicable"
}
```

### Contract tests (Shared design)

```json
{
  "reason": {
    "ref": "F-ct-na"
  },
  "applicability": "not_applicable"
}
```

### Prefactoring (Shared design)

```json
{
  "reason": {
    "ref": "F-pf-na"
  },
  "applicability": "not_applicable"
}
```

### Agreement analysis (Shared design)

| Id | Contract | Role | Locator | Decision | Reason |
|---|---|---|---|---|---|
| P-mvr-cell | the sent row's MVR and USD cell hooks | producer | `src/ui/statement.ts:272` | MIGRATED | F-a-p-mvr-cell |
| P-foot-figure | the sent footer's figure readings | producer | `src/ui/statement.ts:378` | MIGRATED | F-a-p-foot-figure |
| P-signs | the balance card's figure signs | producer | `src/ui/statement.ts:76` | MIGRATED | F-a-p-signs |
| P-entries-area | the Entries pane's scrolling box | producer | `src/ui/home.ts:465` | MIGRATED | F-a-p-entries-area |
| P-views-shell | the shown view and its current tab | producer | `src/ui/views.ts:137` | UNCHANGED_COMPATIBLE | F-a-p-views-shell |
| C-columns-placeholder | the sent row's MVR and USD cell hooks | consumer | `tests/acceptance/statement-sent-columns.spec.ts:781` | MIGRATED | F-a-columns-placeholder |
| C-columns-usd | the sent row's MVR and USD cell hooks | consumer | `tests/acceptance/statement-sent-columns.spec.ts:1051` | MIGRATED | F-a-columns-usd |
| C-sent-reading | the sent row's MVR and USD cell hooks | consumer | `tests/acceptance/statement-sent.spec.ts:213` | MIGRATED | F-a-sent-reading |
| C-sent-signs | the balance card's figure signs | consumer | `tests/acceptance/statement-sent.spec.ts:827` | MIGRATED | F-a-sent-signs |
| C-footer-reading | the sent footer's figure readings | consumer | `tests/acceptance/statement-sent-footer.spec.ts:255` | MIGRATED | F-a-footer-reading |
| C-motion-scroller | the Entries pane's scrolling box | consumer | `tests/acceptance/statement-motion.spec.ts:1491` | MIGRATED | F-a-motion-scroller |
| C-ring-clipper | the Entries pane's scrolling box | consumer | `tests/acceptance/motion.spec.ts:510` | UNCHANGED_COMPATIBLE | F-a-ring-clipper |
| C-no-h-scroll | the Entries pane's scrolling box | consumer | `tests/acceptance/layout-and-install.spec.ts:149` | UNCHANGED_COMPATIBLE | F-a-no-h-scroll |
| C-home-minus | the balance card's figure signs | consumer | `tests/acceptance/send-usd.spec.ts:238` | UNCHANGED_COMPATIBLE | F-a-home-minus |
| C-lists-balance | the balance card's figure signs | consumer | `tests/acceptance/statement-lists.spec.ts:965` | UNCHANGED_COMPATIBLE | F-a-lists-balance |

### Reuse analysis (Shared design)

| Symbol | Locator | Decision | Reason |
|---|---|---|---|
| StatementMvrCell | `src/domain/statement.ts:94` | REUSE | F-r-mvr-cell-type |
| SentFootFigure | `src/domain/statement.ts:156` | REUSE | F-r-foot-figure |
| FIGURE_SIGNS | `src/ui/statement.ts:76` | EXTEND | F-r-figure-signs |
| NO_RUFIYAA | `src/ui/statement.ts:83` | REPLACE | F-r-no-rufiyaa |
| renderEntriesArea | `src/ui/home.ts:465` | EXTEND | F-r-entries-area |
| renderViews | `src/ui/views.ts:117` | EXTEND | F-r-views-shell |
| slideViews | `src/ui/motion.ts:1023` | REUSE | F-r-slide-views |
| the switch-or-stay decision, held inside the release handler of the shell | `src/ui/views.ts:153` | CREATE_NEW | F-r-release-inline |
| projects | `tests/playwright.config.ts:17` | EXTEND | F-r-playwright-projects |
| observe | `tests/support/oracle-observation.mjs:39` | REUSE | F-r-oracle-vector-reuse |
| defineConfig | `vite.config.ts:5` | CREATE_NEW | F-r-vite-config |

### Impact closure (Shared design)

```json
{
  "items": [
    {
      "kind": "public_interface",
      "locator": "src/ui/statement.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "F-ic-statement"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/ui/views.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "F-ic-views"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/ui/home.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "F-ic-home"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/ui/swipe.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "F-ic-swipe"
      }
    },
    {
      "kind": "runtime",
      "locator": "src/ui/theme.css",
      "decision": "CHANGED",
      "reason": {
        "ref": "F-ic-theme"
      }
    },
    {
      "kind": "discovery",
      "locator": "tests/playwright.config.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "F-ic-playwright"
      }
    },
    {
      "kind": "discovery",
      "locator": "vitest.config.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "F-ic-vitest"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:781",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F-a-columns-placeholder"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:1051",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F-a-columns-usd"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:213",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F-a-sent-reading"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:827",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F-a-sent-signs"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-footer.spec.ts:255",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F-a-footer-reading"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-motion.spec.ts:1491",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F-a-motion-scroller"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/motion.spec.ts:510",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "F-a-ring-clipper"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/layout-and-install.spec.ts:149",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "F-a-no-h-scroll"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/send-usd.spec.ts:238",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "F-a-home-minus"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:965",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "F-a-lists-balance"
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
    "ref": "F-adr-context"
  },
  "decision": {
    "ref": "F-adr-decision"
  },
  "alternatives": [
    {
      "ref": "F-adr-alt-keep-usd"
    },
    {
      "ref": "F-adr-alt-inline-rule"
    },
    {
      "ref": "F-adr-alt-one-project"
    },
    {
      "ref": "F-adr-alt-vite-test"
    },
    {
      "ref": "F-adr-alt-testignore"
    }
  ],
  "consequences": [
    {
      "ref": "F-adr-con-specs"
    },
    {
      "ref": "F-adr-con-two-runners"
    },
    {
      "ref": "F-adr-con-unproven"
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
              "id": "O-converted",
              "description": {
                "ref": "F-ob-converted"
              },
              "result_type": "string or absent",
              "cannot_distinguish": {
                "ref": "F-ob-converted-cd"
              }
            },
            {
              "id": "O-usd-cell",
              "description": {
                "ref": "F-ob-usd-cell"
              },
              "result_type": "string with a converted saying",
              "cannot_distinguish": {
                "ref": "F-ob-usd-cell-cd"
              }
            },
            {
              "id": "O-placeholder",
              "description": {
                "ref": "F-ob-placeholder"
              },
              "result_type": "non-negative integer",
              "cannot_distinguish": {
                "ref": "F-ob-placeholder-cd"
              }
            },
            {
              "id": "O-foot-converted",
              "description": {
                "ref": "F-ob-foot-converted"
              },
              "result_type": "string with a mark",
              "cannot_distinguish": {
                "ref": "F-ob-foot-converted-cd"
              }
            },
            {
              "id": "O-entries-scroller",
              "description": {
                "ref": "F-ob-entries-scroller"
              },
              "result_type": "two booleans",
              "cannot_distinguish": {
                "ref": "F-ob-entries-scroller-cd"
              }
            },
            {
              "id": "O-shown",
              "description": {
                "ref": "F-ob-shown"
              },
              "result_type": "two view names",
              "cannot_distinguish": {
                "ref": "F-ob-shown-cd"
              }
            },
            {
              "id": "O-swipe-at",
              "description": {
                "ref": "F-ob-swipe-at"
              },
              "result_type": "number",
              "cannot_distinguish": {
                "ref": "F-ob-swipe-at-cd"
              }
            },
            {
              "id": "O-swipe-outcome",
              "description": {
                "ref": "F-ob-swipe-outcome"
              },
              "result_type": "0 or 1",
              "cannot_distinguish": {
                "ref": "F-ob-swipe-outcome-cd"
              }
            }
          ],
          "equality": {
            "under": [
              "O-converted",
              "O-usd-cell",
              "O-placeholder",
              "O-foot-converted",
              "O-entries-scroller",
              "O-shown",
              "O-swipe-at",
              "O-swipe-outcome"
            ],
            "definition": {
              "ref": "F-eq"
            }
          },
          "constructors": [
            {
              "id": "C-render-statement",
              "signature": "renderStatement(ledger: ReadEntriesOutcome): HTMLElement"
            },
            {
              "id": "C-render-views",
              "signature": "renderViews(panes: Panes): HTMLElement"
            },
            {
              "id": "C-render-entries-area",
              "signature": "renderEntriesArea(list: HTMLElement): HTMLElement"
            },
            {
              "id": "C-swipe-release",
              "signature": "type SwipeRelease = { readonly from: ViewIndex; readonly travel: number; readonly speed: number; readonly width: number }"
            },
            {
              "id": "C-swipe-at",
              "signature": "swipeAt(release: SwipeRelease): number"
            },
            {
              "id": "C-swipe-outcome",
              "signature": "swipeOutcome(release: SwipeRelease): ViewIndex"
            }
          ],
          "generators": [
            {
              "id": "G-release",
              "domain": {
                "ref": "F-gen-domain"
              },
              "size_bound": 200,
              "seed_policy": {
                "ref": "F-gen-seed"
              },
              "must_include": [
                {
                  "ref": "F-case-exact-commit"
                },
                {
                  "ref": "F-case-exact-flick"
                },
                {
                  "ref": "F-case-past-end"
                },
                {
                  "ref": "F-case-zero-width"
                }
              ],
              "depth_bound": null
            }
          ],
          "laws": [
            {
              "id": "L-swipe-total",
              "statement": {
                "ref": "F-law-swipe-total"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "CREATE_NEW:src/ui/swipe.ts::swipeOutcome",
              "uses": [
                "C-swipe-outcome",
                "C-swipe-at",
                "C-swipe-release",
                "O-swipe-outcome",
                "O-swipe-at"
              ],
              "treatment": {
                "generator": "G-release",
                "independent_observation": {
                  "ref": "F-law-swipe-total-io"
                },
                "falsifier": {
                  "description": {
                    "ref": "F-law-swipe-total-fals"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-swipe-flick",
              "statement": {
                "ref": "F-law-swipe-flick"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "CREATE_NEW:src/ui/swipe.ts::swipeOutcome",
              "uses": [
                "C-swipe-outcome",
                "C-swipe-release",
                "O-swipe-outcome"
              ],
              "treatment": {
                "generator": "G-release",
                "independent_observation": {
                  "ref": "F-law-swipe-flick-io"
                },
                "falsifier": {
                  "description": {
                    "ref": "F-law-swipe-flick-fals"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-swipe-commit",
              "statement": {
                "ref": "F-law-swipe-commit"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "CREATE_NEW:src/ui/swipe.ts::swipeOutcome",
              "uses": [
                "C-swipe-outcome",
                "C-swipe-at",
                "C-swipe-release",
                "O-swipe-outcome",
                "O-swipe-at"
              ],
              "treatment": {
                "generator": "G-release",
                "independent_observation": {
                  "ref": "F-law-swipe-commit-io"
                },
                "falsifier": {
                  "description": {
                    "ref": "F-law-swipe-commit-fals"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-swipe-through-at",
              "statement": {
                "ref": "F-law-swipe-through-at"
              },
              "kind": "metamorphic",
              "layer": "domain",
              "owner": "CREATE_NEW:src/ui/swipe.ts::swipeOutcome",
              "uses": [
                "C-swipe-outcome",
                "C-swipe-at",
                "C-swipe-release",
                "O-swipe-outcome",
                "O-swipe-at"
              ],
              "treatment": {
                "generator": "G-release",
                "independent_observation": {
                  "ref": "F-law-swipe-through-at-io"
                },
                "falsifier": {
                  "description": {
                    "ref": "F-law-swipe-through-at-fals"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-swipe-degenerate",
              "statement": {
                "ref": "F-law-swipe-degenerate"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "CREATE_NEW:src/ui/swipe.ts::swipeAt",
              "uses": [
                "C-swipe-at",
                "C-swipe-outcome",
                "C-swipe-release",
                "O-swipe-at"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "F-case-zero-width"
                  },
                  {
                    "ref": "F-case-negative-width"
                  }
                ],
                "reason": {
                  "ref": "F-law-swipe-degenerate-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-hook-converted",
              "statement": {
                "ref": "F-law-hook-converted"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::renderMvrCell",
              "uses": [
                "C-render-statement",
                "O-converted",
                "O-usd-cell"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "F-case-mvr-send"
                  },
                  {
                    "ref": "F-case-usd-send"
                  },
                  {
                    "ref": "F-case-both-sends"
                  }
                ],
                "reason": {
                  "ref": "F-law-hook-converted-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-no-placeholder",
              "statement": {
                "ref": "F-law-no-placeholder"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::renderMvrCell",
              "uses": [
                "C-render-statement",
                "O-placeholder"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "F-case-both-sends"
                  }
                ],
                "reason": {
                  "ref": "F-law-no-placeholder-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-foot-arrow",
              "statement": {
                "ref": "F-law-foot-arrow"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::renderFootFigure",
              "uses": [
                "C-render-statement",
                "O-foot-converted"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "F-case-two-mvr-sends"
                  },
                  {
                    "ref": "F-case-both-sends"
                  }
                ],
                "reason": {
                  "ref": "F-law-foot-arrow-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-entries-scroller",
              "statement": {
                "ref": "F-law-entries-scroller"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/home.ts::renderEntriesArea",
              "uses": [
                "C-render-entries-area",
                "O-entries-scroller"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "F-case-long-list"
                  },
                  {
                    "ref": "F-case-short-list"
                  }
                ],
                "reason": {
                  "ref": "F-law-entries-scroller-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-shown-agrees",
              "statement": {
                "ref": "F-law-shown-agrees"
              },
              "kind": "invariant",
              "layer": "application",
              "owner": "src/ui/views.ts::renderViews",
              "uses": [
                "C-render-views",
                "C-swipe-outcome",
                "O-shown"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "F-case-tap"
                  },
                  {
                    "ref": "F-case-release-switch"
                  },
                  {
                    "ref": "F-case-release-stay"
                  }
                ],
                "reason": {
                  "ref": "F-law-shown-agrees-reason"
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
              "id": "R-track-touch-action",
              "statement": {
                "ref": "F-ref-touch-action"
              },
              "cause": "boundary",
              "counterexample": {
                "ref": "F-ref-touch-action-cx"
              },
              "run": null
            },
            {
              "id": "R-dash-absence",
              "statement": {
                "ref": "F-ref-dash"
              },
              "cause": "carrier",
              "counterexample": {
                "ref": "F-ref-dash-cx"
              },
              "run": null
            },
            {
              "id": "R-usd-cell-converted",
              "statement": {
                "ref": "F-ref-usd-cell"
              },
              "cause": "law_scope",
              "counterexample": {
                "ref": "F-ref-usd-cell-cx"
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
              "id": "X-view-index",
              "proposition": {
                "ref": "F-x-view-index"
              },
              "harm": {
                "ref": "F-x-view-index-harm"
              },
              "owner": "CREATE_NEW:src/ui/swipe.ts::ViewIndex",
              "admitted_input": {
                "ref": "F-x-view-index-in"
              },
              "constructor": "CREATE_NEW:src/ui/swipe.ts::swipeOutcome",
              "consumer": "src/ui/views.ts:117",
              "public_observation": {
                "ref": "F-x-view-index-obs"
              },
              "bypass": [
                {
                  "ref": "F-x-view-index-bypass1"
                },
                {
                  "ref": "F-x-view-index-bypass2"
                }
              ],
              "strength": "gradual_checker"
            },
            {
              "id": "X-figure-signs",
              "proposition": {
                "ref": "F-x-signs"
              },
              "harm": {
                "ref": "F-x-signs-harm"
              },
              "owner": "src/ui/statement.ts::FIGURE_SIGNS",
              "admitted_input": {
                "ref": "F-x-signs-in"
              },
              "constructor": "src/ui/statement.ts:76",
              "consumer": "src/ui/statement.ts:272",
              "public_observation": {
                "ref": "F-x-signs-obs"
              },
              "bypass": [
                {
                  "ref": "F-x-signs-bypass"
                }
              ],
              "strength": "gradual_checker"
            },
            {
              "id": "X-mvr-currency",
              "proposition": {
                "ref": "F-x-mvr-currency"
              },
              "harm": {
                "ref": "F-x-mvr-currency-harm"
              },
              "owner": "src/ui/statement.ts::renderMvrCell",
              "admitted_input": {
                "ref": "F-x-mvr-currency-in"
              },
              "constructor": "src/ui/statement.ts:272",
              "consumer": "src/ui/statement.ts:307",
              "public_observation": {
                "ref": "F-x-mvr-currency-obs"
              },
              "bypass": [
                {
                  "ref": "F-x-mvr-currency-bypass"
                }
              ],
              "strength": "gradual_checker"
            }
          ],
          "admitted": [
            {
              "ref": "F-case-mvr-send"
            },
            {
              "ref": "F-case-usd-send"
            },
            {
              "ref": "F-case-long-list"
            },
            {
              "ref": "F-case-zero-width"
            },
            {
              "ref": "F-case-past-end"
            }
          ],
          "excluded": [
            {
              "ref": "F-x-view-index"
            },
            {
              "ref": "F-x-signs"
            },
            {
              "ref": "F-x-mvr-currency"
            },
            {
              "ref": "F-law-no-placeholder"
            }
          ],
          "unknown": [
            {
              "state": {
                "ref": "F-d-states"
              },
              "risk_owner": {
                "ref": "F-c-phone-stop"
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
          "ref": "F-model-na"
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
                "ref": "F-cl-hooks"
              },
              "safety": {
                "statement": {
                  "ref": "F-cl-hooks-safety"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "F-cl-hooks-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-cl-hooks-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-hook-converted",
                  "L-no-placeholder",
                  "L-foot-arrow"
                ],
                "basis": {
                  "claims": [
                    "X-mvr-currency",
                    "X-figure-signs"
                  ],
                  "tag": "constructed"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "F-cl-hooks-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "F-cl-hooks-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-cl-hooks-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-hook-converted"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "F-case-mvr-send"
                  },
                  "producer": "src/ui/statement.ts::renderMvrCell",
                  "consumer": "tests/acceptance/shell-hooks.spec.ts",
                  "public_observation": {
                    "ref": "F-ob-converted"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "F-cl-hooks-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "F-cl-hooks-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-c-viewport"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-hook-converted",
                  "L-foot-arrow"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "F-case-both-sends"
                  },
                  "producer": "src/ui/statement.ts::renderStatement",
                  "consumer": "tests/acceptance/shell-hooks.spec.ts",
                  "public_observation": {
                    "ref": "F-o-observation"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "reason": {
                  "ref": "F-cl-hooks-liveness"
                },
                "tag": "not_applicable"
              }
            },
            {
              "subject": {
                "ref": "F-cl-swipe"
              },
              "safety": {
                "statement": {
                  "ref": "F-cl-swipe-safety"
                },
                "design": "BLOCKED",
                "design_note": {
                  "ref": "F-cl-swipe-safety-blocked"
                },
                "runtime": "INDETERMINATE",
                "runtime_note": {
                  "ref": "F-cl-swipe-safety-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-cl-swipe-assume"
                  },
                  {
                    "ref": "F-d-waiver"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-swipe-total",
                  "L-swipe-degenerate"
                ],
                "basis": {
                  "argument": [
                    {
                      "ref": "F-x-view-index"
                    },
                    {
                      "ref": "F-law-swipe-total"
                    }
                  ],
                  "tag": "argued"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "F-cl-swipe-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "F-cl-swipe-safety-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-cl-swipe-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-swipe-commit",
                  "L-swipe-flick"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "F-x-view-index-in"
                  },
                  "producer": "CREATE_NEW:src/ui/swipe.ts::swipeOutcome",
                  "consumer": "src/ui/views.ts:117",
                  "public_observation": {
                    "ref": "F-x-view-index-obs"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "F-cl-swipe-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "F-cl-swipe-safety-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-d-touch-project"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-shown-agrees"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "F-case-release-switch"
                  },
                  "producer": "src/ui/views.ts::renderViews",
                  "consumer": "tests/unit/swipe-outcome.test.ts",
                  "public_observation": {
                    "ref": "F-ob-shown"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "statement": {
                  "ref": "F-cl-swipe-live"
                },
                "design": "BLOCKED",
                "design_note": {
                  "ref": "F-cl-swipe-live-blocked"
                },
                "runtime": "INDETERMINATE",
                "runtime_note": {
                  "ref": "F-cl-swipe-safety-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-cl-swipe-live-assume"
                  },
                  {
                    "ref": "F-d-waiver"
                  }
                ],
                "runs": [],
                "laws": [],
                "basis": {
                  "argument": [
                    {
                      "ref": "F-b-f-pointer-obs"
                    },
                    {
                      "ref": "F-d-stress-second-finger"
                    }
                  ],
                  "tag": "argued"
                },
                "tag": "claim"
              }
            },
            {
              "subject": {
                "ref": "F-cl-entries"
              },
              "safety": {
                "statement": {
                  "ref": "F-cl-entries-safety"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "F-cl-entries-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-cl-entries-safety-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-entries-scroller"
                ],
                "basis": {
                  "argument": [
                    {
                      "ref": "F-law-entries-scroller"
                    },
                    {
                      "ref": "F-t-home"
                    }
                  ],
                  "tag": "argued"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "F-cl-entries-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "F-cl-entries-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-cl-entries-safety-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-entries-scroller"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "F-case-long-list"
                  },
                  "producer": "src/ui/home.ts::renderEntriesArea",
                  "consumer": "tests/acceptance/shell-hooks.spec.ts",
                  "public_observation": {
                    "ref": "F-ob-entries-scroller"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "F-cl-entries-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "F-cl-entries-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-c-viewport"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-entries-scroller"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "F-case-long-list"
                  },
                  "producer": "src/ui/home.ts::renderEntriesArea",
                  "consumer": "tests/acceptance/shell-hooks.spec.ts",
                  "public_observation": {
                    "ref": "F-o-observation"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "reason": {
                  "ref": "F-cl-entries-liveness"
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
          "ref": "F-scenarios-na"
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
node tests/support/oracle-observation.mjs tests/acceptance/shell-hooks.spec.ts
```

Verification command:

```sh
npm run build
```

Verification command:

```sh
npm run test:unit
```

Verification command:

```sh
npm run test:acceptance
```

## Value 3

### Facts (Value 3)

- V3-purpose: The Statement's balance card reads no sign before the Paid Back
  figure: the one table of signs gives that figure an empty sign, the minus
  constant it named is removed, and none of the card's three rows reads a mark
  between its word and its own figure.
- V3-c-three-names: The card has exactly three figures, named sent, paid and
  balance, and each takes its sign from the one table. The authority states no
  bound on the amounts themselves, because this value reads no money and stores
  and validates nothing; the figures keep the texts and the cents the domain
  already computes.
- V3-c-no-replacement-mark: Nothing stands in the minus's place: the Paid Back
  row reads its word and its figure and nothing between them. No other mark,
  word or bracket is introduced, and the unsigned reading of the Balance figure
  and of the Home box stays exactly as it is.
- V3-t-statement: The Statement screen is the one file this value changes: the
  paid entry of its table of signs becomes the empty string, the minus constant
  that entry named is removed because nothing else reads it, and the two notes
  that describe the card as reading a minus are amended to match.
- V3-d-signs-owner: The one table of signs in src/ui/statement.ts stays the
  single owner of what stands before a balance-card figure. Its paid entry
  becomes the empty string and the minus constant is removed with it, because
  the table was its only reader. The card renderer keeps reading the sign only
  from that table, so one entry decides the reading of one row and no row
  decides a sign of its own.
- V3-d-paradigm-owners: The paradigm is functional and the decision keeps a
  cohesive owner that holds its data: the sign of a figure is a value in one
  readonly record over the closed union of the three figure names, and the card
  renderer is a function from the three named figures to the card. No class is
  added, no sign is decided inside the renderer or in a handler, and the domain
  keeps the three named figures it already owns.
- V3-d-algebra-domain: Domain layer of this value. States: a balance-card
  figure, named sent, paid or balance, with its cents and its text. Operations:
  the naming of the three figures from the stored rows. Observations: the name
  of a figure and the text it reads. Law a test can check: the three named
  figures and their texts are the same before and after this value, because no
  arithmetic and no wording of the domain changes.
- V3-d-algebra-application: Application and port layer of this value. States:
  the three named figures handed to the card for one seeded ledger. Operations:
  the card build, which pairs each figure with its word and its sign.
  Observations: the three rows in order with the words they read and the line
  above the Balance row. Law a test can check: the card still reads Total Sent,
  Paid Back and Balance in that order, with its line standing above the Balance
  row.
- V3-d-algebra-adapter: Adapter layer of this value, the DOM a reader finds.
  States: the mounted Statement screen of a seeded ledger. Operations: the card
  renderer and the cell it draws between a word and a figure. Observations:
  whatever stands between each row's word and that row's own figure, read whole
  rather than as one named cell. Laws a test can check: each of the three rows
  reads nothing in that span; no element of the mounted page reads a minus in
  that span; and the three figures keep the texts the stored cents add up to.
- V3-d-algebra-infrastructure: Infrastructure and recovery layer of this value.
  States: the local stack up or down and the seeded account present or absent.
  Operations: the acceptance vector's own install of the pinned dependencies and
  the reset each spec makes. Observations: the one observation line, with what
  was observed, what failed on an assertion and what failed before any
  assertion. Law a test can check: a run that never reached the card reports a
  setup failure and no assertion failure, so a broken environment is never read
  as a red card.
- V3-d-carriers: The typed carriers of this value and their owners. Decision:
  FIGURE_SIGNS, a readonly record from the closed union of the three figure
  names to the sign string, in src/ui/statement.ts; it is the only decision this
  value changes. Effect: the DOM write of the card renderer in the same module.
  Errors: none is raised, and a figure name outside the union cannot be written
  into the record. Per-process state: none; the card is drawn in one pass from
  the figures it is given.
- V3-d-checkers: Claim to checker for this value. No state model is selected:
  the card has no transition, no concurrency, no queue and no waiting party, so
  neither Quint nor TLC has a behaviour to explore here. The one claim a checker
  could carry is that the table of signs is total and canonical over the closed
  union of the three figure names, which was selected for Agda as a local
  totality proof.
- V3-d-waiver: Agda is not installed on this host, where only a Java runtime is.
  The owner's standing waiver of the formal checkers for this read-only screen
  work is the recorded authority for continuing without that proof. The totality
  claim of the table of signs therefore stays INDETERMINATE and its DESIGN axis
  stays BLOCKED; it is carried instead by the build's type checker, which
  rejects an unknown or missing figure name only on annotated paths, and by the
  card reading of this value's oracle. No native test, enumeration or argument
  is offered as that proof.
- V3-d-closure: Constructive closure of this value. The card reading: safety
  PASS by construction, because a sign can only come from the one readonly
  record over the closed union of three names and that record now gives none;
  inhabitation PASS; public reachability PASS; liveness not applicable, the card
  being one synchronous render. The table's totality: safety BLOCKED and its
  proof INDETERMINATE under the waiver. Runtime everywhere: not yet observed,
  because the committed source still draws the minus and the change arrives with
  the prototype at craft.
- V3-d-stress-second-writer: Stressor, negating the assumption that the card
  renderer is the only writer of what stands before a figure: another part of
  the page adds a mark of its own inside the Paid Back row. Preserved
  observation: the reading takes the whole span between the word and the figure,
  so a mark drawn anywhere in it is read. Allowed degradation: none. Forbidden
  outcome: a mark drawn outside the one table and read as the card's own sign.
  Residue: the observation is a span and not a named cell, so a second writer is
  caught by the same reading.
- V3-d-stress-empty-ledger: Stressor, negating the assumption that a repayment
  exists: the ledger holds no repayment, or holds nothing at all. Preserved
  observation: the Paid Back row is still drawn and still reads no mark before
  its figure. Allowed degradation: the figure reads a total of zero dollars.
  Forbidden outcome: a row missing from the card, or a mark appearing because
  the figure is zero. Residue: the sign comes from the name of a figure and
  never from its amount, so the ledger with no repayment is one of the oracle's
  own cases.
- V3-d-stress-cast-name: Stressor, negating the assumption that a figure name
  comes from the closed union: a name shaped at the boundary or cast from stored
  data reaches the table. Preserved observation: the renderer reads the sign
  only from the table. Allowed degradation: the span before the figure then
  reads nothing at all. Forbidden outcome: a mark chosen by chance, or a render
  that stops. Residue: the record is readonly over the union and a name it does
  not hold reads as nothing; the build's type checker rejects such a cast only
  on annotated paths, and that obligation stays with the Statement module's
  owner.
- V3-d-stress-drawn-mark: Stressor, negating the assumption that an empty cell
  draws nothing: the sign cell keeps a style that draws a mark of its own, as a
  border or as generated content. Preserved observation: the text reading of the
  span stays empty, which is all this value claims. Allowed degradation: a mark
  that carries no text is invisible to every spec of this batch. Forbidden
  outcome: none that a reading of the page can state. Residue: a drawn mark
  belongs to the owner's phone check, and the cell keeps its place in the card's
  grid with nothing in it.
- V3-d-spof: The single point of failure of this value is the one table of
  signs: a later writer that draws its own mark inside a card row, or a style
  that draws a mark no text reading can see, puts a sign back. The obligation to
  keep every mark of the card coming from that table stays with the Statement
  module's owner, and a mark that carries no text stays with the owner's phone
  check. The acceptance observation rests on one local stack and one seeded
  account; when either is absent nothing of the card is observed and the vector
  reports a setup failure.
- V3-d-bypasses: What this value cannot stop. A figure name cast from stored
  data can reach the table outside its union, and the checker that runs in the
  build rejects that only on annotated paths. The DOM is a public writable
  surface, so anything on the page can add an element inside a card row; the
  claim is therefore checked by a reading of the mounted page and never only by
  a type. A process that stops the stack, and a browser that refuses to serve
  the bundle, end the observation rather than falsify the card, and the vector
  keeps them apart from a failed assertion.
- V3-d-second-walk: A second set of stressors, not used to derive this design,
  walked against it. A ledger whose repayments are larger than its sends: the
  three figures are unsigned readings and the table gives no mark, so the card
  reads three sums under their own words and the oracle states that reading
  rather than leaving it open. A reading taken while the two lists are sliding:
  the card stands outside the moving part and each row is read whole, so the
  spans read the same during a slide as at rest. A page read aloud: an empty
  span contributes nothing to a row's spoken reading, so each row still reads
  its word and its figure.
- V3-d-states: Admitted, excluded and unknown states of this value. Admitted: a
  seeded ledger with two sends and one repayment; a ledger with sends and no
  repayment, whose Paid Back figure reads zero; a ledger holding nothing at all.
  Excluded: a balance-card figure drawn with a mark the one table does not give
  it, and a table entry for a name outside the three. Unknown, with the owner's
  phone check as the risk owner: whether the row reads well on the phone with
  that cell empty, since the cell keeps its place in the card's grid.
- V3-d-self-falsification: One law this value refutes rather than keeps: a minus
  before the Paid Back figure tells the owner that this money came back against
  what went out. The card reads three sums under their own words, so the mark
  reads instead as a figure made negative. The cure is in the carrier, the one
  table of signs, whose paid entry becomes empty; no guard and no second rule is
  added over an unchanged table.
- V3-d-substrate: The test substrate of this value. The driving port is the
  built bundle served over a loopback origin and read by the pinned Playwright
  at 360 by 780, through the existing supports: the stack helper that brings the
  local Supabase up and resets it, and the accounts helper that seeds and signs
  in an invented account. The acceptance vector is node
  tests/support/oracle-observation.mjs with this value's spec, which installs
  the pinned dependencies itself when they are absent and prints the one
  observation line. The gates of this value are the build and one serialised
  acceptance run; no unit substrate is needed, because this value adds no
  module.
- V3-d-pbt: No broad generated domain belongs to this value. The sign of a
  figure is a function of a closed union of three names and the card draws
  exactly three rows, so the whole ground of the law is three spans read over a
  few seeded ledgers, stated as cases rather than generated. A generator would
  add examples of the same three names and could reach no new case.
- V3-d-arch-check: The architectural law of this value is an owner law over the
  whole card, not a style: the one table of signs is the single owner of every
  mark that stands before a balance-card figure. The reading therefore covers
  all three rows rather than the Paid Back row alone, and reads the span between
  each word and its own figure whole rather than one named cell, so a mark drawn
  by any other writer in that span falsifies the law.
- V3-d-migration: The earlier reading that expects a minus is migrated in this
  value: the case that reads the card's three spans expects three empty
  readings, and the minus constant of that spec has no remaining reader. How
  that reading finds the card, from the figures it holds, and how it reads the
  span before each figure, are unchanged.
- V3-d-oracle-own-spec: The oracle of this value is a spec of its own, so the
  card's spans are observed apart from the sent-row reading that another value
  migrates inside the same earlier file, and a red or a green reading of this
  value names the signs alone.
- V3-r-figure-signs: The one table of signs is the single owner of what stands
  before a balance-card figure and already covers the three figure names, so it
  is extended in place: its paid entry becomes the empty string and nothing else
  about it changes.
- V3-r-minus: The minus constant has exactly one reader, the paid entry of the
  table of signs, so it is replaced by the empty string there and the constant
  with its note is removed; keeping it would leave a named mark that nothing
  draws.
- V3-r-render-card: The card renderer already reads the sign only from the table
  and pairs it with the word and the figure of each row, so it is reused as it
  is; only the note at its head, which describes the Paid Back row as reading a
  minus, is amended.
- V3-r-figure-name: The closed union of the three figure names is the domain's
  own and nothing of the stored money changes, so it is reused exactly as it is
  and remains the index of the table of signs.
- V3-r-card-reading: The reading that finds the card from the figures it holds
  and reads the whole span between each word and its figure lives inside the
  earlier spec and is local to it, so this value's oracle carries a reading of
  its own built on the same two ideas rather than importing a helper across
  specs.
- V3-ic-statement: The Statement screen is changed: the paid entry of the table
  of signs, the removed minus constant and the two notes that described the card
  as reading a minus.
- V3-adr-na: No architectural fork is decided in this value. The owner decided
  that the card reads no sign, the sign stays owned by the one table that
  already owns it, and the four contracts this batch shares are recorded once in
  the shared decision.
- V3-at-sign-ssot: Over the whole mounted page the one table of signs is the
  single owner of every mark before a balance-card figure: all three rows of the
  card are read, each span between a word and its own figure is read whole, and
  no element anywhere else in a card row contributes a mark.
- V3-b-driving: The driving port of this value is the mounted page of the built
  bundle, served over a loopback origin and read as the owner's phone would read
  it: sign in, open the Statement, and read the three rows of the balance card.
- V3-b-direction: Dependencies point inward. The domain names the three figures
  and knows nothing of a sign. The Statement screen owns the table of signs and
  reads the domain. The spec reads only the mounted page, never the table or the
  module.
- V3-b-f-name-cond: A figure name outside the closed union of three reaches the
  table of signs, shaped at a boundary or cast from stored data.
- V3-b-f-name-obs: The span before that figure reads nothing at all, and no mark
  is chosen by chance; the row is still drawn with its word and its figure.
- V3-o-observation: On a phone reading a seeded ledger that holds one send of
  MVR10,000 at the rate 20 stored as $500, one send of $750 and one repayment of
  $300, the Statement's balance card reads Total Sent, Paid Back and Balance,
  and nothing at all stands between any of those three words and its own figure:
  the Paid Back row reads no minus and no mark of any other kind.
- V3-o-stimulus: The bundle is built and served over the loopback origin, the
  owner signs in to the seeded account and opens the Statement, where the
  balance card stands above the two lists; the card is found from the three
  figures it holds and each row is read between its word and its own figure.
- V3-o-expected: The expected readings are computed in the spec from the seeded
  rows alone: three rows read in order with the words Total Sent, Paid Back and
  Balance, the three figures the stored cents add up to, and three empty
  readings for the whole span between each word and its own figure; the same
  three empty readings for a seeded ledger that holds sends and no repayment.
- V3-o-falsifier: The spec fails when any mark at all is read between a card
  word and its own figure on either seeded ledger: a minus before the Paid Back
  figure, a mark before another figure, or a mark added inside a card row by a
  second writer; and it fails when a row or a figure the card read before is
  missing.
- V3-ob-signs: What each of the balance card's three rows reads between its word
  and its own figure, top to bottom, as three readings of a whole span.
- V3-ob-signs-cd: It cannot tell how many cells the span holds, nor whether a
  cell is there at all; it cannot tell the ink, the size, the weight or the
  width of that span; and it cannot see a mark drawn by a style rather than
  written as text.
- V3-ob-figures: The word and the figure text each of the three rows reads, with
  the order of the rows and whether a line is drawn above the Balance row.
- V3-ob-figures-cd: It cannot tell the type the figure is drawn in, nor the gaps
  of the card's grid, nor which stored rows produced the amount beyond what the
  figure itself reads.
- V3-eq: Two renderings of the balance card are the same here when the three
  spans read alike and the three words, figures and the line above the Balance
  row read alike. Every colour, size, weight, case, gap, padding, radius and
  grid track of the card lies outside that set, so two renderings that differ
  only in one of them are equal here and no spec of this value may separate
  them.
- V3-law-no-sign: For every seeded ledger, each of the balance card's three rows
  reads nothing between its word and its own figure: the Paid Back row reads no
  minus, and no other row reads a mark either.
- V3-law-no-sign-reason: The card draws one row per figure and there are exactly
  three figures, so three spans over a ledger with a repayment, a ledger with
  none and an empty ledger are the whole ground of the law; a wider ledger could
  add no fourth row and no new kind of span.
- V3-law-figures-kept: The card still reads Total Sent, Paid Back and Balance in
  that order, each with the figure its stored cents add up to and with the line
  drawn above the Balance row.
- V3-law-figures-kept-reason: The three words and their order are a finite
  reading of one card, so a ledger with a repayment and a ledger without one
  settle that nothing but the span changed in this value.
- V3-law-signs-total: The table of signs answers for each of the three figure
  names and for no other, and the renderer takes the mark of a row only from
  that answer, so every row's span is decided in one place.
- V3-law-signs-total-reason: The index of the table is a closed union of three
  names, so the three names are the whole ground of the law; it is stated as
  cases because there is nothing to generate beyond them.
- V3-case-repayment: A seeded ledger holding one send of MVR10,000 at the rate
  20 stored as $500, one send of $750 and one repayment of $300.
- V3-case-no-repayment: A seeded ledger holding sends only, so the Paid Back
  figure reads a total of zero dollars.
- V3-case-empty-ledger: A seeded ledger holding no entry at all, so all three
  figures read zero dollars.
- V3-case-three-names: The three figure names of the card, sent, paid and
  balance, read as the table's three answers.
- V3-ref-minus: A minus before the Paid Back figure tells the owner that this
  money came back against what went out.
- V3-ref-minus-cx: On the card the three figures are read as three sums, each
  under its own word, so the mark reads as a figure made negative rather than as
  a direction; the owner read the Paid Back row as money taken off twice. The
  carrier is the table of signs, whose paid entry becomes empty, and the words
  of the rows carry the direction instead.
- V3-model-na: No model file is delivered for this value. No state model was
  selected, because the card has no transition and no waiting party; the one
  claim a checker could carry was selected for Agda as a local totality proof,
  and Agda is absent on this host under the owner's standing waiver, so no proof
  is claimed. The algebraic model of this value is delivered as the laws of this
  scope.
- V3-scenarios-na: A scenario of this scope would be read from the trace of an
  executed model run, and no model was executed, because the selected checker is
  absent and waived. The behaviour of this value is stated by its own oracle
  instead.
- V3-cl-signs: The reading of the balance card's three spans: no mark stands
  between a word and its figure, on any row.
- V3-cl-signs-safety: No row of the card can be drawn with a mark the one table
  does not give it, and after this value the table gives none: the renderer
  reads the mark only from a readonly record over the closed union of the three
  figure names.
- V3-cl-signs-inhab: A seeded ledger with one repayment is drawn as a Paid Back
  row whose word and figure stand with nothing between them, which the oracle
  reads on the page.
- V3-cl-signs-reach: That reading is reached through the served page at the
  loopback origin, the one port a phone and a spec both use.
- V3-cl-liveness-na: The card is one synchronous render with no queue, no retry
  and no waiting party, so there is no progress claim to state about it.
- V3-cl-runtime: Not yet observed: the committed source still draws the minus,
  the change arrives with the owner's prototype at craft, and no run of this
  value has been made.
- V3-cl-assume: It rests on the card renderer staying the single writer of what
  stands before a figure, and on every figure name reaching the table from the
  domain's closed union.
- V3-cl-table: The table of signs as a total and canonical answer over the
  closed union of the three figure names.
- V3-cl-table-safety: The table answers for each of the three names and for no
  other, so no figure can be drawn with a mark chosen outside it.
- V3-cl-table-blocked: Unchecked: this totality claim was selected for an Agda
  proof and Agda is not installed on this host. Under the owner's recorded
  waiver the proof stays INDETERMINATE and the claim stays BLOCKED; the build's
  type checker on annotated paths and the card reading of the oracle carry it
  instead.
- V3-cl-table-runtime: Nothing is observed yet: the table still gives the minus
  in the committed source and no checker run and no card reading of this value
  has been made.
- V3-cl-table-inhab: Each of the three names is answered by the table and drawn
  as the span of its own row, so a total answer exists for every name the card
  can hold.
- V3-cl-table-reach: The table's answers are reached publicly as the three spans
  of the card on the served page; the record itself is private to the Statement
  module.
- V3-cl-table-assume: It rests on the index of the table staying the domain's
  closed union of three names, and on the build's type checker running over the
  annotated path that writes the record.

### Targets (Value 3)

| Path | Decision | Reason |
|---|---|---|
| `src/ui/statement.ts` | EXTEND | V3-t-statement |

### Paradigm (Value 3)

functional

### Decisions (Value 3)

V3-d-signs-owner, V3-d-paradigm-owners, V3-d-algebra-domain,
V3-d-algebra-application, V3-d-algebra-adapter, V3-d-algebra-infrastructure,
V3-d-carriers, V3-d-checkers, V3-d-waiver, F-d-waiver, V3-d-closure,
V3-d-stress-second-writer, V3-d-stress-empty-ledger, V3-d-stress-cast-name,
V3-d-stress-drawn-mark, V3-d-spof, V3-d-bypasses, V3-d-second-walk, V3-d-states,
V3-d-self-falsification, V3-d-substrate, V3-d-pbt, V3-d-arch-check,
V3-d-migration, V3-d-oracle-own-spec

### Oracle (Value 3)

tests/acceptance/statement-card-signs.spec.ts

### Acceptance supports (Value 3)

```json
[
  "tests/support/oracle-observation.mjs",
  "tests/support/accounts.ts",
  "tests/support/local-stack.ts"
]
```

### Oracle verification index (Value 3)

```json
0
```

### Purpose (Value 3)

V3-purpose

### Constraints (Value 3)

F-c-no-design-values, F-c-invented-figures, F-c-src-uncommitted,
F-c-prototype-reference, F-c-oracle-vector, F-c-one-playwright-run,
F-c-viewport, F-c-phone-stop, F-c-no-new-dependency, V3-c-three-names,
V3-c-no-replacement-mark

### Inherits (Value 3)

X-figure-signs

### Boundaries (Value 3)

```json
{
  "driving_port": {
    "ref": "V3-b-driving"
  },
  "driven_ports": [
    {
      "ref": "F-b-driven-ledger"
    }
  ],
  "dependency_direction": {
    "ref": "V3-b-direction"
  },
  "failures": [
    {
      "condition": {
        "ref": "V3-b-f-name-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "V3-b-f-name-obs"
      }
    },
    {
      "condition": {
        "ref": "F-b-f-stack-cond"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "F-b-f-stack-obs"
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
    "ref": "V3-o-observation"
  },
  "stimulus": {
    "ref": "V3-o-stimulus"
  },
  "expected": {
    "ref": "V3-o-expected"
  },
  "falsifier": {
    "ref": "V3-o-falsifier"
  }
}
```

### Architectural tests (Value 3)

```json
{
  "obligations": [
    {
      "id": "AT-v3-sign-ssot",
      "obligation": {
        "ref": "V3-at-sign-ssot"
      },
      "oracle": "tests/acceptance/statement-card-signs.spec.ts",
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
    "ref": "F-ct-na"
  },
  "applicability": "not_applicable"
}
```

### Prefactoring (Value 3)

```json
{
  "reason": {
    "ref": "F-pf-na"
  },
  "applicability": "not_applicable"
}
```

### Agreement analysis (Value 3)

| Id | Contract | Role | Locator | Decision | Reason |
|---|---|---|---|---|---|
| V3P-signs | the balance card's figure signs | producer | `src/ui/statement.ts:76` | MIGRATED | F-a-p-signs |
| V3C-sent-signs | the balance card's figure signs | consumer | `tests/acceptance/statement-sent.spec.ts:827` | MIGRATED | F-a-sent-signs |
| V3C-lists-balance | the balance card's figure signs | consumer | `tests/acceptance/statement-lists.spec.ts:965` | UNCHANGED_COMPATIBLE | F-a-lists-balance |
| V3C-home-minus | the balance card's figure signs | consumer | `tests/acceptance/send-usd.spec.ts:238` | UNCHANGED_COMPATIBLE | F-a-home-minus |

### Reuse analysis (Value 3)

| Symbol | Locator | Decision | Reason |
|---|---|---|---|
| FIGURE_SIGNS | `src/ui/statement.ts:76` | EXTEND | V3-r-figure-signs |
| MINUS | `src/ui/statement.ts:66` | REPLACE | V3-r-minus |
| renderCard | `src/ui/statement.ts:208` | REUSE | V3-r-render-card |
| StatementFigureName | `src/domain/statement.ts:209` | REUSE | V3-r-figure-name |
| readBalanceCard | `tests/acceptance/statement-sent.spec.ts:608` | CREATE_NEW | V3-r-card-reading |

### Impact closure (Value 3)

```json
{
  "items": [
    {
      "kind": "public_interface",
      "locator": "src/ui/statement.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "V3-ic-statement"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:827",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F-a-sent-signs"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:965",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "F-a-lists-balance"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/send-usd.spec.ts:238",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "F-a-home-minus"
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
    "ref": "V3-adr-na"
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
              "id": "O-v3-signs",
              "description": {
                "ref": "V3-ob-signs"
              },
              "result_type": "three strings",
              "cannot_distinguish": {
                "ref": "V3-ob-signs-cd"
              }
            },
            {
              "id": "O-v3-figures",
              "description": {
                "ref": "V3-ob-figures"
              },
              "result_type": "three words with three figure texts and one boolean",
              "cannot_distinguish": {
                "ref": "V3-ob-figures-cd"
              }
            }
          ],
          "equality": {
            "under": [
              "O-v3-signs",
              "O-v3-figures"
            ],
            "definition": {
              "ref": "V3-eq"
            }
          },
          "constructors": [
            {
              "id": "C-v3-card",
              "signature": "renderCard(figures: readonly StatementFigure[]): HTMLElement"
            },
            {
              "id": "C-v3-signs",
              "signature": "const FIGURE_SIGNS: Readonly<Record<StatementFigureName, string>>"
            }
          ],
          "generators": [],
          "laws": [
            {
              "id": "L-v3-no-sign",
              "statement": {
                "ref": "V3-law-no-sign"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::FIGURE_SIGNS",
              "uses": [
                "C-v3-signs",
                "C-v3-card",
                "O-v3-signs"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V3-case-repayment"
                  },
                  {
                    "ref": "V3-case-no-repayment"
                  },
                  {
                    "ref": "V3-case-empty-ledger"
                  }
                ],
                "reason": {
                  "ref": "V3-law-no-sign-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-v3-figures-kept",
              "statement": {
                "ref": "V3-law-figures-kept"
              },
              "kind": "invariant",
              "layer": "application",
              "owner": "src/ui/statement.ts::renderCard",
              "uses": [
                "C-v3-card",
                "O-v3-figures"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V3-case-repayment"
                  },
                  {
                    "ref": "V3-case-no-repayment"
                  }
                ],
                "reason": {
                  "ref": "V3-law-figures-kept-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-v3-signs-total",
              "statement": {
                "ref": "V3-law-signs-total"
              },
              "kind": "invariant",
              "layer": "domain",
              "owner": "src/ui/statement.ts::FIGURE_SIGNS",
              "uses": [
                "C-v3-signs",
                "C-v3-card",
                "O-v3-signs"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V3-case-three-names"
                  }
                ],
                "reason": {
                  "ref": "V3-law-signs-total-reason"
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
              "id": "R-v3-paid-minus",
              "statement": {
                "ref": "V3-ref-minus"
              },
              "cause": "carrier",
              "counterexample": {
                "ref": "V3-ref-minus-cx"
              },
              "run": null
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
          "ref": "V3-model-na"
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
                "ref": "V3-cl-signs"
              },
              "safety": {
                "statement": {
                  "ref": "V3-cl-signs-safety"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V3-cl-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V3-cl-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-v3-no-sign",
                  "L-v3-signs-total"
                ],
                "basis": {
                  "claims": [
                    "X-figure-signs"
                  ],
                  "tag": "constructed"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "V3-cl-signs-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V3-cl-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V3-cl-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-v3-figures-kept"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "V3-case-repayment"
                  },
                  "producer": "src/ui/statement.ts::renderCard",
                  "consumer": "tests/acceptance/statement-card-signs.spec.ts",
                  "public_observation": {
                    "ref": "V3-o-observation"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "V3-cl-signs-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V3-cl-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-c-viewport"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-v3-no-sign"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "V3-case-repayment"
                  },
                  "producer": "src/ui/statement.ts::renderStatement",
                  "consumer": "tests/acceptance/statement-card-signs.spec.ts",
                  "public_observation": {
                    "ref": "V3-o-expected"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "reason": {
                  "ref": "V3-cl-liveness-na"
                },
                "tag": "not_applicable"
              }
            },
            {
              "subject": {
                "ref": "V3-cl-table"
              },
              "safety": {
                "statement": {
                  "ref": "V3-cl-table-safety"
                },
                "design": "BLOCKED",
                "design_note": {
                  "ref": "V3-cl-table-blocked"
                },
                "runtime": "INDETERMINATE",
                "runtime_note": {
                  "ref": "V3-cl-table-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V3-cl-table-assume"
                  },
                  {
                    "ref": "V3-d-waiver"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-v3-signs-total"
                ],
                "basis": {
                  "argument": [
                    {
                      "ref": "V3-d-checkers"
                    },
                    {
                      "ref": "V3-law-signs-total"
                    }
                  ],
                  "tag": "argued"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "V3-cl-table-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V3-cl-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V3-cl-table-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-v3-signs-total"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "V3-case-three-names"
                  },
                  "producer": "src/ui/statement.ts::FIGURE_SIGNS",
                  "consumer": "src/ui/statement.ts::renderCard",
                  "public_observation": {
                    "ref": "V3-ob-signs"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "V3-cl-table-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V3-cl-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-c-viewport"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-v3-no-sign"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "V3-case-no-repayment"
                  },
                  "producer": "src/ui/statement.ts::renderCard",
                  "consumer": "tests/acceptance/statement-card-signs.spec.ts",
                  "public_observation": {
                    "ref": "V3-at-sign-ssot"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "reason": {
                  "ref": "V3-cl-liveness-na"
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
          "ref": "V3-scenarios-na"
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
node tests/support/oracle-observation.mjs tests/acceptance/statement-card-signs.spec.ts
```

Verification command:

```sh
npm run build
```

Verification command:

```sh
npm run test:acceptance
```

## Value 4

### Facts (Value 4)

- V4-purpose: Offer each view of the bottom bar as a drawing above its word,
  keep the pill around the drawing of the view being read, and dim only that
  drawing and that word under a thumb, while the only state the bar asserts
  stays the one tab marked as the current view.
- V4-c-asserted-set: This value asserts three readings of the bar and nothing
  else: every tab holds exactly one drawing that is hidden from a reading of the
  page; every tab is named by its own word alone; and exactly one tab is marked
  as the current view, naming the view the shell says is shown. The drawing
  standing above the word is asserted as a layout relation, worded without any
  measure.
- V4-c-pill-design: The place of the pill around the drawing, the size and ink
  of the drawing, and how far a press dims the drawing and the word are approved
  design values of this batch. No spec reads them, and the owner's phone is the
  only check on them.
- V4-c-no-bounds: This value stores and validates nothing. Its whole input is
  the closed set of the two views the bar offers, so the authority states no
  numeric bound for it and this design states none, neither narrower nor wider.
- V4-t-views: The shell is extended: a tab is built as a drawing slot and its
  word, the drawings are held in one table keyed by the same closed view union,
  and the one switch that writes which tab is current is reused as it stands.
- V4-t-theme: The stylesheet is extended with the bar's own design values of
  this value: the slot the drawing stands in above the word, the place of the
  pill around that slot, and the dim under a press. The acceptance reading of
  the drawing above the word is made on the built bundle, so this file is a
  target of this value and not of another one alone.
- V4-r-rendertab: The one builder of a tab already owns the tab's element, its
  view mark and its word. It is extended to put the drawing slot before the
  word, so the bar keeps one builder for a tab and no second place decides what
  a tab holds.
- V4-r-view-names: The table of what each view is called is already the single
  owner of a view's word, and the pane reads it too. It is reused exactly as it
  is, so the drawing table is keyed by the same closed union and a view cannot
  be offered without a word.
- V4-r-icon-table: No symbol holds a drawing for a view today, and the owner's
  fork keeps the drawings inline in the shell. A new table in that module maps
  each view of the closed union to the shapes of its drawing, with the shape
  name taken from the closed set of shapes the builder can draw.
- V4-r-renderpill: The builder of the pill and its holder is unchanged: the
  holder is still the one hidden child of the bar and still travels by one half
  of it. Where the pill lies inside that holder is a design value of the
  stylesheet, so no code of the pill changes.
- V4-r-show: The shell's own switch is already the single writer of which view
  is shown and of both current-tab marks, written together in one step. The
  drawing changes nothing about that state, so the switch is reused and this
  value opens no second way to mark a tab.
- V4-r-views-enum: The closed list of the two views, in the order the bar offers
  them, is already the one owner of that order. It is reused, so a reading that
  walks every tab of the bar walks exactly the views this list holds.
- V4-r-theme-tab: The tab's own rule already lays the tab out inside its half of
  the bar and carries the current-tab ink. It is extended with the slot above
  the word and the dim under a press, so the bar keeps one rule for a tab.
- V4-r-theme-pill-holder: The pill holder's rule already fixes the holder to one
  half of the bar. It is extended so the pill rests around the drawing instead
  of the middle of the bar, which keeps the pill's travel of one half unchanged.
- V4-pf-na: No preserving move is made inside this value. The drawing, the slot
  and the dim all arrive with the owner's approved prototype in one step, and
  the bar has no green oracle of the new reading that a move could be measured
  against before that step.
- V4-d-icon-slot: A tab holds a slot element with the drawing inside it, and the
  drawing with everything in it is hidden from a reading of the page. The word
  stays the whole of what the tab is called, so the bar gains a drawing and
  loses no reading.
- V4-d-icon-table: One table maps each view of the closed union to the shapes of
  its drawing, and a shape is a pair of a shape name and its attributes. The
  shape name is the closed union of the shapes the builder draws, so a name the
  builder cannot draw cannot be written in the table and a tab cannot end up
  with an empty slot.
- V4-d-pill-reading: A reading finds the pill as the bar's own hidden child,
  because every drawing is hidden too and hiddenness alone no longer names one
  thing in the bar. The pill's own place around the drawing is read by nobody.
- V4-d-press-dim-structure: A tab paints its drawing and its word and keeps no
  surface of its own, so a dim declared on the tab reaches those two things and
  never the half of the bar behind them. No reading can see this, so the
  obligation stays with the stylesheet's owner and with the owner's phone check.
- V4-d-paradigm-owner: The paradigm is functional here too: the word table and
  the drawing table are values over the same closed view union, the slot builder
  and the tab builder are functions of one view, and the switch stays the one
  function that writes the bar's state. No class is added and no decision about
  a view's own data is left in an event handler.
- V4-d-algebra-domain: Domain layer of this value. States: the closed set of the
  two views. Operations: the word of a view, the drawing of a view.
  Observations: that word, and the shapes of that drawing. Law a test can check:
  every view of the closed set has exactly one word and exactly one drawing, so
  the bar can offer no view it cannot name or draw.
- V4-d-algebra-application: Application and port layer of this value. States:
  which view the shell shows. Operations: a tap on either tab. Observations: the
  view the shell says is shown, and the view named by the single tab marked as
  current. Laws a test can check: exactly one tab is marked current and it names
  the shown view, on arrival and after a tap on either tab; and a tap on the tab
  already current changes nothing.
- V4-d-algebra-adapter: Adapter layer of this value, the bar a reader meets.
  States: the mounted bar of the built bundle. Operations: the builders of the
  tab, the slot and the pill, with the stylesheet. Observations: each tab's
  name, how many drawing elements it holds, the box of the drawing, the box of
  the word. Laws a test can check: every tab of the bar holds exactly one
  drawing hidden from the reading; each tab's name is exactly its own word; and
  the drawing's box stands above the word's box inside the tab.
- V4-d-algebra-infrastructure: Infrastructure and recovery layer of this value.
  States: the local stack up or down, the seeded account there or missing, the
  bundle's stylesheet applied or not yet. Operations: the vector's own install,
  the stack reset of the spec, the build. Observations: the one observation line
  of the vector. Laws a test can check: a run that could not reach its cases
  reports a setup failure and no failed assertion; and a box read before the bar
  is laid out is a setup failure, never a passing reading.
- V4-d-carriers: The typed carriers of this value and their owners. Decisions:
  the closed view union, the word table over it and the new drawing table over
  it, all in the shell module; the shape name as the closed union of the shapes
  the slot builder draws, in the same module. Effects: the DOM writes of the tab
  builder and the slot builder; no new effect. Errors: none is raised, because
  every table is keyed by the closed union and no view outside it can be asked
  for. Per-process state: which view is shown and both current-tab marks,
  written only by the shell's own switch.
- V4-d-observations: What each observation of this value cannot tell apart. The
  tab's name cannot tell whether a drawing stands in the tab at all, nor its
  shapes. The count of drawing elements in a tab cannot tell what is drawn, nor
  its size or ink. The two boxes can tell that one stands above the other, and
  cannot tell by how much, nor the slot's height, nor the gaps around it. The
  current-tab mark cannot tell the inks of either tab, the pill's travel, or the
  moment the mark was written.
- V4-d-types: Type thinking of this value, at the strength of the type checker
  the build runs: it rejects the modelled wrong call on annotated paths and
  nothing more. Excluded: a view with no word or no drawing, because both tables
  are keyed by the closed union; and a shape the builder cannot draw, because
  the shape name is a closed union. Not excluded: a cast or a value shaped at a
  boundary can still carry an unknown shape name, and anything on the page can
  add or take away an element of the bar, so the bar's reading is checked by
  reading the mounted page and never by a type alone.
- V4-d-closure-reading: Constructive closure of the bar's reading, which is the
  drawing hidden from the reading, the word as the tab's whole name and the
  drawing above the word. Safety PASS by construction and by argument, runtime
  DESIGNED_NOT_BUILT. Inhabitation PASS, runtime DESIGNED_NOT_BUILT: a seeded
  invented ledger is admitted, the tab builder produces the tab, the mounted bar
  consumes it, and the tab's name with the two boxes is the public reading.
  Public reachability PASS, runtime DESIGNED_NOT_BUILT: the bar stands on the
  served page the owner arrives at. Liveness not applicable: the bar is drawn in
  one synchronous pass and no party waits for it.
- V4-d-closure-current: Constructive closure of the bar's current-view state.
  Safety BLOCKED, proof INDETERMINATE: that no sequence of taps leaves none or
  two tabs marked current was selected for a state checker, and no checker is
  installed, so the claim is unproven; the finite reading of the three arrivals
  carries it instead. Inhabitation PASS, runtime DESIGNED_NOT_BUILT: a tap is
  admitted, the shell's switch writes both marks in one step, the bar consumes
  them, and the pair of the shown view and the current tab is the public
  reading. Public reachability PASS, runtime DESIGNED_NOT_BUILT. Liveness not
  applicable: the switch is one synchronous write with no waiting party.
- V4-d-closure-dim: Constructive closure of the press reaching only the drawing
  and the word. Safety BLOCKED: no oracle may read it, because every reading of
  a dim is a reading of an ink, so the claim is unchecked here. Inhabitation
  PASS, runtime DESIGNED_NOT_BUILT: a press is admitted, the stylesheet's rule
  on the tab produces the dim, the tab's painted parts consume it, and the
  owner's phone is the public reading. Public reachability PASS, runtime
  DESIGNED_NOT_BUILT. Liveness not applicable: the dim lasts exactly as long as
  the thumb and no party waits for it.
- V4-d-checkers: Claim to checker for this value. The bar's switch as a state
  model, with its safety that exactly one tab is marked current after any
  sequence of taps, was selected for Quint, because it is a small state model
  over two views and one writer. No temporal or fairness claim arises, so TLC is
  not selected here. No proof obligation needs Agda: the remaining laws are
  decidable over the two views and the three arrivals.
- V4-d-waiver: No state checker and no proof assistant is installed on this
  host. The owner's standing waiver of the formal checkers for this screen work,
  recorded in the repository's own working agreement, is the authority for going
  on without that proof. The one selected claim of this value, that no sequence
  of taps leaves none or two tabs marked current, therefore stays INDETERMINATE
  and its DESIGN axis stays BLOCKED. No finite reading, argument or native test
  is offered as its proof.
- V4-d-pbt-na: This value has no broad input domain to generate over: its whole
  input is the two views and the three arrivals, which are enumerated as cases
  instead. A generator over that closed set would add no case and would hide
  which arrival failed, so the finite cases are the right treatment and no
  seeded generator is designed here.
- V4-d-stress-hidden: Stressor, negating the assumption that the drawing is
  hidden from every reading: the drawing loses its hiding, or gains a title
  inside it. Preserved observation: the tab's name is exactly its own word.
  Allowed degradation: none. Forbidden outcome: a tab read aloud as its word
  twice, or as the names of shapes. Residue: the drawing carries the hiding and
  holds no title or description, and the oracle reads the tab's name rather than
  its text, so the unhidden drawing is refused.
- V4-d-stress-surface: Stressor, negating the assumption that a tab paints
  nothing but its drawing and its word: a later rule gives the tab a surface of
  its own. Preserved observation: a press dims the drawing and the word. Allowed
  degradation: none. Forbidden outcome: the whole half of the bar going dim
  under a thumb. Residue: no reading can see this; the obligation stays with the
  stylesheet's owner, and the owner's phone check is where it is caught.
- V4-d-stress-hidden-pill: Stressor, negating the assumption that one hidden
  thing in the bar is the pill: every drawing is hidden as well. Preserved
  observation: a reading of the pill reads the pill. Allowed degradation: none.
  Forbidden outcome: a pill reading that quietly measures a drawing's box and
  passes. Residue: the reading binds the pill to the bar's own child rather than
  to hiddenness, and the one existing pill reading is migrated to that binding.
- V4-d-stress-unlaid: Stressor, negating the assumption that the bar is laid out
  when its boxes are read: the boxes are read before the bundle's stylesheet is
  applied, so the slot has no height. Preserved observation: the drawing's box
  stands above the word's box. Allowed degradation: the reading waits for the
  bar to be shown. Forbidden outcome: a reading that passes on a bar with no
  layout, or two empty boxes compared as if they stood one above the other.
  Residue: the reading is taken after the bar is shown, both boxes must have a
  height, and a box with none is reported as a setup failure.
- V4-d-stress-second-drawing: Stressor, negating the assumption that a tab holds
  one drawing: a second drawing or a badge is put in the tab. Preserved
  observation: exactly one drawing stands above the word in every tab. Allowed
  degradation: none. Forbidden outcome: two drawings in one tab, or a drawing
  under the word, read as correct. Residue: the law is stated over every tab the
  bar offers and over every drawing element inside it, not over the two views
  that are known today.
- V4-d-second-walk: A second set of stressors, not used to derive this value,
  walked against it. A tab whose word is wrapped in an element instead of
  standing as bare text: the reading takes the word's box from the tab's own
  text, so both shapes are read alike and the law does not depend on the
  wrapping. A bar that gains a third tab later: the law is stated over every
  tab, so a new tab must also hold one hidden drawing above its word, and the
  current-tab law still asks for exactly one. A tap on the tab already current:
  the switch returns at once, so no mark is written twice and the reading after
  that tap is the reading before it. A phone whose text is enlarged until the
  word wraps onto two lines: the law asks only that the drawing stands above the
  word's box, which grows downward, so the law holds and no measure of it is
  read.
- V4-d-spof: Single points of failure and bypasses of this value. The
  current-view mark is one string on each tab and the whole truth of which view
  is read: any writer outside the shell's switch can set another value and no
  type can stop it, so the obligation to write both marks only through that
  switch stays with the shell's owner. The tab's rule in the stylesheet is the
  second: a later rule that gives the tab a surface takes the press dim away
  from the drawing and the word, and that obligation stays with the stylesheet's
  owner because no reading can see it. The acceptance reading rests on one local
  stack and one seeded account; when either is absent nothing of the bar is
  observed and the vector says so as a setup failure.
- V4-d-states: Admitted, excluded and unknown states of this value. Admitted:
  the bar on arrival with the entries tab current; the bar after a tap on the
  other tab; a tap on the tab already current; a word long enough to wrap.
  Excluded: a view with no word or no drawing; a shape name the builder cannot
  draw; none or two tabs marked current at rest. Unknown, with the owner's phone
  check as their risk owner: whether the dim under a thumb looks the same on the
  owner's phone as on the prototype, and whether the pill rests around the
  drawing at the owner's own text size.
- V4-d-self-falsification: Three laws this value refutes rather than keeps. That
  the pill can be found by the fact that it is hidden: refuted by the scope of
  the law, because the bar now holds three hidden things, and the counterexample
  is a pill reading that measures a drawing's box and passes. That a drawing can
  carry a tab's name, so the word could go: refuted at the boundary of the
  reading, because a page read aloud would then name no view, and the
  counterexample is a tab read aloud as nothing. That the press dim can be
  asserted without asserting a design value: refuted by the carrier, because
  every reading of a dim is a reading of an ink, and the counterexample is any
  assertion of it that the owner's own rule forbids.
- V4-ag-producer-tab: The producer of a bottom-bar tab: its element, its view
  mark, its current-view mark and its word. It is migrated: the tab now holds a
  drawing slot before its word, and the drawing is hidden from the reading, so
  the tab's name is unchanged while what the tab holds is not.
- V4-ag-producer-style: The producer of the bar's layout: the tab's rule and the
  pill holder's rule. It is migrated: the slot stands above the word, the pill
  rests around the slot and a press dims the tab's painted parts.
- V4-ag-sent-words: This reading expects each bottom-bar tab to read its own
  word. The drawing is hidden and carries no text, so the word is still the
  whole of the tab's name; the reading is migrated to ask for the tab's name
  rather than its text, which is the contract this value fixes.
- V4-ag-sent-pill: This reading finds the pill as the first hidden element of
  the bar. Every drawing is hidden now, so the reading is migrated to the bar's
  own hidden child, which is the pill holder and nothing else.
- V4-ag-sent-hit: This reading asks which element lies under the middle of the
  Statement tab while a sheet is open, and accepts the tab or anything inside
  it. The drawing stands inside the tab, so the reading holds unchanged.
- V4-ag-lists-current: This case reads the two current-view marks after fast
  taps on both tabs. It reads the marks alone, which this value does not touch,
  so it holds unchanged.
- V4-ag-lists-tap: This step finds the Statement tab by its view mark and taps
  it. The mark and the tab's box are unchanged, and the drawing inside the tab
  is hidden from the reading and is still part of what a thumb lands on, so the
  step holds unchanged.
- V4-ag-motion-tabs: This reading lists every tab by its view mark with its
  current-view mark, at the end of a motion. Both marks are unchanged, so the
  reading holds unchanged.
- V4-at-tab-name: An architectural law of the bar, over every tab the bar offers
  and not only over the two known today: each tab is named by its own word
  alone, holds exactly one drawing element, and that drawing with everything
  inside it is hidden from a reading of the page. A tab added later is governed
  by the same law, so the word stays the single owner of what a view is called.
- V4-at-one-current: An architectural law of the bar's one writer: at rest,
  exactly one element of the bar carries the current-view mark, and the view it
  names is the view the shell says is shown, on arrival and after a tap on
  either tab. A second writer of that mark is what the law refuses.
- V4-ct-na: The producer of the bar and the readings of it live in one
  deployable and change in the same candidate. Nothing of this value is stored,
  sent over a wire or released on its own schedule, so the oracle of this value
  covers the agreement and no separate contract test is needed.
- V4-ic-views: The shell is changed: the drawing table, the slot builder and the
  tab builder that puts the slot before the word. Its exported shape is
  unchanged, and what the bar offers a reader is not.
- V4-ic-theme: The stylesheet is changed: the slot above the word, the pill
  around the slot and the dim under a press. The acceptance reading of this
  value is made on the built bundle, so this file travels in the candidate of
  this value.
- V4-ic-oracle: The oracle of this value is a new acceptance spec that owns the
  bar's reading: one drawing a tab, hidden from the reading, above the word,
  with exactly one tab marked current and naming the shown view.
- V4-ic-sent-words: The reading of the two tab words in the shell's own case is
  amended to ask for each tab's name, so the drawing cannot creep into it
  unnoticed.
- V4-ic-sent-pill: The pill reading of the shell's own case is amended to find
  the pill as the bar's own hidden child, because hiddenness alone no longer
  names one thing in the bar.
- V4-ic-sent-hit: The reading of what lies under the Statement tab while a sheet
  is open accepts the tab or anything inside it, so the drawing inside the tab
  leaves it unchanged.
- V4-ic-lists-current: The reading of both current-view marks after fast taps is
  unchanged, because this value writes those marks through the same switch.
- V4-ic-lists-tap: The step that finds the Statement tab by its view mark and
  taps it is unchanged, because the mark and the tab's box stay as they are.
- V4-ic-motion-tabs: The end-of-motion listing of every tab with its
  current-view mark is unchanged, because this value adds no mark and removes
  none.
- V4-ic-discovery: The acceptance configuration is unchanged by this value: the
  new spec lies in the directory the existing project already scans, with the
  same viewport and no touch, so no project and no entry of that file is edited
  here.
- V4-b-driving: The driving port is the mounted page of the built bundle, served
  over a loopback origin and read and tapped as the owner's phone would: the bar
  is read, a tab is tapped, and the bar is read again.
- V4-b-driven-style: The driven stylesheet: the slot that puts the drawing above
  the word, the place of the pill around that slot, and the dim under a press.
  It decides nothing about which tab is current.
- V4-b-driven-reading: The driven reading of the page: the name a tab offers a
  reader, which the hidden drawing is kept out of, and the current-view mark the
  reader is told by.
- V4-b-driven-ledger: The driven ledger store: the local stack the spec brings
  up, resets and seeds with invented entries. Nothing of this value reads a
  figure or writes one.
- V4-b-direction: Dependencies point inward. The shell holds the word table and
  the drawing table and imports the motion owner; nothing imports the drawing
  table, and the stylesheet imports nothing. The spec imports only the public
  page and the supports that bring the stack up and seed it.
- V4-b-f-hidden-cond: A drawing in the bar is not hidden from the reading, or an
  element inside a tab carries a name of its own.
- V4-b-f-hidden-obs: The tab's name is no longer exactly its own word, and the
  oracle refuses the reading with what the tab was named instead.
- V4-b-f-layout-cond: A box of the bar is read before the bundle's stylesheet is
  applied, so the slot or the word has no height.
- V4-b-f-layout-obs: The reading is not made: the bar must be shown and both
  boxes must have a height first, and a box with none is reported as a setup
  failure with nothing observed.
- V4-b-f-second-writer-cond: The current-view mark is written by something other
  than the shell's own switch, so none or two tabs carry it at rest.
- V4-b-f-second-writer-obs: The oracle refuses the reading, naming how many tabs
  carried the mark and which view each named.
- V4-b-f-stack-cond: The local stack is down, or the seeded account is missing,
  so no page is served to read.
- V4-b-f-stack-obs: The vector's one line names a setup failure and no failed
  assertion, with nothing observed of the bar, so an absent stack is never taken
  for a bar that reads wrongly.
- V4-o-observation: On a phone reading a seeded invented ledger, the bottom bar
  offers two tabs; each tab is named by its own word, Entries or Statement, and
  nothing else; each tab holds exactly one drawing element, which with
  everything inside it is hidden from a reading of the page; that drawing's box
  stands above the box of the tab's word inside the same tab; and exactly one
  tab carries the current-view mark, naming the view the shell says is shown.
- V4-o-stimulus: The bundle is built and served over the loopback origin, the
  owner signs in to the seeded account holding one send of MVR10,000 at the rate
  20 stored as $500 and one send of $750, reads the bar on arrival, taps the
  Statement tab, reads the bar again, taps the Entries tab and reads it once
  more.
- V4-o-expected: The expected readings are computed in the spec from the two
  view words it states itself and from the view the shell says is shown: two
  tabs named Entries and Statement in that order, one drawing element a tab,
  each hidden from the reading, each drawing's box ending no lower than the top
  of its tab's word, and one current-view mark, on the entries tab at arrival,
  on the statement tab after the first tap and on the entries tab after the
  second.
- V4-o-falsifier: The spec fails when a tab is named anything but its own word,
  when a tab holds no drawing or more than one, when a drawing is not hidden
  from the reading, when a drawing's box does not stand above the word's box,
  when none or two tabs carry the current-view mark, or when the tab carrying it
  does not name the view the shell says is shown.
- V4-adr-context: The bar gains a drawing above each word, a pill around the
  drawing of the view being read and a dim that reaches only that drawing and
  that word. Of those three, only the first can be read without reading a design
  value, and the bar already has one state a reader is told by, so what this
  value asserts and what it leaves to the owner's phone has to be fixed before
  the spec is written.
- V4-adr-decision: Put the drawing in a slot inside the tab and hide it from the
  reading, keep the word as the tab's whole name, and key the drawings by the
  same closed view union as the words, with the shape name a closed union too.
  Assert the drawing's count, its hiding, its standing above the word, and the
  one current-view mark. Leave the pill's place and the dim to the owner's
  phone, and bind a pill reading to the bar's own child rather than to
  hiddenness.
- V4-adr-alt-pill-hook: Give the pill a mark of its own so a reading finds it by
  name. Rejected: the pill holder is already the bar's own child and nothing
  else is, so the reading is unambiguous without changing what the page offers.
- V4-adr-alt-assert-pill: Assert that the pill's box holds the drawing's box, so
  the pill around the drawing is guarded by a gate. Rejected: the place of the
  pill around the drawing is one of the approved design values of this batch,
  which the owner's rule asserts in no spec.
- V4-adr-alt-icon-module: Hold the drawings in a module or a file of their own
  and load them. Rejected: the owner's fork keeps the drawings inline in the
  shell, and a second file would add a loading boundary for two drawings.
- V4-adr-alt-aria-label: Name each tab with a label of its own instead of its
  word, so the drawing could carry the reading. Rejected: the bar would then
  have two owners of what a view is called, and they could drift apart without
  any reading seeing it.
- V4-adr-con-new-spec: A new acceptance spec owns the bar's reading, so the bar
  has one place that states what it offers a reader, and the shell's existing
  case keeps its own claims about where the bar sits.
- V4-adr-con-migrated-pill: One existing pill reading and one existing word
  reading are migrated, and four other readings of the bar are checked and left
  as they are.
- V4-adr-con-unguarded: The pill's place around the drawing and the dim under a
  press are guarded by no gate at all: a later change to either passes every
  check and is caught only on the owner's phone.
- V4-adr-con-closed-table: Keying the drawings by the closed view union, with a
  closed set of shape names, means a view cannot be offered without a drawing
  and a drawing cannot name a shape the builder does not draw.

### Targets (Value 4)

| Path | Decision | Reason |
|---|---|---|
| `src/ui/views.ts` | EXTEND | V4-t-views |
| `src/ui/theme.css` | EXTEND | V4-t-theme |

### Paradigm (Value 4)

functional

### Decisions (Value 4)

V4-d-icon-slot, V4-d-icon-table, V4-d-pill-reading, V4-d-press-dim-structure,
V4-d-paradigm-owner, V4-d-algebra-domain, V4-d-algebra-application,
V4-d-algebra-adapter, V4-d-algebra-infrastructure, V4-d-carriers,
V4-d-observations, V4-d-types, V4-d-closure-reading, V4-d-closure-current,
V4-d-closure-dim, V4-d-checkers, V4-d-waiver, V4-d-pbt-na, V4-d-stress-hidden,
V4-d-stress-surface, V4-d-stress-hidden-pill, V4-d-stress-unlaid,
V4-d-stress-second-drawing, V4-d-second-walk, V4-d-spof, V4-d-states,
V4-d-self-falsification, F-d-waiver, F-d-checkers, F-d-paradigm-owners,
F-d-substrate, F-d-algebra-application, F-d-carriers, F-d-spof, F-d-bypasses,
F-d-second-walk, F-d-states, F-d-arch-check

### Oracle (Value 4)

tests/acceptance/views-bar.spec.ts

### Acceptance supports (Value 4)

```json
[
  "tests/support/oracle-observation.mjs",
  "tests/support/local-stack.ts",
  "tests/support/accounts.ts"
]
```

### Oracle verification index (Value 4)

```json
0
```

### Purpose (Value 4)

V4-purpose

### Constraints (Value 4)

V4-c-asserted-set, V4-c-pill-design, V4-c-no-bounds, F-c-no-design-values,
F-c-invented-figures, F-c-src-uncommitted, F-c-prototype-reference,
F-c-oracle-vector, F-c-one-playwright-run, F-c-existing-project-unchanged,
F-c-viewport, F-c-no-new-dependency, F-c-phone-stop, F-eq,
F-d-design-values-travel

### Inherits (Value 4)

None

### Boundaries (Value 4)

```json
{
  "driving_port": {
    "ref": "V4-b-driving"
  },
  "driven_ports": [
    {
      "ref": "V4-b-driven-style"
    },
    {
      "ref": "V4-b-driven-reading"
    },
    {
      "ref": "V4-b-driven-ledger"
    }
  ],
  "dependency_direction": {
    "ref": "V4-b-direction"
  },
  "failures": [
    {
      "condition": {
        "ref": "V4-b-f-hidden-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "V4-b-f-hidden-obs"
      }
    },
    {
      "condition": {
        "ref": "V4-b-f-second-writer-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "V4-b-f-second-writer-obs"
      }
    },
    {
      "condition": {
        "ref": "V4-b-f-layout-cond"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "V4-b-f-layout-obs"
      }
    },
    {
      "condition": {
        "ref": "V4-b-f-stack-cond"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "V4-b-f-stack-obs"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Public oracle (Value 4)

```json
{
  "observation": {
    "ref": "V4-o-observation"
  },
  "stimulus": {
    "ref": "V4-o-stimulus"
  },
  "expected": {
    "ref": "V4-o-expected"
  },
  "falsifier": {
    "ref": "V4-o-falsifier"
  }
}
```

### Architectural tests (Value 4)

```json
{
  "obligations": [
    {
      "id": "V4at-tab-name",
      "obligation": {
        "ref": "V4-at-tab-name"
      },
      "oracle": "tests/acceptance/views-bar.spec.ts",
      "verification_index": 0
    },
    {
      "id": "V4at-one-current",
      "obligation": {
        "ref": "V4-at-one-current"
      },
      "oracle": "tests/acceptance/views-bar.spec.ts",
      "verification_index": 0
    }
  ],
  "applicability": "applicable"
}
```

### Contract tests (Value 4)

```json
{
  "reason": {
    "ref": "V4-ct-na"
  },
  "applicability": "not_applicable"
}
```

### Prefactoring (Value 4)

```json
{
  "reason": {
    "ref": "V4-pf-na"
  },
  "applicability": "not_applicable"
}
```

### Agreement analysis (Value 4)

| Id | Contract | Role | Locator | Decision | Reason |
|---|---|---|---|---|---|
| V4p-tab-producer | The bottom-bar tab a reader meets: its view mark, its current-view mark, its word and its one hidden drawing | producer | `src/ui/views.ts:83` | MIGRATED | V4-ag-producer-tab |
| V4p-style-producer | The bar's layout: the drawing slot above the word, the pill around the slot and the dim under a press | producer | `src/ui/theme.css:2408` | MIGRATED | V4-ag-producer-style |
| V4p-sent-words | Each bottom-bar tab reads its own view word | consumer | `tests/acceptance/statement-sent.spec.ts:711` | MIGRATED | V4-ag-sent-words |
| V4p-sent-pill | The pill of the bar is found and measured against the current tab's half | consumer | `tests/acceptance/statement-sent.spec.ts:726` | MIGRATED | V4-ag-sent-pill |
| V4p-sent-hit | What lies under the middle of the Statement tab while a sheet is open | consumer | `tests/acceptance/statement-sent.spec.ts:1189` | UNCHANGED_COMPATIBLE | V4-ag-sent-hit |
| V4p-lists-current | Both current-view marks of the bar after fast taps | consumer | `tests/acceptance/statement-lists.spec.ts:1127` | UNCHANGED_COMPATIBLE | V4-ag-lists-current |
| V4p-lists-tap | The Statement tab is found by its view mark and tapped | consumer | `tests/acceptance/statement-lists.spec.ts:578` | UNCHANGED_COMPATIBLE | V4-ag-lists-tap |
| V4p-motion-tabs | Every tab of the bar listed by its view mark with its current-view mark at the end of a motion | consumer | `tests/acceptance/statement-motion.spec.ts:449` | UNCHANGED_COMPATIBLE | V4-ag-motion-tabs |

### Reuse analysis (Value 4)

| Symbol | Locator | Decision | Reason |
|---|---|---|---|
| renderTab | `src/ui/views.ts:83` | EXTEND | V4-r-rendertab |
| VIEW_NAMES | `src/ui/views.ts:54` | REUSE | V4-r-view-names |
| VIEWS | `src/ui/views.ts:49` | REUSE | V4-r-views-enum |
| TAB_ICONS with renderTabIcon | `src/ui/views.ts:82` | CREATE_NEW | V4-r-icon-table |
| renderPill | `src/ui/views.ts:102` | REUSE | V4-r-renderpill |
| show | `src/ui/views.ts:137` | REUSE | V4-r-show |
| .views-tab | `src/ui/theme.css:2408` | EXTEND | V4-r-theme-tab |
| .views-pill-holder | `src/ui/theme.css:2383` | EXTEND | V4-r-theme-pill-holder |

### Impact closure (Value 4)

```json
{
  "items": [
    {
      "kind": "public_interface",
      "locator": "src/ui/views.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "V4-ic-views"
      }
    },
    {
      "kind": "runtime",
      "locator": "src/ui/theme.css",
      "decision": "CHANGED",
      "reason": {
        "ref": "V4-ic-theme"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/views-bar.spec.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "V4-ic-oracle"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:711",
      "decision": "MIGRATED",
      "reason": {
        "ref": "V4-ic-sent-words"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:726",
      "decision": "MIGRATED",
      "reason": {
        "ref": "V4-ic-sent-pill"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:1189",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V4-ic-sent-hit"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:1127",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V4-ic-lists-current"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:578",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V4-ic-lists-tap"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-motion.spec.ts:449",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V4-ic-motion-tabs"
      }
    },
    {
      "kind": "discovery",
      "locator": "tests/playwright.config.ts:7",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V4-ic-discovery"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Adr (Value 4)

```json
{
  "context": {
    "ref": "V4-adr-context"
  },
  "decision": {
    "ref": "V4-adr-decision"
  },
  "alternatives": [
    {
      "ref": "V4-adr-alt-pill-hook"
    },
    {
      "ref": "V4-adr-alt-assert-pill"
    },
    {
      "ref": "V4-adr-alt-icon-module"
    },
    {
      "ref": "V4-adr-alt-aria-label"
    }
  ],
  "consequences": [
    {
      "ref": "V4-adr-con-new-spec"
    },
    {
      "ref": "V4-adr-con-migrated-pill"
    },
    {
      "ref": "V4-adr-con-unguarded"
    },
    {
      "ref": "V4-adr-con-closed-table"
    }
  ],
  "status": "proposed",
  "applicability": "applicable"
}
```

### Product change (Value 4)

Product change: required

### Verification (Value 4)

Verification command:

```sh
node tests/support/oracle-observation.mjs tests/acceptance/views-bar.spec.ts
```

Verification command:

```sh
npm run build
```

Verification command:

```sh
npm run test:unit
```

Verification command:

```sh
npm run test:acceptance
```

## Value 2

### Facts (Value 2)

- V2-purpose: The sending list's footer reads its rufiyaa subtotal and, on the
  line under it, the dollars those same rufiyaa were worth, with an arrow drawn
  before that figure by the screen: MVR14,000 and under it an arrow with
  $700.00.
- V2-c-figures: The seeded ledger of this value is invented: two rufiyaa sends,
  MVR10,000 at the rate 20 stored as $500 and MVR4,000 at the rate 20 stored as
  $200, and one send of $750. Its footer therefore reads MVR14,000 with the mark
  and $700.00 under it, $750.00 on the dollar line and $1,450.00 on the total
  line.
- V2-c-bounds: The bounds the authority states for what this value reads: the
  footer holds exactly three lines at every ledger; the rufiyaa line holds
  exactly two figures, the subtotal and the converted total, and the dollar and
  total lines exactly one each; a rufiyaa subtotal is the sum of the laari its
  sends store, with no upper bound stated, and reads its laari only when they
  are real; every dollar figure of the footer keeps two decimals. This design
  states no narrower bound: it caps no figure's length and fixes no size for the
  room the mark takes.
- V2-c-empty-ledger: At a ledger that holds no rufiyaa send, the rufiyaa line
  still reads MVR0 and the mark with $0.00: the mark is drawn from what a figure
  says it reads and from nothing about its value, so no ledger drops it.
- V2-c-no-domain-mark: No string the domain words carries the mark: the figure's
  own text stays the dollar reading of the summed rufiyaa, so every reading that
  compares a footer figure with stored money keeps comparing money alone.
- V2-t-statement: The Statement screen's footer figure renderer is the one
  writer of the footer's drawn parts: it gains the mark span and the detail box
  that holds the mark beside the figure saying it reads the converted total, and
  the hook documentation at the head of the module is amended to say that the
  mark stands there and is the screen's own.
- V2-t-theme: The stylesheet carries the design values of the footer's second
  line: the figures of the rufiyaa line stand in a column instead of a row, and
  the detail box holds the mark beside the converted figure. What a spec reads
  of it is the stacking and the absence of overlap; every size, ink and gap is
  judged on the phone.
- V2-d-arrow-span: The mark before the converted total is the screen's own leaf:
  the footer figure renderer draws a span holding the rightwards arrow → and
  puts it, with the figure that says it reads the converted total, inside a
  detail box of that line. A figure saying it reads anything else is drawn
  exactly as before, so the mark is decided by the saying and never by a
  figure's text.
- V2-d-arrow-every-ledger: The mark stands wherever a figure says it reads the
  converted total, which is on every ledger, the empty one included, where the
  line reads MVR0 and the mark with $0.00.
- V2-d-line-under: The converted total stands on a line of its own under the
  subtotal: the figures box of the rufiyaa line is drawn as a column and the
  detail box takes its own height in it. The reading of this is relational, the
  detail's box lying wholly below the subtotal's box inside the same line with
  no two boxes overlapping, so no size, gap or ink of that arrangement is
  asserted anywhere.
- V2-d-reading-binds-saying: A reading of the footer finds a figure by what that
  figure says it reads, never by its place among the leaves of its line: the
  mark adds a leaf, so a reading that counted leaves is migrated to the saying
  it can bind to instead.
- V2-d-migrations: Four acceptance readings are migrated by this value: the leaf
  reading of the footer's three lines, and the three readings that compare the
  whole squashed text of the sent footer block with a text they build from the
  stored sends, each of which now holds the mark on the rufiyaa line. Two more
  readings of the footer are checked and left as they are: one reads the names
  of the three lines, the other reads the block's box while the rows are
  scrolled.
- V2-d-mark-read-aloud: The mark is drawn as text and carries no accessible
  treatment of its own, so a reading aloud of the footer speaks it as an arrow
  between the two figures. No spec asserts that, and the question of hiding it
  from a reading aloud is open and belongs to the owner.
- V2-d-algebra-domain: Domain layer. States: a footer line with its label, its
  count, its cents and its figures, each figure saying what it is a reading of
  among the rufiyaa sent, the dollars those rufiyaa were worth, the dollars sent
  and the total. Operations: the summing of the sends of one currency and the
  wording of each figure. Observations: the saying a figure carries and the text
  it reads. Law a test can check: the figure that says it reads the converted
  total reads exactly the dollar wording of the cents its line's rufiyaa sends
  store, and no figure's text carries the mark.
- V2-d-algebra-application: Application and port layer. States: one read outcome
  of the ledger handed to the screen, which writes nothing. Operations: the
  drawing of the footer's three lines in one synchronous pass. Observations:
  each line's own count and cents, and the block's count and cents. Laws a test
  can check: the three lines stand in their order at every ledger, each carrying
  the count and the cents of the sends it holds; the block carries the total
  line's count and cents; the screen offers nothing that records money.
- V2-d-algebra-adapter: Adapter layer, the DOM the page offers a reader. States:
  the mounted page for a seeded ledger. Operations: the footer figure and footer
  line renderers. Observations: the ordered leaf readings of a footer line, what
  each leaf says it reads, and the boxes those leaves are drawn in. Laws a test
  can check: exactly one mark stands in the sent footer and immediately before
  the figure that says it reads the converted total; that figure's own text
  holds no mark; the detail lies wholly below the subtotal inside its line and
  no two leaf boxes of the footer overlap.
- V2-d-algebra-infrastructure: Infrastructure and recovery layer. States: the
  local stack up or down, the seeded account present or absent, the ledger read
  succeeding or failing. Operations: the vector's own install, the stack reset
  each spec makes, the read of the stored ledger the expectation is derived
  from. Observations: the vector's one line, with what it observed, what failed
  on an assertion and what failed before any assertion. Laws a test can check: a
  run that could not reach its cases reports a setup failure and no assertion
  failure; a failed ledger read draws no footer and speaks one alert.
- V2-d-carriers: The typed carriers of this value and their owners. Decisions:
  the saying of what a figure reads, a closed union of four names, and the
  figure record that pairs it with its text, both in the domain's statement
  module; the drawing of the mark and of the detail box in the Statement
  screen's footer figure renderer. Effects: the DOM writes of that renderer and
  of the footer line renderer. Errors: none is raised; a figure that says it
  reads anything but the converted total is drawn as it was. Per-process state:
  none; the footer is drawn from the read outcome alone.
- V2-d-substrate: The test substrate of this value: the built bundle served over
  the loopback origin and read by the pinned runner at 360 by 780, through the
  existing stack and account supports; the acceptance vector node
  tests/support/oracle-observation.mjs with this value's own spec; a seeded
  account of its own for the two rufiyaa sends and the dollar send, one for the
  empty ledger and one the generated ledgers are written into; and the gates npm
  run build and npm run test:acceptance over the one serialised run.
- V2-d-pbt: The broad law of this value is checked over generated ledgers
  written through the app's own seeding and read through the mounted page: for
  each ledger the expected subtotal, converted total and counts are computed in
  the spec from the stored rows alone, never from anything drawn. With no
  property library pinned, the spec carries its own seeded generator with a
  fixed seed printed with any failure, and reports the smallest failing ledger
  of the spread. The stacking of the two figures and the absence of a mark in a
  figure's own text are finite cases instead, because the arrangement is one
  boundary and not a domain.
- V2-d-checkers: Claim to checker for this value: every claim of the footer's
  reading is decidable over a finite set of sayings and a generated spread of
  ledgers read through the public page, so the acceptance observation and the
  generated spread carry them. No state model, no temporal or fairness claim and
  no proof obligation arises here, so neither Quint, nor TLC, nor Agda is
  selected for a claim of this value.
- V2-d-waiver: The formal checkers are absent on this host and waived by the
  owner's standing waiver for this read-only screen work, recorded in the
  repository's working agreement. No claim of this value was selected for one of
  them; any claim that would rest on one stays INDETERMINATE with that waiver as
  its reason and its DESIGN axis stays BLOCKED, and no finite case, generated
  spread or argument of this value is offered as such a proof.
- V2-d-closure: Constructive closure of this value. Safety, that no figure of
  the footer can read the mark inside its own text: DESIGN PASS by construction,
  runtime DESIGNED_NOT_BUILT. Inhabitation, that a seeded pair of rufiyaa sends
  is read as the subtotal with the mark and the converted total under it: DESIGN
  PASS, runtime DESIGNED_NOT_BUILT. Public reachability, that the arrangement is
  read on the served page: DESIGN PASS, runtime DESIGNED_NOT_BUILT. Liveness:
  not applicable, the footer being one synchronous pass with no queue and no
  waiting party.
- V2-d-stress-empty: Stressor, negating the assumption that a converted total is
  a figure of money the owner has actually sent: the ledger holds no rufiyaa
  send. Preserved observation: the rufiyaa line still reads its label with its
  count, MVR0, and the mark with $0.00 under it. Allowed degradation: the mark
  stands before a zero. Forbidden outcome: a line that drops the mark or a
  figure at zero, which the owner could not tell from a footer that forgot the
  currency. Residue: the mark is drawn from the saying a figure carries, so no
  ledger can drop it.
- V2-d-stress-long-figure: Stressor, negating the assumption that the subtotal
  and its converted total fit the room the column gives them: a month of rufiyaa
  sends in the millions, with laari. Preserved observation: neither figure is
  cut off and no two boxes of the footer overlap. Allowed degradation: the
  detail takes more height, so the rufiyaa line is taller than the two below it.
  Forbidden outcome: a figure clipped, or the rufiyaa line drawn over the dollar
  line. Residue: the figures box of that line is a column that takes its own
  height, and the invariant is read as boxes rather than as a size.
- V2-d-stress-whole-text-reader: Stressor, negating the assumption that a
  reading of the footer reads its figures one by one: three existing readings
  compare the whole squashed text of the block with a text they build from the
  stored sends. Preserved observation: each of those readings still states the
  three lines it means, now with the mark on the rufiyaa line. Allowed
  degradation: those three readings are migrated in this value. Forbidden
  outcome: a reading that passes because the mark replaced a figure rather than
  joined it. Residue: every figure keeps its own saying, so a migrated reading
  binds to the saying and the mark is read as a leaf of its own.
- V2-d-stress-domain-mark: Stressor, negating the assumption that the domain
  words no mark: a later writer puts the arrow inside the converted total's own
  string. Preserved observation: the owner reads one mark. Allowed degradation:
  none. Forbidden outcome: two marks, or a mark inside the figure every reading
  compares with stored money. Residue: the page-wide law reads each figure's own
  text and fails on a mark inside it, and the module's own string literals are
  read for a written mark.
- V2-d-stress-failed-read: Stressor, negating the assumption that the ledger
  read succeeds: the read fails behind the Statement tab. Preserved observation:
  the screen speaks one alert and draws no footer, no row and no card figure.
  Allowed degradation: nothing of the footer is read at all. Forbidden outcome:
  a footer of zeroes drawn for a read that failed, which states a quiet month
  the owner never had. Residue: the drawn footer and the alert are alternatives
  of the screen, and the spec reads both.
- V2-d-stress-stack-down: Stressor, negating the assumption that the local stack
  is up and the account seeded: either is absent when the vector runs. Preserved
  observation: the vector's one line reports a setup failure with nothing
  observed and no assertion failed. Allowed degradation: the value is not
  observed at all. Forbidden outcome: a broken environment read as a red oracle.
  Residue: the vector counts what the runner reported and keeps the two apart.
- V2-d-spof: Single points of failure of this value. The figures box of the
  rufiyaa line is the one place that makes the detail a line of its own: a later
  selector setting a row direction inside that line puts the mark back beside
  the subtotal, no type can stop it, and the obligation to keep that box a
  column stays with the stylesheet's owner. The saying a figure carries is the
  other: it is the only thing the mark is drawn from, so a figure given the
  wrong saying draws the mark in the wrong place, and the obligation to set the
  saying from the summed currency alone stays with the domain's owner. The
  observation rests on the one local stack and the seeded account; when either
  is absent nothing of the product is observed and the vector says so as a setup
  failure.
- V2-d-bypasses: What this design cannot stop. The DOM is a public writable
  surface: anything on the page may add a mark beside a figure or inside it, so
  the mark's ownership is read on the mounted page and never only from a type. A
  figure record shaped by a cast at a boundary can carry a saying outside its
  union or a text with a mark already in it, and the checker that runs in the
  build rejects that only on annotated paths. A foreign process that stops the
  stack ends the observation rather than falsifying the product.
- V2-d-second-walk: A second set of stressors, not used to derive this design,
  walked against it. A month whose rufiyaa sends add up to whole rufiyaa: the
  subtotal reads without laari while the converted total keeps its two decimals,
  which the two wordings already answer for, and the mark stands between them
  unchanged. A ledger of five hundred sends: the footer stands under the
  scrolling rows, so the second line is read after a scroll exactly as before
  and the lines keep their order. A ledger holding a send in neither currency:
  it belongs to no currency line and still to the total, so the mark still
  stands before the one converted figure and the counts still add up through the
  line's own pair. A reading aloud of the footer: the mark is spoken as an
  arrow, which no spec asserts and which the owner decides. A page where the
  stylesheet failed to load: the figures stand in one row and the stacking law
  fails loudly rather than the mark disappearing.
- V2-d-states: Admitted, excluded and unknown states of this value. Admitted: a
  ledger with rufiyaa sends and dollar sends; a ledger with no rufiyaa send,
  read at zero with the mark; a ledger with nothing at all; a rufiyaa subtotal
  with real laari; a send in neither currency, counted on the total line alone.
  Excluded: a footer figure whose own text carries the mark; a mark standing
  before a figure that says it reads anything but the converted total; two marks
  in one footer; a converted total drawn beside the subtotal on the same line; a
  rufiyaa line that drops one of its two figures. Unknown, with the owner's
  phone check as their risk owner: whether a subtotal long enough to wrap reads
  as one figure to the owner, and whether the mark spoken aloud between the two
  figures is wanted there.
- V2-d-self-falsification: Two laws this value refutes rather than keeps. The
  mark does not belong in the domain's own string for the converted total,
  because the domain words money and a reading that compares that figure with
  stored money would then be comparing a mark as well. The order of a line's
  leaves does not identify its figures, because the mark is a leaf and the
  figures a reading wants are named by what they say they read.
- V2-d-arch-check: One architectural law of this value is checked over the whole
  mounted page and over the modules that word the footer: the mark is the
  screen's own, so no element that says what it reads carries the mark inside
  its own text, exactly one mark stands in the sent footer, it stands
  immediately before the figure that says it reads the converted total, and no
  string literal of the domain's statement module writes that mark.
- V2-r-foot-figure-renderer: The footer figure renderer already draws one figure
  with the saying of what it reads on it, which is the one place a mark beside
  that figure can be drawn from the saying alone. It is extended rather than
  replaced, so a figure of any other saying keeps the element and the hook it
  has now.
- V2-r-foot-line: The footer line renderer already puts a line's figures in
  order inside one box, so the detail arrives there with no change to it: what
  makes the detail a line of its own is that box becoming a column in the
  stylesheet.
- V2-r-sent-foot: The sent footer builder already draws the three lines in one
  block and keeps the block's own count and cents from the total line, so
  nothing about the block changes in this value.
- V2-r-cell: The helper that makes a span with a class and a text is the one way
  this module draws a reading, so the mark is drawn through it and reads like
  every other leaf of the footer.
- V2-r-element: The helper that makes an element with a class is the one way
  this module makes a box, so the detail box is made through it.
- V2-r-saying: The closed union of what a footer figure is a reading of already
  names the converted total, so the mark is decided from a value the domain
  already carries and no new name, flag or hook is introduced for it.
- V2-r-domain-figure: The figure record already pairs the saying with the text
  the figure reads, so the renderer reads both from one value and nothing about
  the stored money changes.
- V2-r-converted-total: The converted total is already summed once in the domain
  from the rufiyaa sends of the line and worded there, so this value adds no
  figure and re-converts nothing.
- V2-r-converted-ink: The stylesheet already selects the converted figure by
  what it says it reads, so the mark's own line is drawn beside that rule rather
  than through a new reading hook.
- V2-r-foot-line-style: The stylesheet already selects a footer line by which of
  the three it is, so the rufiyaa line's figures box is made a column through
  that same selector.
- V2-r-leaf-reading: The existing footer oracle already reads a line as its leaf
  elements in the order they are drawn, with its empty parts dropped, which is
  the reading this value's oracle needs for a mark that is a leaf of its own;
  that reading shape is reused rather than invented again.
- V2-r-generator: The existing footer oracle already builds a spread of ledgers
  from a fixed seed, writes each into a seeded account and reports the smallest
  failing one, which is the generated domain this value's broad law needs; that
  generator shape is reused rather than a library added.
- V2-pf-na: No preserving move is made before this value's behaviour changes.
  The source change arrives as the prototype applied in one step at the first
  value's craft, and the footer readings that could be a baseline are the
  readings this value migrates, so none of them is a green oracle a move could
  be measured against.
- V2-ct-na: The producer of the footer's drawn figures and every consumer of
  them live in one deployable and change in the same candidate: the renderer and
  the specs that read the mounted page. Nothing of this value is persisted, sent
  over a wire or released on another schedule, so the value's own oracle covers
  the agreement and no separate contract test is needed.
- V2-model-na: No model file is delivered for this value. Its claims are
  readings over a finite set of sayings and a generated spread of ledgers,
  decided through the public page, so no state model was selected; the checkers
  that would carry one are absent and waived, and the algebraic model of this
  value is delivered as its laws.
- V2-scenarios-na: A scenario of this scope is read from the trace of an
  executed model run, and no model of this value was executed or selected. The
  behaviour the owner judges is the footer reading stated in this value's
  oracle.
- V2-at-mark-ssot: The mark is the screen's own and has one owner: over the
  whole mounted page no element that says what it reads carries the mark inside
  its own text, exactly one mark stands in the sent footer, it stands
  immediately before the figure that says it reads the converted total, and no
  string literal of the domain's statement module writes it.
- V2-ic-statement: The Statement screen is changed: its footer figure renderer
  draws the mark and the detail box around the converted figure, and the hook
  documentation at the head of the module is amended to say so.
- V2-ic-theme: The stylesheet is changed: the figures of the rufiyaa footer line
  stand in a column and the detail box holds the mark beside the converted
  figure.
- V2-a-footer-leaves: This reading reads each footer line as its label and then
  the figures that follow it among the line's leaves. The mark is a leaf of its
  own between the subtotal and the converted total, so the reading is migrated
  to find each figure by what it says it reads and to read the mark as the
  screen's own leaf before the converted total.
- V2-a-sent-foot-text: This reading builds the whole text of the sent footer
  from the stored sends, with the subtotal and the converted total side by side.
  It is migrated to the text that holds the mark between them.
- V2-a-lists-foot-text: This reading builds the sent footer's text from the rows
  of that list, with the subtotal and the converted total side by side. It is
  migrated to the text that holds the mark between them, including at the empty
  ledger, where that line reads MVR0 and the mark with $0.00.
- V2-a-columns-foot-text: This reading builds the sent footer's three lines as
  one block of text from the stored sends. It is migrated to the text that holds
  the mark before the converted total.
- V2-a-back-lines: This reading takes only the names of the sent footer's three
  lines, so the mark does not reach it and the reading needs no edit.
- V2-a-motion-foot: This reading takes the sent footer's element and its box
  while the rows are scrolled, never its text, so the mark does not reach it and
  the reading needs no edit.
- V2-ag-p-foot-figure: The producer of the sent footer's drawn figures and of
  what stands beside them. It is migrated: the figure that says it reads the
  converted total is drawn inside a detail box with the screen's own mark before
  it, and keeps the saying by which every reading finds it.
- V2-ag-p-domain: The producer of what each footer figure is a reading of and of
  the words it reads in. It is unchanged and compatible: the saying and the text
  stay as they are, and the mark is drawn outside both.
- V2-b-driving: The driving port is the mounted page of the built bundle, served
  over a loopback origin and read as the owner's phone would read it: sign in,
  tap the Statement tab, read the sending list's footer, and scroll the rows.
- V2-b-driven-ledger: The driven ledger store: the local stack the spec brings
  up, resets and seeds with the invented sends. Nothing of this value writes to
  it.
- V2-b-driven-style: The driven stylesheet: the rule that stands the detail
  under the subtotal by drawing the rufiyaa line's figures box as a column.
- V2-b-direction: Dependencies point inward. The domain words the figures and
  their sayings and imports nothing of the UI. The Statement screen reads those
  values and draws them; the stylesheet draws what the screen marked. The spec
  reads only the mounted page and the stored ledger, never a module of the
  screen except to read its string literals for a written mark.
- V2-b-f-read-cond: The ledger read behind the Statement tab fails.
- V2-b-f-read-obs: The screen speaks one alert and draws no footer, no row and
  no card figure, so a failed read is never read as a month in which nothing
  went out.
- V2-b-f-mark-cond: A figure record reaches the renderer saying it reads
  something other than the converted total, or carrying a mark already inside
  its own text.
- V2-b-f-mark-obs: No second mark is drawn: a figure of any other saying is
  drawn exactly as it was, with no detail box and no mark, and a mark that has
  reached a figure's own text is reported by the page-wide reading rather than
  hidden.
- V2-b-f-stack-cond: The local stack is down, or the seeded account of this
  value is missing.
- V2-b-f-stack-obs: The vector's one line reports a setup failure with nothing
  observed and no assertion failed, so a broken environment is never read as a
  red oracle.
- V2-o-observation: On a phone reading a seeded ledger of two rufiyaa sends,
  MVR10,000 at the rate 20 stored as $500 and MVR4,000 at the rate 20 stored as
  $200, and one send of $750, the sending list's footer reads on its rufiyaa
  line the label with its count, then the subtotal MVR14,000, and on the line
  under it the screen's own arrow mark → immediately before the figure that says
  it reads the converted total, $700.00; the dollar line reads $750.00 and the
  total line $1,450.00, each line carries its own count and cents, and the block
  carries the total line's count and cents.
- V2-o-stimulus: The bundle is built and served over the loopback origin, the
  owner signs in to the seeded account and taps the Statement tab, which shows
  the sending list with its footer under the rows; the rows are then scrolled to
  their end and the footer is read again.
- V2-o-expected: The expected readings are computed in the spec from the stored
  rows alone: the rufiyaa line's leaves are its label with the worded count,
  MVR14,000, the mark →, and $700.00 in that order; the mark is a leaf of its
  own and is inside no element that says what it reads; the figure saying it
  reads the converted total holds exactly $700.00; its box lies wholly below the
  subtotal's box inside the same line and no two leaf boxes of the footer
  overlap; the dollar line reads $750.00 and the total line $1,450.00; at a
  ledger holding nothing that line reads MVR0 and the mark with $0.00; and over
  a seeded spread of generated ledgers exactly one mark stands in the footer,
  immediately before the one converted figure, whose text is the dollar wording
  of the cents that ledger's rufiyaa sends store.
- V2-o-falsifier: The spec fails when the mark is missing, when it stands inside
  the converted figure's own text or inside any string the domain words, when it
  stands before a figure that says it reads anything else, when a second mark is
  drawn, when the converted total stays on the same line as the subtotal or its
  box overlaps another figure's, when a footer line loses its own figure, count
  or cents, or when a generated ledger reads a converted total that is not the
  dollar wording of its own rufiyaa sends.
- V2-ob-leaves: The ordered leaf readings of one footer line: for each leaf the
  text it reads, what it says it is a reading of when it says anything, and
  whether it is the mark.
- V2-ob-leaves-cd: It cannot tell the ink, the size, the weight or the gap of
  any leaf, nor which element draws it, nor where the line stands on the screen.
- V2-ob-boxes: Whether the detail's box lies wholly below the subtotal's box
  inside the same line, whether the three lines keep the order they are drawn
  in, and whether any two leaf boxes of the footer overlap.
- V2-ob-boxes-cd: It cannot tell how far below the detail stands, nor the
  heights, margins or padding that put it there, nor whether the line was
  reached by scrolling.
- V2-ob-mark-written: How many elements of the mounted page that say what they
  read carry the mark inside their own text, and how many string literals of the
  domain's statement module write that mark.
- V2-ob-mark-written-cd: It cannot tell which element or which literal is meant,
  nor how the mark is spoken aloud.
- V2-eq: Two renderings of the footer are the same in this value when no
  observation of this value tells them apart. Every ink, size, weight, gap and
  padding of the mark, of the detail and of the column it stands in lies outside
  that set, so two renderings differing only in one of them are equal here and
  no spec may separate them.
- V2-gen-domain: A ledger of this app written through its own seeding: sends and
  repayments, each send stored in rufiyaa with a rate greater than zero and the
  dollars it is worth, or in dollars, with amounts over the range this app
  stores, together with the ledger that holds nothing, the ledger with no
  rufiyaa send, the ledger with no dollar send and the ledger whose rufiyaa
  sends carry real laari.
- V2-gen-seed: A fixed seed of the spec drives the spread and is printed with
  any failure, so the failing ledger is replayed exactly; the spread is walked
  until one ledger disagrees and the smallest disagreeing ledger is reported.
- V2-case-empty: A ledger holding nothing at all, whose rufiyaa line reads MVR0
  and the mark with $0.00.
- V2-case-dollars-only: A ledger holding dollar sends only, whose rufiyaa line
  still reads its label, MVR0 and the mark with $0.00.
- V2-case-rufiyaa-only: A ledger holding rufiyaa sends only, whose dollar line
  reads $0.00 and whose rufiyaa line reads both of its figures.
- V2-case-laari: A ledger whose rufiyaa sends store laari that do not add up to
  whole rufiyaa, so the subtotal reads its laari while the converted total keeps
  two decimals.
- V2-law-mark-outside: The mark is never part of a figure: for every seeded
  ledger, no element of the page that says what it reads carries the mark inside
  its own text, the figure saying it reads the converted total reads exactly the
  dollar wording of the cents its line's rufiyaa sends store, and no string
  literal of the domain's statement module writes the mark.
- V2-law-mark-outside-reason: What a figure may say it reads is a closed set of
  four names and the ledgers that make those sayings appear are the seeded pair
  of rufiyaa sends, the ledger with both currencies and the ledger that holds
  nothing, so those three readings are the whole of the law's ground.
- V2-law-mark-only: For every generated ledger exactly one mark stands in the
  sending list's footer, it stands immediately before the one figure that says
  it reads the converted total, and the dollar line and the total line each hold
  their own single figure with no mark.
- V2-law-mark-only-io: The spec reads the stored ledger itself, computes from
  its rows which line holds the converted total and what that figure reads, and
  counts the marks it finds on the page against the one mark it expects, never
  against anything the screen computed.
- V2-law-mark-only-fals: A generated ledger whose footer holds no mark, holds
  two, holds one before the dollar or the total figure, or whose converted
  figure reads other than the dollar wording of that ledger's rufiyaa sends.
- V2-law-stacked: The converted total stands on a line of its own: the detail's
  box lies wholly below the subtotal's box inside the rufiyaa line, no two leaf
  boxes of the footer overlap, every leaf lies inside its own line's box, and
  the three lines keep the order they are drawn in.
- V2-law-stacked-reason: The arrangement is one boundary and not a domain: the
  pair of rufiyaa sends and the ledger whose subtotal carries laari, which is
  the longest figure this app words, are the whole of the law's ground.
- V2-law-lines-kept: For every generated ledger the footer still reads its three
  lines in their order, each with its own label, worded count, count and cents,
  and the block still carries the total line's count and cents: the mark adds a
  reading and removes none.
- V2-law-lines-kept-io: The spec builds the three lines it expects from the
  stored rows of the ledger alone, counting and summing each line from the
  stored currency of each send, and compares the drawn lines with them.
- V2-law-lines-kept-fals: A generated ledger whose footer reads fewer or more
  than three lines, loses a label, a count or a cents, or whose block no longer
  carries the total line's pair.
- V2-ref-mark-domain: The mark belongs inside the domain's own string for the
  converted total, because the domain words every figure the screen draws.
- V2-ref-mark-domain-cx: Every reading that checks a footer figure compares it
  with money summed from the stored rows; a mark inside that string makes the
  comparison fail on a mark rather than on money, and the figure would no longer
  be the wording of an amount. The mark is therefore the screen's own leaf
  beside the figure, and the domain's string stays the amount alone.
- V2-ref-leaf-order: The order of a line's leaves identifies its figures, so a
  reading takes the label first and the figures after it.
- V2-ref-leaf-order-cx: The mark is a leaf with no figure in it, so the leaf
  after the subtotal is the mark and not the converted total, and a reading
  bound to that order reads the mark as a figure. A figure is therefore found by
  what it says it reads, and the mark by being the leaf that says nothing.
- V2-x-mark: No figure of the sent footer can be drawn with the mark inside its
  own text, because the figure's text comes from the domain's figure record and
  the mark is a separate span the renderer appends beside it in the detail box.
- V2-x-mark-harm: A mark inside a money figure: the owner reads it as part of an
  amount, and every reading that checks that figure against the stored sends
  fails on the mark instead of telling the owner that the money disagrees.
- V2-x-mark-in: A footer figure record of a seeded ledger: the saying of what it
  reads, and the text the domain worded for it.
- V2-x-mark-obs: What the figure saying it reads the converted total reads on
  the page, and what stands immediately before it.
- V2-x-mark-bypass: The page is a public writable surface, so anything on it may
  put a mark inside a figure after it is drawn; and a figure record shaped by a
  cast at a boundary may carry a text with a mark already in it, which the
  checker that runs in the build rejects only on annotated paths.
- V2-cl-foot: The footer's converted line: the rufiyaa subtotal, the screen's
  own mark, and the converted total standing under the subtotal.
- V2-cl-foot-safety: No reading of the page can find the mark inside a figure of
  the footer, and no footer figure but the converted total has a mark before it.
- V2-cl-foot-inhab: The seeded pair of rufiyaa sends is summed and worded by the
  domain, drawn by the footer figure renderer, and read on the page as MVR14,000
  with the mark and $700.00 under it.
- V2-cl-foot-reach: That reading is reached through the served page at the
  loopback origin, the one port a phone and a spec both use, after a tap on the
  Statement tab.
- V2-cl-foot-liveness: The footer is drawn in one synchronous pass from the read
  outcome, with no queue, no retry and no waiting party, so there is no progress
  claim to state about it.
- V2-cl-foot-runtime: Not yet observed: the mark and the detail box are not in
  the committed source, and the value's own spec has made no run.
- V2-cl-foot-assume: It rests on the domain keeping the saying of what each
  figure reads, on the footer figure renderer staying the single writer of the
  footer's drawn parts, and on the stylesheet keeping the rufiyaa line's figures
  box a column.
- V2-unknown-wrap: Whether a rufiyaa subtotal long enough to wrap inside its
  column still reads to the owner as one figure, and whether the mark spoken
  aloud between the two figures is wanted there.
- V2-risk-owner: The owner's own phone check of the footer, which is where this
  value's look and its reading aloud are judged.
- V2-adr-context: The footer of the sending list reads the rufiyaa subtotal and
  the dollars those rufiyaa were worth. The two stood side by side, which read
  as two figures of the same line, and the converted figure is now wanted under
  the subtotal with an arrow before it. The arrow could be worded by the domain,
  drawn by the screen, or made a reading of its own, and three existing readings
  compare the whole text of the footer block.
- V2-adr-decision: Draw the arrow as the screen's own leaf inside a detail box,
  from the saying the figure already carries, and stand that box under the
  subtotal by drawing the rufiyaa line's figures box as a column. Keep the
  domain's string the amount alone, keep every existing hook and saying, and
  migrate the four readings that read the footer's figures or its whole text so
  each finds a figure by what it says it reads.
- V2-adr-alt-domain-string: Word the arrow inside the domain's converted total.
  Rejected: the figure every reading compares with stored money would then carry
  a mark, and the domain would be wording the screen's furniture.
- V2-adr-alt-same-line: Keep the converted total beside the subtotal and only
  add the arrow between them. Rejected: the two figures read as two amounts of
  one line, which is what the second line exists to part.
- V2-adr-alt-new-hook: Give the converted total a new reading hook of its own
  and find the mark by it. Rejected: the figure already says what it reads, and
  a second name for the same thing gives a reader two ways to find one figure.
- V2-adr-con-migrations: Four acceptance readings are migrated in this value and
  two are checked and left as they are; a migrated reading binds to what a
  figure says it reads, which is what leaves the mark's size, ink and place free
  to be judged on the phone.
- V2-adr-con-zero: The mark stands at every ledger, so the empty footer reads
  MVR0 with the mark and $0.00; the readings of an empty ledger say so.
- V2-adr-con-stacking: The second line is observed as boxes, not as a size: the
  detail lying wholly below the subtotal with nothing overlapping is the whole
  of what a spec may assert about the arrangement.

### Targets (Value 2)

| Path | Decision | Reason |
|---|---|---|
| `src/ui/statement.ts` | EXTEND | V2-t-statement |
| `src/ui/theme.css` | EXTEND | V2-t-theme |

### Paradigm (Value 2)

functional

### Decisions (Value 2)

V2-d-arrow-span, V2-d-arrow-every-ledger, V2-d-line-under,
V2-d-reading-binds-saying, V2-d-migrations, V2-d-mark-read-aloud,
V2-d-algebra-domain, V2-d-algebra-application, V2-d-algebra-adapter,
V2-d-algebra-infrastructure, V2-d-carriers, V2-d-substrate, V2-d-pbt,
V2-d-checkers, V2-d-waiver, V2-d-closure, V2-d-stress-empty,
V2-d-stress-long-figure, V2-d-stress-whole-text-reader, V2-d-stress-domain-mark,
V2-d-stress-failed-read, V2-d-stress-stack-down, V2-d-spof, V2-d-bypasses,
V2-d-second-walk, V2-d-states, V2-d-self-falsification, V2-d-arch-check,
F-d-hooks, F-d-paradigm-owners, F-d-waiver, F-d-substrate,
F-d-design-values-travel

### Oracle (Value 2)

tests/acceptance/statement-sent-footer-converted.spec.ts

### Acceptance supports (Value 2)

```json
[
  "tests/support/oracle-observation.mjs",
  "tests/support/accounts.ts",
  "tests/support/local-stack.ts"
]
```

### Oracle verification index (Value 2)

```json
0
```

### Purpose (Value 2)

V2-purpose

### Constraints (Value 2)

F-c-no-design-values, F-c-invented-figures, F-c-src-uncommitted,
F-c-prototype-reference, F-c-oracle-vector, F-c-one-playwright-run,
F-c-rate-guaranteed, F-c-viewport, F-c-no-new-dependency, F-c-phone-stop,
V2-c-figures, V2-c-bounds, V2-c-empty-ledger, V2-c-no-domain-mark

### Inherits (Value 2)

L-foot-arrow, O-foot-converted, C-render-statement

### Boundaries (Value 2)

```json
{
  "driving_port": {
    "ref": "V2-b-driving"
  },
  "driven_ports": [
    {
      "ref": "V2-b-driven-ledger"
    },
    {
      "ref": "V2-b-driven-style"
    }
  ],
  "dependency_direction": {
    "ref": "V2-b-direction"
  },
  "failures": [
    {
      "condition": {
        "ref": "V2-b-f-read-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "V2-b-f-read-obs"
      }
    },
    {
      "condition": {
        "ref": "V2-b-f-mark-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "V2-b-f-mark-obs"
      }
    },
    {
      "condition": {
        "ref": "V2-b-f-stack-cond"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "V2-b-f-stack-obs"
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
    "ref": "V2-o-observation"
  },
  "stimulus": {
    "ref": "V2-o-stimulus"
  },
  "expected": {
    "ref": "V2-o-expected"
  },
  "falsifier": {
    "ref": "V2-o-falsifier"
  }
}
```

### Architectural tests (Value 2)

```json
{
  "obligations": [
    {
      "id": "AT-v2-mark-ssot",
      "obligation": {
        "ref": "V2-at-mark-ssot"
      },
      "oracle": "tests/acceptance/statement-sent-footer-converted.spec.ts",
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
    "ref": "V2-ct-na"
  },
  "applicability": "not_applicable"
}
```

### Prefactoring (Value 2)

```json
{
  "reason": {
    "ref": "V2-pf-na"
  },
  "applicability": "not_applicable"
}
```

### Agreement analysis (Value 2)

| Id | Contract | Role | Locator | Decision | Reason |
|---|---|---|---|---|---|
| V2-P-foot-figure | the sent footer's drawn figures and the mark beside the converted total | producer | `src/ui/statement.ts:378` | MIGRATED | V2-ag-p-foot-figure |
| V2-P-domain-figure | what each sent footer figure is a reading of, and the words it reads in | producer | `src/domain/statement.ts:156` | UNCHANGED_COMPATIBLE | V2-ag-p-domain |
| V2-C-footer-leaves | the sent footer's drawn figures and the mark beside the converted total | consumer | `tests/acceptance/statement-sent-footer.spec.ts:218` | MIGRATED | V2-a-footer-leaves |
| V2-C-sent-foot-text | the sent footer's drawn figures and the mark beside the converted total | consumer | `tests/acceptance/statement-sent.spec.ts:241` | MIGRATED | V2-a-sent-foot-text |
| V2-C-lists-foot-text | the sent footer's drawn figures and the mark beside the converted total | consumer | `tests/acceptance/statement-lists.spec.ts:246` | MIGRATED | V2-a-lists-foot-text |
| V2-C-columns-foot-text | the sent footer's drawn figures and the mark beside the converted total | consumer | `tests/acceptance/statement-sent-columns.spec.ts:265` | MIGRATED | V2-a-columns-foot-text |
| V2-C-back-lines | the sent footer's drawn figures and the mark beside the converted total | consumer | `tests/acceptance/statement-back-columns.spec.ts:584` | UNCHANGED_COMPATIBLE | V2-a-back-lines |
| V2-C-motion-foot | the sent footer's drawn figures and the mark beside the converted total | consumer | `tests/acceptance/statement-motion.spec.ts:259` | UNCHANGED_COMPATIBLE | V2-a-motion-foot |

### Reuse analysis (Value 2)

| Symbol | Locator | Decision | Reason |
|---|---|---|---|
| renderFootFigure | `src/ui/statement.ts:378` | EXTEND | V2-r-foot-figure-renderer |
| renderFootLine | `src/ui/statement.ts:390` | REUSE | V2-r-foot-line |
| renderSentFoot | `src/ui/statement.ts:409` | REUSE | V2-r-sent-foot |
| cell | `src/ui/statement.ts:181` | REUSE | V2-r-cell |
| element | `src/ui/statement.ts:171` | REUSE | V2-r-element |
| SentFootReading | `src/domain/statement.ts:153` | REUSE | V2-r-saying |
| SentFootFigure | `src/domain/statement.ts:156` | REUSE | V2-r-domain-figure |
| the converted figure of the rufiyaa footer line | `src/domain/statement.ts:391` | REUSE | V2-r-converted-total |
| .statement-foot-figure[data-reads='converted'] | `src/ui/theme.css:2657` | EXTEND | V2-r-converted-ink |
| .statement-foot-line | `src/ui/theme.css:2637` | EXTEND | V2-r-foot-line-style |
| leavesOf | `tests/acceptance/statement-sent-footer.spec.ts:574` | REUSE | V2-r-leaf-reading |
| generatedLedgers | `tests/acceptance/statement-sent-footer.spec.ts:1162` | REUSE | V2-r-generator |

### Impact closure (Value 2)

```json
{
  "items": [
    {
      "kind": "public_interface",
      "locator": "src/ui/statement.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "V2-ic-statement"
      }
    },
    {
      "kind": "runtime",
      "locator": "src/ui/theme.css",
      "decision": "CHANGED",
      "reason": {
        "ref": "V2-ic-theme"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-footer.spec.ts:218",
      "decision": "MIGRATED",
      "reason": {
        "ref": "V2-a-footer-leaves"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:241",
      "decision": "MIGRATED",
      "reason": {
        "ref": "V2-a-sent-foot-text"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:246",
      "decision": "MIGRATED",
      "reason": {
        "ref": "V2-a-lists-foot-text"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:265",
      "decision": "MIGRATED",
      "reason": {
        "ref": "V2-a-columns-foot-text"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-back-columns.spec.ts:584",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V2-a-back-lines"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-motion.spec.ts:259",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V2-a-motion-foot"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Adr (Value 2)

```json
{
  "context": {
    "ref": "V2-adr-context"
  },
  "decision": {
    "ref": "V2-adr-decision"
  },
  "alternatives": [
    {
      "ref": "V2-adr-alt-domain-string"
    },
    {
      "ref": "V2-adr-alt-same-line"
    },
    {
      "ref": "V2-adr-alt-new-hook"
    }
  ],
  "consequences": [
    {
      "ref": "V2-adr-con-migrations"
    },
    {
      "ref": "V2-adr-con-zero"
    },
    {
      "ref": "V2-adr-con-stacking"
    }
  ],
  "status": "proposed",
  "applicability": "applicable"
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
              "id": "O-v2-foot-leaves",
              "description": {
                "ref": "V2-ob-leaves"
              },
              "result_type": "ordered list of readings, each a text with the name of what it reads or none",
              "cannot_distinguish": {
                "ref": "V2-ob-leaves-cd"
              }
            },
            {
              "id": "O-v2-foot-boxes",
              "description": {
                "ref": "V2-ob-boxes"
              },
              "result_type": "three booleans",
              "cannot_distinguish": {
                "ref": "V2-ob-boxes-cd"
              }
            },
            {
              "id": "O-v2-mark-written",
              "description": {
                "ref": "V2-ob-mark-written"
              },
              "result_type": "two non-negative integers",
              "cannot_distinguish": {
                "ref": "V2-ob-mark-written-cd"
              }
            }
          ],
          "equality": {
            "under": [
              "O-v2-foot-leaves",
              "O-v2-foot-boxes",
              "O-v2-mark-written",
              "O-foot-converted"
            ],
            "definition": {
              "ref": "V2-eq"
            }
          },
          "constructors": [
            {
              "id": "C-v2-foot-figure",
              "signature": "renderFootFigure(figure: SentFootFigure): HTMLElement"
            },
            {
              "id": "C-v2-foot-line",
              "signature": "renderFootLine(line: SentFootLine): HTMLElement"
            }
          ],
          "generators": [
            {
              "id": "G-v2-ledger",
              "domain": {
                "ref": "V2-gen-domain"
              },
              "size_bound": 12,
              "seed_policy": {
                "ref": "V2-gen-seed"
              },
              "must_include": [
                {
                  "ref": "V2-case-empty"
                },
                {
                  "ref": "V2-case-dollars-only"
                },
                {
                  "ref": "V2-case-rufiyaa-only"
                },
                {
                  "ref": "V2-case-laari"
                }
              ],
              "depth_bound": null
            }
          ],
          "laws": [
            {
              "id": "L-v2-mark-outside",
              "statement": {
                "ref": "V2-law-mark-outside"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::renderFootFigure",
              "uses": [
                "C-v2-foot-figure",
                "C-render-statement",
                "O-v2-foot-leaves",
                "O-v2-mark-written",
                "O-foot-converted"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "F-case-two-mvr-sends"
                  },
                  {
                    "ref": "F-case-both-sends"
                  },
                  {
                    "ref": "V2-case-empty"
                  }
                ],
                "reason": {
                  "ref": "V2-law-mark-outside-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-v2-mark-only",
              "statement": {
                "ref": "V2-law-mark-only"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::renderFootFigure",
              "uses": [
                "C-v2-foot-figure",
                "C-render-statement",
                "O-v2-foot-leaves"
              ],
              "treatment": {
                "generator": "G-v2-ledger",
                "independent_observation": {
                  "ref": "V2-law-mark-only-io"
                },
                "falsifier": {
                  "description": {
                    "ref": "V2-law-mark-only-fals"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-v2-stacked",
              "statement": {
                "ref": "V2-law-stacked"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/theme.css",
              "uses": [
                "C-v2-foot-line",
                "O-v2-foot-boxes"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "F-case-two-mvr-sends"
                  },
                  {
                    "ref": "V2-case-laari"
                  }
                ],
                "reason": {
                  "ref": "V2-law-stacked-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L-v2-lines-kept",
              "statement": {
                "ref": "V2-law-lines-kept"
              },
              "kind": "invariant",
              "layer": "application",
              "owner": "src/ui/statement.ts::renderSentFoot",
              "uses": [
                "C-v2-foot-line",
                "C-render-statement",
                "O-v2-foot-leaves"
              ],
              "treatment": {
                "generator": "G-v2-ledger",
                "independent_observation": {
                  "ref": "V2-law-lines-kept-io"
                },
                "falsifier": {
                  "description": {
                    "ref": "V2-law-lines-kept-fals"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            }
          ],
          "refuted": [
            {
              "id": "R-v2-mark-domain",
              "statement": {
                "ref": "V2-ref-mark-domain"
              },
              "cause": "carrier",
              "counterexample": {
                "ref": "V2-ref-mark-domain-cx"
              },
              "run": null
            },
            {
              "id": "R-v2-leaf-order",
              "statement": {
                "ref": "V2-ref-leaf-order"
              },
              "cause": "carrier",
              "counterexample": {
                "ref": "V2-ref-leaf-order-cx"
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
      "scope": "value:2",
      "status": {
        "payload": {
          "claims": [
            {
              "id": "X-v2-mark",
              "proposition": {
                "ref": "V2-x-mark"
              },
              "harm": {
                "ref": "V2-x-mark-harm"
              },
              "owner": "src/ui/statement.ts::renderFootFigure",
              "admitted_input": {
                "ref": "V2-x-mark-in"
              },
              "constructor": "src/ui/statement.ts:378",
              "consumer": "src/ui/statement.ts:396",
              "public_observation": {
                "ref": "V2-x-mark-obs"
              },
              "bypass": [
                {
                  "ref": "V2-x-mark-bypass"
                }
              ],
              "strength": "gradual_checker"
            }
          ],
          "admitted": [
            {
              "ref": "F-case-two-mvr-sends"
            },
            {
              "ref": "F-case-both-sends"
            },
            {
              "ref": "V2-case-empty"
            },
            {
              "ref": "V2-case-dollars-only"
            },
            {
              "ref": "V2-case-laari"
            }
          ],
          "excluded": [
            {
              "ref": "V2-x-mark"
            },
            {
              "ref": "V2-law-mark-only"
            },
            {
              "ref": "V2-law-stacked"
            }
          ],
          "unknown": [
            {
              "state": {
                "ref": "V2-unknown-wrap"
              },
              "risk_owner": {
                "ref": "V2-risk-owner"
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
          "ref": "V2-model-na"
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
                "ref": "V2-cl-foot"
              },
              "safety": {
                "statement": {
                  "ref": "V2-cl-foot-safety"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V2-cl-foot-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V2-cl-foot-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-v2-mark-outside",
                  "L-v2-mark-only"
                ],
                "basis": {
                  "claims": [
                    "X-v2-mark"
                  ],
                  "tag": "constructed"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "V2-cl-foot-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V2-cl-foot-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V2-cl-foot-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-foot-arrow",
                  "L-v2-lines-kept"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "F-case-two-mvr-sends"
                  },
                  "producer": "src/ui/statement.ts::renderFootFigure",
                  "consumer": "tests/acceptance/statement-sent-footer-converted.spec.ts",
                  "public_observation": {
                    "ref": "V2-o-observation"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "V2-cl-foot-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V2-cl-foot-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-c-viewport"
                  }
                ],
                "runs": [],
                "laws": [
                  "L-v2-stacked"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "F-case-both-sends"
                  },
                  "producer": "src/ui/statement.ts::renderSentFoot",
                  "consumer": "tests/acceptance/statement-sent-footer-converted.spec.ts",
                  "public_observation": {
                    "ref": "V2-o-expected"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "reason": {
                  "ref": "V2-cl-foot-liveness"
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
          "ref": "V2-scenarios-na"
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
node tests/support/oracle-observation.mjs tests/acceptance/statement-sent-footer-converted.spec.ts
```

Verification command:

```sh
node tests/support/oracle-observation.mjs tests/acceptance/statement-sent-footer.spec.ts
```

Verification command:

```sh
npm run build
```

Verification command:

```sh
npm run test:acceptance
```

## Value 6

### Facts (Value 6)

- V6-purpose: Pin the You and Abbaas card and the Entries heading on the Entries
  screen and let only the entries list scroll, in the one box a reading finds by
  the Entries scroll hook, with the page itself still unscrollable and the last
  entry reachable clear of the Send and Receive buttons.
- V6-c-pinned: On Entries the You and Abbaas card and the Entries heading keep
  their boxes while the list scrolls, and the page itself never scrolls: the
  screen is exactly the pane's height and everything that scrolls is a box
  inside it.
- V6-c-clearance: With the list scrolled to its end the last entry stands wholly
  clear of the Send and Receive buttons and wholly inside the box that scrolls.
  No spec asserts this yet; this value asserts it as a containment of boxes,
  with no pixel count in it.
- V6-c-list-bound: The observation needs a seeded ledger with more entries than
  fit a 360 by 780 phone; the spec chooses that count itself and seeds it. The
  design states no upper bound on the number of entries and adds none. A ledger
  with fewer entries than fit the screen makes the pinned-place law vacuous and
  is read as such, never as a pass.
- V6-c-statement-pane-kept: Only the Entries screen's own scrolling is narrowed.
  The rule that makes the screen inside a pane the one scroller stays for the
  Statement pane, so no reading of the Statement's own lists changes in this
  value.
- V6-t-home: The Entries area's one builder returns the box that scrolls and
  carries the Entries scroll hook on it; its single caller and the order of the
  card, the heading, the area, the fade and the buttons stay as they are.
- V6-t-theme: The stylesheet gives the Entries screen inside its pane a clipped
  column that holds the pane's height, gives the box below the pinned parts the
  remaining room and the vertical scroll, and moves the room for the bottom
  buttons to the end of that box.
- V6-d-delta: This value's delta: the Entries area is returned wrapped in one
  box that carries the Entries scroll hook, the Entries screen inside its pane
  becomes a clipped column of the pane's height, the box below the card and the
  heading takes the remaining room and the vertical scroll, and the room for the
  bottom buttons moves from the screen's own padding to the end of that box.
  Nothing of the Statement, the bottom bar or the swipe is touched.
- V6-d-algebra-domain: Domain layer. States: a ledger of entries, read as a
  count and as day groups. Operations: the grouping of entries by day.
  Observations: how many rows the screen lists. Laws a test can check: wrapping
  the area in a box changes no count and no group, so the pane lists one row per
  stored entry before and after the list is scrolled.
- V6-d-algebra-application: Application and port layer. States: the Entries pane
  shown or aside, and the scroll place of the box that scrolls. Operations: the
  mounting of the Entries screen, a scroll of that box, a switch away and back.
  Observations: the scroll place the box reports. Laws a test can check: the
  place the owner scrolled to is kept by that box across a switch away and back,
  because the screen is kept and not repainted, and no scroll place is held by
  the screen itself.
- V6-d-algebra-adapter: Adapter layer, the DOM the page offers a reader. States:
  the mounted Entries pane for a seeded ledger. Operations: the builders of the
  balance card, the heading, the area and the buttons. Observations: which boxes
  have content taller than themselves, which of them carries the Entries scroll
  hook, and the boxes of the card, the heading, the last entry and the buttons.
  Laws a test can check: exactly one box of the pane has content taller than
  itself and it is the hooked one; the card's and the heading's boxes are the
  same before and after the list is scrolled to its end; the last entry's box
  lies wholly above the buttons' box and wholly inside the scrolling box.
- V6-d-algebra-infrastructure: Infrastructure and recovery layer. States: the
  local stack up or down, the seeded account present or absent, the page laid
  out or not yet. Operations: the acceptance vector's own install, the stack
  reset each spec makes, the scroll of the hooked box. Observations: the
  vector's one line, with what it observed, what failed on an assertion and what
  failed before any assertion. Laws a test can check: a run that could not reach
  its cases reports a setup failure and no assertion failure; a reading
  attempted before the pane has a height is not made at all, the spec waiting
  for the hooked box to report content taller than itself first.
- V6-d-carriers: The typed carriers of this value and their owners. Decisions:
  no decision of this value is typed, because it is a stylesheet rule and the
  shape of one element; the Entries area builder owns that element and its hook
  in src/ui/home.ts, and the stylesheet owns the clipped column and the one
  scrolling box in src/ui/theme.css. Effects: the DOM writes of
  renderEntriesArea and of renderHome. Errors: none is raised, because an empty
  ledger simply has nothing to scroll. Per-process state: the scroll place,
  which is the browser's own on the hooked box and is held in no variable of
  this code.
- V6-d-checkers: Claim to checker for this value. Its two claims, that no two
  boxes of the pane scroll at once and that the last entry stands clear of the
  buttons, are one synchronous rendering and a comparison of two readings of it:
  no concurrency, no interleaving and no temporal operator, so a Quint state
  model of them would hold a single step and would discriminate nothing the
  finite cases do not, and no proof obligation needs Agda. They are carried by
  the laws of this scope, read on the mounted page. No claim of this value rests
  on the shared release model.
- V6-d-waiver: No formal checker answers on this host: neither Quint, TLC,
  Apalache nor Agda is installed. The owner's standing waiver of the formal
  checkers for this screen work, recorded in the repository's own working
  agreement, is the authority for continuing without them. Any claim of this
  value that would need one stays INDETERMINATE with its DESIGN axis BLOCKED,
  and nothing of this value is offered as a proof in their place; the shared
  release model's two claims stay INDETERMINATE.
- V6-d-typesafety: Type strength of this value, at the strength of the checker
  this repository actually runs. The build's type checker sees only that the
  area builder returns an element; it cannot see that the element scrolls, that
  it carries the hook or that it holds the remaining room, because those are a
  stylesheet rule and a string attribute. Both claims are therefore
  runtime-boundary claims read on the mounted page: the exclusion is that one
  builder is the single writer of that box, and a reading of the whole pane is
  what falsifies it. No invalid state of this value is made unrepresentable by a
  type.
- V6-d-pbt: Property treatment of this value. The input that matters is whether
  the seeded list is longer or shorter than the screen, which is a closed
  boundary of two sides and not a broad domain, so the laws are stated as finite
  cases and no generator is written: a generated count of entries would buy no
  case the two sides do not already hold, and every case costs a seeded
  database. The one broad law of the batch belongs to the pure swipe rule and
  not here, and no property library is pinned.
- V6-d-closure-summary: Constructive closure of this value. Safety: PASS by
  construction for both subjects, the single scrolling box and the clearance of
  the last entry. Inhabitation: PASS for both, each with a seeded long ledger as
  the admitted input, the area builder as the producer, this value's own spec as
  the consumer and a reading of the mounted page as the observation. Public
  reachability: PASS for both, each reached through the served page at the
  loopback origin. Liveness: not applicable to either, because the scrolling is
  the browser's own and this value queues, defers and retries nothing. Runtime:
  DESIGNED_NOT_BUILT everywhere, because the wrapping box is in the owner's
  prototype, which is not applied, and its hook does not exist yet.
- V6-d-stress-screen-scroll: Stressor, negating the assumption that the screen
  inside the Entries pane no longer scrolls: a later rule, or the rule it still
  inherits, leaves that screen its own vertical scroll. Preserved observation:
  the card and the heading keep their boxes while the list scrolls. Allowed
  degradation: none. Forbidden outcome: two boxes of the pane scrolling at once,
  so a scroll started on a card carries the pinned parts off the top. Residue:
  the Entries screen inside the pane is clipped on both axes and holds the
  pane's height, the law is stated over every box of the pane, and the spec
  counts the boxes that overflow rather than taking the first one it meets.
- V6-d-stress-short-list: Stressor, negating the assumption that the seeded list
  is longer than the screen: the ledger fits the phone. Preserved observation:
  nothing scrolls and nothing moves. Allowed degradation: the pinned-place law
  is vacuous. Forbidden outcome: a vacuous reading reported as a pass of that
  law. Residue: the spec seeds more entries than fit the phone and, if even they
  leave the hooked box without overflow, reports a setup failure with nothing
  observed; the short list is kept as its own case, where the law that still
  bites is that no box of the pane scrolls.
- V6-d-stress-empty: Stressor, negating the assumption that the ledger holds
  entries at all: the owner has none. Preserved observation: the empty hint is
  read and the card and the heading keep their boxes. Allowed degradation: the
  hooked box is there and scrolls nothing. Forbidden outcome: an empty screen
  whose hint is cut off by the clipped column, or a hooked box that squeezes the
  hint out of sight. Residue: the hint stays a child of the screen above the
  box, the box takes the remaining room and may hold nothing, and the empty
  ledger is one of this value's checked cases.
- V6-d-stress-save-growth: Stressor, negating the assumption that the list does
  not change while the screen is mounted: the owner saves an entry while the box
  is scrolled. Preserved observation: the new card is inside the hooked box, the
  card and the heading still keep their boxes, and the owner's place is not
  thrown away. Allowed degradation: the box's own scroll place may move by what
  the browser does when content is inserted above the view. Forbidden outcome:
  the entrance or save motion drawn outside the scrolling box, or the whole
  screen repainted so the place is lost. Residue: the area keeps its one builder
  and its horizontal clip, so a saved card and its ring are drawn inside the box
  that scrolls, and the save motion is left exactly as it is.
- V6-d-stress-switch-place: Stressor, negating the assumption that the owner's
  scroll place is held by the screen: the pane is moved aside to the Statement
  and back. Preserved observation: the entries come back at the place the owner
  left. Allowed degradation: none. Forbidden outcome: a place read from the
  screen, which no longer scrolls, and therefore read as none. Residue: the
  place lives on the hooked box, and the four existing readings that leave and
  read back that place are migrated to that box by its hook rather than by
  finding the first box that overflows.
- V6-d-second-walk: A second set of stressors, not used to derive this design,
  walked against it. One entry taller than the phone: the law counts boxes and
  not entries, so the hooked box is still the only one that overflows and the
  clearance is then measured on that single entry; it showed the law is stated
  at the right unit and the tall-group case is kept. The address bar retracting,
  which changes the dynamic viewport: the column holds the pane's height, so the
  box lays out again and the pinned parts keep their place, and both readings
  are taken once the layout has settled; it showed the readings must be made at
  rest, which the vector's own waiting already does. A sideways drag inside the
  box: the area keeps its horizontal clip and the box hides its own horizontal
  overflow, so the page's no-sideways-scroll invariant is untouched; it showed
  that existing invariant needs no edit. A page read aloud: the wrapping box has
  no name and no role, so the card, the heading and the entries are still read
  in the same order; it showed the wrapper must stay silent, carrying the hook
  alone.
- V6-d-spof: Single points of failure and construction bypasses of this value.
  The clipped column is one rule in one stylesheet: a later selector that gives
  the Entries screen its scroll back takes the pinned place away again, and the
  obligation to keep that rule stays with the stylesheet's owner. The Entries
  scroll hook is a plain string attribute: anything on the page can copy it onto
  a second element, and the obligation to write it only in the area builder
  stays with that module's owner. The room for the buttons is a padding at the
  end of the scrolling box: a rule that drops it puts the last entry under them,
  and only this value's own reading catches that. The observation rests on one
  local stack and one seeded account; when either is absent nothing about the
  product is observed and the vector says so as a setup failure.
- V6-d-bypasses: What this design cannot stop. The DOM is a public writable
  surface: any writer can add a scrolling box inside the pane or remove the
  hook, so the claim is checked by a reading of the whole mounted pane and never
  by a type. A stylesheet is checked by no checker this repository runs, so a
  rule that contradicts the column is caught only by that same reading. A
  foreign process that stops the stack, and a browser that refuses the session,
  end the observation rather than falsify the product, and the vector keeps them
  apart from an assertion failure.
- V6-d-states: Admitted, excluded and unknown states of this value. Admitted: a
  seeded ledger longer than the phone; one shorter than it, where the
  pinned-place law is vacuous; an empty ledger, where the hooked box scrolls
  nothing; a list that grows by a save while the box is scrolled; a list of one
  day group taller than the phone. Excluded: two boxes of the Entries pane
  scrolling at once; the Entries screen itself scrolling inside its pane; the
  card or the heading moving while the list scrolls; the page itself scrolling;
  the last entry left under the Send and Receive buttons. Unknown, with the
  owner's phone check as their risk owner: whether a phone browser's own
  overscroll and address-bar behaviour keeps the pinned parts as still as this
  repository's own Chromium does, and whether the momentum of a real finger
  stops where the padding leaves the last entry.
- V6-d-self-falsification: Two laws this value refutes rather than keeps. A
  screen that may keep its own scroll while its parts are pinned: with both the
  screen and the inner box scrollable the pane has two scrollers, a scroll
  started on a card moves the screen and carries the pinned parts off the top,
  and a reading that looks for the box that scrolls finds the screen; the screen
  inside the pane is therefore clipped and holds the pane's height. A room for
  the buttons that may stay the screen's own bottom padding: on a clipped column
  that padding lies below the content box and not at the end of the box that
  scrolls, so the end of the scroll puts the last entry under the buttons; the
  padding therefore moves to the scrolling box.
- V6-d-px-free: How this value's two new readings stay free of design values.
  The pinned place is read as the equality of the card's and the heading's boxes
  between two scroll positions, never as a distance from the top of the screen.
  The clearance is read as the last entry's box lying wholly above the buttons'
  box and wholly inside the scrolling box, never as a number of pixels between
  them. Both hold for any approved spacing, so the design values of the batch
  stay free to move and the equality of this value deliberately cannot tell two
  renderings apart that differ only in one of them.
- V6-d-arch-law: The architectural law of this value is checked over the whole
  Entries pane and not over the list a case happens to read: every box of the
  pane is counted, the one that overflows must be the hooked one, and the screen
  inside the pane must not be among them. The same reading is made for the long
  ledger and for the empty one, so a box added inside the pane later is caught
  by the count rather than missed by a selector.
- V6-r-entries-area: The Entries area has exactly one builder and exactly one
  caller, at src/ui/home.ts:735, so the box that scrolls and its hook land in
  one place and every existing reading of a card keeps working through it.
- V6-r-render-home: The single caller is reused unchanged: the order of the
  balance card, the heading, the area, the fade and the buttons is what makes
  the card and the heading the pinned parts, and nothing of the empty-ledger or
  saved-entry paths moves.
- V6-r-entries-header: The heading's builder is reused exactly as it is: it
  stays a child of the screen above the scrolling box, which is what keeps it in
  place.
- V6-r-fade: The fade is reused as it is: it is fixed over the foot of the
  screen and takes no taps, so it still covers the entries behind the buttons
  when the box, rather than the screen, is what scrolls.
- V6-r-bottom-bar: The bottom buttons are reused as they are: they are fixed, so
  their box is a stable thing to read the last entry's clearance against, and
  that clearance is a comparison of their box with the entry's.
- V6-r-entries-area-css: The area keeps its horizontal clip and its spine: the
  scrolling box becomes its parent, so a travelling card is still cut at the
  list's own edge and no frame of an entrance can scroll the page sideways.
- V6-r-pane-screen-css: The rule that makes the screen inside a pane the one
  scroller is extended rather than replaced: a rule of its own narrows it for
  the Entries screen, and the Statement pane keeps it, so no reading of the
  Statement's lists changes.
- V6-r-screen-padding-css: The room for the bottom buttons stays a padding, but
  of the box that scrolls instead of the clipped column; the screen rule keeps
  that padding for every screen that still scrolls itself.
- V6-r-oracle-vector: The observation vector already runs the pinned runner,
  installs what is missing and prints the one line this value's oracle needs, so
  it is reused unchanged.
- V6-a-p-entries-area: The producer of the Entries pane's scrolling box. It is
  migrated: the area is returned wrapped in one box that scrolls and that
  carries the hook a reading finds it by.
- V6-a-p-home-column: The producer of the Entries screen's own column inside its
  pane. It is migrated: the screen is clipped and holds the pane's height, the
  box below the pinned parts takes the remaining room and the vertical scroll,
  and the room for the buttons moves to the end of that box.
- V6-a-c-motion-set: This reading finds the scroller of the Entries pane as the
  first box inside it whose content is taller than itself and leaves a scroll
  place in it. The pane now has an inner box that scrolls, so the reading is
  migrated to the hooked box, which is the one the design names.
- V6-a-c-motion-read: This reading reads the scroll place back from the first
  box of the pane whose content is taller than itself, to show that Home was
  kept and not repainted. It is migrated to the same hooked box, so the place is
  read where it is now held.
- V6-a-c-sent-set: This reading takes the pane and every box inside it, keeps
  those whose content is taller than themselves and scrolls the first of them,
  on the stated ground that Home's pane is the only scrolling area of its
  screen. That ground is gone, so the reading is migrated to the hooked box.
- V6-a-c-sent-read: This reading reads that place back after a switch away and
  back, from the same list of overflowing boxes. It is migrated to the hooked
  box.
- V6-a-c-ring-clipper: This reading finds the ancestor that clips a card
  horizontally by its computed overflow and asserts the card lies inside it. The
  area keeps that clip and the new box is a further ancestor of the same cards,
  so the invariant holds unchanged and the reading needs no edit.
- V6-a-c-no-h-scroll: This reading asserts that nothing escapes the viewport and
  that the page does not scroll sideways. The scrolling box hides its own
  horizontal overflow and the area keeps its clip, so the invariant holds
  unchanged.
- V6-a-c-page-scroll: This reading records, frame by frame, that the page itself
  neither scrolls nor has anything to scroll. The screen is still exactly the
  pane's height and everything that scrolls is a box inside it, so the invariant
  holds unchanged.
- V6-a-c-bottom-clearance: This reading asserts the Send and Receive buttons are
  never cut off by the bottom of the screen. The buttons are fixed and this
  value does not move them, so the reading holds unchanged; what this value adds
  is the entry's clearance from them, not theirs from the screen.
- V6-a-c-empty-pane: This reading measures the buttons inside Home's own pane on
  an empty ledger. The pane keeps its box and the buttons keep their place, so
  the reading holds unchanged; on an empty ledger the hooked box simply scrolls
  nothing.
- V6-ic-home: The Entries screen's module is changed: its area builder returns
  the box that scrolls and carries the Entries scroll hook.
- V6-ic-theme: The stylesheet is changed: the Entries screen inside its pane
  becomes a clipped column, the box below the pinned parts takes the remaining
  room and the vertical scroll, and the room for the bottom buttons moves to the
  end of that box.
- V6-b-driving: The driving port is the mounted page of the built bundle, served
  over the loopback origin and read on a 360 by 780 phone: the Entries pane is
  read, its boxes are measured, and the box that scrolls is scrolled to its end
  as a finger would scroll it.
- V6-b-driven-ledger: The driven ledger store: the local Supabase stack the spec
  brings up, resets and seeds with more invented entries than fit the phone.
  Nothing of this value writes to it.
- V6-b-driven-scroll: The driven scrolling: the browser's own vertical scroll of
  the one box that overflows, with its momentum and its overscroll, neither of
  which this value times or drives.
- V6-b-driven-style: The driven stylesheet: the column that clips the Entries
  screen inside its pane, the remaining room and the vertical scroll it gives
  the box below the pinned parts, and the room that box keeps at its end for the
  bottom buttons.
- V6-b-direction: Dependencies point inward. The Entries screen imports the
  domain's projections and the motion owner, and neither imports the screen. The
  stylesheet is loaded by the shell and imports nothing. This value's spec
  imports only the public page and the existing acceptance supports. The
  decision about what scrolls lives in the one area builder and in the
  stylesheet, never in a handler or a spec.
- V6-b-f-short-cond: The seeded ledger is short enough to fit the phone, so no
  box of the Entries pane has content taller than itself.
- V6-b-f-short-obs: Nothing is observed about the pinned parts: the spec reports
  a setup failure with nothing observed rather than a pass, and the only law it
  still reads is that no box of the pane scrolls.
- V6-b-f-layout-cond: A reading is attempted before the pane has been laid out,
  so every box reports a content height equal to its own.
- V6-b-f-layout-obs: No reading is made: the spec waits for the hooked box to
  report content taller than itself before it measures, so an unlaid-out page is
  never read as a pinned-place failure.
- V6-b-f-second-box-cond: A second box inside the Entries pane has content
  taller than itself.
- V6-b-f-second-box-obs: The reading counts the overflowing boxes of the whole
  pane and fails naming them, rather than taking the first one and reporting a
  pass.
- V6-b-f-stack-cond: The local stack this value's spec brings up is down, or the
  invented account whose long ledger it seeds is missing.
- V6-b-f-stack-obs: No reading of the Entries pane is made: the vector's one
  line reports a setup failure with nothing observed, so a broken environment is
  never read as a failed pinned-place assertion.
- V6-o-observation: On a phone reading a seeded ledger of more entries than fit
  the screen, the Entries screen keeps the You and Abbaas card and the Entries
  heading in their boxes while the one box carrying the Entries scroll hook
  scrolls the list to its end, the page itself has nothing to scroll, and the
  last entry stands wholly above the Send and Receive buttons and wholly inside
  that box.
- V6-o-stimulus: The bundle is built and served over the loopback origin, the
  owner signs in to the seeded account, reads Entries, and scrolls the box that
  scrolls to its end.
- V6-o-expected: The expected readings are computed in the spec from the mounted
  pane alone: exactly one box inside the pane has content taller than itself and
  it is the hooked one, the Entries screen not being among them; the card's and
  the heading's boxes are identical before and after the scroll; the page stands
  at its top with nothing to scroll; and the last entry's box bottom lies above
  the top of the buttons' box, with the entry's whole box inside the scrolling
  box's own box. Every comparison is of boxes, never of pixel counts.
- V6-o-falsifier: The spec fails when the Entries pane has no box that scrolls
  or more than one, when that box is not the hooked one, when the Entries screen
  itself scrolls, when the card or the heading moves while the list scrolls,
  when the page itself can scroll, or when the last entry overlaps the Send and
  Receive buttons or lies outside the box that scrolls.
- V6-at-one-scroller: The single-scroller law of the Entries pane is falsified
  over the whole pane, not over the list a case happens to read: every box of
  the pane is counted, exactly one has content taller than itself, that one
  carries the Entries scroll hook, and the Entries screen inside the pane is not
  among them. The same count is made for the long ledger and for the empty one,
  so a box added inside the pane later is caught by it.
- V6-ct-na: Producer and consumer live in one deployable and change in the same
  candidate: the Entries area builder, the stylesheet, and the specs that read
  the mounted pane. Nothing of this value is persisted, sent over a wire or
  released on another schedule, so this value's own oracle covers the agreement
  and no separate contract test is needed.
- V6-pf-na: No preserving move is made before the behaviour changes. The whole
  source change arrives as the owner's approved prototype, applied in one step
  at the start of the first value's craft, and the four existing readings of
  Home's scroll place that this value changes are themselves amended here, so
  none of them is a green baseline a move could be measured against.
- V6-adr-context: Home today scrolls as a whole: the screen inside its pane is
  the one thing that scrolls, so the two balance boxes and the Entries heading
  travel away with the list. The owner approved a screen where those stay and
  only the list moves, and the room the list keeps for the two fixed buttons has
  to travel with whatever scrolls, because the last entry must stay reachable
  clear of them.
- V6-adr-decision: Make the Entries screen inside its pane a clipped column of
  the pane's height whose parts keep their own height, wrap the Entries area in
  one box that takes the remaining room and the vertical scroll, carry the
  Entries scroll hook on that box, and move the room for the bottom buttons from
  the screen's own padding to the end of that box. The Statement pane keeps the
  rule that makes its screen the scroller.
- V6-adr-alt-sticky: Keep the screen as the one scroller and pin the card and
  the heading with the browser's own sticky positioning. Rejected: the pinned
  parts then stay in the scrolled flow, so the entries pass behind them and each
  needs an opaque ground of its own, the heading's own place depends on how far
  the list has travelled, and the law could no longer be stated as the exclusion
  that only one box of the pane can scroll.
- V6-adr-alt-two-screens: Split Home into a fixed head and a scrolling body as
  two screens inside the pane. Rejected: the pane then holds two screens, every
  existing reading of Home's one screen breaks, and the entrance and save
  motions, which draw the spine and the cards of one screen, would have to be
  split with it.
- V6-adr-alt-keep-padding: Leave the room for the bottom buttons as the screen's
  own bottom padding. Rejected: on a clipped column that padding lies below the
  content box and not at the end of the box that scrolls, so the end of the
  scroll leaves the last entry under the buttons.
- V6-adr-con-place: The owner's scroll place now lives on the hooked box rather
  than on the screen, so the four existing readings that leave a place and read
  it back are migrated to that box by its hook; two of them are in the
  switch-and-return readings of the motion spec and two in the sent spec.
- V6-adr-con-invariant: The clearance of the last entry from the Send and
  Receive buttons becomes an asserted invariant for the first time, read as a
  containment of boxes, so it holds for any approved spacing and no design value
  enters a spec.
- V6-adr-con-statement: Only Home's rule is narrowed: the Statement pane keeps
  the screen-scrolls rule, so the Statement's own list readings and its footers
  are untouched by this value.
- V6-ob-scroll-count: How many boxes inside the Entries pane have content taller
  than themselves, whether the one that does carries the Entries scroll hook,
  and whether the Entries screen is among them.
- V6-ob-scroll-count-cd: It cannot tell by how much the content is taller, how
  far the box has been scrolled, nor the padding the box keeps at its end.
- V6-ob-pinned: The boxes of the balance card and of the Entries heading, read
  before the list is scrolled and again with it scrolled to its end.
- V6-ob-pinned-cd: It cannot tell the gap between them, their inks, their sizes,
  nor how long the scroll took.
- V6-ob-clearance: Whether the last entry's box, with the list scrolled to its
  end, lies wholly above the box of the Send and Receive buttons and wholly
  inside the box that scrolls.
- V6-ob-clearance-cd: It cannot tell the clearance as a distance, which is
  deliberately unread, nor the fade drawn over the foot of the screen.
- V6-ob-page-scroll: Whether the page itself has anything to scroll, and whether
  it stands at its top, while the entries list is scrolled.
- V6-ob-page-scroll-cd: It cannot tell which box took the scroll, nor how far
  that box travelled.
- V6-ob-entry-count: How many entry rows the Entries pane lists, and how many
  day groups it lists them in.
- V6-ob-entry-count-cd: It cannot tell their order, their text, nor their place
  on the screen.
- V6-eq: Two states of this value are the same when no observation of this value
  tells them apart: the count of overflowing boxes with the hook they carry, the
  boxes of the card and the heading at two scroll positions, the clearance of
  the last entry read as a containment of boxes, the page's own scroll, and the
  rows and groups listed. Every gap, padding, size, radius, colour and duration
  of this value lies outside that set, so two renderings that differ only in one
  of them are equal here and no spec may separate them.
- V6-case-long: A ledger holding more entries than fit a 360 by 780 phone, so
  the Entries list must scroll.
- V6-case-short: A ledger holding fewer entries than fit the phone, so no box of
  the Entries pane overflows.
- V6-case-empty: A ledger holding no entries at all, so the Entries screen reads
  its empty hint.
- V6-case-one-tall: A ledger whose entries all fall on one day, so the list is a
  single group taller than the phone.
- V6-law-one-scroller: Inside the Entries pane exactly one box has content
  taller than itself, that box is the one carrying the Entries scroll hook, and
  the Entries screen inside the pane is not among the boxes that overflow.
- V6-law-one-scroller-reason: The pane holds one list, so the whole ground of
  the law is a ledger longer than the phone, one shorter than it and an empty
  one: a wider ledger adds no new kind of box to the pane, and the count is
  taken over every box of it.
- V6-law-pinned: With the list scrolled to its end, the box of the balance card
  and the box of the Entries heading stand exactly where they stood before the
  scroll.
- V6-law-pinned-reason: The law bites only when something scrolls, so its whole
  ground is the ledger longer than the phone; on a shorter one it is vacuous,
  which is why the long list is the seeded one.
- V6-law-clearance: With the list scrolled to its end, the last entry's box lies
  wholly above the box of the Send and Receive buttons and wholly inside the box
  that scrolls, read as a containment of boxes and never as a number of pixels.
- V6-law-clearance-reason: The ground of the law is the end of a scroll, so a
  ledger longer than the phone and one whose entries all fall on a single day
  are the whole of it: the second makes the last entry the foot of one tall
  group rather than of many.
- V6-law-page-still: The page itself has nothing to scroll and stands at its top
  while the entries list is scrolled to its end.
- V6-law-page-still-reason: The page's own scroll is one state of the shell, so
  the longest seeded ledger is the whole of the law's ground: if that one does
  not make the page scrollable, no ledger does.
- V6-law-rows-kept: The Entries pane lists one row for each stored entry, in the
  same day groups, before and after the list is scrolled, so the box that now
  holds them loses and doubles nothing.
- V6-law-rows-kept-reason: Wrapping is either lossless or not, so a ledger
  longer than the phone and an empty one are the whole of the law's ground.
- V6-ref-screen-scroll: The Entries screen may keep its own vertical scroll
  inside the pane while the card and the heading are pinned.
- V6-ref-screen-scroll-cx: With both the screen and the inner box scrollable the
  pane has two scrollers: a scroll started on a card moves the screen and
  carries the pinned parts off the top, and a reading that looks for the box
  that scrolls finds the screen. The screen inside the pane is therefore clipped
  and holds the pane's height.
- V6-ref-padding: The room the list keeps for the bottom buttons may stay the
  screen's own bottom padding once the list scrolls in a box of its own.
- V6-ref-padding-cx: On a clipped column that padding lies below the content box
  and not at the end of the box that scrolls, so the end of the scroll puts the
  last entry under the buttons. The padding therefore belongs to the scrolling
  box.
- V6-x-one-scroller: The Entries pane cannot present two scrolling boxes at
  once, because the screen inside it is clipped on both axes and holds the
  pane's height, so only the one flexible box below the pinned parts can
  overflow.
- V6-x-one-scroller-harm: The card and the heading scroll away, the owner loses
  the two figures they read first, and a reading that looks for the box that
  scrolls finds whichever one it meets, so the screen the owner knows is not the
  screen a spec judges.
- V6-x-one-scroller-in: A seeded ledger longer than the phone, mounted as the
  Entries screen inside its pane.
- V6-x-one-scroller-obs: How many boxes of the pane overflow, and which of them
  carries the hook, read on the mounted page.
- V6-x-one-scroller-bypass1: Anything on the page can add a box with a scroll of
  its own inside the pane, or copy the hook onto a second element; no type can
  stop either, which is why the count is read over the whole pane.
- V6-x-one-scroller-bypass2: A stylesheet is checked by no checker this
  repository runs, so a later selector that gives the screen its scroll back is
  caught only by that same reading of the page.
- V6-x-clearance: The last entry cannot be left under the Send and Receive
  buttons, because the room for them is a padding at the end of the box that
  scrolls, so the box's own end stops above them.
- V6-x-clearance-harm: The owner's last entry is unreachable behind the two
  buttons, and no reading says so.
- V6-x-clearance-in: A seeded ledger longer than the phone, scrolled to the end
  of the hooked box.
- V6-x-clearance-obs: Whether the last entry's box lies above the buttons' box
  and inside the scrolling box, read on the mounted page.
- V6-x-clearance-bypass: A rule that drops or shrinks the padding at the end of
  the box puts the entry back under the buttons, and nothing but a reading of
  the mounted page catches it.
- V6-x-hook: The hook that names the Entries pane's scrolling box cannot be
  written twice by this code, because exactly one builder creates that box and
  exactly one caller appends it.
- V6-x-hook-harm: Two hooked boxes leave a reading to choose between them, and a
  spec then judges whichever it met first.
- V6-x-hook-in: A mounted Entries screen for any seeded ledger.
- V6-x-hook-obs: How many elements of the Entries pane carry the Entries scroll
  hook, read on the mounted page.
- V6-x-hook-bypass: The DOM is writable: another writer on the page can put the
  attribute on an element this module never built.
- V6-ex-two-scrollers: Two boxes of the Entries pane scrolling at once.
- V6-ex-screen-scrolls: The Entries screen itself scrolling inside its pane.
- V6-ex-pinned-moves: The balance card or the Entries heading moving while the
  list is scrolled.
- V6-ex-page-scrolls: The page itself scrolling while the entries list is
  scrolled.
- V6-ex-entry-hidden: The last entry left under the Send and Receive buttons at
  the end of the scroll.
- V6-u-state: Unknown: whether a phone browser's own overscroll and address-bar
  behaviour keeps the pinned parts as still as this repository's own Chromium
  does, and whether the momentum of a real finger stops where the padding leaves
  the last entry.
- V6-u-risk-owner: The owner's own phone check, made against the look approved
  on the prototype before anything is landed, is the risk owner of that unknown.
- V6-cl-pinned: The Entries pane's one scrolling box, with the You and Abbaas
  card and the Entries heading keeping their places above it.
- V6-cl-pinned-safety: Two boxes of the Entries pane cannot scroll at once: the
  screen inside the pane is clipped on both axes and holds the pane's height,
  and the one box below the pinned parts takes the remaining room.
- V6-cl-pinned-inhab: A seeded ledger longer than the phone is drawn as the
  Entries area inside the hooked box, which scrolls to its end while the card
  and the heading keep their boxes.
- V6-cl-pinned-reach: That reading is reached through the served page at the
  loopback origin, by scrolling the hooked box as a finger would.
- V6-cl-pinned-liveness: Scrolling is the browser's own, and this value queues,
  defers and retries nothing, so there is no progress claim to state about it.
- V6-cl-pinned-runtime: Nothing is observed yet: the wrapping box is in the
  owner's prototype, which is not applied, its hook does not exist, and the
  clipped column is not in the committed stylesheet.
- V6-cl-pinned-assume: It rests on the Entries screen inside the pane keeping
  the pane's height and its clip, on the hook being written only by the area
  builder, and on no later rule giving the screen its scroll back.
- V6-cl-clearance: The last entry of a long ledger, reachable clear of the Send
  and Receive buttons.
- V6-cl-clearance-safety: The last entry cannot end under the buttons: the room
  for them is a padding at the end of the box that scrolls, so the end of the
  scroll leaves the entry above them whatever the approved spacings are.
- V6-cl-clearance-inhab: A seeded ledger longer than the phone, scrolled to its
  end, is read with the last entry's box wholly above the buttons' box and
  wholly inside the scrolling box.
- V6-cl-clearance-reach: That reading is reached through the served page, where
  the buttons are fixed over the foot of the pane and the hooked box is scrolled
  to its end.
- V6-cl-clearance-liveness: The reading is made once the scroll has come to rest
  and nothing waits on anything else, so there is no progress claim to state
  about it.
- V6-cl-clearance-runtime: Nothing is observed yet: the padding at the end of
  the scrolling box is in the owner's prototype, which is not applied, and no
  spec has read this clearance before.
- V6-cl-clearance-assume: It rests on the room for the buttons being kept at the
  end of the scrolling box, on the buttons staying fixed over the foot of the
  pane, and on the reading being made at rest.
- V6-model-na: No model file is delivered. No claim of this value was selected
  for a checker, because its claims are one synchronous rendering and a
  comparison of two readings of it, and in any case neither Quint, TLC, Apalache
  nor Agda is installed on this host, where the owner's standing waiver is the
  recorded authority for continuing. The algebraic model of this value is
  delivered as the laws of this scope.
- V6-scenarios-na: A scenario of this scope is read from the trace of an
  executed model run, and no model was executed or delivered. The behaviour this
  value promises is stated by its laws and read by its own spec.

### Targets (Value 6)

| Path | Decision | Reason |
|---|---|---|
| `src/ui/home.ts` | EXTEND | V6-t-home |
| `src/ui/theme.css` | EXTEND | V6-t-theme |

### Paradigm (Value 6)

functional

### Decisions (Value 6)

V6-d-delta, V6-d-algebra-domain, V6-d-algebra-application, V6-d-algebra-adapter,
V6-d-algebra-infrastructure, V6-d-carriers, V6-d-checkers, V6-d-waiver,
V6-d-typesafety, V6-d-pbt, V6-d-closure-summary, V6-d-stress-screen-scroll,
V6-d-stress-short-list, V6-d-stress-empty, V6-d-stress-save-growth,
V6-d-stress-switch-place, V6-d-second-walk, V6-d-spof, V6-d-bypasses,
V6-d-states, V6-d-self-falsification, V6-d-px-free, V6-d-arch-law, F-d-hooks,
F-d-paradigm-owners, F-d-substrate, F-d-design-values-travel, F-d-arch-check,
F-d-waiver

### Oracle (Value 6)

tests/acceptance/entries-pinned.spec.ts

### Acceptance supports (Value 6)

```json
[
  "tests/support/oracle-observation.mjs",
  "tests/support/accounts.ts",
  "tests/support/local-stack.ts"
]
```

### Oracle verification index (Value 6)

```json
0
```

### Purpose (Value 6)

V6-purpose

### Constraints (Value 6)

V6-c-pinned, V6-c-clearance, V6-c-list-bound, V6-c-statement-pane-kept,
F-c-no-design-values, F-c-invented-figures, F-c-src-uncommitted,
F-c-prototype-reference, F-c-oracle-vector, F-c-one-playwright-run,
F-c-viewport, F-c-no-new-dependency, F-c-phone-stop

### Inherits (Value 6)

None

### Boundaries (Value 6)

```json
{
  "driving_port": {
    "ref": "V6-b-driving"
  },
  "driven_ports": [
    {
      "ref": "V6-b-driven-ledger"
    },
    {
      "ref": "V6-b-driven-scroll"
    },
    {
      "ref": "V6-b-driven-style"
    }
  ],
  "dependency_direction": {
    "ref": "V6-b-direction"
  },
  "failures": [
    {
      "condition": {
        "ref": "V6-b-f-short-cond"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "V6-b-f-short-obs"
      }
    },
    {
      "condition": {
        "ref": "V6-b-f-layout-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "V6-b-f-layout-obs"
      }
    },
    {
      "condition": {
        "ref": "V6-b-f-second-box-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "V6-b-f-second-box-obs"
      }
    },
    {
      "condition": {
        "ref": "V6-b-f-stack-cond"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "V6-b-f-stack-obs"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Public oracle (Value 6)

```json
{
  "observation": {
    "ref": "V6-o-observation"
  },
  "stimulus": {
    "ref": "V6-o-stimulus"
  },
  "expected": {
    "ref": "V6-o-expected"
  },
  "falsifier": {
    "ref": "V6-o-falsifier"
  }
}
```

### Architectural tests (Value 6)

```json
{
  "obligations": [
    {
      "id": "V6-AT-one-scroller",
      "obligation": {
        "ref": "V6-at-one-scroller"
      },
      "oracle": "tests/acceptance/entries-pinned.spec.ts",
      "verification_index": 0
    }
  ],
  "applicability": "applicable"
}
```

### Contract tests (Value 6)

```json
{
  "reason": {
    "ref": "V6-ct-na"
  },
  "applicability": "not_applicable"
}
```

### Prefactoring (Value 6)

```json
{
  "reason": {
    "ref": "V6-pf-na"
  },
  "applicability": "not_applicable"
}
```

### Agreement analysis (Value 6)

| Id | Contract | Role | Locator | Decision | Reason |
|---|---|---|---|---|---|
| V6-P-entries-area | the Entries pane's scrolling box and its hook | producer | `src/ui/home.ts:465` | MIGRATED | V6-a-p-entries-area |
| V6-P-home-column | the Entries screen's column inside its pane | producer | `src/ui/theme.css:182` | MIGRATED | V6-a-p-home-column |
| V6-C-motion-set | the Entries pane's scrolling box and its hook | consumer | `tests/acceptance/statement-motion.spec.ts:1491` | MIGRATED | V6-a-c-motion-set |
| V6-C-motion-read | the Entries pane's scrolling box and its hook | consumer | `tests/acceptance/statement-motion.spec.ts:1541` | MIGRATED | V6-a-c-motion-read |
| V6-C-sent-set | the Entries pane's scrolling box and its hook | consumer | `tests/acceptance/statement-sent.spec.ts:1109` | MIGRATED | V6-a-c-sent-set |
| V6-C-sent-read | the Entries pane's scrolling box and its hook | consumer | `tests/acceptance/statement-sent.spec.ts:1131` | MIGRATED | V6-a-c-sent-read |
| V6-C-ring-clipper | the Entries pane's scrolling box and its hook | consumer | `tests/acceptance/motion.spec.ts:510` | UNCHANGED_COMPATIBLE | V6-a-c-ring-clipper |
| V6-C-no-h-scroll | the Entries screen's column inside its pane | consumer | `tests/acceptance/layout-and-install.spec.ts:149` | UNCHANGED_COMPATIBLE | V6-a-c-no-h-scroll |
| V6-C-page-scroll | the Entries screen's column inside its pane | consumer | `tests/acceptance/statement-motion.spec.ts:383` | UNCHANGED_COMPATIBLE | V6-a-c-page-scroll |
| V6-C-bottom-clearance | the Entries screen's column inside its pane | consumer | `tests/acceptance/layout-and-install.spec.ts:153` | UNCHANGED_COMPATIBLE | V6-a-c-bottom-clearance |
| V6-C-empty-pane | the Entries screen's column inside its pane | consumer | `tests/acceptance/empty-home.spec.ts:126` | UNCHANGED_COMPATIBLE | V6-a-c-empty-pane |

### Reuse analysis (Value 6)

| Symbol | Locator | Decision | Reason |
|---|---|---|---|
| renderEntriesArea | `src/ui/home.ts:465` | EXTEND | V6-r-entries-area |
| renderHome | `src/ui/home.ts:697` | REUSE | V6-r-render-home |
| renderEntriesHeader | `src/ui/home.ts:428` | REUSE | V6-r-entries-header |
| renderFade | `src/ui/home.ts:450` | REUSE | V6-r-fade |
| renderBottomBar | `src/ui/home.ts:515` | REUSE | V6-r-bottom-bar |
| .entries-area, the area's own rule with its horizontal clip and spine | `src/ui/theme.css:496` | REUSE | V6-r-entries-area-css |
| .pane > .screen, the rule that makes the screen inside a pane the one scroller | `src/ui/theme.css:182` | EXTEND | V6-r-pane-screen-css |
| .screen, the room it keeps at its foot for the bottom buttons | `src/ui/theme.css:96` | EXTEND | V6-r-screen-padding-css |
| observe | `tests/support/oracle-observation.mjs:39` | REUSE | V6-r-oracle-vector |

### Impact closure (Value 6)

```json
{
  "items": [
    {
      "kind": "public_interface",
      "locator": "src/ui/home.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "V6-ic-home"
      }
    },
    {
      "kind": "runtime",
      "locator": "src/ui/theme.css",
      "decision": "CHANGED",
      "reason": {
        "ref": "V6-ic-theme"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-motion.spec.ts:1491",
      "decision": "MIGRATED",
      "reason": {
        "ref": "V6-a-c-motion-set"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-motion.spec.ts:1541",
      "decision": "MIGRATED",
      "reason": {
        "ref": "V6-a-c-motion-read"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:1109",
      "decision": "MIGRATED",
      "reason": {
        "ref": "V6-a-c-sent-set"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:1131",
      "decision": "MIGRATED",
      "reason": {
        "ref": "V6-a-c-sent-read"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/motion.spec.ts:510",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V6-a-c-ring-clipper"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/layout-and-install.spec.ts:149",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V6-a-c-no-h-scroll"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-motion.spec.ts:383",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V6-a-c-page-scroll"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/layout-and-install.spec.ts:153",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V6-a-c-bottom-clearance"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/empty-home.spec.ts:126",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V6-a-c-empty-pane"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Adr (Value 6)

```json
{
  "context": {
    "ref": "V6-adr-context"
  },
  "decision": {
    "ref": "V6-adr-decision"
  },
  "alternatives": [
    {
      "ref": "V6-adr-alt-sticky"
    },
    {
      "ref": "V6-adr-alt-two-screens"
    },
    {
      "ref": "V6-adr-alt-keep-padding"
    }
  ],
  "consequences": [
    {
      "ref": "V6-adr-con-place"
    },
    {
      "ref": "V6-adr-con-invariant"
    },
    {
      "ref": "V6-adr-con-statement"
    }
  ],
  "status": "proposed",
  "applicability": "applicable"
}
```

### Architect handoff (Value 6)

```json
{
  "sections": [
    {
      "kind": "laws",
      "scope": "value:6",
      "status": {
        "payload": {
          "observations": [
            {
              "id": "V6-O-scroll-count",
              "description": {
                "ref": "V6-ob-scroll-count"
              },
              "result_type": "a count, with the hook and the screen as two booleans",
              "cannot_distinguish": {
                "ref": "V6-ob-scroll-count-cd"
              }
            },
            {
              "id": "V6-O-pinned",
              "description": {
                "ref": "V6-ob-pinned"
              },
              "result_type": "two pairs of boxes",
              "cannot_distinguish": {
                "ref": "V6-ob-pinned-cd"
              }
            },
            {
              "id": "V6-O-clearance",
              "description": {
                "ref": "V6-ob-clearance"
              },
              "result_type": "two booleans",
              "cannot_distinguish": {
                "ref": "V6-ob-clearance-cd"
              }
            },
            {
              "id": "V6-O-page-scroll",
              "description": {
                "ref": "V6-ob-page-scroll"
              },
              "result_type": "a boolean and a scroll place",
              "cannot_distinguish": {
                "ref": "V6-ob-page-scroll-cd"
              }
            },
            {
              "id": "V6-O-entry-count",
              "description": {
                "ref": "V6-ob-entry-count"
              },
              "result_type": "two non-negative integers",
              "cannot_distinguish": {
                "ref": "V6-ob-entry-count-cd"
              }
            }
          ],
          "equality": {
            "under": [
              "V6-O-scroll-count",
              "V6-O-pinned",
              "V6-O-clearance",
              "V6-O-page-scroll",
              "V6-O-entry-count"
            ],
            "definition": {
              "ref": "V6-eq"
            }
          },
          "constructors": [
            {
              "id": "V6-C-entries-scroll",
              "signature": "renderEntriesArea(list: HTMLElement): HTMLElement, returning div.entries-scroll[data-entries-scroll] wrapping div.entries-area"
            },
            {
              "id": "V6-C-render-home",
              "signature": "renderHome(ledger: ReadEntriesOutcome, saved?: JustSaved, opening = false): HTMLElement"
            }
          ],
          "generators": [],
          "laws": [
            {
              "id": "V6-L-one-scroller",
              "statement": {
                "ref": "V6-law-one-scroller"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/home.ts::renderEntriesArea",
              "uses": [
                "V6-C-entries-scroll",
                "V6-O-scroll-count"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V6-case-long"
                  },
                  {
                    "ref": "V6-case-short"
                  },
                  {
                    "ref": "V6-case-empty"
                  }
                ],
                "reason": {
                  "ref": "V6-law-one-scroller-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "V6-L-pinned",
              "statement": {
                "ref": "V6-law-pinned"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/theme.css",
              "uses": [
                "V6-C-render-home",
                "V6-O-pinned"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V6-case-long"
                  }
                ],
                "reason": {
                  "ref": "V6-law-pinned-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "V6-L-clearance",
              "statement": {
                "ref": "V6-law-clearance"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/theme.css",
              "uses": [
                "V6-C-render-home",
                "V6-O-clearance"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V6-case-long"
                  },
                  {
                    "ref": "V6-case-one-tall"
                  }
                ],
                "reason": {
                  "ref": "V6-law-clearance-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "V6-L-page-still",
              "statement": {
                "ref": "V6-law-page-still"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/theme.css",
              "uses": [
                "V6-C-render-home",
                "V6-O-page-scroll"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V6-case-long"
                  }
                ],
                "reason": {
                  "ref": "V6-law-page-still-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "V6-L-rows-kept",
              "statement": {
                "ref": "V6-law-rows-kept"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/home.ts::renderEntriesArea",
              "uses": [
                "V6-C-entries-scroll",
                "V6-O-entry-count"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V6-case-long"
                  },
                  {
                    "ref": "V6-case-empty"
                  }
                ],
                "reason": {
                  "ref": "V6-law-rows-kept-reason"
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
              "id": "V6-R-screen-scroll",
              "statement": {
                "ref": "V6-ref-screen-scroll"
              },
              "cause": "carrier",
              "counterexample": {
                "ref": "V6-ref-screen-scroll-cx"
              },
              "run": null
            },
            {
              "id": "V6-R-padding",
              "statement": {
                "ref": "V6-ref-padding"
              },
              "cause": "carrier",
              "counterexample": {
                "ref": "V6-ref-padding-cx"
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
      "scope": "value:6",
      "status": {
        "payload": {
          "claims": [
            {
              "id": "V6-X-one-scroller",
              "proposition": {
                "ref": "V6-x-one-scroller"
              },
              "harm": {
                "ref": "V6-x-one-scroller-harm"
              },
              "owner": "src/ui/theme.css",
              "admitted_input": {
                "ref": "V6-x-one-scroller-in"
              },
              "constructor": "src/ui/home.ts::renderEntriesArea",
              "consumer": "src/ui/home.ts:735",
              "public_observation": {
                "ref": "V6-x-one-scroller-obs"
              },
              "bypass": [
                {
                  "ref": "V6-x-one-scroller-bypass1"
                },
                {
                  "ref": "V6-x-one-scroller-bypass2"
                }
              ],
              "strength": "runtime_boundary"
            },
            {
              "id": "V6-X-clearance",
              "proposition": {
                "ref": "V6-x-clearance"
              },
              "harm": {
                "ref": "V6-x-clearance-harm"
              },
              "owner": "src/ui/theme.css",
              "admitted_input": {
                "ref": "V6-x-clearance-in"
              },
              "constructor": "src/ui/home.ts::renderEntriesArea",
              "consumer": "src/ui/home.ts:735",
              "public_observation": {
                "ref": "V6-x-clearance-obs"
              },
              "bypass": [
                {
                  "ref": "V6-x-clearance-bypass"
                }
              ],
              "strength": "runtime_boundary"
            },
            {
              "id": "V6-X-hook",
              "proposition": {
                "ref": "V6-x-hook"
              },
              "harm": {
                "ref": "V6-x-hook-harm"
              },
              "owner": "src/ui/home.ts::renderEntriesArea",
              "admitted_input": {
                "ref": "V6-x-hook-in"
              },
              "constructor": "src/ui/home.ts::renderEntriesArea",
              "consumer": "src/ui/home.ts:735",
              "public_observation": {
                "ref": "V6-x-hook-obs"
              },
              "bypass": [
                {
                  "ref": "V6-x-hook-bypass"
                }
              ],
              "strength": "centralised"
            }
          ],
          "admitted": [
            {
              "ref": "V6-case-long"
            },
            {
              "ref": "V6-case-short"
            },
            {
              "ref": "V6-case-empty"
            },
            {
              "ref": "V6-case-one-tall"
            }
          ],
          "excluded": [
            {
              "ref": "V6-ex-two-scrollers"
            },
            {
              "ref": "V6-ex-screen-scrolls"
            },
            {
              "ref": "V6-ex-pinned-moves"
            },
            {
              "ref": "V6-ex-page-scrolls"
            },
            {
              "ref": "V6-ex-entry-hidden"
            }
          ],
          "unknown": [
            {
              "state": {
                "ref": "V6-u-state"
              },
              "risk_owner": {
                "ref": "V6-u-risk-owner"
              }
            }
          ]
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "model",
      "scope": "value:6",
      "status": {
        "reason": {
          "ref": "V6-model-na"
        },
        "tag": "not_applicable"
      }
    },
    {
      "kind": "closure",
      "scope": "value:6",
      "status": {
        "payload": {
          "closures": [
            {
              "subject": {
                "ref": "V6-cl-pinned"
              },
              "safety": {
                "statement": {
                  "ref": "V6-cl-pinned-safety"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V6-cl-pinned-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V6-cl-pinned-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "V6-L-one-scroller",
                  "V6-L-pinned"
                ],
                "basis": {
                  "claims": [
                    "V6-X-one-scroller",
                    "V6-X-hook"
                  ],
                  "tag": "constructed"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "V6-cl-pinned-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V6-cl-pinned-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V6-cl-pinned-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "V6-L-one-scroller",
                  "V6-L-rows-kept"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "V6-case-long"
                  },
                  "producer": "src/ui/home.ts::renderEntriesArea",
                  "consumer": "tests/acceptance/entries-pinned.spec.ts",
                  "public_observation": {
                    "ref": "V6-ob-scroll-count"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "V6-cl-pinned-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V6-cl-pinned-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V6-c-list-bound"
                  }
                ],
                "runs": [],
                "laws": [
                  "V6-L-pinned",
                  "V6-L-page-still"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "V6-case-long"
                  },
                  "producer": "src/ui/home.ts::renderHome",
                  "consumer": "tests/acceptance/entries-pinned.spec.ts",
                  "public_observation": {
                    "ref": "V6-o-observation"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "reason": {
                  "ref": "V6-cl-pinned-liveness"
                },
                "tag": "not_applicable"
              }
            },
            {
              "subject": {
                "ref": "V6-cl-clearance"
              },
              "safety": {
                "statement": {
                  "ref": "V6-cl-clearance-safety"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V6-cl-clearance-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V6-cl-clearance-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "V6-L-clearance"
                ],
                "basis": {
                  "claims": [
                    "V6-X-clearance"
                  ],
                  "tag": "constructed"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "V6-cl-clearance-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V6-cl-clearance-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V6-cl-clearance-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "V6-L-clearance"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "V6-x-clearance-in"
                  },
                  "producer": "src/ui/theme.css",
                  "consumer": "tests/acceptance/entries-pinned.spec.ts",
                  "public_observation": {
                    "ref": "V6-ob-clearance"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "V6-cl-clearance-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V6-cl-clearance-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V6-c-clearance"
                  }
                ],
                "runs": [],
                "laws": [
                  "V6-L-clearance"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "V6-case-one-tall"
                  },
                  "producer": "src/ui/home.ts::renderHome",
                  "consumer": "tests/acceptance/entries-pinned.spec.ts",
                  "public_observation": {
                    "ref": "V6-o-observation"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "reason": {
                  "ref": "V6-cl-clearance-liveness"
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
      "scope": "value:6",
      "status": {
        "reason": {
          "ref": "V6-scenarios-na"
        },
        "tag": "not_applicable"
      }
    }
  ]
}
```

### Product change (Value 6)

Product change: required

### Verification (Value 6)

Verification command:

```sh
node tests/support/oracle-observation.mjs tests/acceptance/entries-pinned.spec.ts
```

Verification command:

```sh
npm run build
```

Verification command:

```sh
npm run test:unit
```

Verification command:

```sh
npm run test:acceptance
```

## Value 1

### Facts (Value 1)

- F1-purpose: Carry the owner's approved reading of the Statement's sent
  currency columns into the source: a rufiyaa send's rufiyaa cell reads its
  figure and, under it, the rate, the mark the screen draws and the dollars that
  send stores on a hook of their own; that row's dollar cell reads nothing while
  still saying it is a converted reading; and a dollar send's rufiyaa cell reads
  nothing at all, with no mark standing in its place.
- F1-c-input-bounds: The bounds this value's readings rest on: a send stores its
  rufiyaa as whole laari and its dollars as whole cents, and a rufiyaa send
  stores a rate greater than zero with up to four decimals. The authority states
  no upper bound on a stored figure, and the widest reading a spec seeds is
  99,999 rufiyaa at a two-character rate. This value narrows no bound and widens
  none: it changes where the stored readings stand, never what may be stored.
- F1-c-absence-has-no-mark: Absence in a money column is carried by the empty
  cell alone: no mark, dash, bracket or zero stands where a currency cell has no
  figure to read, and no element says that such a cell is empty.
- F1-t-statement: The screen module owns both currency cells of a sent row. Its
  rufiyaa cell renderer draws the figure and, in one further reading of its own,
  the rate, the mark and the stored dollars, and draws nothing at all for a
  dollar send; the reading that words the dollar cell answers an empty text for
  a rufiyaa send; the element that reads the stored dollars carries the
  converted hook; the constant that drew the em dash and the placeholder hook
  are gone, and the hook list at the head of the module is amended to match.
- F1-t-theme: The stylesheet carries the design values of this cell, the figure
  on its own line with the rate, the mark and the stored dollars under it, and
  loses the style that greyed the removed mark, which nothing draws any more.
- F1-d-cells: The delta of this value. A rufiyaa send's rufiyaa cell holds three
  readings, each found by its own hook: the figure, the rate and the stored
  dollars, with the mark the screen draws standing between the rate and the
  dollars and only where a rate is read; the rate, the mark and the dollars
  stand together in one reading under the figure. That row's dollar cell holds
  no text and keeps saying that it is a converted reading. A dollar send's
  rufiyaa cell holds no element and no text. No element of the page carries the
  placeholder hook.
- F1-d-prototype-delta: On top of the applied prototype this value still adds
  the converted hook to the element that reads the stored dollars, removes the
  constant that drew the em dash and the style that greyed it, and amends the
  hook list at the head of the screen module: the prototype carries the two
  cells but neither that hook nor those removals.
- F1-d-algebra-domain: Domain layer of this value. States: a sent row's cell
  reading, either a rufiyaa reading carrying its figure, its rate text or none,
  and its stored dollars, or a dollar reading carrying none of the three.
  Operations: none is added; the reading is built where it is built now.
  Observations: the three strings a rufiyaa reading carries, and the absence of
  all three in a dollar reading. Law a test can check: a dollar reading offers
  no figure, no rate and no stored dollars, so nothing of the rufiyaa shape can
  be read out of it.
- F1-d-algebra-application: Application and port layer of this value. States:
  which of the two readings a row stands for. Operations: the reading that words
  the dollar cell and says whether that cell is a converted reading.
  Observations: the text that reading gives and its converted saying. Law a test
  can check: the reading is total over the two cases, answering an empty text
  with a converted saying of true for a rufiyaa row and the stored dollar figure
  with a saying of false for a dollar row.
- F1-d-algebra-adapter: Adapter layer of this value, the DOM the page offers a
  reader. States: the mounted sent list of a seeded ledger. Operations: the
  rufiyaa cell renderer and the dollar cell renderer. Observations: the hooked
  elements of the two cells and the text inside them. Laws a test can check: a
  rufiyaa row exposes its figure, its rate and its stored dollars on three
  elements of its rufiyaa cell, each found by its own hook, with the mark
  between the rate and the dollars; that row's dollar cell reads nothing and
  still says it is converted; a dollar row's rufiyaa cell holds no element at
  all; and no element of the page carries the placeholder hook.
- F1-d-algebra-infrastructure: Infrastructure and recovery layer of this value.
  States: the local stack up or down, the seeded account present or absent.
  Operations: the acceptance vector's own install of the pinned dependencies,
  and the stack reset each spec makes. Observations: the vector's one line, with
  what it observed, what failed on an assertion and what failed before any
  assertion. Law a test can check: a run that could not reach its cases reports
  a setup failure and no assertion failure, so a broken environment is never
  read as a red oracle.
- F1-d-carriers: The typed carriers of this value and their owners. Decisions:
  StatementMvrCell, the union tagged on currency, in the domain's statement
  module; the dollar cell reading, a record of a text and a converted saying, in
  the screen module. Effects: the DOM writes of the two cell renderers. Errors:
  none is raised, and a rufiyaa reading that carries no rate text draws neither
  the rate nor the mark. Per-process state: none, because both renderers are
  functions of their own reading alone.
- F1-d-checkers: Claim to checker for this value. No state model and no temporal
  property arises in it: the cell reading is one synchronous function over a
  union of two cases, with no transition, no queue and no waiting party, so
  neither Quint nor TLC is selected for it. No proof obligation needs Agda,
  because every law of this value is decidable over a finite set of readings or
  is checked over a generated domain through the public page.
- F1-d-waiver: Quint, TLC, Apalache and Agda are absent on this host, where only
  a Java runtime is present. The owner's standing waiver of the formal checkers
  for this read-only screen work, recorded in the repository's own working
  agreement, is the authority for continuing without them. This value selects no
  checker and adds no claim resting on one; the two shared release claims stay
  INDETERMINATE under that waiver, and no native test, finite enumeration or
  argument is offered as their proof.
- F1-d-closure: Constructive closure of this value. Safety: DESIGN PASS by
  construction, runtime DESIGNED_NOT_BUILT. Inhabitation: DESIGN PASS, runtime
  DESIGNED_NOT_BUILT. Public reachability: DESIGN PASS, runtime
  DESIGNED_NOT_BUILT. Liveness: not applicable, because drawing the two cells is
  one synchronous pass with no queue, no retry and no waiting party. Nothing of
  this value is observed yet: the converted hook and the two removals are in no
  source the candidate carries.
- F1-d-stress-no-rate: Stressor, negating the assumption that every rufiyaa
  reading carries a rate text: a reading arrives with none, which the domain's
  own guard still allows and the database refuses to store. Preserved
  observation: the cell reads the figure and the stored dollars. Allowed
  degradation: neither the rate nor the mark is drawn. Forbidden outcome: a mark
  with nothing before it, or the stored dollars dropped with the rate. Residue:
  the mark is appended only inside the branch that reads a rate, and no spec
  states this case.
- F1-d-stress-long-name: Stressor, negating the assumption that the party column
  gives way before the figures do: a name long enough to fill the row. Preserved
  observation: both currency readings stay whole, the figure and the reading
  under it alike. Allowed degradation: the name is clipped. Forbidden outcome: a
  reading of either cell cut off, or the cell's second reading overlapping the
  dollar column. Residue: the long-name case is read on both lines of the cell
  and keeps the no-overlap invariant.
- F1-d-stress-widest: Stressor, negating the assumption that the cell is wide
  enough for its readings: the widest send the owner can make, five digits at a
  four-decimal rate, now with the stored dollars beside that rate. Preserved
  observation: every reading of the cell stands whole inside the cell. Allowed
  degradation: none. Forbidden outcome: a figure, a rate or a converted reading
  cut off or running over its column. Residue: the widest case reads both lines
  of the cell.
- F1-d-stress-empty-usd: Stressor, negating the assumption that an empty cell is
  read as absence: a reader looks in the dollar column of a rufiyaa row for the
  money that row is worth. Preserved observation: the cell keeps saying that it
  is a converted reading, so a reader tells it from an unconverted one with no
  figure to parse. Allowed degradation: that column holds no reading at all for
  such a row. Forbidden outcome: a dash, a zero or a bracketed figure standing
  in its place. Residue: the converted saying stays on the cell and the law of
  this value reads it.
- F1-d-stress-other-writer: Stressor, negating the assumption that the two
  renderers are the single writers of these cells: another writer appends an
  element inside the rufiyaa cell. Preserved observation: exactly one element of
  a rufiyaa row carries the converted hook. Allowed degradation: an unhooked
  element may stand in the cell. Forbidden outcome: two hooked converted
  readings in one row, or a placeholder hook back on the page. Residue: the hook
  law counts the hooked elements over the whole mounted page rather than inside
  one cell.
- F1-d-spof: Single points of failure and bypasses of this value. The hook names
  are strings on the page: any writer can add or remove one and no type can stop
  it, so the obligation to draw them only in the two cell renderers stays with
  the screen module's owner. The removed style is a second point: a later
  selector that greys a cell again brings back a second way of saying absence,
  and that obligation stays with the stylesheet's owner. The acceptance
  observation rests on one local stack and one seeded account; when either is
  absent nothing about the product is observed and the vector says so as a setup
  failure.
- F1-d-second-walk: A second set of stressors, not used to derive this design,
  walked against it. Two rufiyaa sends of the same figure in one list: the hook
  law is stated per row, so each row exposes its own converted reading and no
  reading is ambiguous. A ledger with nothing sent: no cell is drawn, the law
  holds vacuously and the column words still stand, which an existing case
  already reads. A rufiyaa send whose stored dollars read the same string as
  another row's dollar figure: the hooks tell them apart, the column does not.
  The module-text law meeting the new mark: the mark is no money word and no
  formatter, so that law holds unchanged. A page read aloud: the cell's three
  readings are read in the order they are drawn and the empty cells add nothing
  to read.
- F1-d-states: Admitted, excluded and unknown states of this value. Admitted: a
  rufiyaa sent row with a rate greater than zero and stored dollars; a rufiyaa
  reading with no rate text, drawn without the rate and the mark; a dollar sent
  row; a sent list with no rows. Excluded: a dollar cell of a rufiyaa row
  holding a figure; a rufiyaa cell of a dollar row holding any element; an
  element carrying the placeholder hook; two hooked converted readings in one
  row. Unknown, with the owner's phone check as the risk owner: whether the
  widest rufiyaa reading and the longest name together keep the cell's second
  reading inside its column on the owner's own phone.
- F1-d-self-falsification: The refuted readings of this value are carrier faults
  and not missing rules: a drawn mark in a money column reads as a figure of its
  own, and the dollars a rufiyaa send stores read as a second amount when they
  stand in the dollar column. The cure is the empty cell and the second reading
  under the figure, not a rule added over the cells as they stand. The reading
  that treats the figure and the rate as one tight token is refuted with them:
  the cell's text now joins the figure, the rate, the mark and the stored
  dollars.
- F1-d-pbt: The broad law of this value is checked with generated ledgers
  through the public page: for every generated ledger each rufiyaa row reads its
  stored laari figure, its stored rate and its stored dollars on their own
  hooks, and each dollar row reads its marked dollars with an empty rufiyaa
  cell. The spec carries its own seeded generator, a fixed seed printed with any
  failure so the ledger is replayed exactly, and a shrink that takes one entry
  away at a time while the reading still disagrees and reports the smallest
  ledger that still fails. The expected readings are computed in the spec from
  the seeded rows, never from the screen.
- F1-d-substrate: The test substrate of this value. The driving port is the
  built bundle served over the loopback origin and read by the pinned Playwright
  at 360 by 780, through the existing supports: the helper that brings the local
  stack up and resets it, and the helper that seeds and signs in an invented
  account. The readings live in the sent-columns spec, which already owns what
  the two currency columns read, so no second spec reads these cells. The
  acceptance vector is node tests/support/oracle-observation.mjs with that spec,
  and the gates are the build, the unit run and one serialised acceptance run.
- F1-d-arch-check: Two architectural laws of this value are checked. The hook
  contract holds over the whole mounted page: the stored dollars of a rufiyaa
  row are exposed on exactly one hooked element, and no element anywhere carries
  the placeholder hook. The ownership law of the screen module is the other: it
  draws what the domain words and words no money itself, so it names no
  formatter, scales nothing, holds no class and writes no entry, and the mark it
  now draws is no money word.
- F1-a-p-mvr-cell: The producer of a rufiyaa cell's readings and of every hook
  inside it. It is migrated: the figure stands alone, the rate, the mark and the
  stored dollars stand together under it, the stored dollars carry the converted
  hook, and the dollar branch draws no element at all.
- F1-a-p-usd-reading: The producer of what a sent row's dollar cell reads and of
  its converted saying. It is migrated: the rufiyaa case answers an empty text
  and keeps the saying of true.
- F1-a-p-usd-cell: The producer of the dollar cell itself. It is unchanged and
  compatible: it draws the text its reading gives and writes the converted
  saying from that same reading, so an empty text needs no edit in it.
- F1-a-p-hook-doc: The hook list at the head of the screen module, which names
  for a reader every hook the page carries. It is migrated: the placeholder line
  is gone and the converted reading of the rufiyaa cell is named.
- F1-a-p-absent-style: The style that greyed the removed mark. It is migrated by
  removal: nothing draws that mark any more, and keeping the style would leave a
  second way of saying absence.
- F1-a-p-screen-module: The screen module as the one drawer of the statement:
  its own literals, its imports and the helper every cell is drawn with. It is
  unchanged and compatible: the mark it gains is no money word, it words no
  money itself, names no document interface of its own, holds no class and
  writes no entry.
- F1-a-c-reading: This reading finds the rufiyaa figure by excluding the rate
  and the placeholder inside the cell, and reports the placeholder it found. It
  is migrated: the figure, the rate, the mark and the stored dollars are each
  found by their own hook, and the placeholder reading is gone.
- F1-a-c-glance: This case expects a rufiyaa row to read its figure with the
  rate, and a dollar row to read the em dash. It is migrated: the rufiyaa row
  reads its figure, its rate and its stored dollars, and the dollar row's
  rufiyaa cell reads nothing.
- F1-a-c-method-line: This case reads the two currency columns of three sends
  while checking the line under the person. It is migrated: the rufiyaa row's
  dollar cell is empty and its stored dollars are read inside the rufiyaa cell.
- F1-a-c-long-name: This case expects both currency readings to stay whole
  beside a long name, with the em dash for the row that has no rufiyaa figure.
  It is migrated to the two readings of the cell, and it keeps asserting that
  nothing is cut off or overlapped.
- F1-a-c-dollar-row: This case finds the dollar row by the placeholder inside
  its rufiyaa cell. It is migrated: the dollar row is found by its own stored
  currency and its rufiyaa cell is read as empty.
- F1-a-c-judge: This judge of generated ledgers expects the em dash where a send
  has no rufiyaa figure and the stored dollars in the dollar column. It is
  migrated: a rufiyaa row's stored dollars are judged on the converted hook, its
  dollar cell is judged empty, and a dollar row's rufiyaa cell is judged empty.
- F1-a-c-module-text: This reading asserts that the screen module words no money
  itself: no formatter, no scaling, no class, no write, and no currency mark
  written into a literal. It is unchanged and compatible: the mark this value
  draws is none of those.
- F1-a-c-row-text: This reading builds each row as one line of text from the em
  dash and from the figure with the rate appended tight. It is migrated: a
  rufiyaa row's line joins the figure, the rate, the mark and the stored
  dollars, and a dollar row's line carries no rufiyaa reading at all.
- F1-a-c-row-contains: This case asserts that a rufiyaa row contains the marked
  reading of the dollars it stores. It is unchanged and compatible: those
  dollars are still read inside the row, now under its rufiyaa figure.
- F1-a-c-footer-rows: This reading of the footer spec builds the last two cells
  of each sent row from the figure with the rate appended, the em dash and the
  dollar figure. It is migrated to the readings this value draws, which is all
  that spec needs of the rows.
- F1-a-c-lists-judge: This judge expects the last cell of every sent row to read
  its stored dollars, whichever currency the send was made in. It is migrated: a
  rufiyaa row's last cell is empty and its stored dollars are read inside its
  rufiyaa cell.
- F1-a-c-lists-rate: This case asserts that a rufiyaa cell still names its
  stored rate after a switch there and back. It is unchanged and compatible: the
  rate stays inside that cell.
- F1-ic-statement: The screen module is changed: both cell renderers, the
  reading that words the dollar cell, the removed constant and the hook list at
  its head.
- F1-ic-theme: The stylesheet is changed: the design values of the cell's two
  readings arrive with the prototype, and the style of the removed mark is gone.
- F1-r-mvr-union: The union tagged on currency already carries everything this
  cell reads: the figure, the rate text or none, and the stored dollars. No
  stored money and no field changes, so the union is reused exactly as it stands
  and only the renderer over it changes.
- F1-r-render-mvr-cell: One function owns the rufiyaa cell and one row renderer
  calls it, so the whole two-line reading and the converted hook are added in
  that one place.
- F1-r-usd-reading: One function already decides what the dollar cell reads and
  whether it is a converted reading, with one caller. The empty text of a
  rufiyaa row belongs in it, so the decision about that cell stays where it is.
- F1-r-render-usd-cell: The dollar cell renderer draws the text its reading
  gives and writes the converted saying from the same reading, so it is reused
  unchanged.
- F1-r-cell-helper: The module's own helper that draws one element with a class
  and a text is reused for the mark and for the stored dollars, so no new way of
  drawing a cell is introduced.
- F1-r-no-rufiyaa: The constant that drew the em dash has one reader, the dollar
  branch of the rufiyaa cell renderer. With that branch drawing nothing, keeping
  the constant would leave a second way of saying absence, so it goes with the
  branch.
- F1-r-absent-style: The style of the removed mark has no element left to ink
  once the mark is gone, so it is removed with it.
- F1-r-hook-doc: The hook list at the head of the module is the one place a
  reader learns which hooks the page carries, so it is amended there rather than
  restated anywhere else.
- F1-r-read-sending-list: The sent-columns spec already owns one reading of the
  sent list that every case in it uses. It is extended to find the figure, the
  rate, the mark and the stored dollars by their own hooks, so no second reading
  of these cells is written.
- F1-r-judge-columns: The judge that reads a generated ledger against its stored
  rows is extended to the readings of this value, so the broad law keeps one
  owner and one report.
- F1-r-generated-ledgers: The seeded generator of ledgers, its fixed seed and
  its shrink are reused as they stand: the domain of this value's broad law is
  the same spread of sends.
- F1-r-oracle-vector: For value 1: The observation vector already runs the
  pinned runner, installs what is missing and prints the one line this value's
  oracle needs, so it is reused unchanged.
- F1-pf-na: No preserving move is made before the behaviour changes. The whole
  source change arrives as the owner's approved prototype applied in one step,
  and every existing reading of these cells is itself amended by this value, so
  none of them is a green baseline a move could be measured against.
- F1-ct-na: Producer and consumer live in one deployable and change in the same
  candidate: the two cell renderers and the specs that read them. Nothing of
  this value is persisted, sent over a wire or released on another schedule, so
  the oracle of this value covers the agreement and no separate contract test is
  needed.
- F1-adr-na: The one architectural decision of this batch, with its alternatives
  and consequences, is recorded at shared scope, and this value adds no decision
  beyond the delta it carries, so a second record would be a second authority
  over the same choice.
- F1-at-hook-ssot: The hook contract holds over the whole mounted page and not
  only over the rows one case reads: every rufiyaa sent row exposes its stored
  dollars on exactly one element carrying the converted hook, no dollar sent row
  exposes such an element, and no element of either list carries the placeholder
  hook.
- F1-at-module-text: The screen module stays the one drawer that decides nothing
  about money: it names no formatter, scales no figure, writes no currency mark
  into a literal of its own, holds no class and writes no entry, and the domain
  module it reads names no document interface.
- F1-b-driven-style: The driven stylesheet: the design values that put the
  figure on its own line with the rate, the mark and the stored dollars under
  it. No spec reads them and the owner's phone judges them.
- F1-b-f-rate-cond: A rufiyaa reading arrives with no rate text, which its own
  type still admits.
- F1-b-f-rate-obs: The cell reads its figure and its stored dollars, and neither
  the rate nor the mark is drawn.
- F1-b-f-empty-cond: Nothing has been sent, so the sent list holds no row at
  all.
- F1-b-f-empty-obs: The column words still stand over the list, no cell of
  either currency is drawn, and the hook law holds with nothing to count.
- F1-o-observation: On a phone reading a seeded ledger that holds one send of
  MVR10,000 at the rate 20 stored as $500 and one send of $750, the Statement's
  sent list reads the rufiyaa row as MVR10,000 with, under it, the rate 20, the
  mark the screen draws and $500 on the one element carrying the converted hook;
  that row's dollar cell reads nothing and still says it is a converted reading;
  the dollar row reads $750 in its dollar cell and nothing at all in its rufiyaa
  cell; and no element of the page carries the placeholder hook.
- F1-o-stimulus: The bundle is built and served over the loopback origin, the
  owner signs in to the seeded account and taps the Statement tab to read the
  sent list.
- F1-o-expected: The expected readings are computed in the spec from the seeded
  rows alone: MVR10,000, the rate as the ledger stores it, the mark and $500 for
  the rufiyaa row, $750 for the dollar row, an empty text in each cell this
  design leaves empty, the converted saying true on the rufiyaa row's dollar
  cell and false on the dollar row's, and no element carrying the placeholder
  hook.
- F1-o-falsifier: The spec fails when a rufiyaa row's dollar cell reads a
  figure, when its stored dollars are read anywhere but the one hooked element
  inside its rufiyaa cell, when a mark or a dash stands in a dollar row's
  rufiyaa cell, when the mark is missing between the rate and the stored
  dollars, when any element still carries the placeholder hook, or when a
  reading of the cell is cut off or overlaps the one beside it.
- F1-ob-mvr-cell: What a sent row's rufiyaa cell reads, as its three readings
  found by their own hooks: the figure, the rate, and the stored dollars,
  together with the mark drawn before those dollars and with how many elements
  of the row carry the converted hook.
- F1-ob-mvr-cell-cd: It cannot tell the ink, the size, the weight or the gap of
  any of the three readings, nor the width of the column that holds them, nor
  which element draws the mark.
- F1-ob-mvr-lines: Whether the reading that carries the rate, the mark and the
  stored dollars stands under the figure inside the same cell, whether the two
  readings overlap, and whether either of them is cut off by the column that
  holds them.
- F1-ob-mvr-lines-cd: It cannot tell how far under the figure that reading
  stands, nor the height of either line, nor the gap between them.
- F1-eq: Two renderings of a sent row are the same here when no observation of
  this value tells them apart: the readings of the two cells, what the dollar
  cell says about being converted, and whether the second reading stands under
  the figure without overlap and whole. Every ink, size, weight, case, gap,
  padding, radius and column track of this cell lies outside that set, so two
  renderings that differ only in one of them are equal here and no spec may
  separate them.
- F1-gen-domain: A seeded ledger of sends and repayments drawn from a fixed
  seed: each send is of one of five stored shapes, whole rufiyaa at a whole
  rate, rufiyaa with laari at a whole rate, rufiyaa at a four-decimal rate,
  whole dollars, or dollars with cents, and a quarter of the entries are
  repayments the sent list leaves out. The ledgers run from nothing recorded at
  all to thirty entries.
- F1-gen-seed: One seed, a constant of the spec, drives the generator and is
  printed with any failing ledger so it is replayed exactly; a failing ledger is
  then shrunk by taking one entry away at a time while the reading still
  disagrees, within a fixed budget of attempts, and the smallest ledger that
  still fails is reported.
- F1-gen-must-shapes: A ledger holding one send of every stored shape, including
  a rufiyaa send at a four-decimal rate and a send stored with no method.
- F1-gen-must-empty: A ledger with nothing recorded at all, where no cell of
  either currency is drawn.
- F1-gen-must-mixed: A ledger holding rufiyaa sends, dollar sends and repayments
  together, so both currency readings stand in one list.
- F1-gen-must-rate-decimals: A send whose stored rate carries four decimals,
  read with no padding and no rounding.
- F1-law-mvr-detail: A rufiyaa sent row's rufiyaa cell reads its stored figure
  on one element, and in one further reading of its own the stored rate on the
  rate hook, the mark the screen draws, and the stored dollars on exactly one
  element carrying the converted hook; the mark is drawn only where a rate is
  read; a dollar sent row's rufiyaa cell holds no element and reads nothing at
  all.
- F1-law-mvr-detail-reason: A send is made in one of two currencies and nothing
  else, and a rufiyaa reading either carries a rate text or carries none, so the
  seeded rufiyaa row, the seeded dollar row and the two read together in one
  list are the whole of the law's ground.
- F1-law-mvr-lines: The reading that carries the rate, the mark and the stored
  dollars stands under the figure of the same cell, the two readings do not
  overlap, and neither is cut off by the column that holds them, however long
  the party name and however wide the stored figure and rate.
- F1-law-mvr-lines-reason: The widest reading the owner can send and the longest
  name the party column can hold are the two edges of this layout, so the
  ordinary row, the long-name row and the widest row are the whole of the law's
  ground.
- F1-law-usd-empty: The reading that words a sent row's dollar cell is total
  over the two currencies: for a rufiyaa row it answers an empty text with a
  converted saying of true, and for a dollar row the stored dollar figure with a
  saying of false, so no dollar cell can read the money a rufiyaa row stores.
- F1-law-usd-empty-reason: The reading is a function of a union with two cases,
  so one row of each currency exhausts it.
- F1-law-cells-generated: For every generated ledger each rufiyaa sent row reads
  its stored laari figure, its stored rate and its stored dollars on their own
  hooks with an empty dollar cell, and each dollar sent row reads its marked
  stored dollars with an empty rufiyaa cell; no row of either currency reads the
  other's shape.
- F1-law-cells-generated-io: The expected reading of every row is computed in
  the spec from the seeded entry, its stored minor units and its stored rate,
  before the page is read, and never from a value the screen produced.
- F1-law-cells-generated-fals: A generated ledger in which a row's reading
  disagrees with its stored entry: a rufiyaa row whose dollar cell holds a
  figure, whose stored dollars are absent from its rufiyaa cell or stand on no
  hooked element, or whose rate is padded or rounded; or a dollar row whose
  rufiyaa cell holds any reading.
- F1-case-both-rows: A ledger holding the rufiyaa send and the dollar send in
  one sent list.
- F1-case-long-name: A ledger holding two sends to a name long enough to fill
  the party column, one of them at a four-decimal rate.
- F1-case-widest: A ledger holding the widest rufiyaa send the owner can make,
  99,999 rufiyaa at a two-character rate.
- F1-ref-tight-token: A rufiyaa cell's figure and rate read as one tight token,
  so the text of the cell is the figure with the rate appended and nothing else.
- F1-ref-tight-token-cx: The cell now reads four things: a reading that compares
  the whole text of the cell with the figure and the rate finds the mark and the
  stored dollars in it too. The readings are therefore taken one hook at a time,
  and no reading of this value asserts the text of the cell as a whole.
- F1-x-no-placeholder: No cell of the page can be drawn with a mark that stands
  for a missing figure: the dollar branch of the rufiyaa cell renderer appends
  nothing, and the constant and the style that drew that mark are gone, so there
  is no element to carry the placeholder hook.
- F1-x-no-placeholder-harm: A dash in a money column reads as a figure of its
  own, telling the owner an amount they never sent.
- F1-x-no-placeholder-obs: How many elements of the mounted page carry the
  placeholder hook, and what a dollar row's rufiyaa cell reads.
- F1-x-usd-empty: No dollar cell of a rufiyaa sent row can be drawn with a
  figure: the reading that words that cell answers an empty text for the rufiyaa
  case of the union, and the cell renderer draws only the text its reading
  gives.
- F1-x-usd-empty-harm: The row reads the same money twice, once as what went out
  and once as what it was worth, and the owner adds the two.
- F1-x-usd-empty-obs: What a rufiyaa row's dollar cell reads, together with what
  that cell says about being a converted reading.
- F1-x-bypass-dom: The page is a public writable surface: anything on it can
  append an element to a cell or set a hook of its own, so the hook contract is
  checked by a reading of the mounted page and never only by a type.
- F1-x-bypass-style: A later selector can draw a mark through generated content
  and give a cell a reading no renderer wrote, which no type can stop; the
  obligation to leave the empty cell empty stays with the stylesheet's owner.
- F1-x-bypass-cast: A cast, or a cell reading shaped at the store's boundary,
  can present a rufiyaa case with no figure or a currency tag the union never
  saw; the checker the build runs rejects that only on annotated paths.
- F1-adm-no-rate: A rufiyaa reading carrying no rate text, drawn as the figure
  and the stored dollars with neither the rate nor the mark.
- F1-exc-dash: A currency cell drawn with a mark, a dash or a zero where it has
  no figure to read.
- F1-exc-double-money: A rufiyaa sent row reading the money it stores in both of
  its currency cells.
- F1-exc-two-hooks: A sent row exposing two elements that carry the converted
  hook.
- F1-unk-cell-width: Whether the widest stored rufiyaa reading beside the
  longest party name keeps the cell's second reading whole inside its column on
  the owner's own phone.
- F1-unk-owner: The owner, at the phone check that closes this batch.
- F1-cl-cells: The sent row's two currency cells: the rufiyaa figure with the
  rate, the mark and the stored dollars under it, and the dollar cell that reads
  nothing for such a row while a dollar row reads nothing in its rufiyaa cell.
- F1-cl-cells-safety: No sent row can be drawn stating money the ledger does not
  hold or hiding the currency a send was made in: the two renderers are the
  single writers of these cells, each draws from a reading tagged on currency,
  and no element is left that could carry a mark for a missing figure.
- F1-cl-cells-runtime: Not yet observed: the converted hook, the empty dollar
  text and the two removals are in no source the candidate carries, and no run
  has been made.
- F1-cl-cells-assume: It rests on the domain keeping its cell reading tagged on
  currency and on the two renderers staying the single writers of these cells.
- F1-cl-cells-inhab: A seeded rufiyaa send is read as a cell reading by the
  domain, drawn by the rufiyaa cell renderer, and read on the page as the figure
  with the rate, the mark and the stored dollars on their own hooks.
- F1-cl-cells-reach: That reading is reached through the bundle served at the
  loopback origin and read at 360 by 780, the one port a phone and a spec both
  use.
- F1-cl-cells-liveness: Drawing the two cells is one synchronous pass with no
  queue, no retry and no waiting party, so there is no progress claim to state
  about it.
- F1-model-na: No model is delivered for this value and no run is claimed: no
  state model and no temporal property is selected for it, and the checkers a
  selected claim would need are absent on this host and waived by the owner. The
  algebraic model of this value is delivered as the laws of this scope.
- F1-scenarios-na: A scenario of this scope is read from the trace of an
  executed model run, and no model was executed, so the behavioural scenarios of
  this value are the ones its oracle states.

### Targets (Value 1)

| Path | Decision | Reason |
|---|---|---|
| `src/ui/statement.ts` | EXTEND | F1-t-statement |
| `src/ui/theme.css` | EXTEND | F1-t-theme |

### Paradigm (Value 1)

functional

### Decisions (Value 1)

F1-d-cells, F1-d-prototype-delta, F1-d-algebra-domain, F1-d-algebra-application,
F1-d-algebra-adapter, F1-d-algebra-infrastructure, F1-d-carriers, F1-d-checkers,
F1-d-waiver, F1-d-closure, F1-d-stress-no-rate, F1-d-stress-long-name,
F1-d-stress-widest, F1-d-stress-empty-usd, F1-d-stress-other-writer, F1-d-spof,
F1-d-second-walk, F1-d-states, F1-d-self-falsification, F1-d-pbt,
F1-d-substrate, F1-d-arch-check, F-d-hooks, F-d-paradigm-owners, F-d-waiver,
F-d-design-values-travel

### Oracle (Value 1)

tests/acceptance/statement-sent-columns.spec.ts

### Acceptance supports (Value 1)

```json
[
  "tests/support/oracle-observation.mjs",
  "tests/support/accounts.ts",
  "tests/support/local-stack.ts"
]
```

### Oracle verification index (Value 1)

```json
0
```

### Purpose (Value 1)

F1-purpose

### Constraints (Value 1)

F-c-no-design-values, F-c-invented-figures, F-c-src-uncommitted,
F-c-prototype-reference, F-c-oracle-vector, F-c-one-playwright-run,
F-c-rate-guaranteed, F-c-viewport, F-c-phone-stop, F1-c-input-bounds,
F1-c-absence-has-no-mark

### Inherits (Value 1)

L-hook-converted, L-no-placeholder, O-converted, O-usd-cell, O-placeholder,
X-mvr-currency, R-dash-absence, R-usd-cell-converted

### Boundaries (Value 1)

```json
{
  "driving_port": {
    "ref": "F-b-driving"
  },
  "driven_ports": [
    {
      "ref": "F-b-driven-ledger"
    },
    {
      "ref": "F1-b-driven-style"
    }
  ],
  "dependency_direction": {
    "ref": "F-b-direction"
  },
  "failures": [
    {
      "condition": {
        "ref": "F1-b-f-rate-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "F1-b-f-rate-obs"
      }
    },
    {
      "condition": {
        "ref": "F1-b-f-empty-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "F1-b-f-empty-obs"
      }
    },
    {
      "condition": {
        "ref": "F-b-f-stack-cond"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "F-b-f-stack-obs"
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
    "ref": "F1-o-observation"
  },
  "stimulus": {
    "ref": "F1-o-stimulus"
  },
  "expected": {
    "ref": "F1-o-expected"
  },
  "falsifier": {
    "ref": "F1-o-falsifier"
  }
}
```

### Architectural tests (Value 1)

```json
{
  "obligations": [
    {
      "id": "AT1-hook-ssot",
      "obligation": {
        "ref": "F1-at-hook-ssot"
      },
      "oracle": "tests/acceptance/statement-sent-columns.spec.ts",
      "verification_index": 0
    },
    {
      "id": "AT1-module-text",
      "obligation": {
        "ref": "F1-at-module-text"
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
  "reason": {
    "ref": "F1-ct-na"
  },
  "applicability": "not_applicable"
}
```

### Prefactoring (Value 1)

```json
{
  "reason": {
    "ref": "F1-pf-na"
  },
  "applicability": "not_applicable"
}
```

### Agreement analysis (Value 1)

| Id | Contract | Role | Locator | Decision | Reason |
|---|---|---|---|---|---|
| P1-mvr-cell | the sent row's MVR and USD cell readings and their hooks | producer | `src/ui/statement.ts:272` | MIGRATED | F1-a-p-mvr-cell |
| P1-usd-reading | the sent row's MVR and USD cell readings and their hooks | producer | `src/ui/statement.ts:296` | MIGRATED | F1-a-p-usd-reading |
| P1-usd-cell | the sent row's MVR and USD cell readings and their hooks | producer | `src/ui/statement.ts:307` | UNCHANGED_COMPATIBLE | F1-a-p-usd-cell |
| P1-hook-doc | the sent row's MVR and USD cell readings and their hooks | producer | `src/ui/statement.ts:38` | MIGRATED | F1-a-p-hook-doc |
| P1-absent-style | the sent row's MVR and USD cell readings and their hooks | producer | `src/ui/theme.css:2762` | MIGRATED | F1-a-p-absent-style |
| P1-screen-module | the statement screen module's own literals and dependencies | producer | `src/ui/statement.ts:181` | UNCHANGED_COMPATIBLE | F1-a-p-screen-module |
| C1-reading | the sent row's MVR and USD cell readings and their hooks | consumer | `tests/acceptance/statement-sent-columns.spec.ts:781` | MIGRATED | F1-a-c-reading |
| C1-glance | the sent row's MVR and USD cell readings and their hooks | consumer | `tests/acceptance/statement-sent-columns.spec.ts:963` | MIGRATED | F1-a-c-glance |
| C1-method-line | the sent row's MVR and USD cell readings and their hooks | consumer | `tests/acceptance/statement-sent-columns.spec.ts:1051` | MIGRATED | F1-a-c-method-line |
| C1-long-name | the sent row's MVR and USD cell readings and their hooks | consumer | `tests/acceptance/statement-sent-columns.spec.ts:1102` | MIGRATED | F1-a-c-long-name |
| C1-dollar-row | the sent row's MVR and USD cell readings and their hooks | consumer | `tests/acceptance/statement-sent-columns.spec.ts:1164` | MIGRATED | F1-a-c-dollar-row |
| C1-judge | the sent row's MVR and USD cell readings and their hooks | consumer | `tests/acceptance/statement-sent-columns.spec.ts:1535` | MIGRATED | F1-a-c-judge |
| C1-module-text | the statement screen module's own literals and dependencies | consumer | `tests/acceptance/statement-sent-columns.spec.ts:1259` | UNCHANGED_COMPATIBLE | F1-a-c-module-text |
| C1-row-text | the sent row's MVR and USD cell readings and their hooks | consumer | `tests/acceptance/statement-sent.spec.ts:213` | MIGRATED | F1-a-c-row-text |
| C1-row-contains | the sent row's MVR and USD cell readings and their hooks | consumer | `tests/acceptance/statement-sent.spec.ts:1310` | UNCHANGED_COMPATIBLE | F1-a-c-row-contains |
| C1-footer-rows | the sent row's MVR and USD cell readings and their hooks | consumer | `tests/acceptance/statement-sent-footer.spec.ts:248` | MIGRATED | F1-a-c-footer-rows |
| C1-lists-judge | the sent row's MVR and USD cell readings and their hooks | consumer | `tests/acceptance/statement-lists.spec.ts:1526` | MIGRATED | F1-a-c-lists-judge |
| C1-lists-rate | the sent row's MVR and USD cell readings and their hooks | consumer | `tests/acceptance/statement-lists.spec.ts:949` | UNCHANGED_COMPATIBLE | F1-a-c-lists-rate |

### Reuse analysis (Value 1)

| Symbol | Locator | Decision | Reason |
|---|---|---|---|
| StatementMvrCell | `src/domain/statement.ts:94` | REUSE | F1-r-mvr-union |
| renderMvrCell | `src/ui/statement.ts:272` | EXTEND | F1-r-render-mvr-cell |
| usdReadingOf | `src/ui/statement.ts:296` | EXTEND | F1-r-usd-reading |
| renderUsdCell | `src/ui/statement.ts:307` | REUSE | F1-r-render-usd-cell |
| cell | `src/ui/statement.ts:181` | REUSE | F1-r-cell-helper |
| NO_RUFIYAA | `src/ui/statement.ts:83` | REPLACE | F1-r-no-rufiyaa |
| the hook list at the head of the screen module | `src/ui/statement.ts:38` | EXTEND | F1-r-hook-doc |
| .statement-mvr-absent | `src/ui/theme.css:2762` | REPLACE | F1-r-absent-style |
| readSendingList | `tests/acceptance/statement-sent-columns.spec.ts:703` | EXTEND | F1-r-read-sending-list |
| judgeTheCurrencyColumns | `tests/acceptance/statement-sent-columns.spec.ts:1508` | EXTEND | F1-r-judge-columns |
| generatedLedgers | `tests/acceptance/statement-sent-columns.spec.ts:1455` | REUSE | F1-r-generated-ledgers |
| observe | `tests/support/oracle-observation.mjs:39` | REUSE | F1-r-oracle-vector |

### Impact closure (Value 1)

```json
{
  "items": [
    {
      "kind": "public_interface",
      "locator": "src/ui/statement.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "F1-ic-statement"
      }
    },
    {
      "kind": "runtime",
      "locator": "src/ui/theme.css",
      "decision": "CHANGED",
      "reason": {
        "ref": "F1-ic-theme"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:781",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F1-a-c-reading"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:963",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F1-a-c-glance"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:1051",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F1-a-c-method-line"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:1102",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F1-a-c-long-name"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:1164",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F1-a-c-dollar-row"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:1535",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F1-a-c-judge"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:1259",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "F1-a-c-module-text"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:213",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F1-a-c-row-text"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:1310",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "F1-a-c-row-contains"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-footer.spec.ts:248",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F1-a-c-footer-rows"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:1526",
      "decision": "MIGRATED",
      "reason": {
        "ref": "F1-a-c-lists-judge"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:949",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "F1-a-c-lists-rate"
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
    "ref": "F1-adr-na"
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
              "id": "O1-mvr-cell",
              "description": {
                "ref": "F1-ob-mvr-cell"
              },
              "result_type": "three strings or absent, a mark string or absent, and a count",
              "cannot_distinguish": {
                "ref": "F1-ob-mvr-cell-cd"
              }
            },
            {
              "id": "O1-mvr-lines",
              "description": {
                "ref": "F1-ob-mvr-lines"
              },
              "result_type": "three booleans",
              "cannot_distinguish": {
                "ref": "F1-ob-mvr-lines-cd"
              }
            }
          ],
          "equality": {
            "under": [
              "O1-mvr-cell",
              "O1-mvr-lines",
              "O-converted",
              "O-usd-cell",
              "O-placeholder"
            ],
            "definition": {
              "ref": "F1-eq"
            }
          },
          "constructors": [
            {
              "id": "C1-render-mvr-cell",
              "signature": "renderMvrCell(reading: StatementMvrCell): HTMLElement"
            },
            {
              "id": "C1-usd-reading",
              "signature": "usdReadingOf(row: StatementRow): { readonly text: string; readonly converted: boolean }"
            },
            {
              "id": "C1-render-usd-cell",
              "signature": "renderUsdCell(row: StatementRow): HTMLElement"
            }
          ],
          "generators": [
            {
              "id": "G1-ledger",
              "domain": {
                "ref": "F1-gen-domain"
              },
              "size_bound": 6,
              "seed_policy": {
                "ref": "F1-gen-seed"
              },
              "must_include": [
                {
                  "ref": "F1-gen-must-shapes"
                },
                {
                  "ref": "F1-gen-must-empty"
                },
                {
                  "ref": "F1-gen-must-mixed"
                },
                {
                  "ref": "F1-gen-must-rate-decimals"
                }
              ],
              "depth_bound": 30
            }
          ],
          "laws": [
            {
              "id": "L1-mvr-detail",
              "statement": {
                "ref": "F1-law-mvr-detail"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::renderMvrCell",
              "uses": [
                "C1-render-mvr-cell",
                "O1-mvr-cell",
                "O-converted"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "F-case-mvr-send"
                  },
                  {
                    "ref": "F-case-usd-send"
                  },
                  {
                    "ref": "F1-case-both-rows"
                  }
                ],
                "reason": {
                  "ref": "F1-law-mvr-detail-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L1-mvr-lines",
              "statement": {
                "ref": "F1-law-mvr-lines"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::renderMvrCell",
              "uses": [
                "C1-render-mvr-cell",
                "O1-mvr-lines"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "F1-case-both-rows"
                  },
                  {
                    "ref": "F1-case-long-name"
                  },
                  {
                    "ref": "F1-case-widest"
                  }
                ],
                "reason": {
                  "ref": "F1-law-mvr-lines-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L1-usd-empty",
              "statement": {
                "ref": "F1-law-usd-empty"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::usdReadingOf",
              "uses": [
                "C1-usd-reading",
                "C1-render-usd-cell",
                "O-usd-cell"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "F-case-mvr-send"
                  },
                  {
                    "ref": "F-case-usd-send"
                  }
                ],
                "reason": {
                  "ref": "F1-law-usd-empty-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "L1-cells-generated",
              "statement": {
                "ref": "F1-law-cells-generated"
              },
              "kind": "oracle",
              "layer": "adapter",
              "owner": "src/ui/statement.ts::renderMvrCell",
              "uses": [
                "C1-render-mvr-cell",
                "C1-render-usd-cell",
                "O1-mvr-cell",
                "O-usd-cell"
              ],
              "treatment": {
                "generator": "G1-ledger",
                "independent_observation": {
                  "ref": "F1-law-cells-generated-io"
                },
                "falsifier": {
                  "description": {
                    "ref": "F1-law-cells-generated-fals"
                  }
                },
                "tag": "broad"
              },
              "evidence": {
                "tag": "to_run"
              }
            }
          ],
          "refuted": [
            {
              "id": "R1-tight-token",
              "statement": {
                "ref": "F1-ref-tight-token"
              },
              "cause": "carrier",
              "counterexample": {
                "ref": "F1-ref-tight-token-cx"
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
      "scope": "value:1",
      "status": {
        "payload": {
          "claims": [
            {
              "id": "X1-no-placeholder",
              "proposition": {
                "ref": "F1-x-no-placeholder"
              },
              "harm": {
                "ref": "F1-x-no-placeholder-harm"
              },
              "owner": "src/ui/statement.ts::renderMvrCell",
              "admitted_input": {
                "ref": "F-case-usd-send"
              },
              "constructor": "src/ui/statement.ts::renderMvrCell",
              "consumer": "src/ui/statement.ts::renderStatement",
              "public_observation": {
                "ref": "F1-x-no-placeholder-obs"
              },
              "bypass": [
                {
                  "ref": "F1-x-bypass-dom"
                },
                {
                  "ref": "F1-x-bypass-style"
                }
              ],
              "strength": "centralised"
            },
            {
              "id": "X1-usd-empty",
              "proposition": {
                "ref": "F1-x-usd-empty"
              },
              "harm": {
                "ref": "F1-x-usd-empty-harm"
              },
              "owner": "src/ui/statement.ts::usdReadingOf",
              "admitted_input": {
                "ref": "F-case-mvr-send"
              },
              "constructor": "src/ui/statement.ts::usdReadingOf",
              "consumer": "src/ui/statement.ts::renderUsdCell",
              "public_observation": {
                "ref": "F1-x-usd-empty-obs"
              },
              "bypass": [
                {
                  "ref": "F1-x-bypass-dom"
                },
                {
                  "ref": "F1-x-bypass-cast"
                }
              ],
              "strength": "gradual_checker"
            }
          ],
          "admitted": [
            {
              "ref": "F-case-mvr-send"
            },
            {
              "ref": "F-case-usd-send"
            },
            {
              "ref": "F1-adm-no-rate"
            }
          ],
          "excluded": [
            {
              "ref": "F1-exc-dash"
            },
            {
              "ref": "F1-exc-double-money"
            },
            {
              "ref": "F1-exc-two-hooks"
            }
          ],
          "unknown": [
            {
              "state": {
                "ref": "F1-unk-cell-width"
              },
              "risk_owner": {
                "ref": "F1-unk-owner"
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
          "ref": "F1-model-na"
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
                "ref": "F1-cl-cells"
              },
              "safety": {
                "statement": {
                  "ref": "F1-cl-cells-safety"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "F1-cl-cells-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F1-cl-cells-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "L1-mvr-detail",
                  "L1-usd-empty",
                  "L-no-placeholder"
                ],
                "basis": {
                  "claims": [
                    "X1-no-placeholder",
                    "X1-usd-empty",
                    "X-mvr-currency"
                  ],
                  "tag": "constructed"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "F1-cl-cells-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "F1-cl-cells-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-c-rate-guaranteed"
                  }
                ],
                "runs": [],
                "laws": [
                  "L1-mvr-detail",
                  "L-hook-converted"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "F-case-mvr-send"
                  },
                  "producer": "src/ui/statement.ts::renderMvrCell",
                  "consumer": "tests/acceptance/statement-sent-columns.spec.ts",
                  "public_observation": {
                    "ref": "F1-ob-mvr-cell"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "F1-cl-cells-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "F1-cl-cells-runtime"
                },
                "assumptions": [
                  {
                    "ref": "F-c-viewport"
                  }
                ],
                "runs": [],
                "laws": [
                  "L1-cells-generated"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "F1-case-both-rows"
                  },
                  "producer": "src/ui/statement.ts::renderStatement",
                  "consumer": "tests/acceptance/statement-sent-columns.spec.ts",
                  "public_observation": {
                    "ref": "F1-o-observation"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "reason": {
                  "ref": "F1-cl-cells-liveness"
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
          "ref": "F1-scenarios-na"
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

Verification command:

```sh
node tests/support/oracle-observation.mjs tests/acceptance/statement-sent.spec.ts
```

Verification command:

```sh
node tests/support/oracle-observation.mjs tests/acceptance/statement-sent-footer.spec.ts
```

Verification command:

```sh
node tests/support/oracle-observation.mjs tests/acceptance/statement-lists.spec.ts
```

Verification command:

```sh
npm run test:unit
```

Verification command:

```sh
npm run test:acceptance
```

## Value 5

### Facts (Value 5)

- V5-purpose: A sideways drag of a finger, begun anywhere on the screen, carries
  Entries and Statement with it, settles on one of the two views at the lift,
  and releases no tap on whatever was under the finger. The decision over the
  gesture's own numbers is a pure rule; the shell only reads the pointer, draws
  the answer and tells the arriving screen it has arrived.
- V5-c-bounds: The gesture's bounds are the owner's own. A finger is read as
  sideways once it has moved more than 8 pixels across; a move of more than 8
  pixels down that is at least as far down as across gives the gesture back to
  the scroll. A lift faster than 0.4 pixels a millisecond settles on the view
  the finger was moving towards, whatever the distance. A slower lift settles on
  the other view when the banded share has moved more than 0.3 of a view from
  the one it started on. Both comparisons are strict, so a release standing
  exactly at a bound belongs to the slower, staying branch. Past either end the
  strip gives a quarter of the way the finger travelled.
- V5-c-travel-unbounded: The authority states no bound on how far or how fast a
  finger may travel, so travel and speed arrive as the browser reports them and
  the rule is total over every finite number: the band, not a range check, is
  what keeps the strip inside its two views. A pane width that is not greater
  than zero is admitted and answered with the view the drag began on. This
  design is neither narrower nor wider than the authority on these inputs.
- V5-c-touch-only: The gesture answers only the primary touch pointer. A mouse
  pointer is ignored, so a drag cannot be driven through the existing
  mouse-driven acceptance project and a desktop pointer drag switches nothing.
  The only client the product brief describes is a phone, and this is why the
  existing project's readings keep their meaning unchanged.
- V5-c-swallow-window: Exactly one capture-phase click is swallowed on the shell
  after a release, and the listener is taken off again after 300 milliseconds,
  so a deliberate tap a moment later opens its sheet as it always did.
- V5-t-swipe-module: The gesture's own data and the decision over it: the
  release record, the two-view index, the banded share and the switch-or-stay
  answer, written as a pure module that reads no DOM and holds no state.
- V5-t-views-drag: The shell gains the pointer drag: the drag record and its
  states, pointer capture, the live drawing of the strip, the pill, the two
  panes and the two tab inks at the share the rule gives, one owner of the
  arrival that the tap and the release both call, and the single swallowed click
  after a release.
- V5-t-theme-gesture: The stylesheet gains the gesture rule, which leaves the
  vertical scroll to the browser and the sideways move to the swipe, declared on
  the track and on every element inside it, and the rule that a live drag is
  drawn with no transition governing it.
- V5-d-rule-boundary: The decision and the drawing are two owners. At every move
  the shell hands the rule the starting view index, the travel across, the speed
  at that moment and the pane width, and draws the strip at the banded share the
  rule answers; at the lift it hands the rule the same record and shows the view
  index the rule answers. The shell computes no band, no bound and no comparison
  of its own, and the rule touches no element and remembers nothing between
  calls.
- V5-d-arrival-owner: The shell has one owner of an arrival: it declares the
  slide on the strip and the pill, hands every part back to the resting state
  the stylesheet draws, writes which view is shown with its two aria-current
  values, and tells the arriving screen it is the view now, but only when the
  view changed. The tap calls it after refusing a tap on the view already read;
  the release calls it for every lift, so a release that settles back on the
  view it started from springs back through the same slide and announces
  nothing. Neither way of arriving can drift from the other, because there is
  one body to change.
- V5-d-drag-machine: The drag has four states and the shell holds at most one
  record of it. No drag: a primary touch going down opens a pending record
  holding the pointer id, the place and the moment it went down and the view
  index it started on. Pending: a move more than 8 pixels down and at least as
  far down as across closes the record and gives the gesture back to the scroll;
  a move more than 8 pixels across makes the drag live. Live: the strip captures
  that pointer, the record keeps the last place and moment so a speed can be
  taken, and every move and lift whose pointer id is not the record's is
  ignored. Settled: the lift or the cancel closes the record before the arrival
  is drawn, so no second release can run.
- V5-d-mid-slide: A drag that begins while a slide is still running is taken
  from where the strip stands: at the moment the drag becomes live the shell
  reads the strip's live position, takes the motion attributes off the strip and
  the pill so the drawing is a direct write, and offsets the finger's starting
  place by the difference between that position and the view index the drag
  began on. The attribute that says which view is shown is written by the
  arrival alone, never during a drag.
- V5-d-rise: The arriving screen is told once, by the arrival owner, with the
  same message a tap sends and on the same screen the shell was handed, so the
  Statement's own rise plays after a swipe exactly as after a tap through the
  listener the Statement already has. A release that changed nothing sends no
  message, so nothing rises twice.
- V5-d-gesture-css: The browser keeps the vertical scroll and the swipe takes
  the sideways move, declared on the track and on every element inside it,
  because each scrolling box inside the strip is a scroll container of its own
  and answers only to its own rule. While a drag is live the shell carries a
  mark of its own that suspends the transitions over the strip, the pill and the
  panes; that mark is internal and no spec reads it.
- V5-d-reduced: With reduced motion asked for the strip still follows the
  finger, because that movement is the owner's own and is drawn as a direct
  write that no transition governs; at the lift the arrival hands the settling
  to the motion owner, which draws nothing when that preference is set, so the
  released view is shown at once with no slide and no spring back and no part
  left displaced.
- V5-d-algebra-domain: Domain layer of this value. States: a release of the
  strip, standing at a share, with a speed at the lift, from one of the two
  views, over a pane width. Operations: the banded share of a travel, and the
  switch-or-stay answer over a release. Observations: the banded share, and the
  settled view index. Laws a test can check: the answer is one of exactly two
  view indexes and the share is a finite number for every release; a lift faster
  than the flick bound answers the direction of the finger whatever the travel;
  a slower lift answers the other view exactly when the banded share has passed
  the commit bound; two releases with the same share, speed and starting view
  are answered alike; a width that is not greater than zero answers the starting
  view.
- V5-d-algebra-application: Application and port layer of this value. States: no
  drag, a pending drag, a live drag, a settled drag; which view the shell says
  is shown and which tab is marked current. Operations: the pointer down, the
  move, the lift, the cancel, and the one arrival. Laws a test can check: while
  the finger is down the strip stands at the share the rule gives for the travel
  so far; the view shown after a lift is the one the rule answered; exactly one
  tab is marked current and it names the shown view after a lift that changed
  the view and after one that did not; a release that changed the view tells the
  arriving screen once and a release that changed nothing tells it nothing; a
  second pointer going down or lifting while a drag is live changes nothing.
- V5-d-algebra-adapter: Adapter layer of this value, the page a reader drives.
  States: the mounted page of a seeded ledger, with the strip at rest or carried
  by a finger. Operations: a touch drag dispatched over the page as a start,
  several moves and an end; a tap; a drag down the screen. Laws a test can
  check: a drag begun in mid-screen on a card and one begun on the entries list
  each carry the strip; no element inside the strip takes the sideways gesture
  for itself; the lift that ends a drag opens no sheet and activates nothing
  under the finger; a drag down the screen scrolls the box under the finger and
  leaves the shown view as it was; the page never scrolls sideways through a
  drag.
- V5-d-algebra-infrastructure: Infrastructure and recovery layer of this value.
  States: a Chrome DevTools session attached or refused; a captured pointer
  whose lift the browser replaces with a cancel; a pane not yet laid out.
  Operations: the drag dispatch, the cancel path, the reading of the pane width
  at the moment of the drag. Laws a test can check: a run that could not attach
  a session reports a setup failure with nothing observed and no failed
  assertion; a cancelled pointer takes the same arrival as a lift, so the strip
  settles on one of the two views and the shown view and its current tab agree;
  a release over a width that is not greater than zero leaves the shown view as
  it was.
- V5-d-carriers: The typed carriers of this value and their owners. Decisions:
  ViewIndex, the union of 0 and 1, and SwipeRelease, the record of the starting
  view index, the travel, the speed and the width, both in the pure rule module,
  with swipeAt and swipeOutcome as the only functions over them; the two view
  names and their ordered pair stay the shell's existing closed union. Effects:
  the live drawing of the strip, the pill, the two panes and the two tab inks,
  the capture of the pointer, the one swallowed click and the arrival message,
  all in the shell. Errors: none is raised; a degenerate width, a cancelled
  pointer and a second pointer are each answered by a value rather than by a
  failure. Per-process state: the drag record held in the shell's closure, and
  the dragging mark on the shell, which is internal.
- V5-d-checkers: Claim to checker for this value. The drag's four states and the
  claim that a lift or a cancel always leaves the shell showing exactly one of
  the two views were selected for Quint, because they are a small state model
  over one gesture with one pointer. The progress claim, that no drag stays live
  once the browser has delivered a lift or a cancel for the captured pointer,
  was selected for TLC under weak fairness of the release action, because
  Quint's own temporal support cannot carry that fairness assumption. No
  obligation of this value needs Agda: the rule's laws are decidable over a
  bounded numeric domain and the page's laws over finite readings.
- V5-d-waiver: No checker selected for this value is installed on this host:
  neither Quint, TLC, Apalache nor Agda is present, and only a Java runtime is.
  The owner's standing waiver of the formal checkers for this screen work is the
  recorded authority for continuing without those two proofs. The state-machine
  safety claim and the progress claim therefore stay INDETERMINATE and their
  DESIGN axis stays BLOCKED; no generated check, finite reading or argument is
  offered in their place.
- V5-d-closure: Constructive closure of this value. Safety, that a lift releases
  no tap and leaves the shell showing one of the two names: DESIGN PASS by
  argument, runtime DESIGNED_NOT_BUILT. Inhabitation, that a real drag is
  answered and drawn: DESIGN PASS, runtime DESIGNED_NOT_BUILT. Public
  reachability, that the answer is read on the served page as the view shown
  after a touch drag: DESIGN PASS, runtime DESIGNED_NOT_BUILT. Liveness, that no
  drag stays live after the browser has delivered a lift or a cancel: DESIGN
  BLOCKED with the proof INDETERMINATE under the waiver, runtime
  DESIGNED_NOT_BUILT.
- V5-d-stress-diagonal: Stressor, negating the assumption that a finger moves
  either across or down: the owner drags diagonally, more across than down but
  far in both. Preserved observation: the gesture is decided once, by the first
  move that passes the slop, and the strip then follows the finger across.
  Allowed degradation: the box under the finger does not scroll while the drag
  is live. Forbidden outcome: a strip that follows the finger and a box that
  scrolls at the same time, or a gesture re-decided at every move. Residue: the
  pending state is left exactly once, by whichever test passes first, and the
  live state never returns to pending.
- V5-d-stress-cancel: Stressor, negating the assumption that a captured pointer
  reports its own lift: the browser cancels the pointer in the middle of a drag.
  Preserved observation: the strip settles on one of the two views and the shown
  view and its current tab agree. Allowed degradation: the view it settles on is
  decided from the last move the browser did report. Forbidden outcome: a strip
  left between the two views, or a drag still live with no finger on the screen.
  Residue: the cancel is wired to the same release path as the lift, and the
  record is closed before the arrival is drawn.
- V5-d-stress-second-pointer: Stressor, negating the assumption that one finger
  is on the screen: a second touch goes down and lifts while a drag is live.
  Preserved observation: the drag answers to the pointer that began it, and the
  view shown changes at most once. Allowed degradation: the second touch does
  nothing at all. Forbidden outcome: two drags driving the strip, or an arrival
  drawn by the wrong pointer's lift. Residue: the record holds its pointer id,
  the strip captures that pointer, and every move, lift and cancel whose id is
  not the record's is ignored.
- V5-d-stress-mid-slide-grab: Stressor, negating the assumption that a drag
  begins on a strip at rest: the owner grabs the strip while the tap's slide is
  still running. Preserved observation: the strip is taken from where it stands
  and still settles on one of the two views. Allowed degradation: the settling
  slide is shorter than a full one. Forbidden outcome: a jump to the far side at
  the moment the drag becomes live. Residue: the live position is read and the
  finger's start offset by it, and the motion attributes are taken off so the
  drawing is a direct write.
- V5-d-stress-tap-after: Stressor, negating the assumption that a finger which
  lifts after a drag meant to tap: the lift lands on an entry card. Preserved
  observation: the view settles and no sheet opens. Allowed degradation: a
  deliberate tap made within a moment of a release is lost too. Forbidden
  outcome: a sheet opening behind a swipe. Residue: one capture-phase click is
  swallowed on the shell and the listener is taken off again shortly after, and
  a lift that never became a live drag swallows nothing at all.
- V5-d-stress-zero-width: Stressor, negating the assumption that the pane has
  been laid out: the width read at the drag is zero. Preserved observation: the
  shown view does not change and the strip rests on the view the drag began on.
  Allowed degradation: the gesture is simply not honoured. Forbidden outcome: a
  share that is not a number reaching the comparison, and with it a view settled
  by chance. Residue: the rule answers the starting view and the starting share
  for any width that is not greater than zero, and that is one of its stated
  cases.
- V5-d-spof: Single points of failure of this value. The gesture rule in the
  stylesheet is the first: one later selector setting a different gesture rule
  inside the strip takes the drag away again, and the obligation to keep that
  rule on the track and on everything inside it stays with the stylesheet's
  owner, falsified by the reading that counts the elements inside the strip
  which take the sideways gesture for themselves. The arrival owner is the
  second: it is the one body that writes which view is shown, and the obligation
  to route every new way of arriving through it stays with the shell's owner.
  The observation itself rests on one local stack, one seeded account and one
  DevTools session; when any of them is absent nothing about the gesture is
  observed and the vector says so as a setup failure.
- V5-d-bypasses: What this design cannot stop. The attribute that says which
  view is shown is a string on the page: any writer outside the shell can set
  another value, and no type can stop it. A record shaped at the boundary or
  cast can carry numbers that are not numbers into the rule, and the checker
  that runs in the build rejects that only on annotated paths. The page is a
  public writable surface, so anything on it can add a listener that answers the
  same lift. A foreign process that stops the local stack, and a browser that
  refuses a DevTools session, each end the observation rather than falsify the
  gesture, and the vector keeps them apart from a failed assertion. The owner of
  each of these obligations is the shell's own module, except the last, which is
  the acceptance vector's.
- V5-d-second-walk: A second set of stressors, not used to derive this design,
  walked against the finished design. A finger that holds still for a moment and
  then lifts without a further move: the speed kept is the one taken at the last
  move, so a slow hold after a fast flick can still read as a flick; the case is
  carried as an unknown for the phone check rather than cured by a bound the
  authority does not state. A drag of more than a full width in the wrong
  direction: the band gives a quarter past the end, so the share stays well
  inside the commit bound and the view does not change. A drag begun on the
  bottom bar rather than on the strip: the bar is not inside the track, so the
  gesture is not offered there and a tap on a tab still switches. A drag with
  the keyboard's focus on a tab: the arrival writes the aria-current pair, so
  what is read aloud follows the gesture. A page read aloud during a drag:
  nothing the drag writes is announced, because the drawing is inline style
  alone and the mark on the shell is internal.
- V5-d-states: Admitted, excluded and unknown states of this value. Admitted: a
  drag that never passes the slop; a drag given back to the scroll; a live drag
  over any finite travel and speed; a release over a positive width; a release
  over a width that is not greater than zero; a cancelled pointer; a second
  pointer while a drag is live; a lift on a card. Excluded: a strip settled
  between the two views; a drag live with no record; two live drags; an arrival
  drawn by a pointer other than the one that began the drag; a shown view that
  is not one of the two names. Unknown, with the owner's phone check as their
  risk owner: whether a dispatched touch drag reproduces the timing of a real
  finger closely enough for the flick bound to feel as it did on the prototype;
  and whether a finger that holds still before lifting should be read as a
  flick, which this design leaves as the last reported speed.
- V5-d-self-falsification: Two laws this value refutes rather than keeps. A
  release may reuse the tap's switch unchanged: refuted, because that switch
  refuses a switch to the view already shown, so a release that settles back
  where it began would leave the strip wherever the finger left it; the arrival
  is therefore one owner that every release calls and the tap guards its own
  no-op before calling it. The speed at the last move is the speed at the lift:
  refuted at its boundary, because a finger that stops without reporting a
  further move lifts with the speed it had while moving; the design keeps that
  reading and carries the case as an unknown for the phone rather than inventing
  a bound the authority does not state.
- V5-d-substrate: The substrate of this value. The driving port is the built
  bundle served over the loopback origin and read at 360 by 780 in the
  touch-enabled project, which scans the touch directory of its own; a drag is
  dispatched through a Chrome DevTools session as a touch start, several moves
  with their own times and an end, from a helper the acceptance designer owns
  beside the other supports. The existing stack and accounts helpers bring the
  local Supabase up, reset it and seed an invented account. The second substrate
  is the pure rule module's public export, driven by the pinned unit runner in
  its default node environment, where no document exists. The vectors are the
  acceptance observation vector over this value's touch spec, the build, the
  unit run and the one serialised acceptance run over both projects.
- V5-d-pbt: The broad laws of this value are the rule's own and are checked
  through its public export with the generated releases the shared generator
  states, the expected answer computed in the test from the stated bounds and
  never from the module. What this value adds is the finite side: the readings
  on the page are driven as whole gestures, each a stated case rather than a
  generated one, because a dispatched drag is slow, shares one stack with every
  other spec and cannot be shrunk.
- V5-r-shell: The shell already owns the two panes, the strip, the bar, the pill
  and the one switch, so the drag is added inside it and reads the parts it
  already holds; nothing is re-rendered and no second shell is introduced.
- V5-r-arrival-owner: The tap's switch already declares the slide, writes the
  state and tells the arriving screen. Its body becomes the one arrival owner
  that the tap and the release both call, so the two ways of arriving cannot
  decide differently about the slide, the attribute pair or the message.
- V5-r-show: The single writer of which view is shown and of the two
  aria-current values is reused exactly as it is, so every existing reading of
  those hooks keeps its meaning after a release.
- V5-r-slide: The settling of the strip and the pill, with its own answer to
  reduced motion, is already the motion owner's, so the release hands over to it
  rather than timing a slide of its own.
- V5-r-rise: The Statement screen already listens for the arrival message and
  raises its card, its pill and its rows, so a swipe to the Statement plays that
  same rise by sending that same message and nothing about the rise is written
  again here.
- V5-r-rule: No symbol decides a gesture's outcome today: the decision would
  otherwise live inside the release handler, where the numbers of the gesture
  could not be read or checked apart from the DOM. It becomes the pure module's
  banded share and switch-or-stay answer, with the release record as its input.
- V5-r-views-union: The two view names and their order are already a closed
  union in the shell, so the two-view index maps onto that existing order and no
  second list of views is introduced.
- V5-r-reduced: Whether the device asked for less motion is already answered in
  one place and read by the motion owner, so the release needs no reading of its
  own and the drag's following of the finger is deliberately outside it.
- V5-r-track-rule: The stylesheet already has the strip's own rule, so the
  gesture rule is added to it and extended to every element inside the strip in
  that one place.
- V5-r-vector: The acceptance observation vector already runs the pinned runner,
  installs what is missing and prints the one observation line, so it is reused
  unchanged for this value's touch spec and nothing new is written to report an
  observation.
- V5-r-touch-project: The touch-enabled project and its scan directory are
  already fixed for the batch, so this value writes its spec into that directory
  and adds no project, no flag and no second configuration.
- V5-r-unit-discovery: The unit discovery and the unit script are already fixed
  for the batch, so the rule's unit test is written into the directory they name
  and no runner setting is touched here.
- V5-pf-na: No preserving move is made before this behaviour changes. The
  gesture does not exist in the committed source, and the module the rule moves
  into is created by this value itself, so there is nothing to move out of a
  green baseline; the only existing readings of the switch are driven by a
  pointer type this gesture ignores, so none of them could measure a movement of
  this code.
- V5-a-p-rule: The producer of the switch-or-stay answer and of the banded share
  over a release record. The decision is migrated out of the release handler
  into the pure module, which is the only producer of it, and the shell becomes
  its only caller.
- V5-a-p-shown: The producer of which view is shown and of the two aria-current
  values. It is unchanged and compatible: a release writes those hooks through
  the same single writer a tap uses, so every existing reading of them keeps its
  meaning.
- V5-a-p-arrival: The producer of the arrival message the shell sends to the
  screen that becomes the one being read. It is migrated: it gains a second
  caller, so a release that changed the view sends it once and a release that
  changed nothing sends nothing.
- V5-a-p-gesture: The producer of which gestures inside the strip the browser
  keeps for itself. It is migrated: the rule is declared on the track and on
  every element inside it, because each scrolling box inside the strip answers
  only to its own rule.
- V5-a-reduced: This reading states, for a phone that asks for less motion, that
  no part of the app is displaced at any frame of a switch. A drag deliberately
  displaces the strip under the finger, which is the owner's own movement rather
  than a motion of the app, so the reading is migrated to make that claim of the
  arrival alone, the moment the view is shown, and the drag's following of the
  finger is observed in this value's own touch spec. Its taps are driven by the
  pointer type the gesture ignores, so what it drives does not change.
- V5-a-rest: This reading states that once a switch has come to rest no part
  claims to be moving and none carries a transform or an opacity of its own. The
  drawing during a drag is inline and is handed back at the arrival, so the
  reading holds unchanged, and the rest after a release is observed in this
  value's own touch spec because this spec is driven by the pointer type the
  gesture ignores.
- V5-a-mouse: This reading taps a tab or a card with a mouse pointer, which the
  gesture ignores, so no drag can begin, no click is ever swallowed and the
  reading keeps its meaning exactly. The gesture rule in the stylesheet governs
  touch, not the pointer this project drives, and the scrolls these specs make
  are set rather than dragged.
- V5-a-shown-string: This reading takes the value of the attribute that says
  which view is shown. A release writes only the two view names, through the
  same single writer, so the reading keeps its meaning.
- V5-at-gesture-everywhere: The gesture rule is a law over the whole strip, not
  a style: no element inside the track takes the sideways gesture for itself,
  including the panes, the cards and the lists and any box a later value adds
  inside them, and a drag begun in mid-screen on a card or on the entries list
  carries the strip. The reading enumerates every element inside the track, so
  an element added later cannot escape it.
- V5-at-dom-free-rule: The dependency points one way: the shell imports the pure
  rule and the rule imports nothing, touches no element and keeps nothing
  between calls. The unit runner's default node environment, where no document
  exists, is what falsifies a DOM read inside the module, and the rule answers
  every generated release there.
- V5-ct-na: The producer and the consumers of this value live in one deployable
  and change in the same candidate: the shell, the pure rule it calls, and the
  specs that drive and read them. Nothing of this gesture is persisted, sent
  over a wire or released on another schedule, so this value's own oracle covers
  the agreement and no separate contract test is needed.
- V5-ic-swipe: The pure rule module is created by this value: the release
  record, the two-view index, the banded share and the switch-or-stay answer,
  with the three bounds as its own named values.
- V5-ic-views: The shell is changed by this value: the drag record and its
  states, the pointer capture, the live drawing, the one arrival owner the tap
  and the release share, and the single swallowed click.
- V5-ic-theme: The stylesheet is changed by this value: the gesture rule on the
  track and on every element inside it, and the suspension of the transitions
  while a drag is live.
- V5-ic-playwright: The acceptance configuration is not changed by this value:
  the touch project and its scan directory are already there, and this value
  only writes a spec into that directory.
- V5-ic-vitest: The unit discovery is not changed by this value: it already
  confines the runner to the unit directory and the test name this value's unit
  test uses.
- V5-b-driving: The driving port of this value is the mounted page of the built
  bundle, served over the loopback origin and driven as a finger would drive it:
  a touch drag dispatched through a DevTools session as a start, several moves
  and an end, a tap, and a drag down the screen. The pure rule has a second
  driving port of its own, its public export, driven by the unit runner.
- V5-b-driven-pointer: The driven input: the browser's touch pointers, with
  capture of the one that began the drag and a cancel the browser may send in
  its place at any moment.
- V5-b-driven-style: The driven stylesheet: the gesture rule that gives the
  vertical scroll to the browser and the sideways move to the swipe, and the
  transitions the drag suspends while it is live.
- V5-b-driven-motion: The driven motion owner: the settling of the strip and the
  pill at the arrival, and its own answer to a device that asked for less
  motion.
- V5-b-driven-screen: The driven arriving screen: the Statement, which raises
  its own parts when it is told it is the view now, and Home, which is told the
  same way.
- V5-b-f-slop-cond: A finger moves down the screen, more down than across, after
  going down inside the strip.
- V5-b-f-slop-obs: The record is closed, the box under the finger scrolls as it
  always did, and the shown view is the one it was.
- V5-b-f-cancel-cond: The browser cancels the captured pointer instead of
  reporting its lift.
- V5-b-f-cancel-obs: The same arrival runs, so the strip settles on one of the
  two views and the shown view and its current tab agree.
- V5-b-f-second-cond: A second touch goes down, moves or lifts while a drag is
  live.
- V5-b-f-second-obs: Nothing answers it: the view shown changes at most once, by
  the pointer that began the drag.
- V5-b-f-width-cond: The pane width read at the drag is not greater than zero.
- V5-b-f-width-obs: The shown view is unchanged, the strip rests on the view the
  drag began on, and the share the rule computed is a finite number.
- V5-o-observation: On a phone with touch, reading a seeded ledger of one send
  of MVR10,000 at the rate 20 stored as $500, one send of $750, one repayment of
  $300 and more entries than fit the screen: a sideways drag begun in mid-screen
  on an entry card carries the two screens and the pill with the finger and,
  flicked, leaves the Statement shown with its single current tab naming it and
  its rows having risen on arrival; a short slow drag settles back on the view
  it began on; the lift opens no sheet; a drag down the entries list scrolls
  that list and leaves the shown view as it was; a drag begun on the statement's
  own list carries the strip just as one begun on a card does; and with less
  motion asked for the strip follows the finger and the released view is shown
  at once with no part left displaced.
- V5-o-stimulus: The bundle is built and served over the loopback origin, the
  owner signs in to the seeded account, and each gesture is dispatched over the
  mounted page through a DevTools session as a touch start, a series of moves
  with their own times and an end: a fast sideways flick from a card, a short
  slow sideways drag, a drag down the entries list, a sideways drag from the
  statement's list, and the same flick again on a page that has asked for less
  motion.
- V5-o-expected: The expected result of each gesture is derived in the spec from
  the bounds the design states, before the gesture is dispatched: a lift faster
  than the flick bound is expected to settle on the view the finger moved
  towards; a lift slower than it is expected to settle on the other view only
  when the travel has passed the commit share of the pane's own width, and on
  the starting view otherwise; a drag more down than across is expected to leave
  the shown view alone and to move the list it is on. The names expected of the
  shown view and of the single current tab are the two the shell already uses,
  and the parts expected to have risen are the ones the Statement raises on any
  arrival.
- V5-o-falsifier: The spec fails when a drag begun on a card or on a list moves
  nothing, when the strip does not stand between the two views at any frame of
  the drag, when a flick settles on the view against the finger, when a short
  slow drag switches, when a drag past the commit bound stays, when the shown
  view and the single current tab disagree after a lift, when a sheet opens
  behind the lift, when the Statement's rows do not rise after a release that
  changed the view or rise after one that did not, when a drag down the screen
  switches the view or fails to scroll the list, or when a phone that asked for
  less motion is left with a part displaced after the lift.
- V5-adr-context: The owner asked that a sideways swipe anywhere on the screen
  switch between Entries and Statement, following the finger, and approved the
  feel of it on their phone. Three things had to be decided before a spec could
  be written: where the switch-or-stay decision lives, how a release arrives at
  a view now that there are two ways to arrive, and how a lift that ended a drag
  is kept from opening what was under the finger.
- V5-adr-decision: Put the decision in the pure rule the shared contract names
  and keep the shell to reading the pointer and drawing the answer; give the
  shell one arrival owner that the tap and the release both call, so the slide,
  the attribute pair and the arrival message have one body; answer only the
  primary touch pointer, so the existing mouse-driven readings keep their
  meaning; and swallow exactly one capture-phase click after a release, taking
  the listener off again shortly after.
- V5-adr-alt-inline: Keep the decision and the bounds inside the release handler
  and observe them only through a dispatched drag. Rejected: every bound would
  then be checked through the slowest port there is, the numeric edges would go
  unchecked, and the handler would own a decision about data it also draws.
- V5-adr-alt-reuse-switch: Let the release call the tap's switch as it stands.
  Rejected: that switch refuses a switch to the view already shown, so a release
  settling back where it began would draw no spring back and leave the strip
  where the finger left it.
- V5-adr-alt-any-pointer: Answer every pointer, so a mouse drag switches too.
  Rejected: the only client the brief describes is a phone, and a mouse drag
  would begin inside every existing spec that clicks a tab or a card, changing
  readings this Request was not asked to touch.
- V5-adr-alt-no-swallow: Let the lift fall through and rely on the browser not
  to raise a click after a drag. Rejected: the lift lands on an entry card,
  which opens a sheet, so a swipe would end with a sheet over the view it just
  reached.
- V5-adr-con-two-ports: The gesture is observed through two ports: the rule's
  bounds and edges through the unit runner over generated releases, and the
  whole gesture through a touch drag on the served page, which is slow and
  shares the one stack with every other spec, so the page's side is stated as a
  handful of whole gestures rather than as a generated domain.
- V5-adr-con-unproven: The drag's state machine and its progress stay unproven
  here: the checkers selected for them are absent and waived, so both claims
  stay INDETERMINATE and are carried instead by the rule's generated checks, by
  the stated gestures of the touch spec and by the owner's phone check.
- V5-adr-con-internal-mark: The shell carries a mark of its own while a drag is
  live, which suspends the transitions over the moving parts. It is internal: no
  spec reads it, so a later value may rename it, and the readings bind to the
  shown view, the current tab and what the page reads instead.
- V5-ob-follow: The share of a view the strip and the pill stand at while the
  finger is down, read from the page as the drag goes on.
- V5-ob-follow-cd: It cannot tell the ink of a tab part-way through, the curve
  or the smoothness of the movement, nor how many frames the browser drew.
- V5-ob-sheet: Whether a sheet is open over the view after the finger has
  lifted, and whether a tap a moment later still opens one.
- V5-ob-sheet-cd: It cannot tell which listener swallowed the click, nor how
  long the swallow stayed in place.
- V5-ob-rise: Whether the screen that has just become the one being read
  declared its own arrival rise, and on which of its parts.
- V5-ob-rise-cd: It cannot tell the duration, the delay, the curve or the order
  of that rise, nor the place each part rose from.
- V5-ob-scroll: Whether the box under the finger scrolled at all after a drag
  down the screen, and whether the shown view stayed as it was.
- V5-ob-scroll-cd: It cannot tell how far the box scrolled, nor which of its own
  rules let it.
- V5-ob-gesture-count: How many elements inside the strip take the sideways
  gesture for themselves rather than leaving it to the swipe.
- V5-ob-gesture-count-cd: It cannot tell which gesture a given device would
  really deliver, nor what a nested box does with a move that is more down than
  across.
- V5-eq: Two states of this value are the same when no observation of this value
  and none of the gesture observations it inherits tells them apart. The inks
  the tabs take part-way through a drag, the shape and the smoothness of the
  movement, the duration of the settling slide and the places the rise comes
  from all lie outside that set, so two drags that differ only in one of them
  are equal here and no spec may separate them.
- V5-law-follow: While the finger is down and the drag is live, the strip and
  the pill stand at the banded share the rule gives for the travel so far, so
  the two screens follow the finger from wherever on the screen the drag began.
- V5-law-follow-reason: What has to be settled is where a drag may begin, and
  the places are three: on a card, on a list that scrolls, and past the end of
  the strip. Each is driven as a whole gesture, because a dispatched drag cannot
  be generated cheaply and shares the one stack with every other spec.
- V5-law-settle: The view shown after a lift is the one the pure rule answers
  for that release, exactly one tab is marked as the current view and it names
  the shown view, after a lift that changed the view and after one that did not
  alike.
- V5-law-settle-reason: There are three ways a release ends and two views to end
  on: a flick, a slow drag past the commit bound and a slow drag short of it,
  which with a cancelled pointer are the whole of the ground the page can show.
- V5-law-no-sheet: The lift that ends a live drag opens no sheet and activates
  nothing under the finger, while a lift that never became a live drag is an
  ordinary tap and a tap made a moment after a release opens its sheet as it
  always did.
- V5-law-no-sheet-reason: The law is about one lift and what it may activate, so
  the cases are the lift that ends a drag on a card, the tap that never dragged
  and the tap that follows a release after the swallow has gone.
- V5-law-rise: A release that changed the view tells the arriving screen once,
  so the Statement raises its card, its pill and its rows after a swipe exactly
  as after a tap, and a release that changed nothing tells it nothing, so
  nothing rises.
- V5-law-rise-reason: There is one message and two kinds of release, one that
  changed the view and one that did not, and the arriving screen is one of two,
  so four readings are the whole of the law's ground.
- V5-law-scroll: A drag more down the screen than across it scrolls the box
  under the finger and leaves the shown view as it was, and the page itself
  never scrolls sideways through any drag.
- V5-law-scroll-reason: The boxes that can be dragged down are the entries list
  and the statement's own list, and the page is one, so three readings settle
  it.
- V5-law-gesture-everywhere: No element inside the track takes the sideways
  gesture for itself, so a drag begun on any of them belongs to the swipe while
  a move down the screen still belongs to the browser.
- V5-law-gesture-everywhere-reason: The claim is an absence over every element
  inside the track, so one seeded page holding both panes, their cards and their
  lists is read as a whole, and the count rather than a sample is what is
  asserted.
- V5-law-reduced: With less motion asked for, the strip still follows the finger
  through a live drag and the released view is shown at once, with nothing
  claiming to move and no part left displaced after the lift.
- V5-law-reduced-reason: The preference is one setting and the releases under it
  are two, one that changed the view and one that did not, so two gestures on
  one quiet phone are the whole of the law's ground.
- V5-ref-reuse-switch: A release can arrive by calling the tap's own switch,
  since both end on a view.
- V5-ref-reuse-switch-cx: A release that settles back on the view it began on
  asks that switch for the view already shown, which it refuses, so no spring
  back is drawn and the strip stays where the finger left it. The arrival became
  one owner that every release calls, with the tap guarding its own no-op before
  calling it.
- V5-ref-speed: The speed recorded at the last move is the speed of the finger
  at the lift.
- V5-ref-speed-cx: A finger that flicks, then holds still without reporting
  another move, and then lifts, is read with the speed it had while moving, so a
  hold is answered as a flick. The reading is kept, because no bound on the hold
  is stated by the authority, and the case is carried as an unknown for the
  owner's phone check.
- V5-cl-subject: The swipe as the owner performs it: a finger that goes down
  inside the strip, carries the two screens, lifts, and leaves one view being
  read with nothing opened behind it.
- V5-cl-safety: A lift or a cancel leaves the shell showing exactly one of the
  two view names with exactly one tab marked current, and releases no tap on
  what was under the finger.
- V5-cl-safety-arg1: There is one body that writes which view is shown and the
  two aria-current values, it is called with one of the two names, and the names
  come from the closed union the shell already holds.
- V5-cl-safety-arg2: The record is closed before the arrival is drawn and every
  move, lift and cancel of another pointer is ignored, so one gesture produces
  one arrival.
- V5-cl-safety-arg3: The capture-phase swallow is registered on the shell at the
  lift, before the browser can raise a click from it, and it is taken off again
  shortly after, so it can swallow one click and no more.
- V5-cl-safety-assume: It assumes the shell is the only writer of the attribute
  that says which view is shown, that the browser raises at most one click from
  a lift, and that the shell's own listener runs before the card's.
- V5-cl-safety-runtime: Nothing is observed yet: the gesture is not in the
  committed source and the rule module does not exist.
- V5-cl-inhab: A finger's real drag is answered: the shell builds a release
  record from the pointer events, the rule answers a view index for it, and the
  shell shows that view.
- V5-cl-inhab-arg1: The record is built from numbers the browser reports and a
  width the page has, and the rule is total over every finite number, so every
  drag the page can make has an answer.
- V5-cl-inhab-assume: It assumes the pane has been laid out by the time the drag
  begins, and names the width that is not greater than zero as the case where
  the gesture is simply not honoured.
- V5-cl-reach-in: A touch drag over the mounted page of the seeded account: a
  start inside the strip, moves across it and an end.
- V5-cl-reach-obs: The view the shell says is shown and the single tab marked
  current, read on the served page after the lift.
- V5-cl-reach: The rule's answer is read on a public port: the served page names
  the view it settled on, and the module's public export answers the same
  release in the unit runner.
- V5-cl-live: No drag stays live once the browser has delivered a lift or a
  cancel for the captured pointer: every live drag reaches a settled view.
- V5-cl-live-note: Unchecked: this progress claim was selected for TLC under
  weak fairness of the release action and no checker is installed, so under the
  owner's recorded waiver its proof stays INDETERMINATE and the claim stays
  BLOCKED.
- V5-cl-live-assume: It assumes the browser delivers either a lift or a cancel
  for every captured pointer, which is the browser's own scheduling obligation
  and not this design's.
- V5-cl-runtime-note: Not yet observed: the gesture arrives as the owner's
  prototype, which is applied as uncommitted source in craft, and no run of it
  has been made.
- V5-model-na: The checkers selected for this value are absent: the drag's state
  machine was selected for Quint and its progress for TLC, and quint, tlc,
  apalache-mc and agda all resolve nowhere on this host. Under the owner's
  standing waiver no model file is delivered and no run is claimed; the
  algebraic model of this value is delivered as the laws of this scope and as
  the rule's laws it inherits.
- V5-scenarios-na: A scenario of this scope would be read from the trace of an
  executed model run, and no model was executed, because the selected checkers
  are absent and waived. The gestures the owner approved on the prototype, and
  the stated gestures of this value's oracle, are what stand in their place for
  human reading.
- V5-case-drag-card: A sideways drag begun in mid-screen on an entry card.
- V5-case-drag-list: A sideways drag begun on a list that scrolls on its own.
- V5-case-drag-past-end: A sideways drag that carries the strip past either end
  of the two views.
- V5-case-flick: A lift faster than the flick bound, towards the other view.
- V5-case-slow-past: A lift slower than the flick bound, whose banded share has
  passed the commit bound.
- V5-case-slow-short: A lift slower than the flick bound, whose banded share is
  short of the commit bound.
- V5-case-cancel: A drag the browser cancels in place of a lift.
- V5-case-lift-on-card: A lift that ends a live drag over an entry card.
- V5-case-tap-no-drag: A touch that goes down and lifts without ever passing the
  slop.
- V5-case-tap-after: A tap made after the swallowed click has been taken off
  again.
- V5-case-release-switch: A release that leaves the other view being read.
- V5-case-release-stay: A release that leaves the view it began on being read.
- V5-case-drag-down-entries: A drag down the screen on the entries list.
- V5-case-drag-down-statement: A drag down the screen on the statement's own
  list.
- V5-case-page-sideways: The page itself, read for a sideways scroll of its own
  after a drag.
- V5-case-whole-page: The mounted page of a seeded ledger, holding both panes
  with their cards and their lists, read as a whole.
- V5-case-quiet-switch: A release on a phone that asked for less motion, leaving
  the other view being read.
- V5-case-quiet-stay: A release on a phone that asked for less motion, leaving
  the view it began on being read.

### Targets (Value 5)

| Path | Decision | Reason |
|---|---|---|
| `src/ui/swipe.ts` | CREATE_NEW | V5-t-swipe-module |
| `src/ui/views.ts` | EXTEND | V5-t-views-drag |
| `src/ui/theme.css` | EXTEND | V5-t-theme-gesture |

### Paradigm (Value 5)

functional

### Decisions (Value 5)

V5-d-rule-boundary, V5-d-arrival-owner, V5-d-drag-machine, V5-d-mid-slide,
V5-d-rise, V5-d-gesture-css, V5-d-reduced, V5-d-algebra-domain,
V5-d-algebra-application, V5-d-algebra-adapter, V5-d-algebra-infrastructure,
V5-d-carriers, V5-d-checkers, V5-d-waiver, V5-d-closure, V5-d-stress-diagonal,
V5-d-stress-cancel, V5-d-stress-second-pointer, V5-d-stress-mid-slide-grab,
V5-d-stress-tap-after, V5-d-stress-zero-width, V5-d-spof, V5-d-bypasses,
V5-d-second-walk, V5-d-states, V5-d-self-falsification, V5-d-substrate,
V5-d-pbt, F-d-swipe-module, F-d-touch-project, F-d-vitest-scope,
F-d-paradigm-owners, F-d-design-values-travel

### Oracle (Value 5)

tests/touch/swipe-views.touch.spec.ts

### Acceptance supports (Value 5)

```json
[
  "tests/support/oracle-observation.mjs",
  "tests/support/accounts.ts",
  "tests/support/local-stack.ts",
  "tests/support/touch-drag.ts"
]
```

### Oracle verification index (Value 5)

```json
0
```

### Purpose (Value 5)

V5-purpose

### Constraints (Value 5)

V5-c-bounds, V5-c-travel-unbounded, V5-c-touch-only, V5-c-swallow-window,
F-c-no-design-values, F-c-invented-figures, F-c-src-uncommitted,
F-c-prototype-reference, F-c-oracle-vector, F-c-one-playwright-run,
F-c-existing-project-unchanged, F-c-swipe-two-views-only, F-c-reduced-motion,
F-c-no-new-dependency, F-c-viewport, F-c-phone-stop

### Inherits (Value 5)

O-swipe-at, O-swipe-outcome, O-shown, C-render-views, C-swipe-release,
C-swipe-at, C-swipe-outcome, G-release, L-swipe-total, L-swipe-flick,
L-swipe-commit, L-swipe-through-at, L-swipe-degenerate, L-shown-agrees,
X-view-index

### Boundaries (Value 5)

```json
{
  "driving_port": {
    "ref": "V5-b-driving"
  },
  "driven_ports": [
    {
      "ref": "V5-b-driven-pointer"
    },
    {
      "ref": "V5-b-driven-style"
    },
    {
      "ref": "V5-b-driven-motion"
    },
    {
      "ref": "V5-b-driven-screen"
    }
  ],
  "dependency_direction": {
    "ref": "F-b-direction"
  },
  "failures": [
    {
      "condition": {
        "ref": "V5-b-f-slop-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "V5-b-f-slop-obs"
      }
    },
    {
      "condition": {
        "ref": "V5-b-f-cancel-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "V5-b-f-cancel-obs"
      }
    },
    {
      "condition": {
        "ref": "V5-b-f-second-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "V5-b-f-second-obs"
      }
    },
    {
      "condition": {
        "ref": "V5-b-f-width-cond"
      },
      "outcome": "Refusal",
      "observation": {
        "ref": "V5-b-f-width-obs"
      }
    },
    {
      "condition": {
        "ref": "F-b-f-touch-cond"
      },
      "outcome": "Indeterminate",
      "observation": {
        "ref": "F-b-f-touch-obs"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Public oracle (Value 5)

```json
{
  "observation": {
    "ref": "V5-o-observation"
  },
  "stimulus": {
    "ref": "V5-o-stimulus"
  },
  "expected": {
    "ref": "V5-o-expected"
  },
  "falsifier": {
    "ref": "V5-o-falsifier"
  }
}
```

### Architectural tests (Value 5)

```json
{
  "obligations": [
    {
      "id": "V5-AT-gesture-everywhere",
      "obligation": {
        "ref": "V5-at-gesture-everywhere"
      },
      "oracle": "tests/touch/swipe-views.touch.spec.ts",
      "verification_index": 0
    },
    {
      "id": "V5-AT-dom-free-rule",
      "obligation": {
        "ref": "V5-at-dom-free-rule"
      },
      "oracle": "tests/unit/swipe-outcome.test.ts",
      "verification_index": 2
    }
  ],
  "applicability": "applicable"
}
```

### Contract tests (Value 5)

```json
{
  "reason": {
    "ref": "V5-ct-na"
  },
  "applicability": "not_applicable"
}
```

### Prefactoring (Value 5)

```json
{
  "reason": {
    "ref": "V5-pf-na"
  },
  "applicability": "not_applicable"
}
```

### Agreement analysis (Value 5)

| Id | Contract | Role | Locator | Decision | Reason |
|---|---|---|---|---|---|
| V5-p-rule | the switch-or-stay answer and the banded share over a release record | producer | `src/ui/views.ts:158` | MIGRATED | V5-a-p-rule |
| V5-p-shown | the shown view and its one current tab | producer | `src/ui/views.ts:137` | UNCHANGED_COMPATIBLE | V5-a-p-shown |
| V5-p-arrival | the arrival message sent to the screen that becomes the one being read | producer | `src/ui/views.ts:157` | MIGRATED | V5-a-p-arrival |
| V5-p-gesture | which gestures inside the strip the browser keeps | producer | `src/ui/theme.css:133` | MIGRATED | V5-a-p-gesture |
| V5-c-motion-reduced | the arrival message sent to the screen that becomes the one being read | consumer | `tests/acceptance/statement-motion.spec.ts:1266` | MIGRATED | V5-a-reduced |
| V5-c-motion-rest | the arrival message sent to the screen that becomes the one being read | consumer | `tests/acceptance/statement-motion.spec.ts:1399` | UNCHANGED_COMPATIBLE | V5-a-rest |
| V5-c-motion-tap | the shown view and its one current tab | consumer | `tests/acceptance/statement-motion.spec.ts:622` | UNCHANGED_COMPATIBLE | V5-a-mouse |
| V5-c-sent-tab | the shown view and its one current tab | consumer | `tests/acceptance/statement-sent.spec.ts:435` | UNCHANGED_COMPATIBLE | V5-a-mouse |
| V5-c-lists-tab | the shown view and its one current tab | consumer | `tests/acceptance/statement-lists.spec.ts:474` | UNCHANGED_COMPATIBLE | V5-a-mouse |
| V5-c-sent-columns-tab | the shown view and its one current tab | consumer | `tests/acceptance/statement-sent-columns.spec.ts:621` | UNCHANGED_COMPATIBLE | V5-a-mouse |
| V5-c-sent-footer-tab | the shown view and its one current tab | consumer | `tests/acceptance/statement-sent-footer.spec.ts:448` | UNCHANGED_COMPATIBLE | V5-a-mouse |
| V5-c-back-columns-tab | the shown view and its one current tab | consumer | `tests/acceptance/statement-back-columns.spec.ts:388` | UNCHANGED_COMPATIBLE | V5-a-mouse |
| V5-c-entry-sheet-tap | a lift that opens what was under the finger | consumer | `tests/acceptance/entry-sheet.spec.ts:181` | UNCHANGED_COMPATIBLE | V5-a-mouse |
| V5-c-layout-shown | the shown view and its one current tab | consumer | `tests/acceptance/layout-and-install.spec.ts:132` | UNCHANGED_COMPATIBLE | V5-a-shown-string |

### Reuse analysis (Value 5)

| Symbol | Locator | Decision | Reason |
|---|---|---|---|
| renderViews | `src/ui/views.ts:117` | EXTEND | V5-r-shell |
| switchTo | `src/ui/views.ts:153` | EXTEND | V5-r-arrival-owner |
| show | `src/ui/views.ts:137` | REUSE | V5-r-show |
| VIEWS | `src/ui/views.ts:49` | REUSE | V5-r-views-union |
| slideViews | `src/ui/motion.ts:1023` | REUSE | V5-r-slide |
| the Statement screen's listener for the arrival message | `src/ui/statement.ts:636` | REUSE | V5-r-rise |
| prefersReducedMotion | `src/ui/motion.ts:179` | REUSE | V5-r-reduced |
| the switch-or-stay answer over the gesture's own numbers, held inside the release handler | `src/ui/views.ts:158` | CREATE_NEW | V5-r-rule |
| .views-track | `src/ui/theme.css:133` | EXTEND | V5-r-track-rule |
| observe | `tests/support/oracle-observation.mjs:39` | REUSE | V5-r-vector |
| projects | `tests/playwright.config.ts:17` | REUSE | V5-r-touch-project |
| test:unit | `package.json:10` | REUSE | V5-r-unit-discovery |

### Impact closure (Value 5)

```json
{
  "items": [
    {
      "kind": "public_interface",
      "locator": "src/ui/swipe.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "V5-ic-swipe"
      }
    },
    {
      "kind": "public_interface",
      "locator": "src/ui/views.ts",
      "decision": "CHANGED",
      "reason": {
        "ref": "V5-ic-views"
      }
    },
    {
      "kind": "runtime",
      "locator": "src/ui/theme.css",
      "decision": "CHANGED",
      "reason": {
        "ref": "V5-ic-theme"
      }
    },
    {
      "kind": "discovery",
      "locator": "tests/playwright.config.ts",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V5-ic-playwright"
      }
    },
    {
      "kind": "discovery",
      "locator": "vitest.config.ts",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V5-ic-vitest"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-motion.spec.ts:1266",
      "decision": "MIGRATED",
      "reason": {
        "ref": "V5-a-reduced"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-motion.spec.ts:1399",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V5-a-rest"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-motion.spec.ts:622",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V5-a-mouse"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent.spec.ts:435",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V5-a-mouse"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-lists.spec.ts:474",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V5-a-mouse"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-columns.spec.ts:621",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V5-a-mouse"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-sent-footer.spec.ts:448",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V5-a-mouse"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/statement-back-columns.spec.ts:388",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V5-a-mouse"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/entry-sheet.spec.ts:181",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V5-a-mouse"
      }
    },
    {
      "kind": "test",
      "locator": "tests/acceptance/layout-and-install.spec.ts:132",
      "decision": "UNCHANGED_COMPATIBLE",
      "reason": {
        "ref": "V5-a-shown-string"
      }
    }
  ],
  "applicability": "applicable"
}
```

### Adr (Value 5)

```json
{
  "context": {
    "ref": "V5-adr-context"
  },
  "decision": {
    "ref": "V5-adr-decision"
  },
  "alternatives": [
    {
      "ref": "V5-adr-alt-inline"
    },
    {
      "ref": "V5-adr-alt-reuse-switch"
    },
    {
      "ref": "V5-adr-alt-any-pointer"
    },
    {
      "ref": "V5-adr-alt-no-swallow"
    }
  ],
  "consequences": [
    {
      "ref": "V5-adr-con-two-ports"
    },
    {
      "ref": "V5-adr-con-unproven"
    },
    {
      "ref": "V5-adr-con-internal-mark"
    }
  ],
  "status": "proposed",
  "applicability": "applicable"
}
```

### Architect handoff (Value 5)

```json
{
  "sections": [
    {
      "kind": "laws",
      "scope": "value:5",
      "status": {
        "payload": {
          "observations": [
            {
              "id": "V5-O-follow",
              "description": {
                "ref": "V5-ob-follow"
              },
              "result_type": "number",
              "cannot_distinguish": {
                "ref": "V5-ob-follow-cd"
              }
            },
            {
              "id": "V5-O-sheet",
              "description": {
                "ref": "V5-ob-sheet"
              },
              "result_type": "two booleans",
              "cannot_distinguish": {
                "ref": "V5-ob-sheet-cd"
              }
            },
            {
              "id": "V5-O-rise",
              "description": {
                "ref": "V5-ob-rise"
              },
              "result_type": "the named parts that declared a motion",
              "cannot_distinguish": {
                "ref": "V5-ob-rise-cd"
              }
            },
            {
              "id": "V5-O-scroll",
              "description": {
                "ref": "V5-ob-scroll"
              },
              "result_type": "two booleans",
              "cannot_distinguish": {
                "ref": "V5-ob-scroll-cd"
              }
            },
            {
              "id": "V5-O-gesture-count",
              "description": {
                "ref": "V5-ob-gesture-count"
              },
              "result_type": "non-negative integer",
              "cannot_distinguish": {
                "ref": "V5-ob-gesture-count-cd"
              }
            }
          ],
          "equality": {
            "under": [
              "V5-O-follow",
              "V5-O-sheet",
              "V5-O-rise",
              "V5-O-scroll",
              "V5-O-gesture-count",
              "O-shown",
              "O-swipe-at",
              "O-swipe-outcome"
            ],
            "definition": {
              "ref": "V5-eq"
            }
          },
          "constructors": [
            {
              "id": "V5-C-arrive",
              "signature": "arrive(shown: View): void"
            },
            {
              "id": "V5-C-touch-drag",
              "signature": "touchDrag(page: Page, gesture: { from: 'card' | 'list' | 'pane'; dx: number; dy: number; steps: number; ms: number }): Promise<void>"
            }
          ],
          "generators": [],
          "laws": [
            {
              "id": "V5-L-follow",
              "statement": {
                "ref": "V5-law-follow"
              },
              "kind": "invariant",
              "layer": "application",
              "owner": "src/ui/views.ts:117",
              "uses": [
                "V5-O-follow",
                "V5-C-touch-drag",
                "C-swipe-at",
                "C-render-views"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V5-case-drag-card"
                  },
                  {
                    "ref": "V5-case-drag-list"
                  },
                  {
                    "ref": "V5-case-drag-past-end"
                  }
                ],
                "reason": {
                  "ref": "V5-law-follow-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "V5-L-settle",
              "statement": {
                "ref": "V5-law-settle"
              },
              "kind": "invariant",
              "layer": "application",
              "owner": "src/ui/views.ts:137",
              "uses": [
                "O-shown",
                "O-swipe-outcome",
                "V5-C-touch-drag",
                "V5-C-arrive",
                "C-swipe-outcome"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V5-case-flick"
                  },
                  {
                    "ref": "V5-case-slow-past"
                  },
                  {
                    "ref": "V5-case-slow-short"
                  },
                  {
                    "ref": "V5-case-cancel"
                  }
                ],
                "reason": {
                  "ref": "V5-law-settle-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "V5-L-no-sheet",
              "statement": {
                "ref": "V5-law-no-sheet"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/views.ts:117",
              "uses": [
                "V5-O-sheet",
                "V5-C-touch-drag"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V5-case-lift-on-card"
                  },
                  {
                    "ref": "V5-case-tap-no-drag"
                  },
                  {
                    "ref": "V5-case-tap-after"
                  }
                ],
                "reason": {
                  "ref": "V5-law-no-sheet-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "V5-L-rise",
              "statement": {
                "ref": "V5-law-rise"
              },
              "kind": "invariant",
              "layer": "application",
              "owner": "src/ui/views.ts:157",
              "uses": [
                "V5-O-rise",
                "V5-C-arrive",
                "V5-C-touch-drag"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V5-case-release-switch"
                  },
                  {
                    "ref": "V5-case-release-stay"
                  }
                ],
                "reason": {
                  "ref": "V5-law-rise-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "V5-L-scroll",
              "statement": {
                "ref": "V5-law-scroll"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/theme.css:133",
              "uses": [
                "V5-O-scroll",
                "V5-C-touch-drag"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V5-case-drag-down-entries"
                  },
                  {
                    "ref": "V5-case-drag-down-statement"
                  },
                  {
                    "ref": "V5-case-page-sideways"
                  }
                ],
                "reason": {
                  "ref": "V5-law-scroll-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "V5-L-gesture-everywhere",
              "statement": {
                "ref": "V5-law-gesture-everywhere"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/theme.css:133",
              "uses": [
                "V5-O-gesture-count",
                "V5-C-touch-drag",
                "C-render-views"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V5-case-whole-page"
                  }
                ],
                "reason": {
                  "ref": "V5-law-gesture-everywhere-reason"
                },
                "tag": "finite"
              },
              "evidence": {
                "tag": "to_run"
              }
            },
            {
              "id": "V5-L-reduced",
              "statement": {
                "ref": "V5-law-reduced"
              },
              "kind": "invariant",
              "layer": "adapter",
              "owner": "src/ui/views.ts:117",
              "uses": [
                "V5-O-follow",
                "O-shown",
                "V5-C-touch-drag"
              ],
              "treatment": {
                "cases": [
                  {
                    "ref": "V5-case-quiet-switch"
                  },
                  {
                    "ref": "V5-case-quiet-stay"
                  }
                ],
                "reason": {
                  "ref": "V5-law-reduced-reason"
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
              "id": "V5-RL-reuse-switch",
              "statement": {
                "ref": "V5-ref-reuse-switch"
              },
              "cause": "law_scope",
              "counterexample": {
                "ref": "V5-ref-reuse-switch-cx"
              },
              "run": null
            },
            {
              "id": "V5-RL-speed",
              "statement": {
                "ref": "V5-ref-speed"
              },
              "cause": "boundary",
              "counterexample": {
                "ref": "V5-ref-speed-cx"
              },
              "run": null
            }
          ]
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "closure",
      "scope": "value:5",
      "status": {
        "payload": {
          "closures": [
            {
              "subject": {
                "ref": "V5-cl-subject"
              },
              "safety": {
                "statement": {
                  "ref": "V5-cl-safety"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V5-cl-safety-runtime"
                },
                "assumptions": [
                  {
                    "ref": "V5-cl-safety-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "V5-L-settle",
                  "V5-L-no-sheet"
                ],
                "basis": {
                  "argument": [
                    {
                      "ref": "V5-cl-safety-arg1"
                    },
                    {
                      "ref": "V5-cl-safety-arg2"
                    },
                    {
                      "ref": "V5-cl-safety-arg3"
                    }
                  ],
                  "tag": "argued"
                },
                "tag": "claim"
              },
              "inhabitation": {
                "statement": {
                  "ref": "V5-cl-inhab"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V5-cl-runtime-note"
                },
                "assumptions": [
                  {
                    "ref": "V5-cl-inhab-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "V5-L-follow"
                ],
                "basis": {
                  "argument": [
                    {
                      "ref": "V5-cl-inhab-arg1"
                    }
                  ],
                  "tag": "argued"
                },
                "tag": "claim"
              },
              "public_reachability": {
                "statement": {
                  "ref": "V5-cl-reach"
                },
                "design": "PASS",
                "design_note": null,
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V5-cl-runtime-note"
                },
                "assumptions": [
                  {
                    "ref": "V5-cl-safety-assume"
                  }
                ],
                "runs": [],
                "laws": [
                  "V5-L-settle"
                ],
                "basis": {
                  "admitted_input": {
                    "ref": "V5-cl-reach-in"
                  },
                  "producer": "CREATE_NEW:src/ui/swipe.ts::swipeOutcome",
                  "consumer": "src/ui/views.ts:117",
                  "public_observation": {
                    "ref": "V5-cl-reach-obs"
                  },
                  "bootstrap": null,
                  "tag": "path"
                },
                "tag": "claim"
              },
              "liveness": {
                "statement": {
                  "ref": "V5-cl-live"
                },
                "design": "BLOCKED",
                "design_note": {
                  "ref": "V5-cl-live-note"
                },
                "runtime": "DESIGNED_NOT_BUILT",
                "runtime_note": {
                  "ref": "V5-cl-runtime-note"
                },
                "assumptions": [
                  {
                    "ref": "V5-cl-live-assume"
                  }
                ],
                "runs": [],
                "laws": [],
                "basis": {
                  "argument": [
                    {
                      "ref": "V5-d-drag-machine"
                    }
                  ],
                  "tag": "argued"
                },
                "tag": "claim"
              }
            }
          ]
        },
        "tag": "applicable"
      }
    },
    {
      "kind": "model",
      "scope": "value:5",
      "status": {
        "reason": {
          "ref": "V5-model-na"
        },
        "tag": "not_applicable"
      }
    },
    {
      "kind": "scenarios",
      "scope": "value:5",
      "status": {
        "reason": {
          "ref": "V5-scenarios-na"
        },
        "tag": "not_applicable"
      }
    }
  ]
}
```

### Product change (Value 5)

Product change: required

### Verification (Value 5)

Verification command:

```sh
node tests/support/oracle-observation.mjs tests/touch/swipe-views.touch.spec.ts
```

Verification command:

```sh
npm run build
```

Verification command:

```sh
npm run test:unit
```

Verification command:

```sh
npm run test:acceptance
```
