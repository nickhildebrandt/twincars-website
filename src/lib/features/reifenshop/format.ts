/**
 * @file Pure helpers for displaying shop articles. No DOM, no API.
 */

import type { PublicArticle } from '$lib/server/api/types'

/**
 * Formats a net EUR amount as a German currency string.
 * Returns "Preis auf Anfrage" when missing.
 *
 * @param amount  Net price in EUR (or `null`).
 * @returns       Human-readable label.
 */
export function formatEur(amount: number | null): string {
  if (amount == null) return 'Preis auf Anfrage'
  return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

/**
 * Reads a string attribute off an article. Returns `null` if missing
 * or if the value isn't representable as text.
 *
 * @param article  Source article.
 * @param key      Attribute name.
 * @returns        String value or `null`.
 */
export function attr(article: PublicArticle, key: string): string | null {
  const v = article.attributes?.[key]
  if (v == null) return null
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return null
}

/**
 * Returns unique non-empty values of the given attribute across the
 * catalogue, sorted alphabetically — used to populate filter chips.
 *
 * @param articles  Catalogue.
 * @param key       Attribute name to extract.
 * @returns         Sorted array of unique strings.
 */
export function uniqueAttr(articles: readonly PublicArticle[], key: string): string[] {
  const set = new Set<string>()
  for (const a of articles) {
    const v = attr(a, key)
    if (v) set.add(v)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'de'))
}

/**
 * Builds a short technical-specs string from the most common tire
 * attributes. Empty string when none of them are present.
 *
 * @param article  Article to summarise.
 * @returns        e.g. `205/55 R16 · Sommer · Continental`.
 */
export function specLine(article: PublicArticle): string {
  const parts: string[] = []
  const size = attr(article, 'size')
  const season = attr(article, 'season')
  const brand = attr(article, 'brand')
  const profile = attr(article, 'profile')
  if (size) parts.push(size)
  if (season) parts.push(season)
  if (brand) parts.push(brand)
  if (profile && !size) parts.push(profile)
  return parts.join(' · ')
}
