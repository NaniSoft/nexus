/**
 * The content-parity comparison: does the rebuilt site still publish the same words?
 *
 * Rendered text cannot see a change that is not rendered, and a digest of `content/`
 * cannot see a change to the copy that does not live there. This repository is
 * where that second kind of copy is: the whole landing page is authored in
 * `lib/landing-content.ts` and in JSX, and 38% of the site's words never touch
 * `content/` at all. So a source digest of the content tree would have been green
 * through the entire migration. This tool reads the built static export instead,
 * which is the only place both kinds of copy meet.
 *
 * Three surfaces, because they break differently:
 *
 *   1. the content tree, as a byte-exact digest per file. A copy edit inside a
 *      post is a content change, and the migration is forbidden from making one.
 *   2. the route set, as a set. A reader who has ever bookmarked an address must
 *      keep it working, so a route that appears or disappears is a finding and
 *      cannot be declared away.
 *   3. the rendered document, per route: the title, the meta description, the
 *      heading outline, the text of `<main>`, and the text and destinations of the
 *      links inside `<main>`, plus the same for the header and the footer because
 *      the chrome is a separate decision with its own reasons.
 *
 * **One correction to the template this file was copied from, and it is a correction
 * about coverage rather than about a verdict.** The template reads the chrome with
 * `querySelector('header, footer')`, which returns the first landmark and drops the
 * rest, so the copy in the footer of every route was never in the record while the
 * gate reported it as read. This migration changes the footer's shape (the design
 * system owns the chrome now, and its props are not the old ones), which is exactly
 * the copy a digest of `content/` is blind to, so this file reads every landmark and
 * concatenates them in document order. A surface that silently reads one element of
 * two is a surface that reports a coverage it does not have.
 *
 * Extraction goes through a document parser, not a regular expression. Two titles
 * on this site serialise an ampersand, and a regex would store the escaped form
 * and then report it as a permanent difference against itself.
 *
 * **A difference is not a failure; an undeclared difference is.** Rebuilding a
 * landing on a different component set changes its rendered text even when not one
 * word of copy is touched, so a comparison that failed on any difference would
 * force the migration to be perfect rather than honest. Every difference must
 * therefore appear in an expectations file, by route, by surface, with the value
 * and a reason. An expectations file with an entry that matched nothing is itself
 * a finding, for the reason the rest of this family keeps making: a declaration
 * that fires on nothing is indistinguishable from a rule that found nothing.
 *
 * The baseline lives outside this repository and is destroyed at the close of the
 * sweep. A large snapshot committed to a public repository is a liability, and the
 * liability is rot rather than secrecy. The permanent gate that outlives the sweep
 * is `check-links.mjs`, which resolves every internal destination against the
 * emitted route set.
 *
 * Usage:
 *   node scripts/check-content-parity.mjs --record <file>
 *   node scripts/check-content-parity.mjs --baseline <file> [--expect <file>]
 *
 * Run from the repository root, after `pnpm build`.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { JSDOM } from 'jsdom';

const NAME = 'content-parity';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');
const CONTENT = path.join(ROOT, 'content');

/**
 * The surfaces a route contributes to the comparison, in the order they are read.
 *
 * Declared rather than discovered, so adding a field to the record is a decision a
 * reader can see. A tool that inferred what to compare from the shape of a page
 * would quietly stop comparing something the first time that shape changed.
 */
const SURFACES = ['title', 'description', 'outline', 'mainText', 'mainLinks', 'chromeText', 'chromeLinks'];

/**
 * How many routes and content files this run must read before its verdict means
 * anything. A tool that scanned an empty export directory and reported "no
 * differences" is the failure this replaces, so the floor is asserted rather than
 * assumed, and the run prints what it read either way.
 */
const MIN_ROUTES = 6;
const MIN_CONTENT_FILES = 4;

/** Every emitted HTML file under `out/`, as a sorted list of routes. */
function routes() {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.html')) {
        found.push(routeOf(full));
      }
    }
  };
  walk(OUT);
  return [...new Set(found)].sort();
}

/** `out/blog/x.html` is `/blog/x`; `out/index.html` is `/`; `out/404.html` is `/404`. */
function routeOf(file) {
  const rel = path.relative(OUT, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel === '_not-found.html') return '/_not-found';
  return `/${rel.replace(/\.html$/, '')}`;
}

/** One route's document, read from the emitted file. */
function documentOf(route) {
  const file = path.join(OUT, route === '/' ? 'index.html' : `${route.slice(1)}.html`);
  return new JSDOM(readFileSync(file, 'utf8')).window.document;
}

/** Collapses a run of whitespace, so a line break in the markup is not a change. */
function tidy(value) {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * The text nodes under `root`, in document order, one entry per non-empty run.
 *
 * Per text node rather than per block element, because the block a word sits in is
 * a rendering decision that this migration is allowed to make, and the words are
 * not. A React server render emits no whitespace between elements, so one text
 * node is one authored string, and a change in the markup around it does not
 * change the list.
 */
function textLines(root) {
  if (!root) return [];
  const walker = root.ownerDocument.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  const lines = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = tidy(node.nodeValue ?? '');
    if (text) lines.push(text);
  }
  return lines;
}

