<script lang="ts">
  /**
   * Checkout (`/reifenshop/checkout`).
   *
   * Customer enters their shipping address and picks a shipping option,
   * then submits the order. The cart snapshot is serialised into a
   * hidden form field so the server can validate it without
   * round-tripping through the API again.
   *
   * IMPORTANT: payment is **not** processed here — see the project brief.
   * The order is forwarded to the workshop via `placeOrder`; payment is
   * handled separately (out of scope for this site).
   */
  import { ArrowLeft, CheckCircle2 } from '@lucide/svelte'
  import Seo from '$components/Seo.svelte'
  import { useCart } from '$features/reifenshop/cart-context.svelte'
  import { formatEur } from '$features/reifenshop/format'
  import { getShippingOptions, placeOrder } from '../reifenshop.remote'

  const cart = useCart()

  /** Selected shipping option id. Empty = nothing chosen yet. */
  let shippingId = $state<string>('')

  /** Reactive JSON snapshot of the cart — passed via a hidden form field. */
  const cartJson = $derived(
    JSON.stringify(
      cart.lines.map((l) => ({
        id: l.id,
        articleNumber: l.articleNumber,
        description: l.description,
        unitPriceNet: l.unitPriceNet,
        quantity: l.quantity
      }))
    )
  )

  /** Clear the cart once the order has been confirmed. */
  $effect(() => {
    if (placeOrder.result?.status === 'ok') {
      cart.clear()
    }
  })
</script>

<Seo
  title="Bestellabschluss – Reifenshop TwinCars"
  description="Schließen Sie Ihre Reifen-Bestellung bei TwinCars in Bernau bei Berlin sicher ab."
  noindex
/>

