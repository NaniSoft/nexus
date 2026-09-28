/**
 * The documentation tree, checked from the built export.
 *
 * This site publishes the deepest documentation set in the family: twenty-seven
 * documents across seven sections, every one of them rendered by the design system's
 * own documentation screen. That screen is where a deep tree either works or does
 * not, and the two ways it fails are both silent. A section that stops rendering
 * leaves a rail that is one entry shorter and nothing that throws. A pager that
 * derives a neighbour wrongly moves a reader to the wrong document. A contents rail
 * that points at a heading the document does not carry is a link that renders, looks
 * right, and goes nowhere.
 *
 * **The expected order is read from the corpus, not from the page.** `content/docs/meta.json`
 * and each section's own `meta.json` declare the order a reader meets the tree in, and
 * the design system's screen derives both the rail and the pager from that order. So
 * this gate reads the corpus and compares it to the emitted markup, which means it
 * cannot confirm the page by comparing the page with itself. A gate that reads one
 * document and asserts it agrees with that same document is a pass having read
 * nothing.
 *
 * Three assertions per documentation route, and each is a claim about the whole
 * twenty-seven rather than about one page:
 *
 *   1. The rail holds all twenty-seven destinations, in the corpus's order. Checked on
 *      every documentation route, because a rail that is one entry short on one page is
 *      a rail a reader on that page cannot navigate.
 *   2. The pager's two halves are the tree's own neighbours, and a page at either end
 *      of the tree prints one half rather than a blank one. The pager is derived by the
 *      design system, so what is checked is that the derivation saw the tree the
 *      corpus declares.
 *   3. The contents rail lists this document's own `h2` and `h3`, in document order,
 *      and every entry resolves to an id the same document emits. A document with
 *      headings and no contents rail is a finding, and so is a contents rail on a
 *      document with none.
 *
 * The honest limit, printed on every run: this reads emitted markup, not a layout
 * engine, so it cannot see a rail the reader cannot reach at this viewport. The
 * screen's rails are `lg:` and up by the design system's own arrangement, and that is
 * a decision the design system made rather than one this gate can check.
 *
 * Run after `pnpm build`: node scripts/check-docs-tree.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { JSDOM } from 'jsdom';

const NAME = 'docs-tree';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');
const DOCS = path.join(ROOT, 'content', 'docs');

/** The section index, which is this site's own screen and not one of the twenty-seven. */
const INDEX = '/docs';

/**
 * The number of documents the ticket names, asserted rather than derived.
 *
 * The order is read from the corpus; the count is a constant so that adding a document
 * fails this gate and a reader has to change the number on purpose. A gate that
 * recomputed its own expectation would pass a tree that lost a page and gained two.
 */
const EXPECTED_PAGES = 27;

/** How many documentation routes this run must read, or it is a pass having read nothing. */
const MIN_ROUTES = 27;

const findings = [];

/* ------------------------------------------------------------------ *
 * The corpus: the order, from the files that declare it
 * ------------------------------------------------------------------ */

/** One JSON file from `content/docs/`, with a byte-order mark tolerated. */
function meta(file) {
  return JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''));
}

/** The documents the corpus declares, in the order a reader meets them. */
function corpusOrder() {
  const root = meta(path.join(DOCS, 'meta.json'));
  const order = [];
  for (const entry of root.pages) {
    const url = `/docs/${entry}`;
    const folder = path.join(DOCS, entry);
    if (!existsSync(folder)) {
      order.push(url);
      continue;
    }
    /* A section index comes before its own children, because that is the order the
       screen states: the group's route, then the pages under it. */
    if (existsSync(path.join(folder, 'index.mdx'))) order.push(url);
    for (const page of meta(path.join(folder, 'meta.json')).pages) order.push(`${url}/${page}`);
  }
  return order;
}

const ORDER = corpusOrder();

/* ------------------------------------------------------------------ *
 * The export
 * ------------------------------------------------------------------ */

