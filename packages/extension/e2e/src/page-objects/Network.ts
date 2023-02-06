import { Page, expect } from "@playwright/test"
type NetworkName = "Localhost 5050" | "Testnet" | "Testnet2" | "Mainnet"
export default class Network {
  constructor(private page: Page) {}
  get networkSelector() {
    return this.page.locator('button[aria-label="Selected network"]')
  }

  networkOption(name: string) {
    return this.page.locator(`button[role="menuitem"]:has-text("${name}")`)
  }

  async selectNetwork(networkName: NetworkName) {
    await this.networkSelector.click()
    await this.networkOption(networkName).click()
  }

  async ensureAvailableNetworks(networks: string[]) {
    await this.networkSelector.click()
    const availableNetworks = await this.page
      .locator('[role="menu"] button')
      .allInnerTexts()
    return networks.map((net) => expect(availableNetworks).toContain(net))
  }
}
