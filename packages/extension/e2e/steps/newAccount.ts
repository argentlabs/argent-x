import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

export async function newAccountWhenEmpty(page: Page) {
  await expect(
    page.locator("h5:has-text('You have no accounts on Localhost 5050')"),
  ).toBeVisible()
  await page.click("button:has-text('Create account')")
}

export async function newAccount(page: Page) {
  await expect(page.locator("h6:has-text(' accounts')")).toBeVisible()
  await page.click("[aria-label='Create new wallet']")
}
