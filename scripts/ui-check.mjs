/**
 * The UI compliance gate: no custom UI, no custom styling, asset governance.
 *
 * `pnpm ui:check` runs this. It is the standalone gate implementing the mission's
 * evidence-backed laws as codes:
 *
 *   UI001  custom stylesheet          UI007  unapproved styling dependency
 *   UI002  inline style               UI008  DS override / private path / bypass
 *   UI003  hardcoded colour           UI009  unapproved font import
 *   UI004  arbitrary styling class    UI010  direct DOM styling
 *   UI005  unapproved UI import       UI011  unapproved responsive styling
 *   UI006  custom CSS variable        UI012  locally implemented visual primitive
 *
 *   ASSET001 raw image rendering      ASSET007 invalid or unsafe SVG
 *   ASSET002 unapproved dimensions    ASSET008 unapproved SVG or icon import
 *   ASSET003 aspect ratio mismatch    ASSET009 unapproved font
 *   ASSET004 missing from manifest    ASSET010 arbitrary object-fit/position
 *   ASSET005 invalid image format     ASSET011 responsive asset contract violation
 *   ASSET006 file-size limit          ASSET012 missing intrinsic dimensions
 *        ASSET013 insufficient source  ASSET014 asset presentation bypass
 *
 * Analysis is AST-based for TypeScript/JavaScript/JSX (the Babel parser with
 * the TypeScript and JSX plugins), stylesheet parsing for the permitted CSS
 * artifacts (there are none: UI001 demands it), and manifest/lockfile analysis
 * for dependencies. It does not rely on regular expressions over rendered output.
 *
 * The reference data is the published package's own: `dist/styles.css` defines
 * the emitted class set (UI004), `dist/assets/manifest.json` defines the
 * variants and budgets (ASSET002 to ASSET006), and `dist/assets/index.js`
 * defines the resolution rule (ASSET013). A renamed token or a changed variant
 * is therefore a finding here rather than a silent disagreement.
 *
 * Data lives in `scripts/ui-check.config.json` (roots, allowed imports,
 * exceptions) and `asset-registry.json` (application-owned assets). An exception
 * suppresses exactly one file and one code, with an owner and a review date.
 * There is no unrestricted suppression.
 *
 * Run: pnpm ui:check (options: --root <dir>, --config <path>)
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { parse } from '@babel/parser';

const NAME = 'ui-check';
const SCRIPT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const argValue = (name) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};

const ROOT = path.resolve(argValue('--root') ?? SCRIPT_ROOT);
const CONFIG = path.resolve(argValue('--config') ?? path.join(ROOT, 'scripts', 'ui-check.config.json'));

function readJson(file) {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf8'));
}

const config = readJson(CONFIG);
if (!config) {
  console.error(`\n${NAME}: ${CONFIG} does not exist, so there is no configuration to run against.`);
  process.exit(2);
}
const roots = config.roots ?? ['app', 'components', 'lib'];
const allowedPrefixes = config.allowedImportPrefixes ?? [];
const exceptions = config.exceptions ?? [];

/* The published package, resolved through this repository's own install. Fixture
   runs point --root elsewhere, but the DS contracts always come from the one
   pinned package this gate verifies. */
const dsRequire = createRequire(path.join(SCRIPT_ROOT, 'package.json'));
const DS_ROOT = path.dirname(dsRequire.resolve('@nanisoft/prism-ui/package.json'));
const manifestPath = path.join(DS_ROOT, 'dist', 'assets', 'manifest.json');
const stylesPath = path.join(DS_ROOT, 'dist', 'styles.css');
const assetsModulePath = path.join(DS_ROOT, 'dist', 'assets', 'index.js');
for (const [label, file] of [['asset manifest', manifestPath], ['stylesheet', stylesPath], ['asset module', assetsModulePath]]) {
  if (!existsSync(file)) {
    console.error(`\n${NAME}: the ${label} at ${file} does not exist in the pinned package. Install @nanisoft/prism-ui first.`);
    process.exit(2);
  }
}
const manifest = readJson(manifestPath);
const VARIANT_RATIOS = new Map();
for (const [name, v] of Object.entries(manifest.variants ?? {})) {
  if (!v.aspectRatio) continue;
  const [a, b] = v.aspectRatio.split('/').map((n) => parseFloat(n));
  if (a > 0 && b > 0) VARIANT_RATIOS.set(name, a / b);
}
const FORMATS = new Set(['woff2', 'png', 'svg', 'ico', 'svg-component', 'webp', 'avif', 'mp4', 'webm']);
const registryPath = path.join(ROOT, config.assetRegistry ?? 'asset-registry.json');
const registry = readJson(registryPath);
const registryByPath = new Map();
for (const entry of registry?.assets ?? []) registryByPath.set(entry.path, entry);
const registeredComponentFiles = new Set(
  [...registryByPath.keys()].filter((p) => p.endsWith('.tsx') || p.endsWith('.ts')),
);

