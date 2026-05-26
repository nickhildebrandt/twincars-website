/**
 * Vitest global setup.
 *
 * - Loads `@testing-library/jest-dom` so matchers like
 *   `toBeInTheDocument()` are available on the global `expect`.
 * - The `jsdom` environment from `vite.config.ts` provides the DOM.
 */

import '@testing-library/jest-dom/vitest'

// Provide the API env vars the server-only `config.ts` module insists on
// before any test imports `$lib/server/...`.
process.env.TC_MANAGER_API_URL ??= 'http://api.test.local'
process.env.TC_MANAGER_API_TOKEN ??= 'test-token'
process.env.PUBLIC_SITE_URL ??= 'https://twin-cars.test'
