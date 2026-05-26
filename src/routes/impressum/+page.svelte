<script lang="ts">
  /**
   * Imprint (`/impressum`).
   *
   * German Telemediengesetz § 5 requires an imprint with company info,
   * tax-id and supervising body. This page renders the data we have on
   * file from `$lib/company`; missing fields are clearly marked so the
   * workshop can fill them in later.
   */
  import Seo from '$components/Seo.svelte'
  import { company } from '$lib/company'
</script>

<Seo
  title="Impressum – TwinCars Bernau"
  description="Impressum nach § 5 TMG der TwinCars Inh. Lars Becker, Kfz-Meisterwerkstatt in Bernau bei Berlin."
/>

<section class="bg-base-200 py-12 md:py-16">
  <div class="mx-auto max-w-3xl px-4">
    <h1 class="text-3xl font-bold leading-tight md:text-4xl">Impressum</h1>

    <div class="prose prose-neutral mt-6 max-w-none">
      <h2>Angaben gemäß § 5 TMG</h2>
      <address class="not-italic">
        <strong>{company.legalName}</strong><br />
        {company.address.street}<br />
        {company.address.zip} {company.address.city}<br />
        Deutschland
      </address>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href="tel:{company.contact.phoneE164}">{company.contact.phone}</a><br />
        Mobil: <a href="tel:{company.contact.mobileE164}">{company.contact.mobile}</a><br />
        E-Mail: <a href="mailto:{company.contact.email}">{company.contact.email}</a>
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
        <em>(bitte ergänzen)</em>
      </p>

      <h2>Aufsichtsbehörde / Kammer</h2>
      <p>
        Handwerkskammer Berlin<br />
        Blücherstraße 68<br />
        10961 Berlin
      </p>
      <p>
        Berufsbezeichnung: Kfz-Meister<br />
        Verliehen durch: Bundesrepublik Deutschland
      </p>

      <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
      <p>
        {company.legalName}<br />
        {company.address.street}<br />
        {company.address.zip} {company.address.city}
      </p>

      <h2>Streitschlichtung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
        <a href="https://ec.europa.eu/consumers/odr" rel="nofollow noopener">https://ec.europa.eu/consumers/odr</a>.
        Unsere E-Mail-Adresse finden Sie oben im Impressum.
      </p>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </div>
  </div>
</section>
