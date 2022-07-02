import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

export async function getAccountAddressFromAccountPage(
  page: Page,
): Promise<string> {
  await page.click("text=Add funds")
  await page.click("text=From another StarkNet account")
  const fullAddressEl = await page.waitForSelector(
    "[aria-label='Full account address']",
  )
  const addressText = await fullAddressEl.textContent()
  if (!addressText) {
    return expect(addressText).toBeTruthy() as never
  }
  const address = addressText.replaceAll(" ", "")
  await page.click("[aria-label='Close']")
  return address
}
