# UI governance: zero custom styling

**Status:** migrated and enforced. `@nanisoft/prism-ui` 1.6.0 upgraded to 1.7.0
(pnpm). The only stylesheet is the design system's own. `pnpm ui:check` is the
gate; `pnpm check` runs it first; CI runs it as a mandatory step.

Applications own business logic, data and domain-specific content. The design
system owns all visual presentation. This file is the record of the migration
that made that true in this repository, phase by phase.

## Phase 1: inventory of violations (before any change)

| # | Violation | Location | Code |
|---|---|---|---|
| 1 | One application stylesheet (516 lines, site classes, media queries, token reads) | `app/globals.css` | UI001, UI004, UI006, UI011 |
| 2 | Inline style custom property for the ambient travel distance | `components/editorial-floor.tsx` | UI002 |
| 3 | Inline styles in the OpenGraph renderer (legitimate exception, see below) | `app/opengraph-image.tsx` | UI002 |
| 4 | Hardcoded colour literals in the OpenGraph renderer (exception) | `app/opengraph-image.tsx` | UI003 |
| 5 | Site-authored logo with site classes | `components/logo.tsx` | UI004, ASSET008 |
| 6 | Site-authored inline SVG illustration with dead classes (`fill-muted`, `text-foreground/20`, `text-foreground/30` are not emitted) | `components/editorial-floor.tsx` | UI004, ASSET008 |
| 7 | Site-authored status note with site classes | `components/status-note.tsx` | UI004, UI012 |
| 8 | Site-authored index markup over site classes (docs and blog) | `app/docs/[[...slug]]/page.tsx`, `app/blog/[[...slug]]/page.tsx` | UI004, UI011 |
| 9 | Site measure and link-row classes on the About page | `app/about/page.tsx` | UI004 |
| 10 | Dead classes with no declaration (`site-atmosphere`, `site-media-band`) | `app/page.tsx` | UI004 |
| 11 | Custom property reads in the sheet (`var(--foreground)`, `var(--primary)`, etc.) | `app/globals.css` | UI006 |
| 12 | Hardcoded CSS custom values in media queries (40rem, 64rem) | `app/globals.css` | UI011 |
| 13 | Raw `<img>` in the OpenGraph renderer (exception) | `app/opengraph-image.tsx` | ASSET001 |
| 14 | Favicon file required by the framework (exception) | `app/icon.svg` | ASSET008 |
| 15 | Custom post date element, orphaned once the index becomes ContentGrid rows | `components/post-date.tsx` | UI012 |

Nothing else was found: no Tailwind configuration, no Bootstrap, no styled
components or Emotion, no icon library imports (lucide-react reaches the tree
only as a transitive dependency of fumadocs-core, never imported), no custom
font, no raw `next/image`, no DOM styling, no private `@nanisoft/prism-ui`
paths. All component imports were already through the public subpaths.

## Phase 2: mapping (old to new)

| Before | After | Why it is the same job |
|---|---|---|
| `app/globals.css` (document frame) | `flex min-h-dvh flex-col` on `<body>`, `grow` on `<main>` in the layout and chrome | The sticky footer needed a column; both are layout utilities the emitted sheet carries |
| `components/logo.tsx` (site logo) | `NexusMark` from `components/product-marks`, sized by the mark slot (`size-4/5/6`, `h-full w-full`, `size-5`) | Identical drawing, token ink, no site file |
| `.site-status-note` | `Alert` (`components/alert`) with `AlertTitle` and `AlertDescription` | A callout carrying an important message, with the same words |
| `.site-catalog` + `.site-catalog__grid` (docs index) | `ContentGrid01` cards, 3 columns, `headingLevel="h1"` | The catalogue arrangement for choosing between entries |
| `.site-blog-list` (blog index) | `ContentGrid01` rows | Dated entries are read as rows when choosing |
| `.site-prose-table` (MDX tables) | `Table` parts in `lib/mdx-components.ts` | The library's own table draws the hairlines the sheet drew |
| `.site-measure`, `.site-about__facts`, `.site-about__links` | `Prose` (measure), `FactList` inside `Prose` (measure), `mt-10 flex flex-wrap gap-6` | Composition with emitted utilities only |
| `.site-product-mark`, `.site-panel-logo` | `h-full w-full` on marks, `size-5` in the instrument panel | Slot sizing, not site CSS |
| Inline `--ambient-travel-distance: 840px` | Removed; the keyframe falls back to its own default | The design system owns the travel |

