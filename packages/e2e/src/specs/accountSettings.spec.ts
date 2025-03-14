import { expect } from "@playwright/test"

import test from "../test"
import { lang } from "../languages"
import config from "../config"

const strkInitialBalance = "2.1"

test.describe("Account settings", () => {
  test(
    "User should be able to edit account name",
    { tag: "@all" },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.network.selectDefaultNetwork()

      await extension.navigation.showSettingsLocator.click()
      await extension.settings.account("").click()
      await extension.settings.setAccountName("My VIP account")
      await extension.navigation.backLocator.click()
      await extension.navigation.closeLocator.click()

      await extension.account.ensureSelectedAccount("My VIP account")
    },
  )

  test(
    "User should be able to copy private key",
    { tag: "@all" },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.network.selectDefaultNetwork()

      await extension.navigation.showSettingsLocator.click()
      await extension.settings.account("").click()
      await extension.settings.exportPrivateKey.click()
      await extension.account.password.fill(config.password)
      await extension.account.unlockLocator.click()
      await extension.settings.copy.click()
      //ensure that copy is working
      const clipboardPrivateKey =
        await extension.navigation.getSystemClipboard()
      expect(clipboardPrivateKey).toEqual(
        await extension.settings.privateKey.textContent(),
      )

      await extension.navigation.backLocator.click()
      await expect(extension.settings.exportPrivateKey).toBeVisible()
    },
  )

  test(
    "User should be able to hide/unhide account",
    { tag: "@all" },
    async ({ extension }) => {
      const { accountNames } = await extension.setupWallet({
        accountsToSetup: [
          { assets: [{ token: "ETH", balance: 0 }] },
          { assets: [{ token: "ETH", balance: 0 }] },
        ],
      })
      const accountName2 = accountNames![1]
      await extension.account.ensureSelectedAccount(accountName2)
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.account(accountName2).click()
      await extension.settings.hideAccount.click()
      await extension.settings.confirmHide.click()

      await expect(extension.account.account(accountName2)).toBeHidden()
      await extension.navigation.closeButtonLocator.click()
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.preferences.click()

      await extension.settings.hiddenAccounts.click()
      await extension.settings.unhideAccount(accountName2).click()
      await extension.navigation.backLocator.click()
      await extension.navigation.backLocator.click()
      await extension.navigation.closeLocator.click()
      await extension.account.accountListSelector.click()
      await expect(extension.account.account(accountName2)).toBeVisible()
    },
  )

  test(
    "User should be able unlock wallet using password",
    { tag: "@all" },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.navigation.showSettingsLocator.click()
      await extension.navigation.lockWalletLocator.click()

      await extension.account.password.fill(config.password)
      await extension.navigation.unlockLocator.click()
      await expect(extension.network.networkSelector).toBeVisible()
    },
  )

  test(
    "User should not be able unlock wallet using wrong password",
    { tag: "@all" },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.navigation.showSettingsLocator.click()
      await extension.navigation.lockWalletLocator.click()

      await extension.account.password.fill("wrongPassword123!")
      await extension.navigation.unlockLocator.click()
      await expect(
        extension.page.locator(
          `label:text-is("${lang.account.wrongPassword}")`,
        ),
      ).toBeVisible()
      await expect(extension.account.password).toBeVisible()
    },
  )

  test(
    "Detect outside deploy",
    { tag: "@tx" },
    async ({ extension, secondExtension }) => {
      const { seed, accountNames } = await extension.setupWallet({
        accountsToSetup: [
          { assets: [{ token: "STRK", balance: strkInitialBalance }] },
        ],
      })
      const accountName1 = accountNames![0]
      await secondExtension.open()
      await Promise.all([
        extension.account.transfer({
          originAccountName: accountName1,
          recipientAddress: config.destinationAddress!,
          token: "STRK",
          amount: "MAX",
        }),
        secondExtension.recoverWallet(seed),
      ])

      //ensure that balance is updated
      await expect(extension.account.currentBalance("STRK")).not.toContainText(
        strkInitialBalance.toString(),
      )
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.account(accountName1).click()
      await Promise.all([
        expect(extension.settings.deployAccount).toBeHidden(),
        expect(extension.settings.viewOnVoyagerLocator).toBeVisible(),
      ])

      await expect(secondExtension.network.networkSelector).toBeVisible()
      await secondExtension.network.selectDefaultNetwork()
      await secondExtension.navigation.showSettingsLocator.click()
      await secondExtension.settings.account("").click()
      await Promise.all([
        expect(secondExtension.settings.deployAccount).toBeHidden(),
        expect(secondExtension.settings.viewOnVoyagerLocator).toBeVisible(),
      ])
    },
  )

  test(
    "User should be able copy account address from Fund menu",
    { tag: "@all" },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.network.selectDefaultNetwork()
      if (config.isProdTesting) {
        await extension.account.dismissAccountRecoveryBanner()
      }
      await extension.account.fundMenu.click()
      await extension.account.addFundsFromStartNet.click()
      await extension.account.copyAddressFromFundMenu.click()
      await expect(extension.page.locator("text=Copied")).toBeVisible()
      const addressFromClipboard =
        await extension.navigation.getSystemClipboard()
      const addressFromModal = await extension.page
        .locator('[aria-label="Full account address"]')
        .textContent()
      expect(addressFromClipboard).toBe(addressFromModal?.replace(/ /g, ""))
    },
  )

  test("navigate to account settings from account list sepolia", async ({
    extension,
  }) => {
    await extension.open()
    await extension.recoverWallet(config.senderSeed!)
    await expect(extension.network.networkSelector).toBeVisible()

    await extension.network.selectNetwork("Sepolia")
    await extension.account.gotoSettingsFromAccountList("Casual Clover")
    await extension.navigation.backLocator.click()
    await extension.account.gotoSettingsFromAccountList("Sunny Sushi")
  })

  test(
    "navigate to account settings from account list mainnet",
    { tag: "@prodOnly" },
    async ({ extension }) => {
      await extension.open()
      await extension.recoverWallet(config.testSeed1!)
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.network.selectNetwork("Mainnet")

      await extension.account.gotoSettingsFromAccountList("Observant Olive")
      await extension.navigation.backLocator.click()
      await extension.account.gotoSettingsFromAccountList("Witty Wolf")
    },
  )
})
