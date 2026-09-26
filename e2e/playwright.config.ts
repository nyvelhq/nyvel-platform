import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const executablePath = process.env.E2E_CHROMIUM_PATH || undefined;
const launchOptions = executablePath ? { executablePath } : {};

/**
 * Nyvel e2e. Runs against the app built into .app-build (npm run app:build)
 * and a throwaway local Supabase (npm run db:start && npm run db:schema).
 * Tag core-loop tests @smoke; they run on every PR. Everything else runs on
 * merge and nightly.
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./global-setup'),
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Matches users who prefer less motion, and keeps runs deterministic.
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/, use: { launchOptions } },
    {
      name: 'desktop',
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], launchOptions },
    },
    {
      name: 'mobile',
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
      grep: /@mobile/,
      use: { ...devices['Pixel 7'], launchOptions },
    },
  ],
  webServer: {
    command: 'npx serve -s .app-build -l 4173 --no-clipboard',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
