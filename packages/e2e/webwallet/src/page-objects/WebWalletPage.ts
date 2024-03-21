import type { Page } from "@playwright/test"
import { v4 as uuid } from "uuid"

import config from "../../../shared/config"
import Login from "./Login"
import Navigation from "./Navigation"

export const generateEmail = () => `newWallet_${uuid()}@mail.com`

import Dapps from "./Dapps"
import Assets from "./Assets"
export default class WebWalletPage {
  page: Page
  login: Login
  navigation: Navigation
  dapps: Dapps
  assets: Assets

  constructor(page: Page) {
    this.page = page
    this.login = new Login(page)
    this.navigation = new Navigation(page)
    this.dapps = new Dapps(page)
    this.assets = new Assets(page)
  }

  open() {
    return this.page.goto(config.url)
  }

  generateEmail = () => `e2e_webwallet_${uuid()}@mail.com`
}
