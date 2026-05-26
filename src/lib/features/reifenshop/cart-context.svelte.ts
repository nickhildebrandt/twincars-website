/**
 * @file Context plumbing for the shared cart store.
 *
 * The cart is a single instance of `CartStore` that lives for the
 * lifetime of the SPA. We attach it once at the root layout via
 * `setContext` and read it from any descendant via `getContext`.
 */

import { getContext, setContext } from 'svelte'
import { createCart, type CartStore } from './cart.svelte'

/** Context key. Kept as a unique symbol so callers can't pass strings. */
const CART_KEY = Symbol('twincars.cart')

/**
 * Creates a cart store and attaches it to the component tree.
 * Call exactly once — typically from `+layout.svelte`.
 *
 * @returns The newly created store (also accessible via `getCart()`).
 */
export function provideCart(): CartStore {
  const cart = createCart()
  setContext(CART_KEY, cart)
  return cart
}

/**
 * Reads the cart store attached by an ancestor.
 *
 * @returns The shared cart store.
 * @throws  When called outside a tree that previously called `provideCart()`.
 */
export function useCart(): CartStore {
  const cart = getContext<CartStore | undefined>(CART_KEY)
  if (!cart) {
    throw new Error(
      'useCart() called without a provider. Did you forget to call provideCart() in +layout.svelte?'
    )
  }
  return cart
}
