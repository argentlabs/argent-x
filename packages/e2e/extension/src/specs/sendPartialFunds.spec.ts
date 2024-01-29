import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"

test.describe("Send funds", () => {
  test("send partial funds to other self account", async ({ extension }) => {
    const { accountAddresses } = await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.01 }, { initialBalance: 0 }],
    })
    const amountTrx = await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: accountAddresses[1],
      tokenName: "Ethereum",
      amount: 0.005,
    })
    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx(txHash!, accountAddresses[1], amountTrx)
    await extension.navigation.menuTokens.click()

    //ensure that balance is updated
    await expect(extension.account.currentBalance("Ethereum")).toContainText(
      "0.00",
      { timeout: 60000 },
    )
    const balance = await extension.account
      .currentBalance("Ethereum")
      .innerText()
    expect(parseFloat(balance)).toBeLessThan(0.01)

    await extension.account.ensureSelectedAccount(
      extension.account.accountName2,
    )
    await expect(extension.account.currentBalance("Ethereum")).toContainText(
      "0.005",
      { timeout: 60000 },
    )
  })

  test("send partial funds to other wallet/account", async ({ extension }) => {
    await extension.setupWallet({ accountsToSetup: [{ initialBalance: 0.01 }] })
    const amountTrx = await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: config.destinationAddress!,
      tokenName: "Ethereum",
      amount: 0.005,
      fillRecipientAddress: "typing",
    })

    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx(txHash!, config.destinationAddress!, amountTrx)
    await extension.navigation.menuTokens.click()

    //ensure that balance is updated
    await expect(extension.account.currentBalance("Ethereum")).toContainText(
      "0.00",
      { timeout: 60000 },
    )
    const balance = await extension.account
      .currentBalance("Ethereum")
      .innerText()
    expect(parseFloat(balance)).toBeLessThan(0.01)

    //send back remaining funds
    await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: config.destinationAddress!,
      tokenName: "Ethereum",
      amount: "MAX",
    })
  })

  test("User should be able to send funds to starknet id", async ({
    extension,
  }) => {
    await extension.setupWallet({ accountsToSetup: [{ initialBalance: 0.01 }] })
    const amountTrx = await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: "e2e-test.stark",
      tokenName: "Ethereum",
      amount: "MAX",
    })
    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx(txHash!, config.account1Seed3!, amountTrx)
  })
})
