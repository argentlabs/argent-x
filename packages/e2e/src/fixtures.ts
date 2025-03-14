import { ChromiumBrowserContext } from "@playwright/test"

import type ExtensionPage from "./page-objects/ExtensionPage"
import DappPage from "./page-objects/DappPage"

export interface TestExtensions {
  extension: ExtensionPage
  secondExtension: ExtensionPage
  thirdExtension: ExtensionPage
  browserContext: ChromiumBrowserContext
  upgradeExtension: ExtensionPage
  extensionPerformance: ExtensionPage
  dappPage: DappPage
}
