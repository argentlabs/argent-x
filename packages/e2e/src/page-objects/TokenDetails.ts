import { expect, Page } from "@playwright/test"

import Navigation from "./Navigation"

export default class TokenDetails extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  openTokenDetails(token: string) {
    return this.page.getByTestId(`${token}-balance`)
  }

  get swapButtonLoc() {
    return this.page.locator('button[aria-label="Swap"]')
  }

  get buyButtonLoc() {
    return this.page.locator('button[aria-label="Buy"]')
  }

  get sendButtonLoc() {
    return this.page.locator('button[aria-label="Send"]')
  }

  graphTimeFrameLoc(frame: "1D" | "1W" | "1M" | "1Y" | "All") {
    return this.page.locator(`button:text-is('${frame}')`)
  }

  get activityButtonLoc() {
    return this.page.locator(`button:text-is('Activity')`)
  }

  get aboutButtonLoc() {
    return this.page.locator(`button:text-is('About')`)
  }

  get menuButtonLoc() {
    return this.page.locator('[id^="menu-button"]')
  }

  get menuCopyTokenAddressLoc() {
    return this.page.getByText("Copy token address")
  }

  get menuViewOnVoyagerLoc() {
    return this.page.getByRole("menuitem", { name: "View on Voyager" })
  }

  get newTokenButtonLoc() {
    return this.page.getByText("New token")
  }

  get addTokenButtonLoc() {
    return this.page.getByRole("button", { name: "Add token" })
  }

  fillTokenAddress(tokenAddress: string) {
    return this.page.locator("[name='address']").fill(tokenAddress)
  }

  async addNewToken(tokenAddress: string, tokenSymbol: string) {
    await this.newTokenButtonLoc.click()
    await this.fillTokenAddress(tokenAddress)
    await expect(this.page.locator('[name="symbol"]')).toHaveValue(tokenSymbol)
    await Promise.race([
      this.addTokenButtonLoc.click(),
      this.addThisToken.click(),
    ])
  }

  token(tokenName: string) {
    return this.page.locator(`h5:text-is('${tokenName}')`)
  }

  showToken(tokenSymbol: string) {
    return this.page.locator(`[data-testid="show-token-button-${tokenSymbol}"]`)
  }

  hideToken(tokenSymbol: string) {
    return this.page.locator(`[data-testid="hide-token-button-${tokenSymbol}"]`)
  }

  get spamTokensList() {
    return this.page.getByRole("button", { name: "Spam" })
  }

  get tokensList() {
    return this.page.getByRole("button", { name: "Tokens" })
  }
  get addThisToken() {
    return this.page.getByRole("button", { name: "Add this token" })
  }
}
