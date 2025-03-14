import { Page, expect } from "@playwright/test"

import Navigation from "./Navigation"
import config from "../config"

type DappUrl =
  | "https://app.starknet.id"
  | "https://demo-dapp-starknet.vercel.app/"
  | "https://starknetkit-blacked-listed.vercel.app"
  | "https://app.avnu.fi/"
export default class DappPage {
  page: Page
  navigation: Navigation
  constructor(page: Page) {
    this.page = page
    this.navigation = new Navigation(page)
  }

  async requestConnectionFromDapp(dappUrl: DappUrl) {
    //open dapp page
    await this.page.setViewportSize({ width: 1080, height: 720 })
    await this.page.goto(dappUrl)

    if (
      dappUrl === "https://demo-dapp-starknet.vercel.app/" ||
      dappUrl === "https://starknetkit-blacked-listed.vercel.app" ||
      dappUrl === "https://app.avnu.fi/"
    ) {
      await this.page.locator('button:has-text("Connect")').first().click()

      //  await expect(this.page.locator('button:has-text("Connect")')).toHaveCount(1)
      await expect(this.page.locator("text=Argent X")).toBeVisible()
      await this.page.locator("text=Argent X").click()
    } else {
      // assert that if the connect button is visible click on it
      const connectButton = this.page
        .getByRole("button", { name: "connect" })
        .first()
      await expect(connectButton)
        .toBeVisible({ timeout: 5 * 1000 })
        .then(async () => {
          await connectButton.click()
        })
        .catch(async () => {
          null
        })
      await expect(this.page.getByText("Argent X")).toBeVisible()
      await this.page.getByText("Argent X").click()
    }
  }

  async claimSpok() {
    await this.page.goto(config.spokCampaignUrl!)
    await this.page.getByRole("button", { name: "Check eligibility" }).click()
    await expect(this.page.locator("text=Argent X")).toBeVisible()
    await this.page.locator("text=Argent X").click()
  }

  async signMessage(message: string = "Test message!") {
    await this.page.getByRole("button", { name: "Signing" }).click()
    await this.page.locator('[id="short-text"]').fill(message)
    await this.page.getByRole("button", { name: "Submit" }).click()
  }
}
