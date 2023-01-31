import { expect } from "@playwright/test"

import test from "../test"
const key = "Meta"
test.describe("Revover wallet", () => {
  test("User should be able to recover account with recovery phase", async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.settingsMenu.click()
    await extension.settings.showRecoveryPhrase.click()
    await extension.page.locator("[name=password]").fill("test123$")
    await extension.page.locator('button:text-is("Continue")').click()

    await extension.settings.copyRecoveryPhrase.click()

    await extension.settings.back.click()
    await extension.settings.close.click()
    await extension.resetExtension()
    await extension.wallet.restoreExistingWallet.click()
    await extension.page.keyboard.press(`${key}+KeyV`)
    await extension.page.locator('button:text-is("Continue")').click()

    await extension.wallet.password.fill("123456")
    await extension.wallet.repeatPassword.fill("123456")

    await extension.page.locator('button:text-is("Continue")').click()

    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
  })
})
