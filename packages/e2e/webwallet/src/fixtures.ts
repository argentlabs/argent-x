import { BrowserContext } from "@playwright/test"
import type WebWalletPage from "./page-objects/WebWalletPage"

export interface TestPages {
  webWallet: WebWalletPage
  browserContext: BrowserContext
}
