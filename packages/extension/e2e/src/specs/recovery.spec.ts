import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"

test.describe("Recovery Wallet", () => {
  test("User should be able to recove wallet using seed phrase", async ({
    extension,
    secondExtension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()

    await extension.settingsButton.click()
    await extension.settings.showRecoveryPhase.click()
    await extension.page.locator('[name="password"]').fill(config.password)
    await extension.settings.continue.click()
    await extension.settings.copy.click()
    await extension.settings.back.click()

    await extension.lockWallet.click()
    await extension.reset.click()
    await extension.confirmReset.click()

    await secondExtension.wallet.restoreExistingWallet.click()
    await secondExtension.paste()
    await secondExtension.page
      .locator("button:has-text('Continue')")
      .first()
      .click()

    await secondExtension.wallet.password.fill(config.password)
    await secondExtension.wallet.repeatPassword.fill(config.password)

    await secondExtension.page
      .locator("button:has-text('Continue')")
      .first()
      .click()
    await expect(secondExtension.wallet.finish.first()).toBeVisible()

    await secondExtension.open()

    await expect(secondExtension.network.networkSelector).toBeVisible()
  })
})
