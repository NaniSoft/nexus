// Headless MDX component mapping (fumadocs-core headless: the site owns the
// HTML). Nexus writes no custom MDX components — prose elements are plain HTML
// styled by `.site-prose`. The hook stays so pages have one place to add a
// mapping later without touching the loader.

import type { ComponentType } from 'react';

type MdxComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

/** Merge extra mappings into the site's base component map. */
export function getMdxComponents(extra?: MdxComponentMap): MdxComponentMap {
  return { ...extra };
}
