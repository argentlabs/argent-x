import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"
import { TokenSymbol } from "../utils"

test.describe(`Send partial funds fee STRK`, { tag: "@tx" }, () => {
  const assets = [
    { token: "ETH" as TokenSymbol, balance: 0.0001 },
    { token: "STRK" as TokenSymbol, balance: 2 },
  ]

  test("send partial funds to other self account", async ({ extension }) => {
    const { accountAddresses, accountNames } = await extension.setupWallet({
      accountsToSetup: [
        {
          assets,
        },
        { assets: [{ token: "ETH", balance: 0 }] },
      ],
    })
    const accountName1 = accountNames![0]
    const accountName2 = accountNames![1]
    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: accountName1,
      recipientAddress: accountAddresses[1],
      token: "ETH",
      amount: 0.00005,
      feeToken: "STRK",
    })

    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx({
      txHash: txHash!,
      receiver: accountAddresses[1],
      sendAmountFE,
      sendAmountTX,
    })
    await extension.navigation.menuTokensLocator.click()

    //ensure that balance is updated
    await expect(extension.account.currentBalance("ETH")).toContainText("0.00")
    const balance = await extension.account.currentBalance("ETH").innerText()
    expect(parseFloat(balance)).toBeLessThan(0.01)

    await extension.account.ensureSelectedAccount(accountName2)
    await expect(extension.account.currentBalance("ETH")).toContainText(
      "0.00005",
    )
  })

  test("send partial funds to other wallet/account", async ({ extension }) => {
    const { accountNames } = await extension.setupWallet({
      accountsToSetup: [{ assets }],
    })
    const accountName1 = accountNames![0]
    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: accountName1,
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: 0.00005,
      feeToken: "STRK",
    })

    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx({
      txHash: txHash!,
      receiver: config.destinationAddress!,
      sendAmountFE,
      sendAmountTX,
    })
    await extension.navigation.menuTokensLocator.click()

    //ensure that balance is updated
    await expect(extension.account.currentBalance("ETH")).toContainText("0.00")
    const balance = await extension.account.currentBalance("ETH").innerText()
    expect(parseFloat(balance)).toBeLessThan(0.01)

    //send back remaining funds
    await extension.account.transfer({
      originAccountName: accountName1,
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: "MAX",
      feeToken: "STRK",
    })
  })

  test("User should be able to send funds to starknet id", async ({
    extension,
  }) => {
    const { accountNames } = await extension.setupWallet({
      accountsToSetup: [{ assets }],
    })
    const accountName1 = accountNames![0]
    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: accountName1,
      recipientAddress: "qateste2e.stark",
      token: "ETH",
      amount: 0.00009,
      feeToken: "STRK",
    })
    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx({
      txHash: txHash!,
      receiver: config.destinationAddress!,
      sendAmountFE,
      sendAmountTX,
    })
  })
})
