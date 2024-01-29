import { expect } from "@playwright/test"
import test from "../test"
import config from "../config"
import { sleep } from "../utils/common"

test.describe("Multisig", () => {
  test("add and activate 1/1 multisig ", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [],
    })
    await extension.account.addMultisigAccount({})
    await extension.navigation.close.click()
    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti1,
      amount: 0.002,
    })
    await extension.activateMultisig(extension.account.accountNameMulti1)

    const amountTrx = await extension.account.transfer({
      originAccountName: extension.account.accountNameMulti1,
      recipientAddress: config.destinationAddress!,
      tokenName: "Ethereum",
      amount: "MAX",
    })
    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx(
      txHash!,
      config.destinationAddress!,
      amountTrx,
      true,
    )
    await extension.navigation.menuTokens.click()

    //ensure that balance is updated
    await expect(extension.account.currentBalance("Ethereum")).toContainText(
      "0.000",
      { timeout: 60000 },
    )
  })

  test("add and activate 1/2 multisig ", async ({
    extension,
    secondExtension,
  }) => {
    await extension.setupWallet({
      accountsToSetup: [],
    })
    await secondExtension.setupWallet({
      accountsToSetup: [],
    })
    const pubKey = await secondExtension.account.joinMultisig()
    await extension.account.addMultisigAccount({ signers: [pubKey] })
    await extension.navigation.close.click()
    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti1,
      amount: 0.002,
    })
    await extension.activateMultisig(extension.account.accountNameMulti1)

    await expect(
      secondExtension.account.accountListConfirmations(
        secondExtension.account.accountNameMulti1,
      ),
    ).toHaveText("1/2")
    await secondExtension.navigation.close.click()
    await secondExtension.account.selectAccount(
      secondExtension.account.accountNameMulti1,
    )
    await Promise.all([
      expect(extension.account.accountViewConfirmations).toHaveText(
        "1/2 multisig",
      ),
      expect(secondExtension.account.accountViewConfirmations).toHaveText(
        "1/2 multisig",
      ),
    ])

    const amountTrx = await extension.account.transfer({
      originAccountName: extension.account.accountNameMulti1,
      recipientAddress: config.destinationAddress!,
      tokenName: "Ethereum",
      amount: "MAX",
    })
    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx(
      txHash!,
      config.destinationAddress!,
      amountTrx,
      true,
    )
    await extension.navigation.menuTokens.click()

    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("Ethereum")).toContainText(
        "0.000",
        { timeout: 120000 },
      ),
      expect(secondExtension.account.currentBalance("Ethereum")).toContainText(
        "0.000",
        { timeout: 120000 },
      ),
    ])
    await secondExtension.validateTx(
      txHash!,
      config.destinationAddress!,
      amountTrx,
      true,
    )
  })

  test("add and activate 2/2 multisig ", async ({
    extension,
    secondExtension,
  }) => {
    await extension.setupWallet({
      accountsToSetup: [],
    })
    await secondExtension.setupWallet({
      accountsToSetup: [],
    })
    const pubKey = await secondExtension.account.joinMultisig()
    await extension.account.addMultisigAccount({
      signers: [pubKey],
      confirmations: 2,
    })
    await extension.navigation.close.click()
    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti1,
      amount: 0.002,
    })
    await extension.activateMultisig(extension.account.accountNameMulti1)

    await expect(
      secondExtension.account.accountListConfirmations(
        secondExtension.account.accountNameMulti1,
      ),
    ).toHaveText("2/2")
    await secondExtension.navigation.close.click()
    await secondExtension.account.selectAccount(
      secondExtension.account.accountNameMulti1,
    )
    await Promise.all([
      expect(extension.account.accountViewConfirmations).toHaveText(
        "2/2 multisig",
      ),
      expect(secondExtension.account.accountViewConfirmations).toHaveText(
        "2/2 multisig",
      ),
    ])

    const amountTrx = await extension.account.transfer({
      originAccountName: extension.account.accountNameMulti1,
      recipientAddress: config.destinationAddress!,
      tokenName: "Ethereum",
      amount: "MAX",
    })
    await extension.navigation.menuActivity.click()
    const txHash = await extension.activity.getLastTxHash()
    await extension.navigation.menuTokens.click()

    //acept tx from second extension
    await expect(
      secondExtension.activity.menuPendingTransactionsIndicator,
    ).toBeVisible({ timeout: 120000 })

    await secondExtension.account.acceptTx(txHash!)

    await extension.validateTx(
      txHash!,
      config.destinationAddress!,
      amountTrx,
      true,
    )
    await extension.navigation.menuTokens.click()
    await secondExtension.navigation.menuTokens.click()

    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("Ethereum")).toContainText(
        "0.000",
        { timeout: 120000 },
      ),
      expect(secondExtension.account.currentBalance("Ethereum")).toContainText(
        "0.000",
        { timeout: 120000 },
      ),
    ])
  })

  test("decrease approvals from 2/2 to 1/2 multisig", async ({
    extension,
    secondExtension,
  }) => {
    await extension.setupWallet({
      accountsToSetup: [],
    })
    await secondExtension.setupWallet({
      accountsToSetup: [],
    })
    const pubKey = await secondExtension.account.joinMultisig()
    await extension.account.addMultisigAccount({
      signers: [pubKey],
      confirmations: 2,
    })
    await extension.navigation.close.click()
    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti1,
      amount: 0.002,
    })
    await extension.activateMultisig(extension.account.accountNameMulti1)

    await expect(
      secondExtension.account.accountListConfirmations(
        secondExtension.account.accountNameMulti1,
      ),
    ).toHaveText("2/2")
    await secondExtension.navigation.close.click()
    await secondExtension.account.selectAccount(
      secondExtension.account.accountNameMulti1,
    )
    await Promise.all([
      expect(extension.account.accountViewConfirmations).toHaveText(
        "2/2 multisig",
      ),
      expect(secondExtension.account.accountViewConfirmations).toHaveText(
        "2/2 multisig",
      ),
    ])

    //set threshold (confirmations) to 1
    await extension.account.setConfirmations(
      extension.account.accountNameMulti1,
      1,
    )
    let txHash = await extension.activity.getLastTxHash()

    await secondExtension.account.acceptTx(txHash!)
    await secondExtension.navigation.menuTokens.click()
    await extension.navigation.menuTokens.click()
    await Promise.all([
      expect(extension.account.menuPendingTransactionsIndicator).toBeHidden({
        timeout: 120000,
      }),
      expect(
        secondExtension.account.menuPendingTransactionsIndicator,
      ).toBeHidden({ timeout: 120000 }),
    ])

    //wait for events to be updated
    await sleep(20 * 1000)
    await Promise.all([
      expect(extension.account.accountViewConfirmations).toHaveText(
        "1/2 multisig",
      ),
      expect(secondExtension.account.accountViewConfirmations).toHaveText(
        "1/2 multisig",
      ),
    ])
    //transfer
    const amountTrx = await extension.account.transfer({
      originAccountName: extension.account.accountNameMulti1,
      recipientAddress: config.destinationAddress!,
      tokenName: "Ethereum",
      amount: "MAX",
    })
    txHash = await extension.activity.getLastTxHash()
    //wait for events to be updated
    await sleep(20 * 1000)
    await Promise.all([
      expect(extension.account.menuPendingTransactionsIndicator).toBeHidden({
        timeout: 120000,
      }),
      expect(
        secondExtension.account.menuPendingTransactionsIndicator,
      ).toBeHidden({ timeout: 120000 }),
    ])

    await extension.validateTx(
      txHash!,
      config.destinationAddress!,
      amountTrx,
      true,
    )
    await extension.navigation.menuTokens.click()

    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("Ethereum")).toContainText(
        "0.000",
        { timeout: 120000 },
      ),
      expect(secondExtension.account.currentBalance("Ethereum")).toContainText(
        "0.000",
        { timeout: 120000 },
      ),
    ])
    await secondExtension.validateTx(
      txHash!,
      config.destinationAddress!,
      amountTrx,
      true,
    )
  })
})
