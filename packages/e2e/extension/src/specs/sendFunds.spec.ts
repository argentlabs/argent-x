import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"

test.describe("Send funds", () => {
  test("send MAX funds to other self account", async ({ extension }) => {
    const { accountAddresses } = await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.01 }, { initialBalance: 0 }],
    })
    await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: accountAddresses[1],
      tokenName: "Ethereum",
      amount: "MAX",
      submit: false,
    })

    await extension.validateTx(accountAddresses[1])
    await extension.navigation.menuTokens.click()

    //ensure that balance is updated
    await expect(extension.account.currentBalance("Ethereum")).toContainText(
      "0.00",
    )
    let balance = await extension.account.currentBalance("Ethereum").innerText()
    expect(parseFloat(balance)).toBeLessThan(0.01)

    await extension.account.ensureSelectedAccount(
      extension.account.accountName2,
    )
    await expect(extension.account.currentBalance("Ethereum")).toContainText(
      "0.01",
    )
    balance = await extension.account.currentBalance("Ethereum").innerText()
    expect(parseFloat(balance)).toBeGreaterThan(0.0001)
  })

  test("send MAX funds to other wallet/account", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.002 }],
    })

    await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: config.destinationAddress!,
      tokenName: "Ethereum",
      amount: "MAX",
      submit: false,
    })

    await extension.validateTx(config.destinationAddress!)
    await extension.navigation.menuTokens.click()

    //ensure that balance is updated
    await expect(extension.account.currentBalance("Ethereum")).toContainText(
      "0.000",
    )
    const balance = await extension.account
      .currentBalance("Ethereum")
      .innerText()
    expect(parseFloat(balance)).toBeLessThan(0.002)
  })

  test("send partial funds to other self account", async ({ extension }) => {
    const { accountAddresses } = await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.01 }, { initialBalance: 0 }],
    })
    await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: accountAddresses[1],
      tokenName: "Ethereum",
      amount: 0.005,
      submit: false,
    })
    await extension.validateTx(accountAddresses[1])
    await extension.navigation.menuTokens.click()

    //ensure that balance is updated
    await expect(extension.account.currentBalance("Ethereum")).toContainText(
      "0.00",
    )
    const balance = await extension.account
      .currentBalance("Ethereum")
      .innerText()
    expect(parseFloat(balance)).toBeLessThan(0.01)

    await extension.account.ensureSelectedAccount(
      extension.account.accountName2,
    )
    await expect(extension.account.currentBalance("Ethereum")).toContainText(
      "0.005",
    )
  })

  test("send partial funds to other wallet/account", async ({ extension }) => {
    await extension.setupWallet({ accountsToSetup: [{ initialBalance: 0.01 }] })
    await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: config.destinationAddress!,
      tokenName: "Ethereum",
      amount: 0.005,
      fillRecipientAddress: "typing",
      submit: false,
    })
    await extension.validateTx(config.destinationAddress!)
    await extension.navigation.menuTokens.click()

    //ensure that balance is updated
    await expect(extension.account.currentBalance("Ethereum")).toContainText(
      "0.00",
    )
    const balance = await extension.account
      .currentBalance("Ethereum")
      .innerText()
    expect(parseFloat(balance)).toBeLessThan(0.01)

    //send back remaining funds
    await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: config.destinationAddress!,
      tokenName: "Ethereum",
      amount: "MAX",
    })
  })

  test("User should be able to send funds to starknet id", async ({
    extension,
  }) => {
    await extension.setupWallet({ accountsToSetup: [{ initialBalance: 0.01 }] })

    await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: "e2e-test.stark",
      tokenName: "Ethereum",
      amount: "MAX",
      submit: false,
    })
    await extension.validateTx(config.account1Seed3!)
  })
})
