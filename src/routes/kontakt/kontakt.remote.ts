/**
 * @file Remote function for the general contact form (`/kontakt`).
 */

import * as v from 'valibot'
import { form } from '$app/server'
import { TwincarsApiError, postPublicContact } from '$lib/server/api/client'

/** Schema for general contact submissions. */
const ContactInput = v.object({
  customerName: v.pipe(
    v.string('Bitte geben Sie Ihren Namen an.'),
    v.trim(),
    v.minLength(2, 'Bitte geben Sie Ihren vollständigen Namen an.'),
    v.maxLength(120)
  ),
  customerEmail: v.pipe(
    v.string('Bitte geben Sie eine E-Mail an.'),
    v.trim(),
    v.email('Bitte geben Sie eine gültige E-Mail-Adresse an.'),
    v.maxLength(200)
  ),
  customerPhone: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(50))),
  subject: v.pipe(
    v.string('Bitte geben Sie einen Betreff an.'),
    v.trim(),
    v.minLength(3),
    v.maxLength(200)
  ),
  message: v.pipe(
    v.string('Bitte schreiben Sie eine Nachricht.'),
    v.trim(),
    v.minLength(10, 'Bitte schreiben Sie mindestens 10 Zeichen.'),
    v.maxLength(4000)
  ),
  website: v.optional(v.pipe(v.string(), v.maxLength(0, 'Spam erkannt.')))
})

/** Outcome of a contact-form submission. */
export type ContactResult =
  | { status: 'ok'; inquiryId: string }
  | { status: 'unavailable'; message: string }
  | { status: 'error'; message: string }

/** Forwards a general inquiry to the workshop via the contact endpoint. */
export const sendContact = form(
  ContactInput,
  async (data): Promise<ContactResult> => {
    try {
      const res = await postPublicContact({
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone || undefined,
        subject: data.subject,
        message: data.message,
        referenceType: 'general'
      })
      return { status: 'ok', inquiryId: res.inquiryId }
    } catch (e) {
      if (e instanceof TwincarsApiError && (e.status === 404 || e.code === 'NOT_FOUND')) {
        return {
          status: 'unavailable',
          message:
            'Das Kontaktformular wird gerade noch implementiert. Bitte rufen Sie uns an oder schreiben Sie eine E-Mail.'
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
