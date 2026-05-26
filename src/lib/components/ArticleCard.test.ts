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
import type { PublicTire } from '$lib/server/api/types'

function tire(overrides: Partial<PublicTire> = {}): PublicTire {
  return {
    id: 't-1',
    articleNumber: 'TC-CON-2055516',
    brand: 'Continental',
    model: 'PremiumContact 6',
    width: 205,
    aspectRatio: 55,
    construction: 'R',
    diameterInch: 16,
    sizeLabel: '205/55 R16',
    loadIndex: '91',
    speedIndex: 'V',
    season: 'Sommer',
    ean: null,
    manufacturerPartNumber: null,
    fuelEfficiency: 'B',
    wetGrip: 'A',
    noiseClass: 'B',
    noiseDb: 71,
    runFlat: false,
    reinforced: false,
    studdedWinter: false,
    mSMarking: false,
    snowFlake: false,
    evCertified: false,
    description: '',
    currentPriceNet: 129,
    photos: [],
    shippingOptionId: null,
    ...overrides
  }
}

describe('ArticleCard', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => window.localStorage.clear())

  it('renders title, spec line and price', () => {
    const { getByRole, getByText } = render(ArticleCardHarness, {
      tire: tire()
    })
    expect(
      getByRole('heading', { name: 'Continental PremiumContact 6' })
    ).toBeInTheDocument()
    expect(getByText(/205\/55 R16/)).toBeInTheDocument()
    expect(getByText(/129,00\s?€/)).toBeInTheDocument()
  })

  it('links to the tire detail page', () => {
    const { getByRole } = render(ArticleCardHarness, { tire: tire() })
    expect(getByRole('link')).toHaveAttribute('href', '/reifenshop/t-1')
  })

  it('disables the add button when no price is available', () => {
    const { getByRole } = render(ArticleCardHarness, {
      tire: tire({ currentPriceNet: null })
    })
    expect(getByRole('button', { name: /Warenkorb/i })).toBeDisabled()
  })

  it('clicking "Hinzu" adds to the cart without navigating', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(ArticleCardHarness, {
      tire: tire()
    })

    await user.click(getByRole('button', { name: /Warenkorb/i }))
    flushSync()

    // The cart persists to localStorage via `$effect`; reading the key
    // here doubles as a verification that the add ran end-to-end.
    const raw = window.localStorage.getItem('tc.cart.v2')
    expect(raw).toBeTruthy()
    const lines = JSON.parse(raw!) as { id: string; quantity: number }[]
    expect(lines).toHaveLength(1)
    expect(lines[0].id).toBe('t-1')
    expect(lines[0].quantity).toBe(1)
  })
})
