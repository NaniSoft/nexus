import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { render, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DocsShell } from '@nanisoft/prism-ui/pages';
import type { DocsNavEntry } from '@nanisoft/prism-ui/pages';

import { toContents, toPrismTree } from '@/lib/to-prism-tree';

/**
 * The documentation tree: twenty-seven pages across seven sections, and the two
 * affordances that make a tree of that depth usable.
 *
 * `lib/source.ts` cannot be imported here: fumadocs' `defineDocs` is a compile-time
 * macro only the bundler expands, which is why `test/content.test.ts` reads `content/`
 * from disk. So the tree in this file is built by hand in the shape the adapter
 * accepts, and the adapter is tested against a fumadocs page tree it also builds by
 * hand. The two halves together are the argument: the shape is the shape, the adapter
 * maps it, and the Page renders whatever the adapter returns.
 *
 * The end-to-end proof that the real tree, the real adapter and the real Page produce
 * twenty-seven pages with a working pager is `scripts/check-docs-tree.mjs`, which reads
 * the built export. A unit test cannot see a page tree the bundler built.
 */
const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'content', 'docs');

const SECTION_SLUGS = [
  'concepts',
  'architecture',
  'configuration',
  'operations',
  'guides',
  'reference',
] as const;

const LABELS: {
  navLabel: string;
  tocLabel: string;
  pagerLabel: string;
  pagerLabels: { previous: string; next: string };
} = {
  navLabel: 'Docs',
  tocLabel: 'Contents',
  pagerLabel: 'Pages',
  pagerLabels: { previous: 'Previous', next: 'Next' },
};

/** The twenty-seven addresses the tree holds, in the order a reader meets them. */
const TREE: DocsNavEntry[] = [
  { type: 'page', title: 'Introduction', href: '/docs/introduction' },
  ...SECTION_SLUGS.map((section) => ({
    type: 'group' as const,
    title: section,
    href: `/docs/${section}`,
    items: mdxPages(section).map((page) => ({
      type: 'page' as const,
      title: page,
      href: `/docs/${section}/${page}`,
    })),
  })),
];

/** The `mdx` files in one section, minus its own `index`. */
function mdxPages(section: string): string[] {
  const meta = JSON.parse(readFileSync(path.join(DOCS, section, 'meta.json'), 'utf8')) as { pages: string[] };
  return meta.pages;
}

function shell(currentHref: string, toc?: DocsNavEntry[]) {
  return render(
    <DocsShell
      title="A page"
      description="The page under test."
      nav={TREE}
      toc={toc}
      currentHref={currentHref}
      {...LABELS}
    >
      <p>Body.</p>
    </DocsShell>,
  );
}

/** Every page destination in the tree, flattened the way the Page flattens it. */
function pages(entries: readonly DocsNavEntry[]): string[] {
  const out: string[] = [];
  for (const entry of entries) {
    if (entry.type === 'page') out.push(entry.href);
    else if (entry.type === 'group') {
      if (entry.href !== undefined) out.push(entry.href);
      out.push(...pages(entry.items));
    }
  }
  return out;
}

