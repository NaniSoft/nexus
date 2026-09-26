# Nexus

> Software that builds software. Nexus is the Agent Factory: a GitHub issue in, a reviewed pull request out.

Part of the [NaniSoft](https://www.nanisoft.com) web platform — five sites, one design language ([Prism](https://prism.nanisoft.com)).

- **Live**: https://nexus.nanisoft.com (Custom Domain, auto-created on deploy)
- **Pack**: lavender mode-switchable, beam-dark by default
- **Stack**: Next 16 static export · fumadocs-mdx · pnpm · TypeScript strict · oxlint · Vitest · Cloudflare Workers
- **Chrome**: [@nanisoft/prism-ui](https://www.npmjs.com/package/@nanisoft/prism-ui) (SiteHeader / SiteFooter) — npm dependency, never copied into this repo

## What ships

- **Landing** (`/`) — the Instrument Bench, in lavender: split hero with the loop drawn on a canvas inside an instrument panel, status ticker, then five numbered hairline sections — the loop as a conveyor rail (issue → container → build → review → merge), the capability grid, the survey grid of composed parts against the four built in-house, the build-order ledger, and the products built on Nexus — closing on a final CTA block.
- **Docs** (`/docs`) — a section catalog over `content/docs/`, then Introduction plus six sections: Concepts, Architecture, Configuration, Operations, Guides, Reference. 27 pages across six folder-per-section trees, each with its own `meta.json`. Every docs page carries the standing status note.
- **Blog** (`/blog`) — the four launch posts over `content/blog/` (folder-per-post, required date, drafts excluded), reverse-chronological with prev/next.
- **About** (`/about`) — the product's story: what the factory is for, what it is made of, and the honest tense of where it stands.

The honesty law is content, not chrome: the build-order ledger marks the design `complete` and every implementation piece `specified`, the ticker says `release → none yet`, and the standing status note on every docs and blog page says the design is public and nothing has shipped. `test/content.test.ts` fails CI if a quickstart, an embedded image, a changelog section, or a roadmap date reaches the docs or the blog.

## Develop

```bash
pnpm install
pnpm dev      # bake + dev server
pnpm build    # bake + static export to out/
pnpm test
pnpm lint
```

## Deploy

Push to `main` → GitHub Actions builds and deploys the Worker (`nexus-site`). Pull requests run CI (lint → test → build). Local lane: `pnpm deploy`.

## Status

Live — the landing, the six docs sections, the four launch posts, and the About page are all published from this branch, and the design documents the factory Nexus is meant to be. The factory itself is a separate matter: in active development, design complete, implementation specified and not started. The wayfinder map this site was built from is retired, so the ticket numbers once cited across this family are history; the published docs are the authority.
