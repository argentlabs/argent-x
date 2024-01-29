import { expect } from "@playwright/test"

import test from "../test"

const aspectUrl = "https://testnet.aspect.co"
const testDappUrl = "https://dapp-argentlabs.vercel.app"

test.describe("Dapps", () => {
  test("connect from aspect", async ({ extension, browserContext }) => {
    //setup wallet
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.dapps.requestConnectionFromDapp(browserContext, aspectUrl)
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    //check connect dapps
    await extension.navigation.showSettings.click()
    await extension.settings.connectedDapps.click()
    await expect(
      extension.dapps.connectedDapps(extension.account.accountName1, 1),
    ).toBeVisible()
    await extension.dapps.account(extension.account.accountName1).click()
    await expect(extension.dapps.connected(aspectUrl)).toBeVisible()
    //disconnect dapp from ArgentX
    await extension.dapps.disconnect(aspectUrl).click()
    await expect(extension.dapps.connected(testDappUrl)).toBeHidden()
    await expect(extension.dapps.noConnectedDapps.first()).toBeVisible()
  })

  test("connect from testDapp", async ({ extension, browserContext }) => {
    //setup wallet
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.dapps.requestConnectionFromDapp(browserContext, testDappUrl)
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    //check connect dapps
    await extension.navigation.showSettings.click()
    await extension.settings.connectedDapps.click()
    await expect(
      extension.dapps.connectedDapps(extension.account.accountName1, 1),
    ).toBeVisible()
    await extension.dapps.account(extension.account.accountName1).click()
    await expect(extension.dapps.connected(testDappUrl)).toBeVisible()
    //disconnect dapp from ArgentX
    await extension.dapps.disconnect(testDappUrl).click()
    await expect(extension.dapps.connected(testDappUrl)).toBeHidden()
    await expect(extension.dapps.noConnectedDapps.first()).toBeVisible()
  })

  test("reset all connections", async ({ extension, browserContext }) => {
    //setup wallet
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.dapps.requestConnectionFromDapp(browserContext, aspectUrl)
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await extension.dapps.requestConnectionFromDapp(browserContext, testDappUrl)
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await extension.navigation.showSettings.click()
    await extension.settings.connectedDapps.click()
    await expect(
      extension.dapps.connectedDapps(extension.account.accountName1, 2),
    ).toBeVisible()
    await extension.dapps.account(extension.account.accountName1).click()

    await Promise.all([
      expect(extension.dapps.connected(testDappUrl)).toBeVisible(),
      expect(extension.dapps.connected(aspectUrl)).toBeVisible(),
    ])

    await extension.dapps.disconnectAll().click()
    await Promise.all([
      expect(extension.dapps.connected(testDappUrl)).toBeHidden(),
      expect(extension.dapps.connected(aspectUrl)).toBeHidden(),
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
    await extension.dapps.requestConnectionFromDapp(browserContext, aspectUrl)
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await extension.dapps.requestConnectionFromDapp(browserContext, testDappUrl)
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await extension.navigation.showSettings.click()
    await extension.settings.connectedDapps.click()
    await expect(
      extension.dapps.connectedDapps(extension.account.accountName1, 2),
    ).toBeVisible()
    await extension.dapps.account(extension.account.accountName1).click()

    await Promise.all([
      expect(extension.dapps.connected(testDappUrl)).toBeVisible(),
      expect(extension.dapps.connected(aspectUrl)).toBeVisible(),
    ])

    await extension.dapps.disconnect(testDappUrl).click()
    await Promise.all([
      expect(extension.dapps.connected(testDappUrl)).toBeHidden(),
      expect(extension.dapps.connected(aspectUrl)).toBeVisible(),
    ])
    await extension.navigation.back.click()
    await expect(
      extension.dapps.connectedDapps(extension.account.accountName1, 1),
    ).toBeVisible()
  })

  test("connect dapps by account", async ({ extension, browserContext }) => {
    //setup wallet
    await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0 }, { initialBalance: 0 }],
    })

    await extension.open()
    await extension.account.selectAccount(extension.account.accountName1)

    await extension.dapps.requestConnectionFromDapp(browserContext, aspectUrl)
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await extension.account.selectAccount(extension.account.accountName2)
    await extension.dapps.requestConnectionFromDapp(browserContext, testDappUrl)
    //accept connection from ArgentX
    await extension.dapps.accept.click()
    await extension.navigation.showSettings.click()
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
      expect(extension.dapps.connected(testDappUrl)).toBeHidden(),
      expect(extension.dapps.connected(aspectUrl)).toBeVisible(),
    ])

    await extension.navigation.back.click()
    await extension.dapps.account(extension.account.accountName2).click()
    await Promise.all([
      expect(extension.dapps.connected(testDappUrl)).toBeVisible(),
      expect(extension.dapps.connected(aspectUrl)).toBeHidden(),
    ])
  })
})
