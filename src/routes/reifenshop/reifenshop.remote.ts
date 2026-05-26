/**
 * @file Remote functions for the Reifenshop (`/reifenshop`).
 *
 *  - `getTires`            tire catalogue currently for sale.
 *  - `getTire`             single tire by id.
 *  - `getShippingOptions`  shipping options offered at checkout.
 *  - `placeOrder`          submits an order to the manager's
 *                          `/api/public/orders` endpoint.
 */

import * as v from 'valibot'
import { error } from '@sveltejs/kit'
import { form, query } from '$app/server'
import {
  TwincarsApiError,
  fetchPublicShippingOptions,
  fetchPublicTire,
  fetchPublicTires,
  postPublicOrder
} from '$lib/server/api/client'
import type { PublicShippingOption, PublicTire } from '$lib/server/api/types'

/** Reads every tire currently for sale. */
export const getTires = query(async (): Promise<PublicTire[]> => {
  return await fetchPublicTires()
})

/**
 * Reads a single tire by id from the dedicated detail endpoint.
 *
 * @param id  Tire id (uuid).
 * @returns   Promise resolving to the matched tire.
 * @throws    404 SvelteKit error if no tire with the given id exists.
 */
export const getTire = query(
  v.pipe(v.string('Reifen-ID erforderlich.'), v.minLength(1)),
  async (id): Promise<PublicTire> => {
    try {
      return await fetchPublicTire(id)
    } catch (e) {
      if (e instanceof TwincarsApiError && e.status === 404) {
        error(404, 'Reifen nicht gefunden.')
      }
      throw e
    }
  }
)

/** Reads the shipping options offered at checkout. */
export const getShippingOptions = query(
  async (): Promise<PublicShippingOption[]> => {
    return await fetchPublicShippingOptions()
  }
)

/**
 * Schema for a single submitted cart line. Numbers come in as strings
 * (encoded into a hidden `cart` JSON field) so we parse them.
 */
const CartLineInput = v.object({
  tireId: v.pipe(v.string(), v.minLength(1)),
  quantity: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(99))
})

/** Schema for the entire checkout submission. */
const PlaceOrderInput = v.object({
  customerName: v.pipe(
    v.string('Bitte geben Sie Ihren Namen an.'),
    v.trim(),
    v.minLength(2, 'Bitte geben Sie Ihren vollständigen Namen an.'),
    v.maxLength(120, 'Name ist zu lang.')
  ),
  customerEmail: v.pipe(
    v.string('Bitte geben Sie eine E-Mail an.'),
    v.trim(),
    v.email('Bitte geben Sie eine gültige E-Mail-Adresse an.'),
    v.maxLength(200, 'E-Mail ist zu lang.')
  ),
  customerPhone: v.optional(
    v.pipe(v.string(), v.trim(), v.maxLength(50, 'Telefonnummer ist zu lang.'))
  ),
  street: v.pipe(
    v.string('Straße ist erforderlich.'),
    v.trim(),
    v.minLength(2),
    v.maxLength(200)
  ),
  zip: v.pipe(
    v.string('PLZ ist erforderlich.'),
    v.trim(),
    v.regex(/^\d{4,5}$/, 'Bitte eine gültige PLZ angeben.')
  ),
  city: v.pipe(
    v.string('Ort ist erforderlich.'),
    v.trim(),
    v.minLength(2),
    v.maxLength(120)
  ),
  shippingOptionId: v.pipe(
    v.string('Bitte wählen Sie eine Versandoption.'),
    v.minLength(1)
  ),
  notes: v.optional(
    v.pipe(v.string(), v.trim(), v.maxLength(2000, 'Nachricht ist zu lang.'))
  ),
  /** JSON-encoded cart snapshot (hidden field in the checkout form). */
  cart: v.pipe(
    v.string('Der Warenkorb ist leer.'),
    v.transform((raw) => JSON.parse(raw)),
    v.array(CartLineInput),
    v.minLength(1, 'Der Warenkorb ist leer.')
  ),
  /** Honeypot — bots fill in, real users leave blank. */
  website: v.optional(v.pipe(v.string(), v.maxLength(0, 'Spam erkannt.')))
})

/** Outcome of a placed order. */
export type PlaceOrderResult =
  | {
      status: 'ok'
      orderId: string
      orderNumber: string
      totalNet: number
      totalGross: number
      shippingNet: number
      estimatedDelivery: string | null
    }
  | { status: 'error'; message: string }

/**
 * Submits the order to the manager's orders endpoint. Returns a
 * discriminated union so the UI can render the confirmation directly.
 *
 * @param data  Validated checkout payload.
 * @returns     Order outcome including order number and totals.
 */
export const placeOrder = form(
  PlaceOrderInput,
  async (data): Promise<PlaceOrderResult> => {
    try {
      const result = await postPublicOrder({
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone || undefined,
        deliveryAddress: {
          street: data.street,
          zip: data.zip,
          city: data.city
        },
        shippingOptionId: data.shippingOptionId,
        lines: data.cart.map((l) => ({
          tireId: l.tireId,
          quantity: l.quantity
        })),
        notes: data.notes || undefined
      })
      return {
        status: 'ok',
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        totalNet: result.totalNet,
        totalGross: result.totalGross,
        shippingNet: result.shippingNet,
        estimatedDelivery: result.estimatedDelivery
      }
    } catch (e) {
      if (e instanceof TwincarsApiError) {
        return { status: 'error', message: e.message }
      }
      return {
        status: 'error',
        message:
          'Unerwarteter Fehler beim Übermitteln der Bestellung. Bitte erneut versuchen.'
      }
    }
  }
)
