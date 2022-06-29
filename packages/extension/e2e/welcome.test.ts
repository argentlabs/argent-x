import { expect } from "@playwright/test"

import { test } from "./fixture"
import { openExtension } from "./steps/open-extension"

test("Welcome page is shown correctly", async ({ page, context }) => {
  await openExtension(page, context)

  await expect(page.locator("text=Get started")).toBeVisible() // page is live
  await expect(page.locator("text=Welcome!")).toBeVisible() // and alternates between greetings
  await expect(page.locator("text=New Wallet")).toBeVisible() // has a button to create a new wallet
  await expect(page.locator("text=Restore Wallet")).toBeVisible() // has a button to restore a wallet
})
