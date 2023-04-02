import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"

test.describe("Banner", () => {
  test("dapps banner should be visible after login", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.account.setUpAccountRecovery.click()
    await extension.account.saveTheRecoveryPhrase.click()
    await extension.navigation.continue.click()
    await extension.navigation.yes.click()
    await expect(extension.account.setUpAccountRecovery).toBeHidden()
    await expect(extension.account.dappsBanner).toBeVisible()
    let href = await extension.account.dappsBanner.getAttribute("href")
    expect(href).toContain("https://www.dappland.com")
    //check settings banner
    await extension.navigation.showSettings.click()
    href = await extension.account.dappsBanner.getAttribute("href")
    expect(href).toContain("https://www.dappland.com")
  })

  test("dapps banner should not be visible after dismissed", async ({
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
    await expect(extension.account.dappsBanner).toBeVisible()
    await extension.account.dappsBannerClose.click()
    await expect(extension.account.dappsBanner).toBeHidden()
  })

  test("dapps banner shoud be visible after account recovery", async ({
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
    await expect(extension.account.dappsBanner).toBeVisible()
  })
})
