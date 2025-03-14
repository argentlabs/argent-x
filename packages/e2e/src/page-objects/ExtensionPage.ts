import { expect, type Page } from "@playwright/test"
import fs from "fs-extra"

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
import config from "../config"
import Nfts from "./Nfts"
import Preferences from "./Preferences"
import Swap from "./Swap"
import TokenDetails from "./TokenDetails"

import {
  AccountsToSetup,
  validateTx,
  isScientific,
  convertScientificToDecimal,
  FeeTokens,
  logInfo,
  getVersion,
  decreaseMajorVersion,
  requestFunds,
  TokenSymbol,
  sleep,
} from "../utils"

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
  swap: Swap
  tokenDetails: TokenDetails

  /**
   * The current branch version of the extension.
   * @type {string}
   */
  currentBranchVersion: string
  isUpgradeTest: boolean = false

  constructor(
    page: Page,
    private extensionUrl: string,
    isUpgradeTest: boolean = false,
  ) {
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
    this.swap = new Swap(page)
    this.currentBranchVersion = getVersion()
    this.tokenDetails = new TokenDetails(page)
    this.isUpgradeTest = isUpgradeTest
  }

  async open() {
    await this.page.setViewportSize(config.viewportSize)
    await this.page.goto(this.extensionUrl)
    await this.page.waitForLoadState("networkidle")
  }

  async resetExtension() {
    await this.navigation.showSettingsLocator.click()
    await this.navigation.lockWalletLocator.click()
    await this.navigation.resetLocator.click()
    await this.page.locator('[name="validationString"]').fill("RESET WALLET")
    await this.page.locator('label[type="checkbox"]').click({ force: true })
    await this.navigation.confirmResetLocator.click()
  }

  async fillSeed(seed: string) {
    const words = seed.split(" ")
    for (let i = 0; i < words.length; i++) {
      await this.page.locator(`[data-testid="seed-input-${i}"]`).fill(words[i])
    }
  }

  async recoverWallet(seed: string, password?: string) {
    await this.page.setViewportSize({ width: 1080, height: 720 })
    await this.wallet.restoreExistingWallet.click()
    await this.wallet.agreeLoc.click()
    await this.fillSeed(seed)
    await this.navigation.continueLocator.click()
    if (!this.navigation.isOldUI) {
      await expect(
        this.page.getByText("The password must contain at least 8 characters"),
      ).toBeVisible()
    }
    await expect(this.navigation.continueLocator).toBeVisible()
    await expect(this.navigation.continueLocator).toBeDisabled()

    await this.wallet.password.fill(password ?? config.password)
    await this.wallet.repeatPassword.fill(password ?? config.password)

    await this.navigation.continueLocator.click()
    await Promise.race([
      expect(this.wallet.finish).toBeVisible(),
      expect(this.page.getByText("Your account is ready!")).toBeVisible(),
      expect(this.page.getByText("Your smart account is ready!")).toBeVisible(),
    ])

    await this.open()
    await expect(this.network.networkSelector).toBeVisible()
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
    if (await this.page.getByRole("heading", { name: "Activity" }).isHidden()) {
      await this.navigation.menuActivityLocator.click()
    }
    await expect(
      this.page.getByText(/(Account created and transfer|Account activation)/),
    ).toBeVisible()

    await this.navigation.showSettingsLocator.click()
    await expect(this.page.getByText("Deploying")).toBeHidden()
    await this.navigation.closeLocator.click()
    await this.navigation.menuTokensLocator.click()
  }

  async activateSmartAccount({
    accountName,
    email,
    pin = "111111",
    validSession = false,
  }: {
    accountName: string
    email?: string
    pin?: string
    validSession?: boolean
  }) {
    await this.account.ensureSelectedAccount(accountName)
    await this.navigation.showSettingsLocator.click()
    await this.settings.account(accountName).click()
    await this.settings.smartAccountButton.click()
    await this.navigation.nextLocator.click()
    if (!validSession) {
      await this.account.email.fill(email!)
      await this.navigation.nextLocator.first().click()
      await this.account.fillPin(pin)
    }
    await this.navigation.upgradeLocator.click()
    await this.account.confirmTransaction()
    await expect(this.account.accountUpgraded).toBeVisible()
    await this.navigation.doneLocator.click()
    await this.navigation.backLocator.click()
    await this.navigation.closeLocator.click()
    await Promise.all([
      expect(
        this.activity.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden(),
      //todo this selector is not unique, we need to find a better one
      expect(
        this.page.locator('[data-testid="smart-account-on-settings"]').first(),
      ).toBeVisible(),
    ])
    await this.navigation.showSettingsLocator.click()
    await this.page.waitForLoadState("networkidle")
    await expect(
      this.page.locator('[data-testid="smart-account-on-settings"]').first(),
    ).toBeVisible()
    await this.settings.account(accountName).click()
    await expect(
      this.page.locator(
        '[data-testid="smart-account-button"]:has-text("Change to Standard Account")',
      ),
    ).toBeEnabled()
    await this.navigation.backLocator.click()
    await this.navigation.closeLocator.click()
  }

  async changeToStandardAccount({
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
    await this.settings.changeToStandardAccountButton.click()
    //await this.navigation.nextLocator.click()
    if (!validSession) {
      await this.account.email.fill(email)
      await this.navigation.nextLocator.first().click()
      await this.account.fillPin(pin)
    }

    await this.navigation.confirmChangeAccountTypeLocator.click()
    await this.account.confirmTransaction()
    await expect(this.account.changedToStandardAccountLabel).toBeVisible()
    await this.navigation.doneLocator.click()
    await this.navigation.backLocator.click()
    await this.navigation.closeLocator.click()
    await this.account.ensureSmartAccountNotEnabled(accountName)
  }

  async fundAccount({
    acc,
    accountAddress,
    accountName,
  }: {
    acc: AccountsToSetup
    accountAddress: string
    accountName: string
  }) {
    for (const [assetIndex, asset] of acc.assets.entries()) {
      logInfo({
        op: "fundAccount",
        assetIndex,
        asset,
        accountName,
        isProdTesting: config.isProdTesting,
      })
      if (Number(asset.balance) > 0) {
        await requestFunds(
          accountAddress, // receiver wallet address
          asset.balance,
          asset.token,
        )
      }
    }
  }

  async ensureBalanceUpdated({
    balance,
    token,
    accountName,
    accountAddress,
  }: {
    balance: number | string
    token: TokenSymbol
    accountName: string
    accountAddress: string
  }) {
    let expectedTokenValue
    if (isScientific(balance)) {
      expectedTokenValue = `${convertScientificToDecimal(balance)}`
    } else {
      expectedTokenValue = `${balance}`
    }
    if (!expectedTokenValue.includes(".")) {
      expectedTokenValue += ".0"
    }
    expectedTokenValue += ` ${token}`
    await this.account.ensureAsset({
      accountName,
      accountAddress,
      token: token,
      value: expectedTokenValue,
    })
  }

  async setupWallet({
    accountsToSetup,
    email,
    pin = "111111",
    success = true,
  }: {
    accountsToSetup: AccountsToSetup[]
    email?: string
    success?: boolean
    pin?: string
  }) {
    await this.wallet.newWalletOnboarding(email, pin, success)
    if (!success) {
      return { accountAddresses: [], seed: "" }
    }
    await this.open()
    const seed = await this.account.setupRecovery()
    console.log({ seed })
    const noAccount = await this.account.noAccountBanner.isVisible({
      timeout: 1000,
    })
    const accountAddresses: string[] = []
    const accountNames: string[] = []

    // First, set up all accounts and collect their info
    for (const [accIndex, _] of accountsToSetup.entries()) {
      let accountName, accountAddress
      if (accIndex > 0) {
        ;({ accountName, accountAddress } = await this.account.addAccount({
          firstAccount: noAccount ? true : false,
        }))
      } else {
        ;({ accountName, accountAddress } =
          await this.account.lastAccountInfo())
      }
      accountNames.push(accountName!)
      accountAddresses.push(accountAddress!)
    }

    // Handle case with no accounts to setup
    if (accountsToSetup.length === 0) {
      const { accountName, accountAddress } =
        await this.account.lastAccountInfo()
      accountNames.push(accountName!)
      accountAddresses.push(accountAddress!)
    }

    // Fund accounts in parallel
    await Promise.all(
      accountsToSetup.map((acc, index) => {
        if (acc.assets.some((asset) => Number(asset.balance) > 0)) {
          return this.fundAccount({
            acc,
            accountAddress: accountAddresses[index],
            accountName: accountNames[index],
          })
        }
        return Promise.resolve()
      }),
    )

    // Run balance updates sequentially
    for (const [index, acc] of accountsToSetup.entries()) {
      for (const asset of acc.assets) {
        await this.ensureBalanceUpdated({
          balance: asset.balance,
          token: asset.token,
          accountName: accountNames[index],
          accountAddress: accountAddresses[index],
        })
      }
    }

    //deploy accounts sequentially
    for (const [index, acc] of accountsToSetup.entries()) {
      if (acc.deploy) {
        await this.deployAccount(accountNames[index], acc.feeToken)
      }
    }

    await this.account.ensureSelectedAccount(accountNames[0])

    logInfo({
      op: "setupWallet",
      accountsNbr: accountAddresses.length,
      accountAddresses,
      seed,
    })
    return { accountAddresses, seed, accountNames }
  }

  async validateTx({
    txHash,
    receiver,
    sendAmountFE,
    sendAmountTX,
    uniqLocator,
    txType = "token",
  }: {
    txHash: string
    receiver: string
    sendAmountFE?: string
    sendAmountTX?: number
    uniqLocator?: boolean
    txType?: "token" | "nft"
  }) {
    logInfo({
      op: "validateTx",
      txHash,
      receiver,
      sendAmountFE,
      sendAmountTX,
      uniqLocator,
    })
    await this.navigation.menuActivityActiveLocator
      .isVisible()
      .then(async (visible: boolean) => {
        if (!visible) {
          await this.navigation.menuActivityLocator.click()
        }
      })
    if (sendAmountFE) {
      const activityAmountLocator = this.page.locator(
        `button[data-tx-hash$="${txHash.substring(10)}"] [data-value]`,
      )
      let activityAmountElement = activityAmountLocator
      if (uniqLocator) {
        activityAmountElement = activityAmountLocator.first()
      }
      expect(this.activity.historyButton)
        .toBeVisible({ timeout: 1000 })
        .then(async () => {
          await this.activity.historyButton.click()
        })
        .catch(async () => {
          return null
        })
      const activityAmount = await activityAmountElement
        .textContent()
        .then((text) => text?.match(/[\d|.]+/)![0])
      if (sendAmountFE.toString().length > 6) {
        expect(activityAmount).toBe(
          parseFloat(sendAmountFE.toString())
            .toFixed(5)
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
    await validateTx({ txHash, receiver, amount: sendAmountTX, txType })
  }

  async fundMultisigAccount({
    accountName,
    balance,
    token = "STRK",
  }: {
    accountName: string
    balance: number | string
    token?: TokenSymbol
  }) {
    await this.account.ensureSelectedAccount(accountName)
    await this.account.copyAddress.click()
    const accountAddress = this.isUpgradeTest
      ? await this.navigation.getSystemClipboard()
      : (await this.account.accountAddr) || undefined
    await requestFunds(
      accountAddress!, // receiver wallet address
      balance,
      token,
    )
    await this.account.ensureAsset({
      accountName,
      accountAddress,
      token,
      value: `${balance} ${token}`,
    })
  }

  async activateMultisig(accountName: string) {
    await this.account.ensureSelectedAccount(accountName)
    if (this.isUpgradeTest) {
      await expect(
        this.page.locator(
          'label:has-text("Add ETH or STRK and activate"), label:has-text("Add STRK and activate")',
        ),
      ).toBeVisible()
    } else {
      await expect(
        this.page.locator("label:has-text('Add STRK and activate')"),
      ).toBeVisible()
    }
    await this.page.locator('[data-testid="activate-multisig"]').click()
    await Promise.all([
      this.account.confirmTransaction(),
      expect(
        this.page.locator('[data-testid="activating-multisig"]'),
      ).toBeVisible(),
    ])
    await Promise.all([
      expect(
        this.page.locator("label:has-text('Add STRK and activate')"),
      ).toBeHidden(),
      expect(
        this.page.locator("label:has-text('Add ETH or STRK and activate')"),
      ).toBeHidden(),
      expect(
        this.page.locator('[data-testid="activating-multisig"]'),
      ).toBeHidden(),
    ])
    await sleep(3000)
  }

  async removeMultisigOwner(accountName: string) {
    await this.account.ensureSelectedAccount(accountName)
    await this.navigation.showSettingsLocator.click()
    await this.settings.account(accountName).click()
  }
  /**
   * Version of the current extension, fetch from the html tag data-version attribute
   */
  get version() {
    return this.page
      .locator("html")
      .getAttribute("data-version")
      .catch(() => "unknown")
  }

  async setExtensionVersion(version: string, currentVersionDir: string) {
    await fs.remove(config.migVersionDir)
    await fs.copy(currentVersionDir, config.migVersionDir)
    // Reload Extension
    await this.page.goto("chrome://extensions")
    // Find and click the reload button for our extension
    const reloadButton = this.page
      .locator("extensions-item")
      .filter({ hasText: "Argent X" })
      .locator('cr-icon-button[title="Reload"]')
    await reloadButton.click()
    await this.page.waitForTimeout(1000)

    //open extension
    await this.open()
    await expect(this.version).resolves.toBe(decreaseMajorVersion(version))
    console.log(`Loaded Version: ${decreaseMajorVersion(version)}`)
  }

  async restoreExtensionVersion() {
    await fs.remove(config.migVersionDir)
    await fs.copy(config.distDir, config.migVersionDir)
    // Reload Extension
    await this.page.goto("chrome://extensions")
    // Find and click the reload button for our extension
    const reloadButton = this.page
      .locator("extensions-item")
      .filter({ hasText: "Argent X" })
      .locator('cr-icon-button[title="Reload"]')
    await reloadButton.click()
    await this.page.waitForTimeout(1000)

    //open extension
    await this.open()
  }

  async upgradeExtension(newVersion: string) {
    await this.restoreExtensionVersion()
    //unlock extension
    await this.account.password.fill(config.password)
    await this.navigation.unlockLocator.click()
    await this.page.waitForLoadState("networkidle")
    //check extension version
    await expect(this.version).resolves.toBe(newVersion)
    console.log("Loaded Version:", newVersion)
  }
}
