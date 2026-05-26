<script lang="ts">
  /**
   * Contact page (`/kontakt`).
   *
   * Shows the workshop NAP block, opening hours, a Leaflet map and a
   * general-purpose contact form (separate from the vehicle-specific
   * one on the used-car detail page).
   */
  import { CheckCircle2, Mail, MapPin, Phone, Clock } from '@lucide/svelte'
  import LeafletMap from '$components/LeafletMap.svelte'
  import Seo from '$components/Seo.svelte'
  import { company } from '$lib/company'
  import { sendContact } from './kontakt.remote'
</script>

<Seo
  title="Kontakt – TwinCars Bernau bei Berlin"
  description="Kontakt zur Kfz-Meisterwerkstatt TwinCars in Bernau bei Berlin: Anschrift, Telefon, E-Mail, Öffnungszeiten und Kontaktformular."
/>

<section class="bg-gradient-to-br from-neutral via-neutral to-base-300 text-neutral-content py-12 md:py-16" aria-labelledby="kontakt-title">
  <div class="mx-auto max-w-7xl px-4">
    <p class="badge badge-primary badge-lg font-semibold">Kontakt</p>
    <h1 id="kontakt-title" class="mt-4 text-3xl font-bold leading-tight md:text-5xl">
      So erreichen Sie uns
    </h1>
    <p class="mt-3 max-w-2xl text-lg opacity-90">
      Rufen Sie uns an, schreiben Sie uns eine E-Mail oder nutzen Sie das Formular – wir antworten in der Regel innerhalb eines Werktags.
    </p>
  </div>
</section>

<section class="bg-base-200 py-12 md:py-16">
  <div class="mx-auto max-w-7xl px-4">
    <div class="grid gap-8 lg:grid-cols-5">
      <aside class="space-y-5 lg:col-span-2">
        <div class="card bg-base-100 border-base-200 border">
          <div class="card-body">
            <h2 class="card-title">Anschrift</h2>
            <address class="not-italic">
              <p class="flex items-start gap-2">
                <MapPin class="text-primary mt-1 size-5 shrink-0" aria-hidden="true" />
                <span>
                  {company.brandName}<br />
                  {company.address.street}<br />
                  {company.address.zip} {company.address.city}
                </span>
              </p>
            </address>
          </div>
        </div>

        <div class="card bg-base-100 border-base-200 border">
          <div class="card-body">
            <h2 class="card-title">Telefon & E-Mail</h2>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <Phone class="text-primary size-5" aria-hidden="true" />
                <a class="link link-hover" href="tel:{company.contact.phoneE164}">{company.contact.phone}</a>
              </li>
              <li class="flex items-center gap-2">
                <Phone class="text-primary size-5" aria-hidden="true" />
                <a class="link link-hover" href="tel:{company.contact.mobileE164}">{company.contact.mobile} (mobil)</a>
              </li>
              <li class="flex items-center gap-2">
                <Mail class="text-primary size-5" aria-hidden="true" />
                <a class="link link-hover" href="mailto:{company.contact.email}">{company.contact.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="card bg-base-100 border-base-200 border">
          <div class="card-body">
            <h2 class="card-title">Öffnungszeiten</h2>
            <ul class="space-y-2 text-sm">
              {#each company.openingHours as oh (oh.label)}
                <li class="flex items-center gap-2">
                  <Clock class="text-primary size-5" aria-hidden="true" />
                  <span>{oh.label}: {oh.open} – {oh.close} Uhr</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>

        <LeafletMap
          lat={company.geo.lat}
          lon={company.geo.lon}
          popup="<strong>{company.brandName}</strong><br>{company.address.street}<br>{company.address.zip} {company.address.city}"
          altText="Karte mit Standort der Werkstatt {company.brandName}"
          height="h-72 md:h-80"
        />
      </aside>

      <div class="space-y-6 lg:col-span-3">
        <section class="bg-base-100 border-base-200 rounded-2xl border p-6" aria-labelledby="form-title">
          <h2 id="form-title" class="text-xl font-semibold">Schreiben Sie uns</h2>
          {#if sendContact.result?.status === 'ok'}
            <div role="status" class="alert alert-success mt-4">
              <CheckCircle2 class="size-5" aria-hidden="true" />
              <span>Vielen Dank, Ihre Nachricht ist bei uns eingegangen (Referenz: {sendContact.result.inquiryId}).</span>
            </div>
          {:else}
            <form {...sendContact} class="mt-4 grid gap-4 md:grid-cols-2" novalidate>
              <label class="form-control">
                <div class="label"><span class="label-text">Name *</span></div>
                <input
                  {...sendContact.fields.customerName.as('text')}
                  required
                  autocomplete="name"
                  class="input input-bordered w-full"
                />
                {#each sendContact.fields.customerName.issues() ?? [] as issue (issue.message)}
                  <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
                {/each}
              </label>

              <label class="form-control">
                <div class="label"><span class="label-text">E-Mail *</span></div>
                <input
                  {...sendContact.fields.customerEmail.as('email')}
                  required
                  autocomplete="email"
                  class="input input-bordered w-full"
                />
                {#each sendContact.fields.customerEmail.issues() ?? [] as issue (issue.message)}
                  <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
                {/each}
              </label>

              <label class="form-control md:col-span-2">
                <div class="label"><span class="label-text">Telefon (optional)</span></div>
                <input
                  {...sendContact.fields.customerPhone.as('tel')}
                  autocomplete="tel"
                  class="input input-bordered w-full"
                />
              </label>

              <label class="form-control md:col-span-2">
                <div class="label"><span class="label-text">Betreff *</span></div>
                <input
                  {...sendContact.fields.subject.as('text')}
                  required
                  class="input input-bordered w-full"
                />
                {#each sendContact.fields.subject.issues() ?? [] as issue (issue.message)}
                  <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
                {/each}
              </label>

              <label class="form-control md:col-span-2">
                <div class="label"><span class="label-text">Nachricht *</span></div>
                <textarea
                  {...sendContact.fields.message.as('text')}
                  rows="5"
                  required
                  class="textarea textarea-bordered w-full"
                ></textarea>
                {#each sendContact.fields.message.issues() ?? [] as issue (issue.message)}
                  <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
                {/each}
              </label>

              <div class="hidden" aria-hidden="true">
                <label>
                  Bitte leer lassen
                  <input type="text" name="website" tabindex="-1" autocomplete="off" />
                </label>
              </div>

              {#if sendContact.result}
                <div role="alert" class="alert alert-warning md:col-span-2">
                  <span>{sendContact.result.message}</span>
                </div>
              {/if}

              <div class="md:col-span-2 flex justify-end">
                <button type="submit" class="btn btn-primary" disabled={sendContact.pending > 0}>
                  {#if sendContact.pending > 0}
                    <span class="loading loading-spinner loading-sm" aria-hidden="true"></span>
                  {/if}
                  Nachricht senden
                </button>
              </div>
            </form>
          {/if}
        </section>
      </div>
    </div>
  </div>
</section>
