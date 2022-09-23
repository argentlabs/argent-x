import { expect } from "@playwright/test"

import { test } from "./fixture"
import { openExtension } from "./steps/openExtension"

test("Welcome page is shown correctly", async ({ page, context }) => {
  await openExtension(page, context)

  await expect(page.locator("text=Welcome to Argent X")).toBeVisible({
    timeout: 8000,
  }) // page is live
  await expect(page.locator("text=Create a new wallet")).toBeVisible() // has a button to create a new wallet
  await expect(page.locator("text=Restore an existing wallet")).toBeVisible() // has a button to restore a wallet
})
