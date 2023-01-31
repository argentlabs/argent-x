import type { Page } from "@playwright/test"

type language = "en"
const text = {
  en: {
    extendedView: "Extended View",
    addressBook: "Address Book",
    connectedDapps: "Connected dapps",
    showRecoveryPhrase: "Show recovery phrase",
    developerSettings: "Developer settings",
    privacy: "Privacy",
  },
}
export default class Settings {
  constructor(private page: Page, private lang: language = "en") {}

  get showRecoveryPhrase() {
    return this.page.locator(
      `div a:has-text("${text[this.lang].showRecoveryPhrase}")`,
    )
  }

  get copyRecoveryPhrase() {
    return this.page.locator('button:text-is("Copy")')
  }

  get back() {
    return this.page.locator('button[aria-label="Back"]')
  }

  get close() {
    return this.page.locator('button[aria-label="Close"]')
  }
}
