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

  async getClipboard() {
    return String(await this.page.evaluate(`navigator.clipboard.readText()`))
  }

  async addAccount() {
    await this.account.addAccount({ firstAccount: false })
    await this.account.copyAddress.click()
    const accountAddress = await this.getClipboard()
    expect(accountAddress).toMatch(/^0x0/)
    return accountAddress
  }

  async deployAccount(accountName: string) {
    if (accountName) {
      await this.account.ensureSelectedAccount(accountName)
    }
    await this.navigation.showSettings.click()
    await this.page.locator(`text=${accountName}`).click()
    await this.settings.deployAccount.click()
    await this.navigation.confirm.click()
    await this.navigation.back.click()
    await this.navigation.close.click()
    await this.navigation.menuActivity.click()
    await expect(
      this.page.getByText(
        /(Account created and transfer|Contract interaction)/,
      ),
    ).toBeVisible({ timeout: 120000 })
    await this.navigation.showSettings.click()
    await expect(this.page.getByText("Deploying")).toBeHidden({
      timeout: 90000,
    })
    await this.navigation.close.click()
    await this.navigation.menuTokens.click()
  }

  async activate2fa(accountName: string, email: string, pin = "111111") {
    await this.account.ensureSelectedAccount(accountName)
    await this.navigation.showSettings.click()
    await this.settings.account(accountName).click()
    await this.settings.argentShield().click()
    await this.navigation.next.click()
    await this.account.email.fill(email)
    await this.navigation.next.first().click()
    await this.account.fillPin(pin)
    await this.navigation.addArgentShield.click()
    await this.navigation.confirm.click()
    await this.navigation.dismiss.click()
    await this.navigation.back.click()
    await this.navigation.close.click()
    await Promise.all([
      expect(this.activity.menuPendingTransactionsIndicator).toBeHidden(),
      expect(
        this.page.locator('[data-testid="shield-on-account-view"]'),
      ).toBeVisible(),
    ])
    await this.navigation.showSettings.click()
    await expect(
      this.page.locator('[data-testid="shield-on-settings"]'),
    ).toBeVisible()
    await this.settings.account(accountName).click()
    await expect(
      this.page.locator('[data-testid="shield-switch"]'),
    ).toBeEnabled()
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
    const seed = await this.account.setupRecovery()
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
          await this.deployAccount(`Account ${accIndex + 1}`)
        }
      }
    }
    console.log(accountAddresses.length, accountAddresses, seed)
    return { accountAddresses, seed }
  }

  async validateTx(
    txHash: string,
    reciever: string,
    amount?: number,
    uniqLocator?: boolean,
  ) {
    await this.navigation.menuActivityActive
      .isVisible()
      .then(async (visible) => {
        if (!visible) {
          await this.navigation.menuActivity.click()
        }
      })
    if (amount) {
      const activityAmountLocator = this.page.locator(
        `button[data-tx-hash$="${txHash.substring(3)}"] [data-value]`,
      )
      let activityAmountElement = activityAmountLocator
      if (uniqLocator) {
        activityAmountElement = activityAmountLocator.first()
      }
      const activityAmount = await activityAmountElement
        .textContent()
        .then((text) => text?.match(/[\d|.]+/)![0])
      if (amount.toString().length > 6) {
        expect(activityAmount).toBe(
          parseFloat(amount.toString())
            .toFixed(4)
            .toString()
            .match(/[\d\\.]+[^0]+/)?.[0],
        )
      } else {
        expect(activityAmount).toBe(parseFloat(amount.toString()).toString())
      }
    }
    await this.activity.ensureNoPendingTransactions()
    await validateTx(txHash, reciever, amount)
  }

  async fundMultisigAccount({
    accountName,
    amount,
  }: {
    accountName: string
    amount: number
  }) {
    await this.account.ensureSelectedAccount(accountName)
    await this.account.copyAddress.click()
    const accountAddress = await this.getClipboard().then((adr) => String(adr))
    await transferEth(
      `${amount * Math.pow(10, 18)}`, // amount Ethereum has 18 decimals
      accountAddress, // reciever wallet address
    )
    await this.account.ensureAsset(accountName, "Ethereum", `${amount} ETH`)
  }

  async activateMultisig(accountName: string) {
    await this.account.ensureSelectedAccount(accountName)
    await expect(
      this.page.locator("label:has-text('Not activated')"),
    ).toBeVisible()
    await this.page.locator('[data-testid="activate-multisig"]').click()
    await this.navigation.confirm.click()
    await expect(
      this.page.locator('[data-testid="activating-multisig"]'),
    ).toBeVisible()
    await Promise.all([
      expect(this.page.locator("label:has-text('Not activated')")).toBeHidden({
        timeout: 60000,
      }),
      expect(
        this.page.locator('[data-testid="activating-multisig"]'),
      ).toBeHidden({ timeout: 60000 }),
    ])
  }
}
