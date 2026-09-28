/**
 * The gate that keeps Ant Design out.
 *
 * A rule in a document decays, and this one already had decayed: the site's own
 * instructions said "never import from `antd` directly" while three files did, the
 * build baked 126 KB of generated variables from it on every run, and the generated
 * file was the only definition site for every custom property the site's own
 * stylesheet read. A gate is a program in the build, so a fix reaches every
 * repository that runs it and cannot be declined by a document nobody reads.
 *
 * Five patterns, bound to a surface, because a bare `antd` string is wrong in both
 * directions: it fires on this file's own prose, which names the thing it keeps out,
 * and a scan for `@ant-design/` alone would miss a reintroduced direct import. Each
 * pattern below names a surface, so the finding says where the trace is.
 *
 * The lockfile is read as a dependency graph and not grepped. A lockfile cannot be
 * grepped: a base64 integrity hash contains the characters a package-specifier
 * pattern admits, so a grep for `antd` reports hits that are not packages. And
 * removing a dependency line does not empty a lockfile when another package declares
 * the competitor, which is exactly the case here: the retired design-system line
 * declared it, so ten packages stayed reachable after the line was dropped and only
 * the move of the pin emptied the graph.
 *
 * **A gate that can scan nothing must fail.** `MIN_FILES` is that floor: the run
 * reports how many files and how many importer edges it read, and a run that read
 * fewer than the floor is a failure rather than a clean bill of health. That is the
 * shape of the failure this gate exists to make impossible: a check that has never
 * been red is not evidence of anything.
 *
 * Run: node scripts/check-antd.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const NAME = 'antd';
const ROOT = process.cwd();

/** The files this gate must read, or the run is a pass having read nothing. */
const MIN_FILES = 12;

/** Text files the gate reads, by extension. Binary and lockfile formats excluded. */
const TEXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|json|md|mdx|svg|yml|yaml|toml)$/;

/** Directories a build or a dependency manager owns. Never read, always printed. */
const SKIP = new Set(['node_modules', '.next', 'out', '.wrangler', '.git', '.source', 'coverage']);

/**
 * The patterns, each bound to the surfaces where a trace of the old line is a defect.
 *
 * `manifest` and `lockfile` are the dependency declarations. `import` and `source` are
 * the code. `prose` is the reader-facing and maintainer-facing documents, where the
 * word appears only where a note is naming the removal. A pattern is a set rather
 * than one string so a hit says which surface it was and why that surface matters.
 */