describe('the documentation tree', () => {
  it('holds twenty-seven pages across seven sections, and the corpus holds them', () => {
    // The Introduction plus six section index pages plus twenty child pages.
    expect(pages(TREE)).toHaveLength(27);
    expect(TREE).toHaveLength(7);
    // And the same count, from the corpus on disk, so the hand-built tree above is
    // not a shape that happens to pass.
    const onDisk = readdirSync(DOCS, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? readdirSync(path.join(DOCS, entry.name)).filter((file) => file.endsWith('.mdx'))
        : entry.name.endsWith('.mdx')
          ? [entry.name]
          : [],
    );
    expect(onDisk).toHaveLength(27);
  });

  it('renders a rail holding every page, with the section it belongs to over its children', () => {
    const { container } = shell('/docs/introduction');
    const rail = container.querySelector('[data-slot="docs-rail"]');
    expect(rail).toBeTruthy();
    expect(rail?.querySelectorAll('[data-slot="docs-nav-group"]')).toHaveLength(6);
    // Twenty-seven destinations on the rail: the Introduction and the twenty child
    // pages as links, and the six section indexes as the headings over them.
    expect(rail?.querySelectorAll('[data-slot="docs-nav-link"]')).toHaveLength(21);
    expect(rail?.querySelectorAll('[data-slot="docs-nav-heading"]')).toHaveLength(6);
    // Every destination on the rail is a real anchor, because every one of them is a
    // route: this tree has no group without an index, so no entry here is a label.
    expect(rail?.querySelectorAll('a[href]')).toHaveLength(27);
    expect(rail?.querySelectorAll('a:not([href])')).toHaveLength(0);
  });

  it('marks the page the reader is on, and the section that contains it', () => {
    const { container } = shell('/docs/architecture/kanban-service');
    const current = container.querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0]?.getAttribute('href')).toBe('/docs/architecture/kanban-service');
    // A group whose route the reader is under renders as a link in the brand ink, and a
    // group the reader is not under stays muted. Colour is not the evidence; the class
    // is, because the attribute above is what a screen reader reads.
    const heading = [...container.querySelectorAll('[data-slot="docs-nav-heading"]')].find(
      (element) => element.textContent === 'architecture',
    );
    expect(heading?.getAttribute('class')).toContain('text-foreground');
  });

  it('derives a pager from the navigation rather than being passed one', () => {
    const { container } = shell('/docs/concepts/worker-containers');
    const pager = container.querySelector('[data-slot="docs-pager"]');
    expect(pager).toBeTruthy();
    expect(pager?.getAttribute('aria-label')).toBe(LABELS.pagerLabel);
    const links = [...(pager?.querySelectorAll('a') ?? [])].map((anchor) => anchor.getAttribute('href'));
    expect(links).toEqual(['/docs/concepts/the-factory-model', '/docs/concepts/orchestration']);
    expect(within(pager as HTMLElement).getByText(LABELS.pagerLabels.previous)).toBeTruthy();
    expect(within(pager as HTMLElement).getByText(LABELS.pagerLabels.next)).toBeTruthy();
  });

  it('prints one half of the pager at each end of the tree and never a blank one', () => {
    const first = shell('/docs/introduction').container.querySelector('[data-slot="docs-pager"]');
    expect(first?.querySelectorAll('a')).toHaveLength(1);
    expect(first?.querySelector('a')?.getAttribute('href')).toBe('/docs/concepts');
    const last = shell('/docs/reference/glossary').container.querySelector('[data-slot="docs-pager"]');
    expect(last?.querySelectorAll('a')).toHaveLength(1);
    expect(last?.querySelector('a')?.getAttribute('href')).toBe('/docs/reference/configuration-schema');
  });

  it('prints no pager at all when the address is not in the tree', () => {
    // Two blank halves are a rule above nothing, and a reader cannot tell that from a
    // page with no neighbours.
    const { container } = shell('/docs/concepts/not-a-page');
    expect(container.querySelector('[data-slot="docs-pager"]')).toBeNull();
  });

  it('renders a contents rail from the document\'s own outline, and no rail without one', () => {
    const toc = toContents([
      { title: 'What runs inside', url: '#what-runs-inside', depth: 2 },
      { title: 'Why one container per issue', url: '#why-one-container-per-issue', depth: 3 },
      { title: 'The loop', url: '#the-loop', depth: 1 },
      { title: 'Lifecycle', url: '#lifecycle', depth: 4 },
    ]);
    expect(toc.map((entry) => entry.type === 'page' && entry.href)).toEqual([
      '#what-runs-inside',
      '#why-one-container-per-issue',
    ]);
    const { container } = shell('/docs/concepts/worker-containers', toc);
    const contents = container.querySelector('[data-slot="docs-contents"]');
    expect(contents).toBeTruthy();
    expect(contents?.querySelector('nav')?.getAttribute('aria-label')).toBe(LABELS.tocLabel);
    const links = [...(contents?.querySelectorAll('a') ?? [])].map((anchor) => anchor.getAttribute('href'));
    expect(links).toEqual(['#what-runs-inside', '#why-one-container-per-issue']);
    // A section index page has no h2 and no h3, so it has no contents rail at all.
    expect(shell('/docs/concepts').container.querySelector('[data-slot="docs-contents"]')).toBeNull();
  });
});

describe('the tree adapter', () => {
  it('maps a folder with an index to a group with a route, and a folder without one to a label', () => {
    const mapped = toPrismTree([
      { type: 'page', name: 'Introduction', url: '/docs/introduction' },
      {
        type: 'folder',
        name: 'Concepts',
        url: '/docs/concepts',
        children: [{ type: 'page', name: 'The factory model', url: '/docs/concepts/the-factory-model' }],
        index: { type: 'page', name: 'Concepts', url: '/docs/concepts' },
      },
      {
        type: 'folder',
        name: 'Reference',
        url: '/docs/reference',
        children: [{ type: 'page', name: 'Glossary', url: '/docs/reference/glossary' }],
      },
    ] as never);

    expect(mapped[0]).toEqual({ type: 'page', title: 'Introduction', href: '/docs/introduction' });
    // A group with an index is a destination and renders an anchor.
    expect(mapped[1]).toEqual({
      type: 'group',
      title: 'Concepts',
      href: '/docs/concepts',
      items: [{ type: 'page', title: 'The factory model', href: '/docs/concepts/the-factory-model' }],
    });
    // A group with no index is a label and not a route. The key is absent rather than
    // empty, because the Page renders an absent `href` as a `span` and an empty string
    // as an anchor with no destination, and this site's old stylesheet carried a rule
    // to restyle that anchor back into a label. That rule is now deleted.
    expect(mapped[2]).toEqual({
      type: 'group',
      title: 'Reference',
      items: [{ type: 'page', title: 'Glossary', href: '/docs/reference/glossary' }],
    });
    expect('href' in (mapped[2] as object)).toBe(false);
  });

  it('maps a separator to a rule, which is a label and never a link', () => {
    const mapped = toPrismTree([{ type: 'separator', name: 'Foundations' }] as never);
    expect(mapped).toEqual([{ type: 'divider', title: 'Foundations' }]);
  });
});
