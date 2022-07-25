import { expect } from "@playwright/test"

import { test } from "./fixture"
import { openExtension } from "./steps/openExtension"

test("Welcome page is shown correctly", async ({ page }) => {
  await openExtension(page)

  await expect(page.locator("text=Get started")).toBeVisible({
    timeout: 8000,
  }) // page is live
  await expect(page.locator("text=Welcome!")).toBeVisible({
    timeout: 8000,
  }) // and alternates between greetings
  await expect(page.locator("text=New Wallet")).toBeVisible() // has a button to create a new wallet
  await expect(page.locator("text=Restore Wallet")).toBeVisible() // has a button to restore a wallet
})
