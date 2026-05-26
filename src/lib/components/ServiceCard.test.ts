/**
 * Component tests for `ServiceCard`. Both renderings (link / static)
 * have the same title and description; only the href makes the surface
 * a clickable anchor.
 */

import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/svelte'
import ServiceCard from './ServiceCard.svelte'

describe('ServiceCard', () => {
  it('renders title and description', () => {
    const { getByRole, getByText } = render(ServiceCard, {
      title: 'Ölwechsel',
      description: 'Frisches Öl, sauberer Filter.'
    })
    expect(getByRole('heading', { name: 'Ölwechsel' })).toBeInTheDocument()
    expect(getByText('Frisches Öl, sauberer Filter.')).toBeInTheDocument()
  })

  it('becomes an anchor when href is supplied', () => {
    const { getByRole } = render(ServiceCard, {
      title: 'TÜV-Service',
      description: 'Hauptuntersuchung inklusive.',
      href: '/leistungen#tuev'
    })
    const link = getByRole('link', { name: /TÜV-Service/ })
    expect(link).toHaveAttribute('href', '/leistungen#tuev')
  })

  it('does not render as a link without href', () => {
    const { queryByRole } = render(ServiceCard, {
      title: 'Reifenwechsel',
      description: 'Saison- und Montageservice.'
    })
    expect(queryByRole('link')).toBeNull()
  })
})
