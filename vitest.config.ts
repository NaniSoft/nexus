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
  },
});
