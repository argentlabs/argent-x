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
    return this.page.locator(`button:has-text("${lang.common.confirm}")`)
  }

  get next() {
    return this.page.locator(`button:has-text("${lang.common.next}")`)
  }

  get done() {
    return this.page.locator(`button:has-text("${lang.common.done}")`)
  }

  get continue() {
    return this.page
      .locator(`button:has-text("${lang.common.continue}")`)
      .first()
  }
}
