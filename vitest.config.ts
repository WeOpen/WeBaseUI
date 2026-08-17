import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: [
        'packages/webaseui-svelte/src/lib/internal/**/*.ts',
        'packages/webaseui-svelte/src/lib/utils/**/*.ts'
      ],
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        perFile: true,
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90
      }
    },
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    passWithNoTests: false
  }
});
