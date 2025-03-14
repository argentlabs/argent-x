import { expect } from "@playwright/test"
import test from "../test"
import config from "../config"
import { sleep } from "../utils"

const strkInitialBalance = "10.0"

test.describe("Multisig", { tag: "@tx" }, () => {
  test.skip(config.skipTXTests === "true")
  test("add and activate 1/1 multisig", async ({ extension }) => {
    await extension.setupWallet({
      accountsToSetup: [],
    })
    await extension.account.addMultisigAccount({})
    await extension.navigation.closeLocator.click()
    await expect(
      extension.page.locator('[data-testid="activate-multisig"]'),
    ).toBeHidden()
    const { accountName: accountNameMulti1 } =
      await extension.account.lastAccountInfo()
    await extension.fundMultisigAccount({
      accountName: accountNameMulti1!,
      balance: strkInitialBalance,
    })
    await expect(
      extension.page.locator('[data-testid="activate-multisig"]'),
    ).toBeVisible()
    await extension.activateMultisig(accountNameMulti1!)

    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: accountNameMulti1!,
      recipientAddress: config.destinationAddress!,
      token: "STRK",
      amount: 1.01,
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
    await expect(extension.account.currentBalance("STRK")).not.toContainText(
      strkInitialBalance.toString(),
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
    const { accountName: accountNameMulti1 } =
      await extension.account.lastAccountInfo()

    await extension.fundMultisigAccount({
      accountName: accountNameMulti1!,
      balance: strkInitialBalance,
    })
    await extension.activateMultisig(accountNameMulti1!)

    await expect(
      secondExtension.account.accountListConfirmations(accountNameMulti1!),
    ).toHaveText("1/2")
    await secondExtension.navigation.closeLocator.click()
    await secondExtension.account.selectAccount(accountNameMulti1!)
    await Promise.all([
      expect(extension.account.accountViewConfirmations).toHaveText(
        "1/2 multisig",
      ),
      expect(secondExtension.account.accountViewConfirmations).toHaveText(
        "1/2 multisig",
      ),
    ])

    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: accountNameMulti1!,
      recipientAddress: config.destinationAddress!,
      token: "STRK",
      amount: "MAX",
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
      expect(extension.account.currentBalance("STRK")).not.toContainText(
        strkInitialBalance.toString(),
      ),
      expect(secondExtension.account.currentBalance("STRK")).not.toContainText(
        strkInitialBalance.toString(),
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
    const { accountName: accountNameMulti1 } =
      await extension.account.lastAccountInfo()

    await extension.fundMultisigAccount({
      accountName: accountNameMulti1!,
      balance: strkInitialBalance,
    })
    await extension.activateMultisig(accountNameMulti1!)

    await expect(
      secondExtension.account.accountListConfirmations(accountNameMulti1!),
    ).toHaveText("2/2")
    await secondExtension.navigation.closeLocator.click()
    await secondExtension.account.selectAccount(accountNameMulti1!)
    await Promise.all([
      expect(extension.account.accountViewConfirmations).toHaveText(
        "2/2 multisig",
      ),
      expect(secondExtension.account.accountViewConfirmations).toHaveText(
        "2/2 multisig",
      ),
    ])

    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: accountNameMulti1!,
      recipientAddress: config.destinationAddress!,
      token: "STRK",
      amount: "MAX",
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
      expect(extension.account.currentBalance("STRK")).not.toContainText(
        strkInitialBalance.toString(),
      ),
      expect(secondExtension.account.currentBalance("STRK")).not.toContainText(
        strkInitialBalance.toString(),
      ),
    ])
  })

  test("decrease approvals from 2/2 to 1/2 multisig", async ({
    extension,
    secondExtension,
  }) => {
    test.slow()
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
    const { accountName: accountNameMulti1 } =
      await extension.account.lastAccountInfo()

    await extension.fundMultisigAccount({
      accountName: accountNameMulti1!,
      balance: strkInitialBalance,
    })
    await extension.activateMultisig(accountNameMulti1!)

    await expect(
      secondExtension.account.accountListConfirmations(accountNameMulti1!),
    ).toHaveText("2/2")
    await secondExtension.navigation.closeLocator.click()
    await secondExtension.account.selectAccount(accountNameMulti1!)
    await Promise.all([
      expect(extension.account.accountViewConfirmations).toHaveText(
        "2/2 multisig",
      ),
      expect(secondExtension.account.accountViewConfirmations).toHaveText(
        "2/2 multisig",
      ),
    ])

    //set threshold (confirmations) to 1
    await extension.account.setConfirmations(accountNameMulti1!, 1)
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
      originAccountName: accountNameMulti1!,
      recipientAddress: config.destinationAddress!,
      token: "STRK",
      amount: "MAX",
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
      expect(extension.account.currentBalance("STRK")).not.toContainText(
        strkInitialBalance.toString(),
      ),
      expect(secondExtension.account.currentBalance("STRK")).not.toContainText(
        strkInitialBalance.toString(),
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
    const { accountName: accountNameMulti1 } =
      await extension.account.lastAccountInfo()

    await extension.fundMultisigAccount({
      accountName: accountNameMulti1!,
      balance: strkInitialBalance,
    })
    await extension.activateMultisig(accountNameMulti1!)

    await expect(
      secondExtension.account.accountListConfirmations(accountNameMulti1!),
    ).toHaveText("1/2")
    await secondExtension.navigation.closeLocator.click()
    await secondExtension.account.selectAccount(accountNameMulti1!)
    await Promise.all([
      expect(extension.account.accountViewConfirmations).toHaveText(
        "1/2 multisig",
      ),
      expect(secondExtension.account.accountViewConfirmations).toHaveText(
        "1/2 multisig",
      ),
    ])

    await extension.account.removeMultiSigOwner(accountNameMulti1!, pubKey)
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
      expect(extension.account.account("Helpful Hotdog")).toBeVisible(),
      expect(extension.account.account("Easygoing Egg")).toBeVisible(),
      expect(extension.account.account("Silly Squirrel")).toBeHidden(),
      expect(extension.account.account("Sublime Sunflower")).toBeVisible(),
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
      const accountNameMulti1 = "Perfect Pizza"
      await extension.account.selectAccount(accountNameMulti1)
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.account(accountNameMulti1).click()
      await extension.settings.hideAccount.click()
      await extension.settings.confirmHide.click()

      await expect(extension.account.account(accountNameMulti1)).toBeHidden()
      await extension.navigation.closeButtonLocator.click()
      await extension.navigation.showSettingsLocator.click()
      await extension.settings.preferences.click()
      await extension.settings.hiddenAccounts.click()
      await extension.settings.unhideAccount(accountNameMulti1).click()
      await extension.navigation.backLocator.click()
      await extension.navigation.backLocator.click()
      await extension.navigation.closeLocator.click()
      await extension.account.accountListSelector.click()
      await expect(extension.account.account(accountNameMulti1)).toBeVisible()
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
    const { accountName: accountNameMulti1 } =
      await extension.account.lastAccountInfo()

    await expect(
      extension.page.locator('[data-testid="activate-multisig"]'),
    ).toBeHidden()
    await extension.fundMultisigAccount({
      accountName: accountNameMulti1!,
      balance: strkInitialBalance,
    })
    await expect(
      extension.page.locator('[data-testid="activate-multisig"]'),
    ).toBeVisible()
    await extension.activateMultisig(accountNameMulti1!)

    const pubKey = await secondExtension.account.joinMultisig()

    await extension.account.addOwnerToMultisig({
      accountName: accountNameMulti1!,
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
      secondExtension.account.accountListConfirmations(accountNameMulti1!),
    ).toHaveText("2/2")
    await secondExtension.navigation.closeLocator.click()
    await secondExtension.account.selectAccount(accountNameMulti1!)
    await Promise.all([
      expect(extension.account.accountViewConfirmations).toHaveText(
        "2/2 multisig",
      ),
      expect(secondExtension.account.accountViewConfirmations).toHaveText(
        "2/2 multisig",
      ),
    ])

    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: accountNameMulti1!,
      recipientAddress: config.destinationAddress!,
      token: "STRK",
      amount: 2.5,
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
      expect(extension.account.currentBalance("STRK")).not.toContainText(
        strkInitialBalance.toString(),
        {
          timeout: 120000,
        },
      ),
      expect(secondExtension.account.currentBalance("STRK")).not.toContainText(
        strkInitialBalance.toString(),
        { timeout: 120000 },
      ),
    ])
  })

  test("create 3 multisig with same keys, owner should see all, others should see only the first", async ({
    extension,
    secondExtension,
    thirdExtension,
  }) => {
    const { accountNames: account1 } = await extension.setupWallet({
      accountsToSetup: [],
    })
    const accountName11 = account1![0]

    const { accountNames: accountName2 } = await secondExtension.setupWallet({
      accountsToSetup: [],
    })
    const accountName21 = accountName2![0]

    const { accountNames: accountName3 } = await thirdExtension.setupWallet({
      accountsToSetup: [],
    })
    const accountName31 = accountName3![0]

    const pubKey = await secondExtension.account.joinMultisig()
    const pubKey2 = await thirdExtension.account.joinMultisig()
    await extension.account.addMultisigAccount({ signers: [pubKey, pubKey2] })
    await extension.navigation.closeLocator.click()
    //get new account name

    const { accountName: accountNameMulti1 } =
      await extension.account.lastAccountInfo()

    await extension.account.addMultisigAccount({ signers: [pubKey, pubKey2] })
    await extension.navigation.closeLocator.click()
    const { accountName: accountNameMulti2 } =
      await extension.account.lastAccountInfo()

    await extension.account.addMultisigAccount({ signers: [pubKey, pubKey2] })
    await extension.navigation.closeLocator.click()
    const { accountName: accountNameMulti3 } =
      await extension.account.lastAccountInfo()

    await extension.fundMultisigAccount({
      accountName: accountNameMulti1!,
      balance: strkInitialBalance,
    })

    await extension.activateMultisig(accountNameMulti1!)

    await extension.fundMultisigAccount({
      accountName: accountNameMulti2!,
      balance: strkInitialBalance,
    })
    await extension.activateMultisig(accountNameMulti2!)

    await extension.fundMultisigAccount({
      accountName: accountNameMulti3!,
      balance: strkInitialBalance,
    })
    await extension.activateMultisig(accountNameMulti3!)

    await expect(
      secondExtension.account.accountListConfirmations(accountNameMulti1!),
    ).toHaveText("1/3")
    await secondExtension.navigation.closeLocator.click()
    await secondExtension.account.selectAccount(accountNameMulti1!)
    await expect(
      thirdExtension.account.accountListConfirmations(accountNameMulti1!),
    ).toHaveText("1/3")
    await thirdExtension.navigation.closeLocator.click()
    await thirdExtension.account.selectAccount(accountNameMulti1!)

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
      accountName11,
      accountNameMulti1,
      accountNameMulti2,
      accountNameMulti3,
    ])
    await secondExtension.account.accountListSelector.click()
    accountList = await secondExtension.account.accountNames()
    expect(accountList).toEqual([accountName21, accountNameMulti1])

    await thirdExtension.account.accountListSelector.click()
    accountList = await thirdExtension.account.accountNames()
    expect(accountList).toEqual([accountName31, accountNameMulti1])
  })
})
