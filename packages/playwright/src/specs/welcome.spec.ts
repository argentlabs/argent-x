import { expect } from "@playwright/test"

import { extension, test } from "../test"

test.describe("Welcome screen", () => {
  test("Extension should be loaded with success", async () => {
    await Promise.all([
      expect(extension.wallet.createNewWallet).toBeVisible(),
      expect(extension.wallet.restoreExistingWallet).toBeVisible(),
      expect(extension.wallet.banner).toBeVisible(),
      expect(extension.wallet.description).toBeVisible(),
    ])
  })

  test("create new account with success", async () => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
  })

  test("Disclaimer - Continue button should only be enabled if both options are accepted", async () => {
    await extension.wallet.createNewWallet.click()
    await Promise.all([
      expect(extension.wallet.banner2).toBeVisible(),
      expect(extension.wallet.disclaimerLostOfFunds).not.toBeChecked(),
      expect(extension.wallet.disclaimerAlphaVersion).not.toBeChecked(),
      expect(extension.wallet.continue).toBeDisabled(),
    ])
    await extension.wallet.disclaimerLostOfFunds.check()
    await expect(extension.wallet.continue).toBeDisabled()

    await extension.wallet.disclaimerAlphaVersion.check()
    await expect(extension.wallet.continue).toBeEnabled()

    await extension.wallet.disclaimerLostOfFunds.uncheck()
    await expect(extension.wallet.continue).toBeDisabled()
  })
})
