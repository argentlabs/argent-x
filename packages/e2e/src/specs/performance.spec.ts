import { expect } from "@playwright/test"
import test from "../test"
import { PerformanceTestCase, PerformanceTestRunner } from "../utils"
import config from "../config"

// Test cases configuration
const performanceTests: PerformanceTestCase[] = [
  {
    name: "create-new-wallet",
    description: "Create new wallet performance",
    skip: false,
    useRegexp: true,
    action: async (extension) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
    },
    assertions: async (extension) => {
      await expect(extension.network.networkSelector).toBeVisible()
    },
    thresholds: {
      maxRegressionPercent: 10,
    },
  },
  {
    name: "recovery-wallet-33-accounts",
    description: "Recovery Wallet with 33 accounts performance",
    skip: false,
    useRegexp: false,
    action: async (extension) => {
      await extension.open()
      await extension.recoverWallet(config.testSeed1!)
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.network.selectDefaultNetwork()
      await extension.account.selectAccount("Automated Aubergine")
    },
    assertions: async (extension) => {
      await expect(extension.account.currentBalance("ETH")).toContainText(
        "0.000",
      )
    },
    thresholds: {
      maxRegressionPercent: 10,
    },
  },
]

// Test suite
test.describe.serial("Performance tests", () => {
  const runner = new PerformanceTestRunner()

  for (const testCase of performanceTests.filter((test) => !test.skip)) {
    test(
      `${testCase.description}`,
      { tag: "@performance" },
      async ({ extension }) => {
        await runner.runTest(testCase, extension)
      },
    )
  }
})
