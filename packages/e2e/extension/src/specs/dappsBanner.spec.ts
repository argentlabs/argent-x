import { expect } from "@playwright/test"

import test from "../test"
import config from "../config"

test.describe("Banner", () => {
  test("avnu banner should be visible after login", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.0001 }],
    })

    await expect(extension.network.networkSelector).toBeVisible()
    await expect(extension.account.avnuBanner).toBeVisible()
  })

  test("avnu banner should not be visible after dismissed", async ({
    extension,
  }) => {
    await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.0001 }],
    })

    await expect(extension.network.networkSelector).toBeVisible()
    await expect(extension.account.avnuBanner).toBeVisible()
    await extension.account.avnuBannerClose.click()
    await expect(extension.account.avnuBanner).toBeHidden()
  })

  test("avnu banner shoud be visible after account recovery", async ({
    extension,
  }) => {
    await extension.open()
    await extension.recoverWallet(config.testNetSeed1!)
    await expect(extension.account.avnuBanner).toBeVisible()
  })

  test("ekubo banner should be visible after avnu banner has been dismissed", async ({
    extension,
  }) => {
    await extension.setupWallet({
      accountsToSetup: [{ initialBalance: 0.0001 }],
    })

    await expect(extension.network.networkSelector).toBeVisible()
    await expect(extension.account.avnuBanner).toBeVisible()
    await extension.account.avnuBannerClose.click()
    await expect(extension.account.avnuBanner).toBeHidden()
    await expect(extension.account.ekuboBanner).toBeVisible()
  })
})
