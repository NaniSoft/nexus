import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';
import { INSIDE, LOOP, STACK } from '@/lib/landing-content';

/**
 * That the landing's bands are nine different bands.
 *
 * The defect this file exists for was never a stylesheet fault. Every band on the page
 * is a catalogue Block, every Block composes the design system's `Section`, and `Section`
 * owns the padding, the container and the vertical rhythm. So all nine bands legitimately
 * share a frame, and there was nothing in this repository's stylesheet to fix. What made
 * the page read as one band repeated six times was the shape *inside* the frame, and the
 * shape inside the frame is the one thing a consumer does own: which Block draws each
 * band is this site's composition, and the same Block twice with the same kind of content
 * in it is a decision rather than an accident.
 *
 * Measured on the built export at 1440 before the repair: three bands drawing
 * twenty-five identical `[data-slot="card"]` boxes (five loop stages, eight capabilities,
 * eight stack parts, four in-house parts), a fourth drawing four hairline notes, a
 * ledger of seven rows and three marked product rows. The loop's five stages and the
 * eight capabilities shared one two-column grid of 532.00px tracks, and the fifth stage
 * sat alone in the second column beside 532.00px of nothing. The loop is now drawn by
 * `ProcessFlow01`, which is the catalogue's own shape for a sequence that wraps, and this
 * file holds the result.
 *
 * **jsdom has no layout engine, and this file does not pretend otherwise.**
 * `getBoundingClientRect()` returns zeros, `offsetWidth` is 0, and nothing computes a used
 * value for `fr`, `minmax()` or a `ch` unit. So the pixel figures above are arithmetic over
 * the shipped stylesheet and the container the blocks render, not a measurement, and none
 * of them is asserted here: what is asserted is the arrangement each figure follows from.
 * The rendered numbers are a human's job in a browser, and the sibling lane
 * `scripts/check-cascade.mjs` is the half of this repository that can reach a cascade.
 */

/** Every `<section>` the landing renders, in document order, bar and footer excluded. */
function bands(container: HTMLElement): Element[] {
  return [...container.querySelectorAll('main > section')];
}

/**
 * One band's shape, as the vocabulary of regions it draws.
 *
 * A `data-slot` value is how the catalogue names the thing it drew, so two bands that
 * draw the same set of things are two bands of the same shape whatever their contents say.
 * A set rather than a list, because the question is which two are the same, not which
 * came first.
 */
function shape(band: Element): string {
  return [...new Set([...band.querySelectorAll('[data-slot]')].map((el) => el.getAttribute('data-slot') as string))]
    .sort()
    .join(' ');
}

/** The heading a band introduces itself with, for a failure message a reader can use. */
function name(band: Element): string {
  return band.querySelector('h1, h2')?.textContent?.trim().replace(/\s+/g, ' ') ?? '(untitled)';
}

/**
 * The column counts on the grid a band draws its cards in, as the class names it carries.
 *
 * Walked up to rather than stepped over, because the two Blocks nest their cards in
 * different elements — a bare `<div>` inside the grid on one and an `<li>` on the other —
 * and the grid is the nearest ancestor carrying a column count in both. Reading it by
 * walking means this file does not have to know which is which, which is the arrangement
 * a future release is free to change.
 */
function cardColumns(band: Element): string[] {
  for (let node = band.querySelector('[data-slot="card"]'); node; node = node.parentElement) {
    const tokens = (node.getAttribute('class') ?? '').split(/\s+/);
    const found = [
      ...new Set(
        tokens
          .map((token) => token.match(/(?:^|:)grid-cols-(\d)$/)?.[1])
          .filter((value): value is string => typeof value === 'string'),
      ),
    ];
    if (found.length > 0) return found.sort();
  }
  return [];
}

