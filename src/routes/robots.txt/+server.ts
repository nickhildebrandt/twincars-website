/**
 * @file Plain-text `robots.txt`.
 *
 * Allows everything except the cart/checkout/booking-form pages — those
 * carry `noindex` already, but we also block crawlers from spending
 * budget on them.
 */

import type { RequestHandler } from './$types'
import { PUBLIC_SITE_URL } from '$env/static/public'

/** Builds the `robots.txt` body and serves it as plain text. */
export const GET: RequestHandler = () => {
  const base = (PUBLIC_SITE_URL ?? 'https://twin-cars.de').replace(/\/+$/, '')
  const body =
    `User-agent: *\n` +
    `Allow: /\n` +
    `Disallow: /reifenshop/warenkorb\n` +
    `Disallow: /reifenshop/checkout\n` +
    `\n` +
    `Sitemap: ${base}/sitemap.xml\n`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
