# Nexus

> Software that builds software. Nexus is the Agent Factory: a GitHub issue in, a reviewed pull request out.

Part of the [NaniSoft](https://www.nanisoft.com) web platform — five sites, one design language ([Prism](https://prism.nanisoft.com)).

- **Live**: https://nexus.nanisoft.com (Custom Domain, auto-created on deploy)
- **Pack**: `lavender` is the ground, on the document element, and it does not change. Four other packs are on marks: the header's product switcher carries `sky`, `lavender`, `mint`, `blush` and `peach`, and the landing's products section carries the three its rows name. That is the whole five-pack layering, and `scripts/pack-map.json` is the map and `scripts/check-pack-map.mjs` is the gate, checked in both light and dark mode
- **Stack**: Next 16 static export · fumadocs-mdx · pnpm · TypeScript strict · oxlint · Vitest (jsdom + Testing Library) · Cloudflare Workers
- **Chrome and every section**: [@nanisoft/prism-ui](https://www.npmjs.com/package/@nanisoft/prism-ui) 0.7.0, pinned exactly. It brings [@nanisoft/prism-tokens](https://www.npmjs.com/package/@nanisoft/prism-tokens) at the exact version it was released against, so this repository declares one first-party dependency and cannot be handed a mismatched pair. There is no local component and no client runtime: every page is a server component, so the site ships no JavaScript of its own

## What ships

- **Landing** (`/`) — the thesis as the page's `h1` with two real links under it, then the five standing facts as one line, then five numbered sections: **the loop** (five stages, then the four guarantees under them) · **what's inside** (the eight capabilities) · **how it's built** (the eight composed parts, then the four built in house) · **the build order** (the status ledger, one tier and one published word per row) · **built on Nexus** (Atlas, AlphaLens and Prism, each row a mark in that product's own pack and a whole-row link to its live site). It closes on a filled call to action.
- **Docs** (`/docs`) — this site's own section index over `content/docs/`, then the design system's documentation screen for the twenty-seven documents behind it: the Introduction plus six sections, Concepts, Architecture, Configuration, Operations, Guides and Reference, each a folder with its own `meta.json`. Every one of those pages carries a navigation rail of all twenty-seven, a contents rail of its own headings where it has any, and a pager derived from the tree rather than passed in.
- **Blog** (`/blog`) — the four launch posts over `content/blog/`, folder-per-post with a required ISO `date`, optional `tags` and `draft` (drafts never export), reverse-chronological. The index is this site's own composition and this site's own CSS, because the four blog lists in this family are four deliberate designs and the design system deliberately ships none. Each post is the design system's blog post Page, which owns the byline, the date in both its display and its machine form, and the trail to the neighbouring posts.
- **About** (`/about`) — the product's story: what the factory is for, what it is made of, and the honest tense of where it stands.
- **Not found** — the design system's not-found Page: the code as the page's heading, the sentence under it, and two ways out.

The honesty law is content, not chrome: the build-order ledger marks the design `complete` and every implementation piece `specified`, the standing facts say `release → none yet`, and the status note on every docs and blog page says the design is public and nothing has shipped. `test/content.test.ts` fails CI if a quickstart, an embedded image, a changelog section, or a roadmap date reaches the docs or the blog.

## How it is put together

```
app/layout.tsx        the document: two theme attributes, the boot script, the chrome
app/page.tsx          the landing, composed from catalogue items and nothing else
app/globals.css       253 lines: the two section indexes, the status note, the table hairline
app/about/page.tsx    a page header, the prose at the measure, a fact list, three links
app/not-found.tsx     the not-found Page
app/blog/…            the blog index (site's own) and the blog post (the catalogue's)
app/docs/…            the section index (site's own) and the documentation screen (the catalogue's)
lib/site.json         the ground, the default mode, the product directory
lib/site.ts           those facts, typed by the design system's pack vocabulary
lib/landing-content.ts every word of the landing, as data
lib/to-prism-tree.ts  the content pipeline's page tree, as the documentation Page's data
scripts/              the five gates, the pack map, the parity expectations, the browser lane
```

Three things are worth knowing before changing anything here.

**A consumer cannot write a design-system utility class.** The emitted stylesheet is
compiled from the design system's own source, so a utility exists in it only if a
Prism component uses it. `mb-12` is safe; a utility Prism happens not to use would do
nothing and say nothing. Anything this site needs for itself goes in `app/globals.css`
as a site class.

**The site stylesheet owns almost nothing.** It must not declare the page ground, the
body ink, a focus outline or a hairline colour on a selector with no class in it, and it
must not carry a `:focus` rule at all: the design system's base layer is layered and this
sheet is not, so a bare-element rule here wins the cascade whatever the cascade then does
with it. Three rules were deleted rather than mapped for exactly that reason, and two more
were repaired with explicit longhands, because a shorthand with one dead operand erases
the whole declaration rather than repainting it, and that is how a box loses both its edge
and its fill without anything throwing. That last sentence is the reason the `token-read`
gate exists; the rule is the failure message, and when `pnpm check` is red the message says
which of these it was and why it matters.

**A pack boundary is not only colour.** It repoints the pack's corner radius beneath
it, and it wears the mode of the nearest ancestor carrying `.dark`, which is why a
server-rendered boundary has no mode class of its own. So a boundary belongs on a fully
rounded mark and nowhere else, and a page that put a second pack on a section would be
encoding its section index in its corner radius. All five light grounds are the same
white and the five dark grounds span about three steps of near-neutral, so a section
ground buys almost nothing and costs a shape change. The map says where two regions may
carry a second pack; the gate says the count and the identifiers, in both modes, and a
third region fails the build.

## Develop

```bash
pnpm install
pnpm dev          # dev server
pnpm build        # static export to out/
pnpm lint         # oxlint
pnpm typecheck    # next typegen && tsc --noEmit
pnpm test         # vitest
pnpm check        # the docs-tree gate and the consumer gate kit; run after pnpm build
```

`pnpm check` runs this site's own docs-tree gate and then `prism-gates`, the gate
kit in `@nanisoft/prism-ui/gates`. The laws themselves are not in this repository:
they are the failure messages of those gates, so a fix to one reaches this site in
one release and cannot be declined here. The four repositories of the family run
the same programs and hold none of the wording. What this site holds is its own
half, in `prism-gates.json` and the two files it names: its stylesheets, its pack
map and the reason each region exists, its region resolver, and its coverage
floors. Every one of those is data.

| gate | law |
| --- | --- |
| `check:docs-tree` | The documentation tree, from the built export: twenty-seven pages across seven sections, a rail of all twenty-seven on every one of them, a pager whose two halves are the tree's own neighbours, and a contents rail whose every fragment names a heading the same document emits. This one is this site's, not the kit's. |
| `pin` | The design system is an exact version, and the token package is the component package's dependency rather than this site's. |
| `retired-line` | No trace of the retired component library. The lockfile is read as a graph. |
| `stylesheet-ownership` | This site's sheet owns no surface the design system owns, and takes no `color-mix()` over a `var()`. |
| `token-read` | Every custom property this sheet reads is declared. A read that resolves to nothing is not a wrong colour; it is no declaration at all. This is the assertion that was measured here first, and it is why the other three sites run it too. |
| `links` | Every internal destination and every in-page fragment resolves to something this site emits. |
| `pack-boundary` | The pack map, from the built export, in both modes: the region set, the identifiers, a boundary on a mark and nowhere else, and each boundary's own pack resolved against the published token contract. |
| `runtime-token-read` | No token is read at runtime, because a read resolves once and a resolved value does not follow the cascade. |

The kit's limits, which it prints on every run: it reads text rather than resolving
a cascade, and it reads the emitted export rather than a browser. The browser lane
below is the half that resolves a cascade, and it exists because the kit cannot.

The browser lane is not in `pnpm check`, because it needs a browser this repository
does not depend on and a continuous-integration runner does not guarantee:

```bash
pnpm check:cascade
```

It drives a real headless Chrome over the DevTools protocol, with no dependency of its
own, and it resolves in both light and dark mode: the page ground, the body ink and a
plain anchor's colour, against the values the design system declares; the contrast ratio
of the body text on the page in each mode; and the resolved background of each of the
three product marks, which is the assertion a DOM query cannot make. An element that
exists and paints nothing is the defect this site shipped until this migration, so
"the mark is in the document" is not evidence and the lane exists because of it. It
fails, loudly, when no browser is found, because a gate that silently skips is the
thing this family keeps warning about.

The content-parity comparison was a one-time instrument for the migration sweep and is
gone with its baseline, which lived outside the repository and was destroyed at the
close of that sweep. What it did is worth recording, because it is the reason `links`
is the gate that survived: it read the built export through a document parser rather
than a digest of `content/`, so it saw the copy in `lib/landing-content.ts` and in JSX,
which a content-tree digest would have been blind to. Every difference had to be
declared in `scripts/content-parity-expectations.json` with the reason it was a
rendering change and not a copy change, and a declaration that matched nothing was
itself a finding. The permanent successor asks a question that is true of every future
build rather than of one migration: does a reader who follows a link on this site arrive
somewhere.

## Deploy

Push to `main` → GitHub Actions runs the checks and then, as a job that needs them,
`wrangler deploy` for the `nexus-site` Worker, authenticated with the org-level
`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets. A push that fails its checks
cannot deploy, because the deploy job is never reached. `pnpm deploy` is the local lane
and needs wrangler auth.

## Status

Live at https://nexus.nanisoft.com. The landing, the twenty-seven documents across
seven sections, the four launch posts, and the About page are all published from this
branch, and the design documents the factory Nexus is meant to be. The factory itself is
a separate matter: in active development, design complete, implementation specified and
not started.

The wayfinder map these sites were built from is retired, and it and its ticket numbers
are gone from this repository's documents. The standing references are `AGENTS.md` (this
repository's own scope, stack and commands), `prism-gates.json` (this site's half of
the cross-repository contract, which is data only) and this file. The laws themselves
are not a reference in this repository: they are the failure messages of the gates in
`@nanisoft/prism-ui/gates`, which this site installs by pinning that package exactly.
