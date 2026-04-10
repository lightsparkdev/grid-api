import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  retries: 0,
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