/** Every link under `root`, as `text -> destination`, in document order. */
function links(root) {
  if (!root) return [];
  return [...root.querySelectorAll('a')].map((anchor) => {
    const label = textLines(anchor).join(' ');
    return `${label} -> ${anchor.getAttribute('href') ?? ''}`;
  });
}

/** The heading outline, as `h1: text`, so a level change is visible as a change. */
function outline(document) {
  return [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(
    (heading) => `${heading.tagName.toLowerCase()}: ${textLines(heading).join(' ')}`,
  );
}

/** Everything the tool reads about one route. */
function readRoute(route) {
  const document = documentOf(route);
  const main = document.querySelector('main') ?? document.body;
  /* Every landmark, not the first one. See the note at the head of this file: the
     template's `querySelector` read the header and never the footer, and reported
     the chrome as read either way. */
  const chrome = [...document.querySelectorAll('header, footer')];
  return {
    title: tidy(document.title),
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    outline: outline(document),
    mainText: textLines(main),
    mainLinks: links(main),
    chromeText: chrome.flatMap((landmark) => textLines(landmark)),
    chromeLinks: chrome.flatMap((landmark) => links(landmark)),
  };
}

/** Every file under `content/`, as `relative path -> sha256`, sorted by path. */
function contentDigests() {
  const digests = {};
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        digests[path.relative(ROOT, full).split(path.sep).join('/')] = createHash('sha256')
          .update(readFileSync(full))
          .digest('hex');
      }
    }
  };
  if (statSync(CONTENT).isDirectory()) walk(CONTENT);
  return digests;
}

/** The whole record: the content tree, the route set, and every route's surfaces. */
function read() {
  const list = routes();
  const pages = {};
  for (const route of list) pages[route] = readRoute(route);
  return { content: contentDigests(), routes: list, pages };
}

/** Multiset difference, so a repeated line is counted as many times as it appears. */
function difference(before, after) {
  const pool = [...after];
  const removed = [];
  for (const line of before) {
    const at = pool.indexOf(line);
    if (at === -1) removed.push(line);
    else pool.splice(at, 1);
  }
  const poolBefore = [...before];
  const added = [];
  for (const line of after) {
    const at = poolBefore.indexOf(line);
    if (at === -1) added.push(line);
    else poolBefore.splice(at, 1);
  }
  return { added, removed };
}

const findings = [];
/** The indexes of the expectations that matched a real difference. */
const matched = new Set();

/**
 * Is this difference declared, and does the declaration say why.
 *
 * The key is the surface, the change and the value, plus the route, so a declaration
 * cannot quietly cover a different sentence that happens to read the same elsewhere.
 * The one exception is the route `"*"`, which covers the same difference on every
 * route: the chrome is on every route, so one declaration of a chrome change is one
 * decision rather than nine. An entry that matched nothing is a finding whether it
 * named a route or a wildcard, because a rule that fires on nothing is a rule that
 * found nothing.
 */
function declared(expectations, route, surface, change, value) {
  const index = expectations.findIndex(
    (entry) =>
      (entry.route === '*' || entry.route === route) &&
      entry.surface === surface &&
      entry.change === change &&
      entry.value === value,
  );
  if (index === -1) return false;
  const entry = expectations[index];
  matched.add(index);
  if (!entry.reason || entry.reason.trim().length < 8) {
    findings.push(
      `  ${route} ${surface} ${change} "${value}" is declared with no reason. A declared difference with no ` +
        'stated reason is a difference nobody decided, and the declaration is the only record of the decision.',
    );
  }
  return true;
}

const args = process.argv.slice(2);
const flag = (name) => {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? null : args[at + 1];
};

/**
 * Reads a JSON file, tolerating a byte-order mark.
 *
 * Written by hand or by a Windows editor, a baseline arrives with a BOM, and
 * `JSON.parse` throws on it. A tool that cannot read the file it wrote a week ago
 * is a tool whose verdict is a mystery rather than a result.
 */
function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''));
}

const baselinePath = flag('baseline');
const recordPath = flag('record');
const expectPath = flag('expect');

if (!baselinePath && !recordPath) {
  console.error(
    `\n${NAME}: pass --record <file> to cut a baseline or --baseline <file> to compare against one.\n` +
      '  This tool has no default mode, because a run with nothing to read and nothing to compare\n' +
      '  against is a pass having read nothing.',
  );
  process.exit(1);
}

const current = read();

