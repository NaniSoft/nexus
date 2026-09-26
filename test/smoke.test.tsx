import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { PrismThemeModeProvider } from '@nanisoft/prism-ui/provider';

import HomePage from '@/app/page';
import { BUILD_ORDER, LOOP_STAGES } from '@/lib/landing-content';

/** Renders the landing inside the chrome's mode context, as the layout does. */
function renderLanding(): void {
  render(
    <PrismThemeModeProvider pack="lavender" defaultMode="dark">
      <HomePage />
    </PrismThemeModeProvider>,
  );
}

// jsdom has no IntersectionObserver; the landing's reveal observer needs one.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly scrollMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {}
}

beforeAll(() => {
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  // jsdom has no canvas backend; the loop canvas guards on a null context.
  window.HTMLCanvasElement.prototype.getContext = () => null;
  // matchMedia exists in jsdom but returns no matches; reduced-motion reads it.
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
});

describe('landing', () => {
  it('owns the thesis', () => {
    renderLanding();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(/software that builds/i.test(heading.textContent ?? '')).toBe(true);
    expect(heading.querySelector('em')?.textContent).toBe('software');
  });

  it('states the in-development status', () => {
    renderLanding();
    expect(screen.getAllByText(/in active development/i).length).toBeGreaterThan(0);
  });

  it('renders the loop as five stages', () => {
    renderLanding();
    for (const stage of LOOP_STAGES) {
      expect(screen.getAllByText(stage.title).length).toBeGreaterThan(0);
    }
  });

  it('carries the honest build-order ledger', () => {
    renderLanding();
    expect(screen.getByText(BUILD_ORDER.rows[0]!.name)).toBeTruthy();
    expect(screen.getAllByText('specified').length).toBe(BUILD_ORDER.rows.length - 1);
    expect(screen.getByText('complete')).toBeTruthy();
  });

  it('links the three products built on Nexus', () => {
    renderLanding();
    expect(screen.getByText('Atlas')).toBeTruthy();
    expect(screen.getByText('AlphaLens')).toBeTruthy();
    expect(screen.getByText('Prism')).toBeTruthy();
  });
});
