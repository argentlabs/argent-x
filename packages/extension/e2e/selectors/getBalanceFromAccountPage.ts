import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

import { navigateBack } from "../steps/navigateBack"
import { navigateFromAccountToTokenDetails } from "../steps/navigateFromAccountToTokenDetails"

export async function getBalanceFromAccountPage(
  page: Page,
  tokenName: string,
): Promise<string> {
  await navigateFromAccountToTokenDetails(page, tokenName)
  const balanceEl = await page.waitForSelector("[data-testid='tokenBalance']")
  await page.waitForTimeout(1000) // wait for token balance to update
  const balance = await balanceEl.textContent()
  if (!balance) {
    return expect(balance).toBeTruthy() as never
  }
  await navigateBack(page)
  return balance
}
