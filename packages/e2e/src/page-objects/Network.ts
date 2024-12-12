import { Page, expect } from "@playwright/test"
import Navigation from "./Navigation"

type NetworkName = "Devnet" | "Sepolia" | "Mainnet" | "My Network"

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
      defaultNetworkId = "sepolia-alpha"
      break

    default:
      throw new Error(`Unknown ARGENTX_ENVIRONMENT: ${argentXEnv}`)
  }

  return defaultNetworkId
}
export default class Network extends Navigation {
  // Change 'private' to 'protected' or 'public' to match the base class
  constructor(page: Page) {
    super(page)
  }

  get networkSelector() {
    return this.page.getByLabel("Show account list")
  }

  networkOption(name: string) {
    return this.page.locator(`button[role="menuitem"] span:text-is("${name}")`)
  }

  async selectNetwork(networkName: NetworkName) {
    await this.networkSelector.click()
    await this.page.locator('[data-testid="network-switcher-button"]').click()
    await this.networkOption(networkName).click()
  }

  async selectDefaultNetwork() {
    const networkName = this.getDefaultNetworkName()
    await this.networkSelector.click()
    await this.page.locator('[data-testid="network-switcher-button"]').click()
    await this.networkOption(networkName).click()
    const accounts = await this.page
      .locator('[aria-label^="Select A"]')
      .allInnerTexts()
    if (accounts.length > 0) {
      await this.page.locator('[aria-label^="Select A"]').first().click()
    } else {
      await this.closeButtonLocator.click()
    }
  }

  async ensureAvailableNetworks(networks: string[]) {
    await this.networkSelector.click()
    await this.page.locator('[data-testid="network-switcher-button"]').click()
    const availableNetworks = await this.page
      .locator('[role="menu"] button')
      .allInnerTexts()
    return expect(availableNetworks).toEqual(networks)
  }

  getDefaultNetworkName() {
    const defaultNetworkId = getDefaultNetwork()
    switch (defaultNetworkId.toLowerCase()) {
      case "mainnet-alpha":
        return "Mainnet"
      case "sepolia-alpha":
        return "Sepolia"
      case "goerli-alpha":
        return "Goerli"
      default:
        throw new Error(`Unknown ARGENTX_Network: ${defaultNetworkId}`)
    }
  }

  ensureSelectedNetwork(networkName: NetworkName) {
    return expect(this.networkSelector).toContainText(networkName)
  }
}
