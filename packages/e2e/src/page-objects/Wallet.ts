import { Page, expect } from "@playwright/test"
type language = "en"
const text = {
  en: {
    //first screen
    banner1: "Welcome to Argent X",
    desc1: "Enjoy the security of Ethereum with the scale of StarkNet",
    createButton: "Create a new wallet",
    restoreButton: "Restore an existing wallet",
    //second screen
    banner2: "Disclaimer",
    desc2:
      "StarkNet is in Alpha and may experience technical issues or introduce breaking changes from time to time. Please accept this before continuing.",
    lossOfFunds:
      "I understand that StarkNet may introduce changes that make my existing account unusable and force to create new ones.",
    alphaVersion:
      "I understand that StarkNet may experience performance issues and my transactions may fail for various reasons.",
    continue: "Continue",
    //third screen
    banner3: "New wallet",
    desc3: "Enter a password to protect your wallet",
    password: "Password",
    repeatPassword: "Repeat password",
    createWallet: "Create wallet",
    //fourth screen
    banner4: "Your wallet is ready!",
    desc4: "Follow us for product updates or if you have any questions",
    twitter: "Follow Argent X on Twitter",
    discord: "Join the Argent X Discord",
    finish: "Finish",
  },
}
export default class Wallet {
  constructor(private page: Page, private lang: language = "en") {}
  get banner() {
    return this.page.locator(`div h1:has-text("${text[this.lang].banner1}")`)
  }
  get description() {
    return this.page.locator(`div p:has-text("${text[this.lang].desc1}")`)
  }
  get createNewWallet() {
    return this.page.locator(
      `button:has-text("${text[this.lang].createButton}")`,
    )
  }
  get restoreExistingWallet() {
    return this.page.locator(
      `button:has-text("${text[this.lang].restoreButton}")`,
    )
  }

  //second screen
  get banner2() {
    return this.page.locator(`div h1:has-text("${text[this.lang].banner2}")`)
  }
  get description2() {
    return this.page.locator(`div p:has-text("${text[this.lang].desc2}")`)
  }

  get disclaimerLostOfFunds() {
    return this.page.locator(
      `//input[@name="lossOfFunds"]/following::p[contains(text(),'${
        text[this.lang].lossOfFunds
      }')]`,
    )
  }
  get disclaimerAlphaVersion() {
    return this.page.locator(
      `//input[@name="alphaVersion"]/following::p[contains(text(),'${
        text[this.lang].alphaVersion
      }')]`,
    )
  }
  get continue() {
    return this.page.locator(`button:text-is("${text[this.lang].continue}")`)
  }

  //third screen
  get banner3() {
    return this.page.locator(`div h1:has-text("${text[this.lang].banner3}")`)
  }
  get description3() {
    return this.page.locator(`div p:has-text("${text[this.lang].desc3}")`)
  }
  get password() {
    return this.page.locator(
      `input[name="password"][placeholder="${text[this.lang].password}"]`,
    )
  }
  get repeatPassword() {
    return this.page.locator(
      `input[name="repeatPassword"][placeholder="${
        text[this.lang].repeatPassword
      }"]`,
    )
  }
  get createWallet() {
    return this.page.locator(
      `button:text-is("${text[this.lang].createWallet}")`,
    )
  }

  //fourth screen
  get banner4() {
    return this.page.locator(`div h1:has-text("${text[this.lang].banner4}")`)
  }
  get description4() {
    return this.page.locator(`div p:has-text("${text[this.lang].desc4}")`)
  }
  get twitter() {
    return this.page.locator(`a:text-is("${text[this.lang].twitter}")`)
  }
  get discord() {
    return this.page.locator(`a:text-is("${text[this.lang].discord}")`)
  }
  get finish() {
    return this.page.locator(`button:text-is("${text[this.lang].finish}")`)
  }

  async newWalletOnboarding() {
    await Promise.all([
      expect(this.banner).toBeVisible(),
      expect(this.description).toBeVisible(),
      expect(this.restoreExistingWallet).toBeVisible(),
    ])
    await this.createNewWallet.click()

    await Promise.all([
      expect(this.banner2).toBeVisible(),
      expect(this.description2).toBeVisible(),
    ])
    await this.disclaimerLostOfFunds.click()
    await this.disclaimerAlphaVersion.click()
    await this.continue.click()

    await Promise.all([
      expect(this.banner3).toBeVisible(),
      expect(this.description3).toBeVisible(),
    ])
    await this.password.fill("test123$")
    await this.repeatPassword.fill("test123$")
    await this.createWallet.click()

    await Promise.all([
      expect(this.banner4).toBeVisible(),
      expect(this.description4).toBeVisible(),
      expect(this.twitter).toBeVisible(),
      expect(this.discord).toBeVisible(),
      expect(this.finish).toBeEnabled(),
    ])
  }
}
