import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01'
import { Badge } from '@nanisoft/prism-ui/components/badge'
import { Diff, type DiffLine } from '@nanisoft/prism-ui/components/diff'
import { PulseGraph } from '@nanisoft/prism-ui/components/pulse-graph'
import { Status } from '@nanisoft/prism-ui/components/status'

import { NexusMark } from '@nanisoft/prism-ui/components/product-marks'

import { LOOP_FIGURE } from '@/lib/landing-content'

/**
 * The hero's instrument: the review moment, and the loop it stands in.
 *
 * The page's claim is that a person decides at the review stage, and the old
 * hero drew five nodes on a rail without ever showing the decision. This panel
 * shows the card a reviewer would meet: the issue, the three decisions, the diff
 * the build produced, and the loop beneath it. The card is example content and
 * the footnote says so; the states are the board's own, and the three decisions
 * are labels rather than controls because a marketing page does not own a
 * reviewer's session.
 *
 * The `PulseGraph` is still the loop the section below explains, so the figure a
 * reader sees first and the five stages they read next are the same five stages.
 * Nothing here claims the factory is running: the panel is neutral, and the words
 * say "designed run" rather than "live".
 *
 * It is a server Component. The only client code in it is inside the Prism
 * components, which are already the site's runtime.
 */
const DIFF: readonly DiffLine[] = [
  { kind: 'context', oldNumber: 42, newNumber: 42, content: 'const delay = 2000' },
  { kind: 'removed', oldNumber: 43, content: 'await sleep(delay)' },
  { kind: 'added', newNumber: 43, content: 'await sleep(backoff(attempt))' },
  { kind: 'added', newNumber: 44, content: 'if (attempt >= MAX_ROUNDS) escalate()' },
]

const DIFF_LABELS = {
  added: 'added',
  removed: 'removed',
  context: 'unchanged',
} as const

export function ReviewPanel() {
  return (
    <InstrumentPanel01
      label="the review, as designed"
      footnote="A designed run: the board the design specifies, with one card on the review lane and the loop that carried it there."
      caption="A review card with the three decisions, the proposed diff and the five-stage loop it belongs to."
      actions={<NexusMark className="size-5" />}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Status tone="info" label="awaiting review" />
          <span className="text-muted-foreground font-mono text-mono">round 1 of 3</span>
        </div>

        <div className="border-border bg-background flex flex-col gap-2 rounded-lg border p-3">
          <span className="text-sm font-semibold tracking-tight">
            Add retry backoff to the poller
          </span>
          <span className="text-muted-foreground text-pretty text-xs">
            The poller retries on a fixed two second delay. Add exponential backoff and a cap.
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">tests pass</Badge>
            <Badge variant="outline">3 files</Badge>
            <Badge variant="outline">one container</Badge>
          </div>
        </div>

        <Diff
          lines={DIFF}
          label="the proposed change"
          labels={DIFF_LABELS}
          file="poller.ts"
          summary="+2 -1"
        />

        <div className="flex flex-wrap gap-1.5">
          <Badge>approve</Badge>
          <Badge variant="secondary">request changes</Badge>
          <Badge variant="outline">reject</Badge>
        </div>

        <div className="border-border border-t pt-2">
          <PulseGraph
            nodes={LOOP_FIGURE.nodes}
            relations={LOOP_FIGURE.relations}
            label={LOOP_FIGURE.aria}
            className="w-full min-w-0"
          />
        </div>
      </div>
    </InstrumentPanel01>
  )
}
