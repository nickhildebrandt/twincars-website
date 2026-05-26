/**
 * End-to-end coverage for the appointment booking flow.
 * The mock manager returns four free slots starting at 09:00 of the
 * picked day, so we walk service → slot → contact → done.
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Termin booking', () => {
  test('shows services and is accessible', async ({ page }) => {
    await page.goto('/termin')
    await expect(
      page.getByRole('heading', { name: /Termin in wenigen Klicks/i, level: 1 })
    ).toBeVisible()
    await expect(page.getByText('Ölwechsel inkl. Filter')).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
  })

  test('completes a booking happy path', async ({ page }) => {
    await page.goto('/termin')

    // Pick a service — the click also advances to the slot step.
    await page.getByText('Ölwechsel inkl. Filter').click()
    await expect(page.getByTestId('step-slot')).toBeVisible()

    // Click an enabled calendar day (first non-disabled gridcell).
    const enabledDay = page
      .getByRole('gridcell', { disabled: false })
      .first()
    await enabledDay.click()

    // First slot button (formatted as HH:MM, e.g. "09:00").
    const firstSlot = page.getByRole('button', { name: /^\d{2}:\d{2}$/ }).first()
    await expect(firstSlot).toBeVisible({ timeout: 15_000 })
    await firstSlot.click()

    await expect(page.getByTestId('step-contact')).toBeVisible()

    await page.getByLabel('Name').fill('Max Mustermann')
    await page.getByLabel('E-Mail').fill('max@example.com')
    await page.getByLabel('Telefon').fill('+49 30 1234567')

    await page
      .getByRole('button', { name: /Termin verbindlich buchen/i })
      .click()

    await expect(page.getByTestId('step-done')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Termin gebucht/i)).toBeVisible()
  })
})
