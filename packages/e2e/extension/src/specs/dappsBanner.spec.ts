import { expect } from "@playwright/test"

import test from "../test"
import config from "../config"

test.describe("Banner", () => {
  test("dapps banner should be visible after login", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.0001 }],
    })

    await expect(extension.network.networkSelector).toBeVisible()
    await expect(extension.account.dappsBanner).toBeVisible()
    let href = await extension.account.dappsBanner.getAttribute("href")
    expect(href).toContain("https://www.dappland.com")
    //check settings banner
    await extension.navigation.showSettings.click()
    href = await extension.account.dappsBanner.getAttribute("href")
    expect(href).toContain("https://www.dappland.com")
  })

  test("dapps banner should not be visible after dismissed", async ({
    extension,
  }) => {
    await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.0001 }],
    })

    await expect(extension.network.networkSelector).toBeVisible()
    await expect(extension.account.dappsBanner).toBeVisible()
    await extension.account.dappsBannerClose.click()
    await expect(extension.account.dappsBanner).toBeHidden()
  })

  test("dapps banner shoud be visible after account recovery", async ({
    extension,
  }) => {
    await extension.open()
    await extension.recoverWallet(config.testNetSeed1!)
    await expect(extension.account.dappsBanner).toBeVisible()
  })
})
