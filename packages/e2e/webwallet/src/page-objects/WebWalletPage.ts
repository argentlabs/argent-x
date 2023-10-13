import type { Page } from "@playwright/test"

import config from "../config"
import Login from "./Login"
import Navigation from "./Navigation"

export default class WebWalletPage {
  page: Page
  login: Login
  navigation: Navigation

  constructor(page: Page) {
    this.page = page
    this.login = new Login(page)
    this.navigation = new Navigation(page)
  }

  open() {
    return this.page.goto(config.url)
  }
}
