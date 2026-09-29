import type { ReactElement } from 'react';

import { Section } from '@nanisoft/prism-ui/components/section';
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
 * **The hero shows the loop, and section 01 explains it.** The figure beside the
 * thesis is the same five stages section 01 lists, drawn on one rail with a marker
 * travelling it. The old hero drew that loop on a canvas with a
 * `requestAnimationFrame` loop and a colour read at mount, and the migration took
 * the canvas away and left the thesis with nothing beside it, which is a page
 * describing a factory rather than showing one. This is the same drawing with the
 * two real defects removed: every ink is a token, so a pack boundary above it
 * restyles it through the cascade, and it is complete at first paint, so a reader
 * with scripting off or a print stylesheet sees all five stages rather than an empty
 * frame.
 *
 * **The hero's own catalogue gap is closed.** `Hero01` used to declare an action
 * destination and render a button without it, so the thesis was composed by hand
 * from `Section` plus `SectionHeading` plus `CtaLink` (prism#105). The Block now
 * renders an action with an `href` as a real link and carries the figure as a slot,
 * so the band is the design system's rather than four sites' four grids.
 *
 * **Three gaps remain, all filed, none worked around silently.**
 * `ProcessRail01` admits two, three or four steps and refuses five in the type, and
 * the loop has five, so the stages are a numbered feature grid (prism#107).
 * `ProductGrid01` has no per-row detail line, so the platform rows carry a tagline
 * and nothing else (prism#106). `FeatureGrid01`'s card titles are not headings, so
 * the loop and the capability grid lose their `h3`s and the page's outline is
 * shallower than it was (prism#109).
 *
 * **One band carries a second pack, and it is in `scripts/pack-map.json`.** The three
 * product rows in section 05, and the header's switcher. Every one of those boundaries
 * lands on a `ProductMark`, which is a fully rounded disc, and nowhere else. The rule is
 * arithmetic rather than taste: a pack boundary also re-points `--radius`, and this
 * page's ground is lavender at 0.75rem while the other four run 0.5rem to 1rem, so a
 * section wearing another pack would put that section's index into its corner radius.
 */

export default function Landing(): ReactElement {
  return (
    <>
      {/* The thesis, the page's own h1, and the loop running beside it. */}
      <Hero01
        headingLevel="h1"
        eyebrow={HERO.eyebrow}
        title={HERO.title}
        description={HERO.lede}
        actions={[HERO.primaryCta, HERO.secondaryCta]}
        instrument={
          <InstrumentPanel01
            label={LOOP_FIGURE.panel.label}
            state="live"
            stateLabel={LOOP_FIGURE.panel.mode}
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

      {/* The nuance line, which is the site's honesty device and reads as a
          footnote to the thesis rather than as a second claim beside it. */}
      <Section className="site-band--tight">
        <p className="site-caption">{HERO.nuance}</p>
      </Section>

      {/* The standing facts, as one line of short phrases under the thesis. */}
      <LogoStrip01 items={[...TICKER]} label={TICKER_LABEL} />

      {/* 01, the loop. Five stages, and the four guarantees under them. */}
      <FeatureGrid01
        eyebrow={LOOP.index}
        title={LOOP.label}
        variant="bare"
        numbered
        features={LOOP.stages.map((stage) => ({ title: stage.title, body: stage.body }))}
      />
      <NoteGrid01 notes={LOOP.notes.map((note) => ({ title: note.title, body: note.body }))} />

      {/* 02, what is inside. */}
      <FeatureGrid01
        eyebrow={INSIDE.index}
        title={INSIDE.label}
        variant="bare"
        numbered
        features={INSIDE.features.map((feature) => ({ title: feature.title, body: feature.body }))}
      />

      {/* 03, how it is built: the composed parts, then the four built in house. */}
      <StackGrid01
        eyebrow={STACK.index}
        title={STACK.label}
        description={STACK.lede}
        parts={STACK.parts}
        ownLabel={STACK.ownLabel}
        own={STACK.own}
        caption={STACK.caption}
      />

      {/* 04, the build order. The honesty law, rendered. */}
      <StatusLedger01
        eyebrow={BUILD_ORDER.index}
        title={BUILD_ORDER.label}
        description={BUILD_ORDER.lede}
        rows={BUILD_ORDER.rows}
        caption={BUILD_ORDER.caption}
      />

      {/* 05, the platform story. The one band on this page that carries a second
          pack, and every boundary in it lands on a product's own mark. */}
      <ProductGrid01
        eyebrow={PLATFORM.index}
        title={PLATFORM.label}
        description={PLATFORM.lede}
        products={PLATFORM.products.map((id) => product(id))}
        caption={PLATFORM.caption}
      />

      {/* The single ask. Both actions are anchors, and that is the one rendered change
          the whole migration exists to make: the old page passed a destination to a
          component that rendered a button, so the page's primary action was announced
          as a command that navigated nothing. */}
      <Cta01
        title={FINAL_CTA.title}
        action={FINAL_CTA.primaryCta}
        secondaryAction={FINAL_CTA.secondaryCta}
        note={FINAL_CTA.footnote}
      />
    </>
  );
}
