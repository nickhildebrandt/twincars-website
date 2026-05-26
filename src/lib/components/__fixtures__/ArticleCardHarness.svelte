<script lang="ts">
  /**
   * Test harness that provides the cart context required by
   * `ArticleCard`, then mounts the component under test. Used only
   * from unit tests.
   *
   * @prop {PublicArticle} article  Article forwarded to ArticleCard.
   */
  import ArticleCard from '$components/ArticleCard.svelte'
  import { provideCart } from '$features/reifenshop/cart-context.svelte'
  import type { CartStore } from '$features/reifenshop/cart.svelte'
  import type { PublicArticle } from '$lib/server/api/types'

  interface Props {
    article: PublicArticle
    /** Exposes the provided cart to the test via bindable prop. */
    cart?: CartStore
  }

  let { article, cart = $bindable() }: Props = $props()
  cart = provideCart()
</script>

<ArticleCard {article} />
