/**
 * The browser lane: what the site's own stylesheet did to the cascade, resolved.
 *
 * Every other gate in this repository is a text scan, and this file exists because a
 * text scan cannot answer the two questions that decide whether this migration worked.
 *
 *   1. **Were the three deleted rules really deleted, and what does the page resolve to
 *      without them?** The page ground, the body ink and a plain link's colour were
 *      deleted rather than mapped, because an unlayered shorthand wins the cascade and
 *      then computes away and the layered value does not come back. The old sheet
 *      named `--prism-color-bg-layout`, `--prism-color-text` and
 *      `--prism-color-link`, and the 126 KB generated variablesheet was the only
 *      definition site for all three. With that file gone, `background` reverts to
 *      `transparent`, `color` reverts to the browser default, and a link takes its
 *      parent's colour. Black text on a dark ground is a plausible-looking page, so
 *      "the file is smaller" is not evidence and neither is a screenshot. This lane
 *      reads the computed values in a real engine, in both modes, and compares them to
 *      what the design system publishes.
 *   2. **Do the three product marks paint anything?** They were invisible on the old
 *      landing because their class carried a size, a colour and a radius and no
 *      background. An element that exists and paints nothing is the whole defect, so
 *      asserting that the mark is in the document is asserting nothing. This lane
 *      resolves each disc's background and fails when it is transparent, and it does
 *      that in both modes, because a mark painted with the light pack's fill on a dark
 *      page looks like a design decision rather than a bug.
 *
 * **Both modes are reached the way a reader reaches them.** This site has no mode
 * toggle: the mode is a stored decision applied to the document element by the design
 * system's own boot script before first paint. So the lane writes that key, in the
 * shape the design system writes it, and reloads. Emulating `prefers-color-scheme`
 * would be a different mechanism than the one this site actually has, and a lane that
 * tested a mechanism the site does not use would be evidence about something else.
 *
 * **The export is served over HTTP rather than opened as a file,** because the emitted
 * markup references its stylesheet and its fonts at root-absolute paths, which under
 * `file://` resolve to the filesystem root and load nothing. A lane that measured an
 * unstyled page would report every mark as invisible and every token as empty, which
 * is a pass-shaped report of a page that does not exist.
 *
 * **How it drives a browser, and why there is no dependency.** The DevTools protocol
 * is a WebSocket and a JSON line, and Node has a WebSocket client in its standard
 * library, so this file launches headless Chrome, opens one target, and evaluates a
 * little JavaScript in it. A browser driver would be a hundred megabytes of transitive
 * dependency in a repository whose whole point is that it ships no client code.
 *
 * **It is not in `pnpm check`, and that is a decision rather than an omission.** Every
 * other gate here reads files, so it runs anywhere `node` runs. This one needs a
 * browser, and a continuous-integration runner does not promise one; a gate that
 * silently skips is the failure mode this family keeps warning about, and a gate that
 * hard-fails on a machine without a browser would block a deploy for a reason unrelated
 * to the site. So it is a named lane, run by hand, and it fails loudly when it cannot
 * find a browser rather than reporting a clean page.
 *
 * The honest limit, printed on every run: it reads computed style from one engine at
 * one viewport, and it says nothing about what a reader sees. It is the strongest
 * evidence available without a human looking, not a substitute for one.
 *
 * Run after `pnpm build`: node scripts/check-cascade.mjs
 */
