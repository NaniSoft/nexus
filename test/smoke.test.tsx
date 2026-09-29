import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { SiteHeader } from '@nanisoft/prism-ui/blocks/site-header';
import { ProductSwitcher } from '@nanisoft/prism-ui/components/product-switcher';

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
  TICKER_LABEL,
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
 *   - The chrome carries this site's own destinations, marks the one the reader is on,
 *     and puts the product set after them rather than between them and the brand.
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
  });

  it('says the site name once, in the header, rather than twice in a badge over the thesis', () => {
    // The hero's eyebrow used to be this site's own name, which the design system
    // draws as a rounded badge, forty pixels below a header that already draws the
    // same name as a wordmark. A pill that repeats the wordmark is a decoration that
    // costs a text element, and it was the fourth element on the first screen.
    const container = renderLanding();
    expect(container.querySelector('.site-band--tight')).toBeNull();
    expect(container.textContent).not.toContain('nanisoft · nexus');
  });

  it('composes the catalogue in the site order, with no band of its own', () => {
    const container = renderLanding();
    // The sections a reader meets, in order, named by their own headings. Scoped to
    // `<main>`: the footer's two column titles are `h2` too, and they are the footer's.
    const headings = [...container.querySelectorAll('main h1, main h2')].map((heading) =>
      heading.textContent?.trim(),
    );
    expect(headings).toEqual([
      HERO.title,
      LOOP.label,
      LOOP.notes.label,
      INSIDE.label,
      STACK.label,
      BUILD_ORDER.label,
      PLATFORM.label,
      FINAL_CTA.title,
    ]);
  });

  it('prints no section ordinal, because a number above a heading counts nothing a reader can see', () => {
    const container = renderLanding();
    // Five bands used to open with a bare `01` through `05` pushed through the
    // `eyebrow` prop. What those numbers were actually carrying survives in the one
    // place it belongs: the five stages of the loop are numbered, because five stages
    // in an order are a sequence, and the eight capabilities are not, because eight
    // capabilities are a set.
    const ordinals = [...container.querySelectorAll('main section span')]
      .filter((node) => /^\d{2}$/.test(node.textContent?.trim() ?? ''))
      // A stage's own number is the sequence being claimed, and it belongs on the card.
      .filter((node) => !node.closest('[data-slot="card"]'));
    expect(ordinals, 'a bare number is printed above a section heading').toEqual([]);
    const cards = [...container.querySelectorAll('[data-slot="card"]')];
    const numbered = cards.filter((card) => /^\d{2}$/.test(card.textContent?.trim().slice(0, 2) ?? ''));
    expect(
      numbered.map((card) => card.querySelector('[data-slot="card-title"]')?.textContent?.trim()),
      'only the five stages of the loop are numbered, because only they are a sequence',
    ).toEqual(LOOP.stages.map((stage) => stage.title));
    expect(cards.length).toBe(LOOP.stages.length + INSIDE.features.length + STACK.parts.length + STACK.own.length);
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

  it('links every call to action as a real link, under one label per destination', () => {
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
    // Two destinations, two labels, on the whole page. The closing band used to say
    // "Read the design docs" for the door the hero called "Read the docs", and a
    // visitor who read the top of the page and acted on the bottom found two names
    // for one address.
    const labels = new Map<string, Set<string>>();
    for (const cta of [
      HERO.primaryCta,
      HERO.secondaryCta,
      FINAL_CTA.primaryCta,
      FINAL_CTA.secondaryCta,
    ]) {
      const forHref = labels.get(cta.href) ?? new Set<string>();
      forHref.add(cta.label);
      labels.set(cta.href, forHref);
    }
    for (const [href, names] of labels) {
      expect([...names], `${href} is published under more than one name`).toHaveLength(1);
    }
  });

  it('shows the loop drawn beside the thesis, without claiming the factory is running', () => {
    const container = renderLanding();
    // The claim the hero makes is that this is a factory, so the figure beside the
    // thesis is the factory: the same five stages the first section lists, on one rail.
    // The old page drew this on a canvas with a requestAnimationFrame loop, and the
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

    // The panel made no claim about the system being live. It said `live`, which the
    // design system draws as a success dot beside a word, on a page whose own ledger
    // says implementation has not started.
    const panel = container.querySelector('[data-slot="instrument-panel"]');
    expect(panel?.getAttribute('data-state')).toBe('neutral');
    expect(panel?.textContent).not.toMatch(/\blive\b/);

    // And it is a drawing rather than a canvas, which is the whole of the
    // difference: a canvas paints pixels it has already resolved, so a pack
    // boundary landing above it would not re-ink it.
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('keeps every standing fact, and every one of them with a name rather than a prefix', () => {
    renderLanding();
    for (const item of TICKER) expect(screen.getAllByText(item).length).toBeGreaterThan(0);
    expect(screen.getAllByText(HERO.lede).length).toBeGreaterThan(0);
    // The five facts used to be `status → in active development` and four more of
    // the same shape, so each one had to be prefixed to be read. The strip is a `ul`
    // with a name, and the name says what the phrases are.
    expect(screen.getByRole('list', { name: TICKER_LABEL })).toBeTruthy();
    for (const item of TICKER) expect(item).not.toMatch(/[→·—–]/);
  });

  it('keeps all five loop stages with their captions, and the four guarantees under a heading', () => {
    renderLanding();
    for (const stage of LOOP.stages) {
      expect(screen.getAllByText(stage.title).length, `no stage named ${stage.title}`).toBeGreaterThan(0);
      expect(screen.getAllByText(stage.body).length, `no caption for ${stage.title}`).toBeGreaterThan(0);
    }
    // The guarantees were a `dl` with no heading, floating under the card grid above
    // them. Same four points, now a section a reader can point at.
    expect(screen.getByRole('heading', { name: LOOP.notes.label })).toBeTruthy();
    for (const note of LOOP.notes.items) {
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

  it('marks itself as the page the reader is on', () => {
    const { container } = render(<AboutPage />);
    // The switcher already carried `aria-current="page"` for this site's own member.
    // The half that never did was this site's own navigation, and the half that never
    // did was the header in the root layout, which is not told which page it is on.
    const nav = container.querySelector('nav[aria-label="Site"]');
    expect([...nav!.querySelectorAll('a')].map((a) => a.getAttribute('aria-current'))).toEqual([
      null,
      null,
      'page',
    ]);
    const switcher = container.querySelector('nav[aria-label="Products"]');
    expect(
      [...switcher!.querySelectorAll('a[aria-current="page"]')].map((a) => a.getAttribute('href')),
    ).toEqual(['https://nexus.nanisoft.com']);
  });
});

describe('the page that does not exist', () => {
  it('is the design system\'s own not-found page, and it has a way out', () => {
    const { container } = render(<NotFound />);
    // Scoped to `<main>`: the footer's two column titles are headings too.
    const main = within(container.querySelector('main') as HTMLElement);
    expect(main.getByRole('heading', { level: 1 }).textContent).toBe('404');
    expect(main.getByRole('heading', { level: 2 }).textContent).toBe('This page does not exist (yet).');
    expect(main.getByRole('link', { name: 'the docs' }).getAttribute('href')).toBe('/docs');
    expect(main.getByRole('link', { name: 'the landing' }).getAttribute('href')).toBe('/');
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

  it('marks the current page on the switcher, and the switcher is still a switcher', () => {
    // The switcher moved out of the header's `products` prop and into its `actions`
    // slot, which is the only change that puts this site's own three destinations
    // ahead of a five-name product family instead of behind it. Composed by hand here
    // because the header composes it for us in `components/site-chrome.tsx`.
    const { container } = render(
      <ProductSwitcher products={PRODUCTS} currentId={SITE_PRODUCT.id} label="Products" />,
    );
    expect(container.querySelector('[data-slot="product-switcher"]')).toBeTruthy();
    const current = [...container.querySelectorAll('a[aria-current="page"]')];
    expect(current).toHaveLength(1);
    expect(current[0]?.getAttribute('href')).toBe('https://nexus.nanisoft.com');
  });

  it('puts this site\'s own destinations before the product set, and stays on the page', () => {
    const { container } = render(<HomePage />);
    const bar = container.querySelector('[data-slot="site-header"]');
    expect(bar, 'the landing ships without a header').toBeTruthy();
    const order = [...bar!.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
    // The three destinations come first, the product set after them, and the switcher
    // no longer sits between the wordmark and the only links a reader can follow to
    // learn something.
    expect(order.slice(0, 3)).toEqual(['/', '/docs', '/blog']);
    expect(order.indexOf('/about')).toBeLessThan(order.indexOf('https://www.nanisoft.com'));
    // Sticky, because the landing is nine bands long and a header that scrolls away
    // takes the reader's only way back to the docs with it.
    expect(bar!.getAttribute('class')).toContain('sticky');
  });

  it('groups the footer\'s destinations under the two names the site already used, once each', () => {
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

  it('does not publish the repository twice in the footer', () => {
    const { container } = render(<HomePage />);
    const footer = container.querySelector('footer');
    const github = [...(footer?.querySelectorAll('a') ?? [])].filter(
      (a) => a.getAttribute('href') === 'https://github.com/NaniSoft/nexus',
    );
    // It used to be a column link and a social link at once, which is one destination
    // wearing two controls and the reader's second way to do the same thing.
    expect(github).toHaveLength(1);
  });
});
