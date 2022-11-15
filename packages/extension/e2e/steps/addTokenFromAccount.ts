import type { Page } from "@playwright/test"

export async function addTokenFromAccount(page: Page, address: string) {
  await page.click("New token")
  const addressInput = await page.waitForSelector(
    "input[placeholder='Contract address']",
  )
  await addressInput.fill(address)
  await page.click("button:has-text('Continue'):not([disabled])")
}
