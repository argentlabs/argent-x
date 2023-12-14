import { expect } from "@playwright/test"

import test from "../test"
import { expireBESession } from "../utils/common"
import { v4 as uuid } from "uuid"
import config from "../config"

const generateEmail = () => `e2e_2fa_${uuid()}@mail.com`

test.describe("2FA", () => {
  test("User should not be able to enable 2FA for a non deployed account", async ({
    extension,
  }) => {
    await extension.setupWallet({ accountsToSetup: [{ initialBalance: 0 }] })
    await extension.navigation.showSettings.click()
    await extension.settings.account(extension.account.accountName1).click()
    await extension.settings.argentShield().first().click()
    await expect(extension.account.deployNeededWarning).toBeVisible()
  })

  test("User should be able to enable 2FA and transfer funds", async ({
    extension,
  }) => {
    const email = generateEmail()
    await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.002, deploy: true }],
    })
    await extension.activate2fa(extension.account.accountName1, email)
    await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: config.senderAddr!,
      tokenName: "Ethereum",
      amount: "MAX",
    })
    await extension.activity.checkActivity(1)
  })

  test("Recover wallet with 2FA, authentication needed before create a TX", async ({
    extension,
  }) => {
    const email = generateEmail()
    const { seed } = await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.002, deploy: true }],
    })
    await extension.activate2fa(extension.account.accountName1, email)

    await extension.resetExtension()
    await extension.recoverWallet(seed)

    await extension.account.token("Ethereum").click()
    await extension.account.fillRecipientAddress({
      recipientAddress: config.senderAddr!,
    })
    await extension.account.email.fill(email)
    await extension.navigation.next.first().click()
    await extension.account.fillPin("111111")
    await Promise.all([
      expect(extension.account.balance).toBeVisible(),
      expect(extension.account.sendMax).toBeVisible(),
    ])
    await extension.account.sendMax.click()
    await extension.account.reviewSend.click()
    await extension.account.confirm.click()
    await extension.activity.checkActivity(1)
  })

  test("Session expired, authentication needed before create a TX", async ({
    extension,
  }) => {
    const email = generateEmail()
    await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.002, deploy: true }],
    })
    await extension.activate2fa(extension.account.accountName1, email)
    await expireBESession(email)
    await extension.account.token("Ethereum").click()
    await extension.account.fillRecipientAddress({
      recipientAddress: config.senderAddr!,
    })
    await extension.account.fillPin("111111")
    await Promise.all([
      expect(extension.account.balance).toBeVisible(),
      expect(extension.account.sendMax).toBeVisible(),
    ])
    await extension.account.sendMax.click()
    await extension.account.reviewSend.click()
    await extension.account.confirm.click()
    await extension.activity.checkActivity(1)
  })
})
