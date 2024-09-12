import { expect } from "@playwright/test"

import test from "../test"
import { transferTokens } from "../../../shared/src/assets"

test.describe.skip("Tokens", () => {
  test("Token should be auto discovered", async ({ extension }) => {
    const { accountAddresses } = await extension.setupWallet({
      accountsToSetup: [{ assets: [{ token: "ETH", balance: 0.00000001 }] }],
    })

    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("ETH")).toHaveText(
        "0.00000001 ETH",
      ),
      expect(extension.account.currentBalance("WBTC")).toBeHidden(),
    ])

    await transferTokens(0.00000002, accountAddresses[0], "WBTC")

    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("ETH")).toHaveText(
        "0.00000001 ETH",
      ),
      expect(extension.account.currentBalance("WBTC")).toHaveText(
        "0.00000002 WBTC",
        { timeout: 180 * 1000 },
      ),
    ])
  })
})
