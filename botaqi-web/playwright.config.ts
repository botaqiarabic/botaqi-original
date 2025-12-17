import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './playwright/tests',
  timeout: 30_000,
  expect: { timeout: 5000 },
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    headless: true,
    baseURL: process.env.BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
    actionTimeout: 0,
    ignoreHTTPSErrors: true,
  },
  webServer: {
    // Run the local server so API endpoints (e.g. /api/telemetry) are available during E2E
    command: 'node server.cjs',
    url: 'http://localhost:4173',
    // Ensure server is started with working dir explicitly pointing to botaqi-web
    cwd: process.cwd(),
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
