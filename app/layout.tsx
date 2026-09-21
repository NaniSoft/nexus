import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Chrome via its subpaths — the proven import pattern (prism's own site never
// pulls components from the root barrel: in Next's RSC graph, root-barrel
// components resolve to undefined, found while scaffolding, ticket 05).
import { SiteFooter, SiteHeader } from '@nanisoft/prism-ui/blocks';
import { PrismThemeModeProvider } from '@nanisoft/prism-ui/provider';
import { prismCssVarKey } from '@nanisoft/prism-tokens';

import { DEFAULT_MODE, DEFAULT_PACK, SITE_ID, themeBootScript } from '@/lib/theme';

// prism-ui's font faces / display width-axis / dither patterns (ADR-0001) —
// the shared visual ground every Nanisoft site stands on.
import '@nanisoft/prism-ui/styles.css';
// Pre-baked antd variable rulesets for this site's pack in both modes
// (scripts/bake-antd-css.mjs), keyed by the prism-<pack>-<mode> cssVar class.
import './antd-vars.css';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  // The width axis IS the refraction (ADR-0001) — wght comes implicitly.
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Nexus — the Agent Factory',
    template: '%s · Nexus',
  },
  description: 'The Agent Factory — autonomous software creation.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={prismCssVarKey(DEFAULT_PACK, DEFAULT_MODE)}>
      <body className={archivo.variable + ' ' + jetbrains.variable}>
        {/* Blocking, before paint: applies the stored (or default) theme class —
            the flash-free half of the class-swap recipe. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <AntdRegistry>
          <PrismThemeModeProvider pack={DEFAULT_PACK} defaultMode={DEFAULT_MODE}>
            <SiteHeader site={SITE_ID} />
            <main className="site-main">{children}</main>
            <SiteFooter site={SITE_ID} />
          </PrismThemeModeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
