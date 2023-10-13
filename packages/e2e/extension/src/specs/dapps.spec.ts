import { expect } from "@playwright/test"

import test from "../test"

const aspectUrl = "https://testnet.aspect.co"
const testDappUrl = "https://dapp-argentlabs.vercel.app/"

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
    await expect(extension.dapps.connected(aspectUrl)).toBeVisible()
    //disconnect dapp from ArgentX
    await extension.dapps.disconnect(aspectUrl).click()
    await expect(extension.dapps.connected(aspectUrl)).toBeHidden()
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
    await expect(extension.dapps.connected(testDappUrl)).toBeVisible()
    //disconnect dapp from ArgentX
    await extension.dapps.disconnect(testDappUrl).click()
    await expect(extension.dapps.connected(testDappUrl)).toBeHidden()
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
    await Promise.all([
      expect(extension.dapps.connected(testDappUrl)).toBeVisible(),
      expect(extension.dapps.connected(aspectUrl)).toBeVisible(),
    ])

    await extension.dapps.resetAll().click()
    await Promise.all([
      expect(extension.dapps.connected(testDappUrl)).toBeHidden(),
      expect(extension.dapps.connected(aspectUrl)).toBeHidden(),
    ])
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
    await Promise.all([
      expect(extension.dapps.connected(testDappUrl)).toBeVisible(),
      expect(extension.dapps.connected(aspectUrl)).toBeVisible(),
    ])

    await extension.dapps.disconnect(testDappUrl).click()
    await Promise.all([
      expect(extension.dapps.connected(testDappUrl)).toBeHidden(),
      expect(extension.dapps.connected(aspectUrl)).toBeVisible(),
    ])
  })
})
