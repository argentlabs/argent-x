import type { Page } from "@playwright/test"

import Messages from "../utils/Messages"
import Account from "./Account"
import Activity from "./Activity"
import AddressBook from "./AddressBook"
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
  addressBook: AddressBook
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
    this.addressBook = new AddressBook(page)
  }

  async open() {
    await this.page.goto(this.extensionUrl)
  }

  async resetExtension() {
    await this.navigation.showSettings.click()
    await this.navigation.lockWallet.click()
    await this.navigation.reset.click()
    await this.navigation.confirmReset.click()
  }

  async paste() {
    const key = process.env.CI ? "Control" : "Meta"
    await this.page.keyboard.press(`${key}+KeyV`)
  }

  async setClipBoardContent(text: string) {
    await this.page.evaluate(`navigator.clipboard.writeText('${text}')`)
  }
}
