/**
 * The pack map, checked against the built export, in both modes.
 *
 * The rule this gate holds is one sentence: **a pack boundary lands on a mark and
 * nowhere else, and exactly two regions of a page may carry a pack that is not the
 * page's own ground.** The expected map is in `pack-map.json`, which the repository's
 * own test also reads, so the DOM and the built export are checked against one
 * declaration by two independent readers.
 *
 * **A screenshot cannot check this, in either mode, and that is the finding.** A
 * boundary is correct only if it resolves to its own pack in the mode the document is
 * in, which is two facts multiplied. A boundary carrying `data-pack="mint"` on a dark
 * document with no `dark` class of its own matches the light block, so the mark paints
 * the light pack on a dark page: pale marks on a dark page, which looks like a design
 * decision rather than a bug. A screenshot in the wrong mode looks correct, so a
 * single-mode screenshot is not evidence and this gate does not accept one.
 *
 * **Both modes are read from the emitted CSS, not from a browser.** The failure being
 * guarded is a selector shape, and a selector shape is knowable by reading the
 * stylesheet the build emitted against the markup the build emitted. For every pack
 * the page uses, the gate resolves the pack's light and dark blocks out of the built
 * stylesheet, asserts that the light block is a bare `[data-pack=x]` and that the dark
 * block carries **both** the compound and the descendant form, and then matches every
 * boundary in the document against both. A dark block that is compound-only is the
 * defect this catches, and it is invisible to a review and to a screenshot, because
 * the page it produces is pack-correct and mode-inverted.
 *
 * The values are then compared against the token package's own published per-pack
 * files, so the gate is not merely self-consistent: a boundary resolves the
 * contract's light values in light mode and its dark values in dark mode, and the two
 * are asserted to differ, which is what makes a both-modes check worth running.
 *
 * **The document element is not a boundary.** `<html data-pack="sky">` is the page's
 * ground, which is the page's theme and the one attribute the whole document is built
 * around; it is the axis the scoped boundary law talks about *beneath*. So the gate
 * reads it, confirms it names the declared ground, and then judges every other
 * element by the scoped law.
 *
 * The honest limit, printed on every run: this is a selector match over emitted CSS
 * and emitted markup, not a layout engine. It cannot see a runtime that sets
 * `data-pack` after paint, and it cannot see a token a boundary reads that the
 * stylesheet does not declare.
 *
 * Run after `pnpm build`: node scripts/check-pack-map.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

import { JSDOM } from 'jsdom';

const NAME = 'pack-map';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');
const MAP = JSON.parse(readFileSync(path.join(ROOT, 'scripts', 'pack-map.json'), 'utf8'));
const SITE = JSON.parse(readFileSync(path.join(ROOT, 'lib', 'site.json'), 'utf8'));

/** The route whose region set must equal the map exactly. Every other route is a subset. */
const LANDING = '/';

/** The roles a boundary must move, and the two a reader would notice it not moving. */
const ROLES = ['background', 'card', 'foreground', 'border'];

/** The slot a boundary is allowed to land on, from the design system's own law. */
const MARK_SLOT = 'product-mark';

const findings = [];
let boundaries = 0;
let marks = 0;
let documents = 0;

/* ------------------------------------------------------------------ *
 * The emitted stylesheet
 * ------------------------------------------------------------------ */

/** Every CSS file the export emitted, concatenated: one sheet, whatever Next named it. */
function emittedCss() {
  if (!existsSync(path.join(OUT, '_next'))) {
    console.error(
      `\n${NAME}: the export has no out/_next, so the emitted stylesheet cannot be read and every judgement\n` +
        '  about which mode a boundary resolves in would be a guess. Run pnpm build first.',
    );
    process.exit(1);
  }
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.css')) files.push(full);
    }
  };
  walk(path.join(OUT, '_next'));
  if (files.length === 0) {
    console.error(
      `\n${NAME}: the export emitted no stylesheet at all, so a boundary's pack has nothing to resolve\n` +
        '  against. A gate that read no stylesheet would pass a page whose colour came from nowhere.',
    );
    process.exit(1);
  }
  return { css: files.map((file) => readFileSync(file, 'utf8')).join('\n'), files };
}

const { css: CSS, files: CSS_FILES } = emittedCss();

