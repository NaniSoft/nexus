import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';

/**
 * The site ships no stylesheet of its own, and this file holds that negative.
 *
 * The only stylesheet is `@nanisoft/prism-ui/styles.css`, imported once in the
 * root layout. Every token, every utility and every base rule arrives in that
 * one import. Anything structural the site still needs (the document column,
 * the growing main, the spacing between bands) is a design-system utility
 * that the package already emits, used as composition rather than as a
 * stylesheet.
 *
 * The full rule set is in `scripts/ui-check.mjs` (codes UI001 to UI012 and
 * ASSET001 to ASSET014, with `pnpm ui:check` as the command). That gate reads
 * the site's source; this file is the rendered half of the same hold: no
 * stylesheet file anywhere under `app`, `components` or `lib`, and nothing in
 * the rendered page that waits for one.
 *
 * The rendered half renders the landing, reads the pinned package's sheet, and
 * fails on a rendered class the sheet does not define when the site's own
 * source wrote it. The site-authored scope is the point, not a shortcut: the
 * package renders markup classes of its own, and its icon library carries
 * identity hooks (`lucide`, `lucide-search`) that no sheet styles, so an
 * unscoped predicate fails on the package's business on every upgrade and a
 * failure outside this site's control teaches ignoring the test. `site-
 * atmosphere` was this test's founding example of the failure it guards: a
 * class the page rendered and no sheet styled, which measured the ground layer
 * at 0px. Prism 1.8.0 publishes that same name as the ground layer's rule, so
 * the old `site-` prefix test would now fail on a class the design system
 * owns. A class the pinned sheet defines is the design system's; a class the
 * site wrote that it does not define is one this site would have to style, and
 * this site ships no stylesheet to style it with.
 */
const ROOT = path.resolve(__dirname, '..');
const ROOTS = ['app', 'components', 'lib'];
const STYLE = /\.(css|scss|sass|less|styl|stylus)$/i;
const SOURCE = /\.(tsx|ts)$/i;
const SHEET = path.join(ROOT, 'node_modules', '@nanisoft', 'prism-ui', 'dist', 'styles.css');

function files(dir: string, test: (name: string) => boolean, found: string[] = []): string[] {
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files(full, test, found);
    else if (test(entry.name)) found.push(full);
  }
  return found;
}

const sheets = ROOTS.flatMap((root) =>
  files(path.join(ROOT, root), (name) => STYLE.test(name)),
);

/** Every class-like token the site's own source writes, as whole words. */
const siteTokens = new Set(
  ROOTS.flatMap((root) =>
    files(path.join(ROOT, root), (name) => SOURCE.test(name)),
  )
    .map((file) => readFileSync(file, 'utf8'))
    .flatMap((text) => text.match(/[\w-]+/g) ?? []),
);

/** Every class token any selector in the pinned sheet defines, unescaped. */
function sheetClasses(sheet: string): Set<string> {
  return new Set(
    (sheet.match(/\.((?:\\.|[A-Za-z0-9_-])+)/g) ?? []).map((token) =>
      token.slice(1).replaceAll('\\', ''),
    ),
  );
}

describe('the site ships no stylesheet of its own', () => {
  it('declares no stylesheet file under app, components or lib', () => {
    expect(
      sheets.map((file) => path.relative(ROOT, file).split(path.sep).join('/')),
      'a stylesheet file in application source; the only permitted styling entry point is @nanisoft/prism-ui/styles.css',
    ).toEqual([]);
  });

  it('renders the chrome as bar, main and footer siblings', () => {
    const { container } = render(<HomePage />);
    const main = container.querySelector('main');
    expect(main, 'the chrome renders no main element').toBeTruthy();
    expect(main?.previousElementSibling?.tagName).toBe('HEADER');
    expect(main?.nextElementSibling?.tagName).toBe('FOOTER');
  });

  it('renders no site-authored class the pinned stylesheet does not define', () => {
    expect(existsSync(SHEET), 'the pinned design system sheet is missing').toBe(true);
    const defined = sheetClasses(readFileSync(SHEET, 'utf8'));
    const { container } = render(<HomePage />);
    const offenders: string[] = [];
    container.querySelectorAll('[class]').forEach((element) => {
      for (const name of (element.getAttribute('class') ?? '').split(/\s+/)) {
        if (!defined.has(name) && siteTokens.has(name)) {
          offenders.push(`${element.tagName}.${name}`);
        }
      }
    });
    expect(
      offenders,
      `site-authored classes the rendered landing carries no rule for: ${offenders.join(', ')}`,
    ).toEqual([]);
  });
});
