import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser/specs',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'line',
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', testIgnore: /visual\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testIgnore: /visual\.spec\.ts/, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testIgnore: /visual\.spec\.ts/, use: { ...devices['Desktop Safari'] } },
    {
      name: 'visual-chromium',
      testMatch: /visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce'
      }
    }
  ],
  webServer: [
    {
      command: 'npm run preview --workspace @webaseui/docs -- --host 127.0.0.1 --port 4175',
      url: 'http://127.0.0.1:4175',
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'npm exec -- vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port 4176',
      url: 'http://127.0.0.1:4176',
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'node tests/ssr/server.mjs',
      url: 'http://127.0.0.1:4177',
      reuseExistingServer: !process.env.CI
    }
  ]
});
