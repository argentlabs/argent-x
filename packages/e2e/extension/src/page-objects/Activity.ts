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
}
