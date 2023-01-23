import type { Page } from "@playwright/test"

import Account from "./Account"
import Network from "./Network"
import Wallet from "./Wallet"

export default class ExtensionPage {
  page: Page
  wallet: Wallet
  network: Network
  account: Account
  constructor(page: Page, private extensionUrl: string) {
    this.page = page
    this.wallet = new Wallet(page)
    this.network = new Network(page)
    this.account = new Account(page)
    this.extensionUrl = extensionUrl
  }

  get settings() {
    return this.page.locator('[aria-label="Show settings"]')
  }

  get lockWallet() {
    return this.page.locator('a:text-is("Lock wallet")')
  }

  get reset() {
    return this.page.locator('a:text-is("Reset")')
  }

  get confirmReset() {
    return this.page.locator('button:text-is("RESET")')
  }

  async open() {
    await this.page.goto(this.extensionUrl)
  }

  async resetExtension() {
    await this.settings.click()
    await this.lockWallet.click()
    await this.reset.click()
    await this.confirmReset.click()
  }
}
