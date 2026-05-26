/**
 * @file Pure helpers for displaying tires. No DOM, no API.
 */

import type { PublicTire } from '$lib/server/api/types'

/** A subset of tire fields used by the title / spec helpers. */
export type TireDisplay = Pick<
  PublicTire,
  'brand' | 'model' | 'sizeLabel' | 'season'
>

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
 * Builds the display title from brand + model, e.g.
 * `Continental PremiumContact 6`.
 *
 * @param tire  Tire snapshot with brand and model.
 * @returns     Space-joined title (trimmed).
 */
export function tireTitle(tire: Pick<TireDisplay, 'brand' | 'model'>): string {
  return `${tire.brand} ${tire.model}`.trim()
}

/**
 * Builds a short technical-specs string from the tire size, season and
 * brand. Empty string when all of them are missing.
 *
 * @param tire  Tire snapshot.
 * @returns     e.g. `205/55 R16 · Sommer · Continental`.
 */
export function tireSpecLine(tire: TireDisplay): string {
  return [tire.sizeLabel, tire.season, tire.brand]
    .filter((v): v is string => Boolean(v))
    .join(' · ')
}

/**
 * Returns unique non-empty values of the given tire field across the
 * catalogue, sorted alphabetically — used to populate filter chips.
 *
 * @param tires  Catalogue.
 * @param key    Field on `PublicTire` to extract.
 * @returns      Sorted array of unique string values.
 */
export function uniqueValues<K extends keyof PublicTire>(
  tires: readonly PublicTire[],
  key: K
): string[] {
  const set = new Set<string>()
  for (const t of tires) {
    const v = t[key]
    if (v == null || v === '') continue
    set.add(String(v))
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'de'))
}
