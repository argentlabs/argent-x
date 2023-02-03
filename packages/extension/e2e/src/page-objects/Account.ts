import { Page, expect } from "@playwright/test"
type language = "en"
const text = {
  en: {
    noAccounts: "You have no accounts on ",
    createAccount: "Create account",
    addFunds: "Add funds",
    fundsFromStarkNet: "From another StarkNet account",
    fullAccountAddress: "Full account address",
    back: "Back",
    close: "Close",
    showAccountList: "Show account list",
    send: "Send",
    next: "Next",
    confirm: "Confirm",
  },
}
type TokenName = "Ethereum"
export interface IAsset {
  name: string
  balance: number
  unit: string
}

export default class Account {
  constructor(private page: Page, private lang: language = "en") {}
  get noAccountBanner() {
    return this.page.locator(`div h5:has-text("${text[this.lang].noAccounts}")`)
  }

  get createAccount() {
    return this.page.locator(
      `button:has-text("${text[this.lang].createAccount}")`,
    )
  }

  get addFunds() {
    return this.page.locator(`button:has-text("${text[this.lang].addFunds}")`)
  }

  get addFundsFromStartNet() {
    return this.page.locator(
      `a:has-text("${text[this.lang].fundsFromStarkNet}")`,
    )
  }

  get accountAddress() {
    return this.page.locator(
      `[aria-label="${text[this.lang].fullAccountAddress}"]`,
    )
  }

  get back() {
    return this.page.locator(`[aria-label="${text[this.lang].back}"]`)
  }

  get close() {
    return this.page.locator(`[aria-label="${text[this.lang].close}"]`)
  }

  get send() {
    return this.page.locator(`button:text-is("${text[this.lang].send}")`)
  }

  token(tkn: TokenName) {
    return this.page.locator(`button:has-text('${tkn}')`)
  }

  get accountList() {
    return this.page.locator(
      `[aria-label="${text[this.lang].showAccountList}"]`,
    )
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
    return this.page.locator('button:has-text("MAX")')
  }

  get recepientAddress() {
    return this.page.locator('[name="recipient"]')
  }

  get next() {
    return this.page.locator(`button:has-text("${text[this.lang].next}")`)
  }

  get approve() {
    return this.page.locator(`button:has-text("${text[this.lang].confirm}")`)
  }

  account(accountName: string) {
    return this.page.locator(`[aria-label="Select ${accountName}"]`)
  }

  get balance() {
    return this.page.locator('[data-testid="tokenBalance"]')
  }

  currentBalance(tkn: "Ether") {
    return this.page.locator(`//img[@alt="${tkn}"]/parent::*/parent::button`)
  }

  get accountName() {
    return this.page.locator('[data-testid="account-tokens"] h2')
  }

  async addAccount({ firstAccount = true }: { firstAccount?: boolean }) {
    if (firstAccount) {
      await this.createAccount.click()
    } else {
      await this.accountList.click()
      await this.addANewccountFromAccountList.click()
    }
    await this.addStandardAccountFromNewAccountScreen.click()
    await this.addFunds.click()
    await this.addFundsFromStartNet.click()
    const accountAddress = await this.accountAddress
      .textContent()
      .then((v) => v?.replaceAll(" ", ""))
    await this.close.last().click()
    const accountName = await this.accountList.textContent()
    return [accountName, accountAddress]
  }

  async selectAccount(accountName: string) {
    await this.accountList.click()
    await this.account(accountName).click()
  }

  async ensureSelectedAccount(accountName: string) {
    const currentAccount = await this.accountList.textContent()
    if (currentAccount != accountName) {
      await this.selectAccount(accountName)
    }
    await expect(this.accountName).toHaveText(accountName)
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

  async ensureAsset(accountName: string, name: "ETH", value: string) {
    await this.ensureSelectedAccount(accountName)
    await expect(
      this.page.locator(`button :text("${value} ${name}")`),
    ).toBeVisible()
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
    recepientAddress,
    tokenName,
    amount,
  }: {
    originAccountName: string
    recepientAddress: string
    tokenName: TokenName
    amount: number | "MAX"
  }) {
    await this.ensureSelectedAccount(originAccountName)
    await this.token(tokenName).click()
    await this.send.last().click()
    if (amount === "MAX") {
      await this.sendMax.click()
    } else {
      await this.amount.fill(amount.toString())
    }
    await this.recepientAddress.fill(recepientAddress)

    await this.next.click()
    await this.approve.click()
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
}
