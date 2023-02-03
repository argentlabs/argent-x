import type { Page } from "@playwright/test"
type language = "en"
const text = {
  en: {
    addresBook: "Address book",
    connectedDapps: "Connected dapps",
    showRecoveryPhase: "Show recovery phase",
    developerSettings: "Developer settings",
    privacy: "Privacy",
    back: "Back",
    hideAccount: "Hide account",
    close: "Close",
    exportPrivateKey: "Export private key",
    extendedView: "Extended view",
  },
}
export default class Settings {
  constructor(private page: Page, private lang: language = "en") {}

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
      `[aria-label="${text[this.lang].exportPrivateKey}"]`,
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
}
