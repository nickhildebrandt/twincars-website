<script lang="ts">
  /**
   * Article detail page (`/reifenshop/[id]`).
   *
   * Shows the article spec sheet, a placeholder image (the manager API
   * doesn't expose product images yet — see MISSING_APIS.md) and a
   * quantity selector that adds the chosen quantity to the cart.
   */
  import { page } from '$app/state'
  import { ArrowLeft, Check, Minus, Plus, ShoppingCart } from '@lucide/svelte'
  import PlaceholderImage from '$components/PlaceholderImage.svelte'
  import Seo from '$components/Seo.svelte'
  import { useCart } from '$features/reifenshop/cart-context.svelte'
  import { attr, formatEur, specLine } from '$features/reifenshop/format'
  import { getArticle } from '../reifenshop.remote'

  const cart = useCart()
  const articlePromise = $derived(getArticle(page.params.id ?? ''))

  /** Chosen quantity for "add to cart". Bounded 1–99. */
  let qty = $state(1)

  /** Set to `true` for two seconds after a successful add — shows a confirmation. */
  let justAdded = $state(false)
</script>

{#await articlePromise}
  <div class="mx-auto max-w-7xl px-4 py-16">
    <div class="text-base-content/70 flex items-center gap-3" role="status">
      <span class="loading loading-spinner loading-md" aria-hidden="true"></span>
      Lade Artikel…
    </div>
  </div>
{:then article}
  {@const spec = specLine(article)}
  <Seo
    title="{article.description} – Reifenshop TwinCars"
    description="{spec || article.description} ab {formatEur(article.currentPriceNet)} pro {article.unit} im Reifenshop von TwinCars Bernau."
  />

  <section class="bg-base-200 py-10 md:py-14">
    <div class="mx-auto max-w-7xl px-4">
      <a href="/reifenshop" class="link link-hover text-base-content/70 mb-4 inline-flex items-center gap-1 text-sm">
        <ArrowLeft class="size-4" aria-hidden="true" />
        Zurück zum Reifenshop
      </a>

      <div class="grid gap-8 lg:grid-cols-5">
        <div class="lg:col-span-2">
          <PlaceholderImage
            label={article.description}
            icon="circle-dot"
            aspect="aspect-square"
            tone="primary"
          />
        </div>

        <div class="space-y-5 lg:col-span-3">
          <div>
            {#if spec}
              <p class="text-primary text-sm font-semibold uppercase tracking-wider">{spec}</p>
            {/if}
            <h1 class="mt-1 text-3xl font-bold leading-tight md:text-4xl">{article.description}</h1>
            {#if article.articleNumber}
              <p class="text-base-content/60 mt-1 text-sm">Art.-Nr. {article.articleNumber}</p>
            {/if}
          </div>

          <div class="bg-base-100 border-base-200 grid gap-4 rounded-2xl border p-5 sm:grid-cols-[1fr_auto]">
            <div>
              <p class="text-primary text-3xl font-bold">{formatEur(article.currentPriceNet)}</p>
              <p class="text-base-content/60 text-xs">pro {article.unit}, zzgl. MwSt.</p>
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
                disabled={article.currentPriceNet == null}
                onclick={() => {
                  cart.add(article, qty)
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
              {#each Object.entries(article.attributes ?? {}) as [key, value] (key)}
                {#if value != null && value !== ''}
                  <dt class="text-base-content/60 capitalize">{key}</dt>
                  <dd class="font-medium">{String(value)}</dd>
                {/if}
              {/each}
              {#if Object.keys(article.attributes ?? {}).length === 0}
                <dd class="text-base-content/60 col-span-2 text-sm">Keine zusätzlichen Angaben.</dd>
              {/if}
            </dl>
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
      <span>{err.message ?? 'Artikel konnte nicht geladen werden.'}</span>
    </div>
    <a class="btn btn-primary mt-4" href="/reifenshop">Zurück zum Shop</a>
  </section>
{/await}
