/**
 * @file Remote functions for the appointment-booking flow.
 *
 * All client/server communication for `/termin` runs through here. The
 * page imports `getServices`, `getFreeSlots` and `bookAppointment` and
 * never talks to the Twincars Manager API directly.
 *
 *  - `getServices`     read-only catalogue of bookable services
 *  - `getFreeSlots`    free 15-minute-aligned slots in a date window
 *  - `bookAppointment` form mutation that creates an appointment
 *
 * Errors from the manager API are translated to user-friendly German
 * messages; the 409 "slot taken" case is returned as a non-throwing
 * result so the UI can refresh slots instead of crashing.
 */

import * as v from 'valibot'
import { form, query } from '$app/server'
import {
  TwincarsApiError,
  fetchPublicFreeSlots,
  fetchPublicServices,
  postPublicAppointment
} from '$lib/server/api/client'
import type { PublicService, PublicFreeSlot } from '$lib/server/api/types'

/** Bookable durations (minutes) the customer can pick when no service is selected. */
const DEFAULT_DURATION_MINUTES = 30

/**
 * Reads the catalogue of services the customer can book online.
 *
 * The result is cached by SvelteKit for the lifetime of the page;
 * call `getServices().refresh()` to force a refetch.
 *
 * @returns Promise resolving to an array of `PublicService` (may be empty).
 */
export const getServices = query(async (): Promise<PublicService[]> => {
  return await fetchPublicServices()
})

/**
 * Valibot schema for the `getFreeSlots` query arguments.
 * Uses `isoTimestamp()` to reject anything that isn't a valid ISO 8601
 * datetime — the manager API would reject it later, but failing early
 * gives the user a tighter feedback loop.
 */
const FreeSlotsArgs = v.object({
  from: v.pipe(v.string(), v.isoTimestamp('Ungültiger Zeitraum (Anfang).')),
  to: v.pipe(v.string(), v.isoTimestamp('Ungültiger Zeitraum (Ende).')),
  serviceId: v.optional(v.string()),
  durationMinutes: v.optional(
    v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(480))
  )
})

/**
 * Reads free appointment slots in a given window.
 *
 * @param args.from             Inclusive lower bound (ISO datetime).
 * @param args.to               Exclusive upper bound (ISO datetime).
 * @param args.serviceId        Service whose duration should drive slot length.
 * @param args.durationMinutes  Override slot length when no service is picked.
 * @returns Promise resolving to a chronologically ordered slot list.
 */
export const getFreeSlots = query(
  FreeSlotsArgs,
  async (args): Promise<PublicFreeSlot[]> => {
    return await fetchPublicFreeSlots({
      from: args.from,
      to: args.to,
      service: args.serviceId,
      durationMinutes: args.durationMinutes ?? DEFAULT_DURATION_MINUTES
    })
  }
)

/**
 * Valibot schema for the `bookAppointment` form. Field names match the
 * `name=""` attributes used in the booking form so that issues map
 * directly back to the right input.
 */
const BookAppointmentInput = v.object({
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
  serviceId: v.optional(v.pipe(v.string(), v.trim())),
  startsAt: v.pipe(
    v.string('Bitte wählen Sie einen Termin.'),
    v.isoTimestamp('Bitte wählen Sie einen gültigen Termin.')
  ),
  durationMinutes: v.optional(
    v.pipe(
      v.string(),
      v.transform((s) => Number.parseInt(s, 10)),
      v.number(),
      v.integer(),
      v.minValue(1),
      v.maxValue(480)
    )
  ),
  notes: v.optional(
    v.pipe(v.string(), v.trim(), v.maxLength(2000, 'Nachricht ist zu lang.'))
  ),
  /** Honeypot — hidden field that real users leave blank. */
  website: v.optional(v.pipe(v.string(), v.maxLength(0, 'Spam erkannt.')))
})

/** Shape of the success payload returned to the page on a confirmed booking. */
export interface BookAppointmentOk {
  status: 'ok'
  appointmentId: string
  startsAt: string
  endsAt: string
}

/** Shape of the soft-failure payload (used for 409 / API errors). */
export interface BookAppointmentSoftError {
  status: 'slot_taken' | 'error'
  message: string
}

/** Discriminated union returned by `bookAppointment`. */
export type BookAppointmentResult = BookAppointmentOk | BookAppointmentSoftError

/**
 * Submits a new appointment booking to the Twincars Manager.
 *
 * Returns a discriminated union instead of throwing so that the UI can
 * handle "slot was taken since you opened the form" gracefully — that's
 * a real-world race we expect, not a bug.
 *
 * @param data  Validated form values (see `BookAppointmentInput` schema).
 * @returns     Outcome of the booking attempt.
 */
export const bookAppointment = form(
  BookAppointmentInput,
  async (data): Promise<BookAppointmentResult> => {
    try {
      const res = await postPublicAppointment({
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone || undefined,
        serviceId: data.serviceId || undefined,
        startsAt: data.startsAt,
        durationMinutes: data.durationMinutes,
        notes: data.notes || undefined
      })
      return {
        status: 'ok',
        appointmentId: res.appointmentId,
        startsAt: res.startsAt,
        endsAt: res.endsAt
      }
    } catch (e) {
      if (e instanceof TwincarsApiError) {
        if (e.status === 409) {
          return {
            status: 'slot_taken',
            message:
              'Dieser Termin ist soeben vergeben worden. Bitte wählen Sie einen anderen freien Slot.'
          }
        }
        return { status: 'error', message: e.message }
      }
      return {
        status: 'error',
        message: 'Unerwarteter Fehler beim Buchen. Bitte versuchen Sie es erneut.'
      }
    }
  }
)
