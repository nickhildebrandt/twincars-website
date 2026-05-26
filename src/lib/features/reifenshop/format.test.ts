import { describe, expect, it } from 'vitest'
import { attr, formatEur, specLine, uniqueAttr } from './format'
import type { PublicArticle } from '$lib/server/api/types'

const article = (overrides: Partial<PublicArticle> = {}): PublicArticle => ({
  id: 'a-1',
  articleNumber: 'TC-CON-2055516',
  description: 'Continental PremiumContact 6',
  unit: 'Stück',
  currentPriceNet: 129.0,
  attributes: { size: '205/55 R16', season: 'Sommer', brand: 'Continental' },
  shippingOptionId: null,
  ...overrides
})

describe('formatEur', () => {
  it('formats EUR amounts', () => {
    expect(formatEur(129)).toMatch(/129,00\s?€/)
  })
  it('falls back on null', () => {
    expect(formatEur(null)).toBe('Preis auf Anfrage')
  })
})

describe('attr', () => {
  it('returns string attributes', () => {
    expect(attr(article(), 'size')).toBe('205/55 R16')
  })
  it('returns null for missing attributes', () => {
    expect(attr(article(), 'doesNotExist')).toBeNull()
  })
  it('coerces numbers and booleans', () => {
    const a = article({ attributes: { weight: 9, recommended: true } })
    expect(attr(a, 'weight')).toBe('9')
    expect(attr(a, 'recommended')).toBe('true')
  })
})

describe('uniqueAttr', () => {
  it('returns sorted unique values', () => {
    const list = [
      article({ id: 'a', attributes: { brand: 'Continental' } }),
      article({ id: 'b', attributes: { brand: 'Bridgestone' } }),
      article({ id: 'c', attributes: { brand: 'Continental' } }),
      article({ id: 'd', attributes: {} })
    ]
    expect(uniqueAttr(list, 'brand')).toEqual(['Bridgestone', 'Continental'])
  })
})

describe('specLine', () => {
  it('joins size, season and brand with separators', () => {
    expect(specLine(article())).toBe('205/55 R16 · Sommer · Continental')
  })
  it('falls back to profile when size missing', () => {
    const a = article({ attributes: { profile: 'PremiumContact 6' } })
    expect(specLine(a)).toBe('PremiumContact 6')
  })
  it('returns empty string when no attributes present', () => {
    expect(specLine(article({ attributes: {} }))).toBe('')
  })
})
