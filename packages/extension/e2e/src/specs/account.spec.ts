import { expect } from "@playwright/test"

import test from "../test"

test.describe("Accounts", () => {
  test("user should be able to create more then 30 accounts", async ({
    extension,
  }) => {
    //setup wallet 1
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    await extension.account.addAccount({})
    for (let idx = 2; idx < 32; idx++) {
      const [accountName, accountAddress] = await extension.account.addAccount({
        firstAccount: false,
      })
      console.log(accountName, accountAddress)

      if (accountName && accountAddress) {
        await extension.account.transfer({
          originAccountName: accountName,
          recepientAddress: accountAddress,
          tokenName: "Ethereum",
          amount: "MAX",
        })
      }
    }
  })
})
