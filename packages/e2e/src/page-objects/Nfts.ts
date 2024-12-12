import { Page } from "@playwright/test"

import Navigation from "./Navigation"

export default class Nfts extends Navigation {
  constructor(page: Page) {
    super(page)
  }

  collection(name: string) {
    return this.page.locator(`h5:text-is("${name}")`)
  }

  ntf(name: string) {
    return this.page.getByRole("group", { name }).getByRole("img")
  }

  nftByPosition(position: number = 0) {
    return this.page.locator('[data-testid="nft-item-name"]').nth(position)
  }
}
