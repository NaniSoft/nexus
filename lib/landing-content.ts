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
  title: 'Software that builds software.',
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
  'In active development',
  'Design complete, documented here',
  'Issue to reviewed pull request',
  'Three feedback rounds, maximum',
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
      body: 'Approval merges the pull request. A feedback timeout merges rather than holding.',
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
        title: 'Three rounds, then the loop closes',
        body: 'A ticket that comes back three times is an issue that needs rewriting, not a fourth container.',
      },
      {
        title: 'Auto-merge on approval or timeout',
        body: 'Review is where work waits for a decision, not where it is parked.',
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
 */
const LOOP_FIGURE_NOTES = [
  'a repository',
  'fresh, every time',
  'the agent works',
  'a person decides',
  'shipped',
] as const;

/**
 * The observer, which reads the loop and does not change it.
 *
 * It sits a quarter of the way down rather than at the top of the canvas. At the
 * top it was the only thing in the upper half of the drawing, so the figure that
 * claims to show a five-stage loop was half empty, and the emptiness read as a
 * layout accident rather than as a lane nobody is standing in. A person reading
 * the board is close to the review stage, not at the far end of a field.
 */
const LOOP_OBSERVER = {
  id: 'watchers',
  name: 'watchers',
  note: 'the board',
  x: 3 / 4,
  y: 0.25,
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
 * Every string here is the site's own and every one already existed above, so
 * the figure introduces no claim. The node names are the stage titles, the notes
 * are the clause naming each stage's actor, and the aria sentence is the loop's
 * own label.
 *
 * The `lane` on each stage is what makes this a sequence rather than a field,
 * and it is why the drawing carries a rail with a marker travelling it: the
 * order is visible as an order rather than inferred from left-to-right spacing.
 * The observer carries no lane, because it is not a stage, and its edge is
 * indirect, because the board reads the loop without changing it.
 */
export const LOOP_FIGURE = {
  nodes: [
    ...LOOP.stages.map((stage, index) => ({
      id: stage.title.toLowerCase(),
      name: stage.title.toLowerCase(),
      note: LOOP_FIGURE_NOTES[index],
      x: index / (LOOP.stages.length - 1),
      y: 0.62,
      lane: index,
      emphasis: index === 2,
    })),
    LOOP_OBSERVER,
  ],
  relations: [
    { from: 'issue', to: 'container', carries: true },
    { from: 'container', to: 'build', carries: true },
    { from: 'build', to: 'review', carries: true },
    { from: 'review', to: 'merge', carries: true },
    { from: 'watchers', to: 'review', indirect: true },
  ],
  aria:
    'The build loop as five stages on one rail: issue, container, build, review and merge, with a marker travelling between them. A watcher reads the review stage without changing it.',
  /**
   * The panel the figure sits in.
   *
   * The state was `live`, which the design system draws as a success dot beside a
   * word, and the word was the site's own. Together they said a system is
   * updating now, on a page whose ledger two sections down says implementation has
   * not started. `neutral` is the state that says nothing, and the figure beside
   * it is a diagram of a designed loop rather than a readout of a running one,
   * which is what it is.
   */
  panel: {
    label: 'the build loop',
    footnote:
      'The five stages, in the order an issue runs them. The marker is the walk it takes.',
  },
} as const;

/** 02, what is inside. Eight entries, all from the design. */
export const INSIDE = {
  label: 'What’s inside',
  lede: 'The capabilities the design commits to, and the two rules that close the loop.',
  features: [
    {
      title: 'MAF orchestration',
      body: 'The Microsoft Agent Framework drives the factory’s agents, on .NET. OpenCode is reached through NOpenCode.',
    },
    {
      title: 'Per-issue worker containers',
      body: 'Every issue builds in a fresh Docker container from its own project image.',
    },
    {
      title: 'Kanban swimlanes',
      body: 'Backlog, Frontier, In Progress, Review, Done. Rejected and escalated sit off the flow.',
    },
    {
      title: 'Human feedback loop',
      body: 'Approve, request changes, or reject, on a board that auto-refreshes at port 5000.',
    },
    {
      title: 'Multi-project round-robin',
      body: 'A directory of factories/*.yaml, served in rotation, with no project blocking another.',
    },
    {
      title: 'Observability',
      body: 'Structured logs, build and round metrics, bounded retries, dead-letter escalation.',
    },
    {
      title: 'Testing gates',
      body: 'Unit, Testcontainers integration, end to end, and chaos. The failure path is tested, not hoped for.',
    },
    {
      title: 'Security posture',
      body: 'Token scopes at the narrowest that work, secrets in the environment, rootless Docker.',
    },
  ],
} as const;

/** 03, how it is built. The parts it stands on, and the four it builds itself. */
export const STACK = {
  label: 'How it’s built',
  lede: 'The factory stands on proven parts and builds four of its own: the orchestrator, the config loader, the Kanban service, and the merge pipeline.',
  /** Proven parts the factory stands on. */
  parts: [
    { name: 'Microsoft Agent Framework', role: 'orchestration runtime' },
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
      blurb: 'A .NET service on MAF that owns the round state machine and the round-robin loop.',
    },
    {
      name: 'The config loader',
      blurb: 'Validates factories/*.yaml before any downstream component sees a value.',
    },
    {
      name: 'The Kanban service',
      blurb: 'Board state, auto-refresh, and the three decisions, on port 5000.',
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
      status: 'planned',
      statusLabel: 'specified',
      detail: 'YAML per project in factories/: repo, keys, LLM provider, worker image.',
    },
    {
      name: 'Issue to work item',
      status: 'planned',
      statusLabel: 'specified',
      detail: 'The poller, and the conversion that puts every issue in Backlog.',
    },
    {
      name: 'Container build worker',
      status: 'planned',
      statusLabel: 'specified',
      detail: 'A fresh container per issue, code-server and OpenCode inside, results reported back.',
    },
    {
      name: 'Kanban and the feedback loop',
      status: 'planned',
      statusLabel: 'specified',
      detail: 'Five swimlanes at port 5000, three decisions, three rounds, auto-merge on timeout.',
    },
    {
      name: 'Multi-project round-robin',
      status: 'planned',
      statusLabel: 'specified',
      detail: 'Every configured project served in rotation, without blocking another’s pipeline.',
    },
    {
      name: 'Observability and error handling',
      status: 'planned',
      statusLabel: 'specified',
      detail: 'Structured logs, metrics, retries, and dead-letter escalation on the board.',
    },
  ],
  caption:
    'Design is complete and documented here. Implementation is specified and sequenced, and has not started.',
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
