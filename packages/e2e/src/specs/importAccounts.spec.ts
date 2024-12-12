import { expect } from "@playwright/test"
import config from "../config"
import test from "../test"
import { TokenSymbol, transferTokens } from "../utils"
const accountsToImport = JSON.parse(config.accountsToImport || "[]")
const txAccountAddress = config.accountToImportAndTx![0]
const txAccountPK = config.accountToImportAndTx![1]

test.afterAll(({}) => {
  transferTokens(0.01, config.accountToImportAndTx![0], "ETH")
})

test.describe("Import accounts", () => {
  for (let i = 0; i < accountsToImport.length; i++) {
    const account = accountsToImport[i]
    test(`User should be able to import ${account.name} account`, async ({
      extension,
    }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await extension.account.importAccount({
        address: account.address,
        privateKey: account.pk,
      })
      await extension.account.selectAccount(
        extension.account.importedAccountName1,
      )
      const promises: Promise<void>[] = []
      for (const [token, amount] of Object.entries(account.balance)) {
        promises.push(
          expect(
            extension.account.currentBalance(token as TokenSymbol),
          ).toContainText(`${amount}`),
        )
      }
      await Promise.all(promises)
    })
  }

  test(
    `User should be able to sign a TX with an imported account`,
    { tag: "@tx" },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await extension.account.importAccount({
        address: txAccountAddress,
        privateKey: txAccountPK,
      })
      await extension.account.accountListSelector.click()

      await Promise.all([
        expect(extension.account.accountGroup("my-accounts")).toBeVisible(),
        expect(
          extension.account.accountGroup("imported-accounts"),
        ).toBeVisible(),
      ])
      await extension.navigation.closeButtonLocator.click()
      const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
        originAccountName: extension.account.importedAccountName1,
        recipientAddress: config.senderAddrs![0],
        token: "ETH",
        amount: 0.005,
        feeToken: "ETH",
      })
      const txHash = await extension.activity.getLastTxHash()
      await extension.validateTx({
        txHash: txHash!,
        receiver: config.senderAddrs![0],
        sendAmountFE,
        sendAmountTX,
      })
    },
  )

  test(`User should not be able to import an account with an invalid private key`, async ({
    extension,
  }) => {
    await extension.wallet.newWalletOnboarding()
    await extension.open()
    await extension.account.importAccount({
      address: txAccountAddress,
      privateKey: txAccountPK.replace("a", "b"),
      validPK: false,
    })
  })
})
