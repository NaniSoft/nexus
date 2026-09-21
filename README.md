# Nexus

> The Agent Factory — autonomous software creation.

Part of the [NaniSoft](https://www.nanisoft.com) web platform — five sites, one design language ([Prism](https://prism.nanisoft.com)).

- **Live**: https://nexus.nanisoft.com (Custom Domain, auto-created on deploy)
- **Pack**: lavender mode-switchable, beam-dark by default
- **Stack**: Next 16 static export · pnpm · TypeScript strict · oxlint · Vitest · Cloudflare Workers
- **Chrome**: [@nanisoft/prism-ui](https://www.npmjs.com/package/@nanisoft/prism-ui) (SiteHeader / SiteFooter) — npm dependency, never copied into this repo

## Develop

```bash
pnpm install
pnpm dev      # bake + dev server
pnpm build    # bake + static export to out/
pnpm test
pnpm lint
```

## Deploy

Push to `main` → GitHub Actions builds and deploys the Worker (`nexus-site`). Pull requests run CI (lint → test → build).

## Status

Scaffold placeholder (wayfinder ticket 05) — the real landing, docs, and blog land with this site's build ticket. The effort map lives in the Nanisoft workspace at `.scratch/nanisoft-web/map.md`.
