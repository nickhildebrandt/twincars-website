<script lang="ts">
  /**
   * Homepage. Composes hero, services, "about", a Leaflet map and the
   * contact section into one fast-loading, SEO-friendly landing page.
   * No data loading needed — everything is static (or comes from the
   * `company` registry).
   */
  import Hero from '$components/Hero.svelte'
  import ServiceCard from '$components/ServiceCard.svelte'
  import LeafletMap from '$components/LeafletMap.svelte'
  import PlaceholderImage from '$components/PlaceholderImage.svelte'
  import Seo from '$components/Seo.svelte'
  import { company } from '$lib/company'
  import { CheckCircle2, Phone, Mail, Clock, Calendar, Car, Wrench } from '@lucide/svelte'
</script>

<Seo
  title="TwinCars Bernau – Kfz-Meisterwerkstatt, Gebrauchtwagen & Reifenshop"
  description="TwinCars in Bernau bei Berlin: Kfz-Meisterbetrieb mit moderner Werkstatt, HU/AU, Reifenservice, Gebrauchtwagen-Portfolio und Online-Terminbuchung. Faire Preise, alle Fahrzeugmarken."
/>

<Hero
  title="Willkommen bei TwinCars in Bernau bei Berlin"
  subtitle="Ihre unabhängige Kfz-Meisterwerkstatt für alle Marken – moderne Diagnose, faire Preise und persönliche Beratung. Buchen Sie Ihren Termin direkt online."
  primaryCta="Termin online buchen"
  primaryHref="/termin"
  secondaryCta="Leistungen entdecken"
  secondaryHref="#leistungen"
/>

<section class="bg-base-100 py-16 md:py-24" aria-labelledby="features-title">
  <div class="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-3">
    <article class="space-y-3">
      <div class="bg-primary/10 text-primary inline-flex size-14 items-center justify-center rounded-2xl">
        <Wrench class="size-7" aria-hidden="true" />
      </div>
      <h2 class="text-2xl font-bold">Modernste Werkstatt</h2>
      <p class="text-base-content/80">
        Computergesteuerte Diagnose und Spezialwerkzeuge für alle Fahrzeugmarken nach Herstellervorgaben.
      </p>
    </article>
    <article class="space-y-3">
      <div class="bg-primary/10 text-primary inline-flex size-14 items-center justify-center rounded-2xl">
        <Car class="size-7" aria-hidden="true" />
      </div>
      <h2 class="text-2xl font-bold">Gebrauchtwagen</h2>
      <p class="text-base-content/80">
        Geprüfter Bestand fair bewertet, technisch durchgesehen und sofort fahrbereit – tagesaktuell online.
      </p>
    </article>
    <article class="space-y-3">
      <div class="bg-primary/10 text-primary inline-flex size-14 items-center justify-center rounded-2xl">
        <Calendar class="size-7" aria-hidden="true" />
      </div>
      <h2 class="text-2xl font-bold">Online buchen</h2>
      <p class="text-base-content/80">
        Wählen Sie Ihre Leistung und Ihren Wunschtermin – 24/7 buchbar, sofort bestätigt.
      </p>
    </article>
    <p class="hidden" id="features-title">Vorteile auf einen Blick</p>
  </div>
</section>

<section id="leistungen" class="bg-base-200 py-16 md:py-24" aria-labelledby="services-title">
  <div class="mx-auto max-w-7xl px-4">
    <header class="mb-10 max-w-3xl">
      <p class="text-primary mb-2 text-sm font-semibold uppercase tracking-wider">Starke Leistungen</p>
      <h2 id="services-title" class="text-3xl font-bold md:text-4xl">Von Inspektion bis Reparatur – alles aus einer Hand</h2>
      <p class="text-base-content/80 mt-4 text-lg">
        Wir bieten Ihnen das volle Portfolio einer modernen Meisterwerkstatt für alle Fahrzeugmarken – mit kompetenter
        Beratung, individueller Betreuung und zu fairen Preisen.
      </p>
    </header>
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each company.services as svc (svc.slug)}
        <ServiceCard title={svc.title} description={svc.description} icon={svc.icon} href={`/leistungen#${svc.slug}`} />
      {/each}
    </div>
    <div class="mt-10 flex flex-wrap justify-center gap-3">
      <a href="/leistungen" class="btn btn-primary btn-lg">Alle Leistungen ansehen</a>
      <a href="/termin" class="btn btn-outline btn-lg">Termin buchen</a>
    </div>
  </div>
</section>

