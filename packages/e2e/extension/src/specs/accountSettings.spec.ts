import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"
import { lang } from "../languages"

test.describe("Account settings", () => {
  test("User should be able to edit account name", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Testnet")
    const [accountName1] = await extension.account.addAccount({
      firstAccount: false,
    })

    await extension.navigation.showSettings.click()
    await extension.settings.account(accountName1!).click()
    await extension.settings.setAccountName("My new account name")
    await expect(extension.settings.accountName).toHaveValue(
      "My new account name",
    )
    await extension.navigation.back.click()
    await extension.navigation.close.click()

    await extension.account.ensureSelectedAccount("My new account name")
  })

  test("User should be able to copy private key", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Testnet")
    const [accountName1] = await extension.account.addAccount({
      firstAccount: false,
    })

    await extension.navigation.showSettings.click()
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

    await extension.navigation.done.click()
    await expect(extension.settings.exportPrivateKey).toBeVisible()
  })

  test("User should be able to hide/unhide account", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Testnet")
    const [accountName2] = await extension.account.addAccount({
      firstAccount: false,
    })

    await extension.navigation.showSettings.click()
    await extension.settings.account(accountName2!).click()
    await extension.settings.hideAccount.click()
    await extension.settings.confirmHide.click()

    await expect(extension.account.account(accountName2!)).toBeHidden()

    await extension.settings.hiddenAccounts.click()
    await extension.settings.unhideAccount(accountName2!).click()
    await extension.navigation.back.click()
    await expect(extension.settings.hiddenAccounts).toBeHidden()
    await expect(extension.account.account(accountName2!)).toBeVisible()
  })

  test("User should be able unlock wallet using password", async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.navigation.showSettings.click()
    await extension.navigation.lockWallet.click()

    await extension.account.password.fill(config.password)
    await extension.navigation.unlock.click()
    await expect(extension.network.networkSelector).toBeVisible()
  })

  test("User should not be able unlock wallet using wrong password", async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.navigation.showSettings.click()
    await extension.navigation.lockWallet.click()

    await extension.account.password.fill("wrongpassword123!")
    await extension.navigation.unlock.click()
    await expect(
      extension.page.locator(`label:text-is("${lang.account.wrongPassword}")`),
    ).toBeVisible()
    await expect(extension.account.password).toBeVisible()
  })
})
