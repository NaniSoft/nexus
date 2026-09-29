import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { SiteHeader } from '@nanisoft/prism-ui/blocks/site-header';

import AboutPage from '@/app/about/page';
import NotFound from '@/app/not-found';
import HomePage from '@/app/page';
import {
  BUILD_ORDER,
  FINAL_CTA,
  HERO,
  INSIDE,
  LOOP,
  LOOP_FIGURE,
  PLATFORM,
  STACK,
  TICKER,
} from '@/lib/landing-content';
import { PRODUCTS, SITE_PRODUCT } from '@/lib/site';

/**
 * The landing, the About page and the 404, rendered as the browser would receive them.
 *
 * The old version of this file mocked an `IntersectionObserver`, a canvas context and a
 * `matchMedia`, and rendered the page inside a theme provider, because the page was a
 * client subtree that needed all three. None of that is here any more, and its absence
 * is the cheapest single measure of the migration: the pages are server components, so
 * they render with no provider mounted, no observer, no canvas and no mode of their own.
 *
 * What the assertions hold, in order of what they would have caught:
 *
 *   - The thesis is the page's own `h1` and the page's own words.
 *   - The composition is the catalogue's, in the site's order. A section that silently
 *     stopped rendering is a hole where a numbered section was, and the old file could
 *     not have seen it.
 *   - Every call to action is an anchor with a destination. This is the assertion the
 *     old page could not make, because its actions were buttons with a `href` prop the
 *     component dropped: the page's primary action was a command that navigated
 *     nothing, and nothing threw.
 *   - Every word of every section survives, because the copy is frozen and the
 *     rendering moved.
 *   - No canvas, and no inline style carrying a colour. The two decorations the old
 *     page resolved in JavaScript are gone, and their absence is asserted rather than
 *     assumed.
 */
function renderLanding(): HTMLElement {
  const { container } = render(<HomePage />);
  return container;
}

