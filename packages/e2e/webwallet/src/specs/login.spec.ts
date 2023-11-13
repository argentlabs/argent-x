import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"

test.describe(`Login page`, () => {
  test("can log in", async ({ webWallet }) => {
    await webWallet.login.success()
  })

  test("wrong password", async ({ webWallet }) => {
    await webWallet.login.email.fill(config.validLogin.email)
    await webWallet.login.fillPin(config.validLogin.pin)
    await webWallet.login.password.fill("VeryFake123!")
    await webWallet.login.continue.click()
    await expect(webWallet.login.wrongPassword).toBeVisible()
  })
})
