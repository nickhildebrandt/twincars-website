<script lang="ts">
  /**
   * Used-car portfolio list page (`/gebrauchtwagen`).
   *
   * Loads the inventory through `getUsedCars()` and shows a filterable
   * grid. Filters are client-side because the API doesn't (yet) accept
   * query parameters — see `MISSING_APIS.md`.
   */
  import { Filter, RotateCw } from '@lucide/svelte'
  import Seo from '$components/Seo.svelte'
  import UsedCarCard from '$components/UsedCarCard.svelte'
  import { uniqueValues } from '$features/gebrauchtwagen/format'
  import { getUsedCars } from './gebrauchtwagen.remote'
  import { company } from '$lib/company'

  /** Active make filter. Empty string = "any". */
  let make = $state<string>('')
  /** Active fuel-type filter. */
  let fuel = $state<string>('')
  /** Active gearbox filter. */
  let transmission = $state<string>('')
  /** Maximum price filter (EUR). `null` = no cap. */
  let maxPrice = $state<number | null>(null)
  /** Free-text search (matches title / description). */
  let searchTerm = $state<string>('')

  /**
   * Resets all filters back to "any". Wired to the reset button at the
   * top of the filter bar.
   */
  function resetFilters(): void {
    make = ''
    fuel = ''
    transmission = ''
    maxPrice = null
    searchTerm = ''
  }
</script>

<Seo
  title="Gebrauchtwagen aus Bernau – geprüft & sofort fahrbereit"
  description="Geprüfte Gebrauchtwagen bei TwinCars in Bernau bei Berlin. Tagesaktueller Bestand, faire Preise, persönliche Beratung. Jetzt durchstöbern."
/>

<section class="bg-gradient-to-br from-neutral via-neutral to-base-300 text-neutral-content py-12 md:py-16" aria-labelledby="cars-title">
  <div class="mx-auto max-w-7xl px-4">
    <p class="badge badge-primary badge-lg font-semibold">Gebrauchtwagen</p>
    <h1 id="cars-title" class="mt-4 text-3xl font-bold leading-tight md:text-5xl">
      Unser tagesaktueller Bestand
    </h1>
    <p class="mt-3 max-w-2xl text-lg opacity-90">
      Geprüfte Fahrzeuge, fair bewertet, sofort fahrbereit. Sie haben Fragen? Rufen Sie uns an unter
      <a class="link" href="tel:{company.contact.phoneE164}">{company.contact.phone}</a>.
    </p>
  </div>
</section>

<section class="bg-base-200 py-12 md:py-16">
  <div class="mx-auto max-w-7xl px-4">
    {#await getUsedCars()}
      <div class="flex items-center gap-3 text-base-content/70" role="status">
        <span class="loading loading-spinner loading-md" aria-hidden="true"></span>
        Lade Gebrauchtwagen…
      </div>
    {:then cars}
      {@const makes = uniqueValues(cars, 'make')}
      {@const fuels = uniqueValues(cars, 'fuel')}
      {@const transmissions = uniqueValues(cars, 'transmission')}
      {@const term = searchTerm.trim().toLowerCase()}
      {@const filtered = cars.filter((c) => {
        if (make && c.make !== make) return false
        if (fuel && c.fuel !== fuel) return false
        if (transmission && c.transmission !== transmission) return false
        if (maxPrice != null && (c.priceGross ?? Infinity) > maxPrice) return false
        if (term) {
          const hay = `${c.make ?? ''} ${c.model ?? ''} ${c.description ?? ''}`.toLowerCase()
          if (!hay.includes(term)) return false
        }
        return true
      })}

      <div class="card bg-base-100 border-base-200 mb-8 border" data-testid="filters">
        <div class="card-body gap-4 p-5">
          <div class="flex items-center gap-2 text-sm font-semibold">
            <Filter class="text-primary size-5" aria-hidden="true" />
            Filter
            <span class="text-base-content/60 ml-auto text-xs font-normal">
              {filtered.length} von {cars.length} Fahrzeuge
            </span>
          </div>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label class="form-control">
              <div class="label"><span class="label-text">Marke</span></div>
              <select bind:value={make} class="select select-bordered select-sm w-full">
                <option value="">Alle Marken</option>
                {#each makes as m (m)}
                  <option value={m}>{m}</option>
                {/each}
              </select>
            </label>
            <label class="form-control">
              <div class="label"><span class="label-text">Kraftstoff</span></div>
              <select bind:value={fuel} class="select select-bordered select-sm w-full">
                <option value="">Alle</option>
                {#each fuels as f (f)}
                  <option value={f}>{f}</option>
                {/each}
              </select>
            </label>
            <label class="form-control">
              <div class="label"><span class="label-text">Getriebe</span></div>
              <select bind:value={transmission} class="select select-bordered select-sm w-full">
                <option value="">Alle</option>
                {#each transmissions as t (t)}
                  <option value={t}>{t}</option>
                {/each}
              </select>
            </label>
            <label class="form-control">
              <div class="label"><span class="label-text">Max. Preis (€)</span></div>
              <input
                type="number"
                min="0"
                step="500"
                placeholder="z. B. 15000"
                bind:value={maxPrice}
                class="input input-bordered input-sm w-full"
              />
            </label>
            <label class="form-control">
              <div class="label"><span class="label-text">Suche</span></div>
              <input
                type="search"
                placeholder="Marke, Modell, …"
                bind:value={searchTerm}
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

      {#if cars.length === 0}
        <div class="card bg-base-100 border-base-200 border" data-testid="empty">
          <div class="card-body items-center text-center">
            <h2 class="card-title">Aktuell keine Fahrzeuge im Bestand</h2>
            <p class="text-base-content/70">
              Schauen Sie in Kürze wieder vorbei – oder rufen Sie uns an, wir helfen bei der Suche.
            </p>
            <a class="btn btn-primary mt-2" href="tel:{company.contact.phoneE164}">
              {company.contact.phone}
            </a>
          </div>
        </div>
      {:else if filtered.length === 0}
        <div class="card bg-base-100 border-base-200 border" data-testid="no-results">
          <div class="card-body items-center text-center">
            <h2 class="card-title">Kein Fahrzeug entspricht den Filtern</h2>
            <p class="text-base-content/70">Setzen Sie die Filter zurück, um den ganzen Bestand zu sehen.</p>
            <button type="button" class="btn btn-primary mt-2" onclick={resetFilters}>Filter zurücksetzen</button>
          </div>
        </div>
      {:else}
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="car-grid">
          {#each filtered as car (car.id)}
            <UsedCarCard {car} />
          {/each}
        </div>
      {/if}
    {:catch err}
      <div role="alert" class="alert alert-error">
        <span>Die Gebrauchtwagen konnten nicht geladen werden: {err.message}</span>
      </div>
    {/await}
  </div>
</section>
