import type { Page } from "@playwright/test"

export default class Navigation {
  page: Page
  constructor(page: Page) {
    this.page = page
  }

  get backupPassword() {
    return this.page.locator(`button:text-is("I've backed up my password")`)
  }

  get continue() {
    return this.page.locator(`button:text-is("Continue")`)
  }

  get assets() {
    return this.page.getByRole("link", { name: "Assets" })
  }

  get addFunds() {
    return this.page.getByRole("link", { name: "Add funds" })
  }

  get send() {
    return this.page.getByRole("link", { name: "Send" })
  }

  get authorizedDapps() {
    return this.page.getByRole("link", { name: "Authorized dapps" })
  }

  get changePassword() {
    return this.page.getByRole("link", { name: "Change password" })
  }

  get lock() {
    return this.page.getByRole("heading", { name: "Lock" })
  }

  get switchTheme() {
    return this.page.getByRole("button", { name: "Switch theme" })
  }
}
