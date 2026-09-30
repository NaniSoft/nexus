import type { ReactNode } from 'react';

import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { SiteNavbar } from '@nanisoft/prism-ui/blocks/site-navbar';

import { BAR_DEFAULT_MODE, BAR_DEFAULT_PACK, BAR_PRODUCT, COPY, NAV, SITES } from '@/lib/bar';

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
 * The footer keeps the brand lockup, the two grouped destinations and the legal line,
 * and loses its `social` list: GitHub was a column link and a social link at once,
 * which is one destination wearing two controls, and the smoke test asserts the columns
 * rather than the social list.
 */
export type SiteSection = '/docs' | '/blog' | '/about';

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
        product={BAR_PRODUCT}
        defaultPack={BAR_DEFAULT_PACK}
        defaultMode={BAR_DEFAULT_MODE}
        navLabel={COPY.nav}
        sticky
        mobileLabels={{ open: COPY.menuOpen, close: COPY.menuClose }}
        nav={NAV.map((link) => ({ ...link, current: current === link.href }))}
        sitesLabel={COPY.sites}
        currentSiteId={BAR_PRODUCT.id}
        sites={SITES}
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
        product={BAR_PRODUCT}
        columns={[
          {
            title: 'Site',
            links: [
              { label: 'Landing', href: '/' },
              { label: 'Docs', href: '/docs' },
              { label: 'Blog', href: '/blog' },
              { label: 'About', href: '/about' },
            ],
          },
          {
            title: 'Elsewhere',
            links: [
              { label: 'GitHub', href: 'https://github.com/NaniSoft/nexus' },
              { label: 'www.nanisoft.com', href: 'https://www.nanisoft.com' },
            ],
          },
        ]}
        legal="© NaniSoft"
      />
    </>
  );
}
