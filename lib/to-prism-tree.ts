// The app-side `toPrismTree()` adapter: fumadocs' page tree → prism-ui's
// DocsNavEntry[]. prism-ui never sees a fumadocs type, only structural data across
// the package boundary, so a content pipeline and a documentation screen can be
// swapped independently.

import { isValidElement, type ReactNode } from 'react';

import type { DocsNavEntry } from '@nanisoft/prism-ui/pages';
import type { Folder, Item, Node, Separator } from 'fumadocs-core/page-tree';
import type { TOCItemType } from 'fumadocs-core/toc';

function nodeName(node: Item | Folder | Separator): string {
  const { name } = node;
  if (typeof name === 'string') return name;
  if (typeof name === 'number') return String(name);
  return '';
}

/**
 * The text of a React node, for a heading the content pipeline hands over as markup.
 *
 * A pipeline's table of contents does not carry a string. It carries a `ReactNode`,
 * because a heading may be `Some code` or **bold** and the pipeline has no business
 * flattening it, and the flattening is the consumer's job or nobody's. The old
 * adapter read it with `typeof title === 'string' ? title : ''`, which is why this
 * site shipped six years of documentation with an empty contents rail: every entry
 * was a `React.Fragment` element, every title became the empty string, and nothing
 * threw.
 *
 * The walk is over values rather than over element types, so it survives the pipeline
 * wrapping a heading in whatever it likes. An element it does not understand
 * contributes nothing, which is the honest outcome: an entry with no words is a
 * reader who cannot tell what they would jump to, and one is worse than none.
 */
function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map((child) => textOf(child as ReactNode)).join('');
  if (isValidElement(node)) {
    return textOf((node.props as { children?: ReactNode } | null | undefined)?.children);
  }
  return '';
}

/**
 * Flatten a section's page tree into sidebar entries.
 *
 * **A group with no index is a label, not an anchor with no destination.** The type
 * makes that a case rather than an accident: `href` is optional on a group, and its
 * absence renders a `span` carrying no `href` and nothing focusable, because an anchor
 * with no destination is a control a reader can reach and not operate. This tree has
 * two shapes in it, and both are the honest one: the six section folders each hold an
 * `index.mdx`, so each is a group with a route, and the root's own `introduction` is a
 * page with no children, so it is a page. Neither a `''` nor an omitted key is written
 * here, so neither shape can be reached by accident.
 *
 * A separator becomes a rule between entries rather than a group header, which is what
 * the navigation's third kind is for, and a rule is a label and never a link.
 */
export function toPrismTree(children: Node[]): DocsNavEntry[] {
  const entries: DocsNavEntry[] = [];
  for (const node of children) {
    if (node.type === 'separator') {
      entries.push({ type: 'divider', title: nodeName(node) });
      continue;
    }
    if (node.type === 'folder') {
      entries.push({
        type: 'group',
        title: nodeName(node),
        ...(node.index?.url === undefined ? {} : { href: node.index.url }),
        items: toPrismTree(node.children),
      });
      continue;
    }
    entries.push({ type: 'page', title: nodeName(node), href: node.url });
  }
  return entries;
}

/**
 * A document's own headings, as contents entries.
 *
 * The design system's documentation Page does not read Markdown and a Page that
 * guessed at a document's outline would guess wrong on every document rather than on
 * some, so the outline arrives as data. Only `h2` and `h3` are listed: `h1` is the
 * page's own title, which is above the contents rail already, and a fourth level is
 * below the fold on a document written as prose.
 *
 * The entries are fragments, so a contents rail on a page is a set of links into the
 * document the reader is already on, and `scripts/check-docs-tree.mjs` resolves every
 * one of them against the ids the same document emits.
 */
export function toContents(toc: readonly TOCItemType[]): DocsNavEntry[] {
  return toc
    .filter((entry) => entry.depth === 2 || entry.depth === 3)
    .map((entry) => ({ type: 'page' as const, title: textOf(entry.title), href: entry.url }));
}
