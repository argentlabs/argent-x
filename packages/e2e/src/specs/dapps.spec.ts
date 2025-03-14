import { expect } from "@playwright/test"

import test from "../test"
import { sleep } from "../utils"
import config from "../config"

test.describe("Dapps", () => {
  test(
    "connect from starknet.id",
    { tag: "@prodOnly" },
    async ({ extension, dappPage }) => {
      //setup wallet
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await extension.account.setupRecovery()
      const { accountName } = await extension.account.lastAccountInfo()
      await dappPage.requestConnectionFromDapp("https://app.starknet.id")
      //accept connection from Argent X
      if (await extension.dapps.reviewButton.isVisible()) {
        await extension.dapps.reviewButton.click()
        await extension.dapps.acceptRiskButton.click()
      }
      await extension.dapps.accept.click()
      //check connect dapps
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.authorizedDapps.click()
      await expect(
        extension.dapps.connectedDapps(accountName!, 1),
      ).toBeVisible()
      await extension.dapps.account(accountName!).click()
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

  test("connect from testDapp", async ({ extension, dappPage }) => {
    //setup wallet
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.account.setupRecovery()
    const { accountName } = await extension.account.lastAccountInfo()

    await dappPage.requestConnectionFromDapp(
      "https://demo-dapp-starknet.vercel.app/",
    )
    //accept connection from Argent X
    if (await extension.dapps.reviewButton.isVisible()) {
      await extension.dapps.reviewButton.click()
      await extension.dapps.acceptRiskButton.click()
    }
    await extension.dapps.accept.click()
    //check connect dapps
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.authorizedDapps.click()
    await expect(extension.dapps.connectedDapps(accountName!, 1)).toBeVisible()
    await extension.dapps.account(accountName!).click()
    await expect(
      extension.dapps.connected("https://demo-dapp-starknet.vercel.app/"),
    ).toBeVisible()
    //disconnect dapp from Argent X
    await extension.dapps
      .disconnect("https://demo-dapp-starknet.vercel.app/")
      .click()
    await expect(
      extension.dapps.connected("https://demo-dapp-starknet.vercel.app/"),
    ).toBeHidden()
    await expect(extension.dapps.noConnectedDapps.first()).toBeVisible()
  })

  test(
    "disconnect only one connected dapp",
    { tag: "@prodOnly" },
    async ({ extension, dappPage }) => {
      //setup wallet
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await extension.account.setupRecovery()
      const { accountName } = await extension.account.lastAccountInfo()

      await dappPage.requestConnectionFromDapp("https://app.starknet.id")
      //accept connection from Argent X
      if (await extension.dapps.reviewButton.isVisible()) {
        await extension.dapps.reviewButton.click()
        await extension.dapps.acceptRiskButton.click()
      }
      await extension.dapps.accept.click()
      await dappPage.requestConnectionFromDapp(
        "https://demo-dapp-starknet.vercel.app/",
      )
      //accept connection from Argent X
      if (await extension.dapps.reviewButton.isVisible()) {
        await extension.dapps.reviewButton.click()
        await extension.dapps.acceptRiskButton.click()
      }
      await extension.dapps.accept.click()
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.authorizedDapps.click()
      await expect(
        extension.dapps.connectedDapps(accountName!, 2),
      ).toBeVisible()
      await extension.dapps.account(accountName!).click()

      await Promise.all([
        expect(
          extension.dapps.connected("https://demo-dapp-starknet.vercel.app/"),
        ).toBeVisible(),
        expect(
          extension.dapps.connected("https://app.starknet.id"),
        ).toBeVisible(),
      ])

      await extension.dapps
        .disconnect("https://demo-dapp-starknet.vercel.app/")
        .click()
      await Promise.all([
        expect(
          extension.dapps.connected("https://demo-dapp-starknet.vercel.app/"),
        ).toBeHidden(),
        expect(
          extension.dapps.connected("https://app.starknet.id"),
        ).toBeVisible(),
      ])
      await extension.navigation.backLocator.click()
      await expect(
        extension.dapps.connectedDapps(accountName!, 1),
      ).toBeVisible()
    },
  )

  test(
    "connect dapps by account",
    { tag: "@prodOnly" },
    async ({ extension, dappPage }) => {
      //setup wallet
      const { accountNames } = await extension.setupWallet({
        accountsToSetup: [
          { assets: [{ token: "ETH", balance: 0 }] },
          { assets: [{ token: "ETH", balance: 0 }] },
        ],
      })
      const accountName1 = accountNames![0]
      const accountName2 = accountNames![1]
      await extension.open()
      await extension.account.selectAccount(accountName1)

      await dappPage.requestConnectionFromDapp("https://app.starknet.id")
      //accept connection from Argent X
      if (await extension.dapps.reviewButton.isVisible()) {
        await extension.dapps.reviewButton.click()
        await extension.dapps.acceptRiskButton.click()
      }
      await extension.dapps.accept.click()
      await extension.account.selectAccount(accountName2)
      await dappPage.requestConnectionFromDapp(
        "https://demo-dapp-starknet.vercel.app/",
      )
      //accept connection from Argent X
      if (await extension.dapps.reviewButton.isVisible()) {
        await extension.dapps.reviewButton.click()
        await extension.dapps.acceptRiskButton.click()
      }
      await extension.dapps.accept.click()
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.authorizedDapps.click()
      await Promise.all([
        expect(extension.dapps.connectedDapps(accountName1, 1)).toBeVisible(),
        expect(extension.dapps.connectedDapps(accountName2, 1)).toBeVisible(),
      ])

      await extension.dapps.account(accountName1).click()
      await Promise.all([
        expect(
          extension.dapps.connected("https://demo-dapp-starknet.vercel.app/"),
        ).toBeHidden(),
        expect(
          extension.dapps.connected("https://app.starknet.id"),
        ).toBeVisible(),
      ])

      await extension.navigation.backLocator.click()
      await extension.dapps.account(accountName2).click()
      await Promise.all([
        expect(
          extension.dapps.connected("https://demo-dapp-starknet.vercel.app/"),
        ).toBeVisible(),
        expect(
          extension.dapps.connected("https://app.starknet.id"),
        ).toBeHidden(),
      ])
    },
  )

  test("connect to dapp flagged as critical", async ({
    extension,
    dappPage,
  }) => {
    //setup wallet
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.account.setupRecovery()
    await dappPage.requestConnectionFromDapp(
      "https://starknetkit-blacked-listed.vercel.app",
    )
    await extension.dapps.checkCriticalRiskConnectionScreen()
    await extension.dapps.acceptCriticalRiskConnection()
    await extension.dapps.accept.click()
    //https://argent.atlassian.net/browse/BLO-1939
    // await extension.dapps.connectedDappsTooltip("https://starknetkit-blacked-listed.vercel.app")
  })

  //todo Playwright dapp and extension are ran on different tabs
  //argent-x don’t handle dapp messages if the message is not coming from the focused tab
  test.skip(
    "when changing account, extension should ask user to connect do dapp",
    { tag: "@prodOnly" },
    async ({ extension, dappPage }) => {
      //setup wallet
      const { accountAddresses, accountNames } = await extension.setupWallet({
        accountsToSetup: [
          { assets: [{ token: "ETH", balance: 0 }] },
          { assets: [{ token: "ETH", balance: 0 }] },
        ],
      })
      const accountName1 = accountNames![0]
      const accountName2 = accountNames![1]
      await extension.open()
      await extension.account.selectAccount(accountName1)

      await dappPage.requestConnectionFromDapp("https://app.avnu.fi/")
      //accept connection from Argent X
      if (await extension.dapps.reviewButton.isVisible()) {
        await extension.dapps.reviewButton.click()
        await extension.dapps.acceptRiskButton.click()
      }
      await extension.dapps.accept.click()
      await extension.account.selectAccount(accountName2)
      //accept connection from Argent X
      if (await extension.dapps.reviewButton.isVisible()) {
        await extension.dapps.reviewButton.click()
        await extension.dapps.acceptRiskButton.click()
      }
      await extension.dapps.accept.click()
      await sleep(2000)
      let add = accountAddresses[1]
        .substring(accountAddresses[1].length - 4)
        .toLowerCase()
      await expect(
        dappPage.page.locator(`button:has-text("...${add}")`).first(),
      ).toBeVisible()
      await extension.account.selectAccount(accountName1)
      await sleep(2000)
      add = accountAddresses[0]
        .substring(accountAddresses[0].length - 4)
        .toLowerCase()
      await expect(
        dappPage.page.locator(`button:has-text("...${add}")`).first(),
      ).toBeVisible()
    },
  )

  test("trying to sign message using testDapp with a smart account, wrong code", async ({
    extension,
    dappPage,
  }) => {
    await extension.open()

    await extension.recoverWallet(config.senderSeed!)
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.account.selectAccount("Humble Hotdog")

    await dappPage.requestConnectionFromDapp(
      "https://demo-dapp-starknet.vercel.app/",
    )
    //accept connection from Argent X
    if (await extension.dapps.reviewButton.isVisible()) {
      await extension.dapps.reviewButton.click()
      await extension.dapps.acceptRiskButton.click()
    }
    await extension.dapps.accept.click()
    await dappPage.signMessage()
    await extension.wallet.fillEmail("my@mail.com")
    await extension.page.keyboard.down("Enter")
    await extension.wallet.fillPin("222222")
    await extension.navigation.backLocator.click()
    await extension.navigation.closeLocator.click()
    await expect(extension.page.getByText("Abort 2FA")).toBeVisible()
  })
})
