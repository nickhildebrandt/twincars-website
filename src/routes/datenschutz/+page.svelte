<script lang="ts">
  /**
   * Privacy policy (`/datenschutz`).
   *
   * Standard DSGVO outline. Specific provider claims (analytics, payment
   * processors, etc.) are intentionally absent — they should be added
   * once the workshop confirms which services they actually use.
   */
  import Seo from '$components/Seo.svelte'
  import { company } from '$lib/company'
</script>

<Seo
  title="Datenschutz – TwinCars Bernau"
  description="Datenschutzerklärung der TwinCars Inh. Lars Becker. Informationen zur Verarbeitung personenbezogener Daten nach DSGVO."
/>

<section class="bg-base-200 py-12 md:py-16">
  <div class="mx-auto max-w-3xl px-4">
    <h1 class="text-3xl font-bold leading-tight md:text-4xl">Datenschutzerklärung</h1>

    <div class="prose prose-neutral mt-6 max-w-none">
      <h2>1. Verantwortlicher</h2>
      <address class="not-italic">
        {company.legalName}<br />
        {company.address.street}<br />
        {company.address.zip} {company.address.city}<br />
        E-Mail: <a href="mailto:{company.contact.email}">{company.contact.email}</a><br />
        Telefon: <a href="tel:{company.contact.phoneE164}">{company.contact.phone}</a>
      </address>

      <h2>2. Allgemeines</h2>
      <p>
        Wir nehmen den Schutz Ihrer persönlichen Daten ernst und behandeln Ihre personenbezogenen Daten vertraulich
        und entsprechend der gesetzlichen Datenschutzvorschriften der DSGVO sowie dieser Datenschutzerklärung.
      </p>

      <h2>3. Erhebung und Speicherung personenbezogener Daten</h2>
      <p>
        Bei der Nutzung unseres Online-Terminbuchungs-, Anfrage- und Bestellformulars erheben wir die von Ihnen
        eingegebenen Daten (Name, E-Mail, ggf. Telefon, Anschrift und Nachrichtentext). Diese Daten werden
        ausschließlich zur Bearbeitung Ihrer Anfrage bzw. zur Erfüllung des Vertrags verwendet
        (Art. 6 Abs. 1 lit. b DSGVO).
      </p>

      <h2>4. Server-Logfiles</h2>
      <p>
        Beim Aufruf unserer Website werden Logdaten verarbeitet (IP-Adresse, Browsertyp, Zeitstempel). Diese
        Daten dienen ausschließlich der Sicherheit und Stabilität des Dienstes und werden nach maximal 30 Tagen
        gelöscht.
      </p>

      <h2>5. Karten von OpenStreetMap</h2>
      <p>
        Wir binden Karten der OpenStreetMap Foundation ein. Beim Laden der Karte wird Ihre IP-Adresse an die
        OpenStreetMap-Server übertragen. Weitere Informationen unter
        <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" rel="nofollow noopener">osmfoundation.org/wiki/Privacy_Policy</a>.
      </p>

      <h2>6. Cookies und lokale Speicherung</h2>
      <p>
        Unser Reifenshop nutzt den <em>localStorage</em> Ihres Browsers, um Ihren Warenkorb zwischen Besuchen
        zu speichern. Es werden hierfür keine Cookies gesetzt und keine personenbezogenen Daten an Dritte
        übermittelt.
      </p>

      <h2>7. Ihre Rechte</h2>
      <p>
        Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung
        sowie Datenübertragbarkeit. Sie können der Verarbeitung Ihrer Daten widersprechen. Außerdem steht
        Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
      </p>

      <h2>8. Kontakt</h2>
      <p>
        Bei Fragen zum Datenschutz wenden Sie sich an
        <a href="mailto:{company.contact.email}">{company.contact.email}</a>.
      </p>
    </div>
  </div>
</section>
