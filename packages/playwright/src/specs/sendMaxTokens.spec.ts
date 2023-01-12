import { expect } from "@playwright/test"

import { extension, test } from "../test"

test.describe("Send max tokens", () => {
  test("send max eth flow", async () => {
    // disable page transitions so we don't need to wait for elements to settle
    await extension.page.emulateMedia({ reducedMotion: "reduce" })
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
    const assetsAccount2 = await extension.account.assets(accountName2)
    const assetsAccount1 = await extension.account.assets(accountName1)
    await Promise.all([
      expect(assetsAccount1.find((el) => (el.name = "Ethereum"))?.balance).toBe(
        1,
      ),
      expect(assetsAccount2.find((el) => (el.name = "Ethereum"))?.balance).toBe(
        1,
      ),
    ])

    await extension.account.transfer({
      originAccountName: accountName1,
      recepientAddress: accountAddress2,
      tokenName: "Ethereum",
      ammount: "MAX",
    })
    await extension.account.ensureTokenBalance({
      accountName: accountName1,
      token: "Ethereum",
      balance: 0.0048,
    })
    await extension.account.ensureTokenBalance({
      accountName: accountName2,
      token: "Ethereum",
      balance: 1.994,
    })

    const updatedAssetsAccoun1 = await extension.account.assets(accountName1)
    const updatedAssetsAccoun2 = await extension.account.assets(accountName2)

    await Promise.all([
      expect(
        updatedAssetsAccoun1.find((el) => (el.name = "Ethereum"))?.balance,
      ).toBe(0.0048),
      expect(
        updatedAssetsAccoun2.find((el) => (el.name = "Ethereum"))?.balance,
      ).toBe(1.994),
    ])
  })
})
