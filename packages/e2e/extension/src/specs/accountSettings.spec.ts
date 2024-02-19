import { expect } from "@playwright/test"

import config from "../../../shared/config"
import test from "../test"
import { lang } from "../languages"

test.describe("Account settings", () => {
  test("User should be able to edit account name", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectDefaultNetwork()
    const [accountName1] = await extension.account.addAccount({
      firstAccount: false,
    })

    await extension.navigation.showSettingsLocator.click()
    await extension.settings.account(accountName1!).click()
    await extension.settings.setAccountName("My new account name")
    await expect(extension.settings.accountName).toHaveValue(
      "My new account name",
    )
    await extension.navigation.backLocator.click()
    await extension.navigation.closeLocator.click()

    await extension.account.ensureSelectedAccount("My new account name")
  })

  test("User should be able to copy private key", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectDefaultNetwork()
    const [accountName1] = await extension.account.addAccount({
      firstAccount: false,
    })

    await extension.navigation.showSettingsLocator.click()
    await extension.settings.account(accountName1!).click()
    await extension.settings.exportPrivateKey.click()
    await extension.account.password.fill(config.password)
    await extension.account.unlockLocator.click()
    await extension.settings.copy.click()
    //ensure that copy is working
    const clipboardPrivateKey = await extension.page.evaluate(
      "navigator.clipboard.readText()",
    )
    expect(clipboardPrivateKey).toEqual(
      await extension.settings.privateKey.textContent(),
    )

    await extension.navigation.backLocator.click()
    await expect(extension.settings.exportPrivateKey).toBeVisible()
  })

  test("User should be able to hide/unhide account", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectDefaultNetwork()
    const [accountName2] = await extension.account.addAccount({
      firstAccount: false,
    })

    await extension.navigation.showSettingsLocator.click()
    await extension.settings.account(accountName2!).click()
    await extension.settings.hideAccount.click()
    await extension.settings.confirmHide.click()

    await expect(extension.account.account(accountName2!)).toBeHidden()

    await extension.settings.hiddenAccounts.click()
    await extension.settings.unhideAccount(accountName2!).click()
    await extension.navigation.backLocator.click()
    await expect(extension.settings.hiddenAccounts).toBeHidden()
    await expect(extension.account.account(accountName2!)).toBeVisible()
  })

  test("User should be able unlock wallet using password", async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.navigation.showSettingsLocator.click()
    await extension.navigation.lockWalletLocator.click()

    await extension.account.password.fill(config.password)
    await extension.navigation.unlockLocator.click()
    await expect(extension.network.networkSelector).toBeVisible()
  })

  test("User should not be able unlock wallet using wrong password", async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.navigation.showSettingsLocator.click()
    await extension.navigation.lockWalletLocator.click()

    await extension.account.password.fill("wrongPassword123!")
    await extension.navigation.unlockLocator.click()
    await expect(
      extension.page.locator(`label:text-is("${lang.account.wrongPassword}")`),
    ).toBeVisible()
    await expect(extension.account.password).toBeVisible()
  })

  test("Detect outside deploy", async ({ extension, secondExtension }) => {
    const { seed } = await extension.setupWallet({
      accountsToSetup: [{ assets: [{ token: "ETH", balance: 0.01 }] }],
    })
    await secondExtension.open()
    await Promise.all([
      extension.account.transfer({
        originAccountName: extension.account.accountName1,
        recipientAddress: config.destinationAddress!,
        token: "ETH",
        amount: "MAX",
      }),
      secondExtension.recoverWallet(seed),
    ])

    //ensure that balance is updated
    await expect(extension.account.currentBalance("ETH")).toContainText("0.00")
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.account(extension.account.accountName1).click()
    await Promise.all([
      expect(extension.settings.deployAccount).toBeHidden(),
      expect(extension.settings.viewOnStarkScanLocator).toBeVisible(),
    ])

    await expect(secondExtension.network.networkSelector).toBeVisible()
    await secondExtension.network.selectDefaultNetwork()
    await secondExtension.navigation.showSettingsLocator.click()
    await secondExtension.settings
      .account(extension.account.accountName1)
      .click()
    await Promise.all([
      expect(secondExtension.settings.deployAccount).toBeHidden(),
      expect(secondExtension.settings.viewOnStarkScanLocator).toBeVisible(),
    ])
  })
})
