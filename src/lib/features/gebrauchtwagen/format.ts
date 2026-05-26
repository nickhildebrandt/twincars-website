/**
 * @file Display helpers for used-car listings. Pure functions only
 * (no DOM, no API access) so they unit-test trivially.
 */

import type { PublicUsedCar } from '$lib/server/api/types'

/**
 * Formats a price (EUR gross) as a German currency string.
 * Returns "Preis auf Anfrage" when the value is missing.
 *
 * @param value  Gross price in EUR (or `null`).
 * @returns      Human-readable price label.
 */
export function formatPrice(value: number | null): string {
  if (value == null) return 'Preis auf Anfrage'
  return value.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  })
}

/**
 * Formats mileage in km with thousand separators.
 * Returns an em-dash when unknown.
 *
 * @param km  Distance in kilometres (or `null`).
 * @returns   Localised label.
 */
export function formatMileage(km: number | null): string {
  if (km == null) return '—'
  return `${km.toLocaleString('de-DE')} km`
}

/**
 * Formats an ISO date as a German short year/month string, e.g. `06/2021`.
 * Falls back to `—` when missing/invalid.
 *
 * @param iso  ISO date or full timestamp (or `null`).
 * @returns    `MM/YYYY` label.
 */
export function formatFirstRegistration(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  return `${m}/${d.getFullYear()}`
}

/**
 * Builds the customer-facing title for a vehicle, joining make and model
 * and falling back to a placeholder when both are missing.
 *
 * @param car  Used car as returned by the manager API.
 * @returns    Display title.
 */
export function carTitle(car: PublicUsedCar): string {
  const parts = [car.make, car.model].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : 'Fahrzeug ohne Bezeichnung'
}

/**
 * Returns unique non-empty values of the given property across the
 * inventory, sorted alphabetically — used to populate filter chips.
 *
 * @param cars  Inventory.
 * @param key   Property whose unique values to extract.
 * @returns     Sorted array of non-empty unique strings.
 */
export function uniqueValues(
  cars: readonly PublicUsedCar[],
  key: 'make' | 'fuel' | 'transmission'
): string[] {
  const set = new Set<string>()
  for (const car of cars) {
    const v = car[key]
    if (v) set.add(v)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'de'))
}
