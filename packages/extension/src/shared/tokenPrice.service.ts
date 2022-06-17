import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import { formatUnits } from "ethers/lib/utils"

import { TokenDetailsWithBalance } from "../ui/features/accountTokens/tokens.state"
import { UniqueToken } from "./token"

export const ARGENT_API_TOKENS_PRICES_URL = `${process.env.REACT_APP_ARGENT_API_BASE_URL}/tokens/prices?chain=starknet`
export const ARGENT_API_TOKENS_INFO_URL = `${process.env.REACT_APP_ARGENT_API_BASE_URL}/tokens/info?chain=starknet`

/** shape of individual entity in the /tokens/info endpoint */
export interface ApiTokenDetails {
  id: number
  address: string
  pricingId: number
}

export interface ApiTokenDataResponse {
  tokens: ApiTokenDetails[]
}

/** shape of individual entity in the /tokens/prices endpoint */
export interface ApiPriceDetails {
  pricingId: number
  ethValue: number
  ccyValue: number
  ethDayChange: number
  ccyDayChange: number
}

export interface ApiPriceDataResponse {
  prices: ApiPriceDetails[]
}

export interface ILookupTokenPriceDetails {
  /** the token to query */
  token: UniqueToken
  /** reponse from `/tokens/prices` endpoint */
  pricesData: ApiPriceDataResponse
  /** reponse from `/tokens/info` endpoint */
  tokenData: ApiTokenDataResponse
}

/**
 * Given `token`, find the token in the `tokenData` and then the price details in `priceData`
 */

export const lookupTokenPriceDetails = ({
  token,
  pricesData,
  tokenData,
}: ILookupTokenPriceDetails) => {
  /** find token from tokenData by matching address */
  const tokenInPriceData = tokenData.tokens.find(
    ({ address }) => address.toLowerCase() === token.address.toLowerCase(),
  )
  if (tokenInPriceData) {
    /** find token price details from pricesData by matching priceId */
    const priceDetails = pricesData.prices.find(
      ({ pricingId }) => pricingId === tokenInPriceData.pricingId,
    )
    return priceDetails
  }
}

export interface ISumTokenBalancesToCurrencyValue {
  /** the tokens to sum */
  tokens: TokenDetailsWithBalance[]
  /** reponse from `/tokens/prices` endpoint */
  pricesData: ApiPriceDataResponse
  /** reponse from `/tokens/info` endpoint */
  tokenData: ApiTokenDataResponse
}

export const sumTokenBalancesToCurrencyValue = ({
  tokens,
  pricesData,
  tokenData,
}: ISumTokenBalancesToCurrencyValue) => {
  let sumTokenBalance = 0
  tokens.forEach((token) => {
    const priceDetails = lookupTokenPriceDetails({
      token,
      pricesData,
      tokenData,
    })
    if (!priceDetails || !token.balance || !token.decimals) {
      // missing data - don't add it
    } else {
      const currencyValue = convertTokenAmountToCurrencyValue({
        amount: token.balance,
        decimals: token.decimals,
        unitCurrencyValue: priceDetails.ccyValue,
      })
      if (currencyValue) {
        sumTokenBalance += Number(currencyValue)
      }
    }
  })
  /** convert to string for consistency with `convertTokenAmountToCurrencyValue()` */
  return String(sumTokenBalance)
}

/**
 * Count the decimals in the provided `value`, e.g. 1.123 has 3 decimals
 */

export const countDecimals = (value: number | string) => {
  const numValue = Number(value)
  /** check for whole number with no decimals */
  if (Math.floor(numValue) === numValue) {
    return 0
  }
  /** count decimals after conversion to string e.g. '12.34' */
  return numValue.toString().split(".")[1].length || 0
}

export interface IConvertTokenAmountToCurrencyValue {
  /** the token decimal amount */
  amount: BigNumberish
  /** number of decimals used in token amount */
  decimals: BigNumberish
  /** the currency value of 1 unit of token */
  unitCurrencyValue: number | string
}

/**
 * Converts a token amount and decimals into a final currency value, returning a raw string with many decimals
 */

export const convertTokenAmountToCurrencyValue = ({
  amount,
  decimals,
  unitCurrencyValue,
}: IConvertTokenAmountToCurrencyValue) => {
  /**
   * BigNumber is only for integers, it does not support floating-point or fixed-point math
   * @see https://github.com/ethers-io/ethers.js/issues/488#issuecomment-481944450
   */
  const decimalsNumber = Number(decimals)
  const unitCurrencyValueNumber = Number(unitCurrencyValue)

  /** determine what we need to multiply by to make price into an integer */
  const priceDecimals = countDecimals(unitCurrencyValueNumber)
  const priceToIntegerMultiplier = Math.pow(10, priceDecimals)

  /** Math.round due to loss of precision */
  const integerPrince = BigNumber.from(
    Math.round(unitCurrencyValueNumber * priceToIntegerMultiplier),
  )

  /** Multiply the integer price by balance, then divide down by the multiplier from above */
  const priceWithDecimals = integerPrince
    .mul(amount)
    .div(priceToIntegerMultiplier)

  /** Convert down using decimals */
  const convertedPrice = formatUnits(priceWithDecimals, decimalsNumber)
  return convertedPrice
}

/**
 * Prettify a raw currency string value e.g. '1.23456' => '$1.23'
 */

export const prettifyCurrencyValue = (currencyValue?: string | number) => {
  if (currencyValue === undefined) {
    return null
  }
  const prettyValue = Number(currencyValue).toFixed(2)
  /** TODO: implement currency? thousands separators etc.? */
  const symbol = "$"
  return `${symbol}${prettyValue}`
}
