import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"
import { TokenSymbol } from "../utils"

test.describe(`Send MAX funds fee STRK`, { tag: "@tx" }, () => {
  //using STRK to pay fee, user should be able to transfer all ETH funds
  const expectedUpdatedBalance = "0.0 ETH"
  const assets = [
    { token: "STRK" as TokenSymbol, balance: 2 },
    { token: "ETH" as TokenSymbol, balance: 0.0001 },
  ]

  test("send MAX funds to other self account", async ({ extension }) => {
    const { accountAddresses, accountNames } = await extension.setupWallet({
      accountsToSetup: [{ assets }, { assets: [{ token: "ETH", balance: 0 }] }],
    })
    const accountName1 = accountNames![0]
    const accountName2 = accountNames![1]
    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: accountName1,
      recipientAddress: accountAddresses[1],
      token: "ETH",
      amount: "MAX",
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
    await expect(extension.account.currentBalance("ETH")).toContainText(
      expectedUpdatedBalance,
    )
    let balance = await extension.account.currentBalance("ETH").innerText()
    expect(parseFloat(balance)).toBeLessThan(0.01)

    await extension.account.ensureSelectedAccount(accountName2)
    await expect(extension.account.currentBalance("ETH")).toContainText(
      sendAmountFE,
    )
    balance = await extension.account.currentBalance("ETH").innerText()
    expect(parseFloat(balance)).toBe(0.0001)
  })

  test("send MAX funds to other wallet/account", async ({ extension }) => {
    const { accountNames } = await extension.setupWallet({
      accountsToSetup: [{ assets }],
    })

    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: accountNames![0],
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: "MAX",
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
    await expect(extension.account.currentBalance("ETH")).toContainText(
      expectedUpdatedBalance,
    )
    const balance = await extension.account.currentBalance("ETH").innerText()
    expect(parseFloat(balance)).toBeLessThan(assets[0].balance)
  })

  test.skip("User should be able to send funds to starknet id", async ({
    extension,
  }) => {
    const { accountNames } = await extension.setupWallet({
      accountsToSetup: [{ assets }],
    })
    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: accountNames![0],
      recipientAddress: "qateste2e.stark",
      token: "ETH",
      amount: "MAX",
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
