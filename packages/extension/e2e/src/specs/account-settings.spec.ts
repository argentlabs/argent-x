import { expect } from "@playwright/test"

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

  test.skip("User should be able to export private key", async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    const [accountName1] = await extension.account.addAccount({})

    await extension.settingsButton.click()
    await extension.settings.account(accountName1!).click()
    await extension.settings.exportPrivateKey.click()

    await extension.settings.setAccountName("My new account name")
    await expect(extension.settings.accountName).toHaveValue(
      "My new account name",
    )
    await extension.settings.back.click()
    await extension.settings.close.click()

    await extension.account.ensureSelectedAccount("My new account name")
  })
})
