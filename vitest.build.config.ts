import { defineConfig } from 'vitest/config';

// Checks on the built site in dist/: run after `npm run build`.
export default defineConfig({
  test: {
    include: ['tests/build/**/*.test.ts'],
    environment: 'node',
  },
});