<section class="bg-base-200 py-12 md:py-16">
  <div class="mx-auto max-w-5xl px-4">
    <a href="/reifenshop/warenkorb" class="link link-hover text-base-content/70 mb-4 inline-flex items-center gap-1 text-sm">
      <ArrowLeft class="size-4" aria-hidden="true" />
      Zurück zum Warenkorb
    </a>

    <h1 class="text-3xl font-bold leading-tight md:text-4xl">Bestellabschluss</h1>

    {#if placeOrder.result?.status === 'ok'}
      {@const r = placeOrder.result}
      <div class="card bg-base-100 border-base-200 mx-auto mt-6 max-w-2xl border" data-testid="order-confirmation">
        <div class="card-body items-center text-center">
          <div class="bg-success/15 text-success rounded-full p-3">
            <CheckCircle2 class="size-10" aria-hidden="true" />
          </div>
          <h2 class="card-title mt-3 text-2xl md:text-3xl">Vielen Dank für Ihre Bestellung!</h2>
          <p class="text-base-content/80">
            Wir haben Ihre Bestellung erhalten und melden uns in Kürze mit der Zahlungsabwicklung und einem Liefertermin.
          </p>
          <dl class="bg-base-200 mt-4 grid w-full grid-cols-3 gap-2 rounded-xl p-4 text-sm">
            <dt class="text-base-content/60">Referenz</dt>
            <dd class="col-span-2 font-mono text-xs">{r.orderRef}</dd>
            <dt class="text-base-content/60">Zwischensumme</dt>
            <dd class="col-span-2 font-semibold">{formatEur(r.totalNet)}</dd>
          </dl>
          <div class="mt-4 flex gap-3">
            <a href="/" class="btn btn-ghost">Zur Startseite</a>
            <a href="/reifenshop" class="btn btn-outline">Weiter einkaufen</a>
          </div>
        </div>
      </div>
    {:else if cart.lines.length === 0}
      <div class="card bg-base-100 border-base-200 mt-6 border">
        <div class="card-body items-center text-center">
          <h2 class="card-title">Ihr Warenkorb ist leer</h2>
          <a class="btn btn-primary mt-2" href="/reifenshop">Zum Reifenshop</a>
        </div>
      </div>
    {:else}
      <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <form
          {...placeOrder}
          class="card bg-base-100 border-base-200 grid gap-4 border p-6 md:grid-cols-2"
          data-testid="checkout-form"
          novalidate
        >
          <input type="hidden" name="cart" value={cartJson} />

          <label class="form-control md:col-span-1">
            <div class="label"><span class="label-text">Name *</span></div>
            <input
              {...placeOrder.fields.customerName.as('text')}
              required
              autocomplete="name"
              class="input input-bordered w-full"
            />
            {#each placeOrder.fields.customerName.issues() ?? [] as issue (issue.message)}
              <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
            {/each}
          </label>

          <label class="form-control md:col-span-1">
            <div class="label"><span class="label-text">E-Mail *</span></div>
            <input
              {...placeOrder.fields.customerEmail.as('email')}
              required
              autocomplete="email"
              class="input input-bordered w-full"
            />
            {#each placeOrder.fields.customerEmail.issues() ?? [] as issue (issue.message)}
              <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
            {/each}
          </label>

          <label class="form-control md:col-span-1">
            <div class="label"><span class="label-text">Telefon</span></div>
            <input
              {...placeOrder.fields.customerPhone.as('tel')}
              autocomplete="tel"
              class="input input-bordered w-full"
            />
          </label>

          <label class="form-control md:col-span-2">
            <div class="label"><span class="label-text">Straße & Hausnummer *</span></div>
            <input
              {...placeOrder.fields.street.as('text')}
              required
              autocomplete="street-address"
              class="input input-bordered w-full"
            />
            {#each placeOrder.fields.street.issues() ?? [] as issue (issue.message)}
              <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
            {/each}
          </label>

          <label class="form-control md:col-span-1">
            <div class="label"><span class="label-text">PLZ *</span></div>
            <input
              {...placeOrder.fields.zip.as('text')}
              required
              autocomplete="postal-code"
              inputmode="numeric"
              class="input input-bordered w-full"
            />
            {#each placeOrder.fields.zip.issues() ?? [] as issue (issue.message)}
              <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
            {/each}
          </label>

          <label class="form-control md:col-span-1">
            <div class="label"><span class="label-text">Ort *</span></div>
            <input
              {...placeOrder.fields.city.as('text')}
              required
              autocomplete="address-level2"
              class="input input-bordered w-full"
            />
            {#each placeOrder.fields.city.issues() ?? [] as issue (issue.message)}
              <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
            {/each}
          </label>

          <fieldset class="md:col-span-2">
            <legend class="label-text mb-2 block font-semibold">Versandoption *</legend>
            {#await getShippingOptions()}
              <div class="text-base-content/70 flex items-center gap-3" role="status">
                <span class="loading loading-spinner loading-sm" aria-hidden="true"></span>
                Lade Versandoptionen…
              </div>
            {:then options}
              {#if options.length === 0}
                <p class="text-base-content/60 text-sm">Derzeit sind keine Versandoptionen verfügbar.</p>
              {:else}
                <div class="grid gap-2">
                  {#each options as opt (opt.id)}
                    <label
                      class="border-base-200 hover:border-primary flex cursor-pointer items-start gap-3 rounded-xl border p-3"
                      class:border-primary={shippingId === opt.id}
                      class:bg-primary={false}
                    >
                      <input
                        type="radio"
                        name="shippingOptionId"
                        value={opt.id}
                        bind:group={shippingId}
                        class="radio radio-primary radio-sm mt-1"
                      />
                      <div class="flex-1">
                        <p class="font-semibold">{opt.name}</p>
                        {#if opt.description}
                          <p class="text-base-content/70 text-xs">{opt.description}</p>
                        {/if}
                        <p class="text-primary mt-1 text-sm font-medium">
                          {opt.priceNet === 0 ? 'Kostenlos' : formatEur(opt.priceNet)}
                          {#if opt.freeAboveNet}
                            <span class="text-base-content/60 text-xs">
                              · Versandfrei ab {formatEur(opt.freeAboveNet)}
                            </span>
                          {/if}
                        </p>
                      </div>
                    </label>
                  {/each}
                </div>
              {/if}
            {:catch err}
              <div role="alert" class="alert alert-error">
                <span>Versandoptionen konnten nicht geladen werden: {err.message}</span>
              </div>
            {/await}
            {#each placeOrder.fields.shippingOptionId.issues() ?? [] as issue (issue.message)}
              <p class="text-error mt-2 text-xs">{issue.message}</p>
            {/each}
          </fieldset>

          <label class="form-control md:col-span-2">
            <div class="label"><span class="label-text">Bemerkung (optional)</span></div>
            <textarea
              {...placeOrder.fields.notes.as('text')}
              rows="3"
              class="textarea textarea-bordered w-full"
              placeholder="z. B. Wunschtermin für die Montage in der Werkstatt"
            ></textarea>
            {#each placeOrder.fields.notes.issues() ?? [] as issue (issue.message)}
              <div class="label"><span class="label-text-alt text-error">{issue.message}</span></div>
            {/each}
          </label>

          <div class="hidden" aria-hidden="true">
            <label>
              Bitte leer lassen
              <input type="text" name="website" tabindex="-1" autocomplete="off" />
            </label>
          </div>

          {#if placeOrder.result}
            <div role="alert" class="alert alert-error md:col-span-2">
              <span>{placeOrder.result.message}</span>
            </div>
          {/if}

          <div class="md:col-span-2 flex flex-wrap items-center justify-end gap-3">
            <p class="text-base-content/60 mr-auto text-xs">
              Mit dem Absenden stimmen Sie unserer
              <a class="link link-hover" href="/datenschutz">Datenschutzerklärung</a>
              zu. Die Bezahlung erfolgt separat.
            </p>
            <button type="submit" class="btn btn-primary" disabled={placeOrder.pending > 0}>
              {#if placeOrder.pending > 0}
                <span class="loading loading-spinner loading-sm" aria-hidden="true"></span>
              {/if}
              Bestellung absenden
            </button>
          </div>
        </form>

        <aside class="card bg-base-100 border-base-200 h-fit border" data-testid="order-summary">
          <div class="card-body p-5">
            <h2 class="font-semibold">Ihre Bestellung</h2>
            <ul class="divide-base-200 mt-2 divide-y text-sm">
              {#each cart.lines as line (line.id)}
                <li class="flex items-start justify-between gap-3 py-2">
                  <span>{line.quantity}× {line.description}</span>
                  <span class="font-medium">{formatEur(line.unitPriceNet * line.quantity)}</span>
                </li>
              {/each}
            </ul>
            <div class="border-base-200 mt-2 flex items-center justify-between border-t pt-2 text-sm">
              <span class="text-base-content/70">Zwischensumme (netto)</span>
              <span class="font-semibold">{formatEur(cart.totals.subtotalNet)}</span>
            </div>
            <p class="text-base-content/60 text-xs">
              Versandkosten und Steuer werden im nächsten Schritt zur Bestellbestätigung berechnet.
            </p>
          </div>
        </aside>
      </div>
    {/if}
  </div>
</section>
