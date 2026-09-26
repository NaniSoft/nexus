# CONSISTENCY.md — the Nanisoft five-repo consistency contract

Binds www (`landing-page`), `nexus`, `atlas`, `alphalens`, and `prism` to one
way of staying consistent as changes are made and published. This copy lives
in `nexus`; the contract is mirrored across the family and the copies differ
only in this line. Changes are made family-wide in one sweep or not at all.

## 1. Dependency policy — the frozen Prism line

- All four sites consume `@nanisoft/prism-ui@0.4.0` and
  `@nanisoft/prism-tokens@0.3.0`, pinned **exact** — no ranges.
- The prism repository was rebuilt out of context after these sites shipped
  (a clean-break new line: prism-ui/prism-tokens 0.5.0, new API, new pack
  ids, Inter, antd out of scope — see prism's `MIGRATION.md`). The old line
  is deprecated, not unpublished: it keeps serving these sites indefinitely.
- There are therefore **no routine lockstep sweeps**. The sweep runbook —
  bump the pin in all four → `pnpm install` → `pnpm build` → verify →
  deploy → push, one repo at a time — exists only for a first-party hotfix
  on the 0.4.x line, which is not expected.
- Migrating onto the new Prism line is a redesign of every site — a new
  effort with its own plan, not maintenance on this family.

## 2. Shared chrome is npm-only

`SiteHeader`/`SiteFooter`/`PrismThemeModeProvider`/the boot script come from
prism-ui — never copied into an app. Import shapes: components via
per-component subpaths, blocks via `/blocks`, provider via `/provider`, the
boot script via the root barrel; never `@nanisoft/prism-ui/theming` in app
code (it pulls the SSR extractor). antd ships `'use client'`:
`Typography.*` and `DisplayTitle` cross the RSC boundary only through the
site's `components/prism-client.tsx`.

## 3. Theming

Mode-only: the pack never changes at runtime. `<html>` carries
`prism-<pack>-<mode>`, applied pre-paint by the blocking boot script; the
provider swaps the class synchronously in the toggle handler, before React
state updates. Colour comes from the pre-baked variable rulesets
(`pnpm bake` → `app/antd-vars.css`); raw hex is forbidden in app CSS.

## 4. Canvas re-theme law

A canvas reads its palette either (a) in a mode-keyed effect via
`usePrismThemeMode()` — the class is already swapped when the effect
re-runs — or (b) through the observer path: a two-frame-deferred re-read,
followed by a redraw so reduced motion re-renders. **Never** a token read
inside a `MutationObserver` callback: Chromium recalculates style only after
the callback, so the read returns the outgoing theme (measured by
pixel-sampling; found live in AlphaLens, and fixed there).

## 5. Reveal-safety law

A CSS-authored hidden state must be able to dismiss itself:
`[data-reveal]` hidden by CSS + `animation: <fallback> 1ms linear 3s
forwards` + a `@media (scripting: none)` guard; adding `.is-in` cancels the
animation before it can start.

## 6. Docs/blog shell styles are parity-locked

The pages-layer styles prism-ui ships without live app-locally in each repo
— identical copies, parity like the scaffold itself. Selectors covered:
`prism-docs-shell__neighbours`, `prism-blog-layout__*`, `site-prose`,
`site-catalog`, `site-blog-list`, `site-about`, `site-mono`, `site-eyebrow`.
A change to one site's copy is a change to all four in the same sweep.

## 7. Content tests read from disk

fumadocs' loaders cannot run under vitest (`defineDocs`/`defineCollections`
are compile-time macros only the bundler expands): content contracts read
`content/` from the filesystem.

## 8. The honesty law

In-development is described in the present tense of design — no invented
features, quickstarts, screenshots, or changelogs. Live / in-development /
designed stay separated everywhere they appear.

## 9. Mirrors

| Repo | Copy |
| --- | --- |
| landing-page | `CONSISTENCY.md` |
| nexus | `CONSISTENCY.md` |
| atlas | `CONSISTENCY.md` |
| alphalens | `CONSISTENCY.md` |
| prism | landed — the contract governs the four sites only |

*Contract version 1.1, 2026-09-27. No sweeps have been required (frozen
line). The retired wayfinder map and its ticket numbers are gone; the laws
above stand on their own.*
