import type { Page } from "@playwright/test"

import Network from "./Network"
import Wallet from "./Wallet"

export default class ExtensionPage {
  page: Page
  wallet: Wallet
  network: Network
  constructor(page: Page, private extensionUrl: string) {
    this.page = page
    this.wallet = new Wallet(page)
    this.network = new Network(page)
  }
  async open() {
    await this.page.goto(this.extensionUrl)
  }
}
