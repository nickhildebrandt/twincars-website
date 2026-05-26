/**
 * Smoke + accessibility test for the public landing page.
 * The mock-manager returns a static catalogue, so the home page can
 * render its services teaser without needing the real API.
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Home page', () => {
  test('renders the hero and key sections', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/TwinCars/i)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /Termin/i }).first()).toBeVisible()
  })

  test('has no critical accessibility violations', async ({ page }) => {
    await page.goto('/')
    // Wait for hydration so dynamic content (services list) is in the DOM.
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
  })
})
