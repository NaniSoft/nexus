// The landing's content, held apart from its presentation.
//
// Every string here traces to the factory's design record, and none of it is a
// capability claim about software that does not exist: the honesty law (in
// development, present tense) is carried by the ticker, the build-order ledger, and
// the hero's nuance line.
//
// **The data is shaped by what the design system takes, and that is the only thing
// this change did to it.** The words are byte for byte the words the old landing
// rendered; what moved is which field holds a word and which component reads it. A
// section is an index and a label because `SectionHeading` takes an index and a
// title; a stage is a title and a body because `FeatureGrid01` takes those, and its
// ordinal is rendered from the position, so the step numbers this file used to carry
// are now derived and the two agree because the list has not been reordered; the
// build order's row is a name, a tier and the published word, because the ledger
// draws the tier as a dot and prints the word.
//
// Nothing was rewritten, and `scripts/content-parity-expectations.json` is where
// every string that did not survive the change of shape is recorded with the reason
// it had nowhere to go.

export const HERO = {
  eyebrow: 'nanisoft · nexus',
  title: 'Software that builds software.',
  lede:
    'Nexus is the Agent Factory. A coding agent takes a GitHub issue and returns a reviewed, merged pull request — one issue, one fresh container, one reviewed change.',
  nuance:
    'NaniSoft’s sites are built by agent development today. Nexus is the engine that makes that repeatable.',
  primaryCta: { label: 'Follow the build', href: '/blog' },
  secondaryCta: { label: 'Read the docs', href: '/docs' },
} as const;

/** The standing facts, as one line of short phrases under the thesis. */
export const TICKER = [
  'status → in active development',
  'design → complete, documented here',
  'loop → issue to reviewed pull request',
  'feedback rounds → max three',
  'release → none yet',
] as const;

/**
 * The name the ticker's region gets.
 *
 * The strip is a `<ul>` with an accessible name and no heading of its own, and the
 * design system requires the name. There is no published string that names a status
 * strip, and this migration may not invent one, so it takes the one name the page
 * already publishes above its own thesis. A screen reader hears the site's own name
 * and then five phrases, which is an honest description of what the region is.
 */
export const TICKER_LABEL = HERO.eyebrow;

