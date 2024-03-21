import { expect } from "@playwright/test"
import test from "../test"
import config from "../../../shared/config"
import { sleep } from "../../../shared/src/common"
import { lang } from "../languages"

test.describe("Multisig", () => {
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
      amount: 0.002,
    })
    await expect(
      extension.page.locator('[data-testid="activate-multisig"]'),
    ).toBeVisible()
    await extension.activateMultisig(extension.account.accountNameMulti1)

    const { sendAmountTX, sendAmountFE } = await extension.account.transfer({
      originAccountName: extension.account.accountNameMulti1,
      recipientAddress: config.destinationAddress!,
      token: "ETH",
      amount: 0.001,
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
      "0.002",
    )
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
      amount: 0.002,
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
      amount: 0.001,
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
        "0.002",
      ),
      expect(secondExtension.account.currentBalance("ETH")).not.toContainText(
        "0.002",
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
      amount: 0.002,
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
      amount: 0.001,
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
      expect(extension.account.currentBalance("ETH")).not.toContainText("0.02"),
      expect(secondExtension.account.currentBalance("ETH")).not.toContainText(
        "0.02",
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
      amount: 0.002,
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
      amount: 0.001,
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
      expect(extension.account.currentBalance("ETH")).not.toContainText("0.02"),
      expect(secondExtension.account.currentBalance("ETH")).not.toContainText(
        "0.02",
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
      amount: 0.002,
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
    await extension.recoverWallet(config.testNetSeed3!)
    await expect(extension.network.networkSelector).toBeVisible()
    await extension.network.selectDefaultNetwork()

    await extension.account.accountListSelector.click()
    await expect(
      extension.account.account(extension.account.accountName1),
    ).toBeVisible()
    await expect(
      extension.account.account(extension.account.accountNameMulti1),
    ).toBeHidden()
  })
  //https://argent.atlassian.net/browse/BLO-1935
  test.skip("User should be able to hide/unhide Multisig account", async ({
    extension,
  }) => {
    await extension.open()
    await extension.recoverWallet(config.testNetSeed2!)
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

    await extension.settings.hiddenAccounts.click()
    await extension.settings
      .unhideAccount(extension.account.accountNameMulti1)
      .click()
    await extension.navigation.backLocator.click()
    await expect(extension.settings.hiddenAccounts).toBeHidden()
    await expect(
      extension.account.account(extension.account.accountNameMulti1),
    ).toBeVisible()
  })

  test("Add token, token should only be visible if preference is set", async ({
    extension,
  }) => {
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
      amount: 0.001,
    })
    await expect(
      extension.page.locator('[data-testid="activate-multisig"]'),
    ).toBeVisible()
    await extension.activateMultisig(extension.account.accountNameMulti1)
    await extension.page
      .getByRole("link", { name: lang.account.newToken })
      .click()
    await extension.page
      .locator('[name="address"]')
      .fill(
        "0x05A6B68181bb48501a7A447a3f99936827E41D77114728960f22892F02E24928",
      )
    await expect(extension.page.locator('[name="name"]')).toHaveValue("Astraly")
    await Promise.all([
      extension.navigation.continueLocator.click(),
      extension.page.locator('text="Token added"').click(),
    ])

    await expect(extension.account.token("AST")).toBeHidden()
    await extension.navigation.showSettingsLocator.click()
    await extension.settings.preferences.click()
    await expect(extension.preferences.hideTokensStatus).toBeEnabled()
    await extension.preferences.hideTokens.click()
    await extension.navigation.backLocator.click()
    await extension.navigation.closeLocator.click()
    await expect(extension.account.token("AST")).toBeVisible()
  })

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
      amount: 0.002,
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
      amount: 0.0015,
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
        "0.002",
        {
          timeout: 120000,
        },
      ),
      expect(secondExtension.account.currentBalance("ETH")).not.toContainText(
        "0.002",
        { timeout: 120000 },
      ),
    ])
  })
})
