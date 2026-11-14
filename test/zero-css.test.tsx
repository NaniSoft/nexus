import { existsSync, readdirSync } from 'node:fs';
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
 * ASSET001 to ASSET014, with `pnpm ui:check` as the command). This file is the
 * same law in the place a test runner reaches: no stylesheet file anywhere
 * under `app`, `components` or `lib`, and no site class in the rendered page.
 *
 * The chrome assertion is the one the old sheet test also made, because it
 * does not depend on the sheet at all: the bar, the main and the footer are
 * siblings in that order, which is what lets main grow into the space the
 * bar and the footer leave.
 */
const ROOT = path.resolve(__dirname, '..');
const ROOTS = ['app', 'components', 'lib'];
const STYLE = /\.(css|scss|sass|less|styl|stylus)$/i;

function styleFiles(dir: string, found: string[] = []): string[] {
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) styleFiles(full, found);
    else if (STYLE.test(entry.name)) found.push(full);
  }
  return found;
}

const sheets = ROOTS.flatMap((root) => styleFiles(path.join(ROOT, root)));

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

  it('renders no site class anywhere on the landing', () => {
    const { container } = render(<HomePage />);
    const offenders: string[] = [];
    container.querySelectorAll('[class]').forEach((element) => {
      for (const name of (element.getAttribute('class') ?? '').split(/\s+/)) {
        if (name.startsWith('site-')) offenders.push(`${element.tagName}.${name}`);
      }
    });
    expect(offenders, `site classes rendered on the landing: ${offenders.join(', ')}`).toEqual([]);
  });
});
