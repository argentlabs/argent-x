import type { Page } from "@playwright/test"

export async function navigateBack(page: Page) {
  await page.click("[aria-label='Back']")
}