describe('the landing', () => {
  it('owns the thesis as the page h1', () => {
    renderLanding();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe(HERO.title);
    expect(screen.getByText(HERO.eyebrow)).toBeTruthy();
  });

  it('composes the catalogue in the site order, with no band of its own', () => {
    const container = renderLanding();
    // The sections a reader meets, in order, named by their own headings.
    const headings = [...container.querySelectorAll('h1, h2')].map((heading) => heading.textContent?.trim());
    expect(headings).toEqual([
      HERO.title,
      LOOP.label,
      INSIDE.label,
      STACK.label,
      BUILD_ORDER.label,
      PLATFORM.label,
      FINAL_CTA.title,
    ]);
  });

  it('is composed from catalogue items, and every one of them is identifiable in the markup', () => {
    const container = renderLanding();
    // The Blocks that name their own region, plus the two Components whose absence
    // would be the whole defect this migration repairs: the mark and the call to
    // action. `card` and `card-title` are how the two feature grids identify
    // themselves, because the feature-grid Block composes cards and names no region
    // of its own.
    for (const slot of [
      'logo-strip',
      'note-grid',
      'stack-grid',
      'status-ledger',
      'product-grid',
      'product-mark',
      'card',
      'card-title',
      'cta-link',
    ]) {
      expect(container.querySelectorAll(`[data-slot="${slot}"]`).length, `no element carries data-slot="${slot}"`)
        .toBeGreaterThan(0);
    }
    // The canvas is deleted, not disabled, and so is the packet that travelled the rail.
    expect(container.querySelector('canvas')).toBeNull();
    expect(document.querySelector('canvas')).toBeNull();
    expect(container.innerHTML).not.toMatch(/data-reveal|nx-rail__packet/);
  });

  it('links every call to action as a real link', () => {
    renderLanding();
    for (const cta of [
      HERO.primaryCta,
      HERO.secondaryCta,
      FINAL_CTA.primaryCta,
      FINAL_CTA.secondaryCta,
    ]) {
      const link = screen.getAllByRole('link', { name: cta.label })[0] as HTMLElement | undefined;
      expect(link, `no link named "${cta.label}"`).toBeTruthy();
      expect(link?.tagName).toBe('A');
      expect(link?.getAttribute('href')).toBe(cta.href);
    }
  });

  it('shows the loop running beside the thesis, and the running part is not a canvas', () => {
    const container = renderLanding();
    // The claim the hero makes is that this is a factory, so the figure beside the
    // thesis is the factory: the same five stages section 01 lists, on one rail. The
    // old page drew this on a canvas with a requestAnimationFrame loop, and the
    // migration removed the drawing along with its two real defects. What came back
    // is vector markup in the initial HTML, which is why this asserts on what the
    // server rendered rather than on anything the browser had to run first.
    const graph = container.querySelector('[data-slot="pulse-graph"]');
    expect(graph, 'no figure beside the thesis').toBeTruthy();
    expect(graph?.getAttribute('role')).toBe('img');
    expect(graph?.getAttribute('aria-label')).toBe(LOOP_FIGURE.aria);

    // Every stage is a node, drawn, and none of it waited for a script.
    const nodes = [...container.querySelectorAll('[data-slot="pulse-graph-node"]')].map((node) =>
      node.getAttribute('data-node'),
    );
    for (const stage of LOOP.stages) {
      expect(nodes, 'the figure does not show the ' + stage.title + ' stage').toContain(
        stage.title.toLowerCase(),
      );
    }

    // The rail is the claim about order, and it is present at first paint.
    expect(container.querySelector('[data-slot="pulse-graph-rail-line"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="pulse-graph-marker"]')).toBeTruthy();

    // The motion is the design system's, named by its class rather than authored
    // here: a site that wrote its own cycle would be a second source of truth for a
    // decision Prism owns, and the one thing this page must not own.
    expect(container.querySelector('.prism-ambient-travel')).toBeTruthy();

    // And it is a drawing rather than a canvas, which is the whole of the
    // difference: a canvas paints pixels it has already resolved, so a pack
    // boundary landing above it would not re-ink it.
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('keeps every standing fact, the nuance, and all five loop stages with their captions', () => {
    renderLanding();
    for (const item of TICKER) expect(screen.getAllByText(item).length).toBeGreaterThan(0);
    expect(screen.getAllByText(HERO.lede).length).toBeGreaterThan(0);
    expect(screen.getAllByText(HERO.nuance).length).toBeGreaterThan(0);
    for (const stage of LOOP.stages) {
      expect(screen.getAllByText(stage.title).length, `no stage named ${stage.title}`).toBeGreaterThan(0);
      expect(screen.getAllByText(stage.body).length, `no caption for ${stage.title}`).toBeGreaterThan(0);
    }
    for (const note of LOOP.notes) {
      expect(screen.getAllByText(note.title).length, `no note named ${note.title}`).toBeGreaterThan(0);
      expect(screen.getAllByText(note.body).length, `no body for ${note.title}`).toBeGreaterThan(0);
    }
  });

  it('keeps the eight capabilities, the eight parts, and the four built in house', () => {
    renderLanding();
    for (const feature of INSIDE.features) {
      expect(screen.getAllByText(feature.title).length).toBeGreaterThan(0);
      expect(screen.getAllByText(feature.body).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText(STACK.lede).length).toBeGreaterThan(0);
    for (const part of STACK.parts) {
      expect(screen.getAllByText(part.name).length).toBeGreaterThan(0);
      expect(screen.getAllByText(part.role).length).toBeGreaterThan(0);
    }
    for (const own of STACK.own) {
      expect(screen.getAllByText(own.name).length).toBeGreaterThan(0);
      expect(screen.getAllByText(own.blurb).length).toBeGreaterThan(0);
    }
    // The in-house group claims itself four times, once per card, exactly as the old
    // page's dashed tiles did. The design system makes that claim mandatory: it throws
    // rather than draw a card that says "ours" in a shape and leave the words implied.
    expect(screen.getAllByText(STACK.ownLabel)).toHaveLength(STACK.own.length);
  });

  it('carries the honest build-order ledger, with the factory\'s own words for each state', () => {
    renderLanding();
    expect(screen.getAllByText(BUILD_ORDER.lede).length).toBeGreaterThan(0);
    expect(screen.getAllByText(BUILD_ORDER.caption).length).toBeGreaterThan(0);
    for (const row of BUILD_ORDER.rows) {
      expect(screen.getAllByText(row.name).length, `no row named ${row.name}`).toBeGreaterThan(0);
      expect(screen.getAllByText(row.statusLabel).length, `no state word for ${row.name}`).toBeGreaterThan(0);
      expect(screen.getAllByText(row.detail).length, `no detail for ${row.name}`).toBeGreaterThan(0);
    }
    // The words are the factory's and the tiers are the design system's, and they are
    // two fields because they are two claims.
    expect(screen.getAllByText('complete')).toHaveLength(1);
    expect(screen.getAllByText('specified')).toHaveLength(BUILD_ORDER.rows.length - 1);
    for (const row of BUILD_ORDER.rows) {
      const rendered = document.querySelector(`[data-slot="status-ledger-row"][data-status="${row.status}"]`);
      expect(rendered, `no ledger row with the ${row.status} tier`).toBeTruthy();
      expect(within(rendered as HTMLElement).getByText(row.statusLabel)).toBeTruthy();
    }
  });

  it('keeps the three products built on Nexus, each a whole-row link to its live site', () => {
    const container = renderLanding();
    expect(screen.getAllByText(PLATFORM.lede).length).toBeGreaterThan(0);
    expect(screen.getAllByText(PLATFORM.caption).length).toBeGreaterThan(0);
    const rows = [...container.querySelectorAll('[data-slot="product-grid-row"]')];
    expect(rows).toHaveLength(PLATFORM.products.length);
    for (const id of PLATFORM.products) {
      const product = PRODUCTS.find((entry) => entry.id === id);
      expect(product, `no product ${id} in the directory`).toBeTruthy();
      const row = rows.find((candidate) => candidate.querySelector(`[data-product="${id}"]`));
      expect(row, `no row for ${id}`).toBeTruthy();
      const link = row?.querySelector('a');
      expect(link?.getAttribute('href')).toBe(product?.href);
      expect(within(row as HTMLElement).getByText(product?.name ?? '')).toBeTruthy();
      // The row's mark is its own boundary, and it is a mark.
      const mark = row?.querySelector('[data-slot="product-mark"][data-pack]');
      expect(mark, `the ${id} mark carries no boundary`).toBeTruthy();
      expect(mark?.getAttribute('data-pack')).toBe(product?.pack);
    }
  });

  it('resolves no colour in JavaScript', () => {
    const container = renderLanding();
    // The old page resolved each product's brand ink once, at mount, and wrote it into
    // the exported HTML as a resolved hex, which is a colour the cascade cannot move.
    for (const element of container.querySelectorAll('[style]')) {
      expect(element.getAttribute('style')).not.toMatch(/--\w+-ink|#/);
    }
  });
});

describe('the about page', () => {
  it('is the design system\'s own screen over this site\'s own words', () => {
    const { container } = render(<AboutPage />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('The factory, not another assistant.');
    expect(screen.getByText('Orchestration')).toBeTruthy();
    expect(screen.getByText('Scope')).toBeTruthy();
    // The three facts are a definition list, which is the shape the design system's own
    // FactList draws, so the page loses a bespoke `div` and gains nothing.
    expect(container.querySelectorAll('dl dt')).toHaveLength(3);
    expect(container.querySelector('dl')).toBeTruthy();
    for (const label of ['Read the docs →', 'Follow the build →', 'This site’s repository →']) {
      const link = screen.getByRole('link', { name: label });
      expect(link.getAttribute('href')).toBeTruthy();
    }
  });
});

describe('the page that does not exist', () => {
  it('is the design system\'s own not-found page, and it has a way out', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('404');
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('This page does not exist (yet).');
    expect(screen.getByRole('link', { name: 'the docs' }).getAttribute('href')).toBe('/docs');
    expect(screen.getByRole('link', { name: 'the landing' }).getAttribute('href')).toBe('/');
  });
});

describe('the product this site is', () => {
  it('is in the directory, and the directory holds the five products the set is', () => {
    expect(SITE_PRODUCT.id).toBe('nexus');
    expect(SITE_PRODUCT.pack).toBe('lavender');
    expect(PRODUCTS.map((product) => product.id)).toEqual(['www', 'nexus', 'atlas', 'alphalens', 'prism']);
  });
});

describe('the chrome', () => {
  it('carries this site\'s own three destinations, because a header with no nav is a valid header', () => {
    // The design system's header takes its navigation as a prop and renders a brand
    // lockup and nothing else when the prop is absent, so dropping the three
    // destinations is a silent removal of the whole site's navigation. The
    // content-parity comparison is what caught it: thirty-seven routes lost three lines
    // of chrome and no other check in the repository said so.
    const { container } = render(
      <SiteHeader
        product={SITE_PRODUCT}
        products={PRODUCTS}
        nav={[
          { label: 'Docs', href: '/docs' },
          { label: 'Blog', href: '/blog' },
          { label: 'About', href: '/about' },
        ]}
        navLabel="Site"
        productsLabel="Products"
      />,
    );
    const nav = container.querySelector('nav[aria-label="Site"]');
    expect(nav, 'the header carries no site navigation').toBeTruthy();
    expect([...nav!.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual([
      '/docs',
      '/blog',
      '/about',
    ]);
    // The switcher is a second landmark, so it needs a second name: a header with two
    // navigation regions of one name is a header a reader navigating by landmark cannot
    // tell apart.
    expect(container.querySelector('nav[aria-label="Products"]'), 'the switcher takes the site navigation\'s name').toBeTruthy();
    expect(
      [...container.querySelectorAll('nav[aria-label="Products"] a')].map((a) => a.getAttribute('href')),
    ).toEqual(PRODUCTS.map((product) => product.href));
  });

  it('groups the footer\'s destinations under the two names the site already used', () => {
    const { container } = render(
      <SiteFooter
        product={SITE_PRODUCT}
        columns={[
          { title: 'Site', links: [{ label: 'Landing', href: '/' }] },
          { title: 'Elsewhere', links: [{ label: 'GitHub', href: 'https://github.com/NaniSoft/nexus' }] },
        ]}
        legal="© NaniSoft"
      />,
    );
    expect([...container.querySelectorAll('h2')].map((h) => h.textContent)).toEqual(['Site', 'Elsewhere']);
    expect(container.textContent).toContain('© NaniSoft');
  });
});
