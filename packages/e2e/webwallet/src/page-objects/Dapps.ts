import { ChromiumBrowserContext, Page, expect } from "@playwright/test"
import { ICredentials } from "./Login"
import Navigation from "./Navigation"

type DappUrl =
  | "https://goerli.app.starknet.id"
  | "https://dapp-argentlabs.vercel.app"
  | "https://starknetkit-blacked-listed.vercel.app"

export default class Dapps extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  async requestConnectionFromDapp({
    browserContext,
    dappUrl,
    credentials,
    newAccount = false,
  }: {
    browserContext: ChromiumBrowserContext
    dappUrl: DappUrl
    credentials: ICredentials
    newAccount: boolean
  }) {
    //open dapp page
    const dapp = await browserContext.newPage()
    await dapp.setViewportSize({ width: 1080, height: 720 })
    await dapp.goto(dappUrl)

    if (
      dappUrl === "https://dapp-argentlabs.vercel.app" ||
      dappUrl === "https://starknetkit-blacked-listed.vercel.app"
    ) {
      await expect(dapp.locator('button:has-text("Connect")')).toHaveCount(1)
      await dapp.locator('button:has-text("Connect")').first().click()
    } else {
      await expect(dapp.locator("text=CONNECT ARGENT")).toBeVisible()
      await dapp.locator("text=CONNECT ARGENT").click()
    }

    const popupPromise = dapp.waitForEvent("popup")
    await expect(dapp.locator("p:text-is('Email')")).toBeVisible()
    await dapp.locator("p:text-is('Email')").click()
    const popup = await popupPromise
    // Wait for the popup to load.
    await popup.waitForLoadState()

    await popup.locator("[name=email]").fill(credentials.email)
    await popup.locator('button[type="submit"]').click()
    await popup.locator('[id^="pin-input"]').first().click()
    await popup.locator('[id^="pin-input"]').first().fill(credentials.pin)
    if (newAccount) {
      await popup.locator("[name=password]").fill(credentials.password)
      await popup.locator("[name=repeatPassword]").fill(credentials.password)
    } else {
      await popup.locator("[name=password]").fill(credentials.password)
    }
    await popup.locator('button[type="submit"]').click()
    await popup.waitForLoadState()
    await expect(
      popup.locator(`p:text-is("${credentials.email}")`),
    ).toBeVisible()
    await popup.locator('button[type="submit"]').click()
    return dapp
  }
}