<section id="ueber-uns" class="bg-base-100 py-16 md:py-24" aria-labelledby="about-title">
  <div class="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
    <div>
      <PlaceholderImage label="Team von TwinCars" icon="users" aspect="aspect-[4/3]" tone="primary" />
    </div>
    <div class="space-y-5">
      <p class="text-primary text-sm font-semibold uppercase tracking-wider">Über uns</p>
      <h2 id="about-title" class="text-3xl font-bold md:text-4xl">Tradition trifft moderne Technik</h2>
      <p class="text-base-content/80 text-lg leading-relaxed">
        TwinCars ist Ihre Kfz-Meisterwerkstatt für Reparatur, Inspektion und Wartung rund um Ihr Auto in
        Bernau bei Berlin. Seit unserer Unternehmensgründung {company.foundedYear} verbinden wir
        traditionelles Handwerk mit moderner Technik – mit regelmäßig geschulten Mitarbeitern und
        einem fairen, kundenorientierten Anspruch.
      </p>
      <ul class="space-y-2">
        {#each ['Meisterbetrieb seit über 25 Jahren', 'Markenunabhängig – alle Fahrzeugtypen', 'Ersatzteile in Erstausrüsterqualität', 'Hol- und Bringservice auf Wunsch'] as feature (feature)}
          <li class="flex items-start gap-2">
            <CheckCircle2 class="text-primary size-5 shrink-0 translate-y-0.5" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<section class="bg-primary text-primary-content py-12">
  <div class="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-3">
    {#each [
      { title: 'Hol- & Bringservice', desc: 'Wir holen Ihr Auto ab und bringen es wieder zurück.' },
      { title: 'Mobilitätsservice', desc: 'Ersatzfahrzeug während des Werkstattaufenthaltes.' },
      { title: 'Schadenservice', desc: 'Direkte Abwicklung des Schadenfalls mit Ihrer Versicherung.' }
    ] as item (item.title)}
      <article class="space-y-2 rounded-2xl bg-primary-content/10 p-6">
        <CheckCircle2 class="size-8" aria-hidden="true" />
        <h3 class="text-xl font-bold">{item.title}</h3>
        <p class="opacity-90">{item.desc}</p>
      </article>
    {/each}
  </div>
</section>

<section id="kontakt" class="bg-base-200 py-16 md:py-24" aria-labelledby="contact-title">
  <div class="mx-auto max-w-7xl px-4">
    <header class="mb-10 max-w-3xl">
      <p class="text-primary mb-2 text-sm font-semibold uppercase tracking-wider">Kontakt</p>
      <h2 id="contact-title" class="text-3xl font-bold md:text-4xl">So erreichen Sie uns</h2>
      <p class="text-base-content/80 mt-4 text-lg">
        Schreiben oder rufen Sie an – oder buchen Sie Ihren Termin direkt online. Wir kümmern uns um Ihr Auto.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-5 lg:items-stretch">
      <aside class="space-y-6 lg:col-span-2">
        <div class="card bg-base-100 border-base-300 border">
          <div class="card-body">
            <h3 class="card-title">Anschrift</h3>
            <address class="not-italic">
              {company.brandName}<br />
              {company.address.street}<br />
              {company.address.zip} {company.address.city}
            </address>
          </div>
        </div>
        <div class="card bg-base-100 border-base-300 border">
          <div class="card-body">
            <h3 class="card-title">Telefon & E-Mail</h3>
            <ul class="space-y-2">
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
        <div class="card bg-base-100 border-base-300 border">
          <div class="card-body">
            <h3 class="card-title">Öffnungszeiten</h3>
            <ul class="space-y-2">
              {#each company.openingHours as oh (oh.label)}
                <li class="flex items-center gap-2">
                  <Clock class="text-primary size-5" aria-hidden="true" />
                  <span>{oh.label}: {oh.open} – {oh.close} Uhr</span>
                </li>
              {/each}
            </ul>
            <a href="/termin" class="btn btn-primary btn-sm mt-2 self-start">Termin buchen</a>
          </div>
        </div>
      </aside>

      <div class="lg:col-span-3 lg:h-full">
        <LeafletMap
          lat={company.geo.lat}
          lon={company.geo.lon}
          popup="<strong>{company.brandName}</strong><br>{company.address.street}<br>{company.address.zip} {company.address.city}"
          altText="Karte mit Standort der Werkstatt {company.brandName}"
          height="h-96 lg:h-full min-h-80"
        />
      </div>
    </div>
  </div>
</section>
