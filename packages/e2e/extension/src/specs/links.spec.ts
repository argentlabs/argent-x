import { expect } from "@playwright/test"

import test from "../test"

test.describe("Links", () => {
  test("Check settings links", async ({ extension }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.navigation.showSettingsLocator.click()
    let href = await extension.settings.discord.getAttribute("href")
    expect(href).toContain("https://discord.gg/T4PDFHxm6T")
    href = await extension.settings.help.getAttribute("href")
    expect(href).toContain(
      "https://support.argent.xyz/hc/en-us/categories/5767453283473-Argent-X",
    )
    href = await extension.settings.github.getAttribute("href")
    expect(href).toContain("https://github.com/argentlabs/argent-x/issues")
  })
})
