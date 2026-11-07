import { vi } from 'vitest';

/**
 * tsParticles draws its canvas through its engine, which the jsdom environment
 * does not provide (it has no OffscreenCanvas). The page's living medium is
 * mocked away across the suite: its motion is a visual effect rather than a fact
 * these tests assert, and the rest of the page renders without a canvas.
 */
vi.mock('@tsparticles/react', () => {
  const stub = () => null;
  return {
    default: stub,
    Particles: stub,
    ParticlesProvider: ({ children }: { children?: unknown }) => children ?? null,
    useParticlesProvider: () => ({ loaded: true }),
  };
});
