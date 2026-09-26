'use client';

// The Instrument Bench (ticket 09, variant A) wearing Nexus's content (ticket
// 06). One beam-dark ground, mono section indices, hairline instruments, and
// lavender as the only accent — packs-as-signal is site-local, so peach never
// appears here and the other packs show up only as the pack dots on the three
// Built-on-Nexus cards.

import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { Button } from '@nanisoft/prism-ui/components/button';
import { usePrismThemeMode } from '@nanisoft/prism-ui/provider';
import { prismProducts } from '@nanisoft/prism-ui/products';
import { prismBrandPacks, type PrismPackId } from '@nanisoft/prism-tokens';

import { LoopCanvas } from '@/components/landing/LoopCanvas';
import { reveal, useRevealRoot } from '@/components/landing/reveal';
import {
  BUILT_ON_NEXUS,
  BUILD_ORDER,
  CAPABILITIES,
  COMPOSED,
  COMPOSED_NOTE,
  FINAL_CTA,
  HERO,
  IN_HOUSE,
  LOOP_NOTES,
  LOOP_STAGES,
  PANEL,
  TICKER,
} from '@/lib/landing-content';

function Section({ index, label, children }: { index: string; label: string; children: ReactNode }): ReactElement {
  return (
    <section className="nx-section">
      <div className="nx-shell">
        <div className="nx-section__head" {...reveal()}>
          <span className="nx-section__index">{index}</span>
          <span className="nx-section__label">{label}</span>
        </div>
        {children}
      </div>
    </section>
  );
}

/** The three products built on Nexus, from the shared registry. */
const DEPENDENTS = prismProducts.filter((product) => product.kind === 'product' && product.id !== 'nexus');

