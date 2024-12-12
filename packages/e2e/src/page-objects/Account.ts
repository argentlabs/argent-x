import { Page, expect } from "@playwright/test"

import { lang } from "../languages"
import Activity from "./Activity"
import { FeeTokens, TokenSymbol, logInfo, sleep } from "../utils"
import config from "../config"

export interface IAsset {
  name: string
  balance: number
  unit: string
}

export default class Account extends Activity {
  upgradeTest: boolean
  constructor(page: Page, upgradeTest: boolean = false) {
    super(page)
    this.upgradeTest = upgradeTest
  }
  accountName1 = "Account 1"
  accountName2 = "Account 2"
  accountName3 = "Account 3"
  accountNameMulti1 = "Multisig 1"
  accountNameMulti2 = "Multisig 2"
  accountNameMulti3 = "Multisig 3"
  accountNameMulti4 = "Multisig 4"
  accountNameMulti5 = "Multisig 5"
  accountNameMulti6 = "Multisig 6"

  importedAccountName1 = "Imported Account 1"
  importedAccountName2 = "Imported Account 2"
  get noAccountBanner() {
    return this.page.locator(`div h4:has-text("${lang.account.noAccounts}")`)
  }

  get createAccount() {
    return this.page.locator('[data-testid="create-account-button"]')
  }

  get fundMenu() {
    return this.page.getByRole("button", { name: "Fund" })
  }

  get addFundsFromStartNet() {
    return this.page.locator(`a :text-is("${lang.account.fundsFromStarkNet}")`)
  }

  get accountAddress() {
    return this.page.locator(
      `[aria-label="${lang.account.fullAccountAddress}"]`,
    )
  }

  get accountAddressFromAssetsView() {
    return this.page.locator('[data-testid="address-copy-button"]').first()
  }

  get send() {
    return this.page.locator(`button:has-text("${lang.account.send}")`)
  }

  get sendToHeader() {
    return this.page.getByRole("heading", { name: "Send to" })
  }

  get deployAccount() {
    return this.page.locator(
      `button :text-is("${lang.settings.account.deployAccount}")`,
    )
  }

  get selectTokenButton() {
    return this.page.getByTestId("select-token-button")
  }

  async accountNames() {
    await expect(
      this.page.locator('[data-testid="account-name"]').first(),
    ).toBeVisible()
    return await this.page
      .locator('[data-testid="account-name"]')
      .all()
      .then(
        async (els) =>
          await Promise.all(els.map(async (el) => await el.textContent())),
      )
  }

  token(tkn: TokenSymbol) {
    return this.page.locator(`[data-testid="${tkn}"]`)
  }

  get accountListSelector() {
    return this.page.locator(`[aria-label="Show account list"]`)
  }

  get addANewAccountFromAccountList() {
    return this.page.getByRole("button", { name: "Add account" })
  }

  get addStandardAccountFromNewAccountScreen() {
    return this.page.locator('[aria-label="Standard Account"]')
  }

  get importAccountFromNewAccountScreen() {
    return this.page.locator('[aria-label="Import from private key"]')
  }

  get importAccountAddressLoc() {
    return this.page.locator('[name="address"]')
  }

  get importPKLoc() {
    return this.page.locator('[name="pk"]')
  }

  get importSubmitLoc() {
    return this.page.locator('button:text-is("Import")')
  }

  get addMultisigAccountFromNewAccountScreen() {
    return this.page.locator('[aria-label="Multisig Account"]')
  }

  get createWithArgent() {
    return this.page.locator('[aria-label="Create with Argent"]')
  }

  get createNewMultisig() {
    return this.page.locator('[aria-label="Create new multisig"]')
  }

  get joinExistingMultisig() {
    return this.page.locator('[aria-label="Join existing multisig"]')
  }

  get joinWithArgent() {
    return this.page.locator('[aria-label="Join with Argent"]')
  }

  get assetsList() {
    return this.page.locator('button[role="alert"] ~ button')
  }

  get amount() {
    return this.page.locator('[name="amount"]')
  }

