<script lang="ts">
  /**
   * Catalogue teaser for a single shop article (tire / accessory).
   *
   * Tappable area links to the detail page. Holds a quick
   * "in den Warenkorb" button so customers can add common items
   * without leaving the listing.
   *
   * @prop {PublicArticle} article  Article to render.
   */
  import { Plus, Tag } from '@lucide/svelte'
  import PlaceholderImage from '$components/PlaceholderImage.svelte'
  import { useCart } from '$features/reifenshop/cart-context.svelte'
  import { formatEur, specLine } from '$features/reifenshop/format'
  import type { PublicArticle } from '$lib/server/api/types'

  interface Props {
    article: PublicArticle
  }

  let { article }: Props = $props()

  const cart = useCart()
  const spec = $derived(specLine(article))
  const available = $derived(article.currentPriceNet != null)

  /** Adds one of this article to the cart and stops link propagation. */
  function addToCart(e: MouseEvent): void {
    e.preventDefault()
    e.stopPropagation()
    cart.add(article, 1)
  }
</script>

<a
  href="/reifenshop/{article.id}"
  class="card bg-base-100 border-base-200 hover:border-primary group flex flex-col overflow-hidden border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
>
  <PlaceholderImage label={article.description} icon="circle-dot" aspect="aspect-square" tone="primary" />
  <div class="card-body flex-1 p-4">
    {#if spec}
      <p class="text-base-content/60 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider">
        <Tag class="size-3" aria-hidden="true" />
        {spec}
      </p>
    {/if}
    <h3 class="card-title text-base leading-snug">{article.description}</h3>
    <div class="mt-auto flex items-end justify-between gap-3 pt-3">
      <div>
        <p class="text-primary text-xl font-bold">{formatEur(article.currentPriceNet)}</p>
        <p class="text-base-content/60 text-xs">pro {article.unit}, zzgl. MwSt.</p>
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
