import { expect } from "@playwright/test"

import test from "../test"
import { expireBESession } from "../../../shared/src/common"
import { v4 as uuid } from "uuid"
import config from "../../../shared/config"
import { lang } from "../languages"

const generateEmail = () => `e2e_2fa_${uuid()}@mail.com`

test.describe("2FA", () => {
  test.slow()
  test("User should not be able to enable 2FA for a non deployed account", async ({
    extension,
  }) => {
    await extension.setupWallet({
      accountsToSetup: [{ assets: [{ token: "ETH", balance: 0 }] }],
    })
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.account(extension.account.accountName1).click()
    await extension.settings.argentShield().first().click()
    await expect(extension.account.deployNeededWarning).toBeVisible()
  })

  test("User should be able to enable 2FA and transfer funds", async ({
    extension,
  }) => {
    const email = generateEmail()
    await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "ETH", balance: 0.002 }], deploy: true },
        { assets: [{ token: "ETH", balance: 0 }] },
      ],
    })
    await extension.activate2fa({
      accountName: extension.account.accountName1,
      email,
    })
    await extension.account.transfer({
      originAccountName: extension.account.accountName1,
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: "MAX",
    })
    await extension.activity.checkActivity(1)
    await extension.activity.ensureNoPendingTransactions()
    await extension.navigation.menuTokensLocator.click()

    //other accounts should have independent Argent Shield
    await extension.account.ensure2FANotEnabled(extension.account.accountName2)
  })

  test("User should be able to enable/disable 2FA for all accounts", async ({
    extension,
  }) => {
    const email = generateEmail()
    await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "ETH", balance: 0.001 }], deploy: true },
        { assets: [{ token: "ETH", balance: 0.001 }], deploy: true },
      ],
    })
    await extension.activate2fa({
      accountName: extension.account.accountName1,
      email,
    })
    await extension.activate2fa({
      accountName: extension.account.accountName2,
      email,
      validSession: true,
    })

    await extension.disable2fa({
      accountName: extension.account.accountName1,
      email,
      validSession: true,
    })
    await extension.navigation.backLocator.click()
    await extension.navigation.closeLocator.click()
    await extension.disable2fa({
      accountName: extension.account.accountName2,
      email,
      validSession: true,
    })
  })

  test("Recover wallet with 2FA, authentication needed before create a TX", async ({
    extension,
  }) => {
    const email = generateEmail()
    const { seed } = await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "ETH", balance: 0.002 }], deploy: true },
      ],
    })

    await extension.activate2fa({
      accountName: extension.account.accountName1,
      email,
    })

    await extension.resetExtension()
    await extension.recoverWallet(seed)

    await extension.account.token("ETH").click()
    await extension.account.fillRecipientAddress({
      recipientAddress: config.destinationAddress!,
    })
    await extension.account.email.fill(email)
    await extension.navigation.nextLocator.first().click()
    await extension.account.fillPin("111111")
    await Promise.all([
      expect(extension.account.balance).toBeVisible(),
      expect(extension.account.sendMax).toBeVisible(),
    ])
    await extension.account.sendMax.click()
    await extension.account.reviewSendLocator.click()
    await extension.account.confirmTransaction()
    await extension.activity.checkActivity(1)
  })

  test("Session expired, authentication needed before create a TX", async ({
    extension,
  }) => {
    const email = generateEmail()
    await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "ETH", balance: 0.002 }], deploy: true },
      ],
    })

    await extension.activate2fa({
      accountName: extension.account.accountName1,
      email,
    })
    await expireBESession(email, "argentx")
    await extension.account.token("ETH").click()
    await extension.account.fillRecipientAddress({
      recipientAddress: config.destinationAddress!,
    })
    await extension.account.fillPin("111111")
    await Promise.all([
      expect(extension.account.balance).toBeVisible(),
      expect(extension.account.sendMax).toBeVisible(),
    ])
    await extension.account.sendMax.click()
    await extension.account.reviewSendLocator.click()
    await extension.account.confirmTransaction()
    await extension.activity.checkActivity(1)
  })

  test("Try to activate 2FA with an email already in use", async ({
    extension,
  }) => {
    await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "ETH", balance: 0.001 }], deploy: true },
      ],
    })
    await extension.account.ensureSelectedAccount(
      extension.account.accountName1,
    )
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.account(extension.account.accountName1).click()
    await extension.settings.argentShield().click()
    await extension.navigation.nextLocator.click()
    await extension.account.email.fill("registeredemail@argent.xyz")
    await extension.navigation.nextLocator.first().click()
    await extension.account.fillPin("111111")
    await expect(
      extension.page.getByText(lang.account.argentShield.emailInUse),
    ).toBeVisible()
  })

  test("Verify error message when user insert wrong code 3 times", async ({
    extension,
  }) => {
    await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "ETH", balance: 0.001 }], deploy: true },
      ],
    })
    const email = generateEmail()
    await extension.account.ensureSelectedAccount(
      extension.account.accountName1,
    )
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.account(extension.account.accountName1).click()
    await extension.settings.argentShield().click()
    await extension.navigation.nextLocator.click()
    await extension.account.email.fill(email)
    await extension.navigation.nextLocator.first().click()
    await extension.account.fillPin("222222")
    await expect(
      extension.page.getByText(lang.account.argentShield.wrong2faCode),
    ).toBeVisible()
    await extension.page.locator('input[data-index="5"]').fill("3")
    await extension.page.locator('input[data-index="5"]').fill("4")
    await expect(
      extension.page.getByText(lang.account.argentShield.failed2faCode),
    ).toBeVisible()
    await extension.page.locator('input[data-index="5"]').fill("5")
    await expect(
      extension.page.getByText(lang.account.argentShield.codeNotRequested2fa),
    ).toBeVisible()
  })
})