  get sendMax() {
    return this.page.locator('button:text-is("Max")')
  }

  get recipientAddressQuery() {
    return this.page.locator('[data-testid="recipient-input"]')
  }

  account(accountName: string) {
    return this.page.locator(`button[aria-label^="Select ${accountName}"]`)
  }

  accountNameBtnLoc(accountName: string) {
    return this.page.locator(`button[aria-label="Select ${accountName}"]`)
  }

  get balance() {
    return this.page.locator('[data-testid="tokenBalance"]')
  }

  currentBalance(tkn: TokenSymbol) {
    return this.page.locator(`[data-testid="${tkn}-balance"]`)
  }

  currentBalanceDevNet(tkn: "ETH") {
    return this.page.locator(`//button//h6[contains(text(), '${tkn}')]`)
  }

  get accountName() {
    return this.page.locator('[data-testid="account-tokens"] h2')
  }

  invalidStarkIdError(id: string) {
    return this.page.locator(
      `form label:has-text('${id}${lang.account.invalidStarkIdError}')`,
    )
  }

  get shortAddressError() {
    return this.page.locator(
      `form label:has-text('${lang.account.shortAddressError}')`,
    )
  }

  get invalidCheckSumError() {
    return this.page.locator(
      `form label:has-text('${lang.account.invalidCheckSumError}')`,
    )
  }

  get invalidAddress() {
    return this.page.locator(
      `form label:has-text('${lang.account.invalidAddress}')`,
    )
  }

  get failPredict() {
    return this.page.locator('[data-testid="tx-error"]')
  }

  accountGroup(
    group: string = "my-accounts" ||
      "multisig - accounts" ||
      "imported-accounts",
  ) {
    return this.page.locator(`[data-testid="${group}"]`)
  }

  async addAccountMainnet({ firstAccount = true }: { firstAccount?: boolean }) {
    if (firstAccount) {
      await this.createAccount.click()
    } else {
      await this.accountListSelector.click()
      await this.addANewAccountFromAccountList.click()
    }
    await this.addStandardAccountFromNewAccountScreen.click()
    await this.continueLocator.click()
    await this.account("").last().click()
    await expect(this.accountListSelector).toBeVisible()
  }

  async dismissAccountRecoveryBanner() {
    await this.showAccountRecovery.click()
    await this.confirmTheSeedPhrase.click()
    await this.doneLocator.click()
  }

  async addAccount({ firstAccount = true }: { firstAccount?: boolean }) {
    if (firstAccount) {
      await this.createAccount.click()
    } else {
      await this.accountListSelector.click()
      await this.page.getByRole("button", { name: "Add account" }).click()
    }
    await this.addStandardAccountFromNewAccountScreen.click()
    await this.continueLocator.click()
    await expect(this.account("").last()).toBeVisible()
    const accountsName = await this.account("").allInnerTexts()
    const accountLoc = this.page.locator(
      `[data-testid="Account ${accountsName.length}"]`,
    )
    await expect(accountLoc).toBeVisible()
    await this.account(`Account ${accountsName.length}`).hover()
    await expect(
      accountLoc.locator('[data-testid="goto-settings"]'),
    ).toBeVisible()
    await accountLoc.click()
    //todo check why this is needed, click twice
    await sleep(1000)
    if (await accountLoc.isVisible()) {
      await accountLoc.click()
    }
    await expect(this.accountListSelector).toBeVisible()
    await this.fundMenu.click()
    await this.addFundsFromStartNet.click()
    const accountAddress = await this.accountAddress
      .textContent()
      .then((v) => v?.replaceAll(" ", ""))
    await this.closeLocator.last().click()
    const accountName = await this.accountListSelector.textContent()
    return { accountName, accountAddress }
  }

  async selectAccount(accountName: string) {
    await this.accountListSelector.click()
    await this.account(accountName).click()
  }

  async ensureSelectedAccount(accountName: string) {
    const currentAccount = await this.accountListSelector.textContent()
    if (currentAccount != accountName) {
      await this.selectAccount(accountName)
    }
    await expect(this.accountListSelector).toContainText(accountName)
  }

