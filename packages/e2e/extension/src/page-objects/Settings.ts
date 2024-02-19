import type { Page } from "@playwright/test"

import { lang } from "../languages"

export default class Settings {
  constructor(private page: Page) {}

  get extendedView() {
    return this.page.locator(`[aria-label="${lang.settings.extendedView}"]`)
  }

  get addressBook() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.addressBook.addressBook}"]`,
    )
  }

  get connectedDapps() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.account.connectedDapps.connectedDapps}"]`,
    )
  }

  get developerSettings() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.developerSettings.developerSettings}"]`,
    )
  }

  get preferences() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.preferences.preferences}"]`,
    )
  }

  // account settings
  get accountName() {
    return this.page.locator('input[placeholder="Account name"]')
  }

  get exportPrivateKey() {
    return this.page.locator(
      `//button//*[text()="${lang.settings.account.exportPrivateKey}"]`,
    )
  }

  get deployAccount() {
    return this.page.locator(
      `//button//*[text()="${lang.settings.account.deployAccount}"]`,
    )
  }

  get hideAccount() {
    return this.page.locator(
      `//button//*[text()="${lang.settings.account.hideAccount}"]`,
    )
  }

  account(accountName: string) {
    return this.page.locator(`[aria-label="Select ${accountName}"]`)
  }

  async setAccountName(newAccountName: string) {
    await this.accountName.click()
    await this.accountName.fill(newAccountName)
    await this.page.locator("form button").click()
  }

  get confirmHide() {
    return this.page.locator(`button:text-is("${lang.common.hide}")`)
  }
  get hiddenAccounts() {
    return this.page.locator(`button:text-is("${lang.common.hiddenAccounts}")`)
  }

  unhideAccount(accountName: string) {
    return this.page.locator(`button :text-is("${accountName}")`)
  }

  argentShield() {
    return this.page.locator('[data-testid="shield-switch"]')
  }

  get privateKey() {
    return this.page.locator('[aria-label="Private key"]')
  }

  get copy() {
    return this.page.locator(`button:text-is("${lang.common.copy}")`)
  }

  get help() {
    return this.page.getByRole("link", { name: "Help" })
  }

  get discord() {
    return this.page.getByRole("link", { name: "Discord" })
  }

  get github() {
    return this.page.getByRole("link", { name: "Github" })
  }

  get viewOnStarkScanLocator() {
    return this.page.getByRole("button", {
      name: lang.settings.account.viewOnStarkScan,
    })
  }
}
