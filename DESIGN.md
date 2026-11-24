---
name: Nexus (nexus.nanisoft.com)
description: The Agent Factory: a cyan-lit ground where one issue becomes one reviewed pull request, drawn as a loop.
colors:
  beam: "#7fdaf0"
  on-beam: "#001c23"
  beam-day: "#46bcd6"
  ground: "#15191a"
  ground-day: "#e9eeef"
  ink: "#e9eeef"
  ink-day: "#2a2f30"
  muted-ink: "#c4ccce"
  muted-ink-day: "#555c5e"
  wash: "#004b59"
  wash-day: "#cdf5ff"
  hairline: "#3d4445"
  hairline-day: "#d9dfe1"
  glass-card: "rgba(233, 238, 239, 0.07)"
  rail-glass: "rgba(61, 68, 69, 0.88)"
  brand-ink: "#a7ebfc"
  brand-ink-day: "#006678"
  ray-cyan: "#7fdaf0"
  ray-mint: "#9ddcad"
  ray-gold: "#edc47d"
  ray-sky: "#9bd1ff"
  spectrum-blush: "#ec88a0"
  spectrum-lavender: "#bc97e7"
  spectrum-mint: "#73bf88"
  spectrum-sky: "#6cb2eb"
  spectrum-peach: "#e4965e"
typography:
  display:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
  heading:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
  body:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    fontSize: "1rem"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace"
    fontSize: "0.625rem"
    letterSpacing: "0.1em"
rounded:
  xs: "0.125rem"
  sm: "0.3rem"
  base: "0.5rem"
  xl: "0.7rem"
  4xl: "1.3rem"
spacing:
  unit: "0.25rem"
  section: "4rem"
  section-wide: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.beam}"
    textColor: "{colors.on-beam}"
    rounded: "{rounded.base}"
  button-outline:
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
  card:
    backgroundColor: "{colors.glass-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
---

# Design System: Nexus (nexus.nanisoft.com)

## Overview

**Creative North Star: "The Factory Loop"**

One cycle, walked again by every band: an issue arrives, a fresh container spins up, the build runs, review reads the diff, merge closes the loop. The mark is three nodes on one cycle; the favicon is the same loop; the hero instrument shows the reviewer's panel; the process band draws five stages on a thread with "merged" at the end; the guarantees restate the loop in prose. Nothing on the page is off the cycle, and the cyan pack keeps the floor lit like a clean room: a glacial beam on a near-neutral dark ground, one accent voice per section.

Nexus is the evidence site of the family. Its artifacts claim nothing they cannot prove: mono-numbered diff blocks with a plus-two and a minus-one, badge rows that are labels and not buttons, run-step lists with done and now states, and every example artifact captioned "as designed" because nothing has shipped yet. The build-order honesty ledger marks design complete and implementation running, and the blog is called "The build log" because that is what it is. Motion is the loop made visible: a packet rides the editorial factory floor, markers travel the rails, and scroll reveals stagger through the middle bands while the hero stays still.

The site ships zero CSS of its own. Every value below arrives through the pinned `@nanisoft/prism-ui@1.13.0` stylesheet (`data-pack="cyan"`), which is normative; these figures are a snapshot of that pin. Dark is the default rendering and the `-day` siblings are the light mode.

**Key Characteristics:**
- One glacial cyan beam on a near-neutral dark ground, dark first
- The loop drawn three ways on one page: instrument panel, process rail, guarantee notes
- Evidence artifacts that claim nothing: diffs, badge rows, run steps, all "as designed"
- Mono as the voice of the machine: file names, line numbers, stage labels
- One name per door: "Read the docs", "Follow the build", "Docs" in the nav
- Zero site-authored CSS; hairline structure on glass at token prices

## Colors

Glacial cyan on near-neutral dark, with the sibling packs held to product marks. The palette reads as a clean room's status lighting: cool, even, and spent on flow rather than decoration.

