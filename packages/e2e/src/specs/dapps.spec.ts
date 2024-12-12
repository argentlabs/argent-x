import { expect } from "@playwright/test"

import test from "../test"
import { lang } from "../languages"
import { sleep } from "../utils"
import config from "../config"

const ethInitialBalance = 0.002 * Number(config.initialBalanceMultiplier)

test.describe("Dapps", () => {
  test(
    "connect from starknet.id",
    { tag: "@prodOnly" },
    async ({ extension, browserContext }) => {
      //setup wallet
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await extension.dapps.requestConnectionFromDapp(
        browserContext,
        "https://app.starknet.id",
      )
      //accept connection from Argent X
      await extension.dapps.accept.click()
      //check connect dapps
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.authorizedDapps.click()
      await expect(
        extension.dapps.connectedDapps(extension.account.accountName1, 1),
      ).toBeVisible()
      await extension.dapps.account(extension.account.accountName1).click()
      await expect(
        extension.dapps.connected("https://app.starknet.id"),
      ).toBeVisible()
      //disconnect dapp from Argent X
      await extension.dapps.disconnect("https://app.starknet.id").click()
      await expect(
        extension.dapps.connected("https://app.starknet.id"),
      ).toBeHidden()
      await expect(extension.dapps.noConnectedDapps.first()).toBeVisible()
    },
  )

  test("connect from testDapp", async ({ extension, browserContext }) => {
    //setup wallet
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://dapp-argentlabs.vercel.app",
    )
    //accept connection from Argent X
    await extension.dapps.accept.click()
    //check connect dapps
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.authorizedDapps.click()
    await expect(
      extension.dapps.connectedDapps(extension.account.accountName1, 1),
    ).toBeVisible()
    await extension.dapps.account(extension.account.accountName1).click()
    await expect(
      extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
    ).toBeVisible()
    //disconnect dapp from Argent X
    await extension.dapps
      .disconnect("https://dapp-argentlabs.vercel.app")
      .click()
    await expect(
      extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
    ).toBeHidden()
    await expect(extension.dapps.noConnectedDapps.first()).toBeVisible()
  })

  test(
    "reset all connections",
    { tag: "@prodOnly" },
    async ({ extension, browserContext }) => {
      //setup wallet
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await extension.dapps.requestConnectionFromDapp(
        browserContext,
        "https://app.starknet.id",
      )
      //accept connection from Argent X
      await extension.dapps.accept.click()
      await extension.dapps.requestConnectionFromDapp(
        browserContext,
        "https://dapp-argentlabs.vercel.app",
      )
      //accept connection from Argent X
      await extension.dapps.accept.click()
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.authorizedDapps.click()
      await expect(
        extension.dapps.connectedDapps(extension.account.accountName1, 2),
      ).toBeVisible()
      await extension.dapps.account(extension.account.accountName1).click()

      await Promise.all([
        expect(
          extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
        ).toBeVisible(),
        expect(
          extension.dapps.connected("https://app.starknet.id"),
        ).toBeVisible(),
      ])

      await extension.dapps.disconnectAll().click()
      await Promise.all([
        expect(
          extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
        ).toBeHidden(),
        expect(
          extension.dapps.connected("https://app.starknet.id"),
        ).toBeHidden(),
      ])
      await expect(extension.dapps.noConnectedDapps.first()).toBeVisible()
    },
  )

  test(
    "disconnect only one connected dapp",
    { tag: "@prodOnly" },
    async ({ extension, browserContext }) => {
      //setup wallet
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await extension.dapps.requestConnectionFromDapp(
        browserContext,
        "https://app.starknet.id",
      )
      //accept connection from Argent X
      await extension.dapps.accept.click()
      await extension.dapps.requestConnectionFromDapp(
        browserContext,
        "https://dapp-argentlabs.vercel.app",
      )
      //accept connection from Argent X
      await extension.dapps.accept.click()
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.authorizedDapps.click()
      await expect(
        extension.dapps.connectedDapps(extension.account.accountName1, 2),
      ).toBeVisible()
      await extension.dapps.account(extension.account.accountName1).click()

      await Promise.all([
        expect(
          extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
        ).toBeVisible(),
        expect(
          extension.dapps.connected("https://app.starknet.id"),
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
          extension.dapps.connected("https://app.starknet.id"),
        ).toBeVisible(),
      ])
      await extension.navigation.backLocator.click()
      await expect(
        extension.dapps.connectedDapps(extension.account.accountName1, 1),
      ).toBeVisible()
    },
  )

  test(
    "connect dapps by account",
    { tag: "@prodOnly" },
    async ({ extension, browserContext }) => {
      //setup wallet
      await extension.setupWallet({
        accountsToSetup: [
          { assets: [{ token: "ETH", balance: 0 }] },
          { assets: [{ token: "ETH", balance: 0 }] },
        ],
      })

      await extension.open()
      await extension.account.selectAccount(extension.account.accountName1)

      const dapp = await extension.dapps.requestConnectionFromDapp(
        browserContext,
        "https://app.starknet.id",
      )
      //accept connection from Argent X
      await extension.dapps.accept.click()
      await dapp.close()
      await extension.account.selectAccount(extension.account.accountName2)
      await extension.dapps.requestConnectionFromDapp(
        browserContext,
        "https://dapp-argentlabs.vercel.app",
      )
      //accept connection from Argent X
      await extension.dapps.accept.click()
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.authorizedDapps.click()
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
          extension.dapps.connected("https://app.starknet.id"),
        ).toBeVisible(),
      ])

      await extension.navigation.backLocator.click()
      await extension.dapps.account(extension.account.accountName2).click()
      await Promise.all([
        expect(
          extension.dapps.connected("https://dapp-argentlabs.vercel.app"),
        ).toBeVisible(),
        expect(
          extension.dapps.connected("https://app.starknet.id"),
        ).toBeHidden(),
      ])
    },
  )

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
    //accept connection from Argent X
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

  test(
    "sign message using testDapp with a deployed account",
    { tag: "@tx" },
    async ({ extension, browserContext }) => {
      //setup wallet
      await extension.setupWallet({
        accountsToSetup: [
          {
            assets: [{ token: "ETH", balance: ethInitialBalance }],
            deploy: true,
          },
        ],
      })
      await extension.open()
      const dapp = await extension.dapps.requestConnectionFromDapp(
        browserContext,
        "https://dapp-argentlabs.vercel.app",
      )
      //accept connection from Argent X
      await extension.dapps.accept.click()
      await dapp.locator('[id="short-text"]').fill("Test message!")
      await dapp.locator('button:text-is("Sign")').click()
      await expect(
        extension.page.locator(
          '//p[text()="Message"]//following::p[text()="Test message!"]',
        ),
      ).toBeVisible()
      await extension.page.locator('[id="Sign"]').click()
    },
  )

  test("connect to dapp flagged as critical", async ({
    extension,
    browserContext,
  }) => {
    //setup wallet
    await extension.wallet.newWalletOnboarding()
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

  test.skip(
    "when changing account, extension should ask user to connect do dapp",
    { tag: "@prodOnly" },
    async ({ extension, browserContext }) => {
      //setup wallet
      const { accountAddresses } = await extension.setupWallet({
        accountsToSetup: [
          { assets: [{ token: "ETH", balance: 0 }] },
          { assets: [{ token: "ETH", balance: 0 }] },
        ],
      })

      await extension.open()
      await extension.account.selectAccount(extension.account.accountName1)

      const dapp = await extension.dapps.requestConnectionFromDapp(
        browserContext,
        "https://app.avnu.fi/",
      )
      //accept connection from Argent X
      await extension.dapps.accept.click()
      await extension.account.selectAccount(extension.account.accountName2)
      //accept connection from Argent X
      await extension.dapps.accept.click()
      await sleep(2000)
      let add = accountAddresses[1]
        .substring(accountAddresses[1].length - 4)
        .toLowerCase()
      await expect(
        dapp.locator(`button:has-text("...${add}")`).first(),
      ).toBeVisible()
      await extension.account.selectAccount(extension.account.accountName1)
      await sleep(2000)
      add = accountAddresses[0]
        .substring(accountAddresses[0].length - 4)
        .toLowerCase()
      await expect(
        dapp.locator(`button:has-text("...${add}")`).first(),
      ).toBeVisible()
    },
  )

  test("trying to sign message using testDapp with a smart account, wrong code", async ({
    extension,
    browserContext,
  }) => {
    await extension.open()
    await extension.recoverWallet(config.senderSeed!)
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.account.selectAccount("Account 11")

    const dapp = await extension.dapps.requestConnectionFromDapp(
      browserContext,
      "https://dapp-argentlabs.vercel.app",
    )
    //accept connection from Argent X
    await extension.dapps.accept.click()
    await dapp.locator('[id="short-text"]').fill("Test message!")
    await dapp.locator('button:text-is("Sign")').click()
    await extension.wallet.fillEmail("my@mail.com")
    await extension.page.keyboard.down("Enter")
    await extension.wallet.fillPin("222222")
    await extension.navigation.backLocator.click()
    await extension.navigation.closeLocator.click()
    await expect(extension.page.getByText("Abort 2FA")).toBeVisible()
  })
})
