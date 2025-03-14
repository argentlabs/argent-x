import { expect } from "@playwright/test"

import test from "../test"
import { expireBESession } from "../utils"
import { v4 as uuid } from "uuid"
import config from "./../config"
import { lang } from "../languages"

const generateEmail = () => `e2e_2fa_${uuid()}@mail.com`
const strkInitialBalance = "2.0"

test.describe("Default account to Smart Account", { tag: "@tx" }, () => {
  test.skip(config.skipTXTests === "true")
  test("User should not be able to upgrade to smart account for a non deployed account", async ({
    extension,
  }) => {
    const { accountNames } = await extension.setupWallet({
      accountsToSetup: [{ assets: [{ token: "STRK", balance: 0 }] }],
    })
    const accountName1 = accountNames![0]
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.account(accountName1).click()
    await extension.settings.smartAccountButton.click()
    await expect(extension.account.deployNeededWarning).toBeVisible()
  })

  test("User should be able to upgrade to smart account and transfer funds", async ({
    extension,
  }) => {
    const email = generateEmail()
    const { accountNames } = await extension.setupWallet({
      accountsToSetup: [
        {
          assets: [{ token: "STRK", balance: strkInitialBalance }],
          deploy: true,
        },
        { assets: [{ token: "STRK", balance: 0 }] },
      ],
    })
    const accountName1 = accountNames![0]
    const accountName2 = accountNames![1]
    await extension.activateSmartAccount({
      accountName: accountName1,
      email,
    })
    await extension.account.transfer({
      originAccountName: accountName1,
      recipientAddress: config.destinationAddress!,
      token: "STRK",
      amount: "MAX",
    })
    //todo: check activity
    // await extension.activity.checkActivity(1)
    await extension.activity.ensureNoPendingTransactions()
    //await extension.navigation.menuTokensLocator.click()

    //other accounts should have independent Argent Shield
    await extension.account.ensureSmartAccountNotEnabled(accountName2)
  })

  test("User should be able to upgrade/downgrade all accounts to smart account", async ({
    extension,
  }) => {
    const email = generateEmail()
    const { accountNames } = await extension.setupWallet({
      accountsToSetup: [
        {
          assets: [{ token: "STRK", balance: strkInitialBalance }],
          deploy: true,
        },
        {
          assets: [{ token: "STRK", balance: strkInitialBalance }],
          deploy: true,
        },
      ],
    })
    const accountName1 = accountNames![0]
    const accountName2 = accountNames![1]
    await extension.activateSmartAccount({
      accountName: accountName1,
      email,
    })
    await extension.activateSmartAccount({
      accountName: accountName2,
      email,
      validSession: true,
    })

    await extension.changeToStandardAccount({
      accountName: accountName1,
      email,
      validSession: true,
    })
    await extension.navigation.backLocator.click()
    await extension.navigation.closeLocator.click()
    await extension.changeToStandardAccount({
      accountName: accountName2,
      email,
      validSession: true,
    })
  })

  test("Recover wallet smart account, authentication needed before create a TX", async ({
    extension,
  }) => {
    await extension.recoverWallet(config.senderSeed!)
    await extension.account.ensureSelectedAccount("Humble Hotdog")
    await extension.account.send.click()
    await extension.account.fillRecipientAddress({
      recipientAddress: config.destinationAddress!,
    })
    await extension.account.email.fill(config.guardianEmail!)
    await extension.navigation.nextLocator.first().click()
    await extension.account.fillPin()
    await extension.account.selectTokenButton.click()
    await extension.account.token("STRK").click()
    await Promise.all([
      expect(extension.account.balance).toBeVisible(),
      expect(extension.account.sendMax).toBeVisible(),
    ])
    await extension.account.amount.fill("0.0001")
    await extension.account.reviewSendLocator.click()
    await expect(extension.navigation.confirmLocator).toBeEnabled()
  })

  test("Session expired, authentication needed before create a TX", async ({
    extension,
  }) => {
    const email = generateEmail()
    const { accountNames } = await extension.setupWallet({
      accountsToSetup: [
        {
          assets: [{ token: "STRK", balance: strkInitialBalance }],
          deploy: true,
        },
      ],
    })
    const accountName1 = accountNames![0]

    await extension.activateSmartAccount({
      accountName: accountName1,
      email,
    })
    await expireBESession(email)
    await extension.account.send.click()
    await extension.account.fillRecipientAddress({
      recipientAddress: config.destinationAddress!,
    })
    await extension.account.fillPin()
    await extension.account.selectTokenButton.click()
    await extension.account.token("STRK").click()
    await Promise.all([
      expect(extension.account.balance).toBeVisible(),
      expect(extension.account.sendMax).toBeVisible(),
    ])
    await extension.account.sendMax.click()
    await extension.account.reviewSendLocator.click()
    await extension.account.confirmTransaction()
    //todo: check activity
    //await extension.activity.checkActivity(1)
  })

  test("Try to upgrade to smart account with an email already in use", async ({
    extension,
  }) => {
    const { accountNames } = await extension.setupWallet({
      accountsToSetup: [
        {
          assets: [{ token: "STRK", balance: strkInitialBalance }],
          deploy: true,
        },
      ],
    })
    const accountName1 = accountNames![0]
    await extension.account.ensureSelectedAccount(accountName1)
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.account(accountName1).click()
    await extension.settings.smartAccountButton.click()
    await extension.navigation.nextLocator.click()
    await extension.account.email.fill("registeredemail@argent.xyz")
    await extension.navigation.nextLocator.first().click()
    await extension.account.fillPin()
    await expect(
      extension.page.getByText(lang.account.argentShield.emailInUse),
    ).toBeVisible()
  })

  test("Verify error message when user insert wrong code 3 times", async ({
    extension,
  }) => {
    const { accountNames } = await extension.setupWallet({
      accountsToSetup: [
        {
          assets: [{ token: "STRK", balance: strkInitialBalance }],
          deploy: true,
        },
      ],
    })

    const accountName1 = accountNames![0]
    const email = generateEmail()
    await extension.account.ensureSelectedAccount(accountName1)
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.account(accountName1).click()
    await extension.settings.smartAccountButton.click()
    await extension.navigation.nextLocator.click()
    await extension.account.email.fill(email)
    await extension.navigation.nextLocator.first().click()
    await extension.account.fillPin("222222")
    await expect(
      extension.page.getByText(lang.account.argentShield.wrongCode),
    ).toBeVisible()
    await extension.page.locator('input[data-index="5"]').fill("3")
    await extension.page.locator('input[data-index="5"]').fill("4")
    await expect(
      extension.page.getByText(lang.account.argentShield.failedCode),
    ).toBeVisible()
    await extension.page.locator('input[data-index="5"]').fill("5")
    await expect(
      extension.page.getByText(lang.account.argentShield.codeNotRequested),
    ).toBeVisible()
  })
})
