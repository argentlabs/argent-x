import { ChromiumBrowserContext, Page, expect } from "@playwright/test"

import { lang } from "../languages"
import Navigation from "./Navigation"

export default class Dapps extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  connected(url: string) {
    return this.page.locator(
      `//button/*[contains(text(),'${url.slice(0, 30)}')]`,
    )
  }

  disconnect(url: string) {
    return this.page.locator(
      `//button/*[contains(text(),'${url.slice(0, 30)}')]/following::button[1]`,
    )
  }

  resetAll() {
    return this.page.locator(`button:text-is("${lang.dapps.resetAll}")`)
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
