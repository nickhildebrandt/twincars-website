import { describe, expect, it } from 'vitest'
import { formatEur, tireSpecLine, tireTitle, uniqueValues } from './format'
import type { PublicTire } from '$lib/server/api/types'

function tire(overrides: Partial<PublicTire> = {}): PublicTire {
  return {
    id: 't-1',
    articleNumber: 'TC-CON-2055516',
    brand: 'Continental',
    model: 'PremiumContact 6',
    width: 205,
    aspectRatio: 55,
    construction: 'R',
    diameterInch: 16,
    sizeLabel: '205/55 R16',
    loadIndex: '91',
    speedIndex: 'V',
    season: 'Sommer',
    ean: null,
    manufacturerPartNumber: null,
    fuelEfficiency: 'B',
    wetGrip: 'A',
    noiseClass: 'B',
    noiseDb: 71,
    runFlat: false,
    reinforced: false,
    studdedWinter: false,
    mSMarking: false,
    snowFlake: false,
    evCertified: false,
    description: '',
    currentPriceNet: 129,
    photos: [],
    shippingOptionId: null,
    ...overrides
  }
}

describe('formatEur', () => {
  it('formats EUR amounts', () => {
    expect(formatEur(129)).toMatch(/129,00\s?€/)
  })
  it('falls back on null', () => {
    expect(formatEur(null)).toBe('Preis auf Anfrage')
  })
})

describe('tireTitle', () => {
  it('joins brand and model', () => {
    expect(tireTitle(tire())).toBe('Continental PremiumContact 6')
  })
})

describe('tireSpecLine', () => {
  it('joins size, season and brand with separators', () => {
    expect(tireSpecLine(tire())).toBe('205/55 R16 · Sommer · Continental')
  })
  it('drops empty fields', () => {
    expect(tireSpecLine(tire({ brand: '' }))).toBe('205/55 R16 · Sommer')
  })
})

describe('uniqueValues', () => {
  it('returns sorted unique values', () => {
    const list = [
      tire({ id: 'a', brand: 'Continental' }),
      tire({ id: 'b', brand: 'Bridgestone' }),
      tire({ id: 'c', brand: 'Continental' }),
      tire({ id: 'd', brand: 'Michelin' })
    ]
    expect(uniqueValues(list, 'brand')).toEqual([
      'Bridgestone',
      'Continental',
      'Michelin'
    ])
  })

  it('ignores null and empty values', () => {
    const list = [
      tire({ id: 'a', loadIndex: '91' }),
      tire({ id: 'b', loadIndex: null }),
      tire({ id: 'c', loadIndex: '94' })
    ]
    expect(uniqueValues(list, 'loadIndex')).toEqual(['91', '94'])
  })
})
