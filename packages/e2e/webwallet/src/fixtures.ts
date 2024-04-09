import { BrowserContext, Page } from "@playwright/test"
import type WebWalletPage from "./page-objects/WebWalletPage"

export interface TestPages {
  webWallet: WebWalletPage
  dApp: Page
  browserContext: BrowserContext
}
