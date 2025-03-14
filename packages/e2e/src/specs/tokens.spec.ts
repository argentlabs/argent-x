import { expect } from "@playwright/test"

import test from "../test"
import { requestFunds } from "../utils"

const usdcAmount = "0.000002"
const ethAmount = "0.00000001"
test.describe("Tokens", { tag: "@tx" }, () => {
  test("Token should be auto discovered", async ({ extension }) => {
    const { accountAddresses } = await extension.setupWallet({
      accountsToSetup: [{ assets: [{ token: "ETH", balance: +ethAmount }] }],
    })

    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("ETH")).toHaveText(
        `${ethAmount} ETH`,
      ),
      expect(extension.account.currentBalance("USDC")).toBeHidden(),
    ])

    await requestFunds(accountAddresses[0], +usdcAmount, "USDC")
    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("ETH")).toHaveText(
        `${ethAmount} ETH`,
      ),
      expect(extension.account.currentBalance("STRK")).toHaveText("0.0 STRK"),
      expect(extension.account.currentBalance("USDC")).toHaveText(
        `${usdcAmount} USDC`,
        { timeout: 180 * 1000 },
      ),
    ])
  })
})
