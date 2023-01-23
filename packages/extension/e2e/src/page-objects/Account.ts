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
    showAccoutList: "Show account list",
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
    return this.page.locator(`[aria-label="${text[this.lang].showAccoutList}"]`)
  }

  get addANewccountFromAccountList() {
    return this.page.locator('[aria-label="Create new wallet"]')
  }

  get assetsList() {
    return this.page.locator('button[role="alert"] ~ button')
  }

  get ammount() {
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

  async addAccount({ firstAccount = true }: { firstAccount?: boolean }) {
    if (firstAccount) {
      await this.createAccount.click()
    } else {
      await this.accountList.click()
      await this.addANewccountFromAccountList.click()
    }
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

  async ensureAccount(accountName: string) {
    const currentAccount = await this.accountList.textContent()
    if (currentAccount != accountName) {
      await this.selectAccount(accountName)
    }
  }

  async assets(accountName: string) {
    await this.ensureAccount(accountName)

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
    await this.ensureAccount(accountName)
    await expect(
      this.page.locator(`button :text("${value} ${name}")`),
    ).toBeVisible()
  }

  async transfer({
    originAccountName,
    recepientAddress,
    tokenName,
    ammount,
  }: {
    originAccountName: string
    recepientAddress: string
    tokenName: TokenName
    ammount: number | "MAX"
  }) {
    await this.ensureAccount(originAccountName)
    await this.token(tokenName).click()
    await this.send.last().click()
    if (ammount === "MAX") {
      await this.sendMax.click()
    } else {
      await this.ammount.fill(ammount.toString())
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
    await this.ensureAccount(accountName)
    await this.token(token).click()
    await expect(this.page.locator('[data-testid="tokenBalance"]')).toHaveText(
      balance.toString(),
    )
    await this.back.click()
  }
}