  async assets(accountName: string) {
    await this.ensureSelectedAccount(accountName)

    const assetsList: IAsset[] = []
    for (const asset of await this.assetsList.all()) {
      const row = (await asset.innerText()).split(/\r?\n| /)
      assetsList.push({
        name: row[0],
        balance: parseFloat(row[1]),
        unit: row[2],
      } as IAsset)
    }
    return assetsList
  }

  async ensureAsset(
    accountName: string,
    name: TokenSymbol = "ETH",
    value: string,
  ) {
    await this.ensureSelectedAccount(accountName)
    await expect(this.currentBalance(name)).toContainText(value)
  }

  async getTotalFeeValue() {
    const fee = await this.page
      .locator('[aria-label="Show Fee Estimate details"] p')
      .first()
      .textContent()
    if (!fee) {
      throw new Error("Error! Fee not available")
    }

    return parseFloat(fee.split(" ")[0])
  }
  async txValidations(feAmount: string) {
    const trxAmountHeader = await this.page
      .locator(`//*[starts-with(text(),'Send ')]`)
      .textContent()
      .then((v) => v?.split(" ")[1])

    const sendAmountFEText = await this.page
      .locator("[data-fe-value]")
      .getAttribute("data-fe-value")
    const sendAmountTXText = await this.page
      .locator("[data-tx-value]")
      .getAttribute("data-tx-value")
    const sendAmountFE = sendAmountFEText!.split(" ")[0]
    const sendAmountTX = parseInt(sendAmountTXText!)
    logInfo({ sendAmountFE, sendAmountTX })
    expect(sendAmountFE).toBe(`${trxAmountHeader}`)

    if (feAmount != "MAX") {
      expect(feAmount).toBe(trxAmountHeader)
    }
    return { sendAmountTX, sendAmountFE }
  }

  async fillRecipientAddress({
    recipientAddress,
    fillRecipientAddress = "paste",
    validAddress = true,
  }: {
    recipientAddress: string
    fillRecipientAddress?: "typing" | "paste"
    validAddress?: boolean
  }) {
    if (fillRecipientAddress === "paste") {
      await this.setClipboardText(recipientAddress)
      await this.recipientAddressQuery.focus()
      await this.paste()
    } else {
      await this.recipientAddressQuery.type(recipientAddress)
      await this.page.keyboard.press("Enter")
    }
    if (validAddress) {
      if (recipientAddress.endsWith("stark")) {
        await this.page.click(`button:has-text("${recipientAddress}")`)
      }
    }
  }

  async confirmTransaction() {
    await Promise.race([
      expect(this.confirmLocator)
        .toBeEnabled()
        .then((_) => this.confirmLocator.click()),
      expect(this.failPredict).toBeVisible(),
    ])
    if (await this.failPredict.isVisible()) {
      await this.failPredict.click()
      console.error("failPredict", this.paste)
    }
  }

  async transfer({
    originAccountName,
    recipientAddress,
    token,
    amount,
    fillRecipientAddress = "paste",
    submit = true,
    feeToken = "ETH",
  }: {
    originAccountName: string
    recipientAddress: string
    token: TokenSymbol
    amount: number | "MAX"
    fillRecipientAddress?: "typing" | "paste"
    submit?: boolean
    feeToken?: FeeTokens
  }) {
    await this.ensureSelectedAccount(originAccountName)
    await this.send.click()
    await this.fillRecipientAddress({ recipientAddress, fillRecipientAddress })
    await this.selectTokenButton.click()
    await this.token(token).click()
    if (amount === "MAX") {
      await expect(this.balance).toBeVisible()
      await expect(this.sendMax).toBeVisible()
      await this.sendMax.click()
    } else {
      await this.amount.fill(amount.toString())
    }

    await this.reviewSendLocator.click()

    if (submit) {
      if (feeToken) {
        await this.selectFeeToken(feeToken)
      }
      await this.confirmTransaction()
    }
    const { sendAmountFE, sendAmountTX } = await this.txValidations(
      amount.toString(),
    )
    try {
      await expect(this.failPredict)
        .toBeVisible({ timeout: 1000 * 3 })
        .then(async (_) => {
          await this.failPredict.click()
          await this.page.locator('[data-testid="copy-error"]').click()
          await this.setClipboard()
          console.error(
            "Error message copied to clipboard",
            await this.getClipboard(),
          )
          throw new Error("Transaction failed")
        })
    } catch {
      /* empty */
    }
    return { sendAmountTX, sendAmountFE }
  }

