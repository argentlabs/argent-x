import { Page, expect } from "@playwright/test"

import { lang } from "../languages"
import Navigation from "./Navigation"

export default class Activity extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  ensurePendingTransactions(nbr: number) {
    return expect(
      this.page.locator(
        `h6 div:text-is("${lang.account.pendingTransactions}") >> div:text-is("${nbr}")`,
      ),
    ).toBeVisible()
  }

  ensureNoPendingTransactions() {
    return expect(
      this.page.locator(
        `h6 div:text-is("${lang.account.pendingTransactions}") >> div`,
      ),
    ).not.toBeVisible({ timeout: 60000 })
  }

  activityByDestination(destination: string) {
    return this.page.locator(
      `//button//p[contains(text()[1], 'To: ') and contains(text()[2], '${destination}')]`,
    )
  }

  checkActivity(nbr: number) {
    return Promise.all([
      this.menuPendingTransactionsIndicator.click(),
      this.ensurePendingTransactions(nbr),
    ])
  }

  async activityTxHashs() {
    await expect(
      this.page.locator("button[data-tx-hash]").first(),
    ).toBeVisible()
    const loc = await this.page.locator("button[data-tx-hash]").all()
    return Promise.all(loc.map((el) => el.getAttribute("data-tx-hash")))
  }

  async getLastTxHash() {
    await this.menuActivityActive.isVisible().then(async (visible) => {
      if (!visible) {
        await this.menuActivity.click()
      }
    })
    const txHashs = await this.activityTxHashs()
    return txHashs[0]
  }
}