/* The emitted class set: every class the shipped sheet declares, unescaped. */
const emittedCss = readFileSync(stylesPath, 'utf8');
const EMITTED_CLASSES = new Set();
for (const m of emittedCss.matchAll(/\.((?:\\.|[a-zA-Z0-9_-])+)/g)) {
  EMITTED_CLASSES.add(m[1].replace(/\\(.)/g, '$1'));
}

/* Exceptions: data with an owner and a review date. An expired exception is
   reported as a finding, never silently kept. */
const EXCEPTIONS = new Map();
for (const e of exceptions) EXCEPTIONS.set(e.file, e);
const exceptionState = (file) => {
  const e = EXCEPTIONS.get(file);
  if (!e) return null;
  if (e.reviewBy && new Date() > new Date(e.reviewBy + 'T23:59:59Z')) return 'expired';
  return 'active';
};

const findings = [];
const suppressed = [];
function finding(code, file, line, message, guidance) {
  const state = exceptionState(file);
  if (state === 'active' && EXCEPTIONS.get(file).codes?.includes(code)) {
    if (!suppressed.includes(`${code} in ${file}`)) suppressed.push(`${code} in ${file}`);
    return;
  }
  if (state === 'expired' && EXCEPTIONS.get(file).codes?.includes(code)) {
    findings.push({ code, file, line: 1, message: `Expired exception: ${EXCEPTIONS.get(file).why}`, guidance: 'Re-review or remove the exception in ui-check.config.json.' });
  }
  findings.push({ code, file, line, message, guidance });
}