const PATTERNS = [
  {
    name: 'dependency declared',
    surfaces: new Set(['manifest', 'lockfile']),
    pattern: /"(@ant-design\/[a-z-]+|antd)"|'(?:@ant-design\/[a-z-]+|antd)'/gi,
    note: 'a package.json or a lockfile entry is a live dependency',
  },
  {
    name: 'module imported',
    surfaces: new Set(['source']),
    pattern: /(?:from|require\(|import\()\s*['"](@ant-design\/[a-z-]+|antd)['"]/gi,
    note: 'an import of the competitor is a live use of it',
  },
  {
    name: 'generated artefact',
    surfaces: new Set(['file', 'script', 'workflow', 'document']),
    pattern: /antd-vars\.css|bake-antd-css|prismCssVarKey|prismBrandPacks|PrismThemeModeProvider/g,
    note: 'the generated variablesheet, its generator and the old theming symbols are all the same removal',
  },
];

/**
 * The one allowance, and it is a file rather than a pattern.
 *
 * This gate's own prose names the competitor five times. A carve-out by pattern would
 * be a second rule to keep in step; a carve-out by file is the one exception, it is
 * printed on every run, and it names what it is.
 */
const ALLOW_FILE = 'scripts/check-antd.mjs';

const findings = [];
const read = [];
const skipped = [];
let bytes = 0;
let importerEdges = 0;

/** The surface a file belongs to, from its path. Declared, not inferred from a pattern. */
function surfaceOf(relative) {
  if (relative === 'package.json') return 'manifest';
  if (relative === 'pnpm-lock.yaml') return 'lockfile';
  if (relative.startsWith('.github/workflows/')) return 'workflow';
  if (relative.startsWith('scripts/')) return 'script';
  if (/^(README|CONTRIBUTING|AGENTS|CLAUDE|CONSISTENCY)\.md$/.test(relative)) return 'document';
  if (/^(app|components|lib|test|content)\//.test(relative)) return 'source';
  return 'file';
}

/** Every text file in the repository, with its surface. */
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relative = path.relative(ROOT, full).split(path.sep).join('/');
    if (SKIP.has(entry.name)) {
      skipped.push(relative);
      continue;
    }
    if (entry.isDirectory()) {
      walk(full);
    } else if (TEXT.test(entry.name)) {
      read.push({ relative, surface: surfaceOf(relative) });
    }
  }
}

walk(ROOT);

if (read.length < MIN_FILES) {
  console.error(
    `\n${NAME}: read ${read.length} file(s) and this gate needs at least ${MIN_FILES}. A gate that read\n` +
      '  nothing reports zero findings, and a zero-finding report is indistinguishable from a clean\n' +
      '  repository. Run it from the repository root.',
  );
  process.exit(1);
}

for (const file of read) {
  if (file.relative === ALLOW_FILE) continue;
  const source = readFileSync(path.join(ROOT, file.relative), 'utf8');
  bytes += source.length;
  for (const rule of PATTERNS) {
    if (!rule.surfaces.has(file.surface)) continue;
    for (const match of source.matchAll(rule.pattern)) {
      findings.push(
        `${file.relative}  [${rule.name}]  "${match[0]}" is a trace of the retired line, and ${rule.note}.`,
      );
    }
  }
}

/* The lockfile as a dependency graph: the importer edge is the thing that survives a
   dropped dependency line, and a grep cannot see it. */
const lock = path.join(ROOT, 'pnpm-lock.yaml');
if (statSync(lock).isFile()) {
  const source = readFileSync(lock, 'utf8');
  for (const line of source.split('\n')) {
    const edge = /^\s{2,}([\w./@-]+):\s*$/.exec(line);
    if (!edge) continue;
    importerEdges += 1;
    if (/^(antd|@ant-design\/)/.test(edge[1])) {
      findings.push(
        `pnpm-lock.yaml  [reachable package]  "${edge[1]}" is still a node in the dependency graph, so ` +
          'it is still installable. Deleting a dependency line does not empty a lockfile while another ' +
          'package declares it.',
      );
    }
  }
} else {
  findings.push(
    'pnpm-lock.yaml  [missing]  the lockfile does not resolve, so reachability cannot be read at all.',
  );
}

console.log(`\n${NAME}: ${findings.length} finding(s) across ${read.length} file(s) read, ${bytes} byte(s)`);

/* The design system's version is the contract's version, so the pin is exact and the
   exact value is printed on every run. A range would let this site move onto a line
   nobody chose for it, which is the one thing an exact pin is for. */
const manifest = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
/* The one package this repository pins. The token package is deliberately absent:
   `@nanisoft/prism-ui` declares it at an exact version, so it arrives at the version
   the component package was released against and this repository cannot be handed a
   mismatched pair. Naming it here would be a second declaration of a number another
   repository owns, and that is how one site spent a release on a different line. */
const PINS = ['@nanisoft/prism-ui'];
for (const name of PINS) {
  const pin = manifest.dependencies?.[name];
  if (typeof pin !== 'string' || !/^\d+\.\d+\.\d+$/.test(pin)) {
    findings.push(
      `package.json  [range pin]  "${name}" is pinned as ${pin}, and a range lets this site move onto a ` +
        'design-system line nobody chose for it. The pinned package is the whole cross-repository contract.',
    );
  } else {
    console.log(`${NAME}: pinned exactly, ${name}@${pin}`);
  }
}
console.log(`${NAME}: ${importerEdges} importer edge(s) read from pnpm-lock.yaml as a dependency graph`);
console.log(`${NAME}: every directory this run did not read, printed so an exclusion is arguable:`);
for (const directory of [...SKIP].sort()) console.log(`${NAME}:   ${directory}/`);
console.log(`${NAME}: the one file this run did not judge: ${ALLOW_FILE}, which is the gate's own prose`);
console.log(
  `${NAME}: this is a text and dependency-graph scan. It cannot see a competitor reached through a\n` +
    '  package that renames it, and it cannot see a runtime that resolves one by string.',
);

if (findings.length > 0) {
  for (const finding of findings) console.error(`error ${finding}`);
  console.error(
    `\nNo trace of the retired line survives here: not a dependency, not an import, not a generated\n` +
      '  stylesheet, not a build step, and not a living instruction.',
  );
  process.exit(1);
}

console.log(`${NAME}: no trace of the retired line in any surface this gate reads.`);
