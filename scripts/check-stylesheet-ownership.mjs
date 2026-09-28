/**
 * Gate 1: this site's stylesheet does not compete with the design system's base rules.
 *
 * The layer is not the cause of these failures; the layer is the reason they are
 * invisible. Prism's base rules sit in `@layer base` and a consumer's sheet is
 * unlayered, so an unlayered declaration outranks a layered one at any specificity
 * regardless of import order, and a consumer that imported its sheet first would have
 * exactly the same outcome. What the layer buys is that nobody can tell, from a
 * screenshot, that the site won.
 *
 * So ownership is gated instead. A site declaration **competes** when it can match the
 * same element, for a property prism's base declares, with shorthands expanded. Two
 * looser definitions were tried and rejected: "any declaration of a property prism's
 * base declares anywhere" is 1,478 rows across this family and says that every
 * declaration in CSS touches something preflight resets; "any declaration of a
 * property prism's base declares" is 98 rows of which 55 match no element on this
 * line. The list below is the narrow one, and it needs no cascade to decide: an
 * unlayered bare-element declaration for a property prism's base declares **is** the
 * defect, whatever the cascade then does with it.
 *
 * The four properties this site lost by rewriting, and the failure each one hid:
 *
 *   `background`  a page ground that reverts to transparent, so a white page in dark
 *                 mode. The old sheet's `var(--prism-color-bg-layout)` resolved to
 *                 nothing once the generated variablesheet went, and an unlayered
 *                 shorthand wins the cascade while doing it.
 *   `color`       inherited, so it reverted to the browser default: black text on a
 *                 dark ground, and a link that takes its parent's colour while its
 *                 own `text-decoration: none` survives as a separate declaration.
 *   `outline`     a focus rule that suppresses the browser's own indicator, which is
 *                 the only indicator on anything that is not a prism Component.
 *   `border-color`  a hairline that reverts to `border-style: none`, so a box loses its
 *                 edge and reads as a deliberate absence rather than as a bug.
 *
 * The second assertion is the general form of the dead-alias problem: no
 * `color-mix()` may take a `var()` as an operand. A shorthand with one dead operand
 * erases the declaration rather than repainting it, which is why this is a rule about
 * the shape of the expression and not a list of alias names.
 *
 * The third assertion is the rest of the same problem, and this repository is where it
 * was measured: **no `var()` in the site's own sheet may name a custom property that
 * nothing declares.** It is not a style opinion. A custom property that resolves to
 * nothing does not paint a wrong colour; the declaration it appears in is invalid at
 * computed-value time, so a shorthand erases itself and a longhand reverts to its
 * initial value. The four families this repository lost to that, all of them silent,
 * were a page ground that reverted to `transparent`, an ink that reverted to the
 * browser default (black, on a dark ground), a hairline that reverted to
 * `border-style: none`, and a `border-radius: var(--radius-sm)` that reverted to
 * nothing at all, because the emitted stylesheet declares `--radius` and no other
 * member of the scale. A member is emitted only where a component uses it and a
 * consumer does not run Tailwind, so the scale is not readable from here even though
 * the design system says the scale exists.
 *
 * The reference is the emitted stylesheet, read through the installed package's own
 * export map, so a renamed or retired token is a finding rather than a silent
 * erasure. `SUPPLIED` is the one thing that reference cannot see: a custom property a
 * build step puts on an element, which is how a font file arrives. It is a list rather
 * than a pattern so a reader can argue with it, and it is printed on every run.
 *
 * **Where the list lives.** The canonical copy of these names belongs in the design
 * system, as `packages/ui/scripts/consumer-ownership.json`, so four repositories
 * cannot disagree about it. That file is not on the package's published surface
 * (`files: ["dist", "THIRD-PARTY-NOTICES.md"]` and no `./scripts` export), so it
 * cannot be read from here yet and the names are restated below. When it is published,
 * this script reads it and this list becomes a floor rather than a copy.
 *
 * **The honest limit, printed on every run.** This is a text scan over class strings
 * and selectors, not a cascade resolution. It does not see a class-scoped rule that
 * competes, it does not see an inline `style` prop, it does not see a stylesheet it
 * is not pointed at, and it does not see prism's base layer change. A gate that
 * appeared to resolve cascades and did not would be worse than no gate, because it
 * would retire the question.
 *
 * Run: node scripts/check-stylesheet-ownership.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';

const NAME = 'stylesheet-ownership';
const ROOT = process.cwd();
const require = createRequire(path.join(ROOT, 'package.json'));

/** The properties prism's own base layer declares, so a bare-element rule competes. */
const COMPETING_PROPERTIES = [
  'background',
  'background-color',
  'color',
  'font-family',
  'outline',
  'outline-style',
  'border-color',
];

