import browser from "webextension-polyfill"
import { ChromeRepository } from "../../../storage/__new/chrome"
import { IRepository } from "../../../storage/__new/interface"
import { equalToken } from "../utils"
import { TokenPriceDetails } from "../types/tokenPrice.model"

export type ITokenPriceRepository = IRepository<TokenPriceDetails>

export const tokenPriceRepo: ITokenPriceRepository =
  new ChromeRepository<TokenPriceDetails>(browser, {
    areaName: "local",
    namespace: "core:tokenPrices",
    compare: (a: TokenPriceDetails, b: TokenPriceDetails) =>
      equalToken(a, b) && a.pricingId === b.pricingId,
  })
