import type { PrismMode, PrismPackId } from '@nanisoft/prism-tokens';
import type { PrismProductId } from '@nanisoft/prism-ui';
// The root barrel's runtime-safe half: ./theming also exports the bake helper,
// which pulls the SSR extractor and must never enter the app graph.
import { prismThemeBootScript } from '@nanisoft/prism-ui';

/**
 * The site's fixed pack — identity is static and known at build time; the
 * chrome flips mode only (ADR-0006). Nexus is the core platform; lavender is its pack across every surface.
 */
export const DEFAULT_PACK: PrismPackId = 'lavender';

/** Standing site default: beam-dark (the platform's stack precedent). */
export const DEFAULT_MODE: PrismMode = 'dark';

/** This site's registry id — drives the chrome's switcher + footer grid. */
export const SITE_ID: PrismProductId = 'nexus';

/** Blocking, pre-paint class application — the flash-free half of the class-swap recipe. */
export const themeBootScript = prismThemeBootScript({ pack: DEFAULT_PACK, defaultMode: DEFAULT_MODE });
