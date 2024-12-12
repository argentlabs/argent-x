import { expect } from "@playwright/test"

import test from "../test"
import { expireBESession, generateEmail } from "../utils"
import config from "../config"

const ethInitialBalance = 0.002 * Number(config.initialBalanceMultiplier)

test.describe("Smart Account", { tag: "@tx" }, () => {
  test.slow()
  test.skip(config.skipTXTests === "true")

  test("User should be able to setup a wallet with a smart account", async ({
    extension,
  }) => {
    const email = generateEmail()
    await extension.setupWallet({
      email,
      accountsToSetup: [
        {
          assets: [{ token: "ETH", balance: ethInitialBalance }],
          deploy: true,
        },
        { assets: [{ token: "ETH", balance: 0 }] },
      ],
    })

    await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: "MAX",
    })
    //todo  check activity
    //await extension.activity.checkActivity(1)
    await extension.activity.ensureNoPendingTransactions()

    //other accounts should have independent Argent Shield
    await extension.account.ensureSmartAccountNotEnabled(
      extension.account.accountName2,
    )
  })

  test("User should be able to upgrade/downgrade all accounts to smart account", async ({
    extension,
  }) => {
    const email = generateEmail()
    await extension.setupWallet({
      email,
      accountsToSetup: [
        {
          assets: [{ token: "ETH", balance: ethInitialBalance }],
          deploy: true,
        },
        {
          assets: [{ token: "ETH", balance: ethInitialBalance }],
          deploy: true,
        },
      ],
    })

    await extension.activateSmartAccount({
      accountName: extension.account.accountName2,
      email,
      validSession: true,
    })

    await extension.changeToStandardAccount({
      accountName: extension.account.accountName1,
      email,
      validSession: true,
    })
    await extension.navigation.backLocator.click()
    await extension.navigation.closeLocator.click()
    await extension.changeToStandardAccount({
      accountName: extension.account.accountName2,
      email,
      validSession: true,
    })
  })

  test("Session expired, authentication needed before create a TX", async ({
    extension,
  }) => {
    const email = generateEmail()
    await extension.setupWallet({
      email,
      accountsToSetup: [
        {
          assets: [{ token: "ETH", balance: ethInitialBalance }],
          deploy: true,
        },
      ],
    })

    await expireBESession(email)
    await extension.account.send.click()
    await extension.account.fillRecipientAddress({
      recipientAddress: config.destinationAddress!,
    })

    await extension.account.fillPin()
    await Promise.all([
      expect(extension.account.balance).toBeVisible(),
      expect(extension.account.sendMax).toBeVisible(),
    ])
    await extension.account.sendMax.click()
    await extension.account.reviewSendLocator.click()
    await extension.account.confirmTransaction()
    //todo: check activity
    // await extension.activity.checkActivity(1)
  })

  test("Try to setup a wallet with smart account with an email already in use", async ({
    extension,
  }) => {
    await extension.setupWallet({
      email: "registeredemail@argent.xyz",
      success: false,
      accountsToSetup: [
        {
          assets: [{ token: "ETH", balance: ethInitialBalance }],
          deploy: true,
        },
      ],
    })
  })

  test("Recover a wallet which has smart account, downgrade, restore account, user should be able to TX without email/code", async ({
    extension,
  }) => {
    const email = generateEmail()
    const { seed } = await extension.setupWallet({
      email,
      accountsToSetup: [
        {
          assets: [{ token: "ETH", balance: ethInitialBalance }],
          deploy: true,
        },
        { assets: [{ token: "ETH", balance: 0 }] },
      ],
    })

    await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: 0.00001,
    })

    await extension.activity.ensureNoPendingTransactions()

    await extension.resetExtension()
    await extension.recoverWallet(seed)
    await extension.changeToStandardAccount({
      accountName: extension.account.accountName1,
      email,
      validSession: false,
    })
    await extension.navigation.backLocator.click()
    await extension.navigation.closeLocator.click()
    await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: "MAX",
    })
    await extension.activity.ensureNoPendingTransactions()
  })
})
