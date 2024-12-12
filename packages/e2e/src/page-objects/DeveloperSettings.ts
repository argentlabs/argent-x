import type { Page } from "@playwright/test"

import { lang } from "../languages"

export default class DeveloperSettings {
  constructor(private page: Page) {}

  get manageNetworks() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.advancedSettings.manageNetworks.manageNetworks}"]`,
    )
  }

  get blockExplorer() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.preferences.defaultBlockExplorer}"]`,
    )
  }

  get smartCOntractDevelopment() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.advancedSettings.smartContractDevelopment}"]`,
    )
  }

  get experimental() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.advancedSettings.experimental}"]`,
    )
  }

  // Manage networks
  get addNetwork() {
    return this.page.locator('button[aria-label="add"]')
  }

  get networkName() {
    return this.page.locator('[name="name"]')
  }

  get chainId() {
    return this.page.locator('[name="chainId"]')
  }

  get sequencerUrl() {
    return this.page.locator('[name="sequencerUrl"]')
  }

  get rpcUrl() {
    return this.page.locator('[name="rpcUrl"]')
  }

  get create() {
    return this.page.locator('button[type="submit"]')
  }

  get restoreDefaultNetworks() {
    return this.page.locator(
      `button:has-text("${lang.settings.advancedSettings.manageNetworks.restoreDefaultNetworks}")`,
    )
  }

  networkByName(name: string) {
    return this.page.locator(`h5:has-text("${name}")`)
  }

  deleteNetworkByName(name: string) {
    return this.page.locator(
      `//div/*[contains(text(),'${name}')]/following::button[1]`,
    )
  }
}
