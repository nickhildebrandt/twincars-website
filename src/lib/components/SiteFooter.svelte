<script lang="ts">
  /**
   * Site-wide footer. Pure DaisyUI `footer` component; no props.
   * Renders contact, opening hours, legal links and a Meister badge.
   */
  import { company } from '$lib/company'
  import { Phone, Mail, MapPin, Clock } from '@lucide/svelte'

  const currentYear = new Date().getFullYear()
</script>

<footer class="bg-neutral text-neutral-content">
  <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
    <section class="space-y-3">
      <h2 class="footer-title text-neutral-content text-base">{company.brandName}</h2>
      <p class="text-sm leading-relaxed opacity-80">{company.tagline}</p>
      <img src="/meisterbetrieb.png" alt="Kfz-Meisterbetrieb" class="mt-3 h-24 w-auto" width="100" height="149" />
    </section>

    <section class="space-y-3">
      <h2 class="footer-title text-base">Kontakt</h2>
      <address class="space-y-2 text-sm not-italic">
        <p class="flex items-start gap-2">
          <MapPin class="size-4 shrink-0 translate-y-0.5" aria-hidden="true" />
          <span>
            {company.address.street}<br />
            {company.address.zip} {company.address.city}
          </span>
        </p>
        <p class="flex items-center gap-2">
          <Phone class="size-4 shrink-0" aria-hidden="true" />
          <a class="link link-hover" href="tel:{company.contact.phoneE164}">{company.contact.phone}</a>
        </p>
        <p class="flex items-center gap-2">
          <Mail class="size-4 shrink-0" aria-hidden="true" />
          <a class="link link-hover" href="mailto:{company.contact.email}">{company.contact.email}</a>
        </p>
      </address>
    </section>

    <section class="space-y-3">
      <h2 class="footer-title text-base">Öffnungszeiten</h2>
      <ul class="space-y-1.5 text-sm">
        {#each company.openingHours as oh (oh.label)}
          <li class="flex items-start gap-2">
            <Clock class="size-4 shrink-0 translate-y-0.5" aria-hidden="true" />
            <span>{oh.label}: {oh.open} – {oh.close} Uhr</span>
          </li>
        {/each}
      </ul>
      <a href="/termin" class="btn btn-primary btn-sm mt-2">Online-Termin buchen</a>
    </section>

    <section class="space-y-3">
      <h2 class="footer-title text-base">Service</h2>
      <ul class="space-y-1.5 text-sm">
        <li><a class="link link-hover" href="/leistungen">Alle Leistungen</a></li>
        <li><a class="link link-hover" href="/gebrauchtwagen">Gebrauchtwagen</a></li>
        <li><a class="link link-hover" href="/reifenshop">Reifenshop</a></li>
        <li><a class="link link-hover" href="/kontakt">Kontaktformular</a></li>
      </ul>
    </section>
  </div>

  <div class="border-base-content/10 border-t">
    <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-sm sm:flex-row">
      <p>© {currentYear} {company.legalName}</p>
      <nav class="flex flex-wrap gap-4" aria-label="Rechtliches">
        <a class="link link-hover" href="/impressum">Impressum</a>
        <a class="link link-hover" href="/datenschutz">Datenschutz</a>
      </nav>
    </div>
  </div>
</footer>
