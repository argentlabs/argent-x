import { Page, expect } from "@playwright/test"
import { ICredentials } from "./Login"
import Navigation from "./Navigation"
import { artifactsDir } from "../../../shared/cfg/test"
import { randomUUID } from "crypto"

type DappUrl =
  | "https://goerli.app.starknet.id"
  | "https://dapp-argentlabs.vercel.app"
  | "https://starknetkit-blacked-listed.vercel.app"

export default class Dapps extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  async requestConnectionFromDapp({
    dApp,
    dappUrl,
    credentials,
    newAccount = false,
  }: {
    dApp: Page
    dappUrl: DappUrl
    credentials: ICredentials
    newAccount: boolean
  }) {
    //open dapp page
    await dApp.goto(dappUrl)

    if (
      dappUrl === "https://dapp-argentlabs.vercel.app" ||
      dappUrl === "https://starknetkit-blacked-listed.vercel.app"
    ) {
      await expect(dApp.locator('button:has-text("Connect")')).toHaveCount(1)
      await dApp.locator('button:has-text("Connect")').first().click()
    } else {
      await expect(dApp.locator("text=CONNECT ARGENT")).toBeVisible()
      await dApp.locator("text=CONNECT ARGENT").click()
    }

    const popupPromise = dApp.waitForEvent("popup")
    await expect(dApp.locator("p:text-is('Email')")).toBeVisible()
    await dApp.locator("p:text-is('Email')").click()
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
    await expect(popup.locator(`text="${credentials.email}"`))
      .toBeVisible()
      .catch(async () => {
        await popup.screenshot({ path: `${artifactsDir}/${randomUUID()}.png` })
        throw new Error("Email not visible")
      })
    await popup.locator('button[type="submit"]').click()
    return dApp
  }
}
