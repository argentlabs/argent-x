import { Page, expect } from "@playwright/test"

import { lang } from "../languages"

export default class Activity {
  constructor(private page: Page) {}

  ensurePendingTransactions(nbr: number) {
    return expect(
      this.page.locator(
        `h6 div:text-is("${lang.account.pendingTransactions}") >> div:text-is("${nbr}")`,
      ),
    ).toBeVisible()
  }
}
