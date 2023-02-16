import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"

test.describe("Recovery Wallet", () => {
  test("User should be able to recove wallet using seed phrase", async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()

    await extension.navigation.showSettings.click()
    await extension.settings.showRecoveryPhase.click()
    await extension.wallet.password.fill(config.password)
    await extension.navigation.continue.click()
    await extension.settings.copy.click()
    await extension.navigation.back.click()

    await extension.navigation.lockWallet.click()
    await extension.navigation.reset.click()
    await extension.navigation.confirmReset.click()

    await extension.wallet.restoreExistingWallet.click()
    await extension.paste()
    await extension.navigation.continue.click()

    await extension.wallet.password.fill(config.password)
    await extension.wallet.repeatPassword.fill(config.password)

    await extension.navigation.continue.click()
    await expect(extension.wallet.finish.first()).toBeVisible({
      timeout: 30000,
    })

    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
  })

  test("Set up account recovery banner should be available until user copy phrase", async ({
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
})
