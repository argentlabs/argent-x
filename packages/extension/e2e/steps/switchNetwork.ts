import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

export async function switchNetwork(page: Page, targetNetworkName: string) {
  const networkSwitcher = await page
    .locator("[aria-label='Selected network']")
    .elementHandle()
  if (!networkSwitcher) {
    return expect(networkSwitcher).toBeTruthy()
  }
  await networkSwitcher.click()
  const networkToSelect = await networkSwitcher.$(`text=${targetNetworkName}`)
  if (!networkToSelect) {
    return expect(networkToSelect).toBeTruthy()
  }
  await networkToSelect.click()
}
