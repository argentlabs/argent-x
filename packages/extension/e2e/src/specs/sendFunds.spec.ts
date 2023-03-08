import { expect } from "@playwright/test"

import test from "../test"

test.describe("Send funds", () => {
  test("send partial funds to other self account", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    const [accountName1] = await extension.account.addAccount({})
    const [accountName2, accountAddress2] = await extension.account.addAccount({
      firstAccount: false,
    })
    if (!accountName1 || !accountName2 || !accountAddress2) {
      throw new Error("Invalid account names")
    }
    await extension.account.ensureAsset(accountName1, "ETH", "1.0")
    await extension.account.ensureAsset(accountName2, "ETH", "1.0")

    await extension.account.transfer({
      originAccountName: accountName1,
      recepientAddress: accountAddress2,
      tokenName: "Ethereum",
      amount: 0.5,
    })
    await extension.activity.checkActivity(1)
    await extension.navigation.menuTokens.click()
    await expect(
      extension.navigation.menuPendingTransationsIndicator,
    ).not.toBeVisible()

    await expect(extension.account.currentBalance("ETH")).toContainText(
      "0.4988",
    )
    await extension.account.token("Ethereum").click()
    await expect(extension.account.balance).toContainText("0.4988")
    await extension.account.back.click()
    await extension.account.ensureSelectedAccount(accountName2)
    await extension.account.token("Ethereum").click()
    await expect(extension.account.balance).toContainText("1.5")
    await extension.account.back.click()
    await expect(extension.account.currentBalance("ETH")).toContainText("1.5")
  })

  test("send partial funds to other wallet/account", async ({
    extension,
    secondExtension,
  }) => {
    //setup wallet 1
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    const [accountName1, accountAddress1] = await extension.account.addAccount(
      {},
    )

    if (!accountName1 || !accountAddress1) {
      throw new Error("Invalid account info")
    }
    await extension.account.ensureAsset(accountName1, "ETH", "1.0")

    //setup wallet 2
    await secondExtension.wallet.newWalletOnboarding()
    await secondExtension.open()
    await expect(secondExtension.network.networkSelector).toBeVisible()
    await secondExtension.network.selectNetwork("Localhost 5050")
    const [accountName2, accountAddress2] =
      await secondExtension.account.addAccount({})

    if (!accountName2 || !accountAddress2) {
      throw new Error("Invalid account info")
    }
    await secondExtension.account.ensureAsset(accountName1, "ETH", "1.0")
    await extension.account.transfer({
      originAccountName: accountName1,
      recepientAddress: accountAddress2,
      tokenName: "Ethereum",
      amount: 0.5,
    })
    await extension.activity.checkActivity(1)
    await extension.navigation.menuTokens.click()
    await expect(
      extension.navigation.menuPendingTransationsIndicator,
    ).not.toBeVisible()
    await expect(extension.account.currentBalance("ETH")).toContainText(
      "0.4988",
    )
    await extension.account.token("Ethereum").click()
    await expect(extension.account.balance).toContainText("0.4988")

    await secondExtension.account.token("Ethereum").click()
    await secondExtension.account.back.click()
    await expect(secondExtension.account.currentBalance("ETH")).toContainText(
      "1.5",
    )
  })

  test("send MAX funds to other self account", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    const [accountName1] = await extension.account.addAccount({})
    const [accountName2, accountAddress2] = await extension.account.addAccount({
      firstAccount: false,
    })
    if (!accountName1 || !accountName2 || !accountAddress2) {
      throw new Error("Invalid account names")
    }
    await extension.account.ensureAsset(accountName1, "ETH", "1.0")
    await extension.account.ensureAsset(accountName2, "ETH", "1.0")

    await extension.account.transfer({
      originAccountName: accountName1,
      recepientAddress: accountAddress2,
      tokenName: "Ethereum",
      amount: "MAX",
    })
    await extension.activity.checkActivity(1)
    await extension.navigation.menuTokens.click()
    await expect(
      extension.navigation.menuPendingTransationsIndicator,
    ).not.toBeVisible()
    await expect(extension.account.currentBalance("ETH")).toContainText(
      "0.0023",
    )

    await extension.account.token("Ethereum").click()
    await expect(extension.account.balance).toContainText("0.0023")
    await extension.account.back.click()
    await extension.account.ensureSelectedAccount(accountName2)
    await extension.account.token("Ethereum").click()
    await expect(extension.account.balance).toContainText("1.9965")
    await extension.account.back.click()
    await expect(extension.account.currentBalance("ETH")).toContainText("1.9")
  })

  test("send MAX funds to other wallet/account", async ({
    extension,
    secondExtension,
  }) => {
    //setup wallet 1
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    const [accountName1, accountAddress1] = await extension.account.addAccount(
      {},
    )

    if (!accountName1 || !accountAddress1) {
      throw new Error("Invalid account info")
    }
    await extension.account.ensureAsset(accountName1, "ETH", "1.0")

    //setup wallet 2
    await secondExtension.wallet.newWalletOnboarding()
    await secondExtension.open()
    await expect(secondExtension.network.networkSelector).toBeVisible()
    await secondExtension.network.selectNetwork("Localhost 5050")
    const [accountName2, accountAddress2] =
      await secondExtension.account.addAccount({})

    if (!accountName2 || !accountAddress2) {
      throw new Error("Invalid account info")
    }
    await secondExtension.account.ensureAsset(accountName1, "ETH", "1.0")
    await extension.account.transfer({
      originAccountName: accountName1,
      recepientAddress: accountAddress2,
      tokenName: "Ethereum",
      amount: "MAX",
    })
    await extension.activity.checkActivity(1)
    await extension.navigation.menuTokens.click()
    await expect(
      extension.navigation.menuPendingTransationsIndicator,
    ).not.toBeVisible()
    await expect(extension.account.currentBalance("ETH")).toContainText(
      "0.0023",
    )

    await extension.account.token("Ethereum").click()
    await expect(extension.account.balance).toContainText("0.0023")

    await secondExtension.account.token("Ethereum").click()
    await expect(secondExtension.account.balance).toContainText("1.9965")
    await secondExtension.account.back.click()
    await expect(secondExtension.account.currentBalance("ETH")).toContainText(
      "1.9",
    )
  })
})
