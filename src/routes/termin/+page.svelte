<script lang="ts">
  /**
   * Appointment booking page (`/termin`).
   *
   * Multi-step flow:
   *   1. **service**  – pick a service from the manager catalogue (optional).
   *   2. **slot**     – calendar + free-slot picker.
   *   3. **contact**  – name / e-mail / phone / notes, submit.
   *   4. **done**     – confirmation view.
   *
   * The state lives in this component (not in URL params) so the user
   * can step back and forth without server round-trips. Every read from
   * the API goes through `*.remote.ts` (SvelteKit Remote Functions).
   */
  import { ArrowLeft, ArrowRight, CalendarCheck, CheckCircle2, Clock, Wrench } from '@lucide/svelte'
  import BookingCalendar from '$components/BookingCalendar.svelte'
  import Seo from '$components/Seo.svelte'
  import { company } from '$lib/company'
  import {
    endOfDay,
    formatGermanDate,
    formatTime,
    startOfDay,
    toIsoDate
  } from '$features/termin/calendar'
  import { bookAppointment, getFreeSlots, getServices } from './termin.remote'
  import type { PublicService } from '$lib/server/api/types'

  /** Step in the multi-step booking flow. */
  type Step = 'service' | 'slot' | 'contact' | 'done'

  let step = $state<Step>('service')

  /** Selected service from the API catalogue. `null` means "no preference". */
  let selectedService = $state<PublicService | null>(null)

  /** Selected calendar day, `YYYY-MM-DD`. Empty = nothing selected yet. */
  let selectedDay = $state<string>('')

  /** Selected slot (ISO timestamp from the API). Empty = nothing selected yet. */
  let selectedSlot = $state<string>('')

  /**
   * Service duration used both for fetching free slots and for sending
   * along with the booking. Falls back to a sensible 30-minute default
   * when no service is selected.
   */
  const durationMinutes = $derived(extractDurationMinutes(selectedService))

  /** Display title for the selected service (falls back to "Allgemeiner Termin"). */
  const selectedServiceLabel = $derived(
    selectedService?.description.trim() || 'Allgemeiner Termin'
  )

  /**
   * Reads the `durationMinutes` attribute off a service. Manager API
   * stores it as a free-form attribute so we coerce defensively.
   */
  function extractDurationMinutes(svc: PublicService | null): number {
    if (!svc) return 30
    const raw = svc.attributes?.durationMinutes
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return Math.floor(raw)
    if (typeof raw === 'string') {
      const n = Number.parseInt(raw, 10)
      if (Number.isFinite(n) && n > 0) return n
    }
    return 30
  }

  /**
   * Picks a service (or `null` to opt out) and advances to the slot step.
   * @param svc  Service to select, or `null` for "no preference".
   */
  function chooseService(svc: PublicService | null): void {
    selectedService = svc
    step = 'slot'
  }

  /**
   * Goes back one step. Idempotent on the first step.
   */
  function back(): void {
    if (step === 'slot') step = 'service'
    else if (step === 'contact') step = 'slot'
  }

  /**
   * Confirms the chosen slot and moves to the contact-details step.
   * @param slotIso  ISO timestamp of the slot to confirm.
   */
  function chooseSlot(slotIso: string): void {
    selectedSlot = slotIso
    step = 'contact'
  }

  /**
   * Reads the booking-form result and transitions to the confirmation
   * step on success. Slot collisions go back to the slot picker so the
   * customer can pick another one.
   */
  $effect(() => {
    const res = bookAppointment.result
    if (!res) return
    if (res.status === 'ok') {
      step = 'done'
    } else if (res.status === 'slot_taken') {
      step = 'slot'
      selectedSlot = ''
      // Refresh free slots so the just-taken slot disappears.
      void getFreeSlots({
        from: startOfDay(new Date(selectedDay)).toISOString(),
        to: endOfDay(new Date(selectedDay)).toISOString(),
        serviceId: selectedService?.id,
        durationMinutes
      }).refresh()
    }
  })
</script>

<Seo
  title="Termin online buchen – TwinCars Bernau"
  description="Buchen Sie Ihren Werkstatttermin bei TwinCars in Bernau bei Berlin online. Leistung auswählen, freien Slot wählen, fertig. Sofortige Bestätigung."
/>

