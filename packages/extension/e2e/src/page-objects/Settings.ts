import type { Page } from "@playwright/test"

import config from "./../config"

const text = {
  en: {
    addresBook: "Address book",
    connectedDapps: "Connected dapps",
    showRecoveryPhase: "Show recovery phase",
    developerSettings: "Developer settings",
    privacy: "Privacy",
    back: "Back",
    hideAccount: "Hide account",
    deleteAccount: "Delete account", //only available for local network
    close: "Close",
    exportPrivateKey: "Export private key",
    extendedView: "Extended view",
    hide: "Hide",
    hiddenAccounts: "Hidden accounts",
    delete: "Delete",
    done: "Done",
  },
}
export default class Settings {
  constructor(private page: Page, private lang = config.appLanguage) {}

  get back() {
    return this.page.locator(`[aria-label="${text[this.lang].back}"]`)
  }
  get close() {
    return this.page.locator(`[aria-label="${text[this.lang].close}"]`)
  }

  get extendedView() {
    return this.page.locator(`[aria-label="${text[this.lang].extendedView}"]`)
  }

  // account settings
  get accountName() {
    return this.page.locator('input[placeholder="Account name"]')
  }

  get exportPrivateKey() {
    return this.page.locator(
      `button:has-text("${text[this.lang].exportPrivateKey}")`,
    )
  }

  get hideAccount() {
    return this.page.locator(
      `button:has-text("${text[this.lang].hideAccount}")`,
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
    return this.page.locator(`button:has-text("${text[this.lang].hide}")`)
  }
  get hiddenAccounts() {
    return this.page.locator(
      `button:has-text("${text[this.lang].hiddenAccounts}")`,
    )
  }

  unhideAccount(accountName: string) {
    return this.page.locator(`button:has-text("${accountName}")`)
  }

  get deleteAccount() {
    return this.page.locator(
      `button:has-text("${text[this.lang].deleteAccount}")`,
    )
  }

  get confirmDelete() {
    return this.page.locator(`button:has-text("${text[this.lang].delete}")`)
  }

  get done() {
    return this.page.locator(`button:has-text("${text[this.lang].done}")`)
  }

  get privateKey() {
    return this.page.locator('[data-testid="privateKey"]')
  }
}
