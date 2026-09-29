import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { BlogPostPage } from '@nanisoft/prism-ui/pages';

import { SiteChrome } from '@/components/site-chrome';
import { StatusNote } from '@/components/status-note';
import { getMdxComponents } from '@/lib/mdx-components';
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
 * The blog index, which is this site's own and stays that way.
 *
 * The design system deliberately ships no blog index Page: the four blog lists in this
 * family are four deliberate designs, and flattening them into one is the reason the
 * item was cut. So the index is site content over site classes, the four launch posts
 * keep this site's own list, and the post screen behind each title is the design
 * system's own Page, which owns the byline, the date in both its display and its
 * machine form, and the trail to the neighbouring posts.
 *
 * Two things changed and neither is the design. The eyebrow above the title read
 * "nanisoft · nexus — blog", the same three elements of one fact the docs index used
 * to carry, and it is gone. The meta line under each post read as a date, then a
 * middle dot, then every tag joined by another one, so a three-tag post carried three
 * separators on one line and the line read as a sentence with a date in it. The date
 * and the tags are now two rows in one band, with the gap between them doing the work
 * a glyph was doing, and a tag is a tag rather than a fragment of a list.
 */
function BlogIndex(): ReactElement {
  const posts = published();
  return (
    <div className="site-catalog">
      <h1 className="site-catalog__title">The build log</h1>
      <p className="site-catalog__lede">
        Notes from building the Agent Factory: the thesis, the architecture, the feedback
        loop, and the build as it happens.
      </p>
      <ul className="site-blog-list">
        {posts.map((post) => (
          <li key={post.url}>
            <Link href={post.url} className="site-blog-list__title">
              {post.data.title}
            </Link>
            <p className="site-blog-list__description">{post.data.description}</p>
            <p className="site-blog-list__meta">
              <time dateTime={post.data.date}>{post.data.date}</time>
              {post.data.tags.length > 0 && (
                <span className="site-blog-list__tags">
                  {post.data.tags.map((tag) => (
                    <span className="site-blog-list__tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
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

  return (
    <SiteChrome current="/blog">
      <BlogPostPage
        title={page.data.title}
        description={page.data.description}
        date={page.data.date}
        dateTime={page.data.date}
        tags={page.data.tags.map((label) => ({ label }))}
        trailLabels={TRAIL_LABELS}
        trailLabel="Build log"
        previous={previous && { title: previous.data.title, href: previous.url }}
        next={next && { title: next.data.title, href: next.url }}
      >
        <StatusNote />
        <div className="site-prose-table">
          <MDX components={getMdxComponents()} />
        </div>
      </BlogPostPage>
    </SiteChrome>
  );
}
