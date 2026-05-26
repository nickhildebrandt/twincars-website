/**
 * Tests for the cart store. We wrap the rune-backed factory in
 * `$effect.root` so `$state` / `$derived` work outside a component.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { flushSync } from 'svelte'
import { createCart } from './cart.svelte'
import type { PublicArticle } from '$lib/server/api/types'

function makeArticle(overrides: Partial<PublicArticle> = {}): PublicArticle {
  return {
    id: 'a-1',
    articleNumber: 'TC-1',
    description: 'Sommerreifen 205/55 R16',
    unit: 'Stück',
    currentPriceNet: 100,
    attributes: { size: '205/55 R16' },
    shippingOptionId: 'std',
    ...overrides
  }
}

/**
 * Runs `fn` inside an effect root so it can use `$state` / `$derived`.
 * Returns the cleanup function so the harness can dispose state.
 */
function withRoot<T>(fn: () => T): { result: T; dispose: () => void } {
  let result!: T
  const dispose = $effect.root(() => {
    result = fn()
  })
  return { result, dispose }
}

describe('createCart', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('starts empty', () => {
    const { result: cart, dispose } = withRoot(() => createCart())
    try {
      expect(cart.lines).toHaveLength(0)
      expect(cart.totals.totalQuantity).toBe(0)
      expect(cart.totals.subtotalNet).toBe(0)
    } finally {
      dispose()
    }
  })

  it('adds a new line with default quantity 1', () => {
    const { result: cart, dispose } = withRoot(() => createCart())
    try {
      cart.add(makeArticle())
      flushSync()
      expect(cart.lines).toHaveLength(1)
      expect(cart.lines[0].quantity).toBe(1)
      expect(cart.totals.subtotalNet).toBe(100)
    } finally {
      dispose()
    }
  })

  it('merges duplicate adds into the same line', () => {
    const { result: cart, dispose } = withRoot(() => createCart())
    try {
      cart.add(makeArticle(), 2)
      cart.add(makeArticle(), 3)
      flushSync()
      expect(cart.lines).toHaveLength(1)
      expect(cart.lines[0].quantity).toBe(5)
      expect(cart.totals.subtotalNet).toBe(500)
    } finally {
      dispose()
    }
  })

  it('ignores adds with non-positive quantities', () => {
    const { result: cart, dispose } = withRoot(() => createCart())
    try {
      cart.add(makeArticle(), 0)
      cart.add(makeArticle(), -3)
      flushSync()
      expect(cart.lines).toHaveLength(0)
    } finally {
      dispose()
    }
  })

  it('ignores articles without a price', () => {
    const { result: cart, dispose } = withRoot(() => createCart())
    try {
      cart.add(makeArticle({ currentPriceNet: null }))
      flushSync()
      expect(cart.lines).toHaveLength(0)
    } finally {
      dispose()
    }
  })

  it('setQuantity replaces an existing quantity and removes at <= 0', () => {
    const { result: cart, dispose } = withRoot(() => createCart())
    try {
      cart.add(makeArticle(), 3)
      flushSync()
      cart.setQuantity('a-1', 7)
      flushSync()
      expect(cart.lines[0].quantity).toBe(7)
      cart.setQuantity('a-1', 0)
      flushSync()
      expect(cart.lines).toHaveLength(0)
    } finally {
      dispose()
    }
  })

  it('remove() drops a specific line', () => {
    const { result: cart, dispose } = withRoot(() => createCart())
    try {
      cart.add(makeArticle({ id: 'a-1' }))
      cart.add(makeArticle({ id: 'a-2' }))
      flushSync()
      cart.remove('a-1')
      flushSync()
      expect(cart.lines).toHaveLength(1)
      expect(cart.lines[0].id).toBe('a-2')
    } finally {
      dispose()
    }
  })

  it('clear() empties the cart', () => {
    const { result: cart, dispose } = withRoot(() => createCart())
    try {
      cart.add(makeArticle({ id: 'a-1' }))
      cart.add(makeArticle({ id: 'a-2' }))
      flushSync()
      cart.clear()
      flushSync()
      expect(cart.lines).toHaveLength(0)
      expect(cart.totals.subtotalNet).toBe(0)
    } finally {
      dispose()
    }
  })

  it('persists state to localStorage', () => {
    const { result: cart, dispose } = withRoot(() => createCart())
    try {
      cart.add(makeArticle(), 2)
      flushSync()
      const raw = window.localStorage.getItem('tc.cart.v1')
      expect(raw).toBeTruthy()
      expect(JSON.parse(raw!)).toHaveLength(1)
    } finally {
      dispose()
    }
  })

  it('rehydrates lines from localStorage on next instance', () => {
    const { result: a, dispose: disposeA } = withRoot(() => createCart())
    try {
      a.add(makeArticle(), 4)
      flushSync()
    } finally {
      disposeA()
    }
    const { result: b, dispose: disposeB } = withRoot(() => createCart())
    try {
      expect(b.lines).toHaveLength(1)
      expect(b.lines[0].quantity).toBe(4)
      expect(b.totals.subtotalNet).toBe(400)
    } finally {
      disposeB()
    }
  })
})
