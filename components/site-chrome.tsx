import type { ReactNode } from 'react';

import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { SiteNavbar } from '@nanisoft/prism-ui/blocks/site-navbar';
import { AlphaLensMark, AtlasMark, NaniSoftMark, PrismMark } from '@nanisoft/prism-ui/components/product-marks';

import { BAR_DEFAULT_MODE, BAR_DEFAULT_PACK, BAR_PRODUCT, COPY, NAV, SITES } from '@/lib/bar';
import { NexusLogo } from '@/components/logo';

/**
 * The chrome, in one place, and the reason it is not in the root layout.
 *
 * **A server render knows the route; a root layout does not.** `SiteNavLink` carries
 * a `current` flag and the Block renders it as `aria-current="page"`, and the only
 * thing that knows which of this site's three destinations a page is serving is the
 * page. A layout is rendered once per route and is handed no pathname, so a bar that
 * lives in the layout can never mark the reader's place, and a site navigation that
 * never says where you are is a navigation a screen reader cannot use. So the chrome
 * moved down one level: every page renders `<SiteChrome current="…">`, the flag is a
 * prop, and nothing became a client component to get it. `test/server-only.test.ts` is
 * the assertion that this stayed free, and the answer to the question that file asks
 * is this one: the client would need a pathname, and the server already has one.
 *
 * **The bar is the design system's, and its client boundary is inside the package.**
 * Search, the menu of the family's five sites, the light and dark control and the
 * panel below the row's threshold are four pieces of reader state, and they are one
 * client island in `@nanisoft/prism-ui` rather than a line in this repository. So this
 * site still declares no `'use client'` anywhere, which is what lets the bar arrive
 * without costing this repository the property it is built around.
 *
 * **The family moved out of the navigation row and into a menu.** It used to be passed
 * as `products`, which put a five-name product family between the brand lockup and the
 * three things a reader can actually do on this site, in brand ink, ahead of a
 * navigation in muted ink: the loudest thing in the bar was the one that leads
 * somewhere else. It had already moved once, out of `products` and into `actions`,
 * because a set of external destinations is a control a product owns rather than part
 * of this site's own navigation; it is now a named menu at the same end of the row,
 * which is the arrangement the design system settled on for all five sites.
 *
 * `sticky` is on. The landing is nine bands of `Section` with the design system's own
 * section padding, so a bar that scrolls away takes the reader's only persistent way
 * back to the docs with it.
 *
 * The footer keeps the brand lockup, the two grouped destinations and the legal
 * line, and loses its `social` list: GitHub was a column link and a social link at
 * once, which is one destination wearing two controls. The two groups are now the
 * family's shared pair, this site's own destinations and the rest of the family,
 * which is the arrangement all five footers hold: one question per column, and the
 * same two questions at the foot of every site in the set.
 */
export type SiteSection = '/docs' | '/blog' | '/about';

/*
 * The product, as the chrome draws it: the same three facts the bar and the
 * footer have always read, plus the drawing. The mark is this site's own logo,
 * and it is the sign in the row, in the mobile panel and at the foot of the
 * page from this one fact, so a reader meets one sign three times rather than
 * a disc twice and a drawing once.
 */
const PRODUCT = { ...BAR_PRODUCT, mark: <NexusLogo className="site-product-mark" /> };

/**
 * The family's marks, as the bar's sites menu draws them.
 *
 * The directory in `lib/site.json` carries each product's id, name, pack and
 * destination, and not its drawing: a JSON file cannot hold a React node. The
 * drawings live here beside the mark this bar already draws for its own product,
 * so the menu shows each member's own logo rather than the two-colour disc.
 */
const SITE_MARKS: Record<string, ReactNode> = {
  www: <NaniSoftMark className="site-product-mark" />,
  nexus: <NexusLogo className="site-product-mark" />,
  atlas: <AtlasMark className="site-product-mark" />,
  alphalens: <AlphaLensMark className="site-product-mark" />,
  prism: <PrismMark className="site-product-mark" />,
};

/** The family, with each member's drawn mark attached to its directory entry. */
const SITES_WITH_MARKS = SITES.map((site) => ({ ...site, mark: SITE_MARKS[site.id] }));

export function SiteChrome({
  current,
  children,
}: {
  /** The destination this page is serving, so the bar can mark the reader's place. */
  current?: SiteSection;
  children: ReactNode;
}): ReactNode {
  return (
    <>
      <SiteNavbar
        product={PRODUCT}
        defaultPack={BAR_DEFAULT_PACK}
        defaultMode={BAR_DEFAULT_MODE}
        navLabel={COPY.nav}
        sticky
        mobileLabels={{ open: COPY.menuOpen, close: COPY.menuClose }}
        nav={NAV.map((link) => ({ ...link, current: current === link.href }))}
        sitesLabel={COPY.sites}
        currentSiteId={BAR_PRODUCT.id}
        sites={SITES_WITH_MARKS}
        search={{
          indexUrl: '/api/search',
          label: COPY.search,
          hint: COPY.searchHint,
          messages: {
            close: COPY.searchClose,
            loading: COPY.searchLoading,
            failed: COPY.searchFailed,
            empty: COPY.searchEmpty,
            one: COPY.searchOne,
            other: COPY.searchOther,
          },
        }}
        mode={{ lightLabel: COPY.toDark, darkLabel: COPY.toLight }}
      />
      <main className="site-main">{children}</main>
      <SiteFooter
        product={PRODUCT}
        about={
          // The one sentence a reader who reached the bottom has not been told
          // yet, in this site's own words from its own lede, under the page's
          // claim in the ink of the brand.
          <div className="site-footer-about">
            <p className="site-footer-tagline">Industrializing software delivery with AI agents.</p>
            <p>Nexus is the Agent Factory: one issue in, one reviewed pull request out.</p>
          </div>
        }
        columns={[
          {
            title: 'This site',
            links: [
              { label: 'Landing', href: '/' },
              { label: 'Docs', href: '/docs' },
              { label: 'Blog', href: '/blog' },
              { label: 'About', href: '/about' },
            ],
          },
          {
            // The family, read from the same directory the bar's menu reads,
            // minus the member the reader is already on. Every site in the
            // family holds this same column to this same rule, so the foot of
            // one site answers the same question the foot of every other one
            // does: where else does this company go.
            title: 'The family',
            links: SITES.filter((site) => site.id !== BAR_PRODUCT.id).map((site) => ({
              label: site.name,
              href: site.href,
              newTab: true,
            })),
          },
        ]}
        legal="© NaniSoft"
      />
    </>
  );
}
