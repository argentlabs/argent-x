import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"
import { logInfo } from "../../../shared/src/common"

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
      tag: "@all",
    },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.network.selectNetwork("Mainnet")
      if (!config.isProdTesting) {
        await extension.account.addAccountMainnet({ firstAccount: true })
      }
      await expect(extension.account.showAccountRecovery).toBeVisible()
      if (config.isProdTesting) {
        await extension.account.dismissAccountRecoveryBanner()
      }
      await expect(extension.account.setUpAccountRecovery).toBeHidden()
    },
  )

  test(
    "User should be able to recover wallet with more than 30 accounts",
    {
      tag: "@all",
    },
    async ({ extension, browser }) => {
      await browser.startTracing(extension.page, {
        path: "./perfTraces.json",
        screenshots: true,
      })

      await extension.open()
      await extension.recoverWallet(config.testSeed1!)
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.network.selectDefaultNetwork()
      await extension.page.evaluate(() =>
        window.performance.mark("Perf:Started"),
      )

      await extension.account.selectAccount("Account 33")
      //Using performance.mark API
      await extension.page.evaluate(() => window.performance.mark("Perf:Ended"))
      //Performance measure
      await extension.page.evaluate(() =>
        window.performance.measure("overall", "Perf:Started", "Perf:Ended"),
      )
      //To get all performance measures of Google
      const getAllMeasuresJson = await extension.page.evaluate(() =>
        JSON.stringify(window.performance.getEntriesByType("measure")),
      )
      const getAllMeasures = await JSON.parse(getAllMeasuresJson)
      logInfo({
        op: 'window.performance.getEntriesByType("measure")',
        getAllMeasures: getAllMeasures,
      })
      //todo confirm why ius this taking so long
      console.log(getAllMeasuresJson)
      expect(getAllMeasures[0].duration).toBeLessThan(
        config.isProdTesting ? 20000 : 35000,
      )
      await browser.stopTracing()

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
      await extension.account.accountAddressFromAssetsView.click()
      await extension.account.saveRecoveryPhrase()
      await extension.account.copyAddress.click()
      const accountAddress = await extension.utils.getClipboard()
      expect(accountAddress).toMatch(/^0x0/)
    },
  )

  test(
    "Save your recovery phrase banner",
    {
      tag: "@all",
    },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.network.selectNetwork("Mainnet")
      if (!config.isProdTesting) {
        await extension.account.addAccountMainnet({ firstAccount: true })
      }

      await extension.account.showAccountRecovery.click()
      await extension.account.saveRecoveryPhrase()
      await extension.account.copyAddress.click()
      const accountAddress = await extension.utils.getClipboard()
      expect(accountAddress).toMatch(/^0x0/)
      await expect(extension.account.showAccountRecovery).toBeHidden()
    },
  )

  test("User should be able to recover wallet with only one account with founds", async ({
    extension,
  }) => {
    await extension.open()
    await extension.recoverWallet(config.testSeed4!)
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectDefaultNetwork()
    await extension.account.accountListSelector.click()
    await expect(extension.account.account("")).toHaveCount(1)
    await extension.account.account("Account 5").click()
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
    expect(selectedAccount).toMatch(/Account (.*)/)
    await extension.account.accountListSelector.click()
    const accountList = await extension.account.accountNames()

    expect(accountList).toEqual([
      "Account 1",
      "Account 1",
      "Account 2",
      "Account 3",
      "Account 4",
      "Account 5",
      "Account 6",
      "Account 7",
      "Account 8",
      "Account 9",
      "Account 10",
      "Account 11",
      "Multisig 1",
    ])
  })
})
