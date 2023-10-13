import type { Page } from "@playwright/test"

import { lang } from "../languages"

export default class DeveloperSettings {
  constructor(private page: Page) {}

  get manageNetworks() {
    return this.page.locator(
      `//a//*[text()="${lang.developerSettings.manageNetworks}"]`,
    )
  }

  get blockExplorer() {
    return this.page.locator(
      `//a//*[text()="${lang.developerSettings.blockExplorer}"]`,
    )
  }

  get smartCOntractDevelopment() {
    return this.page.locator(
      `//a//*[text()="${lang.developerSettings.smartContractDevelopment}"]`,
    )
  }

  get experimental() {
    return this.page.locator(
      `//a//*[text()="${lang.developerSettings.experimental}"]`,
    )
  }

  // Manage networks
  get addNetwork() {
    return this.page.locator('[data-testid="AddIcon"]')
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

  get create() {
    return this.page.locator('button[type="submit"]')
  }

  get restoreDefaultNetworks() {
    return this.page.locator(
      `button:has-text("${lang.developerSettings.restoreDefaultNetworks}")`,
    )
  }

  networkByName(name: string) {
    return this.page.locator(`button:has-text("${name}")`)
  }

  deleteNetworkByName(name: string) {
    return this.page.locator(
      `//button/*[contains(text(),'${name}')]/following::button[1]`,
    )
  }
}
