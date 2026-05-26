<script lang="ts">
  /**
   * Catalogue teaser for a single tire.
   *
   * Tappable area links to the detail page. Holds a quick
   * "in den Warenkorb" button so customers can add common items
   * without leaving the listing.
   *
   * @prop {PublicTire} tire  Tire to render.
   */
  import { Plus, Tag } from '@lucide/svelte'
  import PlaceholderImage from '$components/PlaceholderImage.svelte'
  import { useCart } from '$features/reifenshop/cart-context.svelte'
  import { formatEur, tireSpecLine, tireTitle } from '$features/reifenshop/format'
  import type { PublicTire } from '$lib/server/api/types'

  interface Props {
    tire: PublicTire
  }

  let { tire }: Props = $props()

  const cart = useCart()
  const title = $derived(tireTitle(tire))
  const spec = $derived(tireSpecLine(tire))
  const available = $derived(tire.currentPriceNet != null)
  const photo = $derived(tire.photos[0])

  /** Adds one of this tire to the cart and stops link propagation. */
  function addToCart(e: MouseEvent): void {
    e.preventDefault()
    e.stopPropagation()
    cart.add(tire, 1)
  }
</script>

<a
  href="/reifenshop/{tire.id}"
  class="card bg-base-100 border-base-200 hover:border-primary group flex flex-col overflow-hidden border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
>
  {#if photo}
    <img
      src={photo.url}
      alt={title}
      class="aspect-square w-full object-cover"
      loading="lazy"
    />
  {:else}
    <PlaceholderImage label={title} icon="circle-dot" aspect="aspect-square" tone="primary" />
  {/if}
  <div class="card-body flex-1 p-4">
    {#if spec}
      <p class="text-base-content/60 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider">
        <Tag class="size-3" aria-hidden="true" />
        {spec}
      </p>
    {/if}
    <h3 class="card-title text-base leading-snug">{title}</h3>
    <div class="mt-auto flex items-end justify-between gap-3 pt-3">
      <div>
        <p class="text-primary text-xl font-bold">{formatEur(tire.currentPriceNet)}</p>
        <p class="text-base-content/60 text-xs">pro Stück, zzgl. MwSt.</p>
      </div>
      <button
        type="button"
        onclick={addToCart}
        class="btn btn-primary btn-sm"
        disabled={!available}
        aria-label="In den Warenkorb"
      >
        <Plus class="size-4" aria-hidden="true" />
        Hinzu
      </button>
    </div>
  </div>
</a>
