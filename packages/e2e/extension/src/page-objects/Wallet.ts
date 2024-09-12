import { Page, expect } from "@playwright/test"

import config from "../../../shared/config"
import { lang } from "../languages"
import Navigation from "./Navigation"
import { sleep } from "../../../shared/src/common"

export default class Wallet extends Navigation {
  constructor(page: Page) {
    super(page)
  }
  get banner() {
    return this.page.locator(`div h2:text-is("${lang.wallet.banner1}")`)
  }
  get description() {
    return this.page.locator(`div p:text-is("${lang.wallet.desc1}")`)
  }
  get createNewWallet() {
    return this.page.locator(`button:text-is("${lang.wallet.createButton}")`)
  }
  get restoreExistingWallet() {
    return this.page.locator(`button:text-is("${lang.wallet.restoreButton}")`)
  }

  //second screen
  get banner2() {
    return this.page.locator(`div h2:text-is("${lang.wallet.banner2}")`)
  }
  get description2() {
    return this.page.locator(`div p:text-is("${lang.wallet.desc2}")`)
  }

  get disclaimerLostOfFunds() {
    return this.page.locator(
      `//input[@value="lossOfFunds"]/following::p[contains(text(),'${lang.wallet.lossOfFunds}')]`,
    )
  }
  get disclaimerAlphaVersion() {
    return this.page.locator(
      `//input[@value="alphaVersion"]/following::p[contains(text(),'${lang.wallet.alphaVersion}')]`,
    )
  }

  get privacyPolicyLink() {
    return this.page.getByRole("link", { name: "Privacy Policy" })
  }

  //third screen
  get banner3() {
    return this.page.locator(`div h2:text-is("${lang.wallet.banner3}")`)
  }
  get description3() {
    return this.page.locator(`div p:text-is("${lang.wallet.desc3}")`)
  }
  get password() {
    return this.page.locator(
      `input[name="password"][placeholder="${lang.wallet.password}"]`,
    )
  }
  get repeatPassword() {
    return this.page.locator(
      `input[name="repeatPassword"][placeholder="${lang.wallet.repeatPassword}"]`,
    )
  }
  get createWallet() {
    return this.page.locator(`button:text-is("${lang.wallet.createWallet}")`)
  }

  //fourth screen
  get banner4() {
    return this.page.locator(`div h2:text-is("${lang.wallet.banner4}")`)
  }
  get description4() {
    return this.page.locator(`div p:text-is("${lang.wallet.desc4}")`)
  }
  get twitter() {
    return this.page.locator(`a:text-is("${lang.wallet.twitter}")`)
  }
  get discord() {
    return this.page.locator(`a:text-is("${lang.wallet.discord}")`)
  }
  get finish() {
    return this.page.locator(`button:text-is("${lang.wallet.finish}")`)
  }

  get agreeLoc() {
    return this.page.locator('[data-testid="agree-button"]')
  }

  get addStandardAccountFromNewAccountScreen() {
    return this.page.locator('[aria-label="Standard Account"]')
  }

  get addSmartAccountFromNewAccountScreen() {
    return this.page.locator('[aria-label="Smart Account"]')
  }

  get pinLocator() {
    return this.page.locator('[aria-label="Please enter your pin code"]')
  }

  fillEmail(email: string) {
    return this.page.locator('[data-testid="email-input"]').fill(email)
  }

  async fillPin(pin: string) {
    //avoid BE error PIN not requested
    await sleep(2000)
    await expect(this.pinLocator).toHaveCount(6)
    await this.pinLocator.first().click()
    await this.pinLocator.first().fill(pin)
  }
  async newWalletOnboarding(
    email?: string,
    pin: string = "111111",
    success: boolean = true,
  ) {
    await Promise.all([
      expect(this.banner).toBeVisible(),
      expect(this.description).toBeVisible(),
      expect(this.restoreExistingWallet).toBeVisible(),
    ])
    await this.createNewWallet.click()
    await this.agreeLoc.click()
    await Promise.all([
      expect(this.banner3).toBeVisible(),
      expect(this.description3).toBeVisible(),
    ])
    await this.password.fill(config.password)
    await this.repeatPassword.fill(config.password)
    await this.continueLocator.click()
    if (!email) {
      await this.addStandardAccountFromNewAccountScreen.click()
      await this.continueLocator.click()
    } else {
      await this.addSmartAccountFromNewAccountScreen.click()
      await this.continueLocator.click()
      await this.fillEmail(email)
      await this.continueLocator.click()
      await this.fillPin(pin)
      if (!success) {
        await expect(
          this.page.getByText(lang.account.argentShield.emailInUse),
        ).toBeVisible()
      }
    }
    if (success) {
      await Promise.all([
        expect(this.banner4).toBeVisible(),
        expect(this.description4).toBeVisible(),
        expect(this.twitter).toBeVisible(),
        expect(this.discord).toBeVisible(),
        expect(this.finish).toBeEnabled(),
      ])
    }
  }
}
