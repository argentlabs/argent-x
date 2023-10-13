import { Page, expect } from "@playwright/test"

import { lang } from "../languages"
import Navigation from "./Navigation"

type TokenName = "Ethereum"
export interface IAsset {
  name: string
  balance: number
  unit: string
}

export default class Account extends Navigation {
  constructor(page: Page) {
    super(page)
  }
  accountName1 = "Account 1"
  accountName2 = "Account 2"

  get noAccountBanner() {
    return this.page.locator(`div h5:text-is("${lang.account.noAccounts}")`)
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
  ////*[text() = 'Ethereum']/following-sibling::div
  async ensureAsset(accountName: string, name: "Ethereum", value: string) {
    await this.ensureSelectedAccount(accountName)
    await expect(
      this.page.locator(
        `//*[text() = '${name}']/following-sibling::div/p[text() = '${value}']`,
      ),
    ).toBeVisible({ timeout: 90000 })
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
    fillRecipientAddress === "paste"
      ? await this.recipientAddressQuery.fill(recipientAddress)
      : await this.recipientAddressQuery.type(recipientAddress)
    if (recipientAddress.endsWith("stark")) {
      await this.page.click(`button:has-text("${recipientAddress}")`)
    } else {
      await this.recipientAddressQuery.focus()
      await this.page.keyboard.press("Enter")
    }
    if (amount === "MAX") {
      await expect(this.balance).toBeVisible()
      await expect(this.sendMax).toBeVisible()
      await this.sendMax.click()
    } else {
      await this.amount.fill(amount.toString())
    }

    await this.reviewSend.click()
    submit ?? (await this.approve.click())
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

  get dappsBanner() {
    return this.page.locator('[title="Dappland"]')
  }

  get dappsBannerClose() {
    return this.page.locator('[title="Dappland"] svg')
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
    return seedPhraseCopied
  }
}
