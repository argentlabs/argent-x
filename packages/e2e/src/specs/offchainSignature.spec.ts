import test from "../test"
import config from "../config"
import { expect } from "@playwright/test"
//@todo move this to prod tests
test.describe("Offchain signature", () => {
  test("Offchain signature with a smart account", async ({
    extension,
    dappPage,
  }) => {
    await extension.recoverWallet(config.senderSeed!)
    await extension.account.ensureSelectedAccount("Humble Hotdog")
    await dappPage.requestConnectionFromDapp(
      "https://demo-dapp-starknet.vercel.app/",
    )
    //accept connection from Argent X
    await extension.dapps.accept.click()
    await dappPage.signMessage()

    await extension.account.email.fill(config.guardianEmail!)
    await extension.navigation.nextLocator.first().click()
    await extension.account.fillPin()
    await expect(
      extension.page.locator(
        '//p[text()="Message"]//following::p[text()="Test message!"]',
      ),
    ).toBeVisible()
    await extension.page.locator('[id="Sign"]').click()
    await expect(extension.account.accountTokens).toBeVisible()
  })

  test("Offchain signature with a default account", async ({
    extension,
    dappPage,
  }) => {
    await extension.recoverWallet(config.senderSeed!)
    await extension.account.ensureSelectedAccount("Casual Clover")
    await dappPage.requestConnectionFromDapp(
      "https://demo-dapp-starknet.vercel.app/",
    )
    //accept connection from Argent X
    await extension.dapps.accept.click()
    await dappPage.signMessage()
    await expect(
      extension.page.locator(
        '//p[text()="Message"]//following::p[text()="Test message!"]',
      ),
    ).toBeVisible()
    await extension.page.locator('[id="Sign"]').click()
    await expect(extension.account.accountTokens).toBeVisible()
  })

  test("Offchain signature with a multisig account", async ({
    extension,
    dappPage,
  }) => {
    await extension.recoverWallet(config.senderSeed!)
    await extension.account.ensureSelectedAccount("Balanced Banana")
    await dappPage.requestConnectionFromDapp(
      "https://demo-dapp-starknet.vercel.app/",
    )
    //accept connection from Argent X
    await extension.dapps.accept.click()
    await dappPage.signMessage()
    await expect(
      extension.page.locator(
        '//p[text()="Message"]//following::p[text()="Test message!"]',
      ),
    ).toBeVisible()
    await extension.page.locator('[id="Sign"]').click()
    await expect(extension.account.accountTokens).toBeVisible()
  })
})
