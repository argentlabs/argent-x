import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"

test.describe("Recovery Wallet", () => {
  test("User should be able to recover wallet using seed phrase after reset extension", async ({
    extension,
  }) => {
    await extension.open()
    await extension.recoverWallet(config.testSeed3!)
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.resetExtension()
    await extension.recoverWallet(config.testSeed3!)
  })

  test(
    "Set up account recovery banner should not be visible after user copy phrase",
    {
      tag: "@ProdOnly",
    },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await expect(extension.account.showAccountRecovery).toBeVisible()
      await extension.account.dismissAccountRecoveryBanner()
      await expect(extension.account.setUpAccountRecovery).toBeHidden()
    },
  )

  test(
    "User should be able to recover wallet with more than 30 accounts",
    {
      tag: "@all",
    },
    async ({ extension }) => {
      await extension.open()
      await extension.recoverWallet(config.testSeed1!)
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.network.selectDefaultNetwork()
      if (config.isProdTesting) {
        await extension.account.selectAccount("Strategic Scorpion")
      } else {
        await extension.account.selectAccount("Humble Hyacinth")
      }
      await expect(extension.account.currentBalance("ETH")).toContainText(
        "0.000",
      )
    },
  )

  test(
    "Copy phrase from account view when creating new wallet",
    {
      tag: "@all",
    },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.account.copyAddress.click()
      await extension.account.saveRecoveryPhrase()
      await extension.account.copyAddress.click()
      const accountAddress = await extension.account.accountAddr
      expect(accountAddress).toMatch(/^0x/)
    },
  )

  test(
    "Save your recovery phrase banner",
    {
      tag: "@prodOnly",
    },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.account.showAccountRecovery.click()
      await extension.account.saveRecoveryPhrase()
      const accountAddress = await extension.account.accountAddr
      expect(accountAddress).toMatch(/^0x/)
      await expect(extension.account.showAccountRecovery).toBeHidden()
    },
  )

  test("User should be able to recover wallet with only one account with funds", async ({
    extension,
  }) => {
    await extension.open()
    await extension.recoverWallet(config.testSeed4!)
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectDefaultNetwork()
    await extension.account.accountListSelector.click()
    await expect(extension.account.accounts).toHaveCount(1)
    await extension.account.account("Courageous Cactus").click()
    await expect(extension.account.currentBalance("ETH")).toContainText(
      "0.025 ETH",
    )
  })

  test("After recovery standard account should be selected by default", async ({
    extension,
  }) => {
    await extension.open()
    await extension.recoverWallet(config.senderSeed!)
    await expect(extension.network.networkSelector).toBeVisible()
    const selectedAccount =
      await extension.account.accountListSelector.textContent()
    expect(selectedAccount).toMatch(/(.*)Balanced Burger(.*)/)
    await extension.account.accountListSelector.click()
    const accountList = await extension.account.accountNames()
    expect(accountList).toEqual([
      "Balanced Burger",
      "Casual Clover",
      "Sunny Sushi",
      "Boundless Burger",
      "Tactful Tomato",
      "Mighty Mouse",
      "Pixelated Parrot",
      "Colorful Coral",
      "Pampered Pig",
      "Lavish Lemon",
      "Bemused Banana",
      "Humble Hotdog",
      "Balanced Banana",
    ])
  })
})
