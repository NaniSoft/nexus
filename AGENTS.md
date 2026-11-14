# AGENTS.md — Nexus

## Project

**nexus.nanisoft.com** — Nexus, the Agent Factory — autonomous software creation. Landing + a twenty-seven-page documentation set + blog, in the cyan pack.

Part of the five-site Nanisoft web platform (www + nexus + atlas + alphalens + prism), one design language: Prism.

## How to build here

- Items come from their own subpath, never the root barrel: `@nanisoft/prism-ui/blocks/<item>`, `/components/<item>`, `/pages/<page>`, and `/theming` for the pack and mode vocabulary.
- `@nanisoft/prism-ui/styles.css` is imported once, in the root layout, and it is the only stylesheet. It carries every token, every utility and every base rule. This site ships no stylesheet of its own.
- A Block takes data and content as props.
- A consumer cannot write a Prism utility class: the consumer does not run Tailwind, so a utility exists in the emitted sheet only if a Prism component already uses it. Structural needs are expressed with the layout utilities the emitted sheet already carries, or by composing design system components. `pnpm ui:check` (code UI004) checks every className against the emitted class set, so a dead class fails instead of painting nothing.
- Two attributes on `<html>`, from `lib/site.ts`: `data-pack` for the ground and `class="dark"` for the mode. A blocking `PrismThemeScript` in `<head>` applies a stored choice before first paint and is the only writer of the theme's origin.
- A pack boundary is an attribute on an element: it repoints that pack's colour **and** its corner radius beneath it, and it wears the mode of the nearest ancestor carrying `.dark`. `scripts/pack-map.json` is the map, `scripts/pack-regions.mjs` names a region from the DOM, and the gate checks the map from the built export in both modes. A region is named after the structure the catalogue publishes, never after a number the page prints.

## What is enforced, and where the words live

The laws are not in this file. They are the failure messages of the gates in
`@nanisoft/prism-ui/gates`, so a fix to one reaches this site in one release and
cannot be declined here. The four repositories that run them share the programs and
hold none of the wording.

This site's own halves are in `prism-gates.json` and the files it names:

- `pnpm ui:check` (`scripts/ui-check.mjs`) is the zero-custom-styling gate: 26 codes (UI001 to UI012, ASSET001 to ASSET014) checked with an AST walker against the published package's own contracts. Exceptions live in `scripts/ui-check.config.json` with an owner and a review date. `test/fixtures` proves every code fires on a deliberate violation. `UI-GOVERNANCE.md` is the migration record.

`pnpm check` runs `ui:check`, then the gate kit, then this repository's own
docs-tree gate, and the repository's own copies of the kit's gates are gone. The
pinned package carries `gates/` and reports zero findings across seven gates, so a
run of `pnpm check` is a statement about the design system rather than about a
fork of it. The browser lane (`pnpm check:cascade`) resolves computed values in a
real browser at three widths in both modes, and is run by hand because a runner
does not promise a browser.

## What is site content and why

Both indexes on this site are content over catalogue arrangements, and both are
`ContentGrid01`, because choosing which entry to open is the question that
arrangement answers:

- The docs index is `ContentGrid01` in its cards form, three columns, with the six
  section blurbs as entries. The twenty-seven documents behind it are the design
  system's own screen.
- The blog index is `ContentGrid01` in its rows form, with the dated posts as
  entries. The post screen behind each title *is* the design system's own.

The copy, the blurbs and the dates are site content. The arrangement is the
catalogue's.

A third thing is site content in a smaller way: the chrome. `components/site-chrome.tsx` composes the bar, the `<main>` and the footer, and each page renders it with the page it is serving, because a root layout is not told its own pathname and a bar that cannot be told cannot mark the reader's place. The bar itself is the design system's `SiteNavbar`, so this repository supplies data and copy and nothing else. That is a server render reading its own route, not a client boundary, and `test/server-only.test.ts` is what holds it at zero: the bar's menu, mode control and search dialog are client components inside the pinned package, not a boundary drawn here.

## Wayfinding

This file is this repository's own instructions. `README.md` is what the site is
and how it is built and deployed. `prism-gates.json` is this site's half of the
cross-repository contract, and it holds only what this site knows. The site's own
words hold two rules that are worth stating once here and are checked by reading a
diff: no em-dash in anything this site authors, and one name per destination, so
`/docs` is "Read the docs" wherever it is a call to action and "Docs" wherever it is a
navigation label. The published corpus under `content/` still carries the dash it was
written with, and `README.md` records that as outstanding rather than done.

## Stack

- Next 16 static export (`output: 'export'`) at the repo root — flat single-app, no workspace.
- pnpm + TypeScript strict + oxlint + Vitest (jsdom + Testing Library).
- Deploys: push to main → GitHub Actions runs the checks and then the deploy (`wrangler deploy`) with the org-level Cloudflare secrets. The deploy is a job that needs the checks, so a push that fails cannot deploy.

## Commands

- `pnpm dev` — dev server
- `pnpm build` — static export to `out/`
- `pnpm lint` / `pnpm typecheck` / `pnpm test`
- `pnpm ui:check` — the zero-custom-styling gate, on source alone (26 codes; every finding names its fix)
- `pnpm check` — `ui:check`, the docs-tree gate and the consumer gate kit (see README); run it after `pnpm build`, because the kit reads the built export
- `pnpm check:cascade` — the browser lane at three widths in both modes; needs a Chrome or an Edge on this machine
- `pnpm deploy` — build + wrangler deploy (local wrangler auth)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