/** The two selector shapes that are always a competition when they carry one of them. */
const FOCUS_SELECTOR = /:focus(-visible)?\b/;

/** The stylesheets this gate reads. A list, so a new sheet is a decision a reader sees. */
const SHEETS = ['app/globals.css'];

/**
 * Custom properties the site's own sheet reads and no stylesheet on disk declares.
 *
 * Each line is a property and the reason it exists, because an exception with no
 * reason is an exception a reader has to guess at. This one is the class
 * `next/font/google` puts on the document element at build time, which is how the
 * design system's first family arrives as a file rather than as a name.
 */
const SUPPLIED = {
  '--font-inter': 'declared by next/font at build time as a class on the document element',
};

/**
 * How many declarations the sheets below must hold, or this run read nothing.
 *
 * A floor on declarations *read*, not on declarations *found*: a clean sheet is
 * supposed to find zero, so a floor on findings would fail a correct repository and a
 * floor on nothing would pass an unread one.
 */
const MIN_DECLARATIONS = 20;

/* Split a stylesheet into `selector { declarations }` without a CSS parser, keeping
   line numbers so a finding names the line a reader has to edit. Comments are
   stripped first and blanked rather than removed, for the same line-number reason. */
function blankComments(source) {
  const out = source.split('');
  for (let i = 0; i < out.length; i += 1) {
    if (out[i] === '/' && out[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2);
      const end = close === -1 ? out.length : close + 2;
      for (let k = i; k < end; k += 1) {
        if (out[k] !== '\n') out[k] = ' ';
      }
      i = end - 1;
    } else if (out[i] === '/' && out[i + 1] === '/') {
      let end = source.indexOf('\n', i);
      if (end === -1) end = out.length;
      for (let k = i; k < end; k += 1) out[k] = ' ';
      i = end - 1;
    }
  }
  return out.join('');
}

function blocks(css) {
  const found = [];
  const pattern = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of css.matchAll(pattern)) {
    const startLine = css.slice(0, match.index).split('\n').length;
    found.push({
      selectors: match[1].split(',').map((part) => part.trim()).filter(Boolean),
      body: match[2],
      startLine,
    });
  }
  return found;
}

const findings = [];
let sheets = 0;
let declarations = 0;
let competing = 0;
let rules = 0;

const missing = SHEETS.filter((sheet) => {
  try {
    readFileSync(path.join(ROOT, sheet), 'utf8');
    return false;
  } catch {
    return true;
  }
});
if (missing.length > 0) {
  console.error(
    `\n${NAME}: ${missing.length} of ${SHEETS.length} configured stylesheets do not resolve: ${missing.join(', ')}.\n` +
      '  A gate that read nothing reports a clean sheet, so an unresolved root fails the run.',
  );
  process.exit(1);
}

