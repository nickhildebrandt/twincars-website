<script lang="ts">
  /**
   * Services overview (`/leistungen`).
   *
   * Static page rendered from the `company.services` registry. Each
   * service has its own anchor so deep-links from the homepage cards
   * scroll to the relevant section.
   */
  import Seo from '$components/Seo.svelte'
  import ServiceCard from '$components/ServiceCard.svelte'
  import { company } from '$lib/company'
</script>

<Seo
  title="Leistungen – Kfz-Werkstatt TwinCars Bernau"
  description="Alle Leistungen unserer Kfz-Meisterwerkstatt in Bernau bei Berlin: Inspektion, HU/AU, Reifenservice, Klima, Bremsen, Achsvermessung und mehr."
/>

<section class="bg-gradient-to-br from-neutral via-neutral to-base-300 text-neutral-content py-12 md:py-16" aria-labelledby="services-title">
  <div class="mx-auto max-w-7xl px-4">
    <p class="badge badge-primary badge-lg font-semibold">Leistungen</p>
    <h1 id="services-title" class="mt-4 text-3xl font-bold leading-tight md:text-5xl">
      Alles rund ums Auto – aus einer Hand
    </h1>
    <p class="mt-3 max-w-2xl text-lg opacity-90">
      Unsere Meisterwerkstatt deckt das volle Leistungsspektrum ab — von der jährlichen Inspektion über die HU/AU bis zur Achsvermessung. Buchen Sie Ihren Termin online.
    </p>
    <a href="/termin" class="btn btn-primary btn-lg mt-6">Termin online buchen</a>
  </div>
</section>

<section class="bg-base-200 py-12 md:py-16">
  <div class="mx-auto max-w-7xl px-4">
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each company.services as svc (svc.slug)}
        <article id={svc.slug} class="scroll-mt-28">
          <ServiceCard title={svc.title} description={svc.description} icon={svc.icon} />
        </article>
      {/each}
    </div>

    <div class="mt-12 flex flex-wrap justify-center gap-3">
      <a href="/termin" class="btn btn-primary btn-lg">Termin buchen</a>
      <a href="/kontakt" class="btn btn-outline btn-lg">Fragen? Sprechen Sie uns an</a>
    </div>
  </div>
</section>
