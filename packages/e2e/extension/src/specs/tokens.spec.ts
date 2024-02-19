import { expect } from "@playwright/test"

import test from "../test"
import { lang } from "../languages"
import { transferTokens } from "../../../shared/src/assets"

test.describe("Tokens", () => {
  test("Add token, token should only be visible if preference is set", async ({
    extension,
  }) => {
    await extension.setupWallet({
      accountsToSetup: [{ assets: [{ token: "ETH", balance: 0.0001 }] }],
    })
    await extension.page
      .getByRole("link", { name: lang.account.newToken })
      .click()
    await extension.page
      .locator('[name="address"]')
      .fill(
        "0x05A6B68181bb48501a7A447a3f99936827E41D77114728960f22892F02E24928",
      )
    await expect(extension.page.locator('[name="name"]')).toHaveValue("Astraly")
    await Promise.all([
      extension.navigation.continueLocator.click(),
      extension.page.locator('text="Token added"').click(),
    ])

    await expect(extension.account.token("AST")).toBeHidden()
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.preferences.click()
    await expect(extension.preferences.hideTokensStatus).toBeEnabled()
    await extension.preferences.hideTokens.click()
    await extension.navigation.backLocator.click()
    await extension.navigation.closeLocator.click()
    await expect(extension.account.token("AST")).toBeVisible()
  })

  test("Token should be auto discovered", async ({ extension }) => {
    const { accountAddresses } = await extension.setupWallet({
      accountsToSetup: [{ assets: [{ token: "ETH", balance: 0.00000001 }] }],
    })

    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("ETH")).toHaveText(
        "0.00000001 ETH",
      ),
      expect(extension.account.currentBalance("WBTC")).toBeHidden(),
    ])

    await transferTokens(0.00000002, accountAddresses[0], "WBTC")

    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("ETH")).toHaveText(
        "0.00000001 ETH",
      ),
      expect(extension.account.currentBalance("WBTC")).toHaveText(
        "0.00000002 WBTC",
        { timeout: 180 * 1000 },
      ),
    ])
  })
})
