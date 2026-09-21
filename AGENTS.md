# AGENTS.md — Nexus

## Project

**nexus.nanisoft.com** — Nexus, the Agent Factory — autonomous software creation. Landing + full docs + blog, in the lavender pack.

Part of the five-site Nanisoft web platform (www + nexus + atlas + alphalens + prism), one design language: Prism's Spectral Refraction (Archivo Variable + JetBrains Mono, hairline elevation, pastel packs, beam-dark).

## The one rule

Import UI from `@nanisoft/prism-ui` (tokens from `@nanisoft/prism-tokens`) — never from `antd` directly. The shared chrome (SiteHeader with the product switcher, SiteFooter) is an npm dependency, never copied into this repo.

Import shape (proven by prism's own site, and required — see below): components via their per-component subpaths (`@nanisoft/prism-ui/components/button`), blocks via `/blocks`, provider via `/provider`, the boot script via the root barrel. antd ships ' + "'use client'" + ', so inside server components a direct component (`<Button>`) renders fine, but `Typography.*` (a namespace — property access on a client reference is `undefined`) and `DisplayTitle` (destructures `Typography.Title` at module scope) must go through the site' + "'s" + ' client boundary, `components/prism-client.tsx` — otherwise the prerender crashes (found in scaffold ticket 05). Do NOT import `@nanisoft/prism-ui/theming` from app code — it pulls the SSR extractor meant for build scripts only.

## Wayfinding

The effort map — the law for this repo's scope, pack, and standing decisions — lives in the Nanisoft workspace at `.scratch/nanisoft-web/map.md` (workspace folder `C:\Users\dpven\source\nanisoft`, sibling of this repo folder; context doc beside it at `.scratch/nanisoft-web/CONTEXT.md`). This repo came from scaffold ticket 05; its build ticket lands the real site.

## Stack

- Next 16 static export (`output: 'export'`) at the repo root — flat single-app, no workspace.
- pnpm + TypeScript strict + oxlint + Vitest (jsdom + Testing Library).
- Theming: `PrismThemeModeProvider` + pre-baked `prism-<pack>-<mode>` variable rulesets (`pnpm bake` → `app/antd-vars.css`) + the blocking boot script in `lib/theme.ts` — flash-free mode swap per ADR-0006. Mode-only: the pack never changes at runtime.
- Deploys: push to main → GitHub Actions (`deploy.yml`) runs `pnpm build` + `wrangler deploy` with the org-level Cloudflare secrets; PRs run CI (lint → test → build). Local lane: `pnpm deploy`.

## Commands

- `pnpm dev` — bake + dev server
- `pnpm build` — bake + static export to `out/`
- `pnpm lint` / `pnpm test`
- `pnpm deploy` — build + wrangler deploy (local wrangler auth)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
