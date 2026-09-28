import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { DocsShell } from '@nanisoft/prism-ui/pages';

import { StatusNote } from '@/components/status-note';
import { getMdxComponents } from '@/lib/mdx-components';
import { docsSource } from '@/lib/source';
import { toContents, toPrismTree } from '@/lib/to-prism-tree';

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

/** The six docs sections, for the `/docs` index. */
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

/**
 * The four words a reader hears for the documentation screen's four regions.
 *
 * The design system requires all four and ships none, because a Page that ships no
 * copy ships no reader-facing copy either. Three of them are names this site already
 * publishes: the rail is the documentation this site links to as "Docs", and the
 * pager moves between pages. "Contents" is the one new word, and it is the shortest
 * name the region has: it is the headings of the page the reader is already on, and
 * naming it anything longer would be a claim the rail does not make.
 */
const SHELL_LABELS = {
  navLabel: 'Docs',
  tocLabel: 'Contents',
  pagerLabel: 'Pages',
  pagerLabels: { previous: 'Previous', next: 'Next' },
} as const;

/**
 * The section index, which is this site's own and not the design system's.
 *
 * The catalogue deliberately ships no documentation index Page, for the same reason it
 * ships no blog index: a Page is judged on what it encodes, and a section catalogue
 * encodes this site's information architecture. So the copy, the six blurbs and the
 * starting point are site content over site classes, and the twenty-seven documents
 * behind them are the design system's own screen.
 */
function DocsIndex(): ReactElement {
  return (
    <div className="site-catalog">
      <p className="site-eyebrow">nanisoft · nexus — docs</p>
      <h1 className="site-catalog__title">Nexus documentation</h1>
      <p className="site-catalog__lede">
        The Agent Factory: what it is, how it is built, and how to work with it. Six sections, each
        tracing to the design.
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

export default async function DocsPage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  if (!slug) return <DocsIndex />;

  const page = docsSource.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsShell
      title={page.data.title}
      description={page.data.description}
      nav={toPrismTree(docsSource.getPageTree().children)}
      toc={page.data.toc ? toContents(page.data.toc) : undefined}
      currentHref={page.url}
      {...SHELL_LABELS}
    >
      <div className="site-prose-table">
        <StatusNote />
        <MDX components={getMdxComponents()} />
      </div>
    </DocsShell>
  );
}
