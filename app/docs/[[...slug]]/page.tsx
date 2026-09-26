import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { findNeighbour } from 'fumadocs-core/page-tree';

import { DocsShell, type DocsNavEntry } from '@nanisoft/prism-ui/pages';

import { StatusNote } from '@/components/status-note';
import { getMdxComponents } from '@/lib/mdx-components';
import { docsSource } from '@/lib/source';
import { toPrismTree } from '@/lib/to-prism-tree';

// Optional catch-all: `/docs` renders the section index, `/docs/<slug>` the
// page. The optional root keeps the static export satisfiable even while a
// section is empty (Next requires every dynamic route to emit at least one
// page under `output: export`).

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export function generateStaticParams(): Array<{ slug?: string[] }> {
  // The root entry (`/docs`) is required under `output: export` for an
  // optional catch-all.
  return [{ slug: undefined }, ...docsSource.generateParams()];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return {
      title: 'Docs',
      description:
        'Concepts, architecture, configuration, operations, guides, and reference for the Agent Factory.',
    };
  }
  const page = docsSource.getPage(slug);
  if (!page) return {};
  return { title: page.data.title, description: page.data.description };
}

/** The six docs sections, for the `/docs` landing. */
const SECTIONS = [
  {
    title: 'Concepts',
    url: '/docs/concepts',
    blurb: 'The factory model, worker containers, orchestration, the Kanban, multi-project.',
  },
  {
    title: 'Architecture',
    url: '/docs/architecture',
    blurb: 'The five components, the worker lifecycle, and every failure path.',
  },
  {
    title: 'Configuration',
    url: '/docs/configuration',
    blurb: 'One YAML file per project, the factories/ layout, secrets, rootless Docker.',
  },
  {
    title: 'Operations',
    url: '/docs/operations',
    blurb: 'Docker Compose deployment, and the four-layer testing strategy.',
  },
  {
    title: 'Guides',
    url: '/docs/guides',
    blurb: 'Writing an issue the factory can build, and reviewing the work it returns.',
  },
  {
    title: 'Reference',
    url: '/docs/reference',
    blurb: 'The design-stage configuration schema, and the factory glossary.',
  },
] as const;

export default async function DocsPage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  // `/docs` — the section index, carrying the standing status note.
  if (!slug) {
    return (
      <div className="site-catalog">
        <p className="site-eyebrow">nanisoft · nexus — docs</p>
        <h1 className="site-catalog__title">Nexus documentation</h1>
        <p className="site-catalog__lede">
          The Agent Factory: what it is, how it is built, and how to work with it. Six sections,
          each tracing to the design.
        </p>
        <StatusNote />
        <div className="site-catalog__grid">
          {SECTIONS.map((section) => (
            <Link className="site-catalog__item" href={section.url} key={section.title}>
              <strong>{section.title}</strong>
              <span>{section.blurb}</span>
            </Link>
          ))}
        </div>
        <p className="site-catalog__start">
          New here? Start with <Link href="/docs/introduction">Introduction</Link>.
        </p>
      </div>
    );
  }

  const page = docsSource.getPage(slug);
  if (!page) notFound();

  const tree = docsSource.getPageTree();
  const neighbour = findNeighbour(tree, page.url);
  const MDX = page.data.body;

  return (
    <DocsShell
      title={page.data.title}
      description={page.data.description}
      nav={toPrismTree(tree.children)}
      toc={page.data.toc ? toTocEntries(page.data.toc) : undefined}
      neighbours={{
        previous: neighbour.previous && { title: String(neighbour.previous.name), url: neighbour.previous.url },
        next: neighbour.next && { title: String(neighbour.next.name), url: neighbour.next.url },
      }}
    >
      <div className="site-prose">
        <StatusNote />
        <MDX components={getMdxComponents()} />
      </div>
    </DocsShell>
  );
}

/** fumadocs TOC → prism-ui nav entries (h2–h3 only). */
function toTocEntries(toc: Array<{ title: unknown; url: string; depth: number }>): DocsNavEntry[] {
  return toc
    .filter((entry) => entry.depth >= 2 && entry.depth <= 3)
    .map((entry, index) => ({
      id: `${entry.url}-${index}`,
      title: typeof entry.title === 'string' ? entry.title : '',
      url: entry.url,
    }));
}
