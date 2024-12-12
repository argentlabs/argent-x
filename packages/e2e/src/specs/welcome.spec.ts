import { expect } from "@playwright/test"

import test from "../test"

test.describe("Welcome screen", () => {
  test(
    "Extension should be loaded with success",
    {
      tag: "@all",
    },
    async ({ extension }) => {
      await Promise.all([
        expect(extension.wallet.createNewWallet).toBeVisible(),
        expect(extension.wallet.restoreExistingWallet).toBeVisible(),
        expect(extension.wallet.banner).toBeVisible(),
        expect(extension.wallet.description).toBeVisible(),
      ])
    },
  )

  test(
    "create new account with success",
    {
      tag: "@all",
    },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await expect(extension.network.networkSelector).toContainText(
        extension.network.getDefaultNetworkName(),
      )
    },
  )
})
