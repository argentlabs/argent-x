import { expect } from "@playwright/test"

import config from "../../../shared/config"
import test from "../test"
import { generateEmail } from "../page-objects/WebWalletPage"

test.describe(`Login page`, () => {
  test("create new wallet", async ({ webWallet }) => {
    await webWallet.login.createWallet({
      email: generateEmail(),
      pin: config.validLogin.pin,
      password: config.validLogin.password,
    })
    await webWallet.navigation.backupPassword.click()
    await expect(webWallet.navigation.backupPassword).not.toBeVisible()
  })

  test("can log in", async ({ webWallet }) => {
    await webWallet.login.success()
  })

  test("Assets page has loaded", async ({ webWallet }) => {
    await webWallet.login.success()
    await webWallet.assets.assetPageHasLoaded()
  })

  test("wrong password", async ({ webWallet }) => {
    await webWallet.login.email.fill(config.validLogin.email)
    await webWallet.login.fillPin(config.validLogin.pin)
    await webWallet.login.password.fill("VeryFake123!")
    await webWallet.login.continue.click()
    await expect(webWallet.login.wrongPassword).toBeVisible()
  })
})
