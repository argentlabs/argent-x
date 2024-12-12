import type { Page } from "@playwright/test"

import { lang } from "../languages"
import Navigation from "./Navigation"

export default class AddressBook extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  get add() {
    return this.page.locator('button[aria-label="add"]')
  }

  get name() {
    return this.page.locator('input[name="name"]')
  }

  get address() {
    return this.page.locator('textarea[name="address"]')
  }

  get network() {
    return this.page.locator('[aria-label="network-selector"]')
  }

  get saveLocator() {
    return this.page.locator(`button:text-is("${lang.common.save}")`)
  }

  get cancelLocator() {
    return this.page.locator(`button:text-is("${lang.common.cancel}")`)
  }

  networkOption(name: "Localhost 5050" | "Sepolia" | "Mainnet") {
    return this.page.locator(`button[role="menuitem"]:text-is("${name}")`)
  }

  get nameRequired() {
    return this.page.locator(
      `//input[@name="name"]/following::label[contains(text(), '${lang.settings.addressBook.nameRequired}')]`,
    )
  }

  get addressRequired() {
    return this.page.locator(
      `//textarea[@name="address"]/following::label[contains(text(), '${lang.settings.addressBook.addressRequired}')]`,
    )
  }

  addressByName(name: string) {
    return this.page.locator(
      `//button/following::*[contains(text(),'${name}')]`,
    )
  }

  get deleteAddress() {
    return this.page.locator(
      `button[aria-label="${lang.settings.addressBook.removeAddress}"]`,
    )
  }

  get delete() {
    return this.page.locator(
      `button:text-is("${lang.settings.addressBook.delete}")`,
    )
  }

  get addressBook() {
    return this.page.locator(
      `button:text-is("${lang.settings.addressBook.addressBook}")`,
    )
  }

  async editAddress(name: string) {
    await this.page.locator(`[data-testid="${name}"]`).first().click()
    await this.page.locator(`[data-testid="${name}"]`).first().click()
    await this.page.locator(`[data-testid="${name}"]`).first().hover()
    await this.page
      .locator(`[data-testid="${name}"] [data-testid^="edit-contact"]`)
      .click()
  }
}
