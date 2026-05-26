<script lang="ts">
  /**
   * Reifenshop catalogue (`/reifenshop`).
   *
   * Loads articles through `getArticles()` and shows a filterable grid.
   * Filters (size / season / brand / price range / search) are
   * client-side — the manager's public articles endpoint doesn't accept
   * filter parameters yet (see MISSING_APIS.md).
   */
  import { Filter, RotateCw, ShoppingCart } from '@lucide/svelte'
  import ArticleCard from '$components/ArticleCard.svelte'
  import Seo from '$components/Seo.svelte'
  import { attr, uniqueAttr } from '$features/reifenshop/format'
  import { useCart } from '$features/reifenshop/cart-context.svelte'
  import { getArticles } from './reifenshop.remote'

  const cart = useCart()

  /** Currently selected tire size filter. */
  let size = $state('')
  /** Currently selected season filter. */
  let season = $state('')
  /** Currently selected brand filter. */
  let brand = $state('')
  /** Maximum net price (EUR), or `null` for "no cap". */
  let maxPrice = $state<number | null>(null)
  /** Free-text search term. */
  let term = $state('')

  /** Resets all filters back to "any". */
  function resetFilters(): void {
    size = ''
    season = ''
    brand = ''
    maxPrice = null
    term = ''
  }
</script>

<Seo
  title="Reifenshop – Tagesaktuelles Reifensortiment | TwinCars Bernau"
  description="Online-Reifenshop von TwinCars in Bernau bei Berlin: Sommer-, Winter- und Ganzjahresreifen führender Marken. Tagesaktuelle Preise, schneller Versand oder Montage in der Werkstatt."
/>

<section class="bg-gradient-to-br from-neutral via-neutral to-base-300 text-neutral-content py-12 md:py-16" aria-labelledby="shop-title">
  <div class="mx-auto max-w-7xl px-4">
    <p class="badge badge-primary badge-lg font-semibold">Reifenshop</p>
    <h1 id="shop-title" class="mt-4 text-3xl font-bold leading-tight md:text-5xl">
      Reifen schnell und fair
    </h1>
    <p class="mt-3 max-w-2xl text-lg opacity-90">
      Bestellen Sie Ihre Wunschreifen tagesaktuell aus unserem Lager — auf Wunsch direkt mit Montage und Wuchten in unserer Werkstatt.
    </p>
    {#if cart.totals.totalQuantity > 0}
      <a href="/reifenshop/warenkorb" class="btn btn-primary btn-sm mt-5">
        <ShoppingCart class="size-4" aria-hidden="true" />
        Warenkorb · {cart.totals.totalQuantity} Artikel
      </a>
    {/if}
  </div>
</section>

<section class="bg-base-200 py-12 md:py-16">
  <div class="mx-auto max-w-7xl px-4">
    {#await getArticles()}
      <div class="text-base-content/70 flex items-center gap-3" role="status">
        <span class="loading loading-spinner loading-md" aria-hidden="true"></span>
        Lade Reifensortiment…
      </div>
    {:then articles}
      {@const sizes = uniqueAttr(articles, 'size')}
      {@const seasons = uniqueAttr(articles, 'season')}
      {@const brands = uniqueAttr(articles, 'brand')}
      {@const search = term.trim().toLowerCase()}
      {@const filtered = articles.filter((a) => {
        if (size && attr(a, 'size') !== size) return false
        if (season && attr(a, 'season') !== season) return false
        if (brand && attr(a, 'brand') !== brand) return false
        if (maxPrice != null && (a.currentPriceNet ?? Infinity) > maxPrice) return false
        if (search) {
          const hay = `${a.description ?? ''} ${a.articleNumber ?? ''}`.toLowerCase()
          if (!hay.includes(search)) return false
        }
        return true
      })}

      <div class="card bg-base-100 border-base-200 mb-8 border" data-testid="shop-filters">
        <div class="card-body gap-4 p-5">
          <div class="flex items-center gap-2 text-sm font-semibold">
            <Filter class="text-primary size-5" aria-hidden="true" />
            Filter
            <span class="text-base-content/60 ml-auto text-xs font-normal">
              {filtered.length} von {articles.length} Artikeln
            </span>
          </div>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label class="form-control">
              <div class="label"><span class="label-text">Reifengröße</span></div>
              <select bind:value={size} class="select select-bordered select-sm w-full">
                <option value="">Alle</option>
                {#each sizes as s (s)}
                  <option value={s}>{s}</option>
                {/each}
              </select>
            </label>
            <label class="form-control">
              <div class="label"><span class="label-text">Saison</span></div>
              <select bind:value={season} class="select select-bordered select-sm w-full">
                <option value="">Alle</option>
                {#each seasons as s (s)}
                  <option value={s}>{s}</option>
                {/each}
              </select>
            </label>
            <label class="form-control">
              <div class="label"><span class="label-text">Marke</span></div>
              <select bind:value={brand} class="select select-bordered select-sm w-full">
                <option value="">Alle</option>
                {#each brands as b (b)}
                  <option value={b}>{b}</option>
                {/each}
              </select>
            </label>
            <label class="form-control">
              <div class="label"><span class="label-text">Max. Preis (€)</span></div>
              <input
                type="number"
                min="0"
                step="10"
                placeholder="z. B. 200"
                bind:value={maxPrice}
                class="input input-bordered input-sm w-full"
              />
            </label>
            <label class="form-control">
              <div class="label"><span class="label-text">Suche</span></div>
              <input
                type="search"
                placeholder="Modell, Hersteller …"
                bind:value={term}
                class="input input-bordered input-sm w-full"
              />
            </label>
          </div>
          <div>
            <button type="button" class="btn btn-ghost btn-sm" onclick={resetFilters}>
              <RotateCw class="size-4" aria-hidden="true" />
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {#if articles.length === 0}
        <div class="card bg-base-100 border-base-200 border" data-testid="empty">
          <div class="card-body items-center text-center">
            <h2 class="card-title">Aktuell sind keine Artikel verfügbar</h2>
            <p class="text-base-content/70">Schauen Sie in Kürze wieder vorbei.</p>
          </div>
        </div>
      {:else if filtered.length === 0}
        <div class="card bg-base-100 border-base-200 border" data-testid="no-results">
          <div class="card-body items-center text-center">
            <h2 class="card-title">Keine Artikel zu diesen Filtern</h2>
            <button type="button" class="btn btn-primary mt-2" onclick={resetFilters}>Filter zurücksetzen</button>
          </div>
        </div>
      {:else}
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="article-grid">
          {#each filtered as article (article.id)}
            <ArticleCard {article} />
          {/each}
        </div>
      {/if}
    {:catch err}
      <div role="alert" class="alert alert-error">
        <span>Das Sortiment konnte nicht geladen werden: {err.message}</span>
      </div>
    {/await}
  </div>
</section>
