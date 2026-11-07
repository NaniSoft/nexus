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
