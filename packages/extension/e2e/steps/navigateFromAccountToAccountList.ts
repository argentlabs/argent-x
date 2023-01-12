import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

export async function navigateFromAccountToAccountList(page: Page) {
  await page.locator('[aria-label="Show account list"]').click()
  await expect(page.locator("h6:has-text(' accounts')")).toBeVisible()
}
