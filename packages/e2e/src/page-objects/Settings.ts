import { expect, type Page } from "@playwright/test"

import { lang } from "../languages"
import { sleep } from "../utils"
import Navigation from "./Navigation"

export default class Settings extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  get extendedView() {
    return this.page.locator(`[aria-label="${lang.settings.extendedView}"]`)
  }

  get addressBook() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.addressBook.addressBook}"]`,
    )
  }

  get authorizedDapps() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.account.authorisedDapps.authorisedDapps}"]`,
    )
  }

  get advancedSettings() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.advancedSettings.advancedSettings}"]`,
    )
  }

  get preferences() {
    return this.page.locator(
      `//a//*[text()="${lang.settings.preferences.preferences}"]`,
    )
  }

  // account settings
  get accountName() {
    return this.page.locator('input[placeholder="Account name"]')
  }

  get exportPrivateKey() {
    return this.page.getByRole("button", { name: "Export private key" })
  }

  get deployAccount() {
    return this.page.locator(
      `//button//*[text()="${lang.settings.account.deployAccount}"]`,
    )
  }

  get hideAccount() {
    return this.page.getByRole("button", { name: "Hide account" })
  }

  account(accountName: string) {
    return this.page.locator(`[aria-label="Select ${accountName}"]`)
  }

  async setAccountName(newAccountName: string) {
    await this.accountName.click()
    await this.accountName.fill(newAccountName)
    await this.page.locator("form button").click()
  }

  get confirmHide() {
    return this.page.locator(`button:text-is("${lang.common.hide}")`)
  }
  get hiddenAccounts() {
    return this.page.locator(
      `p:text-is("${lang.settings.preferences.hiddenAccounts}")`,
    )
  }

  unhideAccount(accountName: string) {
    return this.page.locator(`button :text-is("${accountName}")`)
  }

  get smartAccountButton() {
    return this.page.locator('[data-testid="smart-account-button"]')
  }

  get changeToStandardAccountButton() {
    return this.page.locator(
      '[data-testid="smart-account-button"]:has-text("Change to Standard Account")',
    )
  }

  get privateKey() {
    return this.page.locator('[aria-label="Private key"]')
  }

  get copy() {
    return this.page.locator(`button:text-is("${lang.common.copy}")`)
  }

  get help() {
    return this.page.getByRole("link", { name: "Help" })
  }

  get discord() {
    return this.page.getByRole("link", { name: "Discord" })
  }

  get github() {
    return this.page.getByRole("link", { name: "GitHub" })
  }

  get viewOnStarkScanLocator() {
    return this.page.getByRole("button", {
      name: lang.settings.account.viewOnStarkScan,
    })
  }

  get viewOnVoyagerLocator() {
    return this.page.getByRole("button", {
      name: lang.settings.account.viewOnVoyager,
    })
  }

  get pinLocator() {
    return this.page.locator('[aria-label="Please enter your pin code"]')
  }

  async signIn(email: string, pin: string = "111111") {
    await this.page.getByRole("button", { name: "Sign in to Argent" }).click()
    await this.page.getByTestId("email-input").fill(email)
    await this.nextLocator.click()
    //avoid BE error PIN not requested
    await sleep(2000)
    await expect(this.pinLocator).toHaveCount(6)
    await this.pinLocator.first().click()
    await this.pinLocator.first().fill(pin)
    await expect(
      this.page.getByRole("button", { name: "Logout" }),
    ).toBeVisible()
    await this.closeLocator.click()
  }
}