for (const sheet of SHEETS) {
  sheets += 1;
  const source = blankComments(readFileSync(path.join(ROOT, sheet), 'utf8'));
  for (const block of blocks(source)) {
    rules += 1;
    /* Coverage: every declaration in the sheet is counted, whether or not it is one
       the list names. This is the number that distinguishes a pass from a scan of
       nothing. */
    for (const declaration of block.body.split(';')) {
      if (/^[a-z-]+\s*:/.test(declaration.trim())) declarations += 1;
    }
    for (const selector of block.selectors) {
      /* A focus rule is a finding whatever it declares: prism's own ring is a
         `box-shadow` on a class, so a site `outline` does not compete with it, it
         draws a second indicator over it, and on anything that is not a prism
         Component it is the only thing standing between a reader and no indicator. */
      if (FOCUS_SELECTOR.test(selector)) {
        findings.push(
          `${sheet}:${block.startLine}  [focus-indicator]  ${selector} draws a focus indicator in the site's\n` +
            '      own sheet. The design system draws its ring on the component, so this is either a second band\n' +
            '      over the real one or the suppression of the browser default on everything else.',
        );
        continue;
      }
      /* A bare-element selector: `body`, `a`, `*`, `html`. A class in the selector
         makes the rule this site's own surface, which is a different question. */
      const hasClass = selector.includes('.') || selector.includes('[') || selector.includes(':');
      if (hasClass) continue;
      for (const property of COMPETING_PROPERTIES) {
        const declared = new RegExp(`(?:^|[;{\\s])${property}\\s*:`, 'm').test(block.body);
        if (!declared) continue;
        competing += 1;
        findings.push(
          `${sheet}:${block.startLine}  [competes-with-base]  ${selector} declares ${property}, which prism's\n` +
            '      own base layer declares. Prism\'s base is layered and this sheet is not, so this rule wins the\n' +
            '      cascade at any specificity and silently replaces the design system\'s.',
        );
      }
    }
    /* The dead-alias shape, wherever it appears. */
    for (const match of block.body.matchAll(/color-mix\([^)]*var\(/g)) {
      competing += 1;
      findings.push(
        `${sheet}:${block.startLine}  [dead-alias]  color-mix() takes a var() as an operand.\n` +
          '      A custom property that resolves to nothing does not paint a wrong colour: a shorthand with one\n' +
          '      dead operand erases the whole declaration, so the rule stops existing.',
      );
      void match;
    }
  }
}

/* ------------------------------------------------------------------ *
 * The rest of the same problem: a read of a property nothing declares
 * ------------------------------------------------------------------ */

/**
 * The design system's emitted stylesheet, through its own export map.
 *
 * Resolved rather than hard-coded, so a renamed subpath is an error here rather than a
 * run that reports every property in the site's sheet as undeclared, which is the one
 * failure mode a floor on findings cannot catch.
 */
const EMITTED = (() => {
  try {
    return readFileSync(require.resolve('@nanisoft/prism-ui/styles.css'), 'utf8');
  } catch (error) {
    console.error(
      `\n${NAME}: the design system's emitted stylesheet does not resolve, so every custom property this\n` +
        '  sheet reads is unanswerable and a clean run would be an empty one. Run pnpm install first.',
    );
    console.error(String(error));
    process.exit(1);
  }
})();

/** Every custom property a stylesheet declares, `--name` included. */
function declaredProperties(css) {
  return new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
}

const EMITTED_PROPERTIES = declaredProperties(EMITTED);
let deadReads = 0;

for (const sheet of SHEETS) {
  /* Comments are blanked for this scan as well, and for the same reason: a comment
     that names a property in order to say it resolves to nothing is prose about a
     declaration, not a declaration. Blanking preserves the line count, so the line
     number a finding prints is still the line a reader has to edit. */
  const source = blankComments(readFileSync(path.join(ROOT, sheet), 'utf8'));
  const own = declaredProperties(source);
  for (const match of source.matchAll(/var\((--[a-z0-9-]+)/g)) {
    const property = match[1];
    if (own.has(property) || EMITTED_PROPERTIES.has(property) || property in SUPPLIED) continue;
    deadReads += 1;
    const line = source.slice(0, match.index).split('\n').length;
    findings.push(
      `${sheet}:${line}  [dead-read]  var(${property}) names a custom property no stylesheet declares.\n` +
        '      The declaration is invalid at computed-value time, so a shorthand erases itself and a longhand\n' +
        '      reverts to its initial value. This is not a wrong colour; it is no declaration at all.',
    );
  }
}

if (declarations < MIN_DECLARATIONS) {
  console.error(
    `\n${NAME}: the sheets this run read hold ${declarations} competing declaration(s) and it needs at least\n` +
      `  ${MIN_DECLARATIONS} to be sure it is reading them. A renamed stylesheet path empties this run and an\n` +
      '  emptied run reports a clean sheet.',
  );
  process.exit(1);
}

console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${sheets} sheet(s), ${rules} rule(s) and ${declarations} declaration(s) read`,
);
console.log(
  `${NAME}: ${competing} of them compete with prism's base layer; properties in the list: ` +
    `${COMPETING_PROPERTIES.join(', ')}`,
);
console.log(`${NAME}: sheets read: ${SHEETS.join(', ')}`);
console.log(
  `${NAME}: ${deadReads} dead read(s): every var() in the site's own sheet names a property the emitted\n` +
    `  stylesheet declares, the sheet itself declares, or one of ${Object.keys(SUPPLIED).length} property the build\n` +
    `  supplies. The emitted reference carried ${EMITTED_PROPERTIES.size} declared custom properties.`,
);
for (const [property, why] of Object.entries(SUPPLIED)) {
  console.log(`${NAME}:   supplied: ${property} — ${why}`);
}

/* ------------------------------------------------------------------ *
 * The supplied property has to arrive, or the site sheet's own first
 * declaration is the dead one
 * ------------------------------------------------------------------ */

/**
 * The class the build emits for each supplied property, from the emitted stylesheet.
 *
 * Read out of the build's own output rather than out of the design system's package
 * sheet, because the class is generated by the font loader and lives only in the
 * compiled result. Read out of the layout would be worse: the layout is what can be
 * wrong, and a build that stopped generating the class is a finding here rather than a
 * page nobody can explain.
 */
function supplyingClasses(property) {
  const found = new Set();
  for (const match of EMITTED_BUILD.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!new RegExp(`${property}\\s*:`).test(match[2])) continue;
    for (const selector of match[1].split(',')) {
      for (const name of selector.trim().split(/\s+/)) {
        if (name.startsWith('.')) found.add(name.slice(1));
      }
    }
  }
  return found;
}

