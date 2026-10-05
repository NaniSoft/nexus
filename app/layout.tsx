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

// The typeface is the design system's, and this file loads none.
//
// `@nanisoft/prism-ui/styles.css` ships the four `@font-face` rules and the woff2
// binaries behind them beside the `--font-sans` token that names Inter, so importing
// the one stylesheet is importing the face. This site used to supply its own Inter
// through `next/font/google` back when the pinned package shipped none, and the
// supply outlived its reason: it downloaded 214 KB of a typeface the design system
// already ships, and it needed the `:root { --font-sans: ... }` override in
// `app/globals.css` to be the family that won, which is a second answer to a
// question the design system already answers. Both are gone. Nothing downstream of
// this import loads Inter.

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
 *
 * **The attributes are the only thing spread on `<html>`, and nothing beside them
 * names a `className`.** `themeAttributes()` returns the mode as `className`, and a
 * spread does not merge with a named prop: whichever is written last wins outright, so
 * a second `className` on this element silently replaces the mode class or is
 * silently replaced by it, and neither is an error at build. This site lost its font
 * to exactly that race once, when the font's own class was written here and the mode
 * took it. Nothing else needs a `className` on the document element now, so the
 * element carries the spread and nothing else.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...THEME_ATTRIBUTES} suppressHydrationWarning>
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