export function Landing(): ReactElement {
  const root = useRevealRoot();
  // The panel bar's mode tag reads the live mode — the chrome flips mode at
  // runtime, and a static label would lie the moment it did.
  const { mode } = usePrismThemeMode();
  const modeTag = `${mode === 'dark' ? 'beam-dark' : 'light'} · lavender`;

  return (
    <div className="nx" ref={root}>
      {/* Hero — copy left, the loop in its instrument panel right. */}
      <section className="nx-hero">
        <div className="nx-shell nx-hero__grid">
          <div>
            <p className="nx-eyebrow" {...reveal()}>
              {HERO.eyebrow}
            </p>
            <h1 className="nx-display" {...reveal(60)}>
              {HERO.h1Leading}
              <em>{HERO.h1Em}</em>
              {HERO.h1Trailing}
            </h1>
            <p className="nx-lede" {...reveal(120)}>
              {HERO.lede}
            </p>
            <div className="nx-cta-row" {...reveal(180)}>
              <Button type="primary" size="large" href={HERO.primaryCta.url}>
                {HERO.primaryCta.label}
              </Button>
              <Button size="large" href={HERO.secondaryCta.url}>
                {HERO.secondaryCta.label}
              </Button>
            </div>
            <p className="nx-caption nx-caption--nuance" {...reveal(240)}>
              {HERO.nuance}
            </p>
          </div>
          <div className="nx-hero__panel" {...reveal(120)}>
            <div className="nx-hero__panel-bar">
              <span className="nx-live-dot" aria-hidden />
              <span>{PANEL.label}</span>
              <span className="nx-hero__panel-mode">{modeTag}</span>
            </div>
            <LoopCanvas />
          </div>
        </div>
        <div className="nx-shell">
          <div className="nx-ticker" {...reveal(240)}>
            {TICKER.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 01 — the loop, as a conveyor rail with a traveling packet. */}
      <Section index="01" label="The loop — issue to reviewed pull request">
        <div className="nx-rail" {...reveal()}>
          <div className="nx-rail__packet" aria-hidden />
          {LOOP_STAGES.map((stage, i) => (
            <div className="nx-stage" key={stage.title}>
              <span className="nx-stage__no">{stage.step}</span>
              <span className="nx-stage__name">{stage.title}</span>
              <span className="nx-stage__caption">{stage.body}</span>
              {i === LOOP_STAGES.length - 1 && <span className="nx-rail__serving">merged</span>}
            </div>
          ))}
        </div>
        <div className="nx-notes">
          {LOOP_NOTES.map((note, i) => (
            <div className="nx-note" key={note.title} {...reveal(i * 40)}>
              <h4>{note.title}</h4>
              <p>{note.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 02 — what's inside: the capability grid. */}
      <Section index="02" label="What’s inside">
        <div className="nx-cards">
          {CAPABILITIES.map((capability, i) => (
            <div className="nx-card" key={capability.title} {...reveal(Math.min(i, 4) * 50)}>
              <span className="nx-card__no">{String(i + 1).padStart(2, '0')}</span>
              <h3>{capability.title}</h3>
              <p>{capability.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 03 — how it's built: the survey grid, composed parts + dashed in-house tiles. */}
      <Section index="03" label="How it’s built — compose, don’t fork">
        <p className="nx-intro" {...reveal()}>
          The factory stands on proven parts and builds four things of its own: the orchestrator, the
          config loader, the Kanban service, and the merge pipeline. Everything else is composition.
        </p>
        <div className="nx-survey">
          {COMPOSED.map((part, i) => (
            <div className="nx-tile" key={part.name} {...reveal(Math.min(i, 8) * 30)}>
              <span className="nx-tile__name">{part.name}</span>
              <span className="nx-tile__role">{part.role}</span>
            </div>
          ))}
        </div>
        <div className="nx-survey nx-survey--ours">
          {IN_HOUSE.map((component, i) => (
            <div className="nx-tile nx-tile--ours" key={component.name} {...reveal(i * 60)}>
              <span className="nx-tile__mark">built by Nanisoft</span>
              <span className="nx-tile__name">{component.name}</span>
              <span className="nx-tile__blurb">{component.blurb}</span>
            </div>
          ))}
        </div>
        <p className="nx-caption" {...reveal()}>
          {COMPOSED_NOTE}
        </p>
      </Section>

      {/* 04 — the build order, as a status ledger. The honesty law, rendered. */}
      <Section index="04" label="The build order — where it actually stands">
        <p className="nx-intro" {...reveal()}>
          {BUILD_ORDER.lede}
        </p>
        <div className="nx-ledger">
          {BUILD_ORDER.rows.map((row, i) => (
            <div className="nx-row" key={row.name} data-status={row.status} {...reveal(i * 50)}>
              <span className="nx-row__dot" aria-hidden />
              <span className="nx-row__name">{row.name}</span>
              <span className="nx-row__status">{row.status}</span>
              <span className="nx-row__detail">{row.detail}</span>
            </div>
          ))}
        </div>
        <p className="nx-caption" {...reveal()}>
          {BUILD_ORDER.caption}
        </p>
      </Section>

      {/* 05 — built on Nexus: the platform story, packs as signal. */}
      <Section index="05" label="Built on Nexus — one platform, one factory">
        <p className="nx-intro" {...reveal()}>
          {BUILT_ON_NEXUS.lede}
        </p>
        <div className="nx-bon">
          {DEPENDENTS.map((product, i) => {
            const ink = prismBrandPacks[product.pack as PrismPackId].ink.dark;
            return (
              <a
                className="nx-bon__card"
                key={product.id}
                href={product.url}
                {...reveal(i * 60)}
                style={{ '--nx-ink': ink } as CSSProperties}
              >
                <span className="nx-bon__dot" aria-hidden />
                <span className="nx-bon__name">{product.name}</span>
                <span className="nx-bon__tagline">{product.tagline}</span>
              </a>
            );
          })}
        </div>
        <p className="nx-caption" {...reveal()}>
          {BUILT_ON_NEXUS.caption}
        </p>
      </Section>

      {/* The single ask. */}
      <section className="nx-cta">
        <div className="nx-shell" {...reveal()}>
          <h2 className="nx-display nx-display--md">{FINAL_CTA.h2}</h2>
          <div className="nx-cta-row nx-cta-row--center">
            <Button type="primary" size="large" href={FINAL_CTA.primary.url}>
              {FINAL_CTA.primary.label}
            </Button>
            <Button size="large" href={FINAL_CTA.secondary.url}>
              {FINAL_CTA.secondary.label}
            </Button>
          </div>
          <p className="nx-caption nx-caption--center">{FINAL_CTA.footnote}</p>
        </div>
      </section>
    </div>
  );
}