/** 01, the loop. */
export const LOOP = {
  index: '01',
  label: 'The loop — issue to reviewed pull request',
  /** The five stages, in the order the work runs. The ordinals are rendered from the position. */
  stages: [
    {
      title: 'Issue',
      body: 'A GitHub issue on a configured repository becomes a work item in Backlog.',
    },
    {
      title: 'Container',
      body: 'A fresh Docker worker starts from the project’s image. Nothing carries over.',
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
  /** The loop's guarantees. */
  notes: [
    {
      title: 'One issue, one fresh container',
      body: 'No cache, no shared working tree, no state from a previous run — or from another project.',
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
} as const;

/**
 * One clause per stage: who acts, which is the part a node mark can carry.
 *
 * The stage bodies are a sentence each and a node mark is a name, so the figure
 * takes the clause that says who does the work rather than the sentence that
 * explains it. The full sentence is a card in section 01, one scroll away.
 */
const LOOP_FIGURE_NOTES = [
  'a repository',
  'fresh, every time',
  'the agent works',
  'a person decides',
  'shipped',
] as const;

/** The observer, which reads the loop and does not change it. */
const LOOP_OBSERVER = {
  id: 'watchers',
  name: 'watchers',
  note: 'the board',
  x: 3 / 4,
  y: 0.1,
} as const;

/**
 * The loop, as the figure the hero draws.
 *
 * The same five stages `LOOP.stages` names, in the same order, read as a graph
 * rather than as a numbered list. The two are not redundant: the list is the
 * argument and the graph is the mechanism, and a reader who wants to know what a
 * stage does scrolls to section 01 while a reader who wants to know that there
 * are five of them sees the rail in the first screen.
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
  panel: {
    label: 'the loop, running',
    mode: 'live',
    footnote:
      'The five stages the factory runs, and the order it runs them in. The marker is the walk an issue takes. The observer is the board, which watches and does not touch.',
  },
} as const;

/** 02, what is inside. Eight entries, all from the design. */
export const INSIDE = {
  index: '02',
  label: 'What’s inside',
  features: [
    {
      title: 'MAF orchestration',
      body: 'The Microsoft Agent Framework drives the factory’s agents, on .NET. OpenCode is reached through NOpenCode.',
    },
    {
      title: 'Per-issue worker containers',
      body: 'Every issue builds in a fresh Docker container from its project’s own image.',
    },
    {
      title: 'Kanban swimlanes',
      body: 'Backlog → Frontier → In Progress → Review → Done, with rejected and escalated states off the flow.',
    },
    {
      title: 'Human feedback loop',
      body: 'Approve, request changes, or reject — on a board that auto-refreshes at port 5000.',
    },
    {
      title: 'Multi-project round-robin',
      body: 'A directory of factories/*.yaml, served in rotation, no project blocking another.',
    },
    {
      title: 'Observability',
      body: 'Structured logs, metrics for builds and rounds, bounded retries, dead-letter escalation.',
    },
    {
      title: 'Testing gates',
      body: 'Unit, Testcontainers integration, end-to-end, and chaos — the failure path is tested, not hoped for.',
    },
    {
      title: 'Security posture',
      body: 'Token scopes at the narrowest that works, secrets in the environment, rootless Docker.',
    },
  ],
} as const;

/** 03, how it is built. The parts it stands on, and the four it builds itself. */
export const STACK = {
  index: '03',
  label: 'How it’s built — compose, don’t fork',
  lede: 'The factory stands on proven parts and builds four things of its own: the orchestrator, the config loader, the Kanban service, and the merge pipeline. Everything else is composition.',
  /** Proven parts the factory stands on. */
  parts: [
    { name: 'Microsoft Agent Framework', role: 'orchestration runtime' },
    { name: 'OpenCode', role: 'coding agent' },
    { name: 'code-server', role: 'in-container editing' },
    { name: 'Docker', role: 'worker containers' },
    { name: 'Docker Compose', role: 'deployment' },
    { name: 'Testcontainers', role: 'integration testing' },
    { name: 'GitHub', role: 'issues in · pull requests out' },
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
      blurb: 'Opens and merges the pull request — the factory’s one recognised output.',
    },
  ],
  caption:
    'The factory composes proven parts and builds four things of its own. Nothing here is a claim about a release — it is the design’s bill of materials.',
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
  index: '04',
  label: 'The build order — where it actually stands',
  lede: 'What the factory is made of, in the order it gets built — and where each piece actually stands.',
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
      detail: 'YAML per project in factories/ — repo, keys, LLM provider, worker image.',
    },
    {
      name: 'Issue → work item',
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
      detail: 'Structured logs, metrics, retries, and dead-letter escalation rendered on the board.',
    },
  ],
  caption:
    'Design is complete and documented here. Implementation is specified and sequenced, and has not started. There are no dates on this site — the blog follows the build.',
} as const;

/**
 * 05, the platform story. Three products, each in its own pack.
 *
 * The rows carry an identifier and nothing else: the name, the pack and the tagline
 * all come from the site's own directory in `lib/site.json`, so a mark can never claim
 * a colour the directory does not hold.
 */
export const PLATFORM = {
  index: '05',
  label: 'Built on Nexus — one platform, one factory',
  lede:
    'Nexus is the core of the platform. Atlas, AlphaLens, and Prism are built on top of it — and Prism is the design language all of them wear.',
  products: ['atlas', 'alphalens', 'prism'],
  caption:
    'Read the platform story in the honest tense: agent development built the products you can visit today. Nexus is the engine designed to make that repeatable, one factory serving every project.',
} as const;

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
  secondaryCta: { label: 'Read the design docs', href: '/docs', variant: 'secondary' },
  footnote:
    'No signup, no waitlist. The design is public, the build is public, and the release gets announced here.',
} as const;
