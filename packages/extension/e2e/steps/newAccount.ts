import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

const isLedgerEnabled = (process.env.FEATURE_LEDGER || "false") === "true"

export async function newAccount(page: Page) {
  await expect(page.locator("h1:has-text('Accounts')")).toBeVisible()
  await page.click("[aria-label='Create new wallet']")
  if (isLedgerEnabled) {
    await page.click("text=Create new ArgentX account")
  }
}
