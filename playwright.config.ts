/**
 * Playwright configuration for end-to-end and accessibility tests.
 *
 * Tests run against the production build (`adapter-node`) — the dev server's
 * remote-function SSR hydration is flaky with `experimental.remoteFunctions`,
 * so we build once and serve via `node build`. The Twincars Manager API is
 * stubbed by `e2e/mock-manager.mjs`.
 */

import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const MOCK_PORT = 9999
const BASE_URL = `http://127.0.0.1:${PORT}`
const MOCK_URL = `http://127.0.0.1:${MOCK_PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'list' : 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    locale: 'de-DE'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command: 'node e2e/mock-manager.mjs',
      url: `${MOCK_URL}/api/public/services`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: { MOCK_MANAGER_PORT: String(MOCK_PORT) }
    },
    {
      command: `npm run build && node build`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      env: {
        TC_MANAGER_API_URL: MOCK_URL,
        TC_MANAGER_API_TOKEN: 'test-token',
        PUBLIC_SITE_URL: BASE_URL,
        // adapter-node reconstructs URLs from `Host` and defaults the scheme to
        // https. Without ORIGIN, same-origin form posts would 403 on the CSRF
        // check because the rebuilt URL becomes `https://127.0.0.1:4173`
        // while the browser sends `Origin: http://...`.
        ORIGIN: BASE_URL,
        PORT: String(PORT),
        HOST: '127.0.0.1'
      }
    }
  ]
})
