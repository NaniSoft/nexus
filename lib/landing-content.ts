// The landing's content, held apart from its presentation.
//
// Every string here traces to the factory's design record, and none of it is a
// capability claim about software that does not exist: the honesty law (in
// development, present tense) is carried by the ticker, the build-order ledger, and
// the closing band.
//
// **The copy was cut, not restyled.** The words are the factory's, and the claims
// are the same claims; what changed is how much of each one the page says out loud.
// A section title that used to carry its own argument after an em-dash now carries
// the argument in the section's description, where it applies to the whole section
// rather than to half a line of a heading. A lede that ran to three lines beside a
// two-line headline now runs to two. An arrow glyph that sat in front of each of the
// five standing facts is gone, because a fact that has to be prefixed to be read is
// a label rather than a fact. Every rule of the tone is the same rule: the page
// should be able to say something in fewer words, and a page that cannot is a page
// that has not decided what it is for.
//
// Three things did not move. The five stages of the loop and the four guarantees
// under them are the argument, and they are still five and four. The eight
// capabilities and the eight parts are the design's substance, and both sets are
// still whole. The build-order ledger is the honesty law, and every row of it still
// says what it said.
//
// **No em-dash, no arrow, no middle dot.** A dash used as punctuation is the single
// most recognisable tell of a page that was written by something rather than by
// someone, and this page's whole claim is that a person is in the loop. The
// standing facts are bare phrases and the separators are the gaps between them.

export const HERO = {
  title: 'Industrializing software delivery with AI agents.',
  lede: 'A coding agent takes a GitHub issue and returns a reviewed, merged pull request. One issue, one fresh container.',
  primaryCta: { label: 'Follow the build', href: '/blog' },
  secondaryCta: { label: 'Read the docs', href: '/docs' },
} as const;

/**
 * The standing facts, as one line of short phrases under the thesis.
 *
 * Five phrases and no separators. The strip is read as a list because it is a
 * `ul` with an accessible name, so a reader is told how many there are before the
 * first one, and the phrases can therefore be phrases rather than `key → value`
 * pairs. "In active development" is the fact; what the key would have been is
 * obvious from the sentence above it.
 */
export const TICKER = [
  'Running, end to end',
  'Issue to reviewed pull request',
  'Three feedback rounds, then it escalates',
  'Auto-merge off by default',
  'No release yet',
] as const;

/**
 * The name the ticker's region gets.
 *
 * The strip is a `ul` with an accessible name and no heading of its own, and the
 * design system requires the name. The strip is the place this site says where the
 * factory stands, so the region is named for that, and a screen reader hears what
 * the line of phrases is before it hears the phrases.
 */
export const TICKER_LABEL = 'Where Nexus stands';

/** 01, the loop. */
export const LOOP = {
  label: 'The loop',
  lede: 'One issue in, one reviewed pull request out. A person decides at the review stage.',
  /** The five stages, in the order the work runs. The ordinals are rendered from the position. */
  stages: [
    {
      title: 'Issue',
      body: 'A GitHub issue on a configured repository becomes a work item in Backlog.',
    },
    {
      title: 'Container',
      body: 'A fresh Docker worker starts from the project’s own image. Nothing carries over.',
    },
    {
      title: 'Build',
      body: 'code-server and OpenCode work the issue, then the project’s own tests run.',
    },
    {
      title: 'Review',
      body: 'A human approves, requests changes, or rejects. Three rounds maximum.',
    },
    {
      title: 'Merge',
      body: 'Approval merges the pull request from the host. On the third round it escalates instead.',
    },
  ],
  /**
   * The loop's guarantees, as a titled section of their own.
   *
   * They were a `dl` with no heading, floating under the card grid above them, and
   * four points that arrive with no name read as an afterthought to whatever was
   * above. A title is the whole fix: the same four points, now a section a reader
   * can point at.
   */
  notes: {
    label: 'What the loop guarantees',
    items: [
      {
        title: 'One issue, one fresh container',
        body: 'No cache, no shared working tree, and no state from a previous run or from another project.',
      },
      {
        title: 'Three rounds, then it escalates',
        body: 'A ticket that comes back three times parks for a human. It is never merged over an objection.',
      },
      {
        title: 'Auto-merge off by default',
        body: 'Approval merges. A timeout can merge, once an operator turns it on deliberately.',
      },
      {
        title: 'Nothing ends in silence',
        body: 'Rejected and escalated tickets render on the board, where the people watching are already looking.',
      },
    ],
  },
} as const;

