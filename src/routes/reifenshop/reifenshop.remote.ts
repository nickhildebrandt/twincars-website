/**
 * @file Remote functions for the Reifenshop (`/reifenshop`).
 *
 *  - `getArticles`         catalogue of online-sellable articles.
 *  - `getArticle`          single article by id (resolved client-side).
 *  - `getShippingOptions`  shipping options offered at checkout.
 *  - `placeOrder`          forwards an order to the workshop. Until
 *                          twincars-manager exposes a dedicated orders
 *                          endpoint (see MISSING_APIS.md), this routes
 *                          through the generic contact endpoint with a
 *                          structured message body.
 */

import * as v from 'valibot'
import { error } from '@sveltejs/kit'
import { form, query } from '$app/server'
import {
  TwincarsApiError,
  fetchPublicArticles,
  fetchPublicShippingOptions,
  postPublicContact
} from '$lib/server/api/client'
import type { PublicArticle, PublicShippingOption } from '$lib/server/api/types'

/** Reads every article currently for sale. */
export const getArticles = query(async (): Promise<PublicArticle[]> => {
  return await fetchPublicArticles()
})

/**
 * Reads a single article by id. Falls back to filtering the full list
 * because the manager has no dedicated detail endpoint yet.
 *
 * @param id  Article id (uuid).
 * @returns   Promise resolving to the matched article.
 * @throws    404 SvelteKit error if no article with the given id exists.
 */
export const getArticle = query(
  v.pipe(v.string('Artikel-ID erforderlich.'), v.minLength(1)),
  async (id): Promise<PublicArticle> => {
    const all = await fetchPublicArticles()
    const found = all.find((a) => a.id === id)
    if (!found) error(404, 'Artikel nicht gefunden.')
    return found
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
 * (encoded into a hidden `cart` JSON field) so we transform them.
 */
const CartLineInput = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  articleNumber: v.optional(v.nullable(v.string())),
  description: v.pipe(v.string(), v.minLength(1)),
  unitPriceNet: v.pipe(v.number(), v.minValue(0)),
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
  | { status: 'ok'; orderRef: string; totalNet: number }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string }

/**
 * Serialises the cart into a human-readable message body.
 *
 * @param lines  Cart lines.
 * @returns      One line per article + totals.
 */
function summariseCart(lines: ReadonlyArray<v.InferOutput<typeof CartLineInput>>): {
  body: string
  totalNet: number
} {
  let total = 0
  const items = lines.map((l) => {
    const lineTotal = l.unitPriceNet * l.quantity
    total += lineTotal
    const sku = l.articleNumber ? ` (${l.articleNumber})` : ''
    return `  · ${l.quantity}× ${l.description}${sku} — ${lineTotal.toFixed(2)} €`
  })
  return { body: items.join('\n'), totalNet: total }
}

/**
 * Forwards an order to the workshop. Until the manager exposes a
 * dedicated orders endpoint, the order is sent through the contact
 * endpoint with a structured message body so the workshop can process
 * it manually.
 *
 * @param data  Validated checkout payload.
 * @returns     Outcome including a customer-facing reference.
 */
export const placeOrder = form(
  PlaceOrderInput,
  async (data): Promise<PlaceOrderResult> => {
    const { body, totalNet } = summariseCart(data.cart)
    const message =
      `Neue Online-Bestellung\n\n` +
      `Versandoption: ${data.shippingOptionId}\n` +
      `Lieferadresse:\n  ${data.customerName}\n  ${data.street}\n  ${data.zip} ${data.city}\n\n` +
      `Positionen:\n${body}\n\n` +
      `Zwischensumme (netto): ${totalNet.toFixed(2)} €\n\n` +
      (data.notes ? `Anmerkung:\n${data.notes}\n` : '')

    try {
      const res = await postPublicContact({
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone || undefined,
        subject: `Online-Bestellung über ${data.cart.length} Position(en)`,
        message,
        referenceType: 'general'
      })
      return { status: 'ok', orderRef: res.inquiryId, totalNet }
    } catch (e) {
      if (e instanceof TwincarsApiError && (e.status === 404 || e.code === 'NOT_FOUND')) {
        return {
          status: 'unavailable',
          message:
            'Der Bestellprozess wird gerade noch implementiert. Bitte rufen Sie uns an oder schreiben Sie eine E-Mail mit Ihrem Warenkorb.'
        }
      }
      if (e instanceof TwincarsApiError) {
        return { status: 'error', message: e.message }
      }
      return {
        status: 'error',
        message: 'Unerwarteter Fehler beim Übermitteln der Bestellung. Bitte erneut versuchen.'
      }
    }
  }
)
