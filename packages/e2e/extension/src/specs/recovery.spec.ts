import { expect } from "@playwright/test"

import config from "../../../shared/config"
import test from "../test"

test.describe("Recovery Wallet", () => {
  test("User should be able to recover wallet using seed phrase", async ({
    extension,
  }) => {
    const { seed } = await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "ETH", balance: 0.0005 }], deploy: true },
      ],
    })

    await extension.resetExtension()
    await extension.recoverWallet(seed)
  })

  test("Set up account recovery banner should not be visible after user copy phrase", async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Mainnet")
    await extension.account.addAccountMainnet({ firstAccount: true })
    await expect(extension.account.showAccountRecovery).toBeVisible()
    await extension.account.showAccountRecovery.click()
    await extension.account.confirmTheSeedPhrase.click()
    await extension.navigation.doneLocator.click()
    await expect(extension.account.setUpAccountRecovery).toBeHidden()
  })

  test("User should be able to recover wallet with more than 30 accounts", async ({
    extension,
  }) => {
    await extension.open()
    await extension.recoverWallet(config.testNetSeed1!)
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectDefaultNetwork()
    await extension.account.selectAccount("Account 33")
    await expect(extension.account.currentBalance("ETH")).toContainText(
      "0.0000097 ETH",
    )
  })

  test("Copy phrase from account view when creating new wallet", async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.account.accountAddressFromAssetsView.click()
    await extension.account.saveRecoveryPhrase()
    await extension.account.copyAddress.click()
    const accountAddress = await extension.getClipboard()
    expect(accountAddress).toMatch(/^0x0/)
  })

  test("Save your recovery phrase banner", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Mainnet")
    await extension.account.addAccountMainnet({ firstAccount: true })

    await extension.account.showAccountRecovery.click()
    await extension.account.saveRecoveryPhrase()
    await extension.account.copyAddress.click()
    const accountAddress = await extension.getClipboard()
    expect(accountAddress).toMatch(/^0x0/)
    await expect(extension.account.showAccountRecovery).toBeHidden()
  })
})