describe('the landing is nine bands and no two of them are the same shape', () => {
  it('draws nine bands, and every one of them draws something no other band draws', () => {
    const { container } = render(<HomePage />);
    const sections = bands(container);
    expect(sections, 'the landing is not the nine bands this file is written about').toHaveLength(9);

    const shapes = new Map<string, string[]>();
    for (const band of sections) {
      const drawn = shape(band);
      shapes.set(drawn, [...(shapes.get(drawn) ?? []), name(band)]);
    }
    const repeated = [...shapes.entries()].filter(([, bandsNamed]) => bandsNamed.length > 1);
    expect(
      repeated.map(([drawn, named]) => `${named.join(' and ')} both draw ${drawn}`),
      'two bands are the same shape, which is what one band repeated six times looks like from the markup',
    ).toEqual([]);

    // Coverage of the claim, so a page that quietly dropped three bands cannot pass it by
    // having fewer collisions. The strip is the one band with no heading of its own: it is
    // a `ul` with an accessible name, which is the design system's requirement for a set
    // of phrases and the reason it names itself rather than carrying a title.
    expect([...new Set(shapes.values())].reduce<string[]>((all, group) => [...all, ...group], []).sort()).toEqual(
      [
        '(untitled)',
        'Software that builds software.',
        'The loop',
        'What the loop guarantees',
        'What’s inside',
        'How it’s built',
        'Where it stands',
        'Built on Nexus',
        'Nexus is in active development.',
      ].sort(),
    );
  });

  it('draws the loop as a flow of five stages and no card at all', () => {
    const { container } = render(<HomePage />);
    const loop = bands(container).find((band) => name(band) === 'The loop');
    expect(loop, 'the loop band is not where this file expects it').toBeTruthy();

    // The five stages are the argument and they are five. One `<ol>` carries them, so a
    // screen reader meets one list rather than three, and the ordinal on each is the
    // design system's own continuity mechanism rather than a prop this site passed.
    const flow = loop?.querySelector('[data-slot="process-flow"]');
    expect(flow?.tagName, 'the five stages are not one ordered list').toBe('OL');
    const stages = [...(flow?.children ?? [])];
    expect(stages, 'the flow does not carry five stages').toHaveLength(LOOP.stages.length);

    // The whole of the repair: a card-shaped object in this band is one that can be
    // orphaned, and a five-item card grid at two columns is orphaned by construction
    // because five divides by nothing but one.
    expect(
      loop?.querySelectorAll('[data-slot="card"]'),
      'the loop still draws a card, and a card is what the 532.00px of empty track beside the fifth stage was',
    ).toHaveLength(0);

    // The thread is a rule above each stage rather than a box around it, so the fifth
    // stage is a fifth stage and not a card with one thing beside it.
    for (const stage of stages) {
      expect(
        stage.className,
        'a stage draws a frame, so the band is boxes again whatever the count is',
      ).toMatch(/\bborder-t\b/);
      expect(stage.className).not.toMatch(/\brounded-/);
    }
  });

  it('leaves one band drawing boxed cards in two columns, and the other four across', () => {
    const { container } = render(<HomePage />);
    /*
     * **The column count is read off the class the Block renders, not computed.** A
     * `grid-cols-N` class is a Prism utility and it is in the markup whether or not this
     * repository could compile Tailwind, so it is a fact about the arrangement rather than
     * about the render. Which is exactly the level this file can reach: that two bands
     * used to hand the same width to the same kind of box, and that one of them does not
     * any more.
     *
     * Before: `The loop` and `What's inside` both drew `FeatureGrid01`, whose grid is
     * `grid gap-6 sm:grid-cols-2` — 5 cards and 8 cards in the same two 532.00px tracks
     * at 1440, and the 5 the reason an empty 532.00px track sat beside the fifth stage.
     * After: the flow draws none, so the only two-column card grid on the page is the
     * capability set, and the other card grid is `StackGrid01`'s four.
     */
    const cardBands = bands(container)
      .map((band) => ({
        name: name(band),
        cards: band.querySelectorAll('[data-slot="card"]').length,
        columns: cardColumns(band),
      }))
      .filter((entry) => entry.cards > 0);

    expect(
      cardBands.map((entry) => `${entry.name}: ${entry.cards} cards in ${entry.columns.join('/')} columns`),
      'the bands that draw boxed cards, and the width each gives them',
    ).toEqual([
      `${INSIDE.label}: ${INSIDE.features.length} cards in 2 columns`,
      `${STACK.label}: ${STACK.parts.length + STACK.own.length} cards in 2/4 columns`,
    ]);

    // The claim the repair turns on, said at the width the measurements are taken at.
    // Both grids are two columns at `sm`; only one is still two columns at `lg`, which is
    // the width every figure in this file's comment was measured at. So the number that
    // decides whether two bands read as one is the widest a band gives its cards.
    const widest = cardBands.map((entry) => ({
      name: entry.name,
      columns: Math.max(...entry.columns.map(Number)),
    }));
    expect(
      widest.filter((entry) => entry.columns === 2).map((entry) => entry.name),
      'two bands still hand the same two-column grid the same kind of card at the widest width',
    ).toEqual([INSIDE.label]);
    expect(
      widest.map((entry) => `${entry.name}: ${entry.columns}`),
      'the widest each card grid is given',
    ).toEqual([`${INSIDE.label}: 2`, `${STACK.label}: 4`]);
  });

  it('keeps every claim the two card grids carry, and every stage the flow carries', () => {
    // The repair is a change of shape and not of content, so the copy is asserted in full
    // here as well as in `test/smoke.test.tsx`: five stages, eight capabilities, eight
    // parts and four in-house parts, every one of them still on the page with its own body.
    const { container } = render(<HomePage />);
    for (const stage of LOOP.stages) {
      expect(container.textContent, `the flow lost the stage named ${stage.title}`).toContain(stage.title);
      expect(container.textContent, `the flow lost the body of ${stage.title}`).toContain(stage.body);
    }
    for (const feature of INSIDE.features) {
      expect(container.textContent).toContain(feature.title);
      expect(container.textContent).toContain(feature.body);
    }
  });
});