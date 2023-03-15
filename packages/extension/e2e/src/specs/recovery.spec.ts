import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"

test.describe("Recovery Wallet", () => {
  test("User should be able to recover wallet using seed phrase", async ({
    extension,
  }) => {
    await extension.open()
    await extension.wallet.restoreExistingWallet.click()
    await extension.setClipBoardContent(config.wallets[1].seed)
    await extension.paste()
    await extension.navigation.continue.click()

    await extension.wallet.password.fill(config.password)
    await extension.wallet.repeatPassword.fill(config.password)

    await extension.navigation.continue.click()
    await expect(extension.wallet.finish.first()).toBeVisible({
      timeout: 180000,
    })

    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
  })

  test("Set up account recovery banner should not be visible after user copy phrase", async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.account.setUpAccountRecovery.click()
    await extension.account.saveTheRecoveryPhrase.click()
    await extension.navigation.continue.click()
    await extension.navigation.yes.click()
    await expect(extension.account.setUpAccountRecovery).toBeHidden()
  })

  test("User should be able to recover wallet with more than 30 accounts", async ({
    extension,
  }) => {
    await extension.open()
    await extension.wallet.restoreExistingWallet.click()
    await extension.setClipBoardContent(config.wallets[2].seed)
    await extension.paste()
    await extension.navigation.continue.click()

    await extension.wallet.password.fill(config.password)
    await extension.wallet.repeatPassword.fill(config.password)

    await extension.navigation.continue.click()
    await expect(extension.wallet.finish.first()).toBeVisible({
      timeout: 180000,
    })

    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    await extension.account.selectAccount("Account 32")
    await expect(extension.account.currentBalance("ETH")).toContainText(
      "0.9991 ETH",
    )
  })
})
