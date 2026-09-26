// The app-side `toPrismTree()` adapter: fumadocs' page tree → prism-ui's
// DocsNavEntry[]. prism-ui never sees a fumadocs type (ADR-0003 — structural
// props only at the package boundary).

import type { DocsNavEntry } from '@nanisoft/prism-ui/pages';
import type { Folder, Item, Node, Separator } from 'fumadocs-core/page-tree';

function nodeName(node: Item | Folder | Separator): string {
  const { name } = node;
  if (typeof name === 'string') return name;
  if (typeof name === 'number') return String(name);
  return '';
}

/**
 * Flatten a section's page tree into sidebar entries. Separators become group
 * headers (a link-less entry — DocsShell renders it as an anchor without href,
 * which the site CSS styles as a label); folders carry their index page's URL
 * and nest their children.
 */
export function toPrismTree(children: Node[]): DocsNavEntry[] {
  const entries: DocsNavEntry[] = [];
  for (const node of children) {
    if (node.type === 'separator') {
      entries.push({ id: `separator-${nodeName(node)}-${entries.length}`, title: nodeName(node), url: '' });
      continue;
    }
    if (node.type === 'folder') {
      entries.push({
        id: node.$id ?? `folder-${nodeName(node)}-${entries.length}`,
        title: nodeName(node),
        url: node.index?.url ?? '',
        children: toPrismTree(node.children),
      });
      continue;
    }
    entries.push({ id: node.$id ?? node.url, title: nodeName(node), url: node.url });
  }
  return entries;
}