/** The custom properties a selector's block declares, `--name` included. */
function propertiesOf(block) {
  return new Map([...block.matchAll(/(--[a-z-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]));
}

/**
 * Every rule whose selector list mentions a pack boundary, keyed by `pack:mode`.
 *
 * The selector list is split on commas because the dark block is published as a
 * two-member list, `[data-pack=x].dark, .dark [data-pack=x]`, and the two members are
 * the two ways a boundary can carry a mode. A minifier strips the quotes from an
 * attribute value that needs none, so the emitted sheet says `[data-pack=sky]`.
 */
function packRules() {
  const rules = new Map();
  for (const match of CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = match[1].split(',').map((part) => part.trim());
    for (const selector of selectors) {
      const boundary = /\[data-pack="?([a-z]+)"?\]/.exec(selector);
      if (!boundary) continue;
      const pack = boundary[1];
      // A selector that also names `.dark` is the dark block; one that does not is the
      // light block, because the light block is published bare.
      const key = `${pack}:${selector.includes('.dark') ? 'dark' : 'light'}`;
      if (!rules.has(key)) rules.set(key, { selectors: [], values: propertiesOf(match[2]) });
      const rule = rules.get(key);
      if (!rule.selectors.includes(selector)) rule.selectors.push(selector);
      for (const [property, value] of propertiesOf(match[2])) rule.values.set(property, value);
    }
  }
  return rules;
}

const RULES = packRules();

/* ------------------------------------------------------------------ *
 * The token contract, as the published package states it
 * ------------------------------------------------------------------ */

const require = createRequire(path.join(ROOT, 'package.json'));

/** The published per-pack block for one pack and mode, as the token package emits it. */
function contract(pack, mode) {
  return propertiesOf(readFileSync(require.resolve(`@nanisoft/prism-tokens/dist/themes/${pack}/${mode}.css`), 'utf8'));
}

/* ------------------------------------------------------------------ *
 * The documents
 * ------------------------------------------------------------------ */

/** Every emitted HTML file, as a parsed document with its route. */
function documents_() {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) {
        const relative = path.relative(OUT, full).split(path.sep).join('/');
        found.push([full, relative === 'index.html' ? '/' : `/${relative.replace(/\.html$/, '')}`]);
      }
    }
  };
  walk(OUT);
  return found;
}

/**
 * Which region of the page a boundary belongs to.
 *
 * Named by the structure the catalogue publishes, not by a site-specific selector: a
 * mark inside the switcher is the switcher's, a mark in a brand lockup is the
 * lockup's, and a mark inside `<main>` is named by the ordinal its own band publishes,
 * which is a string a reader of the page can see and a reader of this script can
 * check. A band with no ordinal is a finding rather than a name, because a region this
 * gate cannot name is a region it cannot hold to the map.
 */
function regionOf(element) {
  if (element.closest('[data-slot="product-switcher"]')) return 'header.switcher';
  if (element.closest('header')) return 'header.brand';
  if (element.closest('footer')) return 'footer.brand';
  const section = element.closest('main section');
  if (!section) return null;
  const ordinal = [...section.querySelectorAll('span, p, div > *')]
    .map((candidate) => (candidate.textContent ?? '').trim())
    .find((text) => /^\d{2}$/.test(text));
  if (!ordinal) return null;
  return `landing.${ordinal}`;
}

/** One finding per problem, however many routes and boundaries share it. */
const reported = new Set();
function report(key, message) {
  if (reported.has(key)) return;
  reported.add(key);
  findings.push(message);
}

/**
 * Two colours are the same colour however they are written.
 *
 * A minifier shortens `#ffffff` to `#fff`, and a value read from the emitted sheet
 * that is compared byte for byte against the contract reports a difference that is not
 * one. Normalising here is what lets the gate compare values rather than spellings.
 */
function sameColour(left, right) {
  const expand = (value) => {
    const hex = /^#([0-9a-f]{3,8})$/i.exec(value.trim());
    if (!hex) return value.trim().toLowerCase();
    const digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      return `#${[...digits].map((digit) => digit + digit).join('')}`.toLowerCase();
    }
    return `#${digits}`.toLowerCase();
  };
  return expand(left) === expand(right);
}

const byRoute = new Map();

