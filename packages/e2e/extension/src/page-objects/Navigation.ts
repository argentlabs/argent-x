import type { Page } from "@playwright/test"

import { lang } from "../languages"
import Utils from "../../../shared/src/Utils"

export default class Navigation extends Utils {
  constructor(page: Page) {
    super(page)
  }

  get backLocator() {
    return this.page.getByLabel(`${lang.common.back}`).first()
  }

  get closeLocator() {
    return this.page.locator(`[aria-label="${lang.common.close}"]`)
  }

  get closeButtonLocator() {
    return this.page.getByLabel("close")
  }

  get closeButtonDappInfoLocator() {
    return this.page.getByTestId("close-button")
  }

  get confirmLocator() {
    return this.page.locator(`button:text-is("${lang.common.confirm}")`)
  }

  get nextLocator() {
    return this.page.locator(`button:text-is("${lang.common.next}")`)
  }

  get reviewSendLocator() {
    return this.page.locator(`button:text-is("${lang.common.reviewSend}")`)
  }

  get doneLocator() {
    return this.page.locator(`button:text-is("${lang.common.done}")`)
  }

  get continueLocator() {
    return this.page
      .locator(`button:text-is("${lang.common.continue}")`)
      .first()
  }

  get yesLocator() {
    return this.page.locator(`button:text-is("${lang.common.yes}")`)
  }

  get noLocator() {
    return this.page.locator(`button:text-is("${lang.common.no}")`)
  }

  get unlockLocator() {
    return this.page.locator(`button:text-is("${lang.common.unlock}")`).first()
  }

  get showSettingsLocator() {
    return this.page.locator('[aria-label="Show settings"]')
  }

  get lockWalletLocator() {
    return this.page.locator(
      `//button//*[text()="${lang.settings.lockWallet}"]`,
    )
  }

  get resetLocator() {
    return this.page.getByText("Reset").first()
  }

  get confirmResetLocator() {
    return this.page.locator(`button:text-is("${lang.common.confirmReset}")`)
  }

  get menuPendingTransactionsIndicatorLocator() {
    return this.page.locator('[aria-label="Pending transactions"]')
  }

  get menuTokensLocator() {
    return this.page.locator('[aria-label="Tokens"]')
  }

  get menuNTFsLocator() {
    return this.page.locator('[aria-label="NFTs"]')
  }

  get menuSwapsLocator() {
    return this.page.locator('[aria-label="Swap"]')
  }

  get menuActivityLocator() {
    return this.page.locator('[aria-label="Activity"]')
  }

  get menuActivityActiveLocator() {
    return this.page.locator('[aria-label="Activity"][class*="active"]')
  }

  get saveLocator() {
    return this.page.locator(`button:text-is("${lang.common.save}")`)
  }

  get createLocator() {
    return this.page.locator(`button:text-is("${lang.common.create}")`)
  }

  get cancelLocator() {
    return this.page.locator(`button:text-is("${lang.common.cancel}")`)
  }

  get approveLocator() {
    return this.page.locator(`button:text-is("${lang.common.approve}")`)
  }

  get addArgentShieldLocator() {
    return this.page.locator(`button:text-is("${lang.common.addArgentShield}")`)
  }

  get confirmChangeAccountTypeLocator() {
    return this.page.locator(
      `button:text-is("${lang.common.changeAccountType}")`,
    )
  }

  get dismissLocator() {
    return this.page.locator(`button:text-is("${lang.common.dismiss}")`)
  }

  get removeLocator() {
    return this.page.locator(`button:text-is("${lang.common.remove}")`)
  }

  get upgradeLocator() {
    return this.page.locator(`button:text-is("${lang.common.upgrade}")`)
  }
}
