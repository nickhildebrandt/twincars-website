/**
 * @file Server hooks — runs once at module import time on the server.
 *
 * Importing `$lib/server/config` here ensures the env-var check fires
 * during boot rather than on the first incoming request. If
 * `TC_MANAGER_API_URL` or `TC_MANAGER_API_TOKEN` is missing, the
 * SvelteKit server fails to start with a clear error message.
 */

import './lib/server/config'
import type { Handle, HandleValidationError } from '@sveltejs/kit'

/**
 * Default pass-through `handle` hook. We don't need any request-level
 * interception today, but defining `handle` is the cleanest place to
 * add CSP / cache headers later.
 *
 * @type {Handle}
 */
export const handle: Handle = async ({ event, resolve }) => {
  return resolve(event)
}

/**
 * Validation-error hook for SvelteKit remote functions. Without
 * implementing it, validation failures leak the raw issues; we squash
 * them to a generic message so attackers can't probe the schema.
 *
 * @type {HandleValidationError}
 */
export const handleValidationError: HandleValidationError = () => ({
  message: 'Ungültige Eingabe.'
})