Behavioral consequences, stated honestly:

- The PulseGraph is no longer hidden below the `lg` breakpoint (the one
  responsive behavior with no catalogue equivalent; see the gap list). The same
  five stages are the section below it, so no information was lost.
- The blog index no longer prints tags or a machine-readable `time` element:
  `ContentGrid01` carries one `category` string per entry and one display `at`
  string. The post screens keep both (BlogPostPage tags, `dateTime`).
- `components/post-date.tsx` was deleted once nothing consumed it. The date
  pair itself lives in `lib/post-date.ts`, still used by the post screen.
- The editorial figure's travelling marker now uses the keyframe's default
  distance (100%), not the site's 840px.
- The landing's atmosphere layer (AuroraWash plus TsparticlesField) was
  composed with a `site-atmosphere` class that declared nothing, so the whole
  layer measured 0px tall and the live canvas painted nothing. It is now the
  fixed ground it was written to be (`pointer-events-none fixed inset-0 -z-10`,
  all emitted utilities), and the browser lane confirms the canvas live at
  viewport size in both modes at all three widths.

## The TsparticlesField crash and its upstream fix

On 1.7.0 the dev page threw `ParticlesProvider init callback must be stable
across the app lifecycle` from `TsparticlesField` and the whole hero died.
Root cause, in the published package: the provider was handed an inline
`(engine) => loadSlim(engine)` closure recreated every render, and the
provider refuses an identity change. The field re-renders when its
MutationObserver reads the theme tokens, so the first re-render threw.
Both resolved tsparticles versions in the tree (4.5.2 and 4.5.3) carry the
same guard, so the defect was pre-existing rather than introduced by the
upgrade. On **1.7.1** the design system hoisted the callback (`init:
initTsparticles`, module scope); this app upgraded to 1.7.1 with no
app-side workaround, and the landing renders its floor and its live canvas
again.

## Phase 3 to 7: what was done

1. **Upgrade.** `pnpm up @nanisoft/prism-ui@1.7.0`. Build, 83 tests and
   `pnpm check` all passed on the upgrade alone.
2. **Zero custom styling.** `app/globals.css`, `components/logo.tsx` and
   `components/post-date.tsx` deleted. `prism-gates.json` now declares zero
   sheets for both `stylesheet-ownership` and `hidden-state` (floors set to 0).
