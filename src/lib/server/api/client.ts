/**
 * @file Twincars Manager public-API client.
 *
 * Tiny `fetch` wrapper that knows three things the rest of the app
 * shouldn't have to:
 *
 *  1. Where the manager is hosted (`config.apiUrl`).
 *  2. The `Authorization: Bearer …` header.
 *  3. The `{ data }` / `{ error }` envelope returned by every endpoint.
 *
 * Functions here are intentionally narrow: one per public endpoint.
 * Higher-level concerns (caching, transformation, error UX) live in
 * the `*.remote.ts` files that call into this module.
 */

import { config } from '../config'
import type {
  ApiErr,
  ApiOk,
  PublicAppointmentInput,
  PublicAppointmentResult,
  PublicArticle,
  PublicContactInput,
  PublicContactResult,
  PublicFreeSlot,
  PublicService,
  PublicShippingOption,
  PublicUsedCar
} from './types'

/**
 * Thrown when the manager API responds with a non-2xx status or an
 * `error` envelope. The original `code` and HTTP `status` are kept so
 * callers can branch on them (e.g. 409 → "slot already taken").
 */
export class TwincarsApiError extends Error {
  /**
   * @param message  Human-readable message (German, suitable for UI).
   * @param code     Stable error code from the API envelope.
   * @param status   HTTP status code.
   */
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number
  ) {
    super(message)
    this.name = 'TwincarsApiError'
  }
}

/**
 * Performs a request against the manager API and unwraps the `{ data }`
 * envelope. Throws `TwincarsApiError` on any failure — both transport
 * (network, JSON parse) and application-level (`{ error }` envelope or
 * non-2xx status).
 *
 * @typeParam T  Expected shape of the `data` field.
 * @param path   Path under the manager origin (must start with `/`).
 * @param init   Optional fetch init (method, body, query params, …).
 * @returns The unwrapped response payload.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${config.apiUrl}${path}`
  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${config.apiToken}`)
  headers.set('Accept', 'application/json')
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(url, { ...init, headers })
  } catch (cause) {
    throw new TwincarsApiError(
      `Verbindung zum Twincars Manager fehlgeschlagen (${url}).`,
      'NETWORK',
      0
    )
  }

  let payload: ApiOk<T> | ApiErr
  try {
    payload = (await response.json()) as ApiOk<T> | ApiErr
  } catch (cause) {
    throw new TwincarsApiError(
      'Antwort des Twincars Managers ist kein gültiges JSON.',
      'BAD_RESPONSE',
      response.status
    )
  }

  if (!response.ok || 'error' in payload) {
    const err = 'error' in payload ? payload.error : undefined
    throw new TwincarsApiError(
      err?.message ?? `Manager-API antwortete mit Status ${response.status}.`,
      err?.code ?? 'UNKNOWN',
      response.status
    )
  }

  return payload.data
}

/**
 * Builds a query string from an object. Skips keys whose value is
 * `undefined`/`null`/empty. Does not URL-encode arrays (none of the
 * current endpoints need it).
 */
function qs(params: Record<string, string | number | undefined | null>): string {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    usp.set(k, String(v))
  }
  const s = usp.toString()
  return s ? `?${s}` : ''
}

// ----------------------------------------------------------------------------
// One function per public endpoint.
// ----------------------------------------------------------------------------

/**
 * Fetches the catalog of bookable workshop services.
 *
 * @returns Promise resolving to an array of services (may be empty).
 */
export function fetchPublicServices(): Promise<PublicService[]> {
  return request<{ services: PublicService[] }>('/api/public/services').then(
    (d) => d.services
  )
}

/**
 * Fetches all online-sellable articles (tires, accessories, …).
 *
 * @returns Promise resolving to an array of articles (may be empty).
 */
export function fetchPublicArticles(): Promise<PublicArticle[]> {
  return request<{ articles: PublicArticle[] }>('/api/public/articles').then(
    (d) => d.articles
  )
}

/**
 * Fetches the available shipping options for the online shop.
 *
 * @returns Promise resolving to an array of shipping options.
 */
export function fetchPublicShippingOptions(): Promise<PublicShippingOption[]> {
  return request<{ options: PublicShippingOption[] }>(
    '/api/public/shipping-options'
  ).then((d) => d.options)
}

/**
 * Fetches the used-car (Gebrauchtwagen) inventory currently for sale.
 *
 * @returns Promise resolving to an array of vehicles with embedded photos.
 */
export function fetchPublicUsedCars(): Promise<PublicUsedCar[]> {
  return request<{ vehicles: PublicUsedCar[] }>('/api/public/used-cars').then(
    (d) => d.vehicles
  )
}

/**
 * Fetches free appointment slots in the given window.
 *
 * @param params.from             ISO datetime (inclusive lower bound).
 * @param params.to               ISO datetime (exclusive upper bound, max 60 days from).
 * @param params.durationMinutes  Override for slot length (1–480). Default 30.
 * @param params.service          Service id whose `attributes.durationMinutes` wins.
 * @returns Promise resolving to an ordered list of 15-minute-aligned slots.
 */
export function fetchPublicFreeSlots(params: {
  from: string
  to: string
  durationMinutes?: number
  service?: string
}): Promise<PublicFreeSlot[]> {
  const query = qs({
    from: params.from,
    to: params.to,
    durationMinutes: params.durationMinutes,
    service: params.service
  })
  return request<{ slots: PublicFreeSlot[] }>(
    `/api/public/free-slots${query}`
  ).then((d) => d.slots)
}

/**
 * Books a new appointment.
 *
 * @param input  Customer + slot + (optional) service + notes.
 * @returns      Promise resolving to the created appointment metadata.
 * @throws TwincarsApiError 409 if the slot was taken between fetch and book.
 */
export function postPublicAppointment(
  input: PublicAppointmentInput
): Promise<PublicAppointmentResult> {
  return request<PublicAppointmentResult>('/api/public/appointments', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

/**
 * Submits a contact / inquiry form.
 *
 * **NOTE:** `/api/public/contact` is not yet implemented in twincars-manager
 * — see `MISSING_APIS.md`. Once the manager exposes the endpoint, this
 * function will start working without further changes here.
 *
 * @param input  Contact-form payload.
 * @returns      Inquiry metadata (id + timestamp).
 */
export function postPublicContact(
  input: PublicContactInput
): Promise<PublicContactResult> {
  return request<PublicContactResult>('/api/public/contact', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}
