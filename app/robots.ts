import type { MetadataRoute } from 'next';

/**
 * `robots.txt` is a file, not a request this site answers, so it is stated static.
 * Under `output: export` Next refuses to emit a metadata route it cannot prove is
 * static, and the proof it asks for is this line rather than an inference.
 */
export const dynamic = 'force-static';

/**
 * What a crawler is told, and the one honest thing about this site's indexation.
 *
 * Everything published here is public and every page is a static address, so there
 * is nothing to disallow. The sitemap is named rather than left to be found, because
 * a sitemap nobody links to is a sitemap a crawler has to guess the location of.
 *
 * There is no `Disallow` line and that is a decision rather than an omission. The
 * site has no search, no account, no query string that means anything to a reader,
 * and no page whose presence in an index would be a claim the site is not making.
 * Writing a rule here to look thorough would be a rule about a site this one is not.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://nexus.nanisoft.com/sitemap.xml',
    host: 'https://nexus.nanisoft.com',
  };
}
