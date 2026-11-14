import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { ContentGrid01 } from '@nanisoft/prism-ui/blocks/content-grid-01';
import { Prose } from '@nanisoft/prism-ui/components/prose';
import { Section } from '@nanisoft/prism-ui/components/section';
import { DocsShell } from '@nanisoft/prism-ui/pages';

import { SiteChrome } from '@/components/site-chrome';
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
      alternates: { canonical: '/docs' },
    };
  }
  const page = docsSource.getPage(slug);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
  };
}

/**
 * The six docs sections, for the `/docs` index.
 *
 * The blurbs are one line each and they are the reader's whole route into 27
 * documents, so each one names what the section covers rather than how interesting
 * it is. Three of them used to end in a clause behind an em-dash, which is the same
 * trick the section titles were using and the same reason it is not used here.
 */
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
 * The section index, composed from the design system and nothing else.
 *
 * The catalogue ships no documentation index Page, but it does ship the arrangement
 * a reader is choosing in, and choosing is the question this page answers: that is
 * `ContentGrid01` in its `cards` form, three columns, with the six sections as
 * its entries. The copy, the six blurbs and the starting point are this site's
 * content over the system's arrangement, and the twenty-seven documents behind
 * them are the design system's own screen.
 *
 * The standing status note sits in its own compact band below the grid, because
 * the grid is a `Section` with a container of its own and the note needs the
 * same one. The starting point is plain prose with a link, which is what prose
 * is for.
 *
 * The eyebrow above the title is gone. It read "nanisoft · nexus, docs", which
 * is the header's wordmark with a separator on each side and this page's own
 * name again, so three elements of one fact above a heading that already says
 * what the page is.
 */
function DocsIndex(): ReactElement {
  return (
    <>
      <ContentGrid01
        headingLevel="h1"
        title="Nexus documentation"
        description="The Agent Factory: what it is, how it is built, and how to work with it. Six sections, each tracing to the design."
        variant="cards"
        columns={3}
        entries={SECTIONS.map((section) => ({
          id: section.url,
          title: section.title,
          summary: section.blurb,
          href: section.url,
          hrefLabel: `Read ${section.title}`,
        }))}
      />
      <Section size="compact">
        <StatusNote />
        <Prose className="mt-10">
          <p>
            New here? Start with <a href="/docs/introduction">Introduction</a>.
          </p>
        </Prose>
      </Section>
    </>
  );
}

export default async function DocsPage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  if (!slug) {
    return (
      <SiteChrome current="/docs">
        <DocsIndex />
      </SiteChrome>
    );
  }

  const page = docsSource.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <SiteChrome current="/docs">
      <DocsShell
        title={page.data.title}
        description={page.data.description}
        nav={toPrismTree(docsSource.getPageTree().children)}
        toc={page.data.toc ? toContents(page.data.toc) : undefined}
        currentHref={page.url}
        {...SHELL_LABELS}
      >
        <>
          <StatusNote />
          <MDX components={getMdxComponents()} />
        </>
      </DocsShell>
    </SiteChrome>
  );
}
