import type { Page } from "@playwright/test"

import { lang } from "../languages"
import Clipboard from "../utils/Clipboard"
import { decreaseMajorVersion } from "../utils"

export default class Navigation extends Clipboard {
  private static _version: string = ""
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

  //used by upgrade version tests
  static get version(): string {
    return Navigation._version
  }

  static set version(value: string) {
    Navigation._version = value
  }

  isUIBreakVersion(storeVersion: string): boolean {
    //if storeVersion is not set, we consider it's not a UI break
    if (!storeVersion) return false
    const vStoreParts = storeVersion.split(".").map(Number)
    const vUIBreakParts = "5.20.9".split(".").map(Number)
    for (
      let i = 0;
      i < Math.max(vStoreParts.length, vUIBreakParts.length);
      i++
    ) {
      const vUiBreakPart = vUIBreakParts[i] || 0
      const vStorePart = vStoreParts[i] || 0
      if (vUiBreakPart > vStorePart) return true
      if (vUiBreakPart < vStorePart) return false
    }
    return false
  }

  setMigVersion(version: string) {
    Navigation._version = decreaseMajorVersion(version)
  }

  get isOldUI() {
    return this.isUIBreakVersion(Navigation._version)
  }
}
