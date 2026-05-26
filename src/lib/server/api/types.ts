/**
 * @file Shared types for the Twincars Manager public API responses.
 *
 * These types mirror the shapes returned by the Twincars Manager
 * project (see /home/nick/tc/twincars-manager/src/lib/server/public-api.ts).
 * Keep them in sync if the manager API changes.
 */

/** Envelope wrapping every successful public-API response. */
export interface ApiOk<T> {
  data: T
}

/** Envelope returned for any non-2xx public-API response. */
export interface ApiErr {
  error: { code: string; message: string }
}

/**
 * Free-form attribute bag attached to items (services and articles).
 * Tire-specific keys (size, profile, season, DOT year) live here.
 */
export type ItemAttributes = Record<string, string | number | boolean | null>

/** A single workshop service offered for online appointment booking. */
export interface PublicService {
  id: string
  articleNumber: string | null
  description: string
  unit: string
  currentPriceNet: number | null
  attributes: ItemAttributes
}

/** A single online-sellable product (tire, accessory, ...). */
export interface PublicArticle {
  id: string
  articleNumber: string | null
  description: string
  unit: string
  currentPriceNet: number | null
  attributes: ItemAttributes
  shippingOptionId: string | null
}

/** A shipping option offered at checkout. */
export interface PublicShippingOption {
  id: string
  name: string
  description: string | null
  priceNet: number
  freeAboveNet: number | null
}

/** A used-car photo (data-URL — see Manager `vehicle-service.ts`). */
export interface PublicUsedCarPhoto {
  mime: string
  dataUrl: string
}

/** A used car offered for sale (Gebrauchtwagen). */
export interface PublicUsedCar {
  id: string
  make: string | null
  model: string | null
  firstRegistration: string | null
  mileageKm: number | null
  priceGross: number | null
  fuel: string | null
  transmission: string | null
  description: string | null
  photos: PublicUsedCarPhoto[]
}

/** A single free time slot returned by `/api/public/free-slots`. */
export interface PublicFreeSlot {
  startsAt: string
  endsAt: string
}

/** Response from booking an appointment. */
export interface PublicAppointmentResult {
  appointmentId: string
  startsAt: string
  endsAt: string
  confirmationToken: string
}

/** Input shape for `/api/public/appointments`. */
export interface PublicAppointmentInput {
  customerEmail: string
  customerName: string
  customerPhone?: string
  serviceId?: string
  startsAt: string
  durationMinutes?: number
  notes?: string
}

/**
 * Input shape for `/api/public/contact` — used both for general
 * contact form submissions and for used-car / shop product inquiries.
 *
 * NOTE: This endpoint is not yet implemented in twincars-manager.
 * See `MISSING_APIS.md` in the project root.
 */
export interface PublicContactInput {
  customerEmail: string
  customerName: string
  customerPhone?: string
  subject: string
  message: string
  /** Optional reference — used-car id, article id, … */
  referenceId?: string
  /** What the reference points to (`used-car`, `article`, `general`). */
  referenceType?: 'used-car' | 'article' | 'general'
}

/** Result of a successful `/api/public/contact` submission. */
export interface PublicContactResult {
  inquiryId: string
  receivedAt: string
}
