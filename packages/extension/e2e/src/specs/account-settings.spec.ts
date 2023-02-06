import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"

test.describe("Account settings", () => {
  test("User should be able to edit account name", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    const [accountName1] = await extension.account.addAccount({})

    await extension.settingsButton.click()
    await extension.settings.account(accountName1!).click()
    await extension.settings.setAccountName("My new account name")
    await expect(extension.settings.accountName).toHaveValue(
      "My new account name",
    )
    await extension.settings.back.click()
    await extension.settings.close.click()

    await extension.account.ensureSelectedAccount("My new account name")
  })

  test("User should be able to copy private key", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    const [accountName1] = await extension.account.addAccount({})

    await extension.settingsButton.click()
    await extension.settings.account(accountName1!).click()
    await extension.settings.exportPrivateKey.click()
    await extension.account.password.fill(config.password)
    await extension.account.exportPrivateKey.click()
    await extension.settings.privateKey.click()
    //ensure that copy is working
    const clipboardPrivateKey = await extension.page.evaluate(
      "navigator.clipboard.readText()",
    )
    expect(clipboardPrivateKey).toEqual(
      await extension.settings.privateKey.textContent(),
    )

    await extension.settings.done.click()
    await expect(extension.settings.exportPrivateKey).toBeVisible()
  })

  test("User should be able to hide/unhide account", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Testnet 2")
    const [accountName1] = await extension.account.addAccount({})

    await extension.settingsButton.click()
    await extension.settings.account(accountName1!).click()
    await extension.settings.hideAccount.click()
    await extension.settings.confirmHide.click()

    await expect(extension.account.account(accountName1!)).toBeHidden()

    await extension.settings.hiddenAccounts.click()
    await extension.settings.unhideAccount(accountName1!).click()
    await expect(extension.settings.hiddenAccounts).toBeHidden()
    await expect(extension.account.account(accountName1!)).toBeVisible()
  })

  test("User should be able to delete an account on local network", async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    const [accountName1] = await extension.account.addAccount({})

    await extension.settingsButton.click()
    await extension.settings.account(accountName1!).click()
    await extension.settings.deleteAccount.click()
    await extension.settings.confirmDelete.click()

    await expect(extension.account.account(accountName1!)).toBeHidden()
    await expect(extension.settings.hiddenAccounts).toBeHidden()
  })
})
