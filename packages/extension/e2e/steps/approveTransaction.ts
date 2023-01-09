import type { Page } from "@playwright/test"

export async function approveTransaction(page: Page) {
  await page.click("button:has-text('Confirm'):not([disabled])")
}
