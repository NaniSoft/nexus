import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The tsconfig sets jsx: 'preserve' (Next's requirement); vitest must
  // transform JSX itself. Vite 8's transformer is oxc (config key 'oxc').
  oxc: {
    jsx: { runtime: 'automatic' },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    // globals: registers RTL's automatic cleanup between tests.
    globals: true,
    server: {
      deps: {
        /**
         * The design system's published JavaScript carries extensionless relative
         * imports (`from '../../lib/utils'`), which a bundler resolves and Node's
         * ESM resolver does not. Next resolves them, so `next build` is green; a
         * test that renders a catalogue item in this runner is not, and the failure
         * reads as a missing module rather than as a packaging defect.
         *
         * Inlining the package puts its files through this runner's resolver, which
         * does try the extensions. This is a consumer-side workaround for a
         * packaging defect in the package, and it is filed as prism#110: a published
         * ESM package whose own export map says it is importable, and which is not
         * importable without a bundler, is a defect rather than a consumer's problem.
         * The alternative is a site test suite that cannot render anything the design
         * system ships, which is a test suite that asserts nothing about the design
         * system.
         */
        inline: [/@nanisoft\/prism-ui/],
      },
    },
  },
});
