import { ChromiumBrowserContext, Page, expect } from "@playwright/test"

import { lang } from "../languages"
import Navigation from "./Navigation"
import config from "../config"

type DappUrl =
  | "https://app.starknet.id"
  | "https://dapp-argentlabs.vercel.app"
  | "https://starknetkit-blacked-listed.vercel.app"
  | "https://app.avnu.fi/"
export default class Dapps extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  account(accountName: string) {
    return this.page.locator(`[data-testid="${accountName}"]`).first()
  }

  connectedDapps(accountName: string, nbrConnectedDapps: number) {
    return nbrConnectedDapps > 1
      ? this.page.locator(
          `[data-testid="${accountName}"]:has-text("${nbrConnectedDapps} dapps connected")`,
        )
      : this.page.locator(
          `[data-testid="${accountName}"]:has-text("${nbrConnectedDapps} dapp connected")`,
        )
  }

  get noConnectedDapps() {
    return this.page.locator(
      `text=${lang.settings.account.authorisedDapps.noAuthorisedDapps}`,
    )
  }

  connected(url: DappUrl) {
    return this.page.locator(`//div/*[contains(text(),'${url.slice(8, 30)}')]`)
  }

  disconnect(url: DappUrl) {
    return this.page.locator(
      `//div/*[contains(text(),'${url.slice(8, 30)}')]/following::button[1]`,
    )
  }

  disconnectAll() {
    return this.page.locator(
      `p:text-is("${lang.settings.account.authorisedDapps.disconnectAll}")`,
    )
  }

  get accept() {
    return this.page.locator(
      `button:text-is("${lang.settings.account.authorisedDapps.connect}")`,
    )
  }

  get reject() {
    return this.page.locator(
      `button:text-is("${lang.settings.account.authorisedDapps.reject}")`,
    )
  }

  get knownDappButton() {
    return this.page.locator('[data-testid="KnownDappButton"]')
  }

  async ensureKnowDappText() {
    return Promise.all([
      expect(this.page.locator('h4:text-is("Known Dapp")')).toBeVisible(),
      expect(
        this.page.locator('p:text-is("This dapp is listed on Dappland")'),
      ).toBeVisible(),
    ])
  }
  async requestConnectionFromDapp(
    browserContext: ChromiumBrowserContext,
    dappUrl: DappUrl,
  ) {
    //open dapp page
    const dapp = await browserContext.newPage()
    await dapp.setViewportSize({ width: 1080, height: 720 })
    await dapp.goto("chrome://inspect/#extensions")
    await dapp.waitForTimeout(1000)
    await dapp.goto(dappUrl)

    if (
      dappUrl === "https://dapp-argentlabs.vercel.app" ||
      dappUrl === "https://starknetkit-blacked-listed.vercel.app" ||
      dappUrl === "https://app.avnu.fi/"
    ) {
      if (dappUrl === "https://dapp-argentlabs.vercel.app") {
        await dapp
          .locator('button:has-text("starknetkit@latest")')
          .first()
          .click()
      } else {
        await dapp.locator('button:has-text("Connect")').first().click()
      }
      //  await expect(dapp.locator('button:has-text("Connect")')).toHaveCount(1)
      await expect(dapp.locator("text=Argent X")).toBeVisible()
      await dapp.locator("text=Argent X").click()
    } else {
      // assert that if the connect button is visible click on it
      const connectButton = dapp.getByRole("button", { name: "connect" })
      await expect(connectButton)
        .toBeVisible({ timeout: 5 * 1000 })
        .then(async () => {
          await connectButton.click()
        })
        .catch(async () => {
          null
        })
      await expect(dapp.getByText("Argent X")).toBeVisible()
      await dapp.getByText("Argent X").click()
    }
    return dapp
  }

  async claimSpok(browserContext: ChromiumBrowserContext) {
    const spokCampaignUrl = config.spokCampaignUrl!
    //open dapp page
    const dapp = await browserContext.newPage()
    await dapp.setViewportSize({ width: 1080, height: 720 })
    await dapp.goto("chrome://inspect/#extensions")
    await dapp.waitForTimeout(1000)
    await dapp.goto(spokCampaignUrl)
    await dapp.getByRole("button", { name: "Check eligibility" }).click()
    await expect(dapp.locator("text=Argent X")).toBeVisible()
    await dapp.locator("text=Argent X").click()
    return dapp
  }

  checkCriticalRiskConnectionScreen() {
    return Promise.all([
      expect(
        this.page.locator(
          `//span[text()="Critical risk"]/following-sibling::label[text()="Use of a blacklisted domain"]`,
        ),
      ).toBeVisible(),
      expect(
        this.page.locator(
          `//p[@data-testid="review-footer" and text()="Please review warnings before continuing"]`,
        ),
      ).toBeVisible(),
      expect(this.page.getByRole("button", { name: "Connect" })).toBeDisabled(),
    ])
  }

  async acceptCriticalRiskConnection() {
    await this.page.getByRole("button", { name: "Review" }).click()
    await Promise.all([
      expect(
        this.page.locator(`//header[@title="1 risk identified"]`),
      ).toBeVisible(),
      expect(
        this.page.locator(
          '//label[text()="We strongly recommend you do not proceed with this transaction"]',
        ),
      ).toBeVisible(),
      expect(
        this.page.locator(
          '//span[text()="Critical risk"]/following-sibling::span[text()="Use of a blacklisted domain"]/following-sibling::p[text()="You are currently on an unsafe domain. Be aware of the risks."]',
        ),
      ).toBeVisible(),
    ])
    await this.page.getByRole("button", { name: "Accept risk" }).click()
  }

  async connectedDappsTooltip(dappUrl: string) {
    await this.showSettingsLocator.click()
    await this.page.hover('[data-testid="connected-dapp"]')
    await expect(
      this.page.locator('[data-testid="connected-dapp"]'),
    ).toHaveText(`Connected to ${dappUrl}`)
  }
}
