import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"
import {
  downloadGitHubRelease,
  generateEmail,
  getBalance,
  requestFunds,
  unzip,
} from "../utils"

const strkInitialBalance = 5.1
const versions = ["6.19.5", "6.20.5"]
const downloadBuild = async (version: string) => {
  try {
    await downloadGitHubRelease(version)
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error:", err.message)
    } else {
      console.error("An unknown error occurred")
    }
  }
}
let currentVersionDir = ""
test.describe.serial("Upgrade Extension", { tag: "@upgrade" }, () => {
  versions.forEach((version) => {
    test.beforeAll(async () => {
      await downloadBuild(version)
      currentVersionDir = (await unzip(version)).replace(/\/[^\/]+$/, "")
    })

    test(`${version}: After upgrade, tokens and balances should be the same`, async ({
      upgradeExtension,
    }) => {
      //fetch balance from blockchain
      const [ethBalance, strkBalance] = await Promise.all([
        getBalance(config.migAccountAddress!, "ETH"),
        getBalance(config.migAccountAddress!, "STRK"),
      ])
      upgradeExtension.account.setMigVersion(version)
      await upgradeExtension.setExtensionVersion(
        version,
        `${currentVersionDir}/${version}`,
      )

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
      upgradeExtension.account.setMigVersion(version)
      await upgradeExtension.setExtensionVersion(
        version,
        `${currentVersionDir}/${version}`,
      )
      const email = generateEmail()
      const { accountAddresses, accountNames } =
        await upgradeExtension.setupWallet({
          email,
          accountsToSetup: [{ assets: [{ token: "ETH", balance: 0 }] }],
        })
      const accountName1 = accountNames![0]
      await expect(upgradeExtension.network.networkSelector).toBeVisible()
      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )
      await requestFunds(accountAddresses[0], strkInitialBalance, "STRK")
      await expect(upgradeExtension.account.currentBalance("STRK")).toHaveText(
        `${strkInitialBalance} STRK`,
      )
      await upgradeExtension.deployAccount(accountName1)
    })

    test(`${version}: Create regular account, deploy, upgrade, do a TX, add and deploy new account`, async ({
      upgradeExtension,
    }) => {
      upgradeExtension.account.setMigVersion(version)
      await upgradeExtension.setExtensionVersion(
        version,
        `${currentVersionDir}/${version}`,
      )

      const { accountNames } = await upgradeExtension.setupWallet({
        accountsToSetup: [
          {
            assets: [{ token: "STRK", balance: strkInitialBalance }],
            deploy: true,
          },
        ],
      })
      const accountName1 = accountNames![0]
      await expect(upgradeExtension.network.networkSelector).toBeVisible()
      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )
      const { accountAddress, accountName: accountName2 } =
        await upgradeExtension.account.addAccount({
          firstAccount: false,
        })

      const { sendAmountTX, sendAmountFE } =
        await upgradeExtension.account.transfer({
          originAccountName: accountName1,
          recipientAddress: accountAddress!,
          token: "STRK",
          amount: "MAX",
        })

      const txHash = await upgradeExtension.activity.getLastTxHash()
      await upgradeExtension.validateTx({
        txHash: txHash!,
        receiver: accountAddress!,
        sendAmountFE,
        sendAmountTX,
      })

      await upgradeExtension.deployAccount(accountName2!)

      await upgradeExtension.account.transfer({
        originAccountName: accountName2!,
        recipientAddress: config.destinationAddress!,
        token: "STRK",
        amount: "MAX",
      })
    })

    test(`${version}: Create a Smart account, deploy it, upgrade, do a TX`, async ({
      upgradeExtension,
    }) => {
      upgradeExtension.account.setMigVersion(version)
      await upgradeExtension.setExtensionVersion(
        version,
        `${currentVersionDir}/${version}`,
      )

      const email = generateEmail()
      const { accountNames } = await upgradeExtension.setupWallet({
        email,
        accountsToSetup: [
          {
            assets: [{ token: "STRK", balance: strkInitialBalance }],
            deploy: true,
          },
        ],
      })
      const accountName1 = accountNames![0]
      await expect(upgradeExtension.network.networkSelector).toBeVisible()
      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )
      await upgradeExtension.account.transfer({
        originAccountName: accountName1,
        recipientAddress: config.destinationAddress!,
        token: "STRK",
        amount: "MAX",
      })
    })

    test(`${version}: Create regular account, fund it with ETH and USDC, upgrade, deploy, do a TX, check USDC is visible`, async ({
      upgradeExtension,
    }) => {
      const usdcAmount = "0.000002"
      upgradeExtension.account.setMigVersion(version)
      await upgradeExtension.setExtensionVersion(
        version,
        `${currentVersionDir}/${version}`,
      )

      const { accountAddresses, accountNames } =
        await upgradeExtension.setupWallet({
          accountsToSetup: [
            { assets: [{ token: "STRK", balance: strkInitialBalance }] },
          ],
        })
      const accountName1 = accountNames![0]
      await requestFunds(accountAddresses[0], +usdcAmount, "USDC")
      await expect(upgradeExtension.account.currentBalance("USDC")).toHaveText(
        `${usdcAmount} USDC`,
      )
      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )

      await expect(upgradeExtension.account.currentBalance("USDC")).toHaveText(
        `${usdcAmount} USDC`,
      )
      await upgradeExtension.deployAccount(accountName1)

      await upgradeExtension.account.transfer({
        originAccountName: accountName1,
        recipientAddress: config.destinationAddress!,
        token: "STRK",
        amount: "MAX",
      })
    })

    test(`${version}: Create regular account, deploy it, login with a valid email, upgrade, activate 2FA, do a TX`, async ({
      upgradeExtension,
    }) => {
      upgradeExtension.account.setMigVersion(version)
      await upgradeExtension.setExtensionVersion(
        version,
        `${currentVersionDir}/${version}`,
      )

      const { accountNames } = await upgradeExtension.setupWallet({
        accountsToSetup: [
          {
            assets: [{ token: "STRK", balance: strkInitialBalance }],
            deploy: true,
          },
        ],
      })
      const accountName1 = accountNames![0]
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
        accountName: accountName1,
        validSession: true,
      })
      await upgradeExtension.account.transfer({
        originAccountName: accountName1,
        recipientAddress: config.destinationAddress!,
        token: "STRK",
        amount: "MAX",
      })
    })

    test(`${version}: Create regular accounts, edit account names, upgrade, check account names`, async ({
      upgradeExtension,
    }) => {
      upgradeExtension.account.setMigVersion(version)
      await upgradeExtension.setExtensionVersion(
        version,
        `${currentVersionDir}/${version}`,
      )

      const { accountNames } = await upgradeExtension.setupWallet({
        accountsToSetup: [
          {
            assets: [{ token: "ETH", balance: 0 }],
          },
          {
            assets: [{ token: "ETH", balance: 0 }],
          },
        ],
      })
      const accountName1 = accountNames![0]
      const accountName2 = accountNames![1]
      await expect(upgradeExtension.network.networkSelector).toBeVisible()
      await upgradeExtension.account.ensureSelectedAccount(accountName1)
      await upgradeExtension.navigation.showSettingsLocator.click()
      await upgradeExtension.settings.account(accountName1).click()
      await upgradeExtension.settings.setAccountName("My new account name 1")
      await expect(upgradeExtension.settings.accountName).toHaveValue(
        "My new account name 1",
      )
      await upgradeExtension.navigation.backLocator.click()
      await upgradeExtension.navigation.closeLocator.click()

      await upgradeExtension.account.ensureSelectedAccount(
        "My new account name 1",
      )
      await upgradeExtension.account.ensureSelectedAccount(accountName2)

      await upgradeExtension.navigation.showSettingsLocator.click()
      await upgradeExtension.settings.account(accountName2).click()
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
      upgradeExtension.account.setMigVersion(version)
      await upgradeExtension.setExtensionVersion(
        version,
        `${currentVersionDir}/${version}`,
      )
      await upgradeExtension.setupWallet({
        accountsToSetup: [],
      })
      await upgradeExtension.account.addMultisigAccount({})
      await upgradeExtension.navigation.closeLocator.click()
      await expect(
        upgradeExtension.page.locator('[data-testid="activate-multisig"]'),
      ).toBeHidden()
      const { accountName } = await upgradeExtension.account.lastAccountInfo()
      await upgradeExtension.fundMultisigAccount({
        accountName: accountName!,
        balance: strkInitialBalance,
        token: "STRK",
      })
      await expect(
        upgradeExtension.page.locator('[data-testid="activate-multisig"]'),
      ).toBeVisible()
      await upgradeExtension.activateMultisig(accountName!)

      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )

      const { sendAmountTX, sendAmountFE } =
        await upgradeExtension.account.transfer({
          originAccountName: accountName!,
          recipientAddress: config.destinationAddress!,
          token: "STRK",
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
      upgradeExtension.account.setMigVersion(version)
      await upgradeExtension.setExtensionVersion(
        version,
        `${currentVersionDir}/${version}`,
      )

      const { seed } = await upgradeExtension.setupWallet({
        accountsToSetup: [
          {
            assets: [{ token: "ETH", balance: 0 }],
          },
        ],
      })
      await expect(upgradeExtension.network.networkSelector).toBeVisible()
      const { accountAddress, accountName: accountName2 } =
        await upgradeExtension.account.addAccount({
          firstAccount: false,
        })

      await requestFunds(accountAddress!, strkInitialBalance, "STRK")
      await expect(upgradeExtension.account.currentBalance("STRK")).toHaveText(
        `${strkInitialBalance} STRK`,
      )
      await upgradeExtension.resetExtension()
      await upgradeExtension.recoverWallet(seed)
      await expect(upgradeExtension.network.networkSelector).toBeVisible()

      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )
      await upgradeExtension.deployAccount(accountName2!)

      await upgradeExtension.account.transfer({
        originAccountName: accountName2!,
        recipientAddress: config.destinationAddress!,
        token: "STRK",
        amount: "MAX",
      })
    })

    test(`${version}: Create a new wallet, deploy account and mint NFT, upgrade, NFT is visible and can be transfer`, async ({
      upgradeExtension,
      dappPage,
    }) => {
      upgradeExtension.account.setMigVersion(version)
      await upgradeExtension.setExtensionVersion(
        version,
        `${currentVersionDir}/${version}`,
      )
      const spokCampaignName = `${config.spokCampaignName!}`
      const { accountAddresses, accountNames } =
        await upgradeExtension.setupWallet({
          accountsToSetup: [
            {
              assets: [{ token: "STRK", balance: 3 }],
              deploy: true,
              feeToken: "STRK",
            },
            { assets: [{ token: "ETH", balance: 0 }] },
          ],
        })

      const accountName1 = accountNames![0]
      const accountName2 = accountNames![1]
      await upgradeExtension.account.ensureSelectedAccount(accountName1)
      await dappPage.claimSpok()
      await upgradeExtension.dapps.knownDappButton.click()
      await upgradeExtension.dapps.ensureKnowDappText()
      await upgradeExtension.dapps.closeButtonDappInfoLocator.click()
      await upgradeExtension.dapps.accept.click()
      await dappPage.page.getByRole("button", { name: "Claim now" }).click()
      await Promise.all([
        upgradeExtension.navigation.confirmLocator.click(),
        expect(
          upgradeExtension.activity.menuPendingTransactionsIndicatorLocator,
        ).toBeVisible(),
      ])
      await expect(
        upgradeExtension.activity.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden()

      await upgradeExtension.navigation.menuNTFsLocator.click()
      await upgradeExtension.nfts.collection(spokCampaignName).click()
      await upgradeExtension.nfts.nftByPosition().click()
      await upgradeExtension.account.send.click()

      //upgrade extension
      await upgradeExtension.upgradeExtension(
        upgradeExtension.currentBranchVersion,
      )
      await upgradeExtension.navigation.menuNTFsLocator.click()
      await upgradeExtension.nfts.collection(spokCampaignName).click()
      await upgradeExtension.nfts.nftByPosition().click()
      await upgradeExtension.account.send.click()
      await upgradeExtension.account.fillRecipientAddress({
        recipientAddress: accountAddresses[1],
      })
      await upgradeExtension.nfts.reviewSendLocator.click()
      await Promise.all([
        upgradeExtension.account.confirmLocator.click(),
        expect(
          upgradeExtension.activity.menuPendingTransactionsIndicatorLocator,
        ).toBeVisible(),
      ])
      const txHash = await upgradeExtension.activity.getLastTxHash()
      await expect(
        upgradeExtension.activity.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden()
      await upgradeExtension.validateTx({
        txHash: txHash!,
        receiver: accountAddresses[1],
        txType: "nft",
      })

      await upgradeExtension.navigation.menuTokensLocator.click()
      await upgradeExtension.navigation.menuNTFsLocator.click()
      await expect(
        upgradeExtension.nfts.collection(spokCampaignName),
      ).toBeHidden()

      await upgradeExtension.account.ensureSelectedAccount(accountName2)
      await upgradeExtension.navigation.menuNTFsLocator.click()
      await upgradeExtension.nfts.collection(spokCampaignName).click()
      await upgradeExtension.nfts.nftByPosition().click()
    })
  })
})