3. **Components.** Docs index, blog index, status note, MDX tables, About page,
   chrome and landing migrated per the mapping above. No custom UI library
   was added; no competing styling dependency exists (`tailwind-merge`
   reaches the tree only as the design system's own dependency).
4. **Themes and typography.** Unchanged in principle: the `cyan` ground and the
   stored light/dark choice are two attributes on the document element plus
   the design system's boot script. Every page renders in both modes
   (the browser lane resolves both).
5. **Assets.** See the registry and exceptions below.
6. **Stylesheets and dependencies removed.** No `.css`, `.scss`, `.less`,
   `.styl` or CSS module file exists under `app`, `components` or `lib`.
   `test/zero-css.test.tsx` holds that negative with the chrome sibling order.

## Phase 8: static analysis (`pnpm ui:check`)

`scripts/ui-check.mjs` implements all 26 codes as an AST gate (Babel parser
with the TypeScript and JSX plugins), a stylesheet parser for the permitted
artifacts (of which there are none), and manifest analysis for dependencies:

- **References are the package's own contracts**: the emitted class set is
  parsed from `dist/styles.css` (UI004), variant ratios and budgets from
  `dist/assets/manifest.json` (ASSET002 to ASSET006), and the resolution rule
  from `dist/assets/index.js` (ASSET013). A renamed token is a finding, not a
  silent disagreement.
- **Every finding names its fix**, in the form this migration was asked for:
  `UI003: Hardcoded colour detected in Dashboard.tsx:42.` followed by the
  correction. The gate exits non-zero on any finding.
- **Data lives in two files**: `scripts/ui-check.config.json` (roots, allowed
  imports, exceptions) and `asset-registry.json` (application-owned assets).
  An exception suppresses exactly one file and one code, carries an owner and
  a review date, and **expires**: after the review date it becomes a finding
  again. There is no unrestricted suppression, and `eslint-disable`,
  `@ts-ignore` and `@ts-nocheck` are themselves findings (UI008).
- **Negative fixtures prove the gate**: `test/fixtures/negative` carries one
  deliberate violation per code (including a `tailwindcss` dependency in its
  own isolated `package.json`, a 53 KB over-budget SVG, an unsafe SVG, a raw
  image, a local primitive, a suppression comment). `test/fixtures/positive`
  carries approved composition with registered assets and passes.
  `test/ui-check.test.ts` runs the command three ways: negative must fail
  with all 26 codes, positive and this repository must pass.
- `pnpm check` runs `ui:check` first, so the mandatory local lane is one
  command. CI runs it as its own step before the tests (Phase 10).

Known limits, stated rather than hidden: conditional class names are checked
by their string parts, not by evaluation; DS asset props passed by spread are
skipped (the gate cannot see them); compiled CSS is not re-verified (the
emitted set, not the product, is the contract).

## Phase 9: runtime and visual enforcement

The browser lane, `pnpm check:cascade`, drives headless Chrome over the
DevTools protocol with no dependency of its own (the Playwright-equivalent
for a repository whose point is no client code). It now resolves at **three
widths (390, 768, 1280) in both modes** against four pages of the export:

- the page ground and the body ink against what `prism-tokens` publishes for
  the cyan pack in each mode, and the body contrast against 4.5:1;
- the worst text on each page against its actual ground;
- a link in copy (underline present, contrast cleared);
- the two repaired boxes (now the Alert and the first ContentGrid card) for
  edge and fill, and for edge not equal to fill;
- every product mark painted at every width and mode.

The mark probe needed repair in this phase: it assumed disc marks while this
site draws its marks, so it reported 22 findings (measured) with background
null and size 0x0 for drawn marks. The probe now measures the drawn svg's
box plus a visible stroke or fill on any descendant. The baseline failure
was verified by running the lane on the pre-migration tree (the same 22
findings), so the probe, not the migration, was the defect.

Gaps, with proposals: pixel-level screenshot regression with committed
baselines is **not** adopted (the lane asserts computed values instead;
a screenshot gate needs a browser in CI and a baseline store). An honest
Playwright adoption is the next step if screenshot evidence is wanted.

## Phase 10: CI and branch protection

`.github/workflows/ci.yml` verify runs, in order: install (frozen lockfile),
lint, typecheck, **`pnpm ui:check`** (new mandatory step), test, build,
`pnpm check` (which re-runs ui:check plus the kit plus the docs tree). The
deploy job needs verify, so a push that fails any of these cannot deploy.
The browser lane stays out of CI by the same rule as before (a runner does
not promise a browser; a gate that silently skips teaches people to ignore
it).

## Asset governance and the DS* question

**The DS* components this site was asked to request already ship in 1.7.0.**
Prism 1.7.0 implements the mission's asset contract as code:

- `DSImage` (variants hero, wide-hero, banner, card, landscape-thumb,
  square-thumb, avatar, product; ratio, fit and envelope from the manifest),
  `DSLogo` (governed heights), `DSIllustration` (asset-defined ratio, contain),
  `DSIcon` (closed registry, five sizes), `DSAvatar`, `DSVideo`,
  `DSMediaCard`, `DSGrid` (1 to 4 columns, one column below `sm`), `DSStack`.
- `dist/assets/manifest.json`: budgets per category, variant ratios, fits and
  maximum rendered sizes; `validateRasterSize` and `minimumSourcePx` for the
  resolution rule; formats woff2, png, svg, ico, svg-component, webp, avif,
  mp4, webm.

This site has no application photographs to present today, so no DSImage
call site exists yet; the contract is enforced by the gate (every ASSET code
is fixture-proven) rather than by usage. The two application-owned assets are
registered in `asset-registry.json`:

| Asset | Category | Role | Note |
|---|---|---|---|
| `app/icon.svg` | logo | brand-logo | Framework-required favicon file. Fixed colour, because a favicon renders outside the cascade |
| `components/editorial-floor.tsx` | illustration | complex-diagram | `svg-component`: theme-aware token fills (currentColor plus utilities) plus the ambient animation, neither of which survives authoring as a file consumed through an `img`. Sanitized by the same gate |

**Documented exceptions** (in `scripts/ui-check.config.json`, with owner and
expiry):

- `app/opengraph-image.tsx` (UI002, UI003, ASSET001, ASSET007; owner
  nexus-platform; review by 2026-12-31). The `next/og` renderer paints a
  bitmap once at build time with no cascade and no `data-pack`, so inline
  styles and literal colours mirroring the dark cyan tokens are its only
  interface, and the raw `<img>` draws the data-URI mark the renderer
  cannot resolve otherwise.

**Capability requests to the design system** (never worked around locally):

1. Responsive visibility: a primitive to hide or defer a figure below a
   breakpoint. The hero PulseGraph lost its below-`lg` rule (see the
   consequences above).
2. A document frame: the column body and the growing main are written with
   layout utilities in the layout and the chrome. A sanctioned frame would
   make that one decision instead of every consumer re-deciding it.
3. Blog tags on a ContentGrid entry (one `category` string per entry today):
   a multi-tag entry shape, so the index can carry the same tags the post
   screen does.

## Definition of done

| # | Criterion | State |
|---|---|---|
| 1 | No custom UI stylesheets | PASS: zero `*.css` under `app`, `components`, `lib`; `pnpm ui:check` (UI001) and `test/zero-css.test.tsx` |
| 2 | No inline styles | PASS: none in source except the registered OpenGraph exception |
| 3 | All visual components from the central design system | PASS: imports only from `@nanisoft/prism-ui` (UI005); indexes, note, tables and marks migrated (UI012) |
| 4 | Colours and typography from themes and tokens | PASS: zero hex literals (UI003), zero custom variables (UI006), typeface shipped by the DS sheet (`test/typeface.test.ts`) |
| 5 | Icons from the central icon library | PASS: no site icons exist; `DSIcon` is the only sanctioned spelling (UI005, ASSET008) |
| 6 | Images use approved asset presentation | PASS: no raw images in source (ASSET001); DSImage is the gate-proven spelling |
| 7 | Static assets pass asset validation | PASS: both registered assets validate; budgets, formats and safety are gate checks |
| 8 | Responsive behaviour from the design system | PASS: verified at 390, 768 and 1280 px in the browser lane (two site rules for it, the PulseGraph hide and the CSS breakpoints, are gone) |
| 9 | No competing styling dependencies | PASS: package.json carries no styling or UI library past Prism (UI007); `tailwind-merge` is Prism's own |
| 10 | All automated checks pass | PASS: `pnpm check` (ui:check + 7 kit gates + docs tree), `pnpm test` (81), `pnpm typecheck`, `pnpm lint` |
| 11 | Negative fixtures reject prohibited behaviour | PASS: all 26 codes fire on `test/fixtures/negative`; positive fixture passes |
| 12 | Production build independent of the design system source | PASS: the build runs against the pinned npm package only; no aliases, no local paths |
