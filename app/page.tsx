import type { ReactElement } from 'react';

import { Cta01 } from '@nanisoft/prism-ui/blocks/cta-01';
import { FeatureGrid01 } from '@nanisoft/prism-ui/blocks/feature-grid-01';
import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01';
import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01';
import { LogoStrip01 } from '@nanisoft/prism-ui/blocks/logo-strip-01';
import { NoteGrid01 } from '@nanisoft/prism-ui/blocks/note-grid-01';
import { ProcessFlow01 } from '@nanisoft/prism-ui/blocks/process-flow-01';
import { ProductGrid01 } from '@nanisoft/prism-ui/blocks/product-grid-01';
import { StackGrid01 } from '@nanisoft/prism-ui/blocks/stack-grid-01';
import { StatusLedger01 } from '@nanisoft/prism-ui/blocks/status-ledger-01';
import { PulseGraph } from '@nanisoft/prism-ui/components/pulse-graph';

import { SiteChrome } from '@/components/site-chrome';
import {
  BUILD_ORDER,
  FINAL_CTA,
  HERO,
  INSIDE,
  LOOP,
  LOOP_FIGURE,
  PLATFORM,
  STACK,
  TICKER,
  TICKER_LABEL,
} from '@/lib/landing-content';
import { product } from '@/lib/site';

/**
 * The landing, composed from the design system's catalogue and nothing else.
 *
 * This file is composition and nothing else: every word is in `lib/landing-content.ts`,
 * every claim about a product is in `lib/site.json`, and every rule about what a Block
 * may be given belongs to the design system. There is no local component here and no
 * local stylesheet, which is the point: the old page needed a client boundary, a
 * scroll-reveal observer, a canvas of looping packets, a hand-written graph and eleven
 * kilobytes of CSS to draw what the catalogue draws.
 *
 * It is a server component. It ships no client JavaScript, takes no hook, reads no
 * context, and needs no provider mounted above it, because every item resolves its
 * colours through the cascade rather than by reading a value once at mount. That
 * includes the hero's figure, which is a server-rendered drawing animated by the
 * design system's own stylesheet: the loop runs and the site still ships no runtime.
 *
 * **The hero shows the loop, and the section below it explains it.** The figure beside
 * the thesis is the same five stages the first section lists, drawn on one rail with a
 * marker travelling it. The old hero drew that loop on a canvas with a
 * `requestAnimationFrame` loop and a colour read at mount, and the migration took
 * the canvas away and left the thesis with nothing beside it, which is a page
 * describing a factory rather than showing one. This is the same drawing with the
 * two real defects removed: every ink is a token, so a pack boundary above it
 * restyles it through the cascade, and it is complete at first paint, so a reader
 * with scripting off or a print stylesheet sees all five stages rather than an empty
 * frame.
 *
 * **The hero carries three text elements, and the fourth was a decoration.** The
 * `eyebrow` used to be this site's own name, which the Block draws as a rounded badge
 * and the header already draws as a wordmark forty pixels higher up. A pill that says
 * the same word twice is not information, and the thesis, the one line under it and
 * the two actions are the whole of what a reader needs before they scroll. The
 * nuance line that used to be a band of its own is gone for the same reason: it said
 * what the platform section at the foot of the page says, in the same words, and a
 * page that argues its platform story twice is a page that has not noticed it has
 * already said it.
 *
 * **No section carries an ordinal.** Five bands used to open with a bare `01` through
 * `05`, passed through the `eyebrow` prop because `SectionHeading` keeps its `index` on
 * a prop these blocks do not expose. A number above a heading is only meaningful
 * beside the heading it counts, and a reader arriving at `03` from a search result
 * has no idea what three was counting. What the numbers were actually carrying is
 * still there, and it is now the design system's own continuity mechanism rather than
 * a prop: the flow draws `01` to `05` down the five stages because a wrapped sequence
 * is only legible if a reader who lands on stage four can see that it continues
 * stage three, and the eight capabilities carry nothing because eight capabilities
 * are a set.
 *
 * **One band carries a second pack, and it is in `scripts/pack-map.json`.** The three
 * product rows in the last section, and the header's switcher. Every one of those
 * boundaries lands on a `ProductMark`, which is a fully rounded disc, and nowhere
 * else. The rule is arithmetic rather than taste: a pack boundary also re-points
 * `--radius`, and this page's ground is lavender at 0.75rem while the other four run
 * 0.5rem to 1rem, so a section wearing another pack would put that section's
 * index into its corner radius.
 *
 * **Nine bands and nine shapes, and the one thing that made two of them the same is
 * gone.** Every band on this page is a `max-w-page` column with a left-aligned
 * `SectionHeading` on the design system's own `py-16 sm:py-24`, and six of the nine carry
 * that padding as the identical class string. That frame is not this site's to change:
 * `Section` owns it and every Block composes it, so a band cannot leave it without
 * restyling a catalogue item. What was inside the frame was, and that is the only lever
 * a consumer has. Measured on the built export at 1440 before the repair: three bands
 * drawing twenty-five identical `[data-slot="card"]` boxes (five loop stages, eight
 * capabilities, eight stack parts and four in-house parts), a fourth drawing four
 * hairline notes, a five-row-worth ledger of seven, and three marked product rows. The
 * loop's five stages and the eight capabilities were in the same two-column grid of
 * 532.00px tracks. Read as a page that is one section repeated six times, which is what
 * bland is when a stylesheet is not at fault.
 *
 * The lever is spent once, on the loop: five stages in an order are a sequence, and a
 * sequence five long cannot be a rail (`ProcessRail01` holds two, three or four and a
 * five-element array is a compile error, deliberately) and should not be a
 * grid of cards. `ProcessFlow01` is the shape the catalogue draws a wrapping sequence
 * in, and its own note says why it exists: a rail that quietly dropped a stage to fit a
 * width would be a diagram of a process that is not the process. So the loop stopped
 * being five cards and became five stages on a thread, and the 532.00px of empty track
 * that used to sit beside a bordered "Merge" card is now 363.00px of unwritten track
 * with no box in it or around anything near it. The nine bands now draw nine different
 * families: a split hero, a strip, a flow, a definition list, a two-column card grid, a
 * four-column survey grid, a ledger, marked rows, and a filled panel.
 *
 * **Three gaps remain, all recorded, none worked around silently.** `NoteGrid01` puts
 * four notes in three columns at `lg`, so the fourth sits beside an empty 341.33px
 * track above `sm`'s two, against the Block's own note that four notes is the
 * comfortable case. `StackGrid01` draws its eight parts and its four in-house parts as
 * two grids of the same 263.00px shape, which is the Block's own arrangement and not a
 * composition, and its type floors are being lifted in the package. And
 * `FeatureRows01` was measured and rejected for the eight capabilities
 * rather than used for them: a row with no media still renders `lg:grid-cols-2`, so
 * eight of them would put eight empty 512.00px tracks beside eight copy columns, which is
 * the defect being repaired eight times over instead of once.
 *
 * None of the three is filed upstream, and this repository does not file them: a consumer
 * holds data, and an issue filed from here would name a Block's arrangement in a
 * repository that has never read this page.
 */