/**
 * One clause per stage: who acts, which is the part a node mark can carry.
 *
 * The stage bodies are a sentence each and a node mark is a name, so the figure
 * takes the clause that says who does the work rather than the sentence that
 * explains it. The full sentence is a card in the section above, one scroll away.
 *
 * **A clause here is also a width, and the width is the caller's.** `PulseGraph`
 * prints each note centred under its own mark on a lane `LOOP_FIGURE_SPAN` below
 * sets, and it says plainly that it cannot know whether two of a caller's labels
 * will collide. `lib/figure` publishes the face's own advance as `MONO_ADVANCE`,
 * 0.6 of the type size, so at the 12 units a note is drawn at one character is 7.2
 * units wide and the two longest clauses that share a lane are `fresh, every time`
 * at 17 and `the agent works` at 15: together 115.2 units of half-widths, which is
 * what a lane has to be before those two can sit in it at all. That budget is the
 * whole reason the geometry below is what it is, so a longer clause is a shorter
 * span rather than a wider drawing.
 */
const LOOP_FIGURE_NOTES = [
  'one repo',
  'fresh each time',
  'the build',
  'a human reviews',
  'shipped',
] as const;

/**
 * The figure's geometry, which is two numbers and the span between them.
 *
 * The canvas is a fixed sixteen-by-nine, and `PulseGraph` fits the caller's box into it
 * with one uniform scale and no stretch, so neither number below is where anything lands
 * on the page. They are a span: `fitPoints` takes the caller's own smallest and largest
 * of each axis and maps them onto the fitted rectangle, so whichever node holds the
 * smallest `y` renders at the top of that rectangle and whichever holds the largest
 * renders at its foot, and the only number that changes the picture is the distance
 * between the two.
 *
 * **The span was 0.54 and the node notes printed over one another; then 0.36, and the
 * fifth stage left the panel.** A fitted box is `min(roomX / spanX, roomY / spanY)`,
 * and `spanX` is 1 because the five stages run the full width, so the lane pitch is
 * `roomY / spanY / 4` and the uniform scale is that same `roomY / spanY` while it is
 * the smaller of the two. A smaller span buys label clearance and spends panel width:
 * at 0.36 the pitch was 125.17 units against 115.2 of half-widths for the widest
 * adjacent pair, but the scale rose to 500.7 and the ink ran to canvas 593.4, which is
 * 64 units past the 529px edge of `Hero01`'s `lg:grid-cols-[5fr_6fr]` column at 1440.
 *
 * **The notes are the lever that ends the trade.** The budget is arithmetic: at 12
 * units a note character advances 7.2 units (`MONO_ADVANCE`, 0.6 of the size), so the
 * widest adjacent pair needs `3.6 x (lenA + lenB)` of lane. A first pass cut the notes
 * to a 28-character widest pair and span 0.44, and the rendered page still clipped the
 * fifth stage at 1440: the measured panel was optimistic by a few units, and a margin
 * computed to fit exactly is a margin that does not. The notes were cut again, to a
 * 24-character widest pair (`fresh each time` beside `the build`, and the same again
 * on the review side), and the span rose to 0.47: the pitch is 180.25 / 0.47 / 4 =
 * 95.88 units against a worst-case label need of 3.6 x 24 + 7 = 93.4, and the scale
 * falls to 383.5, so the ink runs from canvas 113.5 to 497.0, which is 32 units inside
 * the 529px panel edge at 1440 instead of six units from it. At 1024 the column is
 * 459px and the drawing scrolls the last few units, which is the width the old figure
 * already scrolled at every width.
 *
 * A shorter note is the honest cut: each one names the actor of its stage, and the
 * full sentence for every stage is a card in the section below. Nothing else moved:
 * the same five stages, the same five notes in the same job, the same relation from
 * the board to the review stage, on the same 640 x 360 canvas in the same panel.
 */
const LOOP_STAGE_Y = 0.62;
const LOOP_FIGURE_SPAN = 0.47;
const LOOP_OBSERVER_Y = LOOP_STAGE_Y - LOOP_FIGURE_SPAN;

/**
 * The observer, which reads the loop and does not change it.
 *
 * It is drawn above the middle of the rail rather than above the review stage, and
 * the reason is geometry rather than semantics. A drawing with one row of nodes
 * collapses into a thin band with more dead canvas than line, and a drawing with one
 * node off the rail on the right leaves the whole top left of the panel empty. A node
 * above the middle fills the top of the box, leaves two corners rather than one hole,
 * and still reads as what it is: something above the loop, looking down at it.
 */
const LOOP_OBSERVER = {
  id: 'watchers',
  name: 'watchers',
  note: 'the board',
  x: 1 / 2,
  y: LOOP_OBSERVER_Y,
} as const;

