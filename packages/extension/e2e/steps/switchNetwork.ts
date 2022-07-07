import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

export async function switchNetwork(page: Page, targetNetworkName: string) {
  const networkSwitcher = await page.$(
    "[aria-label='Selected network'] >> xpath=..",
  )
  if (!networkSwitcher) {
    return expect(networkSwitcher).toBeTruthy()
  }
  await networkSwitcher.hover()
  const networkToSelect = await networkSwitcher.$(`text=${targetNetworkName}`)
  if (!networkToSelect) {
    return expect(networkToSelect).toBeTruthy()
  }
  await networkToSelect.click()
}
