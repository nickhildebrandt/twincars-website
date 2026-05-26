/**
 * @file Dynamic XML sitemap.
 *
 * Lists every static page on the site. Dynamic pages (used-car
 * detail, article detail) are intentionally left out — they don't have
 * stable URLs over time and we don't want stale entries in the index.
 *
 * The endpoint sets the correct `Content-Type` and a one-hour cache
 * header so search-engine crawlers can index incrementally.
 */

import type { RequestHandler } from './$types'
import { PUBLIC_SITE_URL } from '$env/static/public'

/** Site routes that should appear in the sitemap, with their priorities. */
const ROUTES: ReadonlyArray<{ path: string; priority: number; changefreq: string }> = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/leistungen', priority: 0.9, changefreq: 'monthly' },
  { path: '/termin', priority: 0.9, changefreq: 'monthly' },
  { path: '/gebrauchtwagen', priority: 0.8, changefreq: 'daily' },
  { path: '/reifenshop', priority: 0.8, changefreq: 'daily' },
  { path: '/kontakt', priority: 0.7, changefreq: 'monthly' },
  { path: '/impressum', priority: 0.3, changefreq: 'yearly' },
  { path: '/datenschutz', priority: 0.3, changefreq: 'yearly' }
]

/**
 * Builds the sitemap XML document for the configured routes.
 */
export const GET: RequestHandler = () => {
  const base = (PUBLIC_SITE_URL ?? 'https://twin-cars.de').replace(/\/+$/, '')
  const today = new Date().toISOString().slice(0, 10)
  const urls = ROUTES.map(
    (r) =>
      `  <url>\n    <loc>${base}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