/**
 * The loop, as the figure the hero draws.
 *
 * The same five stages `LOOP.stages` names, in the same order, read as a graph
 * rather than as a numbered list. The two are not redundant: the list is the
 * argument and the graph is the mechanism, and a reader who wants to know what a
 * stage does scrolls to the section below while a reader who wants to know that
 * there are five of them sees the rail in the first screen.
 *
 * The five stages are the drawing. The board is not a stage, so it carries no lane
 * and no marker, and its edge is the indirect one: the board reads the review stage
 * without changing it. A field node beside a rail is the second claim in the same
 * picture, and it is placed where it fills the drawing rather than where it would be
 * tidiest, because a picture whose second claim is half empty is a picture where the
 * first one is hard to read.
 *
 * Every string here is the site's own and every one already existed above, so the
 * figure introduces no claim. The node names are the stage titles and the notes are
 * the clause naming each stage's actor.
 *
 * The `lane` on each stage is what makes this a sequence rather than a field, and it
 * is why the drawing carries a rail with a marker travelling it: the order is
 * visible as an order rather than inferred from left-to-right spacing.
 */
export const LOOP_FIGURE = {
  nodes: [
    ...LOOP.stages.map((stage, index) => ({
      id: stage.title.toLowerCase(),
      name: stage.title.toLowerCase(),
      note: LOOP_FIGURE_NOTES[index],
      // The fit renormalises the caller's x span onto its own padded drawing, so the
      // ends always sit at the fit's padding: what keeps `issue` and `merge` and their
      // notes inside the canvas is the component's padding (56 units) against the
      // width of the end labels, and the notes above are cut to the shortest clauses
      // that clear it. The drawing is also width-hooked to its panel in the page's
      // composition, so the whole rail scales rather than scrolls.
      x: index / (LOOP.stages.length - 1),
      y: LOOP_STAGE_Y,
      lane: index,
      emphasis: index === 2,
    })),
    LOOP_OBSERVER,
  ],
  relations: [
    ...LOOP.stages.slice(0, -1).map((stage, index) => ({
      from: stage.title.toLowerCase(),
      to: LOOP.stages[index + 1]?.title.toLowerCase() ?? '',
      carries: true,
    })),
    { from: 'watchers', to: 'review', indirect: true },
  ],
  aria:
    'The build loop as five stages on one rail: issue, container, build, review and merge, with a marker travelling between them in that order. A watcher reads the review stage without changing it.',
  /**
   * The panel the figure sits in.
   *
   * The state was `live`, which the design system draws as a success dot beside a
   * word, and the word was the site's own. Together they said a system is
   * updating now, on a page whose ledger two sections down says implementation has
   * not started. `neutral` is the state that says nothing, and the figure beside it
   * is a diagram of a designed loop rather than a readout of a running one, which is
   * what it is.
   */
  panel: {
    label: 'the build loop',
    footnote:
      'The five stages an issue runs through, and the board above them, which watches and does not touch.',
  },
} as const;

/** 02, what is inside. Eight entries, all from the design. */
export const INSIDE = {
  label: 'What’s inside',
  lede: 'The capabilities the design commits to, and the two rules that close the loop.',
  features: [
    {
      title: 'One deterministic loop',
      body: 'A hand-rolled state machine owns the factory’s policy. OpenCode is reached through NOpenCode.',
    },
    {
      title: 'Per-issue worker containers',
      body: 'Every issue builds in a fresh Docker container from its own project image. No host path, no published port.',
    },
    {
      title: 'Kanban swimlanes',
      body: 'Backlog, Frontier, In Progress, Review, Done. Rejected and escalated sit off the flow.',
    },
    {
      title: 'Human feedback loop',
      body: 'Approve, request changes, or reject, on a board that auto-refreshes at port 5000 and shows the diff.',
    },
    {
      title: 'Multi-project round-robin',
      body: 'A directory of factories/*.yaml, served in rotation, with no project blocking another.',
    },
    {
      title: 'Observability',
      body: 'Structured logs, build and round metrics, bounded retries, and escalation onto the board.',
    },
    {
      title: 'Testing gates',
      body: 'One application seam for policy, real containers and real repositories beneath it. The failure path is tested.',
    },
    {
      title: 'Security posture',
      body: 'Token scopes at the narrowest that work, and the write token never inside a worker container.',
    },
  ],
} as const;

