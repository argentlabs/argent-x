import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

export async function switchNetwork(page: Page, targetNetworkName: string) {
  const networkSelector = "button[aria-label='Selected network']"
  const networkSelectorItem = `button[data-testid='${targetNetworkName}']`

  await page.waitForSelector(networkSelector)

  const networkSwitcher = await page.locator(networkSelector).elementHandle()

  if (!networkSwitcher) {
    return expect(networkSwitcher).toBeTruthy()
  }
  await networkSwitcher.click()

  const networkToSelect = await page.waitForSelector(networkSelectorItem)

  await networkToSelect.click()
}
