import { expect } from "@playwright/test"

import { extension, test } from "../test"

test.describe("Network", () => {
  test("Available networks", async () => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.ensureAvailableNetworks([
      "Mainnet\nhttps://alpha-mainnet.starknet.io",
      "Testnet\nhttps://alpha4.starknet.io",
      "Testnet 2\nhttps://alpha4-2.starknet.io",
      "Localhost 5050\nhttp://localhost:5050",
    ])
  })
})