/** 03, how it is built. The parts it stands on, and the four it builds itself. */
export const STACK = {
  label: 'How it’s built',
  lede: 'The factory stands on proven parts and builds four of its own: the orchestrator, the config loader, the Kanban service, and the merge pipeline.',
  /** Proven parts the factory stands on. */
  parts: [
    { name: 'OpenCode', role: 'coding agent' },
    { name: 'code-server', role: 'in-container editing' },
    { name: 'Docker', role: 'worker containers' },
    { name: 'Docker Compose', role: 'deployment' },
    { name: 'Testcontainers', role: 'integration testing' },
    { name: 'GitHub', role: 'issues in, pull requests out' },
    { name: '.NET', role: 'orchestrator runtime' },
  ],
  /** The four things Nanisoft builds itself. */
  ownLabel: 'built by Nanisoft',
  own: [
    {
      name: 'The orchestrator',
      blurb: 'A deterministic state machine that owns the round transitions and the round-robin loop.',
    },
    {
      name: 'The config loader',
      blurb: 'Validates factories/*.yaml before any downstream component sees a value.',
    },
    {
      name: 'The Kanban service',
      blurb: 'The diff, the round count and the three decisions on port 5000. It holds no state of its own.',
    },
    {
      name: 'The merge pipeline',
      blurb: 'Opens and merges the pull request, the factory’s one recognised output.',
    },
  ],
  caption: 'What the factory is made of. None of it is a claim about a release.',
} as const;

/**
 * 04, the build order. The honesty law, rendered.
 *
 * `status` is the tier the ledger draws as a dot and `statusLabel` is the word it
 * prints. The two are separate fields because they are separate claims: the design
 * system publishes four tiers and this factory uses two of them, and the word under
 * the dot is the site's own vocabulary rather than the design system's. Collapsing
 * them would put a design-system word into a page whose whole point is that its words
 * are the factory's.
 */
export const BUILD_ORDER = {
  label: 'Where it stands',
  lede: 'What the factory is made of, in the order it gets built, and where each piece is today.',
  rows: [
    {
      name: 'The design',
      status: 'designed',
      statusLabel: 'complete',
      detail: 'Architecture, configuration model, operations, and the two rules that close the loop.',
    },
    {
      name: 'Project configuration schema',
      status: 'live',
      statusLabel: 'running',
      detail: 'YAML per project in factories/: repo, worker image, LLM model, two key names.',
    },
    {
      name: 'Issue to work item',
      status: 'live',
      statusLabel: 'running',
      detail: 'The poller, and the conversion that puts every issue in Backlog.',
    },
    {
      name: 'Container build worker',
      status: 'live',
      statusLabel: 'running',
      detail: 'A fresh container per round, OpenCode inside, one result file lifted out.',
    },
    {
      name: 'Kanban and the feedback loop',
      status: 'live',
      statusLabel: 'running',
      detail: 'Five swimlanes at port 5000, the diff on the card, three decisions, three rounds.',
    },
    {
      name: 'Multi-project round-robin',
      status: 'live',
      statusLabel: 'running',
      detail: 'Every configured project served in rotation, without blocking another’s pipeline.',
    },
    {
      name: 'Observability and error handling',
      status: 'live',
      statusLabel: 'running',
      detail: 'Structured logs, metrics, bounded retries, and escalation onto the board.',
    },
  ],
  caption:
    'Every row is running. There is still no release to install, and the board binds to this machine only.',
} as const;

/**
 * 05, the platform story. Three products, each in its own pack.
 *
 * The rows carry an identifier and nothing else: the name, the pack and the tagline
 * all come from the site's own directory in `lib/site.json`, so a mark can never claim
 * a colour the directory does not hold.
 */
export const PLATFORM = {
  label: 'Built on Nexus',
  lede: 'Nexus is the core of the platform. Atlas, AlphaLens, and Prism are built on top of it.',
  products: ['atlas', 'alphalens', 'prism'],
  caption:
    'Read that in the honest tense: agent development built the products you can visit today, and Nexus is the engine to make it repeatable.',
} as const;

/**
 * The one ask.
 *
 * Both actions are anchors, and that is the one rendered change the whole migration
 * exists to make: the old page passed a destination to a component that rendered a
 * button, so the page's primary action was announced as a command that navigated
 * nothing. The two labels are the same two words the hero and the About page use for
 * the same two destinations, because a page that says "Read the docs" at the top and
 * "Read the design docs" at the bottom has published two names for one door.
 */
export const FINAL_CTA = {
  title: 'Nexus is in active development.',
  primaryCta: { label: 'Follow the build', href: '/blog' },
  /**
   * The closing band's second action, and the one prop on it that is not copy.
   *
   * The block draws a filled primary panel and puts its two actions inside it. The
   * first action's default is a secondary fill, which is legible on that panel. The
   * second's default is the outline variant, whose fill is the page ground and whose
   * ink is inherited from the panel, so in dark mode the two resolve to the same
   * near-neutral and the button measures 1.01:1. Nothing throws and the page looks
   * right in light mode. `scripts/check-cascade.mjs` found it by resolving the pair in
   * both modes, and the gap is filed against the design system rather than worked
   * around in a stylesheet: `secondary` is a value the block's own action type already
   * offers, so this is the block used as it is declared.
   */
  secondaryCta: { label: 'Read the docs', href: '/docs', variant: 'secondary' },
  footnote: 'The design and the build are both public. There is no release to announce yet.',
} as const;
