import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

export async function dismissUserReview(page: Page) {
  await expect(
    page.locator("text=How would you rate your experience"),
  ).toBeVisible({ timeout: 8000 })
  await page.click('label:has-text("5 Stars")')
  await expect(page.locator("text=Thank You!")).toBeVisible()
  await page.click("[aria-label='Close']")
}
