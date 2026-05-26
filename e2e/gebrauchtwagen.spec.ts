/**
 * Used-car portfolio: list, detail, inquiry form.
 * The mock manager exposes two cars (Polo, Audi A3).
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Gebrauchtwagen', () => {
  test('list page renders both cars and is accessible', async ({ page }) => {
    await page.goto('/gebrauchtwagen')
    await expect(
      page.getByRole('heading', { name: /Unser tagesaktueller Bestand/i, level: 1 })
    ).toBeVisible()
    await expect(page.getByText('VW Polo 1.0 TSI').first()).toBeVisible()
    await expect(page.getByText('Audi A3 Sportback').first()).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
  })

  test('detail page opens via list and accepts an inquiry', async ({ page }) => {
    await page.goto('/gebrauchtwagen')
    await page.getByRole('link', { name: /VW Polo/ }).first().click()

    await expect(page).toHaveURL(/\/gebrauchtwagen\/car-polo$/)
    await expect(
      page.getByRole('heading', { name: /VW Polo 1\.0 TSI/, level: 1 })
    ).toBeVisible()

    await page.getByLabel('Name').fill('Erika Musterfrau')
    await page.getByLabel('E-Mail').fill('erika@example.com')
    await page
      .getByLabel(/Nachricht/i)
      .fill('Ist der Wagen noch verfügbar?')

    await page.getByRole('button', { name: /Anfrage senden/i }).click()

    await expect(
      page.getByText(/Vielen Dank|Anfrage erhalten|Wir melden uns/i)
    ).toBeVisible({ timeout: 15_000 })
  })
})
