/**
 * Component tests for `UsedCarCard`. Asserts on the title, price,
 * link target and the photo fallback to the placeholder.
 */

import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/svelte'
import UsedCarCard from './UsedCarCard.svelte'
import type { PublicUsedCar } from '$lib/server/api/types'

function car(overrides: Partial<PublicUsedCar> = {}): PublicUsedCar {
  return {
    id: 'car-1',
    make: 'VW',
    model: 'Polo',
    firstRegistration: '2021-06-15',
    mileageKm: 45000,
    priceGross: 13500,
    fuel: 'Benzin',
    transmission: 'Schaltgetriebe',
    description: null,
    photos: [],
    ...overrides
  }
}

describe('UsedCarCard', () => {
  it('links to the detail route', () => {
    const { getByRole } = render(UsedCarCard, { car: car() })
    expect(getByRole('link')).toHaveAttribute('href', '/gebrauchtwagen/car-1')
  })

  it('shows make + model as the heading', () => {
    const { getByRole } = render(UsedCarCard, { car: car() })
    expect(getByRole('heading', { name: 'VW Polo' })).toBeInTheDocument()
  })

  it('renders the formatted price', () => {
    const { getByText } = render(UsedCarCard, { car: car() })
    expect(getByText(/13\.500\s?€/)).toBeInTheDocument()
  })

  it('shows formatted first registration', () => {
    const { getByText } = render(UsedCarCard, { car: car() })
    expect(getByText(/EZ\s06\/2021/)).toBeInTheDocument()
  })

  it('renders a placeholder when no photos exist', () => {
    const { getByRole } = render(UsedCarCard, { car: car({ photos: [] }) })
    expect(getByRole('img', { name: 'VW Polo' })).toBeInTheDocument()
  })

  it('uses the first photo when one exists', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo='
    const { getByAltText } = render(UsedCarCard, {
      car: car({ photos: [{ mime: 'image/png', dataUrl }] })
    })
    const img = getByAltText('VW Polo') as HTMLImageElement
    expect(img.tagName).toBe('IMG')
    expect(img.src).toBe(dataUrl)
  })
})
