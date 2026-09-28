import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { SiteHeader } from '@nanisoft/prism-ui/blocks/site-header';
import { PrismThemeScript } from '@nanisoft/prism-ui/provider';

import {
  DEFAULT_MODE,
  GROUND_PACK,
  PRODUCTS,
  SITE_PRODUCT,
  THEME_ATTRIBUTES,
} from '@/lib/site';

// The one stylesheet. Every token, every utility and every base rule on this site
// arrives in this one import: the design system compiles its own source into it, and
// a consumer adds its own sheet after it and nothing else.
import '@nanisoft/prism-ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://nexus.nanisoft.com'),
  title: {
    default: 'Nexus — software that builds software',
    template: '%s · Nexus',
  },
  description:
    'Nexus is the Agent Factory: a coding agent takes a GitHub issue and returns a reviewed, merged pull request. In active development — the design is public.',
};

// The design system's own first family, and the only font file this site loads.
//
// `--font-sans` in prism's emitted sheet reads `Inter, ui-sans-serif, system-ui, ...`.
// Naming a family is not shipping it: 0.7.0 carries no font file, so a site that
// loads nothing renders in the platform's UI face, which is the one face a design
// system never means by its first choice. The fallback list prism declares is kept
// verbatim behind this one, so nothing about the design system's intent changes; the
// only difference is that its first entry is now a file rather than a name.
//
// The migration dropped this site's Archivo and JetBrains Mono and let the display
// type fall back to the platform face. That was not in the ticket, and it is the most
// visible change the migration made. The typeface belongs to the design system, so a
// site supplies the file the token already names rather than choosing its own.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * The document: the two theme attributes, one blocking script, the chrome, the page.
 *
 * **No provider, no client runtime, no baked stylesheet.** The old layout mounted a
 * theme provider, registered a style registry for a component library that no longer
 * exists, and loaded 126 KB of generated variables to define the sixty custom
 * properties the site's own CSS read. The theme is now two attributes on the document
 * element and a blocking script that applies a stored choice to them before first
 * paint, which is the arrangement the design system documents as the default and the
 * one the whole page is built for: a server render, no client JavaScript, and a page
 * that is correct with scripting disabled.
 *
 * The switcher moves between the five members of the company's product set, so all
 * five pastel packs are on every page rather than on one page of one site. The two
 * labels the Block requires are names a reader hears, and they are deliberately not the
 * same: a page with two navigation landmarks of one name is a page a reader navigating
 * by landmark cannot tell apart. The header's own navigation is the "Site" its footer
 * already groups under, and the switcher is the set of products it moves between.
 *
 * **The navigation is a prop, and omitting it is a silent removal.** The old chrome
 * carried its three destinations itself; this one takes them, and a header with no
 * `nav` is a valid header that renders a brand lockup and nothing else, because one of
 * the family is exactly that. So the destinations are declared here rather than left to
 * the Block, `test/smoke.test.tsx` asserts all three are on the page, and the
 * content-parity comparison caught their absence the first time it ran: the chrome text
 * of all thirty-seven routes lost three lines and nothing else in the build said so.
 */
// The theme's two attributes, and the font's one class name, are both a `className`.
// `themeAttributes` returns `className` for the mode, and a spread after a named prop
// replaces it rather than merging it, so writing `className={inter.variable}` and then
// spreading the attributes drops the font class and keeps the mode. The page then
// renders in the platform's UI face with no error anywhere: the woff2 subsets are
// preloaded, the `@font-face` rules ship, and the class that declares
// `--font-inter` is on no element, so `--font-sans` is invalid at computed-value time
// and the whole first family of the design system resolves to nothing. That is the
// same failure the dead-alias assertion in `scripts/check-stylesheet-ownership.mjs`
// is about, arrived at from the other end, and the gate checks it from the export.
export const HTML_CLASS = [inter.variable, THEME_ATTRIBUTES.className].filter(Boolean).join(' ');

/** This site's own three destinations, in the order the header shows them. */
const NAV = [
  { label: 'Docs', href: '/docs' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
] as const;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...THEME_ATTRIBUTES} className={HTML_CLASS} suppressHydrationWarning>
      <head>
        {/* Before paint, on the same attributes the server rendered: a stored choice
            is applied and a stored value that no longer parses is left in place, so
            nothing a reader chose is ever cleared by this site. */}
        <PrismThemeScript defaultPack={GROUND_PACK} defaultMode={DEFAULT_MODE} />
      </head>
      <body>
        <SiteHeader
          product={SITE_PRODUCT}
          products={PRODUCTS}
          nav={NAV}
          navLabel="Site"
          productsLabel="Products"
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
          social={[{ label: 'GitHub', href: 'https://github.com/NaniSoft/nexus' }]}
          legal="© NaniSoft"
        />
      </body>
    </html>
  );
}