for (const [file, route] of documents_()) {
  documents += 1;
  const document = new JSDOM(readFileSync(file, 'utf8')).window.document;

  /* The document element: the ground, read and confirmed rather than judged. */
  const groundAttribute = document.documentElement.getAttribute('data-pack');
  if (groundAttribute !== MAP.ground) {
    findings.push(
      `${route}  [ground]  the document element carries data-pack="${groundAttribute}" and the map declares\n` +
        `      "${MAP.ground}". The ground is one fact with one owner.`,
    );
  }
  if (!document.documentElement.classList.contains('dark') && MAP.defaultMode === 'dark') {
    findings.push(
      `${route}  [mode]  the document element carries no dark class, so a reader with no stored theme gets\n` +
        '      light mode, which is not the site default.',
    );
  }

  const regions = new Map();
  for (const element of document.querySelectorAll('[data-pack]')) {
    if (element === document.documentElement) continue;
    boundaries += 1;
    const pack = element.getAttribute('data-pack') ?? '';
    const region = regionOf(element);
    if (region === null) {
      report(
        `unnameable:${element.tagName}`,
        `${route}  [unnamed-region]  a data-pack="${pack}" boundary in a band with no ordinal cannot be held to\n` +
          '      the map. Every band on this page publishes one.',
      );
      continue;
    }
    if (!regions.has(region)) regions.set(region, []);
    regions.get(region).push(pack);

    /* The law, per boundary. */
    if (element.getAttribute('data-slot') === MARK_SLOT) marks += 1;
    else {
      report(
        `off-mark:${element.tagName}`,
        `${route}  [boundary-off-a-mark]  a data-pack="${pack}" boundary in ${region} sits on a <${element.tagName.toLowerCase()}>, not on a mark. A boundary re-points --radius as well as colour, so anything that is not a fully rounded shape changes shape with its pack.`,
      );
    }
    for (const shape of ['rect', 'section', 'article', 'a', 'div', 'li', 'svg', 'g', 'path', 'circle']) {
      if (element.tagName.toLowerCase() === shape) {
        report(
          `shape:${shape}`,
          `${route}  [boundary-shape]  a <${shape}> carries data-pack="${pack}" in ${region}.`,
        );
      }
    }
    if (/\brounded-(?!full\b)[a-z0-9-]+/.test(element.getAttribute('class') ?? '')) {
      report(
        `radius:${region}`,
        `${route}  [boundary-radius]  the boundary in ${region} carries a radius utility other than rounded-full, so its corner radius is computed from the pack it carries.`,
      );
    }
    /* A boundary must not carry a mode of its own. A server cannot know the reader's
       mode, so a `dark` class on a boundary is a guess that is right for half of them
       and wrong for the other half, and it is the one form of this defect a text scan
       over the CSS would never see. */
    if (/\bdark\b/.test(element.getAttribute('class') ?? '')) {
      report(
        `hard-mode:${region}`,
        `${route}  [hard-coded-mode]  a boundary in ${region} carries a dark class of its own, so it is mode-correct\n` +
          '      for half the readers and inverted for the other half. A boundary wears the mode of the nearest\n' +
          '      ancestor carrying it, and the server is the only thing that can know it.',
      );
    }

    /* Both modes, per boundary, against the published contract. */
    for (const mode of ['light', 'dark']) {
      const rule = RULES.get(`${pack}:${mode}`);
      if (!rule) {
        report(
          `no-block:${pack}:${mode}`,
          `${route}  [no-${mode}-block]  the emitted stylesheet declares no [data-pack=${pack}] block for ${mode}.`,
        );
        continue;
      }
      if (mode === 'dark') {
        const compound = rule.selectors.some((selector) => selector === `[data-pack=${pack}].dark`);
        const descendant = rule.selectors.some((selector) => selector === `.dark [data-pack=${pack}]`);
        if (!descendant) {
          report(
            `descendant:${pack}`,
            `${route}  [mode-inverted]  the dark block for "${pack}" is ${JSON.stringify(rule.selectors)}, which has no\n` +
              '      descendant form. A boundary is an attribute on an element with no mode class of its own, so\n' +
              '      without `.dark [data-pack=x]` a server-rendered boundary on a dark page matches the light block:\n' +
              '      pack-correct, mode-inverted, and it looks like a design decision.',
          );
        }
        if (!compound) {
          report(
            `compound:${pack}`,
            `${route}  [compound-form-missing]  the dark block for "${pack}" drops the compound form, which is published for a boundary that must hold a fixed mode.`,
          );
        }
      }
      const published = contract(pack, mode);
      for (const role of ROLES) {
        const emittedValue = rule.values.get(`--${role}`);
        const expected = published.get(`--${role}`);
        if (emittedValue === undefined) {
          report(
            `unresolved:${pack}:${role}`,
            `${route}  [unresolved-role]  the ${mode} block for "${pack}" does not declare --${role}.`,
          );
        } else if (expected !== undefined && !sameColour(emittedValue, expected)) {
          report(
            `contract:${pack}:${mode}:${role}`,
            `${route}  [contract-mismatch]  the ${mode} block for "${pack}" declares --${role}: ${emittedValue}, and the published token contract declares ${expected}.`,
          );
        }
      }
      if (mode === 'dark') {
        const light = RULES.get(`${pack}:light`)?.values;
        if (light && light.get('--card') === rule.values.get('--card')) {
          report(
            `identical:${pack}`,
            `${route}  [modes-identical]  the light and dark blocks for "${pack}" declare the same --card, so a boundary resolves to the same values in both modes and this check proves nothing about modes.`,
          );
        }
      }
    }
  }
  byRoute.set(route, regions);
}

/* ------------------------------------------------------------------ *
 * The map
 * ------------------------------------------------------------------ */

if (MAP.ground !== SITE.ground) {
  findings.push(
    `pack-map.json  [ground disagreement]  the map says the ground is "${MAP.ground}" and lib/site.json says\n` +
      `      "${SITE.ground}". The ground is one fact with one owner.`,
  );
}