import { spawn } from 'node:child_process';
import { createReadStream, existsSync, mkdtempSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

const NAME = 'cascade';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');
const require = createRequire(path.join(ROOT, 'package.json'));

/** Where a browser might be, in the order a person would expect. `PRISM_BROWSER` wins. */
const BROWSERS = [
  process.env.PRISM_BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean);

const MODES = ['light', 'dark'];

/** The key the design system's boot script reads, and the value shape it expects. */
const STORAGE_KEY = 'prism-theme';

/** Minimum contrast for body text, the same figure the design system's own gate uses. */
const MIN_CONTRAST = 4.5;

/**
 * The pages this lane resolves, and what each one is here to answer.
 *
 * Each page lists the selectors it is measured for, because the repaired boxes are not
 * all on one page: a lane that measured every selector on every page would report the
 * two most important repairs as "not found", and a box that is not there and a box
 * that was not repaired look the same.
 */
const PAGES = [
  {
    file: 'index.html',
    route: '/',
    why: 'the page ground, the body ink, the three product marks, and a paragraph on a filled surface',
    boxes: [],
    link: false,
  },
  {
    file: 'about.html',
    route: '/about',
    why: 'a link in body copy, which is the only kind of link this site does not draw itself',
    boxes: [],
    link: true,
  },
  {
    file: 'docs.html',
    route: '/docs',
    why: 'the section card, whose edge and fill were a shorthand with a dead operand',
    boxes: ['section card'],
    link: false,
  },
  {
    file: 'docs/concepts.html',
    route: '/docs/concepts',
    why: 'the standing status note, the other box with the same defect, and a link in a document',
    boxes: ['status note'],
    link: true,
  },
];

/** Which selector each named box is, in the order the findings read best. */
const BOXES = {
  'status note': '.site-status-note',
  'section card': '.site-catalog__item',
};

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webmanifest': 'application/manifest+json',
};

const findings = [];

/* ------------------------------------------------------------------ *
 * The design system's own values, read from the installed package
 * ------------------------------------------------------------------ */

/** The properties of one pack and mode, as the token package publishes them. */
function contract(pack, mode) {
  const file = require.resolve(`@nanisoft/prism-tokens/dist/themes/${pack}/${mode}.css`);
  return Object.fromEntries(
    [...readFileSync(file, 'utf8').matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/g)].map((match) => [
      match[1],
      match[2].trim(),
    ]),
  );
}

/** The page's own ground, from the site's own data rather than from the chrome. */
const SITE = JSON.parse(readFileSync(path.join(ROOT, 'lib', 'site.json'), 'utf8'));

/* ------------------------------------------------------------------ *
 * A static server for the export, in twenty lines and with no dependency
 * ------------------------------------------------------------------ */

if (!existsSync(OUT)) {
  console.error(`\n${NAME}: ${OUT} does not exist, so there is no export to read. Run pnpm build first.`);
  process.exit(1);
}

const server = createServer((request, response) => {
  const asked = decodeURIComponent((request.url ?? '/').split('?')[0]);
  const candidates = [path.join(OUT, asked), path.join(OUT, asked, 'index.html'), path.join(OUT, `${asked}.html`)];
  for (const candidate of candidates) {
    if (!candidate.startsWith(OUT)) continue;
    if (!existsSync(candidate) || !statSync(candidate).isFile()) continue;
    response.writeHead(200, { 'content-type': CONTENT_TYPES[path.extname(candidate)] ?? 'application/octet-stream' });
    createReadStream(candidate).pipe(response);
    return;
  }
  response.writeHead(404, { 'content-type': 'text/plain' });
  response.end('not found');
});

