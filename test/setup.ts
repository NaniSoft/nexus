import { vi } from 'vitest';

/**
 * The page's living medium is the design system's `TsparticlesField`, which draws
 * through the tsParticles engine. The engine needs a canvas and an OffscreenCanvas
 * that the jsdom environment does not provide, and a decorative background is not
 * a fact these tests assert, so the component is replaced with a null stub: the
 * rest of the page renders without it.
 */
vi.mock('@nanisoft/prism-ui/components/tsparticles-field', () => ({
  TsparticlesField: () => null,
}));

/**
 * jsdom does not implement matchMedia, and the design system's DocsShell rail
 * disclosure reads `(min-width: 64rem)` on mount, so the environment has to
 * answer it. A min-width query answers as a desktop viewport, because that is
 * the arrangement components must hold at rest; a query that describes an
 * input or a preference (pointer, prefers-reduced-motion) still answers "no",
 * which is the desktop-with-mouse default the coarse-pointer contracts are
 * written against. A test that needs the other answer stubs matchMedia itself.
 */
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes('min-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}