### Primary
- **Loop Cyan** (#7fdaf0 dark, #46bcd6 light): the pack beam. Primary buttons, focus rings, the loop's node accents, the traveling marker on the editorial floor. Its text is always deep teal-black (#001c23).
- **Brand Ink** (#a7ebfc dark, #006678 light): mark and wordmark ink, a paler ice than the beam.

### Secondary
- **Ray Mint** (#9ddcad): Atlas, inside its mark only.
- **Ray Gold** (#edc47d): AlphaLens, inside its mark only.
- **Ray Sky** (#9bd1ff): NaniSoft, inside its mark only.
- **The Prism Spectrum** (#ec88a0, #bc97e7, #73bf88, #6cb2eb, #e4965e): the Prism mark drawn as the full fan; the same stops power spectrum-ink heading tails.
- **Chart Runners** (#46bcd6, #2dd4bf, #fbbf24, #a4adaf, #f87171 dark): the five chart colors, spent inside PulseGraph and Diagrams.

### Neutral
- **Ground** (#15191a dark, #e9eeef light): the page, one continuous ground.
- **Ink** (#e9eeef dark, #2a2f30 light): text at rest.
- **Muted Ink** (#c4ccce dark, #555c5e light): descriptions, captions, meta.
- **Wash** (#004b59 dark, #cdf5ff light): accent fills; in dark a deep lagoon shade of the beam, in light an icy pale cyan.
- **Hairline** (#3d4445 dark, #d9dfe1 light): all 1px structure, diff rules, thread lines.
- **Glass Card** (rgba(233, 238, 239, 0.07) dark, rgba(255, 255, 255, 0.72) light): card and panel fills on the veil ladder.
- **Status**: alarm #f87171, grow #4ade80, hold #fcd34d in dark; #dc2626, #15803d, #f59e0b in light. Run-step states read done and now as words; the review verdicts (approve, request changes, reject) are labels, never buttons.

### Named Rules
**The Loop Rule.** Every band walks the same five-stage cycle (issue, container, build, review, merge). A band that cannot name its stage in the loop does not ship.
**The As-Designed Rule.** Example artifacts are captioned "as designed" until they ship. The build-order ledger is the page's authority: design complete, implementation running, no release yet.
**The Label-Not-Button Rule.** Verdicts, badges and states are labels. A label that looks clickable but does nothing is a defect.

## Typography

**Display Font:** Inter (shipped inside the design system stylesheet; the site loads no font)
**Body Font:** Inter
**Label Font:** the system mono stack

**Character:** the engineer's voice beside the machine's. Display states the thesis in one clause with its tail in spectrum ink; body explains the loop; mono is the machine's own handwriting: file names, line numbers, stage labels, badges.

### Hierarchy
- **Display** (600, design system display scale): the hero thesis, "Industrializing software delivery with AI agents.", with the tail "with AI agents." in spectrum ink.
- **Heading** (600, scale to 2.25rem): section headings; three of them carry spectrum tails.
- **Title** (600, 1rem): card titles, panel headers, ledger labels.
- **Body** (400, 1rem): reading text at the 42rem measure; docs prose in the design system Prose.
- **Label** (mono, 0.625rem, 0.1em tracking, uppercase): eyebrows, badges, diff headers, stage names.

### Named Rules
**The One-Name-Per-Door Rule.** Each destination has exactly one name: "Read the docs" as a call to action, "Docs" as the nav label, "Follow the build" for the blog everywhere it appears.
**The No-Machine-Punctuation Rule.** No em dash in anything site-authored: a dash as punctuation is the most recognizable sign of a page written by something rather than someone.

## Layout

One 72rem page column (the container-page token) with sections breathing at 4rem and 6rem; measured at 1088px of content at a 1440px viewport. The landing is eleven bands on the loop: hero with the reviewer's instrument panel, standing-facts ticker, five-stage process flow on a thread, diff evidence band, four guarantees, media band with the editorial factory floor, eight capabilities in a bare grid, eight parts plus four in-house on a stack grid, build-order ledger, product grid (the only second-pack band), closing call. Ground01's atmosphere sits fixed at z-index -1 and the main column stacks at z-index 1. Reveal wraps the scrolled bands with delay rungs; hero, ticker and closing call stay still.

Docs run in the design system shell: a nav rail of all 27 pages, per-page outline, tree-derived pager, six sections plus an introduction, and a ContentGrid01 card index. The blog is "The build log": rows-variant content grid index, and the design system post page with chronological Previous and Next. Responsive behavior lives almost entirely inside the blocks; the site's own code carries a single sm: and a single lg: utility, both incidental.

## Elevation & Depth

Layered glass, hairline bones. Cards price their translucency on the veil ladder (7% in dark, 72% in light), popovers sit at 88%, and shadows are composed light: top rim, optional inner ring, tight contact, wide ambient shade, in three strengths. The evidence artifacts sit in hairline-framed panels (`border-border bg-background rounded-lg border`), so the diff reads like paper in a tray rather than a floating card. Nothing site-authored; a reduced-transparency reader gets the sheet's opaque fallbacks.

### Shadow Vocabulary (design system components only)
- **shadow-xs** (rim + contact): resting cards, inputs, evidence panels at rest.
- **shadow-sm** (rim + inner ring + contact + ambient shade): raised panels, the scrolled navbar.
- **shadow-md** (rim + inner ring + contact + wide shade): popovers, search dialog, menus.

### Named Rules
**The Paper-In-A-Tray Rule.** Evidence artifacts are hairline-framed surfaces at rest, not floating cards; elevation rises only when a surface genuinely lifts (menus, dialogs).

## Shapes

The cyan pack is the tightest family ground alongside sky: 0.5rem base radius, derived steps at 0.3rem, 0.7rem and 1.3rem. Corners round panels and buttons; product marks are fully rounded discs so a pack boundary's radius re-point moves nothing. The signature silhouette is the thread: the process flow draws its five stages on a 1px line that must never drop a stage to fit, the diff draws gutter rules in hairline, and the editorial floor's gantry frames the packet's travel lane. Diagram geometry is loop-first: nodes at corners, edges on the cycle, one emphasis at a time.

## Components

### Buttons
- **Shape:** the 0.5rem pack radius.
- **Primary:** loop cyan background, deep teal-black text; "Follow the build" and "Read the docs" are the site's two doors.
- **Outline:** hairline border, ink text, transparent fill.
- **Hover / Focus:** token-priced; focus takes the cyan ring.

### Evidence Artifacts (signature)
The diff block is the site's trademark surface: a mono-numbered file header, gutter-numbered lines with plus and minus counts, hairline rules, and a caption that keeps it honest. Badge rows accompany it: "tests pass", "3 files", "one container" as outline labels; review verdicts as plain labels. Run-step lists carry done and now states as words with dots.

### Instrument Panel (signature)
The hero's reviewer panel: a framed InstrumentPanel01 with a NexusMark in its title-bar slot, a Status word, badge rows, a Diff artifact, and a PulseGraph of the loop's five stages. It is the loop in one object, and it claims "as designed".

### Cards / Containers
- **Corner Style:** 0.5rem.
- **Background:** glass card; wash fills for stating panels.
- **Shadow Strategy:** token shadows; evidence panels sit flat with hairlines.
- **Border:** 1px hairline.
- **Internal Padding:** the design system spacing scale.

### Navigation
The design system navbar: sticky (the landing is nine bands long and the bar holds the only persistent docs link), transparent over the ground, glass on scroll. Nexus lockup left; Docs, Blog, About center with the current page marked; the family menu, search over a static 35-entry index, and the mode toggle right. The social list was deliberately dropped: one destination, one control.

### Editorial Factory (signature)
A 1200-by-675 schematic floor in the media band: gantry, stations, and one packet riding the ambient-travel cycle at 7200ms linear. Token-stroked, script-free, and true with animation stopped.

### Docs Shell and Build Log
Docs: nav rail, outline, derived pager, ContentGrid01 card index. Blog: "The build log" in rows; the design system post page with display and machine dates and a chronological trail.

### Named Rules
**The One View System Rule.** Prism is the only view system: every component renders through design system Components, Blocks and Pages styled by the pinned stylesheet, under the zero-custom-UI contract UI-GOVERNANCE.md records and ui:check enforces (no site stylesheet, inline style, hex value, custom variable, styling dependency, icon library or font import; className passthrough only, layout utilities only). Gaps go upstream, never around.

## Do's and Don'ts

### Do:
- **Do** name every band's stage in the loop, and draw the loop the same way each time.
- **Do** caption example artifacts "as designed" until the ledger says shipped.
- **Do** keep verdicts and states as labels, and run-step states as words.
- **Do** use mono for the machine's voice: file names, line numbers, stages, badges.
- **Do** keep the 0.5rem radius family, glass at token prices, and hairline-framed evidence panels.
- **Do** let the blocks own responsiveness and the sheet own every style.

### Don't:
- **Don't** author a stylesheet, inline style, hex value or custom variable; the pinned sheet owns all styling.
- **Don't** use an em dash in anything site-authored.
- **Don't** make a verdict or badge look like a button, and don't add a second control for a destination that has one.
- **Don't** publish quickstarts, embedded images, changelog sections or roadmap dates; the content tests fail the build on them.
- **Don't** place a second pack anywhere but the products band's product marks.
- **Don't** wrap the hero, ticker or closing call in Reveal; the page does not introduce itself twice.
