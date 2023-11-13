import { expect, type Page } from "@playwright/test"

import Messages from "../utils/Messages"
import Account from "./Account"
import Activity from "./Activity"
import AddressBook from "./AddressBook"
import Dapps from "./Dapps"
import DeveloperSettings from "./DeveloperSettings"
import Navigation from "./Navigation"
import Network from "./Network"
import Settings from "./Settings"
import Wallet from "./Wallet"
import config from "../config"
import { transferEth, AccountsToSetup, validateTx } from "../utils/account"

export default class ExtensionPage {
  page: Page
  wallet: Wallet
  network: Network
  account: Account
  messages: Messages
  activity: Activity
  settings: Settings
  navigation: Navigation
  developerSettings: DeveloperSettings
  addressBook: AddressBook
  dapps: Dapps
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
    this.developerSettings = new DeveloperSettings(page)
    this.addressBook = new AddressBook(page)
    this.dapps = new Dapps(page)
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

  async pasteSeed() {
    await this.page.locator('[data-testid="seed-input-0"]').focus()
    await this.paste()
  }

  async setClipBoardContent(text: string) {
    await this.page.evaluate(`navigator.clipboard.writeText('${text}')`)
  }

  async recoverWallet(seed: string, password?: string) {
    await this.wallet.restoreExistingWallet.click()
    await this.setClipBoardContent(seed)
    await this.pasteSeed()
    await this.navigation.continue.click()

    await this.wallet.password.fill(password ?? config.password)
    await this.wallet.repeatPassword.fill(password ?? config.password)

    await this.navigation.continue.click()
    await expect(this.wallet.finish.first()).toBeVisible({
      timeout: 180000,
    })

    await this.open()
    await expect(this.network.networkSelector).toBeVisible()
  }

  getClipboard() {
    return this.page.evaluate(`navigator.clipboard.readText()`)
  }

  async deployAccountByName(accountName: string) {
    await this.navigation.showSettings.click()
    await this.page.locator(`text=${accountName}`).click()
    await this.account.deployAccount.click()
    await this.navigation.confirm.click()
    await this.navigation.back.click()
    await this.navigation.close.click()
  }

  async setupWallet({
    accountsToSetup,
  }: {
    accountsToSetup: AccountsToSetup[]
  }) {
    await this.wallet.newWalletOnboarding()
    await this.open()
    await this.account.accountAddressFromAssetsView.click()
    const seed = await this.account
      .saveRecoveryPhrase()
      .then((adr) => String(adr))
    const accountAddresses: string[] = []

    for (const [accIndex, acc] of accountsToSetup.entries()) {
      console.log(accIndex, acc)
      if (accIndex !== 0) {
        await this.account.addAccount({ firstAccount: false })
      }
      await this.account.copyAddress.click()
      const accountAddress = await this.getClipboard().then((adr) =>
        String(adr),
      )
      expect(accountAddress).toMatch(/^0x0/)
      accountAddresses.push(accountAddress)

      if (acc.initialBalance > 0) {
        await transferEth(
          `${acc.initialBalance * Math.pow(10, 18)}`, // amount Ethereum has 18 decimals
          accountAddress, // reciever wallet address
        )
        await this.account.ensureAsset(
          `Account ${accIndex + 1}`,
          "Ethereum",
          `${acc.initialBalance} ETH`,
        )
        if (acc.deploy) {
          await this.deployAccountByName(`Account ${accIndex + 1}`)
        }
      }
    }
    console.log(accountAddresses.length, accountAddresses, seed)
    return { accountAddresses, seed }
  }

  async validateTx(reciever: string, amount?: number) {
    console.log(reciever, amount)
    await this.navigation.menuActivity.click()
    await this.activity.ensureNoPendingTransactions()
    const txs = await this.activity.activityTxHashs()
    await validateTx(txs[0]!, reciever, amount)
  }
}
