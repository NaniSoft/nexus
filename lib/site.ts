/**
 * The site's own facts, read from `site.json` and typed by the design system's
 * vocabulary.
 *
 * Three decisions live here and nowhere else, which is why they are one module:
 * the page's ground pack, the mode a visitor who has never chosen gets, and the set
 * of products the switcher moves between. The old line kept the same three facts in
 * about twenty lines of theme module, and patching that module one import at a time
 * passed a read-through and failed a build. It is deleted.
 *
 * **The ground is `lavender` and it does not change.** A page's ground is stable for
 * the life of the page; it is a property of the page, not of the reader. It is
 * applied declaratively on the document element and never read back, so a stored
 * theme can repaint the page's marks and its mode and cannot repaint the ground out
 * from under a section that is not a boundary.
 *
 * The pack vocabulary is Prism's, so `pack` below is a compile error rather than a
 * string that matches no emitted rule. A pack identifier that resolves to nothing
 * inherits the ground silently, and a page that shows the ground's colour while
 * claiming a product's is the exact failure the catalogue's marks exist to remove.
 */
import { PACKS, themeAttributes, type Mode, type PackId } from '@nanisoft/prism-ui/theming';
import type { SwitcherProduct } from '@nanisoft/prism-ui/components/product-switcher';

import site from './site.json';

/** Every pack the token build emits, so a mistyped id fails here rather than silently. */
const PACK_IDS: readonly string[] = PACKS;

function pack(value: string): PackId {
  if (!PACK_IDS.includes(value)) {
    throw new Error(
      `site.json: "${value}" is not one of the published packs (${PACK_IDS.join(', ')}), so a mark ` +
        'carrying it would match no emitted rule and would paint the ground instead.',
    );
  }
  return value as PackId;
}

/** The pack the whole page sits on. See the note above: a ground does not change. */
export const GROUND_PACK: PackId = pack(site.ground);

/** What a reader who has never chosen a theme sees. Dark, the platform precedent. */
export const DEFAULT_MODE = site.defaultMode as Mode;

/**
 * The two attributes that carry the theme, for the document element.
 *
 * Spread onto `<html>` and the whole page is themed with no client runtime at all: no
 * provider, no context, no hook, no class swap. That is the declarative form the
 * design system documents as the default, and it is why the old line's mode
 * provider, its pack class and its baked variable rulesets are all gone rather than
 * reimplemented. The boot script reads the document's own attributes first, so what
 * the server rendered and what the reader stored cannot disagree about the mode.
 */
export const THEME_ATTRIBUTES = themeAttributes({ pack: GROUND_PACK, mode: DEFAULT_MODE });

/** The product this site is, as the mark the chrome draws it with. */
export const SITE_PRODUCT = {
  id: site.siteId,
  name: 'Nexus',
  pack: GROUND_PACK,
} as const;

/**
 * The set of products the switcher moves between, in the order a reader meets them.
 *
 * This site is one member of a set of five, so the switcher carries all five rather
 * than only the siblings: a set of four that omits the page you are on is a set that
 * has to be re-derived every time the family changes, and the mark that marks the
 * current one is the switcher's own job. This site's own mark wears `lavender`,
 * which is also the page's ground, so its boundary in the switcher is the ground and
 * not a second claim about it; the other four are four of the five packs.
 *
 * The directory is a JSON file rather than a list in this module, because two
 * independent readers need it and a TypeScript module is not one of them: the test
 * imports it, and `scripts/check-pack-map.mjs` reads the file the same way it reads
 * the pack map it is checked against.
 */
export const PRODUCTS: readonly SwitcherProduct[] = site.products.map((product) => ({
  id: product.id,
  name: product.name,
  pack: pack(product.pack),
  href: product.href,
}));

/**
 * One product of the directory, as the landing's product rows read it.
 *
 * A row is four facts about a product and all four come from the directory, so a row
 * cannot draw a mark in a pack the directory does not hold and cannot print a name the
 * directory does not spell. An identifier the directory has lost is a build error
 * rather than a fallback: the old page fell back to the ground pack, and a mark painted
 * in the ground is a mark that looks correct and means nothing, which is the one
 * reading this migration exists to stop being possible.
 */
export function product(productId: string): {
  id: string;
  name: string;
  pack: PackId;
  tagline: string;
  href: string;
} {
  const found = site.products.find((entry) => entry.id === productId);
  if (!found) {
    throw new Error(
      `site.json: the product directory has no "${productId}", so a row that named it would draw a mark in ` +
        `the ground pack and a link to nowhere. The directory holds ${site.products.map((p) => p.id).join(', ')}.`,
    );
  }
  return { id: found.id, name: found.name, pack: pack(found.pack), tagline: found.tagline, href: found.href };
}