if (recordPath) {
  writeFileSync(recordPath, `${JSON.stringify(current, null, 2)}\n`);
  const files = Object.keys(current.content).length;
  console.log(
    `\n${NAME}: baseline written to ${recordPath}\n` +
      `${NAME}: read ${current.routes.length} route(s) (${current.routes.join(', ')}) and ${files} content file(s)\n` +
      `${NAME}: per route, ${SURFACES.join(', ')}`,
  );
  if (current.routes.length < MIN_ROUTES) {
    console.error(
      `\n${NAME}: the export holds ${current.routes.length} route(s) and this tool needs at least ${MIN_ROUTES}.\n` +
        '  A baseline cut from a partial build is a baseline that would report no change against a broken page.',
    );
    process.exit(1);
  }
  if (files < MIN_CONTENT_FILES) {
    console.error(`\n${NAME}: content/ holds ${files} file(s) and this tool needs at least ${MIN_CONTENT_FILES}.`);
    process.exit(1);
  }
  process.exit(0);
}

const baseline = readJson(baselinePath);
const expectations = expectPath ? readJson(expectPath) : [];
if (!Array.isArray(expectations)) {
  console.error(`\n${NAME}: ${expectPath} must hold a JSON array of declared differences.`);
  process.exit(1);
}

/* 1. The content tree, byte for byte. A migration may not edit published copy. */
for (const file of new Set([...Object.keys(baseline.content), ...Object.keys(current.content)])) {
  const before = baseline.content[file] ?? null;
  const after = current.content[file] ?? null;
  if (before === after) continue;
  findings.push(
    `  content/${file.replace(/^content\//, '')} ${before === null ? 'added' : after === null ? 'removed' : 'changed'}` +
      '  This tool reads the content tree byte for byte, and the migration is not allowed to edit published copy.',
  );
}

/* 2. The route set, as a set. A reader's bookmark is not a declared difference. */
for (const route of baseline.routes.filter((r) => !current.routes.includes(r))) {
  findings.push(`  route ${route} removed. Every address a reader has ever used has to keep working.`);
}
for (const route of current.routes.filter((r) => !baseline.routes.includes(r))) {
  findings.push(`  route ${route} added. A new address is a content change, not a rendering change.`);
}

/* 3. The rendered document, per surface. */
for (const route of baseline.routes.filter((r) => current.routes.includes(r))) {
  for (const surface of SURFACES) {
    const before = baseline.pages[route]?.[surface];
    const after = current.pages[route]?.[surface];
    if (before === undefined || after === undefined) {
      findings.push(`  ${route} ${surface} was ${before === undefined ? 'added to' : 'removed from'} the record.`);
      continue;
    }
    if (surface === 'title' || surface === 'description') {
      if (before === after) continue;
      const change = after === '' ? 'removed' : before === '' ? 'added' : 'changed';
      if (!declared(expectations, route, surface, change, after === '' ? before : after)) {
        findings.push(
          `  ${route} ${surface} ${change}: "${before}" -> "${after}". Metadata is a published string and a ` +
            'changed one is invisible in a screenshot review.',
        );
      }
      continue;
    }
    const { added, removed } = difference(before, after);
    for (const value of removed) {
      if (!declared(expectations, route, surface, 'removed', value)) {
        findings.push(`  ${route} ${surface} removed: "${value}"`);
      }
    }
    for (const value of added) {
      if (!declared(expectations, route, surface, 'added', value)) {
        findings.push(`  ${route} ${surface} added: "${value}"`);
      }
    }
  }
}

/* A declaration that matched nothing is a finding: it is a rule that fired on nothing.
   The first entry of the file is its own comment, which is not a declaration. */
expectations.forEach((entry, index) => {
  if (entry.$comment || matched.has(index)) return;
  findings.push(
    `  ${entry.route} ${entry.surface} ${entry.change}: "${entry.value}" is declared but no such difference ` +
      'exists. A declaration that fires on nothing is indistinguishable from a rule that found nothing, and it ' +
      'stops being a record of a decision the moment the decision is undone.',
  );
});

const declarations = expectations.filter((entry) => !entry.$comment);
const declaredCount = declarations.length;
const expectedHits = matched.size;
const totalLines = Object.values(current.pages).reduce(
  (sum, page) => sum + SURFACES.reduce((n, surface) => n + (Array.isArray(page[surface]) ? page[surface].length : 1), 0),
  0,
);

console.log(
  `\n${NAME}: compared ${current.routes.length} route(s) and ${Object.keys(current.content).length} content file(s) ` +
    `against ${baselinePath}`,
);
console.log(`${NAME}: ${totalLines} recorded line(s) across ${SURFACES.length} surfaces per route`);
console.log(
  `${NAME}: ${declaredCount} difference(s) declared in ${expectPath ?? 'no expectations file'}, ${expectedHits} of them matched`,
);
console.log(
  `${NAME}: rendered text is read through a document parser, and it covers the copy that lives in ` +
    'lib/landing-content.ts and in JSX as well as the copy in content/.',
);

if (findings.length > 0) {
  for (const finding of findings) console.error(`error ${finding}`);
  console.error(
    `\n${NAME}: ${findings.length} undeclared difference(s). Every difference belongs in the expectations file\n` +
      '  with the reason it is a rendering change and not a copy change.',
  );
  process.exit(1);
}

console.log(`${NAME}: no undeclared difference. The rebuild changed the rendering layer and not the content.`);
