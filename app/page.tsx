import type { ReactElement } from 'react';

import { Cta01 } from '@nanisoft/prism-ui/blocks/cta-01';
import { FeatureGrid01 } from '@nanisoft/prism-ui/blocks/feature-grid-01';
import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01';
import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01';
import { LogoStrip01 } from '@nanisoft/prism-ui/blocks/logo-strip-01';
import { NoteGrid01 } from '@nanisoft/prism-ui/blocks/note-grid-01';
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
 * still there: the five stages are numbered, because five stages in an order is a
 * sequence, and the eight capabilities are not, because eight capabilities are a set
 * and a number on a card would claim otherwise.
 *
 * **One band carries a second pack, and it is in `scripts/pack-map.json`.** The three
 * product rows in the last section, and the header's switcher. Every one of those
 * boundaries lands on a `ProductMark`, which is a fully rounded disc, and nowhere
 * else. The rule is arithmetic rather than taste: a pack boundary also re-points
 * `--radius`, and this page's ground is lavender at 0.75rem while the other four run
 * 0.5rem to 1rem, so a section wearing another pack would put that section's
 * index into its corner radius.
 *
 * **Two gaps remain, both filed, neither worked around silently.** `ProcessRail01`
 * admits two, three or four steps and refuses five in the type, and the loop has five,
 * so the stages are a numbered feature grid (prism#107). `FeatureGrid01`'s card titles
 * are not headings, so the loop and the capability grid lose their `h3`s and the
 * page's outline is shallower than it should be (prism#109).
 */

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
      <FeatureGrid01
        title={LOOP.label}
        description={LOOP.lede}
        variant="bare"
        numbered
        features={LOOP.stages.map((stage) => ({ title: stage.title, body: stage.body }))}
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
