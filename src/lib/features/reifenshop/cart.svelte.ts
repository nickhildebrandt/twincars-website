/**
 * @file Browser-side cart store for the Reifenshop.
 *
 * The cart lives in `localStorage` (key `tc.cart.v1`) so it survives
 * page reloads, but we never persist it on the server. Checkout takes a
 * snapshot of the cart via a hidden form field; the server has no
 * knowledge of the shopping cart until the order is placed.
 *
 * The store is a Svelte 5 rune-backed object exported through the
 * factory `createCart()` — instantiated once in
 * `$features/reifenshop/cart-context.svelte.ts` so the same reactive
 * `$state` is shared across components.
 */

import { browser } from '$app/environment'
import type { PublicArticle } from '$lib/server/api/types'

/** A single cart line — the article snapshot plus the quantity. */
export interface CartLine {
  /** Article id (uuid). */
  id: string
  /** Article number (SKU) at time of adding. */
  articleNumber: string | null
  /** Human-readable description / title. */
  description: string
  /** Unit price (net, EUR) at time of adding. */
  unitPriceNet: number
  /** Selected quantity. */
  quantity: number
  /** Free-form attributes (size, season, …) at time of adding. */
  attributes: Record<string, string | number | boolean | null>
  /** Shipping group of the article (drives the available shipping options). */
  shippingOptionId: string | null
}

/** Total summary derived from the cart lines. */
export interface CartTotals {
  /** Number of distinct line items. */
  lineCount: number
  /** Sum of quantities across all lines. */
  totalQuantity: number
  /** Sum of `quantity * unitPriceNet` across all lines. */
  subtotalNet: number
}

/** LocalStorage key used to persist the cart between visits. */
const STORAGE_KEY = 'tc.cart.v1'

/**
 * Reads the cart from `localStorage`. Returns an empty cart in any
 * environment that isn't a browser or whose storage contains
 * unparsable JSON.
 *
 * @returns Recovered cart lines, or `[]` on any failure.
 */
function loadFromStorage(): CartLine[] {
  if (!browser) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (l): l is CartLine =>
        l != null &&
        typeof l === 'object' &&
        typeof (l as CartLine).id === 'string' &&
        typeof (l as CartLine).quantity === 'number' &&
        typeof (l as CartLine).unitPriceNet === 'number'
    )
  } catch {
    return []
  }
}

/**
 * Writes the given lines to `localStorage`. Silent no-op outside the
 * browser or when storage is full / disabled.
 *
 * @param lines  Cart lines to persist.
 */
function persist(lines: CartLine[]): void {
  if (!browser) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // ignore storage quota / disabled errors
  }
}

/**
 * Builds a snapshot of the line totals.
 *
 * @param lines  Lines to summarise.
 * @returns      Counts and net subtotal.
 */
function computeTotals(lines: CartLine[]): CartTotals {
  let subtotalNet = 0
  let totalQuantity = 0
  for (const l of lines) {
    subtotalNet += l.unitPriceNet * l.quantity
    totalQuantity += l.quantity
  }
  return { lineCount: lines.length, totalQuantity, subtotalNet }
}

/** Public cart API — methods all return `void` and mutate in place. */
export interface CartStore {
  /** Reactive snapshot of the current lines (treat as read-only). */
  readonly lines: CartLine[]
  /** Reactive totals derived from the lines. */
  readonly totals: CartTotals
  /** Adds (or increases) a line for the given article. */
  add(article: PublicArticle, qty?: number): void
  /** Replaces the quantity of an existing line. Removes the line at qty ≤ 0. */
  setQuantity(id: string, qty: number): void
  /** Removes the line with the given article id. */
  remove(id: string): void
  /** Removes every line. */
  clear(): void
}

/**
 * Creates a fresh cart store. Instantiate exactly once per app via
 * `getCart()` in `cart-context.svelte.ts` and share through context.
 *
 * @returns A reactive cart store.
 */
export function createCart(): CartStore {
  let lines = $state<CartLine[]>(loadFromStorage())
  const totals = $derived(computeTotals(lines))

  function syncStorage(): void {
    persist(lines)
  }

  return {
    get lines() {
      return lines
    },
    get totals() {
      return totals
    },
    add(article: PublicArticle, qty = 1) {
      if (qty <= 0) return
      if (article.currentPriceNet == null) return
      const existing = lines.find((l) => l.id === article.id)
      if (existing) {
        existing.quantity += qty
      } else {
        lines.push({
          id: article.id,
          articleNumber: article.articleNumber,
          description: article.description,
          unitPriceNet: article.currentPriceNet,
          quantity: qty,
          attributes: { ...article.attributes },
          shippingOptionId: article.shippingOptionId
        })
      }
      syncStorage()
    },
    setQuantity(id: string, qty: number) {
      const idx = lines.findIndex((l) => l.id === id)
      if (idx === -1) return
      if (qty <= 0) {
        lines.splice(idx, 1)
      } else {
        lines[idx].quantity = qty
      }
      syncStorage()
    },
    remove(id: string) {
      const idx = lines.findIndex((l) => l.id === id)
      if (idx === -1) return
      lines.splice(idx, 1)
      syncStorage()
    },
    clear() {
      lines.splice(0, lines.length)
      syncStorage()
    }
  }
}
