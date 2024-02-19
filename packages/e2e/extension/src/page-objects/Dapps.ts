import { ChromiumBrowserContext, Page, expect } from "@playwright/test"

import { lang } from "../languages"
import Navigation from "./Navigation"
import config from "../../../shared/config"

type DappUrl =
  | "https://goerli.app.starknet.id"
  | "https://dapp-argentlabs.vercel.app"
  | "https://starknetkit-blacked-listed.vercel.app"
export default class Dapps extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  account(accountName: string) {
    return this.page.locator(`[data-testid="${accountName}"]`)
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
      `text=${lang.settings.account.connectedDapps.noConnectedDapps}`,
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
      `p:text-is("${lang.settings.account.connectedDapps.disconnectAll}")`,
    )
  }

  get accept() {
    return this.page.locator(
      `button:text-is("${lang.settings.account.connectedDapps.connect}")`,
    )
  }

  get reject() {
    return this.page.locator(
      `button:text-is("${lang.settings.account.connectedDapps.reject}")`,
    )
  }

  get knownDappButton() {
    return this.page.locator('[data-testid="KnownDappButton"]')
  }

  async ensureKnowDappText() {
    return Promise.all([
      expect(this.page.locator('h5:text-is("Known Dapp")')).toBeVisible(),
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
    await dapp.waitForTimeout(5000)
    await dapp.goto(dappUrl)

    if (
      dappUrl === "https://dapp-argentlabs.vercel.app" ||
      dappUrl === "https://starknetkit-blacked-listed.vercel.app"
    ) {
      await expect(dapp.locator('button:has-text("Connect")')).toHaveCount(1)
      await dapp.locator('button:has-text("Connect")').first().click()
      await expect(dapp.locator("text=Argent X")).toBeVisible()
      await dapp.locator("text=Argent X").click()
    } else {
      await expect(dapp.getByRole("button", { name: "Argent X" })).toBeVisible()
      await dapp.getByRole("button", { name: "Argent X" }).click()
    }
    return dapp
  }

  async claimSpok(browserContext: ChromiumBrowserContext) {
    const spokCampaignUrl = config.spokCampaignUrl!
    //open dapp page
    const dapp = await browserContext.newPage()
    await dapp.setViewportSize({ width: 1080, height: 720 })
    await dapp.goto("chrome://inspect/#extensions")
    await dapp.waitForTimeout(5000)
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
        this.page.locator(
          `//header[@title="1 risk identified"]//label[text()="We strongly recommend you do not proceed with this transaction"]`,
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
