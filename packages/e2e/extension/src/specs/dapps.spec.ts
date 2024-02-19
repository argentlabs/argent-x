import { expect } from "@playwright/test"

import test from "../test"
import { lang } from "../languages"

test.describe("Dapps", () => {
  test("connect from starknet.id", async ({ extension, browserContext }) => {
    //setup wallet
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://goerli.app.starknet.id",
    )
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    //check connect dapps
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.connectedDapps.click()
    await expect(
      extension.dapps.connectedDapps(extension.account.accountName1, 1),
    ).toBeVisible()
    await extension.dapps.account(extension.account.accountName1).click()
    await expect(
      extension.dapps.connected("https://goerli.app.starknet.id"),
    ).toBeVisible()
    //disconnect dapp from ArgentX
    await extension.dapps.disconnect("https://goerli.app.starknet.id").click()
    await expect(
      extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
    ).toBeHidden()
    await expect(extension.dapps.noConnectedDapps.first()).toBeVisible()
  })

  test("connect from testDapp", async ({ extension, browserContext }) => {
    //setup wallet
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://dapp-argentlabs.vercel.app",
    )
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    //check connect dapps
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.connectedDapps.click()
    await expect(
      extension.dapps.connectedDapps(extension.account.accountName1, 1),
    ).toBeVisible()
    await extension.dapps.account(extension.account.accountName1).click()
    await expect(
      extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
    ).toBeVisible()
    //disconnect dapp from ArgentX
    await extension.dapps
      .disconnect("https://dapp-argentlabs.vercel.app")
      .click()
    await expect(
      extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
    ).toBeHidden()
    await expect(extension.dapps.noConnectedDapps.first()).toBeVisible()
  })

  test("reset all connections", async ({ extension, browserContext }) => {
    //setup wallet
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://goerli.app.starknet.id",
    )
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://dapp-argentlabs.vercel.app",
    )
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.connectedDapps.click()
    await expect(
      extension.dapps.connectedDapps(extension.account.accountName1, 2),
    ).toBeVisible()
    await extension.dapps.account(extension.account.accountName1).click()

    await Promise.all([
      expect(
        extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
      ).toBeVisible(),
      expect(
        extension.dapps.connected("https://goerli.app.starknet.id"),
      ).toBeVisible(),
    ])

    await extension.dapps.disconnectAll().click()
    await Promise.all([
      expect(
        extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
      ).toBeHidden(),
      expect(
        extension.dapps.connected("https://goerli.app.starknet.id"),
      ).toBeHidden(),
    ])
    await expect(extension.dapps.noConnectedDapps.first()).toBeVisible()
  })

  test("disconnect only one connected dapp", async ({
    extension,
    browserContext,
  }) => {
    //setup wallet
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://goerli.app.starknet.id",
    )
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://dapp-argentlabs.vercel.app",
    )
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.connectedDapps.click()
    await expect(
      extension.dapps.connectedDapps(extension.account.accountName1, 2),
    ).toBeVisible()
    await extension.dapps.account(extension.account.accountName1).click()

    await Promise.all([
      expect(
        extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
      ).toBeVisible(),
      expect(
        extension.dapps.connected("https://goerli.app.starknet.id"),
      ).toBeVisible(),
    ])

    await extension.dapps
      .disconnect("https://dapp-argentlabs.vercel.app")
      .click()
    await Promise.all([
      expect(
        extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
      ).toBeHidden(),
      expect(
        extension.dapps.connected("https://goerli.app.starknet.id"),
      ).toBeVisible(),
    ])
    await extension.navigation.backLocator.click()
    await expect(
      extension.dapps.connectedDapps(extension.account.accountName1, 1),
    ).toBeVisible()
  })

  test("connect dapps by account", async ({ extension, browserContext }) => {
    //setup wallet
    await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "ETH", balance: 0 }] },
        { assets: [{ token: "ETH", balance: 0 }] },
      ],
    })

    await extension.open()
    await extension.account.selectAccount(extension.account.accountName1)

    await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://goerli.app.starknet.id",
    )
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await extension.account.selectAccount(extension.account.accountName2)
    await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://dapp-argentlabs.vercel.app",
    )
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.connectedDapps.click()
    await Promise.all([
      expect(
        extension.dapps.connectedDapps(extension.account.accountName1, 1),
      ).toBeVisible(),
      expect(
        extension.dapps.connectedDapps(extension.account.accountName2, 1),
      ).toBeVisible(),
    ])

    await extension.dapps.account(extension.account.accountName1).click()
    await Promise.all([
      expect(
        extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
      ).toBeHidden(),
      expect(
        extension.dapps.connected("https://goerli.app.starknet.id"),
      ).toBeVisible(),
    ])

    await extension.navigation.backLocator.click()
    await extension.dapps.account(extension.account.accountName2).click()
    await Promise.all([
      expect(
        extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
      ).toBeVisible(),
      expect(
        extension.dapps.connected("https://goerli.app.starknet.id"),
      ).toBeHidden(),
    ])
  })

  test("try sign a message using testDapp with a non deployed account", async ({
    extension,
    browserContext,
  }) => {
    //setup wallet
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    const dapp = await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://dapp-argentlabs.vercel.app",
    )
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await dapp.locator('[id="short-text"]').fill("Test message!")
    await dapp.locator('button:text-is("Sign")').click()
    await expect(
      extension.page.locator(
        `button:text-is("${lang.account.activateAccount}")`,
      ),
    ).toBeVisible()
    await extension.page
      .locator(`button:text-is("${lang.account.activateAccount}")`)
      .click()
    await expect(
      extension.page.locator(`text="${lang.account.notEnoughFoundsFee}"`),
    ).toBeVisible()
  })

  test("sign message using testDapp with a deployed account", async ({
    extension,
    browserContext,
  }) => {
    //setup wallet
    await extension.setupWallet({
      accountsToSetup: [
        { assets: [{ token: "ETH", balance: 0.001 }], deploy: true },
      ],
    })
    await extension.open()
    const dapp = await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://dapp-argentlabs.vercel.app",
    )
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await dapp.locator('[id="short-text"]').fill("Test message!")
    await dapp.locator('button:text-is("Sign")').click()
    await expect(
      extension.page.locator(
        '//p[text()="Message"]//following::p[text()="Test message!"]',
      ),
    ).toBeVisible()
    await extension.page.locator('[id="Sign"]').click()
  })

  test("connect to dapp flagged as critical", async ({
    extension,
    browserContext,
  }) => {
    //setup wallet
    await extension.setupWallet({
      accountsToSetup: [{ assets: [{ token: "ETH", balance: 0 }] }],
    })
    await extension.open()

    await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://starknetkit-blacked-listed.vercel.app",
    )
    await extension.dapps.checkCriticalRiskConnectionScreen()
    await extension.dapps.acceptCriticalRiskConnection()
    await extension.dapps.accept.click()
    //https://argent.atlassian.net/browse/BLO-1939
    // await extension.dapps.connectedDappsTooltip("https://starknetkit-blacked-listed.vercel.app")
  })
})