/** Every emitted HTML file, as a parsed document with its route. */
function documents() {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) {
        const relative = path.relative(OUT, full).split(path.sep).join('/');
        found.push([full, `/${relative.replace(/\.html$/, '')}`]);
      }
    }
  };
  if (!existsSync(OUT)) {
    console.error(`\n${NAME}: ${OUT} does not exist, so there is no export to read. Run pnpm build first.`);
    process.exit(1);
  }
  walk(OUT);
  return found;
}

/** One finding per problem, however many pages share it, with a count of how many. */
const reported = new Map();
function report(key, message) {
  const at = reported.get(key);
  if (at === undefined) {
    reported.set(key, 1);
    findings.push(message.replace('(count)', '1'));
  } else {
    reported.set(key, at + 1);
  }
}

if (ORDER.length !== EXPECTED_PAGES) {
  console.error(
    `\n${NAME}: the corpus declares ${ORDER.length} document(s) and this gate is written for ${EXPECTED_PAGES}.\n` +
      '  The count is a constant on purpose: adding a document is a decision, and a gate that recomputed its\n' +
      '  own expectation would pass a tree that lost a page and gained two.',
  );
  process.exit(1);
}

const all = documents();
const routes = new Set(all.map(([, route]) => route));
let read = 0;
let contents = 0;

for (const [file, route] of all) {
  if (!route.startsWith('/docs/')) continue;
  read += 1;
  const document = new JSDOM(readFileSync(file, 'utf8')).window.document;

  /* 1. The rail: all twenty-seven destinations, in the corpus's order. */
  const rail = document.querySelector('[data-slot="docs-rail"]');
  if (!rail) {
    report(`no-rail:${route}`, `  ${route}  [no-rail]  the page carries no navigation rail at all.`);
    continue;
  }
  const railHrefs = [...rail.querySelectorAll('a[href]')].map((anchor) => anchor.getAttribute('href'));
  if (JSON.stringify(railHrefs) !== JSON.stringify(ORDER)) {
    const missing = ORDER.filter((href) => !railHrefs.includes(href));
    const extra = railHrefs.filter((href) => !ORDER.includes(href));
    const at = railHrefs.findIndex((href, index) => href !== ORDER[index]);
    report(
      `rail:${route}`,
      `  ${route}  [rail]  the rail holds ${railHrefs.length} destinations and the corpus declares ${ORDER.length}.\n` +
        `      first divergence at index ${at}: ${railHrefs[at] ?? '(none)'} against ${ORDER[at] ?? '(none)'}\n` +
        `      missing: ${missing.join(', ') || 'none'}; undeclared: ${extra.join(', ') || 'none'}`,
    );
  }

  /* 2. The pager: the tree's own neighbours, and never a blank half. */
  const at = ORDER.indexOf(route);
  const expected = at === -1 ? [] : [ORDER[at - 1], ORDER[at + 1]].filter((href) => href !== undefined);
  const pager = document.querySelector('[data-slot="docs-pager"]');
  const printed = pager ? [...pager.querySelectorAll('a[href]')].map((anchor) => anchor.getAttribute('href')) : [];
  if (JSON.stringify(printed) !== JSON.stringify(expected)) {
    report(
      `pager:${route}`,
      `  ${route}  [pager]  the pager prints ${JSON.stringify(printed)} and the tree's neighbours are\n` +
        `      ${JSON.stringify(expected)}. The pager is derived by the design system, so this is the\n` +
        '      derivation having seen a different tree from the one the corpus declares.',
    );
  }

  /* 3. The contents rail: this document's own h2 and h3, in order, each resolvable. */
  const headings = [...document.querySelectorAll('article h2, article h3')];
  const railContents = document.querySelector('[data-slot="docs-contents"]');
  if (headings.length === 0) {
    if (railContents) {
      report(
        `empty-contents:${route}`,
        `  ${route}  [empty-contents]  the page carries a contents rail and the document has no h2 or h3.`,
      );
    }
    continue;
  }
  contents += 1;
  if (!railContents) {
    report(
      `no-contents:${route}`,
      `  ${route}  [no-contents]  the document carries ${headings.length} heading(s) and the page has no\n` +
        '      contents rail, so a reader has no way to know what is on this page before scrolling it.',
    );
    continue;
  }
  const entries = [...railContents.querySelectorAll('a[href]')].map((anchor) => ({
    href: anchor.getAttribute('href'),
    text: (anchor.textContent ?? '').replace(/\s+/g, ' ').trim(),
  }));
  const expectedEntries = headings.map((heading) => ({
    href: `#${heading.id}`,
    text: (heading.textContent ?? '').replace(/\s+/g, ' ').trim(),
  }));
  if (JSON.stringify(entries) !== JSON.stringify(expectedEntries)) {
    report(
      `contents:${route}`,
      `  ${route}  [contents]  the contents rail holds ${entries.length} entr(ies) and the document has\n` +
        `      ${expectedEntries.length} h2/h3 heading(s).\n` +
        `      rail: ${entries.map((entry) => entry.href).join(' ') || '(none)'}\n` +
        `      document: ${expectedEntries.map((entry) => entry.href).join(' ') || '(none)'}`,
    );
  }
  /* Every entry names an id the same document emits, which is the link the permanent
     gate cannot see because it reads the destination and not the rail. */
  const ids = new Set([...document.querySelectorAll('[id]')].map((element) => element.id));
  for (const entry of entries) {
    if (typeof entry.href === 'string' && entry.href.startsWith('#') && !ids.has(entry.href.slice(1))) {
      report(
        `dangling:${route}:${entry.href}`,
        `  ${route}  [dangling-contents]  the contents rail names ${entry.href} and this document emits no\n` +
          '      such id. A contents entry that resolves to nothing is a link that renders and goes nowhere.',
      );
    }
  }
}

