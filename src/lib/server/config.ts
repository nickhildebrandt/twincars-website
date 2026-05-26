/**
 * @file Server-side configuration loader.
 *
 * Reads the required environment variables and exposes them as a typed,
 * frozen object. Importing this module also has the *side effect* of
 * crashing the process when a required variable is missing — that is
 * intentional: the user spec says "wenn die Umgebungsvariable nicht
 * gesetzt ist, wird das Projekt nicht gestartet".
 *
 * Anyone needing config from the server side should `import { config }
 * from '$lib/server/config'` — never read `process.env` directly.
 */

import { env } from '$env/dynamic/private'
import { env as publicEnv } from '$env/dynamic/public'

/**
 * Validated, frozen configuration for the Twincars website backend.
 *
 * @property apiUrl   Base URL of the Twincars Manager (no trailing slash).
 * @property apiToken Bearer token used for every public-API request.
 * @property siteUrl  Canonical public URL of this website (used for SEO).
 * @property isDev    `true` when running `vite dev`, `false` in production.
 */
export interface TwincarsConfig {
  readonly apiUrl: string
  readonly apiToken: string
  readonly siteUrl: string
  readonly isDev: boolean
}

/**
 * Reads `name` from the environment and throws a descriptive error if
 * it is missing or blank. We avoid `||` (would accept `'0'` as missing)
 * by checking for explicit `undefined`/empty-after-trim.
 *
 * @param {string} name           The variable name shown in the error.
 * @param {string | undefined} value The candidate value (already read).
 * @returns {string} The trimmed, non-empty value.
 * @throws {Error} If the value is missing or blank.
 */
function requireEnv(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    throw new Error(
      `[twincars-website] Missing required environment variable ${name}. ` +
        `Set it in .env (see .env.example) before starting the app.`
    )
  }
  return value.trim()
}

const rawApiUrl = requireEnv('TC_MANAGER_API_URL', env.TC_MANAGER_API_URL)
const rawApiToken = requireEnv('TC_MANAGER_API_TOKEN', env.TC_MANAGER_API_TOKEN)

/**
 * The fully-validated configuration object. Frozen so consumers can't
 * mutate it at runtime; freezing is purely defensive — there is no
 * legitimate reason to write to it after startup.
 */
export const config: TwincarsConfig = Object.freeze({
  apiUrl: rawApiUrl.replace(/\/+$/, ''),
  apiToken: rawApiToken,
  siteUrl:
    (publicEnv.PUBLIC_SITE_URL ?? 'https://twin-cars.de').replace(/\/+$/, ''),
  isDev: env.NODE_ENV !== 'production'
})