  async ensureTokenBalance({
    accountName,
    token,
    balance,
  }: {
    accountName: string
    token: TokenSymbol
    balance: number
  }) {
    await this.ensureSelectedAccount(accountName)
    await this.token(token).click()
    await expect(this.page.locator('[data-testid="tokenBalance"]')).toHaveText(
      balance.toString(),
    )
    await this.backLocator.click()
  }

  get password() {
    return this.page.locator('input[name="password"]').first()
  }

  get exportPrivateKey() {
    return this.page.locator(`button:text-is("${lang.account.export}")`)
  }

  get setUpAccountRecovery() {
    return this.page.locator(
      `button:text-is("${lang.account.accountRecovery}")`,
    )
  }

  get showAccountRecovery() {
    return this.page.locator(
      `button:text-is("${lang.account.showAccountRecovery}")`,
    )
  }

  get confirmTheSeedPhrase() {
    return this.page.locator(
      `p:text-is("${lang.account.confirmTheSeedPhrase}")`,
    )
  }

  // account recovery modal
  get saveTheRecoveryPhrase() {
    return this.page.locator(
      `//a//*[text()="${lang.account.saveTheRecoveryPhrase}"]`,
    )
  }

  get recipientAddress() {
    return this.page.locator('[data-testid="recipient-input"]')
  }

  get saveAddress() {
    return this.page.locator(`button:text-is("${lang.account.saveAddress}")`)
  }

  get copyAddress() {
    return this.page.locator('[data-testid="address-copy-button"]').first()
  }

  get copyAddressFromFundMenu() {
    return this.page.locator(`button:text-is("${lang.account.copyAddress}")`)
  }

  contact(label: string) {
    return this.page.locator(`div h5:text-is("${label}")`)
  }

  get avnuBanner() {
    return this.page.locator('p:text-is("Swap with AVNU")')
  }

  get ekuboBanner() {
    return this.page.locator('p:text-is("Provide liquidity on Ekubo")')
  }

  get avnuBannerClose() {
    return this.page.locator('[data-testid="close-banner"]')
  }

  async saveRecoveryPhrase() {
    const nextModal = await this.nextLocator.isVisible({ timeout: 60 })
    if (nextModal) {
      if (!this.upgradeTest) {
        await Promise.all([
          expect(
            this.page.locator(
              `h2:has-text("${lang.common.beforeYouContinue}")`,
            ),
          ).toBeVisible(),
          expect(
            this.page.locator(`p:has-text("${lang.common.seedWarning}")`),
          ).toBeVisible(),
        ])
      }
      await this.nextLocator.click()
    }
    await this.page
      .locator(`span:has-text("${lang.common.revealSeedPhrase}")`)
      .click()
    const pos = Array.from({ length: 12 }, (_, i) => i + 1)
    const seed = await Promise.all(
      pos.map(async (index) => {
        return this.page
          .locator(`//*[normalize-space() = '${index}']/parent::*`)
          .textContent()
          .then((text) => text?.replace(/[0-9]/g, ""))
      }),
    ).then((result) => result.join(" "))

    await Promise.all([
      this.page.locator(`button:has-text("${lang.common.copy}")`).click(),
      expect(
        this.page.locator(`button:has-text("${lang.common.copied}")`),
      ).toBeVisible(),
    ])
    await this.setClipboard()
    const seedPhraseCopied = await this.getClipboard()
    await expect(this.doneLocator).toBeDisabled()
    await this.page
      .locator(`p:has-text("${lang.common.confirmRecovery}")`)
      .click()
    await expect(this.page.getByTestId("recovery-phrase-checked")).toBeVisible()
    await expect(this.doneLocator).toBeEnabled()
    await this.doneLocator.click({ force: true })
    expect(seed).toBe(seedPhraseCopied)
    return String(seedPhraseCopied)
  }

