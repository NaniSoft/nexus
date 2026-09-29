import type { ReactNode } from 'react';

import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { SiteHeader } from '@nanisoft/prism-ui/blocks/site-header';
import { ProductSwitcher } from '@nanisoft/prism-ui/components/product-switcher';

import { PRODUCTS, SITE_PRODUCT } from '@/lib/site';

/**
 * The chrome, in one place, and the reason it is not in the root layout.
 *
 * **A server render knows the route; a root layout does not.** `SiteHeaderLink`
 * carries a `current` flag and the Block renders it as `aria-current="page"`, and
 * the only thing that knows which of this site's three destinations a page is
 * serving is the page. A layout is rendered once per route and is handed no
 * pathname, so a header that lives in the layout can never mark the reader's
 * place, and a site navigation that never says where you are is a navigation a
 * screen reader cannot use. So the chrome moved down one level: every page
 * renders `<SiteChrome current="…">`, the flag is a prop, and nothing became a
 * client component to get it. `test/server-only.test.ts` is the assertion that
 * this stayed free, and the answer to the question that file asks is this one:
 * the client would need a pathname, and the server already has one.
 *
 * **The product set sits at the right-hand end, after this site's own
 * destinations.** `SiteHeader` renders the bar in the order brand, switcher,
 * navigation, actions, and takes the switcher through `products` while it takes
 * application controls through `actions`. Passing five named products as
 * `products` put a five-name product family between the brand and the three
 * things a reader can actually do, in brand ink, ahead of a navigation in muted
 * ink: the loudest thing in the bar was the one that leads somewhere else. The
 * switcher is a set of external destinations rather than a page control, so it
 * belongs in the slot the Block documents as "the controls a product owns on the
 * right", which the Block already holds at the end of the row with `ms-auto`.
 * Nothing about the set changed: the same five products, the same five marks, the
 * same five packs, and the same `aria-current` on the member the reader is on.
 * `scripts/pack-regions.mjs` names the region from the switcher's own slot rather
 * than from where in the bar it sits, so the pack map did not have to move.
 *
 * `sticky` is on. The landing is nine bands of `Section` with the design system's
 * own section padding, so a header that scrolls away takes the reader's only
 * persistent way back to the docs with it.
 *
 * The footer keeps the brand lockup, the two grouped destinations and the legal
 * line, and loses its `social` list: GitHub was a column link and a social link
 * at once, which is one destination wearing two controls, and the smoke test
 * asserts the columns rather than the social list.
 */
export type SiteSection = '/docs' | '/blog' | '/about';

/** This site's own three destinations, in the order the header shows them. */
const NAV: readonly { label: string; href: SiteSection }[] = [
  { label: 'Docs', href: '/docs' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

export function SiteChrome({
  current,
  children,
}: {
  /** The destination this page is serving, so the header can mark the reader's place. */
  current?: SiteSection;
  children: ReactNode;
}): ReactNode {
  return (
    <>
      <SiteHeader
        product={SITE_PRODUCT}
        nav={NAV.map((link) => ({ ...link, current: current === link.href }))}
        navLabel="Site"
        sticky
        actions={
          <ProductSwitcher products={PRODUCTS} currentId={SITE_PRODUCT.id} label="Products" />
        }
      />
      <main className="site-main">{children}</main>
      <SiteFooter
        product={SITE_PRODUCT}
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
