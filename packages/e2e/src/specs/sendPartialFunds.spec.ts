import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"
import { TokenSymbol } from "../utils"

const ethInitialBalance = 0.01 * Number(config.initialBalanceMultiplier)

for (const feeToken of ["STRK", "ETH"] as const) {
  test.describe(`Send partial funds fee ${feeToken}`, { tag: "@tx" }, () => {
    test.skip(
      (feeToken === "STRK" && config.useStrkAsFeeToken === "false") ||
        config.skipTXTests === "true",
    )
    test.slow()
    const assets =
      feeToken === "STRK"
        ? [
            { token: "ETH" as TokenSymbol, balance: ethInitialBalance },
            { token: "STRK" as TokenSymbol, balance: 2 },
          ]
        : [
            { token: "ETH" as TokenSymbol, balance: ethInitialBalance },
            { token: "STRK" as TokenSymbol, balance: 0.001 },
          ]
    test("send partial funds to other self account", async ({ extension }) => {
      const { accountAddresses } = await extension.setupWallet({
        accountsToSetup: [
          {
            assets,
          },
          { assets: [{ token: "ETH", balance: 0 }] },
        ],
      })
      const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
        originAccountName: extension.account.accountName1,
        recipientAddress: accountAddresses[1],
        token: "ETH",
        amount: 0.005,
        feeToken,
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
        "0.00",
      )
      const balance = await extension.account.currentBalance("ETH").innerText()
      expect(parseFloat(balance)).toBeLessThan(0.01)

      await extension.account.ensureSelectedAccount(
        extension.account.accountName2,
      )
      await expect(extension.account.currentBalance("ETH")).toContainText(
        "0.005",
      )
    })

    test("send partial funds to other wallet/account", async ({
      extension,
    }) => {
      await extension.setupWallet({
        accountsToSetup: [{ assets }],
      })
      const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
        originAccountName: extension.account.accountName1,
        recipientAddress: config.destinationAddress!,
        token: "ETH",
        amount: 0.005,
        fillRecipientAddress: "typing",
        feeToken,
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
        "0.00",
      )
      const balance = await extension.account.currentBalance("ETH").innerText()
      expect(parseFloat(balance)).toBeLessThan(0.01)

      //send back remaining funds
      await extension.account.transfer({
        originAccountName: extension.account.accountName1,
        recipientAddress: config.destinationAddress!,
        token: "ETH",
        amount: "MAX",
        feeToken,
      })
    })

    test("User should be able to send funds to starknet id", async ({
      extension,
    }) => {
      await extension.setupWallet({
        accountsToSetup: [{ assets }],
      })
      const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
        originAccountName: extension.account.accountName1,
        recipientAddress: "qateste2e.stark",
        token: "ETH",
        amount: 0.009,
        feeToken,
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
}