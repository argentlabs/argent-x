import { ChromiumBrowserContext } from "@playwright/test"

import type ExtensionPage from "./page-objects/ExtensionPage"

export interface TestExtensions {
  extension: ExtensionPage
  secondExtension: ExtensionPage
  thirdExtension: ExtensionPage
  browserContext: ChromiumBrowserContext
  upgradeExtension: ExtensionPage
}
