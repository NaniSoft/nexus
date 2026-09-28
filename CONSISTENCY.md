# CONSISTENCY.md — the cross-repository law, and where each of it is enforced

This file used to be a mirror of one document across five repositories, differing in
one line, holding forty-one clauses of prose. It was replaced because a clause earns
a gate when its violation is silent, and a mirror in four repositories cannot fail:
the two sites that mattered had already drifted into three implementations of one
rule, and one of the three rules was false.

So the law is the failure message of a check, and the checks live where they can run.
There is no version line in this file: **the pinned package is the version**, and
`scripts/check-antd.mjs` fails if either pin is a range.

| The law | Where it is enforced here | What it stops |
| --- | --- | --- |
| No trace of the retired component library | `scripts/check-antd.mjs` | A dependency line, an import, a generated stylesheet, a build step or a living instruction coming back. The lockfile is read as a dependency graph, because deleting a dependency line does not empty a lockfile while another package declares the library. |
| A site stylesheet does not own a surface the design system owns | `scripts/check-stylesheet-ownership.mjs` | An unlayered bare-element declaration of the page ground, the body ink, a focus outline or a hairline colour, and any `:focus` rule at all. The cascade layer is not the cause of those failures; it is the reason they were invisible. |
| Every internal destination resolves, and every fragment names an element that exists | `scripts/check-links.mjs` | A link that renders, looks right, and goes nowhere. Off-site hosts are listed, not resolved. |
| The documentation tree is twenty-seven pages across seven sections, with a derived pager and a contents rail | `scripts/check-docs-tree.mjs`, `test/docs-tree.test.tsx` | A section that silently stopped rendering, a pager that lost a neighbour, and a contents rail that points at a heading the document does not carry. The first is read from the built export and the second from the rendered Page. |
| A pack boundary lands on a mark, and exactly two regions of a page may carry a second pack | `scripts/check-pack-map.mjs`, `test/pack-map.test.tsx`, `scripts/pack-map.json` | A third region wearing a pack, a boundary on something whose corner radius the pack moves, and a boundary that resolves the light block on a dark page. Checked in both modes; a screenshot in one mode is not evidence. |
| No client code, so no runtime token read and no CSS-authored hidden state | `test/server-only.test.ts` | The two laws this repository used to carry in prose. Both were laws about client code; the tree has none, and this asserts that it keeps none. |
| Content tests read from disk | `test/content.test.ts` | A content contract that passes because a compile-time macro made a loader importable. fumadocs' `defineCollections` is expanded by the bundler only, so the loaders cannot run under this runner. |
| The landing is composed from the catalogue, with no local component | `test/smoke.test.tsx` | A hand-written section, a local wrapper, or a Block that silently drops the copy it was given. Every stage name, every stage caption, every ledger row and all three product marks are asserted. |
| The blog list keeps its own design | `test/smoke.test.tsx`, and the shape of `app/blog/[[...slug]]/page.tsx` | The design system shipping a blog index to flatten four deliberate designs into one. It deliberately ships none, so the index is this site's own and the post screen behind each title is the design system's. |
| The rebuild changed the rendering layer and not the content | `scripts/check-content-parity.mjs` with `scripts/content-parity-expectations.json` | A copy edit during a migration. The baseline is cut before the first edit, lives outside the repository, and is destroyed at the close of the sweep; the permanent gate that outlives it is `check-links.mjs`. |
| In-development is described in the present tense of design | `test/content.test.ts` for the devices, and a review convention for the rest | A shipped feature described as live, a quickstart, an embedded image, a changelog or a roadmap date reaching the docs or the blog. A prose law cannot see a dishonest data source, so that half is a content decision and this file is the only place it can be written down. |

## What is not here any more, and why

- **A pinned Prism line as a contract.** The pins are in `package.json`, exact, and the
  gate fails a range. That is the whole clause. The two pins are deliberately different
  numbers, because the component package declares an exact peer dependency on the token
  package it was released against and a component-only release leaves the token package
  behind; `pnpm-workspace.yaml` says so where the exclusion lives.
- **A client boundary for shared components.** The design system's items are server
  components, so there is nothing to cross and no file that exists only to cross it.
- **A baked variable ruleset and a pre-paint class swap.** The theme is two attributes
  on the document element and a blocking script the design system ships.
- **A canvas re-theme law.** The canvas is deleted. The law existed because a canvas
  reads a computed value once and paints pixels, and a painted pixel does not move when
  the pack beneath it does; `test/server-only.test.ts` now holds the general form, which
  is that this repository reads no token at runtime.
- **A reveal-safety law.** The reveal is deleted, and so is every keyframe with it. The
  law held because a CSS-authored hidden state has to be able to dismiss itself, and the
  cheapest way to be sure there is none is that the stylesheet declares no opacity of
  zero and no keyframes at all.
- **Parity-locked shell styles.** The shell moved into the design system, so the
  selectors that four repositories copied by hand match nothing and are deleted.
- **Parity-locked copy of the documentation and blog screens.** Same reason, and the
  two stylesheet rules that restyled an anchor with no destination back into a label are
  deleted with them, because the design system's own Page now renders a group with no
  index as a label.
- **A section-level law about pack grounds.** The old rule was that pack colour is a
  signal and never a ground, and it existed because a stylesheet could hold one pack.
  What replaces it is arithmetic: a boundary moves the corner radius, and a section
  ground would make the corner radius an encoding of the section index. That is
  checkable, so it is in `scripts/pack-map.json` and in a gate, and it is no longer
  prose.

## The consumer defects this site works around, recorded against the design system

Three, and none of them is a practice. Each is a defect in a package every site pins
exactly, and each is why a line here reads the way it does.

1. **The published JavaScript is not loadable by Node's ESM resolver** (prism#110), so a
   site whose tests render a catalogue item has to inline the package in its test
   runner. Bundlers resolve it, so `next build` is green and the failure reads as a
   missing module rather than as a packaging defect.
2. **The emitted stylesheet declares `--radius` and `--radius-xl` and no other member of
   the radius scale**, because a member is emitted only where a component uses it and a
   consumer does not run Tailwind. So a consumer's own stylesheet must derive a radius
   with `calc()` on `--radius` rather than read `var(--radius-sm)`, which resolves to
   nothing. `test/server-only.test.ts` holds the general form of that, over every
   `var()` in the sheet.
3. **No font file ships with the component package**, so a site that loads nothing renders
   in the platform's UI face. The site supplies the file the token already names and
   repeats the design system's own fallback list verbatim behind it.
