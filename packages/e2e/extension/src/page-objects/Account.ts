import { Page, expect } from "@playwright/test"

import { lang } from "../languages"
import Activity from "./Activity"

type TokenName = "Ethereum"
export interface IAsset {
  name: string
  balance: number
  unit: string
}

export default class Account extends Activity {
  constructor(page: Page) {
    super(page)
  }
  accountName1 = "Account 1"
  accountName2 = "Account 2"
  accountNameMulti1 = "Multisig 1"
  accountNameMulti2 = "Multisig 2"

  get noAccountBanner() {
    return this.page.locator(`div h5:has-text("${lang.account.noAccounts}")`)
  }

  get createAccount() {
    return this.page.locator(`button:text-is("${lang.account.createAccount}")`)
  }

  get addFunds() {
    return this.page.locator(`button:text-is("${lang.account.addFunds}")`)
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
    return this.page.locator('[data-testid="account-tokens"] button').first()
  }

  get send() {
    return this.page.locator(`button:text-is("${lang.account.send}")`)
  }

  get deployAccount() {
    return this.page.locator(
      `button :text-is("${lang.settings.deployAccount}")`,
    )
  }

  token(tkn: TokenName) {
    return this.page.locator(`button :text-is('${tkn}')`)
  }

  get accountListSelector() {
    return this.page.locator(`[aria-label="Show account list"]`)
  }

  get addANewccountFromAccountList() {
    return this.page.locator('[aria-label="Create new wallet"]')
  }

  get addStandardAccountFromNewAccountScreen() {
    return this.page.locator('[aria-label="Standard Account"]')
  }

  get addMultisigAccountFromNewAccountScreen() {
    return this.page.locator('[aria-label="Multisig Account"]')
  }

  get createNewMultisig() {
    return this.page.locator('[aria-label="Create new multisig"]')
  }

  get joinExistingMultisig() {
    return this.page.locator('[aria-label="Join existing multisig"]')
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
    return this.page.locator('[name="query"]')
  }

  account(accountName: string) {
    return this.page.locator(`[aria-label^="Select ${accountName}"]`)
  }

  get balance() {
    return this.page.locator('[data-testid="tokenBalance"]')
  }