/**
 * The class attribute on the document element of every emitted document.
 *
 * This is the assertion that a supplied property is not only declared by a class but
 * actually put on an element, and it exists because this repository shipped that
 * defect during the change that introduced the typeface: the layout spread the theme's
 * attributes after `className`, and a spread replaces a prop rather than merging it,
 * so the mode class survived and the font class did not. Every page rendered in the
 * platform's UI face, the woff2 subsets were preloaded, the `@font-face` rules
 * shipped, and nothing anywhere said so. The browser lane reads the same fact as a
 * computed value; this one reads it as markup, so it runs anywhere `node` runs.
 */
function documentClasses() {
  const out = path.join(ROOT, 'out');
  if (!existsSync(out)) {
    console.error(
      `\n${NAME}: ${out} does not exist, so no document's class attribute can be read and the supplied\n` +
        '  properties cannot be shown to arrive. Run pnpm build first.',
    );
    process.exit(1);
  }
  const seen = new Map();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) {
        const head = readFileSync(full, 'utf8').slice(0, 2000);
        const element = /<html[^>]*>/.exec(head)?.[0] ?? '';
        const classes = /\sclass="([^"]*)"/.exec(element)?.[1]?.split(/\s+/).filter(Boolean) ?? [];
        seen.set(path.relative(out, full).split(path.sep).join('/'), classes);
      }
    }
  };
  walk(out);
  if (seen.size === 0) {
    console.error(`\n${NAME}: the export emitted no document, so the supplied properties arrive nowhere.`);
    process.exit(1);
  }
  return seen;
}

const DOCUMENTS = documentClasses();

/** Every stylesheet the build emitted, which is where a generated class lives. */
const EMITTED_BUILD = (() => {
  const chunks = path.join(ROOT, 'out', '_next');
  if (!existsSync(chunks)) return '';
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.css')) files.push(full);
    }
  };
  walk(chunks);
  return files.map((file) => readFileSync(file, 'utf8')).join('\n');
})();

let arrivals = 0;
for (const [property] of Object.entries(SUPPLIED)) {
  const classes = [...supplyingClasses(property)];
  if (classes.length === 0) {
    findings.push(
      `  [supplied-nowhere]  no rule in the emitted stylesheet declares ${property}, so the build is not\n` +
        `      emitting the class that supplies it and ${Object.keys(SUPPLIED).length === 1 ? 'the' : 'each'} exception above is wrong.`,
    );
    continue;
  }
  for (const [file, onElement] of DOCUMENTS) {
    if (classes.some((name) => onElement.includes(name))) {
      arrivals += 1;
      continue;
    }
    findings.push(
      `out/${file}  [supplied-property-missing]  the document element carries ${JSON.stringify(onElement.join(' '))}\n` +
        `      and none of ${classes.join(', ')} is on it, so ${property} resolves to nothing in this document and\n` +
        '      the site sheet that reads it is invalid at computed-value time. A spread of theme attributes\n' +
        '      placed after a named className replaces the className rather than merging it.',
    );
  }
}

console.log(
  `${NAME}: ${arrivals} of ${DOCUMENTS.size * Object.keys(SUPPLIED).length} document/property pair(s) carry the class\n` +
    `  that supplies the property: ${DOCUMENTS.size} emitted document(s), read from the export.`,
);
console.log(
  `${NAME}: this is a text scan over selectors, not a cascade resolution. It cannot see a class-scoped rule\n` +
    '  that competes, an inline style prop, or a sheet it is not pointed at.',
);

if (findings.length > 0) {
  for (const finding of findings) console.error(`error ${finding}`);
  console.error(
    `\nA site stylesheet must not own a surface the design system already owns. The cascade layer is not\n` +
      '  the cause of the failures this replaces; it is the reason they were invisible.',
  );
  process.exit(1);
}

console.log(`${NAME}: this sheet competes with nothing the design system declares.`);
