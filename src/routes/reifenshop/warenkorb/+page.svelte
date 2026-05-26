<script lang="ts">
  /**
   * Cart page (`/reifenshop/warenkorb`).
   *
   * Lists every line in the local cart, lets the customer adjust
   * quantities or remove items, and shows the running subtotal. The
   * "Zur Kasse" button only navigates to the checkout step.
   */
  import { ArrowLeft, Minus, Plus, Trash2 } from '@lucide/svelte'
  import Seo from '$components/Seo.svelte'
  import { useCart } from '$features/reifenshop/cart-context.svelte'
  import { formatEur, tireTitle } from '$features/reifenshop/format'

  const cart = useCart()
</script>

<Seo
  title="Warenkorb – Reifenshop TwinCars"
  description="Ihre ausgewählten Artikel im Reifenshop von TwinCars Bernau. Menge anpassen, Versand wählen, bestellen."
  noindex
/>

<section class="bg-base-200 py-12 md:py-16">
  <div class="mx-auto max-w-5xl px-4">
    <a href="/reifenshop" class="link link-hover text-base-content/70 mb-4 inline-flex items-center gap-1 text-sm">
      <ArrowLeft class="size-4" aria-hidden="true" />
      Weiter einkaufen
    </a>

    <h1 class="text-3xl font-bold leading-tight md:text-4xl">Warenkorb</h1>

    {#if cart.lines.length === 0}
      <div class="card bg-base-100 border-base-200 mt-6 border" data-testid="empty-cart">
        <div class="card-body items-center text-center">
          <h2 class="card-title">Ihr Warenkorb ist leer</h2>
          <p class="text-base-content/70">Stöbern Sie in unserem Reifensortiment und legen Sie Artikel in den Warenkorb.</p>
          <a class="btn btn-primary mt-2" href="/reifenshop">Zum Reifenshop</a>
        </div>
      </div>
    {:else}
      <div class="card bg-base-100 border-base-200 mt-6 border" data-testid="cart-lines">
        <ul class="divide-base-200 divide-y">
          {#each cart.lines as line (line.id)}
            {@const title = tireTitle(line)}
            <li class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
              <div>
                <p class="font-semibold">{title}</p>
                <p class="text-base-content/60 text-xs">{line.sizeLabel} · {line.season}</p>
                <p class="text-base-content/60 text-xs">Art.-Nr. {line.articleNumber}</p>
                <p class="text-base-content/60 text-xs">{formatEur(line.unitPriceNet)} / Stück</p>
              </div>
              <div class="join">
                <button
                  type="button"
                  class="btn btn-sm join-item"
                  onclick={() => cart.setQuantity(line.id, line.quantity - 1)}
                  aria-label="Menge verringern für {title}"
                >
                  <Minus class="size-4" aria-hidden="true" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={line.quantity}
                  onchange={(e) => cart.setQuantity(line.id, Number((e.currentTarget as HTMLInputElement).value) || 1)}
                  class="input input-bordered input-sm join-item w-16 text-center"
                  aria-label="Menge für {title}"
                />
                <button
                  type="button"
                  class="btn btn-sm join-item"
                  onclick={() => cart.setQuantity(line.id, line.quantity + 1)}
                  aria-label="Menge erhöhen für {title}"
                >
                  <Plus class="size-4" aria-hidden="true" />
                </button>
              </div>
              <div class="text-right font-semibold sm:w-32">
                {formatEur(line.unitPriceNet * line.quantity)}
              </div>
              <button
                type="button"
                class="btn btn-ghost btn-sm text-error"
                onclick={() => cart.remove(line.id)}
                aria-label="Artikel entfernen: {title}"
              >
                <Trash2 class="size-4" aria-hidden="true" />
              </button>
            </li>
          {/each}
        </ul>

        <div class="border-base-200 grid gap-2 border-t p-5 sm:grid-cols-2 sm:items-center">
          <p class="text-base-content/70 text-sm">
            Zwischensumme (netto), zzgl. MwSt. und Versand.
          </p>
          <div class="text-right">
            <p class="text-base-content/60 text-xs uppercase tracking-wider">Zwischensumme</p>
            <p class="text-primary text-2xl font-bold">{formatEur(cart.totals.subtotalNet)}</p>
          </div>
        </div>

        <div class="border-base-200 flex flex-wrap items-center justify-end gap-3 border-t p-5">
          <button type="button" class="btn btn-ghost" onclick={() => cart.clear()}>
            Warenkorb leeren
          </button>
          <a href="/reifenshop/checkout" class="btn btn-primary">Zur Kasse</a>
        </div>
      </div>
    {/if}
  </div>
</section>
