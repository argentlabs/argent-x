import { expect } from "@playwright/test"

import test from "../test"
import config from "../config"

test.describe("Network", () => {
  test(
    "Available networks",
    {
      tag: "@all",
    },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.network.ensureAvailableNetworks([
        "Mainnet",
        "Sepolia",
        "Devnet\n\nhttp://localhost:5050",
      ])
    },
  )

  test(
    "User should not be able to delete selected network",
    {
      tag: "@all",
    },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.advancedSettings.click()
      await extension.developerSettings.manageNetworks.click()

      //add new network
      await extension.developerSettings.addNetwork.click()
      await extension.developerSettings.networkName.fill("My Network")
      await extension.developerSettings.chainId.fill("SN_SEPOLIA")
      await extension.developerSettings.rpcUrl.fill("https://rpc.something.com")
      await extension.navigation.createLocator.click()
      await expect(
        extension.developerSettings.networkByName("My Network"),
      ).toBeVisible()
      await extension.navigation.backLocator.click()
      await extension.navigation.backLocator.click()
      await extension.navigation.closeLocator.click()
      if (!config.isProdTesting) {
        await extension.network.ensureSelectedNetwork("Sepolia")
      } else {
        await extension.network.ensureSelectedNetwork("Mainnet")
      }
      // add account
      await extension.network.selectNetwork("My Network")
      await extension.account.addAccount({ firstAccount: true })

      // select network
      await extension.network.selectNetwork("My Network")
      await extension.navigation.closeLocator.click()
      // try to delete network
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.advancedSettings.click()
      await extension.developerSettings.manageNetworks.click()
      await extension.developerSettings
        .deleteNetworkByName("My Network")
        .click()
      await extension.navigation.cancelLocator.click()
      await expect(
        extension.developerSettings.networkByName("My Network"),
      ).toBeVisible()

      await extension.navigation.backLocator.click()
      await extension.navigation.backLocator.click()
      await extension.navigation.closeLocator.click()
      await extension.network.ensureSelectedNetwork("My Network")
      // select other network
      await extension.network.selectDefaultNetwork()
      // delete network
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.advancedSettings.click()
      await extension.developerSettings.manageNetworks.click()
      await extension.developerSettings
        .deleteNetworkByName("My Network")
        .click()
      await expect(
        extension.developerSettings.networkByName("My Network"),
      ).not.toBeVisible()
    },
  )

  test("User should be able to restore default networks if network is not selected", async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.advancedSettings.click()
    await extension.developerSettings.manageNetworks.click()

    //add new network
    await extension.developerSettings.addNetwork.click()
    await extension.developerSettings.networkName.fill("My Network")
    await extension.developerSettings.chainId.fill("SN_GOERLI")
    await extension.developerSettings.rpcUrl.fill(config.rpcUrl!)

    await extension.navigation.createLocator.click()
    await expect(
      extension.developerSettings.networkByName("My Network"),
    ).toBeVisible()
    await extension.navigation.backLocator.click()
    await extension.navigation.backLocator.click()
    await extension.navigation.closeLocator.click()

    // add account
    await extension.network.selectNetwork("My Network")
    await extension.account.addAccount({ firstAccount: true })
    await extension.network.selectDefaultNetwork()

    // try to restore networks
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.advancedSettings.click()
    await extension.developerSettings.manageNetworks.click()
    await extension.developerSettings.restoreDefaultNetworks.click()
    await expect(
      extension.developerSettings.networkByName("My Network"),
    ).not.toBeVisible()
  })
})
