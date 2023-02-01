import { Page, expect } from "@playwright/test"

export default class Activity {
  constructor(private page: Page) {}

  ensurePendingTransactions(nbr: number) {
    return expect(
      this.page.locator(`h6:has-text("Pending transactions${nbr}")`),
    ).toBeVisible()
  }
}
