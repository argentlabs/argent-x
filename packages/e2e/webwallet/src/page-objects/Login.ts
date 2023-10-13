import { Page, expect } from "@playwright/test"

import config from "../config"
import Navigation from "./Navigation"

interface ICredentials {
  email: string
  pin: string
  password: string
}

export default class Login extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  get email() {
    return this.page.locator("input[name=email]")
  }

  get pinInput() {
    return this.page.locator('[id^="pin-input"]')
  }

  get password() {
    return this.page.locator("input[name=password]")
  }

  get wrongPassword() {
    return this.page.locator(
      '//input[@name="password"][@aria-invalid="true"]/following::label[contains(text(), "Wrong password")]',
    )
  }

  get forgetPassword() {
    return this.page.locator(
      '//a[@href="/password"]//label[contains(text(), "Forgotten your password?")]',
    )
  }

  get differentAccount() {
    return this.page.locator('p:text-is("Use a different account")')
  }

  async fillPin(pin: string) {
    await Promise.all([
      this.page.waitForURL(`${config.url}/pin`),
      this.continue.click(),
    ])
    await this.pinInput.first().click()
    await this.pinInput.first().fill(pin)
  }

  async success(credentials: ICredentials = config.validLogin) {
    await this.email.fill(credentials.email)
    await this.fillPin(credentials.pin)
    await this.password.fill(credentials.password)
    await expect(this.forgetPassword).toBeVisible()
    await expect(this.differentAccount).toBeVisible()
    await Promise.all([
      this.page.waitForURL(`${config.url}/dashboard`),
      this.continue.click(),
    ])
    await expect(this.lock).toBeVisible()
  }
}
