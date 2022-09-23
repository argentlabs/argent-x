import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

export async function newAccount(page: Page) {
  await expect(page.locator("h1:has-text('Accounts')")).toBeVisible()
  await page.click("[aria-label='Create new wallet']")
  await page.click("text=Create new ArgentX account")
}
