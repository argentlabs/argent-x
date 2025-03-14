import { Page, expect } from "@playwright/test"

import Navigation from "./Navigation"
import { TokenSymbol } from "../utils"

export default class Swap extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  get swapHeader() {
    return this.page.getByRole("heading", { name: "Swap" })
  }

  get valueLoc() {
    return this.page.locator('[id="swap-input-pay-panel"]')
  }

  get switchInOutLoc() {
    return this.page.locator('[aria-label="Switch input and output"]')
  }

  get maxLoc() {
    return this.page.locator('//label[@role="button" and text()="Max"]')
  }

  get payTokenLoc() {
    return this.page.locator(
      '(//input[@id="swap-input-pay-panel"]/parent::div/following-sibling::div/button)[1]',
    )
  }

  get receiveTokenLoc() {
    return this.page.locator(
      '//input[@id="swap-input-receive-panel"]/parent::div/following-sibling::div/button',
    )
  }

  get reviewSwapLoc() {
    return this.page.locator('[data-testid="review-swap-button"]')
  }

  get deployFeeLoc() {
    return this.page.locator('[data-testid="deploy-fee"]')
  }

  get useMaxLoc() {
    return this.page.locator('[data-testid="use-max-button"]')
  }

  async setPayToken(token: string) {
    await this.payTokenLoc.click()
    await this.page.locator(`p:text-is("${token}")`).click()
  }

  async setReceiveToken(token: string) {
    await this.receiveTokenLoc.click()
    await this.page.locator(`p:text-is("${token}")`).click()
  }

  async swapTokens({
    payToken,
    receiveToken,
    amount,
    alreadyDeployed = true,
  }: {
    payToken: TokenSymbol
    receiveToken: TokenSymbol
    amount: number | "MAX"
    alreadyDeployed: boolean
  }) {
    await this.setPayToken(payToken)
    await this.setReceiveToken(receiveToken)
    if (amount === "MAX") {
      await this.maxLoc.click()
      // await this.useMaxLoc.click()
    } else {
      await this.valueLoc.fill(amount.toString())
    }
    await this.reviewSwapLoc.click()
    //raise an error if Transaction fail predict, to avoid waiting test timeout
    const failPredict = this.page.getByText("Transaction fail")
    await expect(failPredict)
      .toBeVisible({ timeout: 1000 * 5 })
      .then(async (_) => {
        throw new Error("Transaction failure predicted")
      })
      .catch((_) => null)
    if (!alreadyDeployed) {
      await expect(this.deployFeeLoc).toBeVisible()
    }
    const sendAmountFEText = await this.page
      .locator("[data-fe-value]")
      .nth(1)
      .getAttribute("data-fe-value")
    await this.confirmLocator.click()
    return sendAmountFEText
  }
}
////input[@id="swap-input-receive-panel"]/parent::div/following-sibling::div/button
//(//input[@id="swap-input-pay-panel"]/parent::div/following-sibling::div/button)[1]