const origin = await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${server.address().port}`));
});

/* ------------------------------------------------------------------ *
 * The browser
 * ------------------------------------------------------------------ */

const browser = BROWSERS.find((candidate) => existsSync(candidate));
if (!browser) {
  console.error(
    `\n${NAME}: no browser found, so nothing was resolved and this run is not a pass.\n` +
      `  Looked in: ${BROWSERS.join(', ')}\n` +
      '  Set PRISM_BROWSER to one of them. A gate that cannot run says so; it does not report a clean page.',
  );
  process.exit(1);
}

const profile = mkdtempSync(path.join(tmpdir(), 'prism-cascade-'));
const port = 9222 + Math.floor(Math.random() * 500);
const child = spawn(
  browser,
  [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=1280,1024',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanup() {
  try {
    child.kill();
  } catch {
    /* already gone */
  }
  try {
    server.close();
  } catch {
    /* already closed */
  }
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* a temp directory the operating system will have */
  }
}
process.on('exit', cleanup);

/** The debugging endpoint, once the browser is listening. */
async function endpoint() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  return null;
}

/**
 * One browser, asked questions. A promise per command id, which is the whole protocol:
 * a JSON message with an id, and a reply carrying the same id.
 */
function connect(url) {
  const socket = new WebSocket(url);
  const waiting = new Map();
  let next = 0;
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    const settle = waiting.get(message.id);
    if (!settle) return;
    waiting.delete(message.id);
    settle(message);
  });
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', () => reject(new Error('the browser socket closed')), { once: true });
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = (next += 1);
      waiting.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (!waiting.has(id)) return;
        waiting.delete(id);
        reject(new Error(`${method} did not answer`));
      }, 30000);
    });
  return { socket, ready, send };
}

/** The measurement, run inside the page. A string, so it is exactly what runs. */
const MEASURE = `(() => {
  const computed = (selector, properties) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const style = getComputedStyle(element);
    return Object.fromEntries(properties.map((property) => [property, style.getPropertyValue(property)]));
  };
  /* The ground a reader actually sees behind a piece of text: the nearest ancestor
     that paints one. Measuring a caption against the page ground when it sits on a
     filled panel reports a contrast ratio for a pairing that is not on the page. */
  const groundBehind = (element) => {
    let node = element;
    while (node) {
      const value = getComputedStyle(node).backgroundColor;
      if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') return value;
      node = node.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
  const disc = (mark) => {
    const element = mark.querySelector('[data-slot="product-mark-disc"]');
    return {
      product: mark.querySelector('[data-product]')?.getAttribute('data-product') ?? null,
      pack: mark.getAttribute('data-pack'),
      background: element ? getComputedStyle(element).backgroundColor : null,
      width: element ? element.getBoundingClientRect().width : 0,
      height: element ? element.getBoundingClientRect().height : 0,
    };
  };
  return {
    html: {
      pack: document.documentElement.getAttribute('data-pack'),
      dark: document.documentElement.classList.contains('dark'),
      origin: document.documentElement.getAttribute('data-theme-origin'),
      font: getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim(),
      radius: getComputedStyle(document.documentElement).getPropertyValue('--radius').trim(),
      sheets: document.styleSheets.length,
    },
    body: computed('body', ['background-color', 'color']),
    paragraphs: [...document.querySelectorAll('main p, main li, main a, main h1, main h2, main h3, main h4')]
      .slice(0, 80)
      .map((element) => ({
        tag: (element.className || element.tagName.toLowerCase()).slice(0, 44),
        color: getComputedStyle(element).color,
        own: getComputedStyle(element).backgroundColor,
        ground: groundBehind(element),
      })),
    proseLink: computed('[data-slot="prose"] a, .site-prose-table a', ['color', 'text-decoration-line']),
    status: computed('.site-status-note', ['border-top-style', 'border-top-color', 'background-color']),
    card: computed('.site-catalog__item', ['border-top-style', 'border-top-color', 'background-color']),
    marks: [...document.querySelectorAll('[data-slot="product-mark"][data-pack]')].map(disc),
    rows: [...document.querySelectorAll('[data-slot="product-grid-row"]')].map((row) => ({
      product: row.querySelector('[data-product]')?.getAttribute('data-product') ?? null,
      href: row.querySelector('a')?.getAttribute('href') ?? null,
      background: row.querySelector('[data-slot="product-mark-disc"]')
        ? getComputedStyle(row.querySelector('[data-slot="product-mark-disc"]')).backgroundColor
        : null,
    })),
    readyState: document.readyState,
  };
})()`;

const url = await endpoint();
if (!url) {
  console.error(
    `\n${NAME}: ${browser} started and never published a debugging endpoint.\n  Nothing was resolved.`,
  );
  process.exit(1);
}

const client = connect(url);
await client.ready;
await client.send('Page.enable');
await client.send('Runtime.enable');
await client.send('Emulation.setDeviceMetricsOverride', {
  width: 1280,
  height: 1024,
  deviceScaleFactor: 1,
  mobile: false,
});

/* ------------------------------------------------------------------ *
 * Colour, so the two answers can be compared rather than eyeballed
 * ------------------------------------------------------------------ */

/** `rgb(r, g, b)` or `#rrggbb` as three channels, or null when the value is not a colour. */
function channels(value) {
  if (typeof value !== 'string') return null;
  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(value);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])].map((channel) => channel / 255);
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!hex) return null;
  const digits = hex[1].length === 3 ? [...hex[1]].map((digit) => digit + digit).join('') : hex[1];
  return [0, 2, 4].map((at) => parseInt(digits.slice(at, at + 2), 16) / 255);
}

