<script lang="ts">
  /**
   * Root layout. Wraps every page with the site chrome (header + footer)
   * and emits a global JSON-LD `AutoRepair` document so search engines
   * pick up the workshop's NAP (name, address, phone) from any page.
   *
   * @prop children  Snippet for the routed page content.
   */
  import '../app.css'
  import SiteHeader from '$components/SiteHeader.svelte'
  import SiteFooter from '$components/SiteFooter.svelte'
  import { company } from '$lib/company'
  import { provideCart } from '$features/reifenshop/cart-context.svelte'
  import { PUBLIC_SITE_URL } from '$env/static/public'

  let { children } = $props()

  /** Attach the shop cart store to the root context so every descendant can read it. */
  provideCart()

  const baseUrl = (PUBLIC_SITE_URL ?? 'https://twin-cars.de').replace(/\/+$/, '')

  /**
   * Global LocalBusiness/AutoRepair schema. Rendered once per page in
   * `<head>` so Google can build a rich result for the workshop's NAP.
   */
  const businessJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: company.brandName,
    legalName: company.legalName,
    image: `${baseUrl}/logo-twincars.png`,
    url: baseUrl,
    telephone: company.contact.phoneE164,
    email: company.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      postalCode: company.address.zip,
      addressLocality: company.address.city,
      addressCountry: company.address.country
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: company.geo.lat,
      longitude: company.geo.lon
    },
    openingHoursSpecification: company.openingHours.map((oh) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: oh.open,
      closes: oh.close
    })),
    priceRange: '€€',
    foundingDate: String(company.foundedYear)
  })
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${businessJsonLd}<` + `/script>`}
</svelte:head>

<div class="flex min-h-screen flex-col">
  <SiteHeader />
  <main id="content" class="flex-1">
    {@render children()}
  </main>
  <SiteFooter />
</div>
