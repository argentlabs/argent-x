import type { Page } from "@playwright/test"

export const HAS_PENDING_TRANSACTIONS_SELECTOR =
  "[aria-label='Pending transactions']"

export async function waitForAllPendingTransactionsInAccount(page: Page) {
  await page.waitForSelector(HAS_PENDING_TRANSACTIONS_SELECTOR, {
    state: "detached",
    timeout: 5 * 60e3, // 5 minutes
  })
}
