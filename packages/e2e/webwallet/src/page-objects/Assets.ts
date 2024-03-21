import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"
import { TokenSymbol, TokenName } from "../../../shared/src/assets"

export default class Assets {
  page: Page
  constructor(page: Page) {
    this.page = page
  }

  get yourAssetsTitle() {
    return this.page.getByRole("heading", { name: "Your assets" }).first()
  }

  get YourCoinsTitle() {
    return this.page.getByRole("heading", { name: "Your coins" }).first()
  }

  tokenSymbolLoc(token: TokenSymbol) {
    return this.page.locator(`[data-testid="token-${token}"]`)
  }

  tokenNameLoc(tokenName: TokenName) {
    return this.page.getByRole("heading", { name: tokenName }).first()
  }

  get yourNFTTitle() {
    return this.page.getByRole("heading", { name: "Your NFTs" })
  }

  get nftName() {
    return this.page.getByRole("heading", { name: "Starknet ID: 394352173364" })
  }

  get numberOfNFTs() {
    return this.page.locator('p:text-is("1 NFT")')
  }

  get send() {
    return this.page.locator(`button:text-is("Send")`)
  }
  async hoverElements() {
    await this.yourAssetsTitle.click()
    await this.tokenSymbolLoc("ETH").hover()
    await expect(this.send).toBeVisible()
    await this.yourAssetsTitle.click()
    await this.tokenSymbolLoc("USDC").hover()
    await expect(this.send).toBeVisible()
    await this.yourAssetsTitle.click()
    await this.tokenSymbolLoc("DAI").hover()
    await expect(this.send).toBeVisible()
    await this.yourAssetsTitle.click()
    await this.tokenSymbolLoc("WBTC").hover()
    await expect(this.send).toBeVisible()
    await this.yourAssetsTitle.click()
    await this.nftName.hover()
    await expect(this.send).toBeVisible()
  }

  async assetPageHasLoaded() {
    await Promise.all([
      expect(this.yourAssetsTitle).toBeVisible(),
      expect(this.YourCoinsTitle).toBeVisible(),
      expect(this.tokenNameLoc("Ethereum")).toBeVisible(),
      expect(this.tokenSymbolLoc("ETH")).toBeVisible(),
      expect(this.tokenNameLoc("DAI")).toBeVisible(),
      expect(this.tokenSymbolLoc("DAI")).toBeVisible(),
      expect(this.tokenNameLoc("Wrapped BTC")).toBeVisible(),
      expect(this.tokenSymbolLoc("WBTC")).toBeVisible(),
      expect(this.tokenNameLoc("USD Coin")).toBeVisible(),
      expect(this.tokenSymbolLoc("USDC")).toBeVisible(),
      expect(this.tokenNameLoc("Starknet")).toBeVisible(),
      expect(this.tokenSymbolLoc("STRK")).toBeVisible(),
      expect(this.yourNFTTitle).toBeVisible(),
      expect(this.nftName).toBeVisible(),
      expect(this.numberOfNFTs).toBeVisible(),
    ])
    await this.yourAssetsTitle.click()
    expect(this.hoverElements)
  }
}
