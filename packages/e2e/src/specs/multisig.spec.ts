import { expect } from "@playwright/test"
import test from "../test"
import config from "../config"
import { sleep } from "../utils"

const ethInitialBalance = 0.002 * Number(config.initialBalanceMultiplier)

test.describe("Multisig", { tag: "@tx" }, () => {
  test.skip(config.skipTXTests === "true")
  test.slow()
  test("add and activate 1/1 multisig", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [],
    })
    await extension.account.addMultisigAccount({})
    await extension.navigation.closeLocator.click()
    await expect(
      extension.page.locator('[data-testid="activate-multisig"]'),
    ).toBeHidden()
    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti1,
      balance: ethInitialBalance,
    })
    await expect(
      extension.page.locator('[data-testid="activate-multisig"]'),
    ).toBeVisible()
    await extension.activateMultisig(extension.account.accountNameMulti1)

    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: extension.account.accountNameMulti1,
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: 0.0009,
    })
    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx({
      txHash: txHash!,
      receiver: config.destinationAddress!,
      sendAmountFE,
      sendAmountTX,
      uniqLocator: true,
    })
    await extension.navigation.menuTokensLocator.click()

    //ensure that balance is updated
    await expect(extension.account.currentBalance("ETH")).not.toContainText(
      ethInitialBalance.toString(),
    )

    await extension.account.accountListSelector.click()
    await Promise.all([
      expect(extension.account.accountGroup("my-accounts")).toBeVisible(),
      expect(extension.account.accountGroup("multisig-accounts")).toBeVisible(),
    ])
  })

  test("add and activate 1/2 multisig", async ({
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
    await extension.navigation.closeLocator.click()
    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti1,
      balance: ethInitialBalance,
    })
    await extension.activateMultisig(extension.account.accountNameMulti1)

    await expect(
      secondExtension.account.accountListConfirmations(
        secondExtension.account.accountNameMulti1,
      ),
    ).toHaveText("1/2")
    await secondExtension.navigation.closeLocator.click()
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

    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: extension.account.accountNameMulti1,
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: 0.0009,
    })
    const txHash = await extension.activity.getLastTxHash()
    await extension.validateTx({
      txHash: txHash!,
      receiver: config.destinationAddress!,
      sendAmountFE,
      sendAmountTX,
      uniqLocator: true,
    })
    await extension.navigation.menuTokensLocator.click()

    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("ETH")).not.toContainText(
        ethInitialBalance.toString(),
      ),
      expect(secondExtension.account.currentBalance("ETH")).not.toContainText(
        ethInitialBalance.toString(),
      ),
    ])
    await secondExtension.validateTx({
      txHash: txHash!,
      receiver: config.destinationAddress!,
      sendAmountFE,
      sendAmountTX,
      uniqLocator: true,
    })
  })

  test("add and activate 2/2 multisig", async ({
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
    await extension.navigation.closeLocator.click()
    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti1,
      balance: ethInitialBalance,
    })
    await extension.activateMultisig(extension.account.accountNameMulti1)

    await expect(
      secondExtension.account.accountListConfirmations(
        secondExtension.account.accountNameMulti1,
      ),
    ).toHaveText("2/2")
    await secondExtension.navigation.closeLocator.click()
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

    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: extension.account.accountNameMulti1,
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: 0.0009,
    })
    await extension.navigation.menuActivityLocator.click()
    const txHash = await extension.activity.getLastTxHash()
    await extension.navigation.menuTokensLocator.click()

    //accept tx from second extension
    await expect(
      secondExtension.activity.menuPendingTransactionsIndicatorLocator,
    ).toBeVisible()

    await secondExtension.account.acceptTx(txHash!)

    await extension.validateTx({
      txHash: txHash!,
      receiver: config.destinationAddress!,
      sendAmountFE,
      sendAmountTX,
      uniqLocator: true,
    })
    await extension.navigation.menuTokensLocator.click()
    await secondExtension.navigation.menuTokensLocator.click()

    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("ETH")).not.toContainText(
        ethInitialBalance.toString(),
      ),
      expect(secondExtension.account.currentBalance("ETH")).not.toContainText(
        ethInitialBalance.toString(),
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
    await extension.navigation.closeLocator.click()
    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti1,
      balance: ethInitialBalance,
    })
    await extension.activateMultisig(extension.account.accountNameMulti1)

    await expect(
      secondExtension.account.accountListConfirmations(
        secondExtension.account.accountNameMulti1,
      ),
    ).toHaveText("2/2")
    await secondExtension.navigation.closeLocator.click()
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
    await secondExtension.navigation.menuTokensLocator.click()
    await extension.navigation.menuTokensLocator.click()
    await Promise.all([
      expect(
        extension.account.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden(),
      expect(
        secondExtension.account.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden(),
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
    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: extension.account.accountNameMulti1,
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: 0.0009,
    })
    txHash = await extension.activity.getLastTxHash()
    //wait for events to be updated
    await sleep(20 * 1000)
    await Promise.all([
      expect(
        extension.account.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden(),
      expect(
        secondExtension.account.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden(),
    ])
    await Promise.all([
      extension.validateTx({
        txHash: txHash!,
        receiver: config.destinationAddress!,
        sendAmountFE,
        sendAmountTX,
        uniqLocator: true,
      }),
      secondExtension.validateTx({
        txHash: txHash!,
        receiver: config.destinationAddress!,
        sendAmountFE,
        sendAmountTX,
        uniqLocator: true,
      }),
    ])
    await Promise.all([
      extension.navigation.menuTokensLocator.click(),
      secondExtension.navigation.menuTokensLocator.click(),
    ])

    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("ETH")).not.toContainText(
        ethInitialBalance.toString(),
      ),
      expect(secondExtension.account.currentBalance("ETH")).not.toContainText(
        ethInitialBalance.toString(),
      ),
    ])
  })

  test("User is notified after get removed from a multisig account", async ({
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
      confirmations: 1,
    })
    await extension.navigation.closeLocator.click()
    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti1,
      balance: ethInitialBalance,
    })
    await extension.activateMultisig(extension.account.accountNameMulti1)

    await expect(
      secondExtension.account.accountListConfirmations(
        secondExtension.account.accountNameMulti1,
      ),
    ).toHaveText("1/2")
    await secondExtension.navigation.closeLocator.click()
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

    await extension.account.removeMultiSigOwner(
      extension.account.accountNameMulti1,
      pubKey,
    )
    await expect(
      extension.account.menuPendingTransactionsIndicatorLocator,
    ).toBeHidden()
    await expect(
      secondExtension.account.removedFromMultisigLocator,
    ).toBeVisible()
  })

  test("Removed user should not see Multisig account after recover wallet", async ({
    extension,
  }) => {
    await extension.open()
    await extension.recoverWallet(config.testSeed3!)
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectDefaultNetwork()

    await extension.account.accountListSelector.click()
    await Promise.all([
      expect(
        extension.account.account(extension.account.accountName1),
      ).toBeVisible(),
      expect(
        extension.account.account(extension.account.accountNameMulti1),
      ).toBeVisible(),
      expect(
        extension.account.account(extension.account.accountNameMulti6),
      ).toBeHidden(),
      expect(
        extension.account.account(extension.account.accountNameMulti3),
      ).toBeVisible(),
    ])
  })

  test(
    "User should be able to hide/unhide Multisig account",
    {
      tag: "@all",
    },
    async ({ extension }) => {
      await extension.open()
      await extension.recoverWallet(config.testSeed1!)
      await expect(extension.network.networkSelector).toBeVisible()
      await extension.network.selectDefaultNetwork()

      await extension.account.selectAccount(extension.account.accountNameMulti1)
      await extension.navigation.showSettingsLocator.click()
      await extension.settings
        .account(extension.account.accountNameMulti1)
        .click()
      await extension.settings.hideAccount.click()
      await extension.settings.confirmHide.click()

      await expect(
        extension.account.account(extension.account.accountNameMulti1),
      ).toBeHidden()
      await extension.navigation.closeButtonLocator.click()
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.preferences.click()
      await extension.settings.hiddenAccounts.click()
      await extension.settings
        .unhideAccount(extension.account.accountNameMulti1)
        .click()
      await extension.navigation.backLocator.click()
      await extension.navigation.backLocator.click()
      await extension.navigation.closeLocator.click()
      await extension.account.accountListSelector.click()
      await expect(
        extension.account.account(extension.account.accountNameMulti1),
      ).toBeVisible()
    },
  )

  test("add owner to 1/1 activated multisig", async ({
    extension,
    secondExtension,
  }) => {
    await Promise.all([
      extension.setupWallet({
        accountsToSetup: [],
      }),
    ])
    await Promise.all([
      extension.account.addMultisigAccount({}),
      secondExtension.setupWallet({
        accountsToSetup: [],
      }),
    ])

    await extension.navigation.closeLocator.click()
    await expect(
      extension.page.locator('[data-testid="activate-multisig"]'),
    ).toBeHidden()
    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti1,
      balance: ethInitialBalance,
    })
    await expect(
      extension.page.locator('[data-testid="activate-multisig"]'),
    ).toBeVisible()
    await extension.activateMultisig(extension.account.accountNameMulti1)

    const pubKey = await secondExtension.account.joinMultisig()

    await extension.account.addOwnerToMultisig({
      accountName: extension.account.accountNameMulti1,
      pubKey,
      confirmations: 2,
    })
    extension.navigation.menuTokensLocator.click(),
      await expect(
        extension.account.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden({
        timeout: 120000,
      })

    await expect(
      secondExtension.account.accountListConfirmations(
        secondExtension.account.accountNameMulti1,
      ),
    ).toHaveText("2/2")
    await secondExtension.navigation.closeLocator.click()
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

    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: extension.account.accountNameMulti1,
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: 0.0009,
    })
    const txHash = await extension.activity.getLastTxHash()
    await extension.navigation.menuTokensLocator.click()

    //accept tx from second extension
    await expect(
      secondExtension.activity.menuPendingTransactionsIndicatorLocator,
    ).toBeVisible({ timeout: 120000 })

    await secondExtension.account.acceptTx(txHash!)
    await secondExtension.navigation.menuTokensLocator.click()

    await sleep(20 * 1000)
    await Promise.all([
      expect(
        extension.account.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden({
        timeout: 120000,
      }),
      expect(
        secondExtension.account.menuPendingTransactionsIndicatorLocator,
      ).toBeHidden({ timeout: 120000 }),
    ])
    await Promise.all([
      extension.validateTx({
        txHash: txHash!,
        receiver: config.destinationAddress!,
        sendAmountFE,
        sendAmountTX,
        uniqLocator: true,
      }),
      secondExtension.validateTx({
        txHash: txHash!,
        receiver: config.destinationAddress!,
        sendAmountFE,
        sendAmountTX,
        uniqLocator: true,
      }),
    ])
    await Promise.all([
      extension.navigation.menuTokensLocator.click(),
      secondExtension.navigation.menuTokensLocator.click(),
    ])

    //ensure that balance is updated
    await Promise.all([
      expect(extension.account.currentBalance("ETH")).not.toContainText(
        ethInitialBalance.toString(),
        {
          timeout: 120000,
        },
      ),
      expect(secondExtension.account.currentBalance("ETH")).not.toContainText(
        ethInitialBalance.toString(),
        { timeout: 120000 },
      ),
    ])
  })

  test("create 3 multisig with same keys, owner should all, others should see only the first", async ({
    extension,
    secondExtension,
    thirdExtension,
  }) => {
    await extension.setupWallet({
      accountsToSetup: [],
    })
    await secondExtension.setupWallet({
      accountsToSetup: [],
    })
    await thirdExtension.setupWallet({
      accountsToSetup: [],
    })
    const pubKey = await secondExtension.account.joinMultisig()
    const pubKey2 = await thirdExtension.account.joinMultisig()
    await extension.account.addMultisigAccount({ signers: [pubKey, pubKey2] })
    await extension.navigation.closeLocator.click()
    await extension.account.addMultisigAccount({ signers: [pubKey, pubKey2] })
    await extension.navigation.closeLocator.click()
    await extension.account.addMultisigAccount({ signers: [pubKey, pubKey2] })
    await extension.navigation.closeLocator.click()

    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti1,
      balance: ethInitialBalance,
    })
    await extension.activateMultisig(extension.account.accountNameMulti1)

    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti2,
      balance: ethInitialBalance,
    })
    await extension.activateMultisig(extension.account.accountNameMulti2)

    await extension.fundMultisigAccount({
      accountName: extension.account.accountNameMulti3,
      balance: ethInitialBalance,
    })
    await extension.activateMultisig(extension.account.accountNameMulti3)

    await expect(
      secondExtension.account.accountListConfirmations(
        secondExtension.account.accountNameMulti1,
      ),
    ).toHaveText("1/3")
    await secondExtension.navigation.closeLocator.click()
    await secondExtension.account.selectAccount(
      secondExtension.account.accountNameMulti1,
    )
    await expect(
      thirdExtension.account.accountListConfirmations(
        thirdExtension.account.accountNameMulti1,
      ),
    ).toHaveText("1/3")
    await thirdExtension.navigation.closeLocator.click()
    await thirdExtension.account.selectAccount(
      thirdExtension.account.accountNameMulti1,
    )

    await Promise.all([
      expect(extension.account.accountViewConfirmations).toHaveText(
        "1/3 multisig",
      ),
      expect(secondExtension.account.accountViewConfirmations).toHaveText(
        "1/3 multisig",
      ),
      expect(thirdExtension.account.accountViewConfirmations).toHaveText(
        "1/3 multisig",
      ),
    ])

    await extension.account.accountListSelector.click()
    let accountList = await extension.account.accountNames()
    expect(accountList).toEqual([
      "Account 1",
      "Multisig 1",
      "Multisig 2",
      "Multisig 3",
    ])
    await secondExtension.account.accountListSelector.click()
    accountList = await secondExtension.account.accountNames()
    expect(accountList).toEqual(["Account 1", "Multisig 1"])

    await thirdExtension.account.accountListSelector.click()
    accountList = await thirdExtension.account.accountNames()
    expect(accountList).toEqual(["Account 1", "Multisig 1"])
  })
})
