import { ChromiumBrowserContext, Page, expect } from "@playwright/test"

import { lang } from "../languages"
import Navigation from "./Navigation"

export default class Dapps extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  account(accountName: string) {
    return this.page.locator(`[data-testid="${accountName}"]`)
  }

  connectedDapps(accountName: string, nbrConnectedDapps: number) {
    return nbrConnectedDapps > 1
      ? this.page.locator(
          `[data-testid="${accountName}"]:has-text("${nbrConnectedDapps} dapps connected")`,
        )
      : this.page.locator(
          `[data-testid="${accountName}"]:has-text("${nbrConnectedDapps} dapp connected")`,
        )
  }

  get noConnectedDapps() {
    return this.page.locator(`text=${lang.dapps.noConnectedDapps}`)
  }

  connected(url: string) {
    return this.page.locator(`//div/*[contains(text(),'${url.slice(8, 30)}')]`)
  }

  disconnect(url: string) {
    return this.page.locator(
      `//div/*[contains(text(),'${url.slice(8, 30)}')]/following::button[1]`,
    )
  }

  disconnectAll() {
    return this.page.locator(`p:text-is("${lang.dapps.disconnectAll}")`)
  }

  get accept() {
    return this.page.locator(`button:text-is("${lang.dapps.connect}")`)
  }

  get reject() {
    return this.page.locator(`button:text-is("${lang.dapps.reject}")`)
  }

  async requestConnectionFromDapp(
    browserContext: ChromiumBrowserContext,
    url: string,
  ) {
    //open dapp page
    const dapp = await browserContext.newPage()
    await dapp.setViewportSize({ width: 1080, height: 720 })
    await dapp.goto("chrome://inspect/#extensions")
    await dapp.waitForTimeout(5000)
    await dapp.goto(url)
    const warningLoc = dapp.locator("text=enter anyway")
    if (await warningLoc.isVisible()) {
      await warningLoc.click()
    }
    await dapp
      .locator('div :text-matches("Connect Wallet", "i")')
      .first()
      .click()
    await expect(dapp.locator("text=Argent X")).toBeVisible()
    await dapp.locator("text=Argent X").click()
  }
}
