<script lang="ts">
  /**
   * Sticky top navigation. The drawer toggle is checkbox-driven (CSS
   * only) so the menu remains usable without JavaScript — that's the
   * DaisyUI `drawer` pattern.
   *
   * @prop {string} currentPath  The active pathname; used for aria-current.
   */
  import { page } from '$app/state'
  import { Menu, Phone, Mail, MapPin, ShoppingCart } from '@lucide/svelte'
  import { company } from '$lib/company'
  import { useCart } from '$features/reifenshop/cart-context.svelte'

  /** Active path passed in for SSR-friendly highlighting. */
  let { currentPath = '/' }: { currentPath?: string } = $props()

  /** Shared shop cart — used to render the badge with the line count. */
  const cart = useCart()

  /**
   * The visible navigation items. Order = display order.
   * Anchors with `#` jump within the homepage on /, navigate to / + hash otherwise.
   */
  const links = [
    { href: '/', label: 'Start' },
    { href: '/gebrauchtwagen', label: 'Gebrauchtwagen' },
    { href: '/reifenshop', label: 'Reifenshop' },
    { href: '/kontakt', label: 'Kontakt' }
  ] as const

  /**
   * Determines whether a given link's path matches the current URL.
   * For `/` we require an exact match, otherwise we accept prefix
   * matches so child routes (e.g. /reifen/r123) still highlight.
   */
  function isActive(href: string): boolean {
    const path = page.url?.pathname ?? currentPath
    if (href === '/') return path === '/'
    return path === href || path.startsWith(`${href}/`)
  }
</script>

<header class="bg-base-100/95 sticky top-0 z-40 border-b border-base-200 shadow-sm backdrop-blur">
  <div class="bg-neutral text-neutral-content text-sm">
    <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-2 sm:flex-row">
      <p class="text-center sm:text-left">
        <span class="font-semibold">{company.brandName}</span> – {company.tagline}
      </p>
      <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
        <a class="link link-hover inline-flex items-center gap-1.5" href="tel:{company.contact.phoneE164}">
          <Phone class="size-4" aria-hidden="true" />
          <span>{company.contact.phone}</span>
        </a>
        <a class="link link-hover inline-flex items-center gap-1.5" href="mailto:{company.contact.email}">
          <Mail class="size-4" aria-hidden="true" />
          <span>{company.contact.email}</span>
        </a>
        <span class="hidden items-center gap-1.5 md:inline-flex">
          <MapPin class="size-4" aria-hidden="true" />
          <span>{company.address.zip} {company.address.city}</span>
        </span>
      </div>
    </div>
  </div>

  <div class="navbar mx-auto max-w-7xl px-4">
    <div class="navbar-start">
      <a href="/" class="flex items-center gap-3" aria-label="Zur Startseite">
        <img src="/logo-twincars.png" alt="TwinCars Logo" class="h-10 w-auto md:h-12" width="756" height="186" />
      </a>
    </div>

    <nav class="navbar-center hidden lg:flex" aria-label="Hauptnavigation">
      <ul class="menu menu-horizontal gap-1 px-1 text-base font-semibold">
        {#each links as link (link.href)}
          <li>
            <a
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              class:menu-active={isActive(link.href)}
            >
              {link.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="navbar-end gap-2">
      <a
        href="/reifenshop/warenkorb"
        class="btn btn-ghost btn-circle relative"
        aria-label="Warenkorb öffnen ({cart.totals.totalQuantity} Artikel)"
      >
        <ShoppingCart class="size-5" aria-hidden="true" />
        {#if cart.totals.totalQuantity > 0}
          <span class="badge badge-primary badge-sm absolute -right-1 -top-1">
            {cart.totals.totalQuantity}
          </span>
        {/if}
      </a>
      <a href="/termin" class="btn btn-primary hidden md:inline-flex">Termin buchen</a>
      <div class="dropdown dropdown-end lg:hidden">
        <button class="btn btn-ghost btn-square" aria-label="Menü öffnen">
          <Menu class="size-6" aria-hidden="true" />
        </button>
        <ul class="menu dropdown-content menu-lg bg-base-100 rounded-box z-50 mt-3 w-64 gap-1 p-2 shadow-xl">
          {#each links as link (link.href)}
            <li>
              <a
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                class:menu-active={isActive(link.href)}
              >
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</header>
