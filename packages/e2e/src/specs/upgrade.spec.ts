import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"
import {
  downloadFile,
  generateEmail,
  getBalance,
  transferTokens,
} from "../utils"

const ethInitialBalance = 0.01 * Number(config.initialBalanceMultiplier)
const versions = ["5.19.4"]
const downloadBuild = async (version: string) => {
  try {
    await downloadFile(version)
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error:", err.message)
    } else {
      console.error("An unknown error occurred")
    }
  }
}
test.describe.serial("Upgrade Extension", { tag: "@upgrade" }, () => {
  versions.forEach((version) => {
    test.slow()
    test(`${version}: After upgrade, tokens and balances should be the same`, async ({
      upgradeExtension,
    }) => {
      await downloadBuild(version)
      //fetch balance from blockchain
      const [ethBalance, strkBalance] = await Promise.all([
        getBalance(config.migAccountAddress!, "ETH"),
        getBalance(config.migAccountAddress!, "STRK"),
      ])
      await upgradeExtension.setExtensionVersion(version)

      await upgradeExtension.recoverWallet(config.testSeed3!)
      await expect(upgradeExtension.network.networkSelector).toBeVisible()

      //check balance
      await Promise.all([
        expect(upgradeExtension.account.currentBalance("ETH")).toContainText(
          ethBalance,
        ),
        expect(upgradeExtension.account.currentBalance("STRK")).toContainText(
          strkBalance,
        ),
      ])

      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )

      //ensure that tokens are present and not duplicated
      await Promise.all([
        expect(upgradeExtension.account.currentBalance("ETH")).toHaveCount(1),
        expect(upgradeExtension.account.currentBalance("STRK")).toHaveCount(1),
      ])

      //check balance
      await Promise.all([
        expect(upgradeExtension.account.currentBalance("ETH")).toContainText(
          ethBalance,
        ),
        expect(upgradeExtension.account.currentBalance("STRK")).toContainText(
          strkBalance,
        ),
      ])
    })

    test(`${version}: Create a Smart account, leave it unfunded and undeployed`, async ({
      upgradeExtension,
    }) => {
      await downloadBuild(version)

      await upgradeExtension.setExtensionVersion(version)

      const email = generateEmail()
      const { accountAddresses } = await upgradeExtension.setupWallet({
        email,
        accountsToSetup: [{ assets: [{ token: "ETH", balance: 0 }] }],
      })
      await expect(upgradeExtension.network.networkSelector).toBeVisible()
      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )
      await transferTokens(ethInitialBalance, accountAddresses[0], "ETH")
      await upgradeExtension.deployAccount(
        upgradeExtension.account.accountName1,
      )
    })

    test(`${version}: Create regular account, deploy, upgrade, do a TX, add and deploy new account`, async ({
      upgradeExtension,
    }) => {
      await downloadBuild(version)
      await upgradeExtension.setExtensionVersion(version)

      await upgradeExtension.setupWallet({
        accountsToSetup: [
          {
            assets: [{ token: "ETH", balance: ethInitialBalance }],
            deploy: true,
          },
        ],
      })
      await expect(upgradeExtension.network.networkSelector).toBeVisible()
      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )
      const { accountAddress } = await upgradeExtension.account.addAccount({
        firstAccount: false,
      })

      const { sendAmountTX, sendAmountFE } =
        await upgradeExtension.account.transfer({
          originAccountName: upgradeExtension.account.accountName1,
          recipientAddress: accountAddress!,
          token: "ETH",
          amount: "MAX",
        })

      const txHash = await upgradeExtension.activity.getLastTxHash()
      await upgradeExtension.validateTx({
        txHash: txHash!,
        receiver: accountAddress!,
        sendAmountFE,
        sendAmountTX,
      })

      await upgradeExtension.deployAccount(
        upgradeExtension.account.accountName2,
      )

      await upgradeExtension.account.transfer({
        originAccountName: upgradeExtension.account.accountName2,
        recipientAddress: config.destinationAddress!,
        token: "ETH",
        amount: "MAX",
      })
    })

    test(`${version}: Create a Smart account, deploy it, upgrade, do a TX`, async ({
      upgradeExtension,
    }) => {
      await downloadBuild(version)

      await upgradeExtension.setExtensionVersion(version)

      const email = generateEmail()
      await upgradeExtension.setupWallet({
        email,
        accountsToSetup: [
          {
            assets: [{ token: "ETH", balance: ethInitialBalance }],
            deploy: true,
          },
        ],
      })
      await expect(upgradeExtension.network.networkSelector).toBeVisible()
      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )
      await upgradeExtension.account.transfer({
        originAccountName: upgradeExtension.account.accountName1,
        recipientAddress: config.destinationAddress!,
        token: "ETH",
        amount: "MAX",
      })
    })

    test(`${version}: Create regular account, fund it with ETH and USDC, upgrade, deploy, do a TX, check USDC is visible`, async ({
      upgradeExtension,
    }) => {
      const usdcAmount = "0.000002"
      await downloadBuild(version)
      await upgradeExtension.setExtensionVersion(version)

      const { accountAddresses } = await upgradeExtension.setupWallet({
        accountsToSetup: [
          { assets: [{ token: "ETH", balance: ethInitialBalance }] },
        ],
      })
      await transferTokens(+usdcAmount, accountAddresses[0], "USDC")
      await expect(upgradeExtension.account.currentBalance("USDC")).toHaveText(
        `${usdcAmount} USDC`,
        { timeout: 180 * 1000 },
      )
      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )

      await expect(upgradeExtension.account.currentBalance("USDC")).toHaveText(
        `${usdcAmount} USDC`,
        { timeout: 180 * 1000 },
      )
      await upgradeExtension.deployAccount(
        upgradeExtension.account.accountName1,
      )

      await upgradeExtension.account.transfer({
        originAccountName: upgradeExtension.account.accountName1,
        recipientAddress: config.destinationAddress!,
        token: "ETH",
        amount: "MAX",
      })
    })

    test(`${version}: Create regular account, deploy it, login with a valid email, upgrade, activate 2FA, do a TX`, async ({
      upgradeExtension,
    }) => {
      await downloadBuild(version)
      await upgradeExtension.setExtensionVersion(version)

      await upgradeExtension.setupWallet({
        accountsToSetup: [
          {
            assets: [{ token: "ETH", balance: ethInitialBalance }],
            deploy: true,
          },
        ],
      })
      await expect(upgradeExtension.network.networkSelector).toBeVisible()

      // login with a valid email
      const email = generateEmail()
      await upgradeExtension.navigation.showSettingsLocator.click()
      await upgradeExtension.settings.signIn(email)

      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )
      await upgradeExtension.activateSmartAccount({
        accountName: upgradeExtension.account.accountName1,
        validSession: true,
      })
      await upgradeExtension.account.transfer({
        originAccountName: upgradeExtension.account.accountName1,
        recipientAddress: config.destinationAddress!,
        token: "ETH",
        amount: "MAX",
      })
    })

    test(`${version}: Create regular accounts, edit account names, upgrade, check account names`, async ({
      upgradeExtension,
    }) => {
      await downloadBuild(version)
      await upgradeExtension.setExtensionVersion(version)

      await upgradeExtension.setupWallet({
        accountsToSetup: [
          {
            assets: [{ token: "ETH", balance: 0 }],
          },
          {
            assets: [{ token: "ETH", balance: 0 }],
          },
        ],
      })
      await expect(upgradeExtension.network.networkSelector).toBeVisible()
      await upgradeExtension.account.ensureSelectedAccount(
        upgradeExtension.account.accountName1,
      )

      await upgradeExtension.navigation.showSettingsLocator.click()
      await upgradeExtension.settings
        .account(upgradeExtension.account.accountName1)
        .click()
      await upgradeExtension.settings.setAccountName("My new account name 1")
      await expect(upgradeExtension.settings.accountName).toHaveValue(
        "My new account name 1",
      )
      await upgradeExtension.navigation.backLocator.click()
      await upgradeExtension.navigation.closeLocator.click()

      await upgradeExtension.account.ensureSelectedAccount(
        "My new account name 1",
      )
      await upgradeExtension.account.ensureSelectedAccount(
        upgradeExtension.account.accountName2,
      )

      await upgradeExtension.navigation.showSettingsLocator.click()
      await upgradeExtension.settings
        .account(upgradeExtension.account.accountName2)
        .click()
      await upgradeExtension.settings.setAccountName("My new account name 2")
      await expect(upgradeExtension.settings.accountName).toHaveValue(
        "My new account name 2",
      )
      await upgradeExtension.navigation.backLocator.click()
      await upgradeExtension.navigation.closeLocator.click()

      await upgradeExtension.account.ensureSelectedAccount(
        "My new account name 2",
      )
      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )

      await upgradeExtension.account.ensureSelectedAccount(
        "My new account name 1",
      )
      await upgradeExtension.account.ensureSelectedAccount(
        "My new account name 2",
      )
    })

    test(`${version}: create Multisig 1/1 account, upgrade, do tx`, async ({
      upgradeExtension,
    }) => {
      await downloadBuild(version)
      await upgradeExtension.setExtensionVersion(version)
      await upgradeExtension.setupWallet({
        accountsToSetup: [],
      })
      await upgradeExtension.account.addMultisigAccount({})
      await upgradeExtension.navigation.closeLocator.click()
      await expect(
        upgradeExtension.page.locator('[data-testid="activate-multisig"]'),
      ).toBeHidden()
      await upgradeExtension.fundMultisigAccount({
        accountName: upgradeExtension.account.accountNameMulti1,
        balance: ethInitialBalance,
      })
      await expect(
        upgradeExtension.page.locator('[data-testid="activate-multisig"]'),
      ).toBeVisible()
      await upgradeExtension.activateMultisig(
        upgradeExtension.account.accountNameMulti1,
      )

      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )

      const { sendAmountTX, sendAmountFE } =
        await upgradeExtension.account.transfer({
          originAccountName: upgradeExtension.account.accountNameMulti1,
          recipientAddress: config.destinationAddress!,
          token: "ETH",
          amount: "MAX",
        })
      const txHash = await upgradeExtension.activity.getLastTxHash()
      await upgradeExtension.validateTx({
        txHash: txHash!,
        receiver: config.destinationAddress!,
        sendAmountFE,
        sendAmountTX,
        uniqLocator: true,
      })
    })

    test(`${version}: Create regular account, deploy, recover, add new account, fund, do not deploy, upgrade, deploy account`, async ({
      upgradeExtension,
    }) => {
      await downloadBuild(version)
      await upgradeExtension.setExtensionVersion(version)

      const { seed } = await upgradeExtension.setupWallet({
        accountsToSetup: [
          {
            assets: [{ token: "ETH", balance: 0 }],
          },
        ],
      })
      await expect(upgradeExtension.network.networkSelector).toBeVisible()
      const { accountAddress } = await upgradeExtension.account.addAccount({
        firstAccount: false,
      })

      await transferTokens(ethInitialBalance, accountAddress!, "ETH")

      await upgradeExtension.resetExtension()
      await upgradeExtension.recoverWallet(seed)
      await expect(upgradeExtension.network.networkSelector).toBeVisible()

      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )

      await upgradeExtension.deployAccount(
        upgradeExtension.account.accountName2,
      )

      await upgradeExtension.account.transfer({
        originAccountName: upgradeExtension.account.accountName2,
        recipientAddress: config.destinationAddress!,
        token: "ETH",
        amount: "MAX",
      })
    })
  })
})
