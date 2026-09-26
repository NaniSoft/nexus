// The landing's content, held apart from its presentation (the split ticket 09
// prescribes: content module shared-per-site, presentation app-local).
//
// Every string here traces to the factory's design — the agent-factory design
// spec and its sequenced build tickets. Nothing is a capability claim about
// software that does not exist: the honesty law (in development, present tense)
// is carried by the ticker, the build-order ledger, and the hero's nuance line.

export const HERO = {
  eyebrow: 'nanisoft · nexus',
  h1Leading: 'Software that builds ',
  h1Em: 'software',
  h1Trailing: '.',
  lede:
    'Nexus is the Agent Factory. A coding agent takes a GitHub issue and returns a reviewed, merged pull request — one issue, one fresh container, one reviewed change.',
  nuance:
    'NaniSoft’s sites are built by agent development today. Nexus is the engine that makes that repeatable.',
  primaryCta: { label: 'Follow the build', url: '/blog' },
  secondaryCta: { label: 'Read the docs', url: '/docs' },
} as const;

export const TICKER = [
  'status → in active development',
  'design → complete, documented here',
  'loop → issue to reviewed pull request',
  'feedback rounds → max three',
  'release → none yet',
] as const;

export const PANEL = {
  label: 'the loop — one issue, one container, one PR',
  aria:
    'Diagram of the Nexus factory: two GitHub issues feed an orchestrator, which starts fresh worker containers running OpenCode; finished builds land on the Kanban review lane and merge as pull requests. Swimlanes run along the bottom.',
} as const;

/** The five stages of the loop — the conveyor rail. */
export const LOOP_STAGES = [
  {
    step: '01',
    title: 'Issue',
    body: 'A GitHub issue on a configured repository becomes a work item in Backlog.',
  },
  {
    step: '02',
    title: 'Container',
    body: 'A fresh Docker worker starts from the project’s image. Nothing carries over.',
  },
  {
    step: '03',
    title: 'Build',
    body: 'code-server and OpenCode work the issue, then the project’s own tests run.',
  },
  {
    step: '04',
    title: 'Review',
    body: 'A human approves, requests changes, or rejects. Three rounds maximum.',
  },
  {
    step: '05',
    title: 'Merge',
    body: 'Approval merges the pull request. A feedback timeout merges rather than holding.',
  },
] as const;

/** The loop's guarantees — the hairline rows under the rail. */
export const LOOP_NOTES = [
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
] as const;

/** What's inside — the capability grid, eight entries, all from the design. */
export const CAPABILITIES = [
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
] as const;

/** Composed, not forked — proven parts the factory stands on. */
export const COMPOSED = [
  { name: 'Microsoft Agent Framework', role: 'orchestration runtime' },
  { name: 'OpenCode', role: 'coding agent' },
  { name: 'code-server', role: 'in-container editing' },
  { name: 'Docker', role: 'worker containers' },
  { name: 'Docker Compose', role: 'deployment' },
  { name: 'Testcontainers', role: 'integration testing' },
  { name: 'GitHub', role: 'issues in · pull requests out' },
  { name: '.NET', role: 'orchestrator runtime' },
] as const;

/** The four things Nanisoft builds itself — the dashed tiles. */
export const IN_HOUSE = [
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
] as const;

export const COMPOSED_NOTE =
  'The factory composes proven parts and builds four things of its own. Nothing here is a claim about a release — it is the design’s bill of materials.' as const;

/** The build order — the status ledger. Ink = done, muted = not started. */
export const BUILD_ORDER = {
  lede: 'What the factory is made of, in the order it gets built — and where each piece actually stands.',
  rows: [
    {
      name: 'The design',
      detail: 'Architecture, configuration model, operations, and the two rules that close the loop.',
      status: 'complete',
    },
    {
      name: 'Project configuration schema',
      detail: 'YAML per project in factories/ — repo, keys, LLM provider, worker image.',
      status: 'specified',
    },
    {
      name: 'Issue → work item',
      detail: 'The poller, and the conversion that puts every issue in Backlog.',
      status: 'specified',
    },
    {
      name: 'Container build worker',
      detail: 'A fresh container per issue, code-server and OpenCode inside, results reported back.',
      status: 'specified',
    },
    {
      name: 'Kanban and the feedback loop',
      detail: 'Five swimlanes at port 5000, three decisions, three rounds, auto-merge on timeout.',
      status: 'specified',
    },
    {
      name: 'Multi-project round-robin',
      detail: 'Every configured project served in rotation, without blocking another’s pipeline.',
      status: 'specified',
    },
    {
      name: 'Observability and error handling',
      detail: 'Structured logs, metrics, retries, and dead-letter escalation rendered on the board.',
      status: 'specified',
    },
  ],
  caption:
    'Design is complete and documented here. Implementation is specified and sequenced, and has not started. There are no dates on this site — the blog follows the build.',
} as const;

/** The platform story — three products, each in its own pack. */
export const BUILT_ON_NEXUS = {
  lede:
    'Nexus is the core of the platform. Atlas, AlphaLens, and Prism are built on top of it — and Prism is the design language all of them wear.',
  caption:
    'Read the platform story in the honest tense: agent development built the products you can visit today. Nexus is the engine designed to make that repeatable, one factory serving every project.',
} as const;

export const FINAL_CTA = {
  h2: 'Nexus is in active development.',
  primary: { label: 'Follow the build', url: '/blog' },
  secondary: { label: 'Read the design docs', url: '/docs' },
  footnote: 'No signup, no waitlist. The design is public, the build is public, and the release gets announced here.',
} as const;
