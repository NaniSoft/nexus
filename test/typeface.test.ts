import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * This repository ships no font file of its own, and the interface face is the design
 * system's.
 *
 * `@nanisoft/prism-ui/styles.css` ships the `@font-face` rules and the woff2 binaries
 * behind them beside the `--font-sans` token that names Inter, so importing the one
 * stylesheet is importing the face. This site used to also supply its own Inter through
 * `next/font/google`, back when the pinned package shipped none, and it shipped 214 KB
 * and seven extra files of a typeface the other three sites get from the design system.
 * The supply outlived its reason and nothing noticed, because nothing errored: the page
 * rendered in Inter throughout, twice over, and the only symptom was a download nobody
 * asked for.
 *
 * That is the shape of defect this file exists to catch, and it is why the assertion is
 * about the *absence of a supply* rather than about the presence of a family. A test
 * that renders a heading and checks the computed `font-family` would have passed
 * through the entire regression, because the typeface never changed. Only the second
 * copy is wrong, and the second copy is invisible from the rendered result.
 *
 * The claim is asserted against the source rather than against `out/`, for two reasons.
 * `out/` is gitignored, so a test that read it would pass in a working tree and fail on
 * a fresh clone, which teaches the reader that the suite is order-dependent. And the
 * defect was present in the source the whole time; `pnpm test` runs before `pnpm build`
 * in this repository's own order, so a source-level assertion is the one that gets to
 * fail first.
 *
 * **The second half of this file is the more important one.** Deleting this site's copy
 * of the typeface is only correct while the design system still ships its own, and that
 * is a property of a pinned package that a future bump can change without editing a line
 * here. So the premise is asserted rather than assumed: if a later `@nanisoft/prism-ui`
 * drops the `@font-face` rules or the binaries behind them, this test fails, and the
 * answer is to restore a supply deliberately rather than to discover the platform's UI
 * face in production.
 */
const ROOT = path.resolve(__dirname, '..');

/** The design system's emitted sheet, read the way a consumer reads it. */
const EMITTED = path.join(ROOT, 'node_modules', '@nanisoft', 'prism-ui', 'dist', 'styles.css');

/** Directories that hold this site's own source. A list, so a new one is a decision. */
const ROOTS = ['app', 'components', 'lib'];
const SOURCE = /\.(ts|tsx|css)$/;

function sourceFiles(dir: string, found: string[] = []): string[] {
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, found);
    else if (SOURCE.test(entry.name)) found.push(full);
  }
  return found;
}

const files = ROOTS.flatMap((root) => sourceFiles(path.join(ROOT, root)));
const relative = (file: string) => path.relative(ROOT, file).split(path.sep).join('/');
const read = (file: string) => readFileSync(file, 'utf8');

