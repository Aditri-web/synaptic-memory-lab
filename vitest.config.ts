import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/engine/__tests__/**/*.test.ts'],
    environment: 'node', // Pure math tests, no DOM needed
    globals: true,
  },
});
