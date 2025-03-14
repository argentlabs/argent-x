import { Page, expect } from "@playwright/test"

import { lang } from "../languages"
import Navigation from "./Navigation"

type DappUrl =
  | "https://app.starknet.id"
  | "https://demo-dapp-starknet.vercel.app/"
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
      `text=${lang.settings.account.authorizedDapps.noAuthorizedDapps}`,
    )
  }
  get reviewButton() {
    return this.page.getByRole("button", { name: "Review" })
  }

  get acceptRiskButton() {
    return this.page.getByRole("button", { name: "Accept risk" })
  }

  connected(url: DappUrl) {
    return this.page.locator(`//div/*[contains(text(),'${url.slice(8, 30)}')]`)
  }

  disconnect(url: DappUrl) {
    return this.page.locator(
      `//div/*[contains(text(),'${url.slice(8, 30)}')]/following::button[1]`,
    )
  }

  get accept() {
    return this.page.locator(
      `button:text-is("${lang.settings.account.authorizedDapps.connect}")`,
    )
  }

  get reject() {
    return this.page.locator(
      `button:text-is("${lang.settings.account.authorizedDapps.reject}")`,
    )
  }

  get knownDappButton() {
    return this.page.locator('[data-testid="KnownDappButton"]')
  }

  async ensureKnowDappText() {
    return Promise.all([
      expect(
        this.page.getByRole("heading", { name: "Known Dapp" }),
      ).toBeVisible(),
      expect(
        this.page.locator('p:text-is("This dapp is listed on Dappland")'),
      ).toBeVisible(),
    ])
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
