import { ethers } from "ethers"
import { number } from "starknet"

import { defaultNetwork } from "../shared/networks"
import { Token, UniqueToken, equalToken, getFeeToken } from "../shared/token"
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
  console.log(ethers.utils.formatUnits(amount, decimals), price)
  console.log(result.toNumber() / minMultiplier)
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
    return result
  }

  public async getPriceForTokenExact(
    token: Token,
    amount: number.BigNumberish,
    baseCurrency?: BaseCurrency,
  ): Promise<number> {
    return getExactPriceForToken(
      token.decimals,
      amount,
      await this.getPriceForToken(token, baseCurrency),
    )
  }
}
