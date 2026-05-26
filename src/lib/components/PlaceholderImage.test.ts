/**
 * Component tests for `PlaceholderImage`. We don't assert on the
 * gradient class soup — just on the bits that affect a11y and the
 * label shown to users.
 */

import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/svelte'
import PlaceholderImage from './PlaceholderImage.svelte'

describe('PlaceholderImage', () => {
  it('renders the label as visible text and ARIA label', () => {
    const { getByRole, getByText } = render(PlaceholderImage, {
      label: 'Reifen 205/55 R16'
    })
    const img = getByRole('img')
    expect(img).toHaveAttribute('aria-label', 'Reifen 205/55 R16')
    expect(getByText('Reifen 205/55 R16')).toBeInTheDocument()
  })

  it('uses a generic ARIA label when no label is given', () => {
    const { getByRole } = render(PlaceholderImage, {})
    expect(getByRole('img')).toHaveAttribute('aria-label', 'Platzhalter-Bild')
  })
})