/* The section index is a route this site emits and it is not one of the twenty-seven,
   so its absence is checked rather than assumed: a rebuild that stopped rendering it
   would leave the documentation reachable only by knowing an address. */
if (!routes.has(INDEX)) {
  findings.push(`  ${INDEX}  [missing-index]  the documentation section index is not emitted.`);
}

if (read < MIN_ROUTES) {
  console.error(
    `\n${NAME}: read ${read} documentation route(s) and this gate needs at least ${MIN_ROUTES}. A gate that read\n` +
      '  nothing reports a tree that does not exist as a tree that is fine.',
  );
  process.exit(1);
}

console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${read} documentation route(s), ${ORDER.length} document(s) declared by the corpus and ${contents} with a contents rail`,
);
console.log(`${NAME}: the corpus declares ${ORDER.length} document(s) and this gate is written for ${EXPECTED_PAGES}`);
console.log(`${NAME}: the order, from content/docs/meta.json and each section's own:`);
for (const href of ORDER) console.log(`${NAME}:   ${href}`);
console.log(
  `${NAME}: the rail on every documentation route was compared against that order, the pager on every route\n` +
    '      against the two neighbours that order gives it, and every contents entry against the ids its own\n' +
    '      document emits.',
);
console.log(
  `${NAME}: this reads emitted markup, not a layout engine. It cannot see a rail the reader cannot reach at\n` +
    '  this viewport, and the design system places both rails at lg and up by its own decision.',
);

if (findings.length > 0) {
  for (const finding of findings) console.error(`error ${finding}`);
  for (const [key, count] of reported) {
    if (count > 1) console.error(`  ${key} was reported by ${count} route(s); only the first is printed.`);
  }
  console.error(
    `\nA documentation tree that is one entry short is not a smaller documentation tree, it is a page a\n` +
      '  reader cannot reach, and nothing about the build notices.',
  );
  process.exit(1);
}

console.log(
  `${NAME}: the tree holds. ${ORDER.length} documents across seven sections, a rail of all ${ORDER.length} on every\n` +
    `  one of them, a pager derived from the tree, and ${contents} contents rails whose entries all resolve.`,
);