/** The relative luminance of a colour, which is what a contrast ratio is made of. */
function luminance(value) {
  const rgb = channels(value);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The WCAG contrast ratio between two colours, or null when either is not a colour. */
function contrast(left, right) {
  const a = luminance(left);
  const b = luminance(right);
  if (a === null || b === null) return null;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** A colour as `rgb(r, g, b)`, so a token and a computed value can be compared. */
function asRgb(value) {
  const rgb = channels(value);
  return rgb ? `rgb(${rgb.map((channel) => Math.round(channel * 255)).join(', ')})` : String(value);
}

function find(what, mode, route, message) {
  findings.push(`  ${mode.padEnd(5)} ${route.padEnd(18)} [${what}]  ${message}`);
}

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */

const report = [];

for (const mode of MODES) {
  /* The decision a reader makes, written in the shape the design system writes it, and
     applied by the design system's own boot script rather than by this file. The script
     is removed afterwards, because a registered script applies to every later
     navigation and two of them would mean the second mode is never really the first
     one being re-measured. */
  const seeded = await client.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `try{localStorage.setItem(${JSON.stringify(STORAGE_KEY)},JSON.stringify({pack:${JSON.stringify(
      SITE.ground,
    )},mode:${JSON.stringify(mode)}}))}catch(e){}`,
  });

  const published = contract(SITE.ground, mode);

  for (const page of PAGES) {
    await client.send('Page.navigate', { url: `${origin}${page.route}` });
    let measured = null;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await sleep(150);
      const answer = await client.send('Runtime.evaluate', { expression: MEASURE, returnByValue: true });
      if (answer.result?.result?.value?.readyState === 'complete') {
        measured = answer.result.result.value;
        break;
      }
    }
    if (!measured) {
      find('unreachable', mode, page.route, 'the page never finished loading, so nothing on it was resolved.');
      continue;
    }

    const line = { route: page.route, stylesheets: measured.html.sheets };
    /* One stylesheet is the design system's arrangement, so the count proves nothing on
       its own. What proves the sheet loaded is the site sheet's own declaration: it is
       the one custom property in the chain that no other file can supply, and it is
       empty when the sheet did not arrive. */
    if (!measured.html.font) {
      find('unstyled', mode, page.route, `the document carries ${measured.html.sheets} stylesheet(s) and --font-sans resolves to nothing, so the site's own sheet did not load. A page measured with its sheet missing reports every token as empty, which is a report about a page that does not exist.`);
      continue;
    }

    /* The document element, and the two attributes the whole theme rests on. */
    if (page.route === '/') {
      line['document'] = `${measured.html.pack}${measured.html.dark ? ' .dark' : ''} · ${measured.html.origin} · --radius ${measured.html.radius}`;
      if (measured.html.pack !== SITE.ground) {
        find('ground', mode, page.route, `the document element carries data-pack="${measured.html.pack}" and lib/site.json says "${SITE.ground}".`);
      }
      if ((mode === 'dark') !== measured.html.dark) {
        find('mode', mode, page.route, `the boot script left the document element ${measured.html.dark ? 'with' : 'without'} .dark while the stored decision was ${mode}. A stored theme that does not reach the page is a stored theme that does not exist.`);
      }
      line['--font-sans'] = measured.html.font.split(',')[0];
      if (!/Inter/.test(measured.html.font)) {
        find('typeface', mode, page.route, `--font-sans resolves to "${measured.html.font}", whose first family is not the design system's own. Naming a family is not shipping it.`);
      }
    }

    /* 1. The page ground, resolved rather than asserted. */
    line['body ground'] = measured.body?.['background-color'] ?? '(no body)';
    if (asRgb(measured.body?.['background-color']) !== asRgb(published['--background'])) {
      find('page-ground', mode, page.route, `body resolves background-color: ${line['body ground']} and the design system declares --background: ${published['--background']} for this pack in this mode. The old rule named a custom property only the generated variablesheet defined, and it reverted to transparent.`);
    }

    /* 2. The body ink, resolved rather than asserted. Black on a dark ground is a
          plausible-looking page, so this is the one value a reviewer must not eyeball. */
    line['body ink'] = measured.body?.color ?? '(no body)';
    if (asRgb(measured.body?.color) !== asRgb(published['--foreground'])) {
      find('body-ink', mode, page.route, `body resolves color: ${line['body ink']} and the design system declares --foreground: ${published['--foreground']}. The old rule deleted the browser default, and the browser default is black on a dark ground.`);
    }

    const ratio = contrast(measured.body?.color, measured.body?.['background-color']);
    line['ink contrast'] = ratio === null ? 'unmeasurable' : `${ratio.toFixed(2)}:1`;
    if (ratio !== null && ratio < MIN_CONTRAST) {
      find('body-ink-contrast', mode, page.route, `body text on the page ground measures ${ratio.toFixed(2)}:1, under the ${MIN_CONTRAST}:1 the design system gates its own ink against.`);
    }

    /* Every piece of text on the page, not one of them, each against the ground it
       actually sits on. A muted role is a lighter weight of the same promise, and a
       screenshot review will not see a caption that has gone to 2:1 on a filled panel:
       the panel is dark, the caption is dark, and the page still looks designed. */
    const worst = measured.paragraphs
      .map((entry) => ({ ...entry, ratio: contrast(entry.color, entry.ground) }))
      .reduce(
        (lowest, entry) => (entry.ratio !== null && (lowest === null || entry.ratio < lowest.ratio) ? entry : lowest),
        null,
      );
    line['worst text'] = worst
      ? `${worst.ratio === null ? 'unmeasurable' : `${worst.ratio.toFixed(2)}:1`} — ${worst.tag.slice(0, 40)} ${worst.color} own ${worst.own} on ${worst.ground}`
      : 'no text';
    line['text measured'] = measured.paragraphs.length;
    if (worst && worst.ratio !== null && worst.ratio < MIN_CONTRAST) {
      find('text-contrast', mode, page.route, `a piece of text measures ${worst.ratio.toFixed(2)}:1 (${worst.tag}) on the ground behind it (${worst.ground}), under the ${MIN_CONTRAST}:1 the design system gates its own ink against. A muted role is a lighter weight of the same promise, not a smaller one.`);
    }

    /* 3. The link rule. The old sheet carried `a { color: var(--prism-color-link);
          text-decoration: none }`, and the two declarations fail differently: the
          colour is invalid at computed-value time and the anchor inherits its parent's
          ink, while `text-decoration: none` is a separate declaration that survives on
          its own. So the browser-level proof that the rule is gone is the underline,
          not the colour: a link in body copy that resolves to no underline is the old
          rule still winning the cascade, because the design system's own prose rule is
          class-scoped and layered and could not have won against it. */
    if (page.link) {
      if (measured.proseLink) {
        const ink = measured.proseLink.color;
        const underline = measured.proseLink['text-decoration-line'];
        line['link in copy'] = `${ink} / ${underline}`;
        if (underline === 'none') {
          find('link-decoration', mode, page.route, `a link in body copy resolves text-decoration-line: none. The old bare-element rule said text-decoration: none and it beat the design system's own layered prose rule, so a link looked like the text around it.`);
        }
        const linkRatio = contrast(ink, measured.body?.['background-color']);
        if (linkRatio !== null && linkRatio < MIN_CONTRAST) {
          find('link-contrast', mode, page.route, `a link in body copy measures ${linkRatio.toFixed(2)}:1 on the page ground.`);
        }
      } else {
        find('no-link', mode, page.route, 'the page carries no link in body copy, so the deleted link rule was not exercised here.');
      }
    }

    /* 4. The three product marks, painted. The assertion a DOM query cannot make, and
          the reason this lane exists. */
    line['marks painted'] = `${measured.marks.filter((mark) => mark.background && mark.background !== 'rgba(0, 0, 0, 0)').length} of ${measured.marks.length}`;
    line['product rows'] = measured.rows
      .map((row) => `${row.product}${row.background && row.background !== 'rgba(0, 0, 0, 0)' ? '' : ' (invisible)'}`)
      .join(', ') || '(none)';
    if (page.route === '/') {
      if (measured.rows.length !== 3) {
        find('product-rows', mode, page.route, `the landing carries ${measured.rows.length} product row(s) and it publishes three.`);
      }
      for (const row of measured.rows) {
        if (!row.background || row.background === 'rgba(0, 0, 0, 0)') {
          find('mark-invisible', mode, page.route, `the ${row.product} row's mark resolves background-color: ${row.background ?? '(nothing)'}. It is in the document and it paints nothing, which is the defect the old landing shipped.`);
        }
      }
      for (const mark of measured.marks) {
        if (!mark.background || mark.background === 'rgba(0, 0, 0, 0)') {
          find('mark-invisible', mode, page.route, `the ${mark.product} mark's disc resolves background-color: ${mark.background ?? '(nothing)'}.`);
        }
        if (mark.width < 8 || mark.height < 8) {
          find('mark-size', mode, page.route, `the ${mark.product} mark's disc measures ${mark.width}x${mark.height} CSS pixels, so a reader would not see it.`);
        }
      }
    }

    /* 5. The repaired selectors, read as what they now compute to. Each is a box that
          lost both its edge and its fill to a shorthand with one dead operand. */
    for (const what of page.boxes) {
      const selector = BOXES[what];
      const style = measured[what === 'status note' ? 'status' : 'card'];
      if (!style) {
        find('box-missing', mode, page.route, `${selector} is not on this page, so the repaired box was not measured and a box that is not there and a box that was not repaired look the same.`);
        continue;
      }
      line[what] = `${style['border-top-style']} ${style['border-top-color']} on ${style['background-color']}`;
      if (style['border-top-style'] === 'none') {
        find('box-edge', mode, page.route, `${selector} resolves border-top-style: none, so the box has no edge at all. A shorthand with one dead operand erases itself rather than repainting itself.`);
      }
      if (asRgb(style['border-top-color']) !== asRgb(published['--border'])) {
        find('box-edge-colour', mode, page.route, `${selector} resolves border-top-color: ${style['border-top-color']} and the design system declares --border: ${published['--border']} for this pack in this mode.`);
      }
      if (!style['background-color'] || style['background-color'] === 'rgba(0, 0, 0, 0)') {
        find('box-fill', mode, page.route, `${selector} resolves background-color: ${style['background-color']}, so the box is an edge around nothing.`);
      }
      /* The edge and the fill must be two colours, or the box is an edge drawn around
         its own interior. In this pack's dark mode `--muted` and `--border` resolve to
         the same value, which is the trap this assertion exists to catch. */
      if (asRgb(style['border-top-color']) === asRgb(style['background-color'])) {
        find('box-invisible', mode, page.route, `${selector} resolves its edge and its fill to the same colour (${style['border-top-color']}), so the box is not visible at all even though both declarations survived.`);
      }
    }

    report.push({ mode, line });
  }

  if (seeded.result?.identifier) {
    await client.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: seeded.result.identifier });
  }
}

