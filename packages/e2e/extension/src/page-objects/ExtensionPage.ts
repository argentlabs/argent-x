import { expect, type Page } from "@playwright/test"

import Messages from "./Messages"
import Account from "./Account"
import Activity from "./Activity"
import AddressBook from "./AddressBook"
import Dapps from "./Dapps"
import DeveloperSettings from "./DeveloperSettings"
import Navigation from "./Navigation"
import Network from "./Network"
import Settings from "./Settings"
import Wallet from "./Wallet"
import config from "../../../shared/config"
import Nfts from "./Nfts"
import Preferences from "./Preferences"
import {
  transferTokens,
  AccountsToSetup,
  validateTx,
  isScientific,
  convertScientificToDecimal,
  FeeTokens,
} from "../../../shared/src/assets"

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
  nfts: Nfts
  preferences: Preferences
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
    this.nfts = new Nfts(page)
    this.preferences = new Preferences(page)
  }

  async open() {
    await this.page.goto(this.extensionUrl)
  }

  async resetExtension() {
    await this.navigation.showSettingsLocator.click()
    await this.navigation.lockWalletLocator.click()
    await this.navigation.resetLocator.click()
    await this.navigation.confirmResetLocator.click()
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
    await this.wallet.agreeLoc.click()
    await this.setClipBoardContent(seed)
    await this.pasteSeed()
    await this.navigation.continueLocator.click()

    await this.wallet.password.fill(password ?? config.password)
    await this.wallet.repeatPassword.fill(password ?? config.password)

    await this.navigation.continueLocator.click()
    await expect(this.wallet.finish.first()).toBeVisible()

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

  async deployAccount(accountName: string, feeToken?: FeeTokens) {
    if (accountName) {
      await this.account.ensureSelectedAccount(accountName)
    }
    await this.navigation.showSettingsLocator.click()
    await this.page.locator(`[data-testid="${accountName}"]`).click()
    await this.settings.deployAccount.click()
    if (feeToken) {
      await this.account.selectFeeToken(feeToken)
    }
    await this.account.confirmTransaction()
    await this.navigation.backLocator.click()
    await this.navigation.closeLocator.click()
    await this.navigation.menuActivityLocator.click()
    await expect(
      this.page.getByText(
        /(Account created and transfer|Contract interaction)/,
      ),
    ).toBeVisible()
    await this.navigation.showSettingsLocator.click()
    await expect(this.page.getByText("Deploying")).toBeHidden()
    await this.navigation.closeLocator.click()
    await this.navigation.menuTokensLocator.click()
  }

  async activate2fa({
    accountName,
    email,
    pin = "111111",
    validSession = false,
  }: {
    accountName: string
    email: string
    pin?: string
    validSession?: boolean
  }) {
    await this.account.ensureSelectedAccount(accountName)
    await this.navigation.showSettingsLocator.click()
    await this.settings.account(accountName).click()
    await this.settings.argentShield().click()
    await this.navigation.nextLocator.click()
    if (!validSession) {
      await this.account.email.fill(email)
      await this.navigation.nextLocator.first().click()
      await this.account.fillPin(pin)
    }
    await this.navigation.addArgentShieldLocator.click()
    await this.account.confirmTransaction()
    await expect(this.account.addedArgentShieldLocator).toBeVisible()
    await this.navigation.doneLocator.click()
    await this.navigation.backLocator.click()
    await this.navigation.closeLocator.click()
    await Promise.all([
      expect(
        this.activity.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden(),
      expect(
        this.page.locator('[data-testid="shield-on-account-view"]'),
      ).toBeVisible(),
    ])
    await this.navigation.showSettingsLocator.click()
    await expect(
      this.page.locator('[data-testid="shield-on-settings"]'),
    ).toBeVisible()
    await this.settings.account(accountName).click()
    await expect(
      this.page.locator('[data-testid="shield-switch"]'),
    ).toBeEnabled()
    await this.navigation.backLocator.click()
    await this.navigation.closeLocator.click()
  }

  async disable2fa({
    accountName,
    email,
    pin = "111111",
    validSession = false,
  }: {
    accountName: string
    email: string
    pin?: string
    validSession?: boolean
  }) {
    await this.account.ensureSelectedAccount(accountName)
    await this.navigation.showSettingsLocator.click()
    await this.settings.account(accountName).click()
    await this.settings.argentShield().click()
    await this.navigation.nextLocator.click()
    if (!validSession) {
      await this.account.email.fill(email)
      await this.navigation.nextLocator.first().click()
      await this.account.fillPin(pin)
    }
    await this.navigation.removeArgentShieldLocator.click()
    await this.account.confirmTransaction()
    await expect(this.account.removedArgentShieldLocator).toBeVisible()
    await this.navigation.doneLocator.click()
    await this.navigation.backLocator.click()
    await this.navigation.closeLocator.click()
    await this.account.ensure2FANotEnabled(accountName)
  }

  async fundAccount(
    acc: AccountsToSetup,
    accountAddress: string,
    accIndex: number,
  ) {
    let expectedTokenValue
    for (const [assetIndex, asset] of acc.assets.entries()) {
      console.log({ op: "fundAccount", assetIndex, asset })
      if (asset.balance > 0) {
        await transferTokens(
          asset.balance,
          accountAddress, // receiver wallet address
          asset.token,
        )
        expectedTokenValue = `${asset.balance} ${asset.token}`
        if (isScientific(asset.balance)) {
          expectedTokenValue = `${convertScientificToDecimal(asset.balance)} ${
            asset.token
          }`
        }
        await this.account.ensureAsset(
          `Account ${accIndex + 1}`,
          asset.token,
          expectedTokenValue,
        )
      }
    }

    if (acc.deploy) {
      await this.deployAccount(`Account ${accIndex + 1}`, acc.feeToken)
    }
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
      if (accIndex !== 0) {
        await this.account.addAccount({ firstAccount: false })
      }
      await this.account.copyAddress.click()
      const accountAddress = await this.getClipboard().then((adr) =>
        String(adr),
      )
      expect(accountAddress).toMatch(/^0x0/)
      accountAddresses.push(accountAddress)
      if (acc.assets[0].balance > 0) {
        await this.fundAccount(acc, accountAddress, accIndex)
      }
    }
    console.log({
      op: "setupWallet",
      accountsNbr: accountAddresses.length,
      accountAddresses,
      seed,
    })
    return { accountAddresses, seed }
  }

  async validateTx({
    txHash,
    receiver,
    sendAmountFE,
    sendAmountTX,
    uniqLocator,
  }: {
    txHash: string
    receiver: string
    sendAmountFE?: string
    sendAmountTX?: number
    uniqLocator?: boolean
  }) {
    console.log({
      op: "validateTx",
      txHash,
      receiver,
      sendAmountFE,
      sendAmountTX,
      uniqLocator,
    })
    await this.navigation.menuActivityActiveLocator
      .isVisible()
      .then(async (visible) => {
        if (!visible) {
          await this.navigation.menuActivityLocator.click()
        }
      })
    if (sendAmountFE) {
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
      if (sendAmountFE.toString().length > 6) {
        expect(activityAmount).toBe(
          parseFloat(sendAmountFE.toString())
            .toFixed(4)
            .toString()
            .match(/[\d\\.]+[^0]+/)?.[0],
        )
      } else {
        expect(activityAmount).toBe(
          parseFloat(sendAmountFE.toString()).toString(),
        )
      }
    }
    await this.activity.ensureNoPendingTransactions()
    await validateTx(txHash, receiver, sendAmountTX)
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
    await transferTokens(
      amount,
      accountAddress, // receiver wallet address
    )
    await this.account.ensureAsset(accountName, "ETH", `${amount} ETH`)
  }

  async activateMultisig(accountName: string) {
    await this.account.ensureSelectedAccount(accountName)
    await expect(
      this.page.locator("label:has-text('Not activated')"),
    ).toBeVisible()
    await this.page.locator('[data-testid="activate-multisig"]').click()
    await this.account.confirmTransaction()
    await expect(
      this.page.locator('[data-testid="activating-multisig"]'),
    ).toBeVisible()
    await Promise.all([
      expect(this.page.locator("label:has-text('Not activated')")).toBeHidden(),
      expect(
        this.page.locator('[data-testid="activating-multisig"]'),
      ).toBeHidden(),
    ])
  }

  async removeMultisigOwner(accountName: string) {
    await this.account.ensureSelectedAccount(accountName)
    await this.navigation.showSettingsLocator.click()
    await this.settings.account(accountName).click()
  }
}
