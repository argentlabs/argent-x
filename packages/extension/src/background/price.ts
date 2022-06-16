import { number } from "starknet"

import { defaultNetwork } from "../shared/networks"
import { Token, UniqueToken, equalToken, getFeeToken } from "../shared/token"
import {
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
  ApiPriceDataResponse,
  ApiTokenDataResponse,
  convertTokenAmountToCurrencyValue,
  lookupTokenPriceDetails,
} from "../shared/tokenPrice.service"
import { fetcher } from "../shared/utils/fetcher"
import { StaleWhileRevalidateCache } from "./swr/types"

type BaseCurrency = "usd"

export class TokenPriceService {
  constructor(private readonly swrService: StaleWhileRevalidateCache) {}

  public async getPriceForTokenNew(token: UniqueToken): Promise<number> {
    const feeTokenResult = getFeeToken(token.networkId ?? defaultNetwork.id)

    if (!feeTokenResult || !equalToken(token, feeTokenResult)) {
      throw new Error("Price not found")
    }

    const pricesData: ApiPriceDataResponse = await this.swrService(
      ARGENT_API_TOKENS_PRICES_URL,
      () => fetcher(ARGENT_API_TOKENS_PRICES_URL),
    )
    const tokenData: ApiTokenDataResponse = await this.swrService(
      ARGENT_API_TOKENS_INFO_URL,
      () => fetcher(ARGENT_API_TOKENS_INFO_URL),
    )
    const priceDetails = lookupTokenPriceDetails({
      token,
      pricesData,
      tokenData,
    })

    if (!priceDetails || !priceDetails.ccyValue) {
      throw new Error("Price not found")
    }
    return priceDetails.ccyValue
  }

  public async getPriceForTokenExact(
    token: Token,
    amount: number.BigNumberish,
    _baseCurrency?: BaseCurrency,
  ): Promise<number> {
    const unitCurrencyValue = await this.getPriceForTokenNew(token)
    const price = convertTokenAmountToCurrencyValue({
      amount,
      decimals: token.decimals,
      unitCurrencyValue,
    })
    return Number(price)
  }
}
