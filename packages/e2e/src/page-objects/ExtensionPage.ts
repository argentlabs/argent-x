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
  }
  async open() {
    await this.page.goto(this.extensionUrl)
  }
}
