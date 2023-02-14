import type { Page } from "@playwright/test"

import Messages from "../utils/Messages"
import Account from "./Account"
import Activity from "./Activity"
import Navigation from "./Navigation"
import Network from "./Network"
import Settings from "./Settings"
import Wallet from "./Wallet"

export default class ExtensionPage {
  page: Page
  wallet: Wallet
  network: Network
  account: Account
  messages: Messages
  activity: Activity
  settings: Settings
  navigation: Navigation
  constructor(page: Page, private extensionUrl: string) {
    this.page = page
    this.wallet = new Wallet(page)
    this.network = new Network(page)
    this.account = new Account(page)
    this.extensionUrl = extensionUrl
    this.messages = new Messages(page)
    this.activity = new Activity(page)
    this.settings = new Settings(page)
    this.navigation = new Navigation(page)
  }
  get settingsButton() {
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

  get activityTab() {
    return this.page.locator('[aria-label="Activity"]')
  }

  get pendingTransationsIndicator() {
    return this.page.locator('[aria-label="Pending transactions"]')
  }

  get tokens() {
    return this.page.locator('[aria-label="Tokens"]')
  }

  async resetExtension() {
    await this.settingsButton.click()
    await this.lockWallet.click()
    await this.reset.click()
    await this.confirmReset.click()
  }

  async paste() {
    const key = process.env.CI ? "Control" : "Meta"
    await this.page.keyboard.press(`${key}+KeyV`)
  }
}
