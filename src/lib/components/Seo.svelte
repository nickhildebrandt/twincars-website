<script lang="ts">
  /**
   * Per-page <head> meta-tags for SEO and social sharing.
   *
   * Every page renders this component so the title, description,
   * canonical URL, OpenGraph and Twitter tags are consistent.
   *
   * @prop {string} title         The page's <title> (will be suffixed with brand).
   * @prop {string} description   Meta description (max ~160 chars).
   * @prop {string=} canonical    Override canonical path; defaults to current URL.
   * @prop {string=} ogImage      Absolute URL to social-card image.
   * @prop {string=} type         OG type. Defaults to "website".
   * @prop {boolean=} noindex     If true, emits robots=noindex,nofollow.
   * @prop {string=} jsonLd       Serialized JSON-LD script content.
   */
  import { page } from '$app/state'
  import { PUBLIC_SITE_URL } from '$env/static/public'

  interface Props {
    title: string
    description: string
    canonical?: string
    ogImage?: string
    type?: 'website' | 'article' | 'product'
    noindex?: boolean
    jsonLd?: string
  }

  let {
    title,
    description,
    canonical,
    ogImage = '/logo-twincars.png',
    type = 'website',
    noindex = false,
    jsonLd
  }: Props = $props()

  const fullTitle = $derived(
    title.includes('TwinCars') ? title : `${title} | TwinCars Bernau`
  )

  const baseUrl = (PUBLIC_SITE_URL ?? 'https://twin-cars.de').replace(/\/+$/, '')
  const canonicalUrl = $derived(`${baseUrl}${canonical ?? page.url?.pathname ?? '/'}`)
  const ogImageUrl = $derived(ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`)
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  {#if noindex}
    <meta name="robots" content="noindex, nofollow" />
  {:else}
    <meta name="robots" content="index, follow" />
  {/if}

  <meta property="og:type" content={type} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={ogImageUrl} />
  <meta property="og:locale" content="de_DE" />
  <meta property="og:site_name" content="TwinCars Bernau" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImageUrl} />

  {#if jsonLd}
    {@html `<script type="application/ld+json">${jsonLd}<` + `/script>`}
  {/if}
</svelte:head>
