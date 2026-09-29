import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';
import { PRODUCTS, SITE_PRODUCT } from '@/lib/site';
import map from '@/scripts/pack-map.json';

/**
 * The pack map, asserted against the composition rather than against a screenshot.
 *
 * `scripts/pack-map.json` is the declaration. the pack-boundary gate in `@nanisoft/prism-ui/gates` reads it
 * from the built export, where it is also checked in both modes against the emitted
 * CSS and against the published token contract. This file reads the same declaration
 * from the DOM, so the two readers cannot drift: a region that gains a pack fails the
 * test here and fails the build there, and a declaration that stops matching what the
 * page renders fails here first.
 *
 * Why it has to be a check and not a review: the failure this rule exists to prevent
 * is invisible in a screenshot in either mode. A boundary on the wrong element, or on
 * an element whose corner radius the pack moves, produces a page that looks like a
 * design decision, and a reviewer's eye confirms it.
 *
 * **This is not the check that the three marks are visible.** Asserting that an
 * element exists in a DOM is not evidence that it paints anything, and the reason
 * these three were invisible until this migration is that their class carried no
 * background: the element was there and the reader saw nothing. The evidence is
 * `scripts/check-cascade.mjs`, which resolves the painted colour of each disc in a
 * real browser in both modes.
 *
 * The page is rendered through the site's own chrome rather than a hand-assembled
 * header, `main` and footer, because the chrome is where the boundaries live. This
 * file used to write its own `<SiteHeader products={PRODUCTS}>` while the site
 * rendered a different one, so the reader here and the page being published were two
 * compositions; the switcher has since moved out of the `products` prop and into the
 * `actions` slot, and a test written against a hand-assembled bar would not have
 * noticed that it was testing a bar nobody ships. The landing renders the chrome
 * itself, so this renders the landing and nothing around it.
 */
const MARK_SLOT = 'product-mark';

function wholePage() {
  const { container } = render(<HomePage />);
  return container;
}

/**
 * Every boundary on the page, with the region it belongs to.
 *
 * The same rule the built-export gate uses, so a region that is named differently here
 * and there is a difference one of the two readers would have to explain: a mark in the
 * switcher, a mark in a brand lockup, and a mark inside the block that draws the
 * platform rows. A boundary belonging to none of those is `unnamed`, which no entry
 * in the map may name, so a mark outside the three regions fails here rather than
 * being counted towards one that happens to match.
 *
 * The last of those used to be named after the ordinal its own band printed above its
 * heading, so the map held `landing.05` and the gate would have failed the moment the
 * page stopped numbering its sections, which is the wrong reason for a pack gate to
 * fail.
 */
function boundaries(container: HTMLElement) {
  return [...container.querySelectorAll('[data-pack]')].map((element) => ({
    pack: element.getAttribute('data-pack') ?? '',
    region: element.closest('[data-slot="product-switcher"]')
      ? 'header.switcher'
      : element.closest('header')
        ? 'header.brand'
        : element.closest('footer')
          ? 'footer.brand'
          : element.closest('[data-slot="product-grid"]')
            ? 'landing.products'
            : 'unnamed',
  }));
}

describe('the pack map', () => {
  it('reads the ground from one place, and the map agrees with the site', () => {
    expect(SITE_PRODUCT.pack).toBe(map.ground);
    expect(map.ground).toBe('lavender');
  });

  it('carries a boundary in exactly the regions the map declares, and no others', () => {
    const container = wholePage();
    const regions = [...new Set(boundaries(container).map((boundary) => boundary.region))].sort();
    expect(regions).toEqual(Object.keys(map.regions).sort());
  });

  it('carries the identifiers the map declares, in each region', () => {
    const container = wholePage();
    for (const [region, declared] of Object.entries(map.regions)) {
      const packs = boundaries(container)
        .filter((boundary) => boundary.region === region)
        .map((boundary) => boundary.pack)
        .sort();
      expect(packs, `${region} carries ${packs.join(', ')}`).toEqual([...declared.packs].sort());
    }
  });

  it('has exactly two regions carrying a pack that is not the ground', () => {
    const container = wholePage();
    const second = boundaries(container)
      .filter((boundary) => boundary.pack !== map.ground)
      .map((boundary) => boundary.region);
    expect([...new Set(second)].sort()).toEqual([...map.secondPackRegions].sort());
    expect(new Set(second).size).toBe(2);
  });

  it('puts every boundary on a mark, and the mark on a fully rounded shape', () => {
    const container = wholePage();
    for (const boundary of container.querySelectorAll('[data-pack]')) {
      expect(boundary.getAttribute('data-slot'), 'a boundary sits on something that is not a mark').toBe(MARK_SLOT);
      // The shape the boundary may not change: the disc is fully rounded, and the
      // element carrying the boundary has no radius utility of its own.
      const disc = boundary.querySelector('[data-slot="product-mark-disc"]');
      expect(disc?.getAttribute('class')).toContain('rounded-full');
      expect(boundary.getAttribute('class') ?? '').not.toMatch(/\brounded-(?!full\b)/);
    }
  });

  it('puts no pack boundary on a section, a card, a link or a drawing', () => {
    const container = wholePage();
    for (const shape of ['section', 'article', 'a', 'div', 'li', 'svg', 'g', 'path', 'circle', 'rect']) {
      expect(container.querySelectorAll(`${shape}[data-pack]`).length, `a <${shape}> carries a boundary`).toBe(0);
    }
  });

  it('gives every one of the three product rows a mark that is not this site\'s', () => {
    // The three products built on Nexus, and the reason this list exists: the old page
    // drew them as cards whose dot had a size, a colour and a radius and no background
    // at all, so a reader saw three names and no marks.
    const container = wholePage();
    const rows = [...container.querySelectorAll('[data-slot="product-grid-row"]')];
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      const mark = row.querySelector('[data-slot="product-mark"]');
      expect(mark, 'a product row draws no mark').toBeTruthy();
      const disc = mark?.querySelector('[data-slot="product-mark-disc"]');
      // `bg-primary` is the class that paints the disc. A mark without it is a mark a
      // reader cannot see, which is the defect this migration repairs.
      expect(disc?.getAttribute('class'), 'the disc carries no fill class').toContain('bg-primary');
      expect(mark?.getAttribute('data-pack')).not.toBe(map.ground);
    }
  });

  it('resolves every mark from the site directory, so a mark and the directory cannot disagree', () => {
    const container = wholePage();
    const directory = new Map(PRODUCTS.map((product) => [product.id, product.pack]));
    for (const mark of container.querySelectorAll(`[data-slot="${MARK_SLOT}"]`)) {
      const id = mark.querySelector('[data-product]')?.getAttribute('data-product');
      expect(directory.has(id ?? ''), `no product ${id} in the directory`).toBe(true);
      if (id === SITE_PRODUCT.id) expect(mark.getAttribute('data-pack')).toBe(map.ground);
    }
  });
});
