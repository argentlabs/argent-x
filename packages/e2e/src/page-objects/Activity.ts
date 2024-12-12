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
        `//p[contains(text(),'Pending')]/following-sibling::div[contains(text(),'${nbr}')]`,
      ),
    ).toBeVisible()
  }

  ensureNoPendingTransactions() {
    return expect(
      this.page.locator(
        `h6 div:text-is("${lang.account.pendingTransactions}") >> div`,
      ),
    ).not.toBeVisible()
  }

  activityByDestination(destination: string) {
    return this.page.locator(
      `//button//p[contains(text()[1], 'To: ') and contains(text()[2], '${destination}')]`,
    )
  }

  checkActivity(nbr: number) {
    return Promise.all([
      this.menuPendingTransactionsIndicatorLocator.click(),
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
    await this.menuActivityActiveLocator.isVisible().then(async (visible) => {
      if (!visible) {
        await this.menuActivityLocator.click()
      }
    })
    expect(this.historyButton)
      .toBeVisible({ timeout: 1000 })
      .then(async () => {
        await this.historyButton.click()
      })
      .catch(async () => {
        null
      })

    const txHashs = await this.activityTxHashs()
    return txHashs[0]
  }

  get historyButton() {
    return this.page.locator("button:text-is('History')")
  }

  get queueButton() {
    return this.page.locator("button:text-is('Queue')")
  }
}
