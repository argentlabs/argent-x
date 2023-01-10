import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

import { formatTruncatedAddressOriginal } from "../utils"

export async function selectAccountFromAccountList(
  page: Page,
  address: string,
) {
  await expect(page.locator("h6:has-text(' accounts')")).toBeVisible()
  await page.click(`text=${formatTruncatedAddressOriginal(address)}`)
}
