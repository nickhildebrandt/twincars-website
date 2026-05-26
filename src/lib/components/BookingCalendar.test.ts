/**
 * Integration tests for `BookingCalendar`. We don't try to assert on
 * the specific date the calendar shows on first render (that depends
 * on the real system clock); we only check structural behaviour:
 * month navigation, that disabled cells can't be selected, and that
 * clicking an enabled day updates `selected`.
 */

import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/svelte'
import { userEvent } from '@testing-library/user-event'
import { flushSync } from 'svelte'
import BookingCalendar from './BookingCalendar.svelte'

describe('BookingCalendar', () => {
  it('renders weekday labels in German, Monday-first', () => {
    const { getByRole } = render(BookingCalendar, {})
    const grid = getByRole('grid', { name: 'Terminkalender' })
    const headerCells = grid.querySelectorAll(':scope > div')
    expect(headerCells[0]).toHaveTextContent('Mo')
    expect(headerCells[6]).toHaveTextContent('So')
  })

  it('navigates to the next month when "Nächster Monat" is clicked', async () => {
    const user = userEvent.setup()
    const { getByRole, container } = render(BookingCalendar, {})

    const heading = container.querySelector('h3')!
    const initial = heading.textContent?.trim()

    await user.click(getByRole('button', { name: 'Nächster Monat' }))
    flushSync()

    expect(heading.textContent?.trim()).not.toBe(initial)
  })

  it('disabled cells (past, Sundays, closed) cannot be selected', async () => {
    const user = userEvent.setup()
    const { getAllByRole } = render(BookingCalendar, {})

    const cells = getAllByRole('gridcell') as HTMLButtonElement[]
    const disabled = cells.find((c) => c.disabled)
    expect(disabled).toBeDefined()

    // userEvent refuses to click a disabled button — assert pointer-events.
    await user.click(disabled!).catch(() => {})
    flushSync()

    expect(disabled!.getAttribute('aria-selected')).toBe('false')
  })

  it('clicking an enabled day marks it as aria-selected=true', async () => {
    const user = userEvent.setup()
    const { getAllByRole } = render(BookingCalendar, {})

    const cells = getAllByRole('gridcell') as HTMLButtonElement[]
    const enabled = cells.find((c) => !c.disabled)
    expect(enabled).toBeDefined()

    await user.click(enabled!)
    flushSync()

    expect(enabled!.getAttribute('aria-selected')).toBe('true')
  })
})
