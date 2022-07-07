import type { Page } from "@playwright/test"

export async function waitForAllPendingTransactionsInAccount(page: Page) {
  await page.waitForSelector("h3:has-text('Pending transactions')", {
    state: "detached",
    timeout: 5 * 60e3, // 5 minutes
  })
}