  currentBalance(tkn: "Ethereum") {
    return this.page.locator(
      ` //button//h6[contains(text(), '${tkn}')]/following::p`,
    )
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

  async addAccountMainnet({ firstAccount = true }: { firstAccount?: boolean }) {
    if (firstAccount) {
      await this.createAccount.click()
    } else {
      await this.accountListSelector.click()
      await this.addANewccountFromAccountList.click()
    }
    await this.addStandardAccountFromNewAccountScreen.click()

    await this.account("").last().click()
    await expect(this.accountListSelector).toBeVisible()
  }

  async addAccount({ firstAccount = true }: { firstAccount?: boolean }) {
    if (firstAccount) {
      await this.createAccount.click()
    } else {
      await this.accountListSelector.click()
      await this.addANewccountFromAccountList.click()
    }
    await this.addStandardAccountFromNewAccountScreen.click()

    await this.account("").last().click()
    await expect(this.accountListSelector).toBeVisible()
    await this.addFunds.click()
    await this.addFundsFromStartNet.click()
    const accountAddress = await this.accountAddress
      .textContent()
      .then((v) => v?.replaceAll(" ", ""))
    await this.close.last().click()
    const accountName = await this.accountListSelector.textContent()
    return [accountName, accountAddress]
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
    await expect(this.accountListSelector).toHaveText(accountName)
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

  async ensureAsset(accountName: string, name: "Ethereum", value: string) {
    await this.ensureSelectedAccount(accountName)
    await expect(
      this.page.locator(
        `//*[text() = '${name}']/following-sibling::div/p[text() = '${value}']`,
      ),
    ).toBeVisible({ timeout: 1000 * 60 * 4 })
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
  async txValidations(txAmount: string) {
    const trxAmountHeader = await this.page
      .locator(`//*[starts-with(text(),'Send ')]`)
      .textContent()
      .then((v) => v?.split(" ")[1])

    const amountLocator = this.page.locator(
      `//div//label[text()='Send']/following-sibling::div[1]//*[@data-testid]`,
    )
    const sendAmount = await amountLocator
      .textContent()
      .then((v) => v?.split(" ")[0])

    expect(sendAmount!.substring(1)).toBe(`${trxAmountHeader}`)
    if (txAmount != "MAX") {
      expect(txAmount.toString()).toBe(trxAmountHeader)
    }
    const amount = await amountLocator
      .getAttribute("data-testid")
      .then((value) => parseInt(value!) / Math.pow(10, 18))
    return amount
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
    fillRecipientAddress === "paste"
      ? await this.recipientAddressQuery.fill(recipientAddress)
      : await this.recipientAddressQuery.type(recipientAddress)
    if (validAddress) {
      if (recipientAddress.endsWith("stark")) {
        await this.page.click(`button:has-text("${recipientAddress}")`)
      } else {
        await this.recipientAddressQuery.focus()
        await this.page.keyboard.press("Enter")
      }
    }
  }
  async transfer({
    originAccountName,
    recipientAddress,
    tokenName,
    amount,
    fillRecipientAddress = "paste",
    submit = true,
  }: {
    originAccountName: string
    recipientAddress: string
    tokenName: TokenName
    amount: number | "MAX"
    fillRecipientAddress?: "typing" | "paste"
    submit?: boolean
  }) {
    await this.ensureSelectedAccount(originAccountName)
    await this.token(tokenName).click()
    await this.fillRecipientAddress({ recipientAddress, fillRecipientAddress })
    if (amount === "MAX") {
      await expect(this.balance).toBeVisible()
      await expect(this.sendMax).toBeVisible()
      await this.sendMax.click()
    } else {
      await this.amount.fill(amount.toString())
    }

    await this.reviewSend.click()
    const trxAmount = await this.txValidations(amount.toString())
    if (submit) {
      await this.confirm.click()
    }
    return trxAmount
  }

  async ensureTokenBalance({
    accountName,
    token,
    balance,
  }: {
    accountName: string
    token: TokenName
    balance: number
  }) {
    await this.ensureSelectedAccount(accountName)
    await this.token(token).click()
    await expect(this.page.locator('[data-testid="tokenBalance"]')).toHaveText(
      balance.toString(),
    )
    await this.back.click()
  }

  get password() {
    return this.page.locator('input[name="password"]')
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
    return this.page.locator(
      `//textarea[@placeholder="${lang.account.recipientAddress}"]/following::button[1]`,
    )
  }

  get saveAddress() {
    return this.page.locator(`button:text-is("${lang.account.saveAddress}")`)
  }

  get copyAddress() {
    return this.page.locator('[data-testid="account-tokens"] button').first()
  }

  contact(label: string) {
    return this.page.locator(`div h6:text-is("${label}")`)
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
    const nextModal = await this.next.isVisible({ timeout: 60 })
    if (nextModal) {
      await Promise.all([
        expect(
          this.page.locator(
            `h3:has-text("${lang.settings.beforeYouContinue}")`,
          ),
        ).toBeVisible(),
        expect(
          this.page.locator(`p:has-text("${lang.settings.seedWarning}")`),
        ).toBeVisible(),
      ])
      await this.next.click()
    }
    await this.page
      .locator(`span:has-text("${lang.settings.revealSeedPhrase}")`)
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
      this.page.locator(`button:has-text("${lang.settings.copy}")`).click(),
      expect(
        this.page.locator(`button:has-text("${lang.settings.copied}")`),
      ).toBeVisible(),
    ])
    await this.page
      .locator(`p:has-text("${lang.settings.confirmRecovery}")`)
      .click()
    await this.done.click()
    const seedPhraseCopied = await this.page.evaluate(
      `navigator.clipboard.readText();`,
    )
    expect(seed).toBe(seedPhraseCopied)
    return String(seedPhraseCopied)
  }

  // 2FA
  get email() {
    return this.page.locator('input[name="email"]')
  }

  get pinInput() {
    return this.page.locator('[aria-label="Please enter your pin code"]')
  }

  async fillPin(pin: string) {
    await this.pinInput.first().click()
    await this.pinInput.first().fill(pin)
  }

  async setupRecovery() {
    await this.accountAddressFromAssetsView.click()
    return this.saveRecoveryPhrase().then((adr) => String(adr))
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

  get manageOwners() {
    return this.page.locator(`button:text-is("Manage owners")`)
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
    await this.addANewccountFromAccountList.click()
    await this.addMultisigAccountFromNewAccountScreen.click()

    const [pages] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.createNewMultisig.click(),
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
    const locs = await tabs[1].locator('[name^="signerKeys"]').all()
    if (locs.length > signers.length) {
      for (let index = locs.length; index > signers.length + 1; index--) {
        await tabs[1]
          .locator(`[data-testid="closeButton.${index - 2}"]`)
          .click()
      }
    }

    await tabs[1].locator('button:text-is("Next")').click()
    const currentTheshold = await tabs[1]
      .locator('[data-testid="threshold"]')
      .innerText()
      .then((v) => parseInt(v!))

    //set confirmations
    if (confirmations > currentTheshold) {
      for (let i = currentTheshold; i < confirmations; i++) {
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
    await this.addANewccountFromAccountList.click()
    await this.addMultisigAccountFromNewAccountScreen.click()

    await this.joinExistingMultisig.click()
    await this.page.locator('[data-testid="copy-pubkey"]').click()
    await this.page.locator('[data-testid="button-done"]').click()
    return String(await this.page.evaluate(`navigator.clipboard.readText()`))
  }

  ensureMultisigActivated() {
    return Promise.all([
      expect(this.page.locator("label:has-text('Not activated')")).toBeHidden({
        timeout: 60000,
      }),
      expect(
        this.page.locator('[data-testid="activating-multisig"]'),
      ).toBeHidden({ timeout: 60000 }),
    ])
  }

  accountListConfirmations(accountName: string) {
    return this.page.locator(
      `[aria-label="Select ${accountName}"] [data-testid="confirmations"]`,
    )
  }

  get accountViewConfirmations() {
    return this.page.locator('[data-testid="confirmations"]')
  }

  async acceptTx(tx: string) {
    await this.menuActivity.click()
    await this.page.locator(`[data-tx-hash="${tx}"]`).click()
    await this.confirm.click()
  }

  async setConfirmations(accountName: string, confirmations: number) {
    await this.ensureSelectedAccount(accountName)
    await this.showSettings.click()
    await this.account(accountName).click()
    await this.setConfirmationsLocator.click()

    const currentTheshold = await this.page
      .locator('[data-testid="threshold"]')
      .innerText()
      .then((v) => parseInt(v!))
    if (confirmations > currentTheshold) {
      for (let i = currentTheshold; i < confirmations; i++) {
        await this.increaseThreshold.click()
      }
    } else if (confirmations < currentTheshold) {
      for (let i = currentTheshold; i > confirmations; i--) {
        await this.decreaseThreshold.click()
      }
    }
    await this.page.locator('[data-testid="update-confirmations"]').click()
    await this.confirm.click()
    await Promise.all([
      expect(this.confirm).toBeHidden(),
      expect(this.menuActivity).toBeVisible(),
    ])
  }
}