/**
 * The flow's own two layout props, and the arithmetic that chose them.
 *
 * Five stages divide by nothing but one, so every column count leaves a partial last
 * line, and the count is therefore a choice between which partial line is least empty
 * rather than a way of avoiding one. At 1440 the container is `min(1440, 72rem) - 2 x
 * 2rem` = 1088px, and the flow separates its columns by the single pixel the Block
 * calls a thread rather than by a gap. Three columns leave a last line of two stages
 * beside 363.00px of unwritten track; two leave one stage beside 544.50px; four leave
 * one beside 816.75px. Three is the smallest of the three, it is the Block's own
 * default, and it is the only one of them whose first line holds three stages rather
 * than two or four. The unwritten track is not a void a card could have sat in: the
 * flow draws no box around any stage, so the last line is two more stages on a thread
 * rather than two cards and a hole.
 *
 * `finalLabel` names the state the flow ends in. The loop's last stage is Merge, and
 * `merged` is the word for the state rather than for the stage, which is the whole of
 * what the prop is for.
 */
const LOOP_FLOW_COLUMNS = 3;
const LOOP_FLOW_FINAL_LABEL = 'merged';

export default function Landing(): ReactElement {
  return (
    <SiteChrome>
      {/* The thesis, the page's own h1, and the loop drawn beside it. */}
      <Hero01
        headingLevel="h1"
        title={HERO.title}
        description={HERO.lede}
        actions={[HERO.primaryCta, HERO.secondaryCta]}
        instrument={
          <InstrumentPanel01
            label={LOOP_FIGURE.panel.label}
            caption={LOOP_FIGURE.aria}
            footnote={LOOP_FIGURE.panel.footnote}
          >
            <PulseGraph
              nodes={LOOP_FIGURE.nodes}
              relations={LOOP_FIGURE.relations}
              label={LOOP_FIGURE.aria}
            />
          </InstrumentPanel01>
        }
      />

      {/* The standing facts, as one line of short phrases under the thesis. */}
      <LogoStrip01 items={[...TICKER]} label={TICKER_LABEL} />

      {/* The loop. Five stages, in order, and the four guarantees under them. */}
      <ProcessFlow01
        title={LOOP.label}
        description={LOOP.lede}
        columns={LOOP_FLOW_COLUMNS}
        finalLabel={LOOP_FLOW_FINAL_LABEL}
        stages={LOOP.stages.map((stage) => ({ name: stage.title, description: stage.body }))}
      />
      <NoteGrid01
        title={LOOP.notes.label}
        notes={LOOP.notes.items.map((note) => ({ title: note.title, body: note.body }))}
      />

      {/* What is inside. A set, so nothing on it is numbered. */}
      <FeatureGrid01
        title={INSIDE.label}
        description={INSIDE.lede}
        variant="bare"
        features={INSIDE.features.map((feature) => ({ title: feature.title, body: feature.body }))}
      />

      {/* How it is built: the composed parts, then the four built in house. */}
      <StackGrid01
        title={STACK.label}
        description={STACK.lede}
        parts={STACK.parts}
        ownLabel={STACK.ownLabel}
        own={STACK.own}
        caption={STACK.caption}
      />

      {/* The build order. The honesty law, rendered. */}
      <StatusLedger01
        title={BUILD_ORDER.label}
        description={BUILD_ORDER.lede}
        rows={BUILD_ORDER.rows}
        caption={BUILD_ORDER.caption}
      />

      {/* The platform story. The one band on this page that carries a second
          pack, and every boundary in it lands on a product's own mark. */}
      <ProductGrid01
        title={PLATFORM.label}
        description={PLATFORM.lede}
        products={PLATFORM.products.map((id) => product(id))}
        caption={PLATFORM.caption}
      />

      {/* The single ask. Both actions are anchors, and both carry the same label the
          hero and the About page use for the same destination. */}
      <Cta01
        title={FINAL_CTA.title}
        action={FINAL_CTA.primaryCta}
        secondaryAction={FINAL_CTA.secondaryCta}
        note={FINAL_CTA.footnote}
      />
    </SiteChrome>
  );
}
