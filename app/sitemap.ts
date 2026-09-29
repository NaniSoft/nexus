import type { MetadataRoute } from 'next';

import { blogSource, docsSource } from '@/lib/source';

/**
 * `sitemap.xml` is a file, not a request this site answers, so it is stated static.
 * Under `output: export` Next refuses to emit a metadata route it cannot prove is
 * static, and the proof it asks for is this line rather than an inference.
 */
export const dynamic = 'force-static';

/**
 * The map a crawler is given, built from the corpus rather than written out.
 *
 * A hand-written sitemap is a list that starts rotting the day a document is added,
 * and this one cannot: every documentation route and every post comes out of the
 * same loaders the pages themselves are built from, so a page that exists is a row
 * and a row that exists is a page. The four chrome routes are declared here because
 * they are four decisions rather than four derived facts.
 *
 * The posts carry their own published date as their last modification, because it is
 * the one date this site publishes. A documentation route carries none at all: a
 * `lastModified` on a document is the day it was last edited, and a sitemap that
 * asserts it is a claim the build cannot keep true between two runs that change
 * nothing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = 'https://nexus.nanisoft.com';

  const chrome: MetadataRoute.Sitemap = [
    { url: `${origin}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${origin}/docs`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${origin}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${origin}/about`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const docs: MetadataRoute.Sitemap = docsSource
    .getPages()
    .map((page) => ({ url: `${origin}${page.url}`, changeFrequency: 'monthly' as const }));

  const blog: MetadataRoute.Sitemap = blogSource
    .getPages()
    .filter((post) => !post.data.draft)
    .map((post) => ({
      url: `${origin}${post.url}`,
      lastModified: new Date(post.data.date),
      changeFrequency: 'monthly' as const,
    }));

  return [...chrome, ...docs, ...blog];
}