<section class="bg-gradient-to-br from-neutral via-neutral to-base-300 text-neutral-content py-12 md:py-16" aria-labelledby="termin-title">
  <div class="mx-auto max-w-5xl px-4">
    <p class="badge badge-primary badge-lg gap-2 font-semibold">
      <CalendarCheck class="size-4" aria-hidden="true" />
      Online-Terminbuchung
    </p>
    <h1 id="termin-title" class="mt-4 text-3xl font-bold leading-tight md:text-5xl">
      Termin in wenigen Klicks buchen
    </h1>
    <p class="mt-3 max-w-2xl text-lg opacity-90">
      Wählen Sie die gewünschte Leistung und einen freien Zeitslot. Sie erhalten sofort eine Bestätigung.
    </p>
  </div>
</section>

<section class="bg-base-200 py-12 md:py-16">
  <div class="mx-auto max-w-5xl px-4">
    <ol class="mb-8 grid grid-cols-4 gap-2 text-xs md:text-sm" aria-label="Buchungsfortschritt">
      {#each [
        { id: 'service', label: 'Leistung' },
        { id: 'slot', label: 'Termin' },
        { id: 'contact', label: 'Kontakt' },
        { id: 'done', label: 'Bestätigung' }
      ] as s, i (s.id)}
        {@const isCurrent = step === s.id}
        {@const isDone = ['service', 'slot', 'contact', 'done'].indexOf(step) > i}
        <li
          class="rounded-xl border p-3 text-center font-medium"
          class:border-primary={isCurrent}
          class:bg-primary={isCurrent}
          class:text-primary-content={isCurrent}
          class:border-success={isDone && !isCurrent}
          class:bg-success={isDone && !isCurrent}
          class:text-success-content={isDone && !isCurrent}
          class:border-base-300={!isCurrent && !isDone}
          class:bg-base-100={!isCurrent && !isDone}
          class:text-base-content={!isCurrent && !isDone}
          aria-current={isCurrent ? 'step' : undefined}
        >
          <span class="block text-[0.65rem] font-semibold uppercase tracking-wider">
            Schritt {i + 1}
          </span>
          {s.label}
        </li>
      {/each}
    </ol>

    {#if step === 'service'}
      <div class="space-y-6" data-testid="step-service">
        <header>
          <h2 class="text-2xl font-bold md:text-3xl">Welche Leistung möchten Sie buchen?</h2>
          <p class="text-base-content/80 mt-2">
            Wählen Sie eine Leistung aus, damit wir die passende Zeit reservieren – oder buchen Sie einen allgemeinen Beratungstermin.
          </p>
        </header>

        {#await getServices()}
          <div class="flex items-center gap-3 text-base-content/70" role="status">
            <span class="loading loading-spinner loading-md" aria-hidden="true"></span>
            Lade Leistungen…
          </div>
        {:then services}
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {#each services as svc (svc.id)}
              <button
                type="button"
                onclick={() => chooseService(svc)}
                class="card bg-base-100 border-base-200 hover:border-primary group cursor-pointer border text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div class="card-body">
                  <div class="bg-primary/10 text-primary mb-2 inline-flex size-10 items-center justify-center rounded-xl">
                    <Wrench class="size-5" aria-hidden="true" />
                  </div>
                  <h3 class="card-title text-base">{svc.description}</h3>
                  <p class="text-base-content/70 text-sm">
                    Dauer ca. {extractDurationMinutes(svc)} Min.{#if svc.currentPriceNet != null}
                      &nbsp;· ab {svc.currentPriceNet.toLocaleString('de-DE', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    {/if}
                  </p>
                </div>
              </button>
            {/each}
            <button
              type="button"
              onclick={() => chooseService(null)}
              class="card bg-base-100 border-base-200 border-dashed hover:border-primary border text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div class="card-body">
                <div class="bg-base-200 text-base-content mb-2 inline-flex size-10 items-center justify-center rounded-xl">
                  <Wrench class="size-5" aria-hidden="true" />
                </div>
                <h3 class="card-title text-base">Allgemeiner Termin</h3>
                <p class="text-base-content/70 text-sm">
                  Sie wissen noch nicht genau, was Sie brauchen? Wir besprechen es im Termin.
                </p>
              </div>
            </button>
          </div>
        {:catch err}
          <div role="alert" class="alert alert-error">
            <span>Die Leistungen konnten nicht geladen werden: {err.message}</span>
          </div>
          <button
            type="button"
            class="btn btn-primary mt-3"
            onclick={() => chooseService(null)}
          >
            Trotzdem einen Allgemeinen Termin buchen
          </button>
        {/await}

        <div class="text-base-content/70 text-sm">
          Alternativ erreichen Sie uns telefonisch unter
          <a class="link link-primary" href="tel:{company.contact.phoneE164}">{company.contact.phone}</a>.
        </div>
      </div>
    {:else if step === 'slot'}
      <div class="space-y-6" data-testid="step-slot">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-2xl font-bold md:text-3xl">Wann darf es sein?</h2>
            <p class="text-base-content/80 mt-2">
              Gewählte Leistung: <strong>{selectedServiceLabel}</strong> · Dauer ca. {durationMinutes} Min.
            </p>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" onclick={back}>
            <ArrowLeft class="size-4" aria-hidden="true" />
            Leistung ändern
          </button>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <BookingCalendar bind:selected={selectedDay} />

          <div>
            {#if !selectedDay}
              <div class="bg-base-100 border-base-200 rounded-2xl border p-6 text-center text-base-content/70">
                <Clock class="text-primary mx-auto size-8" aria-hidden="true" />
                <p class="mt-3 font-medium">Wählen Sie einen Tag im Kalender</p>
                <p class="text-sm">Wir zeigen Ihnen alle freien Zeitfenster.</p>
              </div>
            {:else}
              {@const dayStart = startOfDay(new Date(selectedDay)).toISOString()}
              {@const dayEnd = endOfDay(new Date(selectedDay)).toISOString()}
              <div class="bg-base-100 border-base-200 rounded-2xl border p-4 md:p-6">
                <h3 class="text-lg font-semibold">Freie Zeiten · {formatGermanDate(selectedDay)}</h3>
                {#await getFreeSlots( { from: dayStart, to: dayEnd, serviceId: selectedService?.id, durationMinutes } )}
                  <div class="text-base-content/70 mt-4 flex items-center gap-3" role="status">
                    <span class="loading loading-spinner loading-md" aria-hidden="true"></span>
                    Lade freie Termine…
                  </div>
                {:then slots}
                  {#if slots.length === 0}
                    <p class="text-base-content/70 mt-4 text-sm">
                      An diesem Tag sind keine freien Termine mehr verfügbar. Bitte wählen Sie einen anderen Tag.
                    </p>
                  {:else}
                    <ul class="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {#each slots as slot (slot.startsAt)}
                        <li>
                          <button
                            type="button"
                            class="btn btn-outline btn-sm w-full"
                            class:btn-primary={selectedSlot === slot.startsAt}
                            onclick={() => chooseSlot(slot.startsAt)}
                          >
                            {formatTime(slot.startsAt)}
                          </button>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                {:catch err}
                  <div role="alert" class="alert alert-error mt-4">
                    <span>Termine konnten nicht geladen werden: {err.message}</span>
                  </div>
                {/await}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {:else if step === 'contact'}
      <div class="space-y-6" data-testid="step-contact">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-2xl font-bold md:text-3xl">Ihre Kontaktdaten</h2>
            <p class="text-base-content/80 mt-2">
              <strong>{selectedServiceLabel}</strong> am
              <strong>{formatGermanDate(selectedDay)}</strong> um
              <strong>{formatTime(selectedSlot)} Uhr</strong>
            </p>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" onclick={back}>
            <ArrowLeft class="size-4" aria-hidden="true" />
            Termin ändern
          </button>
        </div>

        <form
          {...bookAppointment}
          class="card bg-base-100 border-base-200 grid gap-4 border p-6 md:grid-cols-2"
          data-testid="booking-form"
          novalidate
        >
          <label class="form-control md:col-span-1">
            <div class="label"><span class="label-text">Name *</span></div>
            <input
              {...bookAppointment.fields.customerName.as('text')}
              required
              autocomplete="name"
              class="input input-bordered w-full"
            />
            {#each bookAppointment.fields.customerName.issues() ?? [] as issue (issue.message)}
              <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
            {/each}
          </label>

          <label class="form-control md:col-span-1">
            <div class="label"><span class="label-text">E-Mail *</span></div>
            <input
              {...bookAppointment.fields.customerEmail.as('email')}
              required
              autocomplete="email"
              class="input input-bordered w-full"
            />
            {#each bookAppointment.fields.customerEmail.issues() ?? [] as issue (issue.message)}
              <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
            {/each}
          </label>

          <label class="form-control md:col-span-1">
            <div class="label"><span class="label-text">Telefon</span></div>
            <input
              {...bookAppointment.fields.customerPhone.as('tel')}
              autocomplete="tel"
              class="input input-bordered w-full"
            />
            {#each bookAppointment.fields.customerPhone.issues() ?? [] as issue (issue.message)}
              <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
            {/each}
          </label>

          <div class="md:col-span-1">
            <div class="label"><span class="label-text">Termin</span></div>
            <div class="bg-base-200 rounded-lg p-3 text-sm">
              {formatGermanDate(selectedDay)} · {formatTime(selectedSlot)} Uhr
              <input type="hidden" name="startsAt" value={selectedSlot} />
              <input type="hidden" name="serviceId" value={selectedService?.id ?? ''} />
              <input type="hidden" name="durationMinutes" value={String(durationMinutes)} />
            </div>
          </div>

          <label class="form-control md:col-span-2">
            <div class="label"><span class="label-text">Nachricht (optional)</span></div>
            <textarea
              {...bookAppointment.fields.notes.as('text')}
              rows="4"
              class="textarea textarea-bordered w-full"
              placeholder="z. B. Kennzeichen, gewünschte Reifenmarke, Symptome …"
            ></textarea>
            {#each bookAppointment.fields.notes.issues() ?? [] as issue (issue.message)}
              <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
            {/each}
          </label>

          <!-- honeypot: real users leave this empty; bots fill it in -->
          <div class="hidden" aria-hidden="true">
            <label>
              Bitte leer lassen
              <input type="text" name="website" tabindex="-1" autocomplete="off" />
            </label>
          </div>

          {#if bookAppointment.result && bookAppointment.result.status === 'error'}
            <div role="alert" class="alert alert-error md:col-span-2">
              <span>{bookAppointment.result.message}</span>
            </div>
          {/if}

          <div class="md:col-span-2 flex flex-wrap items-center justify-end gap-3">
            <p class="text-base-content/60 mr-auto text-xs">
              Mit dem Absenden stimmen Sie unserer
              <a class="link link-hover" href="/datenschutz">Datenschutzerklärung</a>
              zu.
            </p>
            <button type="button" class="btn btn-ghost" onclick={back}>Zurück</button>
            <button type="submit" class="btn btn-primary" disabled={bookAppointment.pending > 0}>
              {#if bookAppointment.pending > 0}
                <span class="loading loading-spinner loading-sm" aria-hidden="true"></span>
              {/if}
              Termin verbindlich buchen
              <ArrowRight class="size-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    {:else if step === 'done' && bookAppointment.result?.status === 'ok'}
      {@const r = bookAppointment.result}
      <div class="card bg-base-100 border-base-200 mx-auto max-w-2xl border" data-testid="step-done">
        <div class="card-body items-center text-center">
          <div class="bg-success/15 text-success rounded-full p-3">
            <CheckCircle2 class="size-10" aria-hidden="true" />
          </div>
          <h2 class="card-title mt-3 text-2xl md:text-3xl">Termin gebucht!</h2>
          <p class="text-base-content/80">
            Wir haben Ihre Buchung erhalten. Eine Bestätigung wurde an Ihre E-Mail-Adresse versendet.
          </p>
          <dl class="bg-base-200 mt-4 grid w-full grid-cols-3 gap-2 rounded-xl p-4 text-sm">
            <dt class="text-base-content/60 col-span-1">Leistung</dt>
            <dd class="col-span-2 font-medium">{selectedServiceLabel}</dd>
            <dt class="text-base-content/60 col-span-1">Datum</dt>
            <dd class="col-span-2 font-medium">{formatGermanDate(selectedDay)}</dd>
            <dt class="text-base-content/60 col-span-1">Uhrzeit</dt>
            <dd class="col-span-2 font-medium">
              {formatTime(r.startsAt)} – {formatTime(r.endsAt)}
            </dd>
            <dt class="text-base-content/60 col-span-1">Referenz</dt>
            <dd class="col-span-2 font-mono text-xs">{r.appointmentId}</dd>
          </dl>
          <div class="mt-4 flex flex-wrap gap-3">
            <a href="/" class="btn btn-ghost">Zur Startseite</a>
            <a href="/leistungen" class="btn btn-outline">Leistungen ansehen</a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>