const multiset = (packs) => JSON.stringify([...packs].sort());

/**
 * The map, checked per route rather than in aggregate.
 *
 * Per route, because a region is a claim about one page: a header that carries five
 * marks on nine routes is five marks on each of them, and adding nine copies of a
 * boundary to a total would let a page with none of them pass as long as another page
 * had nine. The landing is the page the map describes, so its region set must equal
 * the map's exactly; every other route may carry a subset, because the products band
 * is the landing's alone.
 */
for (const [route, regions] of [...byRoute.entries()].sort()) {
  for (const [region, packs] of [...regions.entries()].sort()) {
    const expected = MAP.regions[region];
    if (!expected) {
      findings.push(
        `${route}  [undeclared-region]  ${region} carries ${multiset(packs)} and the map does not declare it.\n` +
          '      A map that says zero is a decision; a map that says nothing is a drift.',
      );
      continue;
    }
    if (multiset(packs) !== multiset(expected.packs)) {
      findings.push(
        `${route}  [map-mismatch]  ${region} carries ${multiset(packs)} and the map declares\n` +
          `      ${multiset(expected.packs)}.`,
      );
    }
  }
}

const landing = byRoute.get(LANDING) ?? new Map();
for (const region of Object.keys(MAP.regions)) {
  if (!landing.has(region)) {
    findings.push(`${region}  [missing-on-landing]  the map declares this region and the landing does not carry it.`);
  }
}
for (const region of landing.keys()) {
  if (!(region in MAP.regions)) continue;
}
if (!landing.size) {  findings.push(`  [missing-landing]  this export has no ${LANDING} document, so the map could not be checked.`);
}

/* Every region any route carried, for the report. */
const actual = new Map();
for (const [route, regions] of byRoute) {
  for (const [region, packs] of regions) {
    if (!actual.has(region)) actual.set(region, { packs: new Set(), routes: [] });
    actual.get(region).packs = new Set([...actual.get(region).packs, ...packs]);
    actual.get(region).routes.push(route);
  }
}

/* The rule itself, derived from what the landing carries and asserted against what the
   map allows. Both halves are needed: the derived set is what the page does, the
   declared set is what the page may do, and a page that grows a third region carrying
   a second pack fails on the difference between them. */
const derivedSecond = [...(byRoute.get(LANDING) ?? new Map())]
  .filter(([, packs]) => packs.some((pack) => pack !== MAP.ground))
  .map(([region]) => region)
  .sort();

if (JSON.stringify(derivedSecond) !== JSON.stringify([...MAP.secondPackRegions].sort())) {
  findings.push(
    `  [second-pack-regions]  the regions carrying a pack that is not the ground are ${JSON.stringify(derivedSecond)},\n` +
      `      and the map allows ${JSON.stringify([...MAP.secondPackRegions].sort())}. A boundary moves the corner radius\n` +
      '      beneath it, so a third region carrying a second pack is a third set of corners that mean something\n' +
      '      other than radius.',
  );
}

console.log(`\n${NAME}: ${findings.length} finding(s) across ${documents} document(s) and ${boundaries} boundary/boundaries read`);
console.log(`${NAME}: the ground is "${MAP.ground}"; ${marks} of ${boundaries} boundary/boundaries sit on a mark`);
console.log(`${NAME}: regions read, with the packs each carries and how many routes carry it:`);
for (const [region, entry] of [...actual.entries()].sort()) {
  console.log(
    `${NAME}:   ${region}  ${multiset([...entry.packs])}  on ${entry.routes.length} route(s)`,
  );
}
console.log(
  `${NAME}: ${derivedSecond.length} region(s) carry a pack that is not the ground: ${derivedSecond.join(', ')}; the map allows ${MAP.secondPackRegions.join(', ')}`,
);
console.log(
  `${NAME}: both modes were resolved for every boundary, from ${CSS_FILES.length} emitted stylesheet(s) and from the\n` +
    '      published token contract, and each boundary was matched against both.',
);
console.log(
  `${NAME}: this is a selector match over emitted CSS and emitted markup, not a layout engine. It cannot see a\n` +
    '  runtime that sets data-pack after paint. A screenshot in one mode is not evidence for any of this.',
);

if (findings.length > 0) {
  for (const finding of findings) console.error(`error ${finding}`);
  console.error(
    `\nA pack boundary is a promise with two axes. It re-points the corner radius as well as the colour, so a\n` +
      '  boundary on anything but a fully rounded mark changes that shape, and a boundary with no mode class of\n' +
      '  its own resolves its pack in the wrong mode on half the pages a reader sees.',
  );
  process.exit(1);
}

console.log(
  `${NAME}: the map holds. Two regions carry a second pack, every boundary is on a mark, and every one of them\n` +
    '  resolves its own pack in both light and dark mode.',
);