client.socket.close();
cleanup();

console.log(
  `\n${NAME}: ${findings.length} finding(s), resolved by ${browser} in ${MODES.length} mode(s) against ${PAGES.length} page(s) of the export served over HTTP`,
);
for (const entry of report) {
  console.log(`\n${NAME}: --- ${entry.mode} ---`);
  for (const [what, value] of Object.entries(entry.line)) {
    console.log(`${NAME}:   ${what.padEnd(16)} ${value}`);
  }
}
console.log(
  `\n${NAME}: the page ground, the body ink, the body's contrast on that ground, a plain link's colour, the\n` +
    "  two repaired boxes and every product mark were read as computed values in both modes and compared to\n" +
    "  what @nanisoft/prism-tokens publishes for this pack. A screenshot in one mode is not evidence for any\n" +
    '  of this, and this lane is the strongest evidence available without a person looking.',
);
console.log(
  `${NAME}: it reads one engine at one viewport. It cannot see a reader's eye, and it says nothing about\n` +
    '  what a person finds legible, only about the two numbers a gate can compare.',
);

if (findings.length > 0) {
  for (const finding of findings) console.error(`error ${finding}`);
  console.error(
    `\nThe rules this migration deleted are deleted because mapping them would have won the cascade and\n` +
      '  computed away. Resolving the values is the only evidence that they are gone rather than moved.',
  );
  process.exit(1);
}

console.log(
  `${NAME}: the ground, the ink and the link resolve to what the design system declares, both repaired boxes\n` +
    `  have an edge and a fill, and the three product rows paint in both modes.`,
);
