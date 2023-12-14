import type { Page } from "@playwright/test"

import { lang } from "../languages"

export default class Settings {
  constructor(private page: Page) {}

  get extendedView() {
    return this.page.locator(`[aria-label="${lang.settings.extendedView}"]`)
  }

  get addressBook() {
    return this.page.locator(`//a//*[text()="${lang.settings.addresBook}"]`)
  }

  get connectedDapps() {
    return this.page.locator(`//a//*[text()="${lang.settings.connectedDapps}"]`)
  }

  get showRecoveryPhase() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.showRecoveryPhase}"]`,
    )
  }

  get developerSettings() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.developerSettings}"]`,
    )
  }

  // account settings
  get accountName() {
    return this.page.locator('input[placeholder="Account name"]')
  }

  get exportPrivateKey() {
    return this.page.locator(
      `//button//*[text()="${lang.settings.exportPrivateKey}"]`,
    )
  }

  get deployAccount() {
    return this.page.locator(
      `//button//*[text()="${lang.settings.deployAccount}"]`,
    )
  }

  get hideAccount() {
    return this.page.locator(
      `//button//*[text()="${lang.settings.hideAccount}"]`,
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
    return this.page.locator(`button:text-is("${lang.settings.hide}")`)
  }
  get hiddenAccounts() {
    return this.page.locator(
      `button:text-is("${lang.settings.hiddenAccounts}")`,
    )
  }

  unhideAccount(accountName: string) {
    return this.page.locator(`button :text-is("${accountName}")`)
  }

  argentShield() {
    return this.page.locator('[data-testid="shield-switch"]')
  }

  get privateKey() {
    return this.page.locator('[data-testid="privateKey"]')
  }

  get copy() {
    return this.page.locator(`button:text-is("${lang.settings.copy}")`)
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

  get privacyStatement() {
    return this.page.getByRole("link", { name: "Privacy statement" })
  }

  get privacyStatementText() {
    return this.page.locator('[aria-label="privacyStatementText"]')
  }
}
