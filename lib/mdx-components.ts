// Headless MDX component mapping (fumadocs-core headless: the site owns the HTML).
//
// Nexus writes no custom MDX components. The prose elements are plain HTML and the
// design system's own `Prose` holds them to the reading measure and the block
// rhythm, so the only prose rule this site owns is the table hairline, which lives in
// `app/globals.css` under `.site-prose-table`. The hook stays so pages have one place
// to add a mapping later without touching the loader.

import type { ComponentType } from 'react';

type MdxComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

/** Merge extra mappings into the site's base component map. */
export function getMdxComponents(extra?: MdxComponentMap): MdxComponentMap {
  return { ...extra };
}
