import type { Page } from "@playwright/test"

import { lang } from "../languages"

export default class Navigation {
  page: Page
  constructor(page: Page) {
    this.page = page
  }

  get back() {
    return this.page.locator(`[aria-label="${lang.common.back}"]`).first()
  }

  get close() {
    return this.page.locator(`[aria-label="${lang.common.close}"]`)
  }

  get approve() {
    return this.page.locator(`button:text-is("${lang.common.confirm}")`)
  }

  get next() {
    return this.page.locator(`button:text-is("${lang.common.next}")`)
  }

  get done() {
    return this.page.locator(`button:text-is("${lang.common.done}")`)
  }

  get continue() {
    return this.page
      .locator(`button:text-is("${lang.common.continue}")`)
      .first()
  }

  get yes() {
    return this.page.locator(`button:text-is("${lang.common.yes}")`)
  }

  get no() {
    return this.page.locator(`button:text-is("${lang.common.no}")`)
  }

  get unlock() {
    return this.page.locator(`button:text-is("${lang.common.unlock}")`)
  }

  get showSettings() {
    return this.page.locator('[aria-label="Show settings"]')
  }

  get lockWallet() {
    return this.page.locator(`button:text-is("${lang.common.lockWallet}")`)
  }

  get reset() {
    return this.page.locator(`a:text-is("${lang.common.reset}")`)
  }

  get confirmReset() {
    return this.page.locator(`button:text-is("${lang.common.confirmReset}")`)
  }

  get menuPendingTransationsIndicator() {
    return this.page.locator('[aria-label="Pending transactions"]')
  }

  get menuTokens() {
    return this.page.locator('[aria-label="Tokens"]')
  }

  get menuNTFs() {
    return this.page.locator('[aria-label="NFTs"]')
  }

  get menuSwaps() {
    return this.page.locator('[aria-label="Swap"]')
  }

  get menuActivity() {
    return this.page.locator('[aria-label="Activity"]')
  }

  get save() {
    return this.page.locator(`button:text-is("${lang.common.save}")`)
  }

  get create() {
    return this.page.locator(`button:text-is("${lang.common.create}")`)
  }

  get cancel() {
    return this.page.locator(`button:text-is("${lang.common.cancel}")`)
  }
}
