import type { ReactElement } from 'react';

import { CtaLink } from '@nanisoft/prism-ui/components/cta-link';
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section';
import { Cta01 } from '@nanisoft/prism-ui/blocks/cta-01';
import { FeatureGrid01 } from '@nanisoft/prism-ui/blocks/feature-grid-01';
import { LogoStrip01 } from '@nanisoft/prism-ui/blocks/logo-strip-01';
import { NoteGrid01 } from '@nanisoft/prism-ui/blocks/note-grid-01';
import { ProductGrid01 } from '@nanisoft/prism-ui/blocks/product-grid-01';
import { StackGrid01 } from '@nanisoft/prism-ui/blocks/stack-grid-01';
import { StatusLedger01 } from '@nanisoft/prism-ui/blocks/status-ledger-01';

import {
  BUILD_ORDER,
  FINAL_CTA,
  HERO,
  INSIDE,
  LOOP,
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
 * local stylesheet beyond three class rules, which is the point of the migration: the
 * old page needed a client boundary, a scroll-reveal observer, a canvas of looping
 * packets, a hand-written graph and eleven kilobytes of CSS to draw what nine
 * catalogue items draw.
 *
 * It is a server component. It ships no client JavaScript, takes no hook, reads no
 * context, and needs no provider mounted above it, because every item resolves its
 * colours through the cascade rather than by reading a value once at mount.
 *
 * **What went, and why there is nothing to replace it with.** The old hero carried an
 * instrument panel whose only content was a canvas drawing the loop as packets that
 * travelled along a rail; a canvas paints pixels it has already resolved, so a
 * resolved value does not move when the pack beneath it does, which is the same defect
 * the old page had in JavaScript elsewhere. The panel and the canvas go, and with them
 * the two strings that named the panel: one named a drawing that is not on the page and
 * the other described a swimlane diagram the page never drew. The loop itself is now
 * the five stages as a numbered grid, which is text, and a text loop is the loop.
 *
 * **Three catalogue gaps, all filed, none worked around silently.** `Hero01` declares
 * an action destination and renders a button without it, so the thesis is composed
 * from `Section` plus `SectionHeading` plus `CtaLink` (prism#105). `ProcessRail01`
 * admits two, three or four steps and refuses five in the type, and the loop has five,
 * so the stages are a numbered feature grid (prism#107). `ProductGrid01` has no
 * per-row detail line, so the platform rows carry a tagline and nothing else
 * (prism#106). `FeatureGrid01`'s card titles are not headings, so the loop and the
 * capability grid lose their `h3`s and the page's outline is shallower than it was
 * (prism#109).
 *
 * **One band carries a second pack, and it is in `scripts/pack-map.json`.** The three
 * product rows in section 05, and the header's switcher. Every one of those boundaries
 * lands on a `ProductMark`, which is a fully rounded disc, and nowhere else. The rule is
 * arithmetic rather than taste: a pack boundary also re-points `--radius`, and this
 * page's ground is lavender at 0.75rem while the other four run 0.5rem to 1rem, so a
 * section wearing another pack would put that section's index into its corner radius.
 *
 * Three class names here are this site's own and none is a Prism utility written by
 * hand. A consumer does not run Tailwind, so a utility exists in the emitted stylesheet
 * only if a Prism component already uses it: `mb-12` is safe, and a utility Prism
 * happens not to use would silently do nothing.
 */

/** The two calls to action under the thesis, as real links. */
function heroActions(): ReactElement {
  return (
    <div className="site-hero__actions">
      <CtaLink href={HERO.primaryCta.href} size="lg" variant="default">
        {HERO.primaryCta.label}
      </CtaLink>
      <CtaLink href={HERO.secondaryCta.href} size="lg" variant="outline">
        {HERO.secondaryCta.label}
      </CtaLink>
    </div>
  );
}

export default function Landing(): ReactElement {
  return (
    <>
      {/* The thesis, and the page's own h1. */}
      <Section>
        <SectionHeading
          as="h1"
          align="center"
          eyebrow={HERO.eyebrow}
          title={HERO.title}
          description={HERO.lede}
        />
        {heroActions()}
        <p className="site-caption site-caption--nuance">{HERO.nuance}</p>
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
