/**
 * End-to-end coverage for the Reifenshop:
 *  catalogue → add to cart → cart page → checkout → order confirmed.
 */

import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Reifenshop', () => {
  test('catalogue page is accessible', async ({ page }) => {
    await page.goto('/reifenshop')
    await expect(
      page.getByRole('heading', { name: /Reifen schnell und fair/i, level: 1 })
    ).toBeVisible()
    await expect(
      page.getByText('Continental PremiumContact 6 205/55 R16').first()
    ).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
  })

  test('add to cart from list, then complete checkout', async ({ page }) => {
    await page.goto('/reifenshop')

    // First card's "Hinzu" button.
    await page
      .getByRole('button', { name: 'In den Warenkorb' })
      .first()
      .click()

    // Cart badge should appear in the header (count >= 1).
    await page.goto('/reifenshop/warenkorb')
    await expect(
      page.getByRole('heading', { name: /Warenkorb/i, level: 1 })
    ).toBeVisible()
    await expect(
      page.getByText('Continental PremiumContact 6 205/55 R16')
    ).toBeVisible()

    await page.getByRole('link', { name: /Zur Kasse/i }).click()

    await expect(page).toHaveURL(/\/reifenshop\/checkout$/)

    await page.getByLabel('Name').fill('Max Mustermann')
    await page.getByLabel('E-Mail').fill('max@example.com')
    await page.getByLabel('Telefon').fill('+49 30 1234567')
    await page.getByLabel('Straße & Hausnummer').fill('Bahnhofstr. 1')
    await page.getByLabel('PLZ').fill('16321')
    await page.getByLabel('Ort').fill('Bernau bei Berlin')

    // Pick the first shipping option radio.
    await page.locator('input[type="radio"][name="shippingOptionId"]').first().check()

    await page.getByRole('button', { name: /Bestellung absenden/i }).click()

    await expect(page.getByTestId('order-confirmation')).toBeVisible({
      timeout: 15_000
    })
    await expect(
      page.getByText(/Vielen Dank für Ihre Bestellung/i)
    ).toBeVisible()
  })
})