  // Smart Account
  get email() {
    return this.page.locator('input[name="email"]')
  }

  get pinLocator() {
    return this.page.locator('[aria-label="Please enter your pin code"]')
  }

  async fillPin(pin: string = "111111") {
    //avoid BE error PIN not requested
    await sleep(2000)
    await expect(this.pinLocator).toHaveCount(6)
    await this.pinLocator.first().click()
    await this.pinLocator.first().fill(pin)
  }

  async setupRecovery() {
    //ensure modal is loaded
    await expect(
      this.page.locator('[data-testid="account-tokens"]'),
    ).toBeVisible()
    await expect(
      this.page.locator('[data-testid="address-copy-button"]'),
    ).toBeVisible()
    if (config.isProdTesting) {
      await this.showAccountRecovery.click()
    } else {
      await this.accountAddressFromAssetsView.click()
    }
    return this.saveRecoveryPhrase().then((adr) => String(adr))
  }

  get accountUpgraded() {
    return this.page.getByRole("heading", {
      name: lang.common.accountUpgraded,
    })
  }

  get changedToStandardAccountLabel() {
    return this.page.getByRole("heading", {
      name: lang.common.changedToStandardAccount,
    })
  }

  // Multisig
  get deployNeededWarning() {
    return this.page.locator(`p:has-text("${lang.account.deployFirst}")`)
  }

  get increaseThreshold() {
    return this.page.locator(`[data-testid="increase-threshold"]`)
  }

  get decreaseThreshold() {
    return this.page.locator(`[data-testid="decrease-threshold"]`)
  }

  get setConfirmationsLocator() {
    return this.page.locator(`button:has-text("Set confirmations")`)
  }

