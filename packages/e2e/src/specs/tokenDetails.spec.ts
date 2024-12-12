import { expect } from "@playwright/test"

import test from "../test"

test.describe("Token Details", () => {
  test(
    "User should be able to see token details",
    {
      tag: "@prodOnly",
    },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await expect(extension.network.networkSelector).toContainText(
        extension.network.getDefaultNetworkName(),
      )
      await extension.account.setupRecovery()
      await extension.tokenDetails.openTokenDetails("ETH").click()

      await expect(extension.tokenDetails.swapButtonLoc).toHaveCount(1)
      await Promise.all([
        expect(extension.tokenDetails.swapButtonLoc).toBeVisible(),
        expect(extension.tokenDetails.sendButtonLoc).toBeVisible(),
        expect(extension.tokenDetails.buyButtonLoc).toBeVisible(),
      ])
      extension.navigation.backLocator.click()

      await extension.tokenDetails.openTokenDetails("STRK").click()
      await expect(extension.tokenDetails.swapButtonLoc).toHaveCount(1)
      await Promise.all([
        expect(extension.tokenDetails.swapButtonLoc).toBeVisible(),
        expect(extension.tokenDetails.sendButtonLoc).toBeVisible(),
        expect(extension.tokenDetails.buyButtonLoc).toBeVisible(),
      ])

      await expect(extension.tokenDetails.graphTimeFrameLoc("1D")).toBeVisible()

      await Promise.all([
        expect(extension.tokenDetails.graphTimeFrameLoc("1D")).toBeVisible(),
        expect(extension.tokenDetails.graphTimeFrameLoc("1W")).toBeVisible(),
        expect(extension.tokenDetails.graphTimeFrameLoc("1M")).toBeVisible(),
        expect(extension.tokenDetails.graphTimeFrameLoc("1Y")).toBeVisible(),
        expect(extension.tokenDetails.graphTimeFrameLoc("All")).toBeVisible(),
      ])
      const selectedButton = await extension.tokenDetails
        .graphTimeFrameLoc("1D")
        .evaluate((el, attr) => el.hasAttribute(attr), "data-active")
      expect(selectedButton).toBe(true)

      await extension.tokenDetails.buyButtonLoc.click()
      await expect(extension.navigation.backLocator).toBeVisible()
      await expect(extension.page.getByText("Choose provider")).toBeVisible()
      await extension.navigation.backLocator.click()

      await extension.tokenDetails.swapButtonLoc.click()
      await expect(extension.swap.swapHeader).toBeVisible()
      await extension.navigation.backLocator.click()

      await extension.tokenDetails.sendButtonLoc.click()
      await expect(extension.account.sendToHeader).toBeVisible()
      await extension.navigation.backLocator.click()

      await extension.tokenDetails.aboutButtonLoc.click()
      await Promise.all([
        expect(extension.page.getByText("Market cap")).toBeVisible(),
        expect(extension.page.getByText("24hr volume")).toBeVisible(),
      ])

      await extension.tokenDetails.activityButtonLoc.click()
      await expect(extension.page.getByText("No activity")).toBeVisible()

      await extension.tokenDetails.menuButtonLoc.click()
      await Promise.all([
        expect(extension.tokenDetails.menuCopyTokenAddressLoc).toBeVisible(),
        expect(extension.tokenDetails.menuViewOnVoyagerLoc).toBeVisible(),
      ])

      await extension.tokenDetails.menuCopyTokenAddressLoc.click()
      await extension.clipboard.setClipboard()
      const tokenAddress = await extension.clipboard.getClipboard()
      await extension.tokenDetails.menuViewOnVoyagerLoc
        .locator(`[data-address="${tokenAddress}"]`)
        .isVisible()
    },
  )

  test(
    "User should be able to see hide tokens",
    {
      tag: "@prodOnly",
    },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await expect(extension.network.networkSelector).toContainText(
        extension.network.getDefaultNetworkName(),
      )
      await extension.account.setupRecovery()

      await extension.tokenDetails.addNewToken(
        "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        "USDC",
      )

      await extension.navigation.showSettingsLocator.click()
      await extension.settings.preferences.click()
      await extension.preferences.hiddenAndSpamTokens.click()

      await expect(extension.tokenDetails.token("USD Coin")).toBeVisible({
        timeout: 1000 * 60 * 2,
      })

      await extension.navigation.backLocator.click()
      await expect(extension.preferences.hiddenAndSpamTokens).toBeVisible()
      await extension.navigation.backLocator.click()
      await extension.navigation.closeLocator.click()

      await expect(extension.account.token("USDC")).toBeVisible()

      await extension.navigation.showSettingsLocator.click()
      await extension.settings.preferences.click()
      await extension.preferences.hiddenAndSpamTokens.click()
      await extension.tokenDetails.hideToken("USDC").click()

      await extension.navigation.backLocator.click()
      await expect(extension.preferences.hiddenAndSpamTokens).toBeVisible()
      await extension.navigation.backLocator.click()
      await extension.navigation.closeLocator.click()

      await expect(extension.account.token("USDC")).toBeHidden()
    },
  )

  test(
    "User should be able to see hide Spam tokens",
    {
      tag: "@prodOnly",
    },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await expect(extension.network.networkSelector).toContainText(
        extension.network.getDefaultNetworkName(),
      )
      await extension.account.setupRecovery()

      await extension.tokenDetails.addNewToken(
        "0x001f4466085c4bb3374ecad67bfcb4cce25ea502617ab624cf532f90300f2794",
        "Ã¡dfas",
      )

      await extension.navigation.showSettingsLocator.click()
      await extension.settings.preferences.click()
      await extension.preferences.hiddenAndSpamTokens.click()
      await extension.tokenDetails.spamTokensList.click()
      await expect(
        extension.tokenDetails.token("HahaHahaHahaHahaHahaHahaHaha"),
      ).toBeVisible({ timeout: 1000 * 60 * 2 })

      await extension.navigation.backLocator.click()
      await expect(extension.preferences.hiddenAndSpamTokens).toBeVisible()
      await extension.navigation.backLocator.click()
      await extension.navigation.closeLocator.click()

      await expect(extension.account.token("ádfas")).toBeHidden()

      await extension.navigation.showSettingsLocator.click()
      await extension.settings.preferences.click()
      await extension.preferences.hiddenAndSpamTokens.click()
      await extension.tokenDetails.spamTokensList.click()
      await extension.tokenDetails.spamTokensList.click()
      await extension.tokenDetails.showToken("ádfas").click()

      await extension.navigation.backLocator.click()
      await expect(extension.preferences.hiddenAndSpamTokens).toBeVisible()
      await extension.navigation.backLocator.click()
      await extension.navigation.closeLocator.click()

      await expect(extension.account.token("ádfas")).toBeVisible()
    },
  )
})