describe('the site ships no font file of its own', () => {
  it('calls no next/font entry point anywhere in its source', () => {
    // The load itself. `next/font/google` was the second supply and it is the only way
    // this repository ever got a typeface onto the page, so its absence is the whole
    // of this assertion. Matched as a module specifier rather than as a substring, so
    // a comment that records the removal in the past tense does not read as a call.
    const callers = files.filter((file) => /(?:from|import|require\()\s*['"]next\/font/.test(read(file)));
    expect(callers, `a next/font call in ${callers.map(relative).join(', ')}`).toEqual([]);
  });

  it('downloads no typeface, in any form next/font can take', () => {
    // The belt to the braces above. A font can also arrive without a module specifier:
    // a `@font-face` in the site's own sheet, or a `src: url()` pointing at a file
    // this repository ships. Both would put a second copy of a face in the export, and
    // neither is caught by looking for an import.
    const sheet = read(path.join(ROOT, 'app', 'globals.css')).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(sheet, 'a @font-face in this repository\'s own stylesheet').not.toMatch(/@font-face/);
    const sources = files.filter((file) => file.endsWith('.css') && /@font-face|\.woff2?\b/.test(read(file)));
    expect(sources.map(relative), `a font source in ${sources.map(relative).join(', ')}`).toEqual([]);
  });

  it('overrides no font token, so the design system\'s own is the only declaration', () => {
    // The override this site used to carry. It is the other half of the same defect:
    // the `:root { --font-sans: var(--font-inter), ... }` block had to exist to make
    // the site's own copy the family that won, and an unlayered `:root` declaration
    // outranks the design system's layered base at any specificity. It was also one
    // undefined `var()` read away from taking the whole token down, which is the
    // failure the dead-alias assertion in `test/server-only.test.ts` covers.
    const sheet = read(path.join(ROOT, 'app', 'globals.css')).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(sheet, 'a --font-sans override in this repository\'s own stylesheet').not.toMatch(/--font-sans\s*:/);
    expect(sheet, 'a --font-inter read in this repository\'s own stylesheet').not.toMatch(/--font-inter/);
  });

  it('names no font variable on the document element', () => {
    // The `<html>` element itself. The spread carries the mode as a `className` and a
    // named `className` beside it replaces it outright rather than merging, which is
    // how this site once lost the typeface with no error anywhere. Nothing needs to
    // put a class there now.
    const layout = read(path.join(ROOT, 'app', 'layout.tsx'));
    const html = layout.match(/<html\b[^>]*>/)?.[0] ?? '';
    expect(html, 'the document element does not resolve').not.toBe('');
    expect(html, 'a className prop beside the theme attributes on <html>').not.toMatch(/className=/);
    expect(layout, 'a font variable declared in this repository').not.toMatch(/--font-inter/);
  });
});

describe('the design system still ships the face this site relies on', () => {
  it('reads the emitted stylesheet the design system exports', () => {
    // Coverage, asserted before anything is concluded from it. A gate or a test that
    // read nothing reports a clean run, so the file this half depends on has to exist
    // or the assertions below are assertions about nothing.
    expect(existsSync(EMITTED), `${EMITTED} does not resolve`).toBe(true);
  });

  it('declares the family the --font-sans token names', () => {
    // The token names Inter first and that is the whole of what this site contributes:
    // it names nothing and supplies nothing, and renders from this declaration.
    const emitted = read(EMITTED);
    const sans = emitted.match(/--font-sans:\s*([^;]+);/)?.[1]?.trim();
    expect(sans, 'the emitted sheet declares no --font-sans token').toBeDefined();
    expect(sans!.split(',')[0]?.trim().replace(/['"]/g, ''), 'the first family of --font-sans').toBe('Inter');
  });

  it('backs that family with an @font-face and the binary behind it', () => {
    // The premise this deletion rests on, asserted rather than assumed. Inter is a
    // name until an `@font-face` gives it a `src`, and a name nothing resolves to is
    // the platform's UI face. Every `src` in the emitted sheet must also resolve to a
    // file that exists in the package, or the design system names the family and ships
    // nothing, which is the state this site's own copy was written for.
    const emitted = read(EMITTED);
    const faces = [...emitted.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((match) => match[1] as string);
    expect(faces.length, 'the emitted sheet declares no @font-face rule').toBeGreaterThan(0);

    const interFaces = faces.filter((face) => /font-family:\s*['"]?Inter['"]?/.test(face));
    expect(interFaces.length, 'no @font-face declares the family --font-sans names').toBeGreaterThan(0);

    const sources = [...emitted.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)]
      .map((match) => match[2] as string)
      .filter((url) => /\.(?:woff2?|ttf|otf)$/i.test(url));
    expect(sources.length, 'no @font-face carries a font file').toBeGreaterThan(0);
    const missing = sources
      .map((url) => path.join(path.dirname(EMITTED), url))
      .filter((file) => !existsSync(file));
    expect(missing, `a font file the emitted sheet references and the package does not ship: ${missing.join(', ')}`)
      .toEqual([]);
  });

  it('weights the family across the range the design system uses', () => {
    // A single weight is not a family. The design system sets body copy at one weight
    // and headings at another, so a face that arrived with only the regular would
    // render every heading as synthesised bold, which looks close enough to correct to
    // survive a screenshot.
    const emitted = read(EMITTED);
    const weights = new Set(
      [...emitted.matchAll(/@font-face\s*\{[^}]*?font-weight:\s*(\d+)/gs)].map((match) => match[1] as string),
    );
    expect(weights.size, `the family is declared at ${weights.size} weight(s)`).toBeGreaterThan(1);
  });
});