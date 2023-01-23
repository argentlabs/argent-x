import { expect } from "@playwright/test"

import { extension, test } from "../test"

test.describe("Send max tokens", () => {
  test("send max eth flow", async () => {
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
      ammount: "MAX",
    })

    await extension.account.token("Ethereum").click()
    await expect(extension.account.balance).toContainText("0.00")
    await extension.account.back.click()
    await extension.account.ensureAccount(accountName2)
    await extension.account.token("Ethereum").click()
    await expect(extension.account.balance).toContainText("1.9")
    await extension.account.back.click()

    //@TODO https://argent.atlassian.net/browse/BLO-670
    /*
        const updatedAssetsAccoun1 = await extension.account.assets(accountName1)
        const updatedAssetsAccoun2 = await extension.account.assets(accountName2)
    
        await Promise.all([
          expect(
            updatedAssetsAccoun1.find((el) => (el.name = "Ethereum"))?.balance,
          ).toContain(0.00),
          expect(
            updatedAssetsAccoun2.find((el) => (el.name = "Ethereum"))?.balance,
          ).toContain(1.9),
        ])
      */
    await extension.resetExtension()
  })
})
