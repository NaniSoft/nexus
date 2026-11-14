import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { ContentGrid01 } from '@nanisoft/prism-ui/blocks/content-grid-01';
import { BlogPostPage } from '@nanisoft/prism-ui/pages';

import { JsonLd } from '@/components/json-ld';
import { SiteChrome } from '@/components/site-chrome';
import { StatusNote } from '@/components/status-note';
import { getMdxComponents } from '@/lib/mdx-components';
import { displayDate, isoDate } from '@/lib/post-date';
import { blogSource } from '@/lib/source';

// Optional catch-all: `/blog` renders the reverse-chronological index,
// `/blog/<slug>` the post. The optional root keeps the static export
// satisfiable; drafts are excluded from params, the index, and prev/next —
// they cannot be reached.

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

function published() {
  return blogSource
    .getPages()
    .filter((post) => !post.data.draft)
    .sort((a, b) => (a.data.date < b.data.date ? 1 : -1));
}

export function generateStaticParams(): Array<{ slug?: string[] }> {
  // The root entry (`/blog`) is required under `output: export` for an
  // optional catch-all.
  return [{ slug: undefined }, ...published().map((post) => ({ slug: post.slugs }))];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return {
      title: 'Blog',
      description: 'Notes from building the Agent Factory: the design, the loop, and the build as it happens.',
      alternates: { canonical: '/blog' },
    };
  }
  const page = blogSource.getPage(slug);
  if (!page) return {};
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
  };
}

/** The two words the post's trail renders above the neighbouring posts' titles. */
const TRAIL_LABELS = { previous: 'Previous', next: 'Next' } as const;

/**
 * The blog index, composed from the design system and nothing else.
 *
 * The design system ships no blog index Page, but the question this page answers
 * is the one `ContentGrid01` was drawn for: a reader is choosing which post to
 * open, and the grid is the arrangement in which a set of dated entries is
 * compared at once. The four launch posts are its entries: title, summary, the
 * date as the reader reads it, and the words on the link. The post screen
 * behind each title remains the design system's own Page, which owns the
 * byline, the date in both its display and its machine form, the tags, and the
 * trail to the neighbouring posts.
 *
 * The eyebrow above the title read "nanisoft · nexus, blog", the same three
 * elements of one fact the docs index used to carry, and it is gone. The tags
 * were a middot-joined run after the date, which read as a sentence with
 * punctuation in it, so they now live where the post screen already carries
 * them, on the post itself.
 *
 * **The date printed here is the display reading, and it used to be the
 * frontmatter's own value.** `lib/post-date.ts` is where the pair lives, and
 * the post screen below is handed both: `dateTime` is the machine value and
 * the heading is the reading. An entry's `at` is the string the reader reads.
 */
function BlogIndex(): ReactElement {
  const posts = published();
  return (
    <ContentGrid01
      headingLevel="h1"
      title="The build log"
      description="Notes from building the Agent Factory: the thesis, the architecture, the feedback loop, and the build as it happens."
      variant="rows"
      entries={posts.map((post) => ({
        id: post.url,
        title: post.data.title,
        summary: post.data.description,
        at: displayDate(post.data.date),
        href: post.url,
        hrefLabel: `Read ${post.data.title}`,
      }))}
    />
  );
}

export default async function BlogPage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  if (!slug) {
    return (
      <SiteChrome current="/blog">
        <BlogIndex />
      </SiteChrome>
    );
  }

  const page = blogSource.getPage(slug);
  if (!page || page.data.draft) notFound();

  // Chronological prev/next across published posts.
  const chronological = [...published()].reverse();
  const index = chronological.findIndex((post) => post.url === page.url);
  const previous = index > 0 ? chronological[index - 1] : undefined;
  const next = index >= 0 && index < chronological.length - 1 ? chronological[index + 1] : undefined;

  const MDX = page.data.body;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: page.data.title,
    description: page.data.description,
    datePublished: isoDate(page.data.date),
    inLanguage: 'en',
    url: `https://nexus.nanisoft.com${page.url}`,
    mainEntityOfPage: `https://nexus.nanisoft.com${page.url}`,
    author: { '@type': 'Organization', name: 'NaniSoft', url: 'https://nanisoft.com' },
    publisher: { '@type': 'Organization', name: 'NaniSoft', url: 'https://nanisoft.com' },
  };

  return (
    <SiteChrome current="/blog">
      <JsonLd data={jsonLd} />
      <BlogPostPage
        title={page.data.title}
        description={page.data.description}
        date={displayDate(page.data.date)}
        dateTime={isoDate(page.data.date)}
        tags={page.data.tags.map((label) => ({ label }))}
        trailLabels={TRAIL_LABELS}
        trailLabel="Build log"
        previous={previous && { title: previous.data.title, href: previous.url }}
        next={next && { title: next.data.title, href: next.url }}
      >
        <>
          <StatusNote />
          <MDX components={getMdxComponents()} />
        </>
      </BlogPostPage>
    </SiteChrome>
  );
}