const STYLE_EXT = /\.(css|scss|sass|less|styl|stylus)$/i;
const TS_EXT = /\.(ts|tsx)$/;
const HEX = /^#(?:[0-9a-fA-F]{4}|[0-9a-fA-F]{3}|[0-9a-fA-F]{8}|[0-9a-fA-F]{6})$/;
const COLOUR_FN = /\b(?:rgb|rgba|hsl|hsla|oklch|lab|lch|color-mix)\s*\(/i;
const APPEARANCE_CLASS = /^(aspect|object|size-)/;
const RAW_PRIMITIVES = new Set(['button', 'input', 'select', 'textarea', 'table', 'dialog']);
const DS_PRIMITIVE_NAMES = /^(Button|Input|Select|Card|Dialog|Table|Badge|Alert|Avatar|Checkbox|Radio|Switch|Tabs|Tooltip|Accordion|Popover|Menu|Skeleton|Progress|Toast|DataTable|Notification|Loading)/;
const STYLING_DEP_EXACT = new Set([
  'tailwindcss', 'postcss', 'bootstrap', 'styled-components', 'jss',
  'sass', 'sass-embedded', 'less', 'stylus', 'node-sass', '@emotion/react', '@emotion/styled',
]);

function rel(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const sourceFiles = [];
for (const root of roots) {
  for (const file of walk(path.join(ROOT, root))) {
    if (TS_EXT.test(file)) sourceFiles.push(file);
  }
}
const styleFiles = [];
for (const root of roots) {
  for (const file of walk(path.join(ROOT, root))) {
    if (STYLE_EXT.test(file)) styleFiles.push(file);
  }
}

/* ---------- UI001: custom stylesheet ---------- */
for (const file of styleFiles) {
  finding('UI001', rel(file), 1, 'Custom stylesheet detected.', 'The only permitted styling entry point is @nanisoft/prism-ui/styles.css. Delete the sheet and compose with design system components and their layout utilities.');
}

/* ---------- UI007: unapproved styling dependencies ---------- */
const pkgPath = path.join(ROOT, config.packageJson ?? 'package.json');
const pkg = readJson(pkgPath);
const deps = Object.assign({}, pkg?.dependencies ?? {}, pkg?.devDependencies ?? {});
const pkgText = existsSync(pkgPath) ? readFileSync(pkgPath, 'utf8') : '';
function pkgLine(name) {
  const at = pkgText.indexOf(`"${name}"`);
  return at < 0 ? 1 : pkgText.slice(0, at).split('\n').length;
}
for (const name of Object.keys(deps)) {
  if (STYLING_DEP_EXACT.has(name) || name.startsWith('@emotion/') || /tailwind|bootstrap/i.test(name)) {
    finding('UI007', rel(pkgPath), pkgLine(name), `Unapproved styling dependency detected: ${name}.`, 'The design system owns styling. Remove the dependency and compose with @nanisoft/prism-ui.');
  }
}

/* Assets module for the resolution rule (ASSET013). */
let validateRasterSize = () => null;
try {
  const assetsModule = await import(pathToFileURL(assetsModulePath).href);
  if (typeof assetsModule.validateRasterSize === 'function') validateRasterSize = assetsModule.validateRasterSize;
} catch {
  /* The gate still reports the geometry it can check without the module. */
}

/* ---------- Asset file scans (ASSET006, ASSET007, ASSET009 file half) ---------- */
function scanSvgText(text) {
  const unsafe = [];
  if (/<script/i.test(text)) unsafe.push('a <script> element');
  if (/<foreignObject/i.test(text)) unsafe.push('a <foreignObject> element');
  if (/<image[\s>]/i.test(text)) unsafe.push('an <image> element');
  if (/\bon[a-z]+\s*=/i.test(text)) unsafe.push('an inline event attribute');
  if (/javascript:/i.test(text)) unsafe.push('a javascript: URI');
  return unsafe;
}
for (const root of [...roots, 'public']) {
  for (const file of walk(path.join(ROOT, root))) {
    if (file.endsWith('.svg')) {
      const text = readFileSync(file, 'utf8');
      for (const what of scanSvgText(text)) {
        finding('ASSET007', rel(file), 1, `Invalid or unsafe SVG: ${what} detected.`, 'A registered SVG must be sanitized: no script, no foreignObject, no inline handlers, no javascript: URI. Fix the drawing or remove the asset.');
      }
      const entry = registryByPath.get(rel(file));
      if (entry && statSync(file).size > (entry.budgetKiB ?? Infinity) * 1024) {
        finding('ASSET006', rel(file), 1, `File-size limit exceeded: ${rel(file)} is over ${entry.budgetKiB} KiB.`, 'Compress the asset or record a bounded exception on its registry entry. Quality never bends to meet a number without being said out loud.');
      }
    }
    if (/\.(woff2?|ttf|otf)$/i.test(file)) {
      finding('ASSET009', rel(file), 1, 'Unapproved font detected.', 'The typeface is the design system\'s. Do not ship a font file; request a face from the design system.');
    }
  }
}

/* ---------- AST checks ---------- */
function localFileExists(src) {
  if (!src || /^https?:|^data:|^blob:/.test(src)) return null;
  const cleaned = src.split(/[?#]/)[0];
  const candidates = [
    path.join(ROOT, 'public', cleaned.replace(/^\//, '')),
    path.join(ROOT, cleaned.replace(/^\//, '')),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}
function lineOf(node) {
  return node?.loc?.start?.line ?? 1;
}
function jsxName(node) {
  if (!node) return '';
  if (node.type === 'JSXIdentifier') return node.name;
  if (node.type === 'JSXMemberExpression') return `${jsxName(node.object)}.${node.property.name}`;
  return '';
}
/* Every string literal inside an expression (class names in branches included). */
function stringsIn(expression, out = []) {
  if (!expression) return out;
  if (expression.type === 'StringLiteral') out.push(expression.value);
  else if (expression.type === 'TemplateLiteral') {
    for (const q of expression.quasis) out.push(q.value.cooked ?? q.value.raw);
  } else if (expression.type === 'JSXExpressionContainer') {
    stringsIn(expression.expression, out);
  } else if (expression.type === 'ConditionalExpression') {
    stringsIn(expression.consequent, out);
    stringsIn(expression.alternate, out);
  } else if (expression.type === 'LogicalExpression') {
    stringsIn(expression.right, out);
  }
  return out;
}
function propValue(attr) {
  const v = attr?.value;
  if (!v) return null;
  if (v.type === 'StringLiteral') return v.value;
  if (v.type === 'JSXExpressionContainer') {
    const e = v.expression;
    if (e.type === 'StringLiteral') return e.value;
    if (e.type === 'NumericLiteral') return e.value;
  }
  return null;
}

for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8');
  const display = rel(file);
  let ast;
  try {
    ast = parse(text, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: true,
      ranges: false,
    });
  } catch {
    console.error(`\n${NAME}: cannot parse ${display}. A gate must not scan what it cannot read.`);
    process.exit(2);
  }

  /* §13 bypass scan: suppression comments, on the text itself. */
  const bypassAt = text.search(/eslint-disable|@ts-ignore|@ts-nocheck/);
  if (bypassAt >= 0) {
    const line = text.slice(0, bypassAt).split('\n').length;
    finding('UI008', display, line, 'Enforcement bypass detected: a lint or TypeScript suppression comment.', 'Exceptions require explicit approval with an owner and a review date in ui-check.config.json. Do not suppress the gate.');
  }

  function visit(node) {
    if (!node || typeof node !== 'object') return;
    const type = node.type;

    /* UI005: approved imports. UI008: private DS paths. UI009: fonts. */
    if (type === 'ImportDeclaration') {
      const spec = node.source.value;
      if (spec.includes('/dist/')) {
        finding('UI008', display, lineOf(node), 'Private design system implementation path imported.', 'Import from the published package API (@nanisoft/prism-ui/...). Never reach into dist/.');
      } else if (!spec.startsWith('@nanisoft/prism-ui') && !spec.startsWith('@/') && !spec.startsWith('./') && !spec.startsWith('../') && !spec.startsWith('node:')) {
        const allowed = allowedPrefixes.some((p) => spec === p.replace(/\/$/, '') || spec.startsWith(p));
        if (!allowed) {
          finding('UI005', display, lineOf(node), `Unapproved UI component imports detected: ${spec}.`, 'All visual components must be imported from the approved @nanisoft/prism-ui API. Remove the competing library.');
        }
      }
      if (/next\/font|fonts\.googleapis/.test(spec) || /\.woff2?$/.test(spec) || spec.endsWith('.ttf') || spec.endsWith('.otf')) {
        finding('UI009', display, lineOf(node), 'Unapproved font imports detected.', 'The typeface is the design system\'s: @nanisoft/prism-ui/styles.css ships it. Do not import a font.');
      }
      if (spec.endsWith('.svg')) {
        finding('ASSET008', display, lineOf(node), 'Unapproved SVG or icon import detected.', 'Use DSIcon for icons, DSLogo for logos and DSIllustration for illustrations. An SVG asset must be registered.');
      }
    }

    /* UI003 / UI006 / UI011 (strings). */
    if (type === 'StringLiteral') {
      const t = node.value;
      if (HEX.test(t) || COLOUR_FN.test(t)) {
        finding('UI003', display, lineOf(node), `Hardcoded colour detected in ${path.basename(file)}:${lineOf(node)}.`, 'Use an approved semantic token or request a new token from the design system team.');
      }
      if (/var\(--/.test(t) || /^--[\w-]+$/.test(t)) {
        finding('UI006', display, lineOf(node), 'Custom CSS variable detected.', 'Tokens come from the approved theme. Read them through the design system, never via a custom property.');
      }
      if (/@media/.test(t)) {
        finding('UI011', display, lineOf(node), 'Unapproved responsive styling detected.', 'Responsive behaviour comes from the design system. Request missing layout capabilities centrally.');
      }
    }
    /* UI006: CSSProperties cast. */
    if (type === 'TSAsExpression' && node.typeAnnotation?.typeName?.name === 'CSSProperties') {
      finding('UI006', display, lineOf(node), 'Custom CSS variable detected in a CSSProperties cast.', 'An inline style must be removed, not cast. Compose with approved components and utilities.');
    }
    /* UI010: direct DOM styling. */
    if (type === 'MemberExpression' && node.property?.name === 'style' && !node.computed) {
      let target = node.object;
      while (target?.type === 'TSAsExpression' || target?.type === 'TSNonNullExpression') target = target.expression;
      if (target?.type === 'CallExpression' && target.callee?.type === 'MemberExpression') {
        const callee = target.callee.property?.name;
        if (['getElementById', 'querySelector', 'querySelectorAll', 'getElementsByTagName'].includes(callee)) {
          finding('UI010', display, lineOf(node), 'Direct DOM styling detected.', 'The design system owns presentation. Remove the style write.');
        }
      }
    }
    if (type === 'CallExpression' && node.callee?.type === 'MemberExpression' && node.callee.property?.name === 'setAttribute') {
      const first = node.arguments?.[0];
      if (first?.type === 'StringLiteral' && first.value === 'style') {
        finding('UI010', display, lineOf(node), 'Direct DOM styling detected.', 'The design system owns presentation. Remove the style write.');
      }
    }
    /* UI011: responsive hooks / measurements. */
    if (type === 'FunctionDeclaration' && node.id && /^(useMedia|useBreakpoint|useWindowSize)/.test(node.id.name)) {
      finding('UI011', display, lineOf(node), 'Unapproved responsive styling detected.', 'Responsive behaviour comes from the design system. Request missing layout capabilities centrally.');
    }
    if (type === 'MemberExpression' && node.property?.name === 'innerWidth' && !node.computed) {
      finding('UI011', display, lineOf(node), 'Unapproved responsive styling detected.', 'Responsive behaviour comes from the design system. Request missing layout capabilities centrally.');
    }
    /* UI012: locally implemented visual primitives, by name. */
    if (type === 'FunctionDeclaration' && node.id && DS_PRIMITIVE_NAMES.test(node.id.name)) {
      finding('UI012', display, lineOf(node), `Locally implemented visual primitive detected: ${node.id.name}.`, 'Replace locally implemented visual primitives with their design system equivalents.');
    }
    /* UI012: locally assigned visual primitives, by name. */
    if (type === 'VariableDeclarator' && node.id?.type === 'Identifier' && DS_PRIMITIVE_NAMES.test(node.id.name)) {
      finding('UI012', display, lineOf(node), `Locally implemented visual primitive detected: ${node.id.name}.`, 'Replace locally implemented visual primitives with their design system equivalents.');
    }

    /* JSX elements. */
    if (type === 'JSXOpeningElement' || type === 'JSXSelfClosingElement') {
      const tag = jsxName(node.name);
      for (const attr of node.attributes) {
        if (attr.type !== 'JSXAttribute') continue;
        const aname = attr.name.name;
        if (aname === 'style') {
          finding('UI002', display, lineOf(node), 'Inline styles detected.', 'Use an approved component or layout utility; a style prop is a styling decision the design system owns.');
        }
        if (aname === 'objectFit' || aname === 'objectPosition') {
          finding('ASSET010', display, lineOf(attr), 'Arbitrary object-fit/object-position is prohibited.', 'Use DSImage with an approved variant; the design system owns presentation.');
        }
        if (aname === 'className') {
          const texts = stringsIn(attr.value?.type === 'JSXExpressionContainer' ? attr.value.expression : attr.value);
          for (const text of texts) {
            for (const token of (text ?? '').split(/\s+/).filter(Boolean)) {
              if (token.includes('[')) {
                finding('UI004', display, lineOf(attr), `Arbitrary styling classes detected: ${token}.`, 'A utility exists in the emitted sheet only if a Prism component uses it, and arbitrary values are not emitted at all. Compose with approved components.');
              } else if (!EMITTED_CLASSES.has(token)) {
                finding('UI004', display, lineOf(attr), `Arbitrary styling classes detected: ${token}.`, 'That class is not emitted by @nanisoft/prism-ui/styles.css, so it is a name rather than a style. Compose with approved components.');
              }
            }
          }
          if (/^(DSImage|DSLogo|DSIllustration|DSAvatar|DSVideo|DSMediaCard)$/.test(tag)) {
            for (const text of texts) {
              for (const token of (text ?? '').split(/\s+/).filter(Boolean)) {
                if (APPEARANCE_CLASS.test(token)) {
                  finding('ASSET014', display, lineOf(attr), `Asset presentation bypass detected: ${token}.`, 'The design system owns presentation. Choose an approved variant; do not size the frame with a class.');
                }
              }
            }
          }
        }
      }
      if (tag === 'img') {
        finding('ASSET001', display, lineOf(node), 'Raw image rendering detected.', 'Use DSImage with an approved variant. Raw <img> bypasses the asset contract.');
      }
      if (tag === 'svg' && !registeredComponentFiles.has(display)) {
        finding('ASSET008', display, lineOf(node), 'Unapproved SVG or icon import detected.', 'All UI icons must come from DSIcon. A complex site SVG must be a registered svg-component asset with a sanitization pass.');
      }
      if (RAW_PRIMITIVES.has(tag)) {
        finding('UI012', display, lineOf(node), 'Locally implemented visual primitives detected.', 'Replace locally implemented visual primitives with their design system equivalents (Button, Input, Select, Dialog, Table...).');
      }
      /* DS asset components: the presentation contract. A spread subsumes the
         props this gate cannot see, so the mapped checks skip it. */
      if (/^(DSImage|DSLogo|DSIllustration|DSAvatar|DSVideo|DSMediaCard)$/.test(tag)) {
        const spread = node.attributes.some((a) => a.type === 'JSXSpreadAttribute');
        const props = new Map();
        for (const attr of node.attributes) {
          if (attr.type !== 'JSXAttribute') continue;
          const name = attr.name.name;
          const raw = propValue(attr);
          const value = typeof raw === 'number' ? String(raw) : raw;
          const num = typeof raw === 'number' ? raw : value === null ? null : Number(value);
          props.set(name, { value, num, node: attr });
          if (name === 'objectFit' || name === 'objectPosition') {
            finding('ASSET010', display, lineOf(attr), 'Arbitrary object-fit/object-position is prohibited.', 'Use DSImage with an approved variant; the design system owns presentation.');
          }
        }
        const variant = props.get('variant')?.value ?? (tag === 'DSVideo' ? 'hero' : tag === 'DSLogo' ? 'logo' : tag === 'DSIllustration' ? 'illustration' : tag === 'DSAvatar' ? 'avatar' : 'card');
        const ratio = VARIANT_RATIOS.get(variant);
        const intrinsicW = props.get('width')?.num;
        const intrinsicH = props.get('height')?.num;
        if (!spread && tag === 'DSImage') {
          if (intrinsicW == null || intrinsicH == null || Number.isNaN(intrinsicW) || Number.isNaN(intrinsicH)) {
            finding('ASSET012', display, lineOf(node), 'Missing intrinsic dimensions.', 'Pass width and height so the frame is reserved and the resolution check can run. The design system owns presentation; the application supplies content.');
          } else if (intrinsicW <= 0 || intrinsicH <= 0) {
            finding('ASSET002', display, lineOf(node), `Unapproved image dimensions: ${intrinsicW}x${intrinsicH} at variant ${variant}.`, 'A source must have positive width and height. A high-resolution source is not rejected for being larger than the rendered size; an impossible one is refused.');
          } else {
            if (!(variant in (manifest.variants ?? {}))) {
              finding('ASSET003', display, lineOf(node), `Unknown presentation variant: ${variant}.`, 'A DSImage variant must be one of the eleven presentations the design system authored. There is no raw ratio prop.');
            } else if (ratio !== undefined && Math.abs(intrinsicW / intrinsicH - ratio) > 0.01) {
              finding('ASSET003', display, lineOf(node), `Aspect ratio mismatch: ${intrinsicW}x${intrinsicH} at variant ${variant}.`, `The ${variant} presentation holds ${manifest.variants[variant]?.aspectRatio}. Supply a source at that ratio.`);
            }
            /* The envelope is not a ceiling on the source: a high-resolution source is
               never rejected for being larger than the rendered size. The only
               dimension law is the target minimum (ASSET013) and the ratio. */
            const reason = validateRasterSize(intrinsicW, intrinsicH, variant);
            if (reason) {
              finding('ASSET013', display, lineOf(node), `Insufficient source resolution: ${reason}`, 'Supply a higher-resolution source; the rendered size does not excuse a soft source.');
            }
          }
          const srcSet = props.get('srcSet');
          const sizes = props.get('sizes');
          if ((srcSet && !sizes) || (!srcSet && sizes)) {
            finding('ASSET011', display, lineOf(node), 'Responsive asset contract violation: srcSet and sizes must pair.', 'Pass both or neither, matching the variant sizes expression.');
          }
          const src = props.get('src')?.value;
          if (src) {
            if (!/^https?:|^data:|^blob:/.test(src)) {
              const ext = src.split(/[?#]/)[0].split('.').pop().toLowerCase();
              if (!FORMATS.has(ext)) {
                finding('ASSET005', display, lineOf(node), `Invalid image format: ${src}.`, 'Approved formats are those in the design system manifest (webp, avif, png, svg, mp4, webm). Convert the asset.');
              }
            }
            if (!/^https?:|^data:|^blob:/.test(src) && src.startsWith('/')) {
              const file = localFileExists(src);
              const entry = file ? registryByPath.get(rel(file)) : undefined;
              if (!file || !entry) {
                finding('ASSET004', display, lineOf(node), `Asset missing from manifest: ${src}.`, 'Register the asset in asset-registry.json with metadata, or consume it from the design system package. Do not duplicate centrally owned assets.');
              } else if (statSync(file).size > (entry.budgetKiB ?? Infinity) * 1024) {
                finding('ASSET006', display, lineOf(node), `File-size limit exceeded: ${src} is over ${entry.budgetKiB} KiB.`, 'Compress the asset or record a bounded exception on its registry entry.');
              }
            }
          }
        }
      }
    }

    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'start' || key === 'end' || key === 'range') continue;
      const value = node[key];
      if (Array.isArray(value)) {
        for (const child of value) visit(child);
      } else if (value && typeof value === 'object' && typeof value.type === 'string') {
        visit(value);
      }
    }
  }
  visit(ast);
}

/* ---------- Stylesheet parsing for the permitted artifacts ---------- */
for (const file of styleFiles) {
  const text = readFileSync(file, 'utf8');
  const display = rel(file);
  if (/@media/.test(text)) {
    finding('UI011', display, 1, 'Unapproved responsive styling detected: @media in a site stylesheet.', 'Responsive behaviour comes from the design system. Request missing layout capabilities centrally.');
  }
  if (/@font-face/.test(text)) {
    finding('UI009', display, 1, 'Unapproved font imports detected: @font-face in a site stylesheet.', 'The typeface is the design system\'s. Do not declare a font.');
    finding('ASSET009', display, 1, 'Unapproved font detected.', 'The typeface is the design system\'s. Do not declare a font.');
  }
  if (/object-fit\s*:|object-position\s*:/.test(text)) {
    finding('ASSET010', display, 1, 'Arbitrary object-fit or object-position detected.', 'Use DSImage with an approved variant; the design system owns presentation.');
  }
  for (const m of text.matchAll(/--[\w-]+\s*:/g)) {
    const line = text.slice(0, m.index).split('\n').length;
    finding('UI006', display, line, 'Custom CSS variable detected.', 'Tokens come from the approved theme. Read them through the design system, never via a custom property.');
  }
}

/* ---------- Report ---------- */
const sorted = [...findings].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.code.localeCompare(b.code));
console.log(`\n${NAME}: ${sorted.length} finding(s) across ${sourceFiles.length} source file(s) and ${styleFiles.length} stylesheet(s), ${EMITTED_CLASSES.size} emitted classes, ${registry?.assets?.length ?? 0} registered asset(s)`);
for (const f of sorted) {
  console.log(`  ${f.code}: ${f.message} (${f.file}:${f.line})`);
  console.log(`      ${f.guidance}`);
}
if (suppressed.length > 0) {
  console.log(`\n${NAME}: ${suppressed.length} documented exception(s) suppressed: ${suppressed.join('; ')}`);
}
if (sorted.length > 0) {
  console.error(`\n${NAME}: the following corrections are required before merge. Every finding names its fix.`);
  process.exit(1);
}
console.log(`\n${NAME}: pass. No custom UI, no custom styling, and every asset follows the central contract.`);
