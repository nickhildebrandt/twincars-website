/**
 * Component tests for `ArticleCard`. The card reads from the cart
 * context, so we mount it inside a small harness that provides the
 * cart. Each test gets a fresh localStorage so cart state is isolated.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync } from 'svelte'
import ArticleCardHarness from './__fixtures__/ArticleCardHarness.svelte'
import type { PublicArticle } from '$lib/server/api/types'

function article(overrides: Partial<PublicArticle> = {}): PublicArticle {
  return {
    id: 'a-1',
    articleNumber: 'TC-CON-2055516',
    description: 'Continental PremiumContact 6',
    unit: 'Stück',
    currentPriceNet: 129,
    attributes: { size: '205/55 R16', season: 'Sommer', brand: 'Continental' },
    shippingOptionId: null,
    ...overrides
  }
}

describe('ArticleCard', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => window.localStorage.clear())

  it('renders description, spec line and price', () => {
    const { getByRole, getByText } = render(ArticleCardHarness, {
      article: article()
    })
    expect(
      getByRole('heading', { name: 'Continental PremiumContact 6' })
    ).toBeInTheDocument()
    expect(getByText(/205\/55 R16/)).toBeInTheDocument()
    expect(getByText(/129,00\s?€/)).toBeInTheDocument()
  })

  it('links to the article detail page', () => {
    const { getByRole } = render(ArticleCardHarness, { article: article() })
    expect(getByRole('link')).toHaveAttribute('href', '/reifenshop/a-1')
  })

  it('disables the add button when no price is available', () => {
    const { getByRole } = render(ArticleCardHarness, {
      article: article({ currentPriceNet: null })
    })
    expect(getByRole('button', { name: /Warenkorb/i })).toBeDisabled()
  })

  it('clicking "Hinzu" adds to the cart without navigating', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(ArticleCardHarness, {
      article: article()
    })

    await user.click(getByRole('button', { name: /Warenkorb/i }))
    flushSync()

    // The cart persists to localStorage via `$effect`; reading the key
    // here doubles as a verification that the add ran end-to-end.
    const raw = window.localStorage.getItem('tc.cart.v1')
    expect(raw).toBeTruthy()
    const lines = JSON.parse(raw!) as { id: string; quantity: number }[]
    expect(lines).toHaveLength(1)
    expect(lines[0].id).toBe('a-1')
    expect(lines[0].quantity).toBe(1)
  })
})
