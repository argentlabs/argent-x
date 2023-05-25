import { expect } from "@playwright/test"

import test from "../test"

test.describe("Send MAX funds", () => {
  const otherAccount =
    "0x02c786C7b4708b476a3a7c012922e6C3a161096F71EC694D61b590dbD4051Faf"
  const setupWallet = async (extension: any) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectNetwork("Localhost 5050")
    const [accountName1, accountAddress1] = await extension.account.addAccount(
      {},
    )
    const [accountName2, accountAddress2] = await extension.account.addAccount({
      firstAccount: false,
    })
    if (!accountName1 || !accountName2 || !accountAddress2) {
      throw new Error("Invalid account names")
    }
    await extension.account.ensureAsset(accountName1, "ETH", "1.0")
    await extension.account.ensureAsset(accountName2, "ETH", "1.0")

    return { accountName1, accountAddress1, accountName2, accountAddress2 }
  }

  test("send MAX funds to other self account", async ({ extension }) => {
    const { accountName1, accountName2, accountAddress2 } = await setupWallet(
      extension,
    )
    await extension.account.transfer({
      originAccountName: accountName1,
      recepientAddress: accountAddress2,
      tokenName: "Ethereum",
      amount: "MAX",
    })
    await extension.activity.checkActivity(1)
    await extension.navigation.menuTokens.click()
    await expect(
      extension.navigation.menuPendingTransationsIndicator,
    ).not.toBeVisible()
    await expect(extension.account.currentBalance("ETH")).toContainText(
      "0.0023",
    )

    await extension.account.token("Ethereum").click()
    await expect(extension.account.balance).toContainText("0.0023")
    await extension.account.back.click()
    await extension.account.ensureSelectedAccount(accountName2)
    await extension.account.token("Ethereum").click()
    await expect(extension.account.balance).toContainText("1.9965")
    await extension.account.back.click()
    await expect(extension.account.currentBalance("ETH")).toContainText("1.9")
  })

  test("send MAX funds to other wallet/account", async ({ extension }) => {
    const { accountName1 } = await setupWallet(extension)

    await extension.account.transfer({
      originAccountName: accountName1,
      recepientAddress: otherAccount,
      tokenName: "Ethereum",
      amount: "MAX",
    })
    await extension.activity.checkActivity(1)
    await extension.navigation.menuTokens.click()
    await expect(
      extension.navigation.menuPendingTransationsIndicator,
    ).not.toBeVisible()
    await expect(extension.account.currentBalance("ETH")).toContainText(
      "0.0023",
    )

    await extension.account.token("Ethereum").click()
    await expect(extension.account.balance).toContainText("0.0023")
  })
})
