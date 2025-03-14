import { expect } from "@playwright/test"
import config from "../config"
import test from "../test"
import { TokenSymbol, requestFunds } from "../utils"
const accountsToImport = JSON.parse(config.accountsToImport || "[]")
const txAccountAddress = config.accountToImportAndTx![0]
const txAccountPK = config.accountToImportAndTx![1]
const accountsToImportProd = JSON.parse(config.accountsToImportProd || "[]")

test.describe("Import accounts", () => {
  for (let i = 0; i < accountsToImport.length; i++) {
    const account = accountsToImport[i]
    test(`User should be able to import ${account.name} account`, async ({
      extension,
    }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await extension.account.setupRecovery()
      await extension.account.importAccount({
        address: account.address,
        privateKey: account.pk,
      })
      const { accountName } = await extension.account.lastAccountInfo()
      await extension.account.selectAccount(accountName!)
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
      await extension.account.setupRecovery()
      await extension.account.importAccount({
        address: txAccountAddress,
        privateKey: txAccountPK,
      })
      const { accountName } = await extension.account.lastAccountInfo()
      await extension.account.accountListSelector.click()

      await Promise.all([
        expect(extension.account.accountGroup("my-accounts")).toBeVisible(),
        expect(
          extension.account.accountGroup("imported-accounts"),
        ).toBeVisible(),
      ])
      await extension.navigation.closeButtonLocator.click()
      const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
        originAccountName: accountName!,
        recipientAddress: config.senderAddrs![0],
        token: "ETH",
        amount: 0.005,
        feeToken: "ETH",
      })
      const txHash = await extension.activity.getLastTxHash()
      await Promise.all([
        extension.validateTx({
          txHash: txHash!,
          receiver: config.senderAddrs![0],
          sendAmountFE,
          sendAmountTX,
        }),
        requestFunds(txAccountAddress, 0.01, "ETH"),
      ])
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

  test(
    `User should be able to import only Argent X account on prod`,
    { tag: "@prodOnly" },
    async ({ extension }) => {
      await extension.wallet.newWalletOnboarding()
      await extension.open()
      await extension.account.importAccount({
        address: accountsToImportProd[0].address,
        privateKey: accountsToImportProd[0].pk,
      })
      await extension.account.selectAccount("Logical Lizard")
      await extension.account.importAccount({
        address: accountsToImportProd[1].address,
        privateKey: accountsToImportProd[1].pk,
      })
      await expect(
        extension.page.getByText("This account is not an Argent account"),
      ).toBeVisible()
    },
  )
})
