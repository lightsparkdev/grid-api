import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
      // Mirror the narrow Origin imports aliased in next.config.mjs and tsconfig paths.
      '@lightsparkdev/origin/popover': path.resolve(
        root,
        'node_modules/@lightsparkdev/origin/src/components/Popover/index.ts',
      ),
    },
  },
  // Next compiles JSX with the automatic runtime; match it so components
  // that do not import React render under Vitest.
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
  },
});
