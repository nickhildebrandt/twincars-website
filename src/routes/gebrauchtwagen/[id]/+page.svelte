<script lang="ts">
  /**
   * Used-car detail page (`/gebrauchtwagen/[id]`).
   *
   * Shows a photo gallery, a spec sheet, the description, and a
   * vehicle-specific inquiry form. The vehicle is fetched through the
   * `getUsedCar(id)` remote query; the inquiry form posts through
   * `sendInquiry`. The page degrades gracefully when the contact
   * endpoint is not yet implemented in the manager.
   */
  import { page } from '$app/state'
  import { ArrowLeft, CheckCircle2, Mail, Phone } from '@lucide/svelte'
  import PlaceholderImage from '$components/PlaceholderImage.svelte'
  import Seo from '$components/Seo.svelte'
  import { company } from '$lib/company'
  import {
    carTitle,
    formatFirstRegistration,
    formatMileage,
    formatPrice
  } from '$features/gebrauchtwagen/format'
  import { getUsedCar, sendInquiry } from '../gebrauchtwagen.remote'

  const carPromise = $derived(getUsedCar(page.params.id ?? ''))

  /** Index of the currently large photo. 0 = first. */
  let activePhoto = $state(0)
</script>

{#await carPromise}
  <div class="mx-auto max-w-7xl px-4 py-16">
    <div class="text-base-content/70 flex items-center gap-3" role="status">
      <span class="loading loading-spinner loading-md" aria-hidden="true"></span>
      Lade Fahrzeug…
    </div>
  </div>
{:then car}
  {@const title = carTitle(car)}
  <Seo
    title="{title} – Gebrauchtwagen TwinCars Bernau"
    description="Geprüfter Gebrauchtwagen bei TwinCars: {title}. {formatFirstRegistration(car.firstRegistration)} · {formatMileage(car.mileageKm)} · {formatPrice(car.priceGross)}."
    ogImage={car.photos[0]?.dataUrl}
  />

  <section class="bg-base-200 py-10 md:py-14">
    <div class="mx-auto max-w-7xl px-4">
      <a href="/gebrauchtwagen" class="link link-hover text-base-content/70 mb-4 inline-flex items-center gap-1 text-sm">
        <ArrowLeft class="size-4" aria-hidden="true" />
        Zurück zum Bestand
      </a>

      <div class="grid gap-8 lg:grid-cols-5">
        <div class="lg:col-span-3">
          {#if car.photos.length > 0}
            <div class="bg-base-100 border-base-200 aspect-[4/3] overflow-hidden rounded-2xl border">
              <img
                src={car.photos[activePhoto]?.dataUrl ?? car.photos[0].dataUrl}
                alt="{title} – Foto {activePhoto + 1} von {car.photos.length}"
                class="size-full object-cover"
              />
            </div>
            {#if car.photos.length > 1}
              <div class="mt-3 grid grid-cols-5 gap-2" data-testid="thumbnails">
                {#each car.photos as photo, i (i)}
                  <button
                    type="button"
                    onclick={() => (activePhoto = i)}
                    class="aspect-[4/3] overflow-hidden rounded-lg border-2"
                    class:border-primary={activePhoto === i}
                    class:border-base-300={activePhoto !== i}
                    aria-label="Foto {i + 1} anzeigen"
                  >
                    <img src={photo.dataUrl} alt="" class="size-full object-cover" />
                  </button>
                {/each}
              </div>
            {/if}
          {:else}
            <PlaceholderImage label={title} icon="car" aspect="aspect-[4/3]" tone="primary" />
          {/if}
        </div>

        <aside class="space-y-5 lg:col-span-2">
          <header>
            <h1 class="text-3xl font-bold leading-tight md:text-4xl">{title}</h1>
            <p class="text-primary mt-2 text-3xl font-bold">{formatPrice(car.priceGross)}</p>
          </header>

          <dl class="bg-base-100 border-base-200 grid grid-cols-2 gap-3 rounded-2xl border p-4 text-sm">
            <dt class="text-base-content/60">Erstzulassung</dt>
            <dd class="font-medium">{formatFirstRegistration(car.firstRegistration)}</dd>
            <dt class="text-base-content/60">Kilometerstand</dt>
            <dd class="font-medium">{formatMileage(car.mileageKm)}</dd>
            <dt class="text-base-content/60">Kraftstoff</dt>
            <dd class="font-medium">{car.fuel ?? '—'}</dd>
            <dt class="text-base-content/60">Getriebe</dt>
            <dd class="font-medium">{car.transmission ?? '—'}</dd>
          </dl>

          <div class="bg-base-100 border-base-200 rounded-2xl border p-4">
            <h2 class="font-semibold">Direktkontakt</h2>
            <ul class="mt-2 space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <Phone class="text-primary size-4" aria-hidden="true" />
                <a class="link link-hover" href="tel:{company.contact.phoneE164}">{company.contact.phone}</a>
              </li>
              <li class="flex items-center gap-2">
                <Mail class="text-primary size-4" aria-hidden="true" />
                <a class="link link-hover" href="mailto:{company.contact.email}">{company.contact.email}</a>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {#if car.description}
        <section class="bg-base-100 border-base-200 mt-8 rounded-2xl border p-6">
          <h2 class="text-xl font-semibold">Fahrzeugbeschreibung</h2>
          <p class="text-base-content/80 mt-2 whitespace-pre-line leading-relaxed">{car.description}</p>
        </section>
      {/if}

      <section class="bg-base-100 border-base-200 mt-8 rounded-2xl border p-6" aria-labelledby="inquiry-title">
        <h2 id="inquiry-title" class="text-xl font-semibold">Anfrage zum Fahrzeug</h2>
        <p class="text-base-content/70 mt-1 text-sm">
          Probefahrt vereinbaren, Inzahlungnahme anfragen oder Rückruf wünschen? Wir antworten in der Regel innerhalb eines Werktags.
        </p>

        {#if sendInquiry.result?.status === 'ok'}
          <div role="status" class="alert alert-success mt-4">
            <CheckCircle2 class="size-5" aria-hidden="true" />
            <span>
              Vielen Dank! Ihre Anfrage ist bei uns eingegangen (Referenz: {sendInquiry.result.inquiryId}).
            </span>
          </div>
        {:else}
          <form
            {...sendInquiry}
            class="mt-5 grid gap-4 md:grid-cols-2"
            data-testid="inquiry-form"
            novalidate
          >
            <input type="hidden" name="vehicleId" value={car.id} />
            <input type="hidden" name="vehicleTitle" value={title} />

            <label class="form-control">
              <div class="label"><span class="label-text">Name *</span></div>
              <input
                {...sendInquiry.fields.customerName.as('text')}
                required
                autocomplete="name"
                class="input input-bordered w-full"
              />
              {#each sendInquiry.fields.customerName.issues() ?? [] as issue (issue.message)}
                <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
              {/each}
            </label>

            <label class="form-control">
              <div class="label"><span class="label-text">E-Mail *</span></div>
              <input
                {...sendInquiry.fields.customerEmail.as('email')}
                required
                autocomplete="email"
                class="input input-bordered w-full"
              />
              {#each sendInquiry.fields.customerEmail.issues() ?? [] as issue (issue.message)}
                <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
              {/each}
            </label>

            <label class="form-control md:col-span-2">
              <div class="label"><span class="label-text">Telefon (optional)</span></div>
              <input
                {...sendInquiry.fields.customerPhone.as('tel')}
                autocomplete="tel"
                class="input input-bordered w-full"
              />
            </label>

            <label class="form-control md:col-span-2">
              <div class="label"><span class="label-text">Nachricht *</span></div>
              <textarea
                {...sendInquiry.fields.message.as('text')}
                rows="5"
                required
                class="textarea textarea-bordered w-full"
                placeholder="Ich interessiere mich für eine Probefahrt am …"
              ></textarea>
              {#each sendInquiry.fields.message.issues() ?? [] as issue (issue.message)}
                <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
              {/each}
            </label>

            <div class="hidden" aria-hidden="true">
              <label>
                Bitte leer lassen
                <input type="text" name="website" tabindex="-1" autocomplete="off" />
              </label>
            </div>

            {#if sendInquiry.result?.status === 'error' || sendInquiry.result?.status === 'unavailable'}
              <div role="alert" class="alert alert-warning md:col-span-2">
                <span>{sendInquiry.result.message}</span>
              </div>
            {/if}

            <div class="md:col-span-2 flex flex-wrap items-center justify-end gap-3">
              <p class="text-base-content/60 mr-auto text-xs">
                Mit dem Absenden stimmen Sie unserer
                <a class="link link-hover" href="/datenschutz">Datenschutzerklärung</a>
                zu.
              </p>
              <button type="submit" class="btn btn-primary" disabled={sendInquiry.pending > 0}>
                {#if sendInquiry.pending > 0}
                  <span class="loading loading-spinner loading-sm" aria-hidden="true"></span>
                {/if}
                Anfrage senden
              </button>
            </div>
          </form>
        {/if}
      </section>
    </div>
  </section>
{:catch err}
  <section class="mx-auto max-w-7xl px-4 py-16">
    <div role="alert" class="alert alert-error">
      <span>{err.message ?? 'Fahrzeug konnte nicht geladen werden.'}</span>
    </div>
    <a class="btn btn-primary mt-4" href="/gebrauchtwagen">Zurück zum Bestand</a>
  </section>
{/await}
