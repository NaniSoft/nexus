import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';

/**
 * Three claims about `app/globals.css`, and the one piece of geometry none of them
 * can reach.
 *
 * This sheet is the only place a consumer can express anything the catalogue does not
 * ship, so it is also the only place a consumer can get the cascade wrong in a way no
 * reviewer sees: the design system's base layer is layered and this sheet is not, so an
 * unlayered rule here outranks the design system's at any specificity, and the page
 * still looks plausible afterwards. All three of the things below were exactly that.
 *
 * **jsdom cannot express the geometry, and this file does not pretend to.** It has no
 * layout engine: `getBoundingClientRect()` returns zeros, `offsetHeight` is 0, and
 * nothing computes a used value for `flex`, `minmax()` or a `ch` unit. So "the footer's
 * top edge is inside the viewport" is not a thing this runner can measure, and a test
 * that asserted it would either be skipped or would be asserting that the markup exists
 * and calling that the geometry. What is asserted instead is the mechanism the geometry
 * depends on, read out of the sheet and out of the emitted markup of the design system,
 * and the measured before-and-after numbers are a render a human does.
 *
 * The reader is `app/globals.css` as text. That is the same move `test/content.test.ts`
 * makes with `content/`, and for the same reason: the thing under test is a file this
 * repository owns and nothing else renders it into a place a runner can measure.
 */

/** This site's own sheet, which is the file all three claims are about. */
const SHEET = path.resolve(__dirname, '..', 'app', 'globals.css');

/**
 * The design system's shipped sheet, resolved through its own export map rather than
 * through a path written here.
 *
 * The cascade and contrast claims below are claims about what the design system
 * declares, so the reference has to be the design system's own emitted file. Resolving
 * it the way the package resolves it means a renamed subpath is an error in this test
 * rather than a test that quietly measures nothing.
 */
const SYSTEM_SHEET = createRequire(import.meta.url).resolve('@nanisoft/prism-ui/styles.css');

/** A rule this sheet declares: its selector, its body, and the width query it sits in. */
interface Rule {
  selector: string;
  body: string;
  media: string | null;
  /** Every at-rule this rule is nested in, outermost first. */
  at: string[];
}

/**
 * Comments blanked to spaces, newlines left where they were.
 *
 * A `}` inside prose closes a block if the prose is still there, and this sheet is three
 * quarters comment. Blanking rather than deleting keeps every line number the file had,
 * so a failure names the line a reader will find.
 */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '));
}

/**
 * Every rule a sheet declares, at the top level or inside any at-rule.
 *
 * Hand-rolled rather than a CSS parser because the two files involved are a flat list of
 * rules and a flat list of at-rule blocks; the kit already declines to parse a cascade,
 * and a parser here would be a dependency and a resolver. An at-rule this file does not
 * care about is still descended into rather than skipped, because the design system's own
 * sheet puts every rule it ships inside `@layer`.
 */
function parse(source: string): Rule[] {
  const found: Rule[] = [];
  const open: string[] = [];
  let prelude = '';
  let i = 0;
  while (i < source.length) {
    const character = source[i] as string;
    if (character === '{') {
      const head = prelude.trim();
      prelude = '';
      let depth = 1;
      let end = i + 1;
      while (end < source.length && depth > 0) {
        if (source[end] === '{') depth += 1;
        if (source[end] === '}') depth -= 1;
        end += 1;
      }
      if (head.startsWith('@')) {
        open.push(head);
      } else {
        found.push({
          selector: head,
          body: source.slice(i + 1, end - 1),
          /* The innermost width query, not merely the innermost at-rule: the design
             system nests `@media` inside `@layer utilities` and a rule in there is
             still in that query. */
          media: open.filter((entry) => entry.startsWith('@media')).pop() ?? null,
          at: [...open],
        });
        i = end;
        continue;
      }
      i += 1;
      continue;
    }
    if (character === '}') {
      open.pop();
      prelude = '';
      i += 1;
      continue;
    }
    prelude += character;
    i += 1;
  }
  return found;
}

function rules(): Rule[] {
  return parse(withoutComments(readFileSync(SHEET, 'utf8')));
}

/** One declaration of one rule, by property name, or undefined. */
function declared(rule: Rule | undefined, property: string): string | undefined {
  const match = rule?.body.match(new RegExp(`(?:^|[;{\\s])${property}\\s*:\\s*([^;]+)`));
  return match?.[1]?.trim();
}

/**
 * One token as it resolves in this pack in this mode, off the shipped sheet.
 *
 * The pack and the mode are two selectors and nothing else, so this is a lookup in the
 * same flat list every other assertion in this file reads. Read rather than assumed:
 * the whole of the contrast claim below is that these are the values Prism declares for
 * `lavender`, and a hand-copied pair of hexes would be a claim about nothing.
 */
