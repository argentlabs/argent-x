import { number } from "starknet"

import { defaultNetwork } from "../shared/networks"
import { Token, UniqueToken, equalToken, getFeeToken } from "../shared/token"
import {
  ARGENT_API_TOKENS_INFO_URL,
  ARGENT_API_TOKENS_PRICES_URL,
  ApiPriceDataResponse,
  ApiTokenDataResponse,
  convertTokenAmountToCurrencyValue,
  fetcher,
  lookupTokenPriceDetails,
} from "../ui/features/accountTokens/tokens.service"
import { StaleWhileRevalidateCache } from "./swr/types"
import { fetchWithTimeout } from "./utils/fetchWithTimeout"

type BaseCurrency = "usd"

type GetPriceForToken = (
  token: UniqueToken,
  baseCurrency?: BaseCurrency,
) => Promise<number>

export const getPriceForToken: GetPriceForToken = async (
  token,
  baseCurrency = "usd",
) => {
  const feeTokenResult = getFeeToken(token.networkId ?? defaultNetwork.id)

  if (
    feeTokenResult &&
    equalToken(token, feeTokenResult) &&
    baseCurrency === "usd"
  ) {
    const result = await fetchWithTimeout(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${baseCurrency}`,
    )
    const resultJson = await result.json()
    return resultJson.ethereum[baseCurrency]
  }

  throw new Error("Price not found")
}

function countDecimals(num: number) {
  if (Math.floor(num.valueOf()) === num.valueOf()) {
    return 0
  }
  return num.toString().split(".")[1].length || 0
}

function getExactPriceForToken(
  decimals: string | number,
  amount: number.BigNumberish,
  price: number,
): number {
  const amountDecimals =
    typeof decimals === "number" ? decimals : parseInt(decimals)
  const priceDecimals = countDecimals(price)
  const minMultiplier = Math.pow(10, priceDecimals)
  const maxMultiplierBn = number.toBN(10).pow(number.toBN(amountDecimals))

  const priceBn = number.toBN(price * minMultiplier)
  const amountBn = number.toBN(amount)

  const result = amountBn.mul(priceBn).div(maxMultiplierBn)
  return result.toNumber() / minMultiplier
}

export class TokenPriceService {
  constructor(
    private readonly swrService: StaleWhileRevalidateCache,
    private readonly getPriceForTokenImpl: GetPriceForToken = getPriceForToken,
  ) {}

  public async getPriceForToken(
    token: UniqueToken,
    baseCurrency?: BaseCurrency,
  ): Promise<number> {
    const key = `${token.networkId}-${token.address}-${baseCurrency}`
    const result = await this.swrService(key, () =>
      this.getPriceForTokenImpl(token, baseCurrency),
    )
    console.log({ result })
    return result
  }

  public async getPriceForTokenNew(token: UniqueToken): Promise<number> {
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
    console.log({ pricesData, tokenData, priceDetails })
    return priceDetails?.ccyValue || 0
  }

  public async getPriceForTokenExact(
    token: Token,
    amount: number.BigNumberish,
    baseCurrency?: BaseCurrency,
  ): Promise<number> {
    const unitCurrencyValue = await this.getPriceForTokenNew(token)
    const priceNew = convertTokenAmountToCurrencyValue({
      amount,
      decimals: token.decimals,
      unitCurrencyValue,
    })
    console.log({ priceNew })
    const priceForToken = await this.getPriceForToken(token, baseCurrency)
    console.log({ priceForToken })
    const exactPriceForToken = getExactPriceForToken(
      token.decimals,
      amount,
      priceForToken,
    )
    console.log({ exactPriceForToken })
    // return exactPriceForToken
    return Number(priceNew)
  }
}