  async addMultisigAccount({
    signers = [],
    confirmations = 1,
  }: {
    signers?: string[]
    confirmations?: number
  }) {
    await this.accountListSelector.click()
    await this.addANewAccountFromAccountList.click()
    await this.addMultisigAccountFromNewAccountScreen.click()
    await this.continueLocator.click()
    await this.createNewMultisig.click()

    const [pages] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.createWithArgent.click(),
    ])

    const tabs = pages.context().pages()
    await tabs[1].waitForLoadState("load")
    await expect(tabs[1].locator('[name^="signerKeys.0.key"]')).toHaveCount(1)

    if (signers.length > 0) {
      for (let index = 0; index < signers.length; index++) {
        await tabs[1]
          .locator(`[name="signerKeys\\.${index}\\.key"]`)
          .isVisible()
          .then(async (visible) => {
            if (!visible) {
              await tabs[1].locator('[data-testid="addOwnerButton"]').click()
            }
          })
        await tabs[1]
          .locator(`[name="signerKeys.${index}.key"]`)
          .fill(signers[index])
      }
    }
    //remove empty inputs
    const locs = await tabs[1].locator('[data-testid^="signerContainer"]').all()
    if (locs.length > signers.length) {
      for (let index = locs.length; index > signers.length; index--) {
        await tabs[1]
          .locator(`[data-testid="closeButton.${index - 1}"]`)
          .click()
      }
    }

    await tabs[1].locator('button:text-is("Next")').click()
    const currentThreshold = await tabs[1]
      .locator('[data-testid="threshold"]')
      .innerText()
      .then((v) => parseInt(v!))

    //set confirmations
    if (confirmations > currentThreshold) {
      for (let i = currentThreshold; i < confirmations; i++) {
        await tabs[1].locator('[data-testid="increase-threshold"]').click()
      }
    }

    await tabs[1]
      .locator(`button:text-is("${lang.account.createMultisig}")`)
      .click()
    await tabs[1].locator(`button:text-is("${lang.wallet.finish}")`).click()
  }

  async joinMultisig() {
    await this.accountListSelector.click()
    await this.addANewAccountFromAccountList.click()
    await this.addMultisigAccountFromNewAccountScreen.click()
    await this.continueLocator.click()

    await this.joinExistingMultisig.click()
    await this.joinWithArgent.click()
    await this.page.locator('[data-testid="copy-pubkey"]').click()
    await this.setClipboard()
    await this.page.locator('[data-testid="button-done"]').click()
    return String(await this.getClipboard())
  }

  async addOwnerToMultisig({
    accountName,
    pubKey,
    confirmations = 1,
  }: {
    accountName: string
    pubKey: string
    confirmations?: number
  }) {
    await this.showSettingsLocator.click()
    await this.account(accountName).click()
    await this.manageOwners.click()
    await this.page.locator('[data-testid="add-owners"]').click()
    //hydrogen build will always have 2 inputs
    const locs = await this.page.locator('[data-testid^="closeButton."]').all()
    for (let index = 0; locs.length - 1 > index; index++) {
      await this.page.locator(`[data-testid^="closeButton.${index}"]`).click()
    }
    await this.page.locator('[name^="signerKeys.0.key"]').fill(pubKey)

    await this.nextLocator.click()

    const currentThreshold = await this.page
      .locator('[data-testid="threshold"]')
      .innerText()
      .then((v) => parseInt(v!))
    //set confirmations
    if (confirmations > currentThreshold) {
      for (let i = currentThreshold; i < confirmations; i++) {
        await this.page.locator('[data-testid="increase-threshold"]').click()
      }
    }
    await this.nextLocator.click()
    await this.confirmLocator.click()
  }

  ensureMultisigActivated() {
    return Promise.all([
      expect(this.page.locator("label:has-text('Not activated')")).toBeHidden(),
      expect(
        this.page.locator('[data-testid="activating-multisig"]'),
      ).toBeHidden(),
    ])
  }

  accountListConfirmations(accountName: string) {
    return this.page.locator(
      `[aria-label="Select ${accountName}"] [data-testid="confirmations"]`,
    )
  }

  get accountViewConfirmations() {
    return this.page.locator('[data-testid="confirmations"]').first()
  }

  async acceptTx(tx: string) {
    await this.menuActivityLocator.click()
    await this.page.locator(`[data-tx-hash="${tx}"]`).click()
    await this.confirmTransaction()
  }

  async setConfirmations(accountName: string, confirmations: number) {
    await this.ensureSelectedAccount(accountName)
    await this.showSettingsLocator.click()
    await this.account(accountName).click()
    await this.setConfirmationsLocator.click()

    const currentThreshold = await this.page
      .locator('[data-testid="threshold"]')
      .innerText()
      .then((v) => parseInt(v!))
    if (confirmations > currentThreshold) {
      for (let i = currentThreshold; i < confirmations; i++) {
        await this.increaseThreshold.click()
      }
    } else if (confirmations < currentThreshold) {
      for (let i = currentThreshold; i > confirmations; i--) {
        await this.decreaseThreshold.click()
      }
    }
    await this.page.locator('[data-testid="update-confirmations"]').click()
    await this.confirmTransaction()
    await Promise.all([
      expect(this.confirmLocator).toBeHidden(),
      expect(this.menuActivityLocator).toBeVisible(),
    ])
  }

  async ensureSmartAccountNotEnabled(accountName: string) {
    await this.selectAccount(accountName)
    await Promise.all([
      expect(this.menuPendingTransactionsIndicatorLocator).toBeHidden(),
      expect(
        this.page.locator('[data-testid="smart-account-on-account-view"]'),
      ).toBeHidden(),
    ])
    await this.showSettingsLocator.click()
    await Promise.all([
      expect(
        this.page.locator('[data-testid="smart-account-on-settings"]'),
      ).toBeHidden(),
      expect(
        this.page.locator('[data-testid="smart-account-not-activated"]'),
      ).toBeVisible(),
    ])
    await this.account(accountName).click()
    await expect(
      this.page.locator(
        '[data-testid="smart-account-button"]:has-text("Upgrade to Smart Account")',
      ),
    ).toBeVisible()
  }

  editOwnerLocator(owner: string) {
    return this.page.locator(`[data-testid="edit-${owner}"]`)
  }
  get manageOwners() {
    return this.page.locator(
      `//button//*[text()="${lang.settings.account.manageOwners.manageOwners}"]`,
    )
  }

  get removeOwnerLocator() {
    return this.page.locator(
      `//button[text()="${lang.settings.account.manageOwners.removeOwner}"]`,
    )
  }

  get removedFromMultisigLocator() {
    return this.page.getByText(lang.account.removedFromMultisig)
  }

  async removeMultiSigOwner(accountName: string, owner: string) {
    await this.showSettingsLocator.click()
    await this.account(accountName).click()
    await this.manageOwners.click()
    await this.editOwnerLocator(owner).click()
    await this.removeOwnerLocator.click()
    await this.removeLocator.click()
    await this.nextLocator.click()
    await this.confirmTransaction()
  }

  //TX v3
  get feeTokenPickerLoc() {
    return this.page.locator('[data-testid="fee-token-picker"]')
  }

  feeTokenLoc(token: FeeTokens) {
    return this.page.locator(`[data-testid="fee-token-${token}"]`)
  }

  feeTokenBalanceLoc(token: FeeTokens) {
    return this.page.locator(`[data-testid="fee-token-${token}-balance"]`)
  }

  selectedFeeTokenLoc(token: FeeTokens) {
    return this.feeTokenPickerLoc.locator(`img[alt=${token}]`)
  }

  async selectFeeToken(token: FeeTokens) {
    //wait for locator to be visible
    await Promise.race([
      expect(this.selectedFeeTokenLoc("ETH")).toBeVisible(),
      expect(this.selectedFeeTokenLoc("STRK")).toBeVisible(),
    ])
    const tokenAlreadySelected =
      await this.selectedFeeTokenLoc(token).isVisible()
    if (!tokenAlreadySelected) {
      await this.feeTokenPickerLoc.click()
      await this.feeTokenLoc(token).click()
      await expect(this.selectedFeeTokenLoc(token)).toBeVisible()
    }
  }

  async gotoSettingsFromAccountList(accountName: string) {
    await expect(this.accountNameBtnLoc(accountName)).toBeVisible()
    await this.accountNameBtnLoc(accountName).hover()
    await expect(
      this.accountNameBtnLoc(accountName).locator(
        '[data-testid="token-value"]',
      ),
    ).toBeHidden()
    await expect(
      this.accountNameBtnLoc(accountName).locator(
        '[data-testid="goto-settings"]',
      ),
    ).toBeVisible()
    await expect(
      this.accountNameBtnLoc(accountName).locator(
        '[data-testid="goto-settings"]',
      ),
    ).toHaveCount(1)
    //todo: remove sleep
    await sleep(1000)
    await this.accountNameBtnLoc(accountName)
      .locator('[data-testid="goto-settings"]')
      .click()
    await expect(
      this.page.locator(
        `[data-testid="account-settings-${accountName.replaceAll(/ /g, "")}"]`,
      ),
    ).toBeVisible()
  }

  async importAccount({
    address,
    privateKey,
    validPK = true,
  }: {
    address: string
    privateKey: string
    validPK?: boolean
  }) {
    await this.accountListSelector.click()
    await this.addANewAccountFromAccountList.click()
    await this.importAccountFromNewAccountScreen.click()

    await this.continueLocator.click()
    await this.importAccountAddressLoc.fill(address)
    await this.importPKLoc.fill(privateKey)
    await this.importSubmitLoc.click()
    if (!validPK) {
      await Promise.all([
        expect(this.page.getByText("The private key is invalid")).toBeVisible(),
        expect(this.page.getByRole("button", { name: "Ok" })).toBeVisible(),
      ])
    }
  }
}
