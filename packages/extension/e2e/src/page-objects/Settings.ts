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
    return this.page.locator(`button:has-text("${lang.settings.hide}")`)
  }
  get hiddenAccounts() {
    return this.page.locator(
      `button:has-text("${lang.settings.hiddenAccounts}")`,
    )
  }

  unhideAccount(accountName: string) {
    return this.page.locator(`button:has-text("${accountName}")`)
  }

  get deleteAccount() {
    return this.page.locator(
      `button:has-text("${lang.settings.deleteAccount}")`,
    )
  }

  get confirmDelete() {
    return this.page.locator(`button:has-text("${lang.settings.delete}")`)
  }

  get privateKey() {
    return this.page.locator('[data-testid="privateKey"]')
  }

  get copy() {
    return this.page.locator(`button:has-text("${lang.settings.copy}")`)
  }
}
