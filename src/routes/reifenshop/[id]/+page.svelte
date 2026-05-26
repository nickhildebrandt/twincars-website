<script lang="ts">
  /**
   * Tire detail page (`/reifenshop/[id]`).
   *
   * Shows the tire spec sheet, photo gallery, the EU tire label data
   * and a quantity selector that adds the chosen quantity to the cart.
   */
  import { page } from '$app/state'
  import { ArrowLeft, Check, Minus, Plus, ShoppingCart } from '@lucide/svelte'
  import PlaceholderImage from '$components/PlaceholderImage.svelte'
  import Seo from '$components/Seo.svelte'
  import { useCart } from '$features/reifenshop/cart-context.svelte'
  import {
    formatEur,
    tireSpecLine,
    tireTitle
  } from '$features/reifenshop/format'
  import { getTire } from '../reifenshop.remote'

  const cart = useCart()
  const tirePromise = $derived(getTire(page.params.id ?? ''))

  /** Index of the currently displayed photo in the gallery. */
  let activePhoto = $state(0)
  /** Chosen quantity for "add to cart". Bounded 1–99. */
  let qty = $state(1)
  /** Set to `true` for two seconds after a successful add — shows a confirmation. */
  let justAdded = $state(false)
</script>

{#await tirePromise}
  <div class="mx-auto max-w-7xl px-4 py-16">
    <div class="text-base-content/70 flex items-center gap-3" role="status">
      <span class="loading loading-spinner loading-md" aria-hidden="true"></span>
      Lade Reifen…
    </div>
  </div>
{:then tire}
  {@const title = tireTitle(tire)}
  {@const spec = tireSpecLine(tire)}
  {@const hero = tire.photos[activePhoto] ?? tire.photos[0]}
  <Seo
    title="{title} {tire.sizeLabel} – Reifenshop TwinCars"
    description="{spec || title} ab {formatEur(tire.currentPriceNet)} im Reifenshop von TwinCars Bernau."
  />

  <section class="bg-base-200 py-10 md:py-14">
    <div class="mx-auto max-w-7xl px-4">
      <a href="/reifenshop" class="link link-hover text-base-content/70 mb-4 inline-flex items-center gap-1 text-sm">
        <ArrowLeft class="size-4" aria-hidden="true" />
        Zurück zum Reifenshop
      </a>

      <div class="grid gap-8 lg:grid-cols-5">
        <div class="lg:col-span-2">
          {#if hero}
            <img
              src={hero.url}
              alt={title}
              class="aspect-square w-full rounded-2xl border border-base-200 bg-base-100 object-cover"
            />
            {#if tire.photos.length > 1}
              <div class="mt-2 grid grid-cols-5 gap-2">
                {#each tire.photos as photo, i (i)}
                  <button
                    type="button"
                    class="aspect-square overflow-hidden rounded-lg border"
                    class:border-primary={i === activePhoto}
                    class:border-base-200={i !== activePhoto}
                    onclick={() => (activePhoto = i)}
                    aria-label={`Bild ${i + 1} anzeigen`}
                  >
                    <img src={photo.url} alt="" class="size-full object-cover" />
                  </button>
                {/each}
              </div>
            {/if}
          {:else}
            <PlaceholderImage
              label={title}
              icon="circle-dot"
              aspect="aspect-square"
              tone="primary"
            />
          {/if}
        </div>

        <div class="space-y-5 lg:col-span-3">
          <div>
            {#if spec}
              <p class="text-primary text-sm font-semibold uppercase tracking-wider">{spec}</p>
            {/if}
            <h1 class="mt-1 text-3xl font-bold leading-tight md:text-4xl">{title}</h1>
            <p class="text-base-content/60 mt-1 text-sm">Art.-Nr. {tire.articleNumber}</p>
          </div>

          <div class="bg-base-100 border-base-200 grid gap-4 rounded-2xl border p-5 sm:grid-cols-[1fr_auto]">
            <div>
              <p class="text-primary text-3xl font-bold">{formatEur(tire.currentPriceNet)}</p>
              <p class="text-base-content/60 text-xs">pro Stück, zzgl. MwSt.</p>
            </div>
            <div class="flex flex-col items-end gap-3">
              <div class="join">
                <button
                  type="button"
                  class="btn btn-sm join-item"
                  onclick={() => (qty = Math.max(1, qty - 1))}
                  aria-label="Menge verringern"
                >
                  <Minus class="size-4" aria-hidden="true" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="99"
                  bind:value={qty}
                  class="input input-bordered input-sm join-item w-16 text-center"
                  aria-label="Menge"
                />
                <button
                  type="button"
                  class="btn btn-sm join-item"
                  onclick={() => (qty = Math.min(99, qty + 1))}
                  aria-label="Menge erhöhen"
                >
                  <Plus class="size-4" aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                class="btn btn-primary"
                disabled={tire.currentPriceNet == null}
                onclick={() => {
                  cart.add(tire, qty)
                  justAdded = true
                  setTimeout(() => (justAdded = false), 2000)
                }}
              >
                {#if justAdded}
                  <Check class="size-5" aria-hidden="true" />
                  Hinzugefügt
                {:else}
                  <ShoppingCart class="size-5" aria-hidden="true" />
                  In den Warenkorb
                {/if}
              </button>
            </div>
          </div>

          <div class="bg-base-100 border-base-200 rounded-2xl border p-5">
            <h2 class="font-semibold">Technische Daten</h2>
            <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <dt class="text-base-content/60">Größe</dt>
              <dd class="font-medium">{tire.sizeLabel}</dd>
              <dt class="text-base-content/60">Saison</dt>
              <dd class="font-medium">{tire.season}</dd>
              {#if tire.loadIndex}
                <dt class="text-base-content/60">Lastindex</dt>
                <dd class="font-medium">{tire.loadIndex}</dd>
              {/if}
              {#if tire.speedIndex}
                <dt class="text-base-content/60">Geschwindigkeitsindex</dt>
                <dd class="font-medium">{tire.speedIndex}</dd>
              {/if}
              {#if tire.fuelEfficiency}
                <dt class="text-base-content/60">Kraftstoffeffizienz</dt>
                <dd class="font-medium">{tire.fuelEfficiency}</dd>
              {/if}
              {#if tire.wetGrip}
                <dt class="text-base-content/60">Nasshaftung</dt>
                <dd class="font-medium">{tire.wetGrip}</dd>
              {/if}
              {#if tire.noiseClass || tire.noiseDb != null}
                <dt class="text-base-content/60">Geräusch</dt>
                <dd class="font-medium">
                  {tire.noiseClass ?? ''}{tire.noiseDb != null ? ` (${tire.noiseDb} dB)` : ''}
                </dd>
              {/if}
              {#if tire.runFlat}
                <dt class="text-base-content/60">Runflat</dt>
                <dd class="font-medium">Ja</dd>
              {/if}
              {#if tire.reinforced}
                <dt class="text-base-content/60">Verstärkt (XL)</dt>
                <dd class="font-medium">Ja</dd>
              {/if}
              {#if tire.studdedWinter}
                <dt class="text-base-content/60">Spike-bestückbar</dt>
                <dd class="font-medium">Ja</dd>
              {/if}
              {#if tire.mSMarking}
                <dt class="text-base-content/60">M+S-Kennung</dt>
                <dd class="font-medium">Ja</dd>
              {/if}
              {#if tire.snowFlake}
                <dt class="text-base-content/60">3PMSF</dt>
                <dd class="font-medium">Ja</dd>
              {/if}
              {#if tire.evCertified}
                <dt class="text-base-content/60">E-Auto zertifiziert</dt>
                <dd class="font-medium">Ja</dd>
              {/if}
              {#if tire.ean}
                <dt class="text-base-content/60">EAN</dt>
                <dd class="font-medium">{tire.ean}</dd>
              {/if}
            </dl>
            {#if tire.description}
              <p class="text-base-content/80 mt-4 whitespace-pre-line text-sm">{tire.description}</p>
            {/if}
          </div>

          {#if cart.totals.totalQuantity > 0}
            <a href="/reifenshop/warenkorb" class="btn btn-outline btn-block">
              Zum Warenkorb ({cart.totals.totalQuantity} Artikel)
            </a>
          {/if}
        </div>
      </div>
    </div>
  </section>
{:catch err}
  <section class="mx-auto max-w-7xl px-4 py-16">
    <div role="alert" class="alert alert-error">
      <span>{err.message ?? 'Reifen konnte nicht geladen werden.'}</span>
    </div>
    <a class="btn btn-primary mt-4" href="/reifenshop">Zurück zum Shop</a>
  </section>
{/await}
