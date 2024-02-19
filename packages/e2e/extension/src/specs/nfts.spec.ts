import { expect } from "@playwright/test"

import config from "../../../shared/config"
import test from "../test"
const spokCampaignName = `${config.spokCampaignName!}`
for (const feeToken of ["STRK", "ETH"] as const) {
  test.describe(`Nfts ${feeToken}`, () => {
    test(`User should be able to claim and send a NFT`, async ({
      extension,
      browserContext,
    }) => {
      const { accountAddresses } = await extension.setupWallet({
        accountsToSetup: [
          {
            assets: [
              { token: "ETH", balance: 0.01 },
              { token: "STRK", balance: 0.005 },
            ],
            deploy: true,
            feeToken,
          },
          { assets: [{ token: "ETH", balance: 0 }] },
        ],
      })
      await extension.account.ensureSelectedAccount(
        extension.account.accountName1,
      )
      const dapp = await extension.dapps.claimSpok(browserContext)
      await extension.dapps.knownDappButton.click()
      await extension.dapps.ensureKnowDappText()
      await extension.dapps.closeButtonLocator.click()
      await extension.dapps.accept.click()
      await dapp.getByRole("button", { name: "Claim now" }).click()
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
      await expect(
        extension.activity.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden()
      await extension.navigation.menuNTFsLocator.click()
      await expect(extension.nfts.collection(spokCampaignName)).toBeHidden()

      await extension.account.ensureSelectedAccount(
        extension.account.accountName2,
      )
      await extension.nfts.collection(spokCampaignName).click()
      await extension.nfts.nftByPosition().click()
    })
  })
}
