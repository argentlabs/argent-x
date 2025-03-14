import { expect } from "@playwright/test"
import { FeeTokens, TokenSymbol } from "../utils"
import test from "../test"

const testParams = [
  {
    feeToken: "STRK",
    swapAmount: 0.1,
    deployed: false,
    ethAmount: 0.11,
    strkAmount: 0.05,
  },
  {
    feeToken: "STRK",
    swapAmount: 0.1,
    deployed: true,
    ethAmount: 0.11,
    strkAmount: 0.05,
  },
  {
    feeToken: "STRK",
    swapAmount: "MAX",
    deployed: false,
    ethAmount: 0.11,
    strkAmount: 0.05,
  },
  {
    feeToken: "STRK",
    swapAmount: "MAX",
    deployed: true,
    ethAmount: 0.11,
    strkAmount: 0.05,
  },
  {
    feeToken: "ETH",
    swapAmount: 0.1,
    deployed: false,
    ethAmount: 0.11,
    strkAmount: 0,
  },
  {
    feeToken: "ETH",
    swapAmount: 0.1,
    deployed: true,
    ethAmount: 0.11,
    strkAmount: 0,
  },
  {
    feeToken: "ETH",
    swapAmount: "MAX",
    deployed: false,
    ethAmount: 0.11,
    strkAmount: 0,
  },
  {
    feeToken: "ETH",
    swapAmount: "MAX",
    deployed: true,
    ethAmount: 0.11,
    strkAmount: 0,
  },
]
const receiveToken = "DAI"
const payToken = "ETH"
testParams.forEach((params) => {
  test.describe.skip(`Swap tests`, () => {
    test(`Swap ETH to DAI, using ${params.feeToken} as fee token, amount ${params.swapAmount}, deployed account ${params.deployed}`, async ({
      extension,
    }) => {
      const assets = [
        { token: "ETH" as TokenSymbol, balance: params.ethAmount },
      ]
      if (params.strkAmount > 0) {
        assets.push({
          token: "STRK" as TokenSymbol,
          balance: params.strkAmount,
        })
      }
      const { accountNames } = await extension.setupWallet({
        accountsToSetup: [
          {
            assets,
            deploy: params.deployed,
            feeToken: params.feeToken as FeeTokens,
          },
        ],
      })
      await extension.account.ensureSelectedAccount(accountNames![0])
      await extension.navigation.menuSwapsLocator.click()
      const swappedAmount = await extension.swap.swapTokens({
        payToken,
        receiveToken,
        amount: params.swapAmount as number | "MAX",
        alreadyDeployed: params.deployed,
      })
      if (!swappedAmount) {
        throw new Error("swappedAmount is undefined")
      }
      await expect(
        extension.activity.menuPendingTransactionsIndicatorLocator,
      ).toBeVisible()

      await expect(
        extension.activity.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden()

      await extension.navigation.menuTokensLocator.click()
      await expect(extension.account.currentBalance(receiveToken)).toBeVisible()

      const balance = await extension.account
        .currentBalance(payToken)
        .innerText()
      expect(parseFloat(balance)).toBeLessThan(params.ethAmount)
    })
  })
})
