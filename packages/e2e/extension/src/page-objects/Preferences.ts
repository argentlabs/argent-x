import { Page } from "@playwright/test"

import { lang } from "../languages"
import Navigation from "./Navigation"

export default class Preferences extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  get hideTokens() {
    return this.page.locator(
      `//p[contains(text(),'${lang.settings.preferences.hideTokens}')]`,
    )
  }

  get hideTokensStatus() {
    return this.page.locator(
      `//p[contains(text(),'${lang.settings.preferences.hideTokens}')]/following::input`,
    )
  }

  get defaultBlockExplorer() {
    return this.page.locator(
      `//p[contains(text(),'${lang.settings.preferences.defaultBlockExplorer}')]`,
    )
  }

  get defaultNFTMarket() {
    return this.page.locator(
      `//p[contains(text(),'${lang.settings.preferences.defaultNFTMarket}')]`,
    )
  }

  get emailNotifications() {
    return this.page.locator(
      `//p[contains(text(),'${lang.settings.preferences.emailNotifications}')]`,
    )
  }
}
