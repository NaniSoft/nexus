import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { PrismThemeScript } from '@nanisoft/prism-ui/provider';

import { DEFAULT_MODE, GROUND_PACK, THEME_ATTRIBUTES } from '@/lib/site';

// The one stylesheet. Every token, every utility and every base rule on this site
// arrives in this one import: the design system compiles its own source into it, and
// a consumer adds its own sheet after it and nothing else.
import '@nanisoft/prism-ui/styles.css';
import './globals.css';

/**
 * What the document says about the site, once.
 *
 * The title, the description and the social cards are set here because they are
 * facts about the site rather than about a page, and a page's own metadata merges
 * over them. `openGraph` and `twitter` are here for the same reason and were
 * missing: a link pasted into a chat window rendered as bare text, and the two
 * cards are the one place a reader meets this site before they meet it.
 *
 * The canonical URL is deliberately not here. `metadataBase` resolves a relative
 * canonical against the origin, and a canonical is a claim about one address, so
 * each route declares its own rather than the document declaring one for all of
 * them.
 */
export const metadata: Metadata = {
  metadataBase: new URL('https://nexus.nanisoft.com'),
  title: {
    default: 'Nexus, software that builds software',
    template: '%s · Nexus',
  },
  description:
    'Nexus is the Agent Factory. A coding agent takes a GitHub issue and returns a reviewed, merged pull request. In active development, and the design is public.',
  applicationName: 'Nexus',
  openGraph: {
    type: 'website',
    siteName: 'Nexus',
    locale: 'en',
  },
  twitter: {
    card: 'summary',
  },
};

// The design system's own first family, and the only font file this site loads.
//
// `--font-sans` in prism's emitted sheet reads `Inter, ui-sans-serif, system-ui, ...`.
// Naming a family is not shipping it, so a site that loads nothing renders in the
// platform's UI face, which is the one face a design system never means by its first
// choice. The fallback list prism declares is kept verbatim behind this one, so
// nothing about the design system's intent changes; the only difference is that its
// first entry is now a file rather than a name.
//
// The typeface is not this site's to choose. The design system declares Inter as the
// first family of its own token, and a site that substituted a different file would be
// overriding a decision four repositories share, in the one repository whose job is
// to publish the design rather than to argue with it. The file is therefore supplied,
// not selected.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * The document: the two theme attributes, one blocking script, and the page.
 *
 * **No provider, no client runtime, no baked stylesheet, and no chrome.** The old
 * layout mounted a theme provider, registered a style registry for a component
 * library that no longer exists, loaded 126 KB of generated variables to define the
 * sixty custom properties the site's own CSS read, and carried the header and footer
 * itself. The theme is two attributes on the document element and a blocking script
 * that applies a stored choice to them before first paint, which is the arrangement the
 * design system documents as the default: a server render, no client JavaScript, and a
 * page that is correct with scripting disabled.
 *
 * The chrome moved to `components/site-chrome.tsx` and is rendered by each page rather
 * than declared here, because a header that cannot be told which page it is on cannot
 * mark the reader's place, and a layout is not told. That file states the argument in
 * full; this one only records that the answer was not a client component.
 *
 * The two labels the header takes are names a reader hears, and they are deliberately
 * not the same: a page with two navigation landmarks of one name is a page a reader
 * navigating by landmark cannot tell apart. The header's own navigation is the "Site"
 * its footer already groups under, and the switcher is the set of products it moves
 * between.
 */
// The theme's two attributes, and the font's one class name, are both a `className`.
// `themeAttributes` returns `className` for the mode, and a spread after a named prop
// replaces it rather than merging it, so writing `className={inter.variable}` and then
// spreading the attributes drops the font class and keeps the mode. The page then
// renders in the platform's UI face with no error anywhere: the woff2 subsets are
// preloaded, the `@font-face` rules ship, and the class that declares
// `--font-inter` is on no element, so `--font-sans` is invalid at computed-value time
// and the whole first family of the design system resolves to nothing. That is the
// same failure the dead-alias assertion in the stylesheet-ownership gate in `@nanisoft/prism-ui/gates`
// is about, arrived at from the other end, and the gate checks it from the export.
export const HTML_CLASS = [inter.variable, THEME_ATTRIBUTES.className].filter(Boolean).join(' ');

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...THEME_ATTRIBUTES} className={HTML_CLASS} suppressHydrationWarning>
      <head>
        {/* Before paint, on the same attributes the server rendered: a stored choice
            is applied and a stored value that no longer parses is left in place, so
            nothing a reader chose is ever cleared by this site. */}
        <PrismThemeScript defaultPack={GROUND_PACK} defaultMode={DEFAULT_MODE} />
      </head>
      <body>{children}</body>
    </html>
  );
}