function packed(name: string, mode: 'light' | 'dark'): string {
  const system = parse(withoutComments(readFileSync(SYSTEM_SHEET, 'utf8')));
  // Prism writes the dark pack block as one rule with two selectors, so the mode is a
  // membership test rather than one spelling. Matching on either is the same rule.
  const wanted = (selector: string) =>
    selector
      .split(',')
      .map((part) => part.trim())
      .includes(mode === 'dark' ? '.dark [data-pack="lavender"]' : '[data-pack="lavender"]');
  const rule = system.find((candidate) => wanted(candidate.selector));
  if (!rule) throw new Error(`the shipped sheet declares no ${mode} rule for the lavender pack`);
  const value = declared(rule, name);
  if (!value) throw new Error(`the shipped sheet declares no ${name} for ${mode} lavender`);
  // `:root` carries the default the pack rule overrides, so a token the pack does not
  // redeclare still resolves; the pack rule wins where it does.
  if (!/^#[0-9a-f]{3,8}$/i.test(value)) {
    const root = system.find((candidate) => candidate.selector === ':root');
    const fallback = declared(root, name);
    if (!fallback) throw new Error(`the shipped sheet declares no ${name} anywhere`);
    return fallback;
  }
  return value;
}

/** WCAG 2.1 relative luminance and contrast ratio, from two sRGB hex values. */
function luminance(hex: string): number {
  const digits = hex.replace('#', '');
  const channels = [0, 2, 4].map((at) => parseInt(digits.slice(at, at + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const pair = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (pair[0] + 0.05) / (pair[1] + 0.05);
}

describe('the sticky footer', () => {
  it('grows main inside a column at least one viewport tall', () => {
    // What jsdom cannot do is measure whether the footer's top edge is inside the
    // viewport, so what is asserted is the arrangement that decides it. Before the fix
    // this sheet had no `body` rule at all and `.site-main` declared
    // `min-height: 100dvh`, which put the footer's top edge at 957px on `/404` at 1440
    // by 900: a bar at 57px above a main at 900px, on the page whose only job is to
    // offer a way out. Growing main inside a column at least one viewport tall puts the
    // footer's bottom edge on the viewport's bottom edge instead, which is the property
    // being asked for.
    const body = rules().find((rule) => rule.selector === 'body');
    expect(body, 'app/globals.css declares no bare-element rule on body').toBeTruthy();
    expect(declared(body, 'display')).toBe('flex');
    expect(declared(body, 'flex-direction')).toBe('column');
    expect(declared(body, 'min-height')).toBe('100dvh');
  });

  it('grows main with `1 0 auto`, and no longer pads it to a viewport', () => {
    // The two halves of the same declaration, and the second is the half that was the
    // defect. `1 0 auto` and not `1`: a shrink factor of 1 against a zero basis would
    // let a page taller than the viewport be compressed to fit the column.
    const main = rules().filter((rule) => rule.selector === '.site-main');
    expect(main, 'main carries more than one rule and this file reads only the one').toHaveLength(1);
    expect(declared(main[0], 'flex')).toBe('1 0 auto');
    expect(main[0]?.body, 'the rule that pushed the footer below the fold is back').not.toMatch(
      /min-height/,
    );
  });

  it('is a bare-element rule this sheet is allowed to write, and the gate names the seven', () => {
    // The `stylesheet-ownership` gate forbids a bare-element declaration of the seven
    // properties prism's base layer declares, and `display`, `flex-direction` and
    // `min-height` are none of them. Asserted here rather than left to the gate so a
    // failure names the property instead of a gate name. The existence check is inside
    // it on purpose: without it the loop below passes over a sheet that declares no
    // `body` rule at all, which is a green run that measured nothing.
    const body = rules().find((rule) => rule.selector === 'body');
    expect(body, 'app/globals.css declares no bare-element rule on body').toBeTruthy();
    const FORBIDDEN_ON_A_BARE_ELEMENT = [
      'background',
      'background-color',
      'color',
      'font-family',
      'outline',
      'outline-style',
      'border-color',
    ];
    for (const property of FORBIDDEN_ON_A_BARE_ELEMENT) {
      expect(
        declared(body, property),
        `app/globals.css declares ${property} on a bare element, which prism's base layer owns`,
      ).toBeUndefined();
    }
  });

  it('outranks the design system\'s own body rule, because that one is layered', () => {
    // The cascade, read rather than assumed, and it is the reason the new rule can be
    // a bare element at all. Prism's `body` rule is inside `@layer base` and this sheet
    // is unlayered, so an unlayered declaration wins at any specificity and this one is
    // in competition with nothing. If a later version of the package moved that rule
    // out of the layer, the claim in the comment above it would be false and so would
    // the page.
    const system = parse(withoutComments(readFileSync(SYSTEM_SHEET, 'utf8')));
    const body = system.find((rule) => rule.selector === 'body');
    expect(body, 'the shipped sheet declares no rule on body').toBeTruthy();
    expect(
      body?.at.filter((entry) => entry.startsWith('@layer')),
      'prism no longer declares body inside a layer, so an unlayered rule here is no longer guaranteed to win',
    ).not.toEqual([]);
    // And it declares none of the three this sheet now sets, so there is no conflict to
    // resolve even in the properties that overlap.
    for (const property of ['display', 'flex-direction', 'min-height']) {
      expect(declared(body, property), `prism already declares ${property} on body`).toBeUndefined();
    }
  });

  it('renders the footer as the sibling after main, which is what lets main push it down', () => {
    // The other half, and the half jsdom *can* answer. `main` growing is only a sticky
    // footer if the footer is a following sibling in the same column, so this asserts
    // the three children in the order the bar, the page and the footer are rendered in.
    const { container } = render(<HomePage />);
    const main = container.querySelector('main.site-main');
    expect(main, 'the chrome renders main without the site class').toBeTruthy();
    expect(main?.previousElementSibling?.tagName).toBe('HEADER');
    expect(main?.nextElementSibling?.tagName).toBe('FOOTER');
  });
});

describe('the documentation card hover', () => {
  it('washes the card rather than repainting its hairline', () => {
    // The defect, stated as the thing that would reintroduce it. The hover used to be
    // `border-color: var(--primary)` and nothing else, which on a card-shaped link is a
    // one-pixel colour shift. It is the in-family precedent and the design system's own
    // answer that replaces it: every nav link, every button and this site's own bar mark
    // use `hover:bg-accent`, and the card keeps its own border as its resting edge.
    const hover = rules().find((rule) => rule.selector === '.site-catalog__item:hover');
    expect(hover, 'the documentation card has no hover rule').toBeTruthy();
    expect(declared(hover, 'background-color')).toBe('var(--accent)');
    expect(
      declared(hover, 'border-color'),
      'the hover repaints the hairline instead of washing the card',
    ).toBeUndefined();
    expect(declared(hover, 'text-decoration'), 'the hover re-underlines the card title').toBe('none');

    // The card keeps its own border as its resting edge, which is the half of the rule
    // that says what it must NOT do: the edge is the card's, at rest and on hover.
    const card = rules().find((rule) => rule.selector === '.site-catalog__item');
    expect(declared(card, 'border-color')).toBe('var(--border)');
    expect(declared(card, 'border-style')).toBe('solid');
  });

  it('leaves every pair of text on the wash above the body contrast floor, in both modes', () => {
    /*
     * **A wash that fixes the affordance and breaks the reading is not a fix.** The ink
     * on a hovered card is two pairs in two modes: the title, which inherits the card's
     * own foreground, and the blurb, which is `--muted-foreground`. Both were measured
     * rather than assumed, because the whole of the claim is that a light lavender wash
     * under muted grey in dark mode is legible and the obvious way to find out is to
     * render it.
     *
     * This is arithmetic over the design system's own token contract rather than a
     * render, so it runs here. `scripts/check-cascade.mjs` resolves the same pair in a
     * real browser; this is the half that does not need one.
     */
    const FLOOR = 4.5;

    for (const mode of ['light', 'dark'] as const) {
      const accent = packed('--accent', mode);
      const foreground = packed('--foreground', mode);
      const muted = packed('--muted-foreground', mode);
      expect(
        contrast(foreground, accent),
        `the card title on the ${mode} wash is below ${FLOOR}:1`,
      ).toBeGreaterThanOrEqual(FLOOR);
      expect(
        contrast(muted, accent),
        `the card blurb on the ${mode} wash is below ${FLOOR}:1`,
      ).toBeGreaterThanOrEqual(FLOOR);
    }
  });

  it('and the hairline it replaced was a one-pixel change worth 1.79:1', () => {
    // Why the old rule was a weak affordance rather than a missing one, held as two
    // numbers so the next person to reach for a border hover can see what it cost. The
    // first is the change the hover made: `--primary` against the `--border` it replaced,
    // so the whole of the answer to "which card am I on" was a hairline resolving by
    // less than a fifth of a contrast step. The second is the edge it was painted on,
    // which is barely above the surface it sits on to begin with. Light mode, which is
    // the mode a reader on a documentation index is in.
    const change = contrast(packed('--primary', 'light'), packed('--border', 'light'));
    const restingEdge = contrast(packed('--border', 'light'), packed('--card', 'light'));
    expect(
      change,
      `the old hover resolved its own edge by ${change.toFixed(2)}:1, which is not a legible state change`,
    ).toBeLessThan(2);
    expect(
      restingEdge,
      `the resting edge is ${restingEdge.toFixed(2)}:1 on its own surface, so a state change on it has little to move from`,
    ).toBeLessThan(1.5);
  });
});