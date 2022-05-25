import { number } from "starknet"

import { defaultNetwork } from "../shared/networks"
import { Token, UniqueToken, equalToken, getFeeToken } from "../shared/token"
import { StaleWhileRevalidateCache } from "./swr/types"
import { fetchWithTimeout } from "./utils/fetchWithTimeout"

type VsCorrency = "usd"

type GetPriceForToken = (
  token: UniqueToken,
  vsCurrency?: VsCorrency,
) => Promise<number>

export const getPriceForToken: GetPriceForToken = async (
  token,
  vsCurrency = "usd",
) => {
  const feeTokenResult = getFeeToken(token.networkId ?? defaultNetwork.id)

  if (
    feeTokenResult &&
    equalToken(token, feeTokenResult) &&
    vsCurrency === "usd"
  ) {
    const result = await fetchWithTimeout(
      `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${vsCurrency}`,
    )
    const resultJson = await result.json()
    return resultJson.ethereum[vsCurrency]
  }

  throw new Error("Rate not found")
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
  priceForOne: number,
): number {
  const amountDecimals =
    typeof decimals === "number" ? decimals : parseInt(decimals)
  const priceDecimals = countDecimals(priceForOne)
  const minMultiplier = Math.pow(10, priceDecimals)
  const maxMultiplierBn = number.toBN(10).pow(number.toBN(amountDecimals))

  const priceBn = number.toBN(priceForOne * minMultiplier)
  const amountBn = number.toBN(amount)

  const result = amountBn.mul(priceBn).div(maxMultiplierBn)
  return result.toNumber() / minMultiplier
}

export class TokenPriceService {
  private readonly getPriceForTokenImpl: GetPriceForToken
  private readonly swrService: StaleWhileRevalidateCache

  constructor(
    swrService: StaleWhileRevalidateCache,
    getPriceForTokenImpl: GetPriceForToken = getPriceForToken,
  ) {
    this.getPriceForTokenImpl = getPriceForTokenImpl
    this.swrService = swrService
  }

  public async getPriceForToken(
    token: UniqueToken,
    vsCurrency?: VsCorrency,
  ): Promise<number> {
    const key = `${token.networkId}-${token.address}-${vsCurrency}`
    const result = await this.swrService(key, () =>
      this.getPriceForTokenImpl(token, vsCurrency),
    )
    return result
  }

  public async getPriceForTokenExact(
    token: Token,
    amount: number.BigNumberish,
    vsCurrency?: VsCorrency,
  ): Promise<number> {
    return getExactPriceForToken(
      token.decimals,
      amount,
      await this.getPriceForToken(token, vsCurrency),
    )
  }
}
