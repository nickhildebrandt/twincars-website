/**
 * @file Remote functions for the used-car portfolio (`/gebrauchtwagen`).
 *
 *  - `getUsedCars`   list of every vehicle currently for sale.
 *  - `getUsedCar`    single vehicle by id.
 *  - `sendInquiry`   form mutation that forwards a customer inquiry
 *                    about a specific vehicle.
 */

import * as v from 'valibot'
import { error } from '@sveltejs/kit'
import { form, query } from '$app/server'
import {
  TwincarsApiError,
  fetchPublicUsedCar,
  fetchPublicUsedCars,
  postPublicContact
} from '$lib/server/api/client'
import type { PublicUsedCar } from '$lib/server/api/types'

/**
 * Reads the entire used-car inventory.
 *
 * @returns Promise resolving to an array of vehicles (may be empty).
 */
export const getUsedCars = query(async (): Promise<PublicUsedCar[]> => {
  return await fetchPublicUsedCars()
})

/**
 * Reads a single used car by id from the dedicated detail endpoint.
 *
 * @param id  Vehicle id (uuid).
 * @returns   Promise resolving to the matched vehicle.
 * @throws    404 SvelteKit error if no vehicle with the given id exists.
 */
export const getUsedCar = query(
  v.pipe(v.string('Fahrzeug-ID erforderlich.'), v.minLength(1)),
  async (id): Promise<PublicUsedCar> => {
    try {
      return await fetchPublicUsedCar(id)
    } catch (e) {
      if (e instanceof TwincarsApiError && e.status === 404) {
        error(404, 'Fahrzeug nicht gefunden.')
      }
      throw e
    }
  }
)

/** Valibot schema for vehicle-inquiry submissions. */
const InquiryInput = v.object({
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
  vehicleId: v.pipe(v.string(), v.minLength(1, 'Fahrzeug-ID erforderlich.')),
  vehicleTitle: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  message: v.pipe(
    v.string('Bitte beschreiben Sie kurz Ihr Anliegen.'),
    v.trim(),
    v.minLength(10, 'Bitte schreiben Sie mindestens 10 Zeichen.'),
    v.maxLength(4000, 'Nachricht ist zu lang.')
  ),
  /** Honeypot field — bots fill in, real users leave blank. */
  website: v.optional(v.pipe(v.string(), v.maxLength(0, 'Spam erkannt.')))
})

/** Outcome of an inquiry submission. */
export type InquiryResult =
  | { status: 'ok'; inquiryId: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string }

/**
 * Submits a vehicle inquiry. Returns a discriminated union so the UI can
 * gracefully degrade when the contact endpoint isn't reachable yet.
 *
 * @param data  Validated inquiry payload.
 * @returns     Inquiry outcome.
 */
export const sendInquiry = form(
  InquiryInput,
  async (data): Promise<InquiryResult> => {
    try {
      const res = await postPublicContact({
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone || undefined,
        subject: `Anfrage zu Fahrzeug: ${data.vehicleTitle}`,
        message: data.message,
        referenceId: data.vehicleId,
        referenceType: 'used-car'
      })
      return { status: 'ok', inquiryId: res.inquiryId }
    } catch (e) {
      if (e instanceof TwincarsApiError && (e.status === 404 || e.code === 'NOT_FOUND')) {
        return {
          status: 'unavailable',
          message:
            'Das Anfrageformular wird gerade noch implementiert. Bitte rufen Sie uns an oder schreiben Sie eine E-Mail.'
        }
      }
      if (e instanceof TwincarsApiError) {
        return { status: 'error', message: e.message }
      }
      return {
        status: 'error',
        message: 'Unerwarteter Fehler. Bitte versuchen Sie es erneut.'
      }
    }
  }
)
