/**
 * @file Shared types for the Twincars Manager public API.
 *
 * Mirror of the response shapes documented at
 * `https://<manager-host>/api/public` (see project docs). Keep in
 * sync if the upstream API changes — there is no codegen.
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
 * Free-form attribute bag attached to services. Tire-specific data
 * lives on `PublicTire` itself; services keep this open-ended.
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

/** A photo attached to a tire (base64 data-URL in `url`). */
export interface PublicTirePhoto {
  mime: string
  url: string
}

/** A single tire from the public catalogue. */
export interface PublicTire {
  id: string
  articleNumber: string
  brand: string
  model: string
  width: number
  aspectRatio: number
  construction: string
  diameterInch: number
  sizeLabel: string
  loadIndex: string | null
  speedIndex: string | null
  season: 'Sommer' | 'Winter' | 'Ganzjahres'
  ean: string | null
  manufacturerPartNumber: string | null
  fuelEfficiency: string | null
  wetGrip: string | null
  noiseClass: string | null
  noiseDb: number | null
  runFlat: boolean
  reinforced: boolean
  studdedWinter: boolean
  mSMarking: boolean
  snowFlake: boolean
  evCertified: boolean
  description: string
  currentPriceNet: number | null
  photos: PublicTirePhoto[]
  shippingOptionId: string | null
}

/** Filter parameters accepted by `GET /tires`. */
export interface PublicTireFilters {
  q?: string
  size?: string
  season?: 'Sommer' | 'Winter' | 'Ganzjahres'
  brand?: string
  maxPriceNet?: number
}

/** A shipping option offered at checkout. */
export interface PublicShippingOption {
  id: string
  name: string
  description: string | null
  priceNet: number
  freeAboveNet: number | null
}

/**
 * A used-car photo. The API keeps the historical `dataUrl` key for
 * used cars (vs. `url` on tire photos) — that's a documented
 * compatibility wart, not a typo.
 */
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

/** Input shape for `POST /api/public/appointments`. */
export interface PublicAppointmentInput {
  customerEmail: string
  customerName: string
  customerPhone?: string
  serviceId?: string
  startsAt: string
  durationMinutes?: number
  notes?: string
}

/** Address block sent with `POST /api/public/orders`. */
export interface PublicOrderAddress {
  street: string
  zip: string
  city: string
}

/** A single line item on an outgoing order. */
export interface PublicOrderLineInput {
  tireId: string
  quantity: number
}

/** Input shape for `POST /api/public/orders`. */
export interface PublicOrderInput {
  customerEmail: string
  customerName: string
  customerPhone?: string
  deliveryAddress: PublicOrderAddress
  shippingOptionId: string
  lines: PublicOrderLineInput[]
  notes?: string
}

/** Response payload after a successful order submission. */
export interface PublicOrderResult {
  orderId: string
  orderNumber: string
  totalNet: number
  totalGross: number
  shippingNet: number
  estimatedDelivery: string | null
}

/**
 * Input shape for `POST /api/public/contact` — covers the general
 * contact form, vehicle inquiries, tire inquiries and generic
 * questions through the `referenceType` discriminator.
 */
export interface PublicContactInput {
  customerEmail: string
  customerName: string
  customerPhone?: string
  subject: string
  message: string
  /** Optional reference — used-car id, tire id, article id, … */
  referenceId?: string
  /** What `referenceId` points to. */
  referenceType?: 'used-car' | 'tire' | 'article' | 'general'
}

/** Result of a successful `POST /api/public/contact` submission. */
export interface PublicContactResult {
  inquiryId: string
  receivedAt: string
}
