import { describe, expect, it } from 'vitest'
import {
  carTitle,
  formatFirstRegistration,
  formatMileage,
  formatPrice,
  uniqueValues
} from './format'
import type { PublicUsedCar } from '$lib/server/api/types'

const car = (overrides: Partial<PublicUsedCar> = {}): PublicUsedCar => ({
  id: 'car-1',
  make: 'VW',
  model: 'Polo',
  firstRegistration: '2021-06-15',
  mileageKm: 45000,
  priceGross: 13500,
  fuel: 'Benzin',
  transmission: 'Schaltgetriebe',
  description: 'Sehr gepflegt.',
  photos: [],
  ...overrides
})

describe('formatPrice', () => {
  it('formats a EUR amount', () => {
    expect(formatPrice(13500)).toMatch(/^13\.500\s?€$/)
  })
  it('falls back when null', () => {
    expect(formatPrice(null)).toBe('Preis auf Anfrage')
  })
})

describe('formatMileage', () => {
  it('uses thousand separators', () => {
    expect(formatMileage(45000)).toMatch(/^45\.000\s?km$/)
  })
  it('falls back when null', () => {
    expect(formatMileage(null)).toBe('—')
  })
})

describe('formatFirstRegistration', () => {
  it('formats MM/YYYY', () => {
    expect(formatFirstRegistration('2021-06-15')).toBe('06/2021')
  })
  it('handles full ISO timestamps', () => {
    expect(formatFirstRegistration('2021-12-01T00:00:00.000Z')).toMatch(/12\/2021/)
  })
  it('falls back when null', () => {
    expect(formatFirstRegistration(null)).toBe('—')
  })
  it('falls back on garbage', () => {
    expect(formatFirstRegistration('not a date')).toBe('—')
  })
})

describe('carTitle', () => {
  it('joins make and model', () => {
    expect(carTitle(car())).toBe('VW Polo')
  })
  it('uses make only when model missing', () => {
    expect(carTitle(car({ model: null }))).toBe('VW')
  })
  it('falls back when both missing', () => {
    expect(carTitle(car({ make: null, model: null }))).toBe('Fahrzeug ohne Bezeichnung')
  })
})

describe('uniqueValues', () => {
  it('returns sorted unique non-empty values', () => {
    const cars = [
      car({ id: 'a', make: 'VW' }),
      car({ id: 'b', make: 'Audi' }),
      car({ id: 'c', make: 'VW' }),
      car({ id: 'd', make: null })
    ]
    expect(uniqueValues(cars, 'make')).toEqual(['Audi', 'VW'])
  })
})
