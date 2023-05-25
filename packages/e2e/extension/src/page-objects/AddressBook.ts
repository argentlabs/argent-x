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

  get save() {
    return this.page.locator(`button:text-is("${lang.common.save}")`)
  }

  get cancel() {
    return this.page.locator(`button:text-is("${lang.common.cancel}")`)
  }

  networkOption(name: "Localhost 5050" | "Testnet" | "Testnet 2" | "Mainnet") {
    return this.page.locator(`div[aria-disabled="false"]:text-is("${name}")`)
  }

  get nameRequired() {
    return this.page.locator(
      `//input[@name="name"]/following::p[contains(text(), '${lang.address.nameRequired}')]`,
    )
  }

  get addressRequired() {
    return this.page.locator(
      `//textarea[@name="address"]/following::p[contains(text(), '${lang.address.addressRequired}')]`,
    )
  }

  addressByname(name: string) {
    return this.page.locator(
      `//button/following::*[contains(text(),'${name}')]`,
    )
  }

  get deleteAddress() {
    return this.page.locator(`button:text-is("${lang.address.removeAddress}")`)
  }

  get delete() {
    return this.page.locator(`button:text-is("${lang.address.delete}")`)
  }
}
