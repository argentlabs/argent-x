import { expect } from "@playwright/test"

import config from "../config"
import test from "../test"
const spokCampaignName = `${config.spokCampaignName!}`
const strkInitialBalance = "5.0"
test.describe(`Nfts STRK`, { tag: "@tx" }, () => {
  test(`User should be able to claim and send a NFT`, async ({
    extension,
    dappPage,
  }) => {
    const { accountAddresses, accountNames } = await extension.setupWallet({
      accountsToSetup: [
        {
          assets: [{ token: "STRK", balance: strkInitialBalance }],
          deploy: true,
          feeToken: "STRK",
        },
        { assets: [{ token: "ETH", balance: 0 }] },
      ],
    })

    const accountName1 = accountNames![0]
    const accountName2 = accountNames![1]
    await extension.account.ensureSelectedAccount(accountName1)
    await dappPage.claimSpok()
    await extension.dapps.knownDappButton.click()
    await extension.dapps.ensureKnowDappText()
    await extension.dapps.closeButtonDappInfoLocator.click()
    await extension.dapps.accept.click()
    await dappPage.page.getByRole("button", { name: "Claim now" }).click()
    await Promise.all([
      extension.navigation.confirmLocator.click(),
      expect(
        extension.activity.menuPendingTransactionsIndicatorLocator,
      ).toBeVisible(),
    ])
    await expect(
      extension.activity.menuPendingTransactionsIndicatorLocator,
    ).toBeHidden()

    await extension.navigation.menuNTFsLocator.click()
    await extension.nfts.collection(spokCampaignName).click()
    await extension.nfts.nftByPosition().click()

    await extension.account.send.click()
    await extension.account.fillRecipientAddress({
      recipientAddress: accountAddresses[1],
    })
    await extension.nfts.reviewSendLocator.click()
    await Promise.all([
      extension.account.confirmLocator.click(),
      expect(
        extension.activity.menuPendingTransactionsIndicatorLocator,
      ).toBeVisible(),
    ])
    const txHash = await extension.activity.getLastTxHash()
    await expect(
      extension.activity.menuPendingTransactionsIndicatorLocator,
    ).toBeHidden()
    await extension.validateTx({
      txHash: txHash!,
      receiver: accountAddresses[1],
      txType: "nft",
    })

    await extension.navigation.menuTokensLocator.click()
    await extension.navigation.menuNTFsLocator.click()
    await expect(extension.nfts.collection(spokCampaignName)).toBeHidden()

    await extension.account.ensureSelectedAccount(accountName2)
    await extension.navigation.menuNTFsLocator.click()
    await extension.nfts.collection(spokCampaignName).click()
    await extension.nfts.nftByPosition().click()
  })
})
