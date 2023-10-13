import { Page, expect } from "@playwright/test"
type NetworkName = "Localhost 5050" | "Testnet" | "Mainnet" | "My Network"
export function getDefaultNetwork() {
  const argentXEnv = process.env.ARGENT_X_ENVIRONMENT

  if (!argentXEnv) {
    throw new Error("ARGENT_X_ENVIRONMENT not set")
  }
  let defaultNetworkId: string
  switch (argentXEnv.toLowerCase()) {
    case "prod":
    case "staging":
      defaultNetworkId = "mainnet-alpha"
      break

    case "hydrogen":
    case "test":
      defaultNetworkId = "goerli-alpha"
      break

    default:
      throw new Error(`Unknown ARGENTX_ENVIRONMENT: ${argentXEnv}`)
  }

  return defaultNetworkId
}
export default class Network {
  constructor(private page: Page) {}
  get networkSelector() {
    return this.page.locator('button[aria-label="Selected network"]')
  }

  networkOption(name: string) {
    return this.page.locator(`button[role="menuitem"] span:text-is("${name}")`)
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

  getDefaultNetworkName() {
    const defaultNetworkId = getDefaultNetwork()
    switch (defaultNetworkId.toLowerCase()) {
      case "mainnet-alpha":
        return "Mainnet"
      case "goerli-alpha":
        return "Testnet"
      default:
        throw new Error(`Unknown ARGENTX_Network: ${defaultNetworkId}`)
    }
  }
}
