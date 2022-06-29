import CurrencyConversionNumber from "bignumber.js"
import { BigNumber, BigNumberish, utils } from "ethers"
import { isString } from "lodash-es"
import urlJoin from "url-join"

import { TokenDetailsWithBalance } from "../ui/features/accountTokens/tokens.state"
import { UniqueToken } from "./token"
import {
  isNumeric,
  prettifyCurrencyNumber,
  prettifyTokenNumber,
} from "./utils/number"

const REACT_APP_ARGENT_API_BASE_URL = process.env
  .REACT_APP_ARGENT_API_BASE_URL as string

export const ARGENT_API_ENABLED =
  isString(REACT_APP_ARGENT_API_BASE_URL) &&
  REACT_APP_ARGENT_API_BASE_URL.length > 0

export const ARGENT_API_TOKENS_PRICES_URL = ARGENT_API_ENABLED
  ? urlJoin(REACT_APP_ARGENT_API_BASE_URL, "tokens/prices?chain=starknet")
  : undefined

export const ARGENT_API_TOKENS_INFO_URL = ARGENT_API_ENABLED
  ? urlJoin(REACT_APP_ARGENT_API_BASE_URL, "tokens/info?chain=starknet")
  : undefined

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
  let sumTokenBalance = new CurrencyConversionNumber(0)
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
        sumTokenBalance = sumTokenBalance.plus(currencyValue)
      }
    }
  })
  /** keep as string to avoid loss of precision elsewhere */
  return sumTokenBalance.toString()
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
  const decimalsNumber = Number(decimals)
  /** amount to divide by to take amount to unit value */
  const unitDivideBy = Math.pow(10, decimalsNumber)
  /** take amount to unit value */
  const amountDecimal = new CurrencyConversionNumber(
    amount.toString(),
  ).dividedBy(unitDivideBy)
  /** multiply to convert to currency */
  const currencyValue = amountDecimal.multipliedBy(
    new CurrencyConversionNumber(unitCurrencyValue),
  )
  /** keep as string to avoid loss of precision elsewhere */
  return currencyValue.toString()
}

/**
 * Prettify a raw currency string value e.g. '1.23456' => '$1.23'
 */

export const prettifyCurrencyValue = (
  currencyValue?: string | number,
  currencySymbol = "$",
) => {
  if (currencyValue === undefined || !isNumeric(currencyValue)) {
    return null
  }
  const prettyValue = prettifyCurrencyNumber(currencyValue)
  const prettyValueWithSymbol = [currencySymbol, prettyValue]
    .filter(Boolean)
    .join("")
  return prettyValueWithSymbol
}

/**
 * Returns a string of token balance with symbol if available e.g.
 */

export const prettifyTokenBalance = (token: TokenDetailsWithBalance) => {
  const { balance, decimals, symbol } = token
  if (balance === undefined || decimals === undefined) {
    return null
  }
  return prettifyTokenAmount({
    amount: balance,
    decimals,
    symbol,
  })
}

export interface IPrettifyTokenAmount {
  amount: BigNumberish
  decimals: BigNumberish
  symbol?: string
}

export const prettifyTokenAmount = ({
  amount,
  decimals,
  symbol,
}: IPrettifyTokenAmount) => {
  if (!isNumeric(amount)) {
    return null
  }
  const decimalsNumber = Number(decimals)
  const balanceBn = BigNumber.from(amount)
  const balanceFullString = utils.formatUnits(balanceBn, decimalsNumber)
  const prettyValue = prettifyTokenNumber(balanceFullString)
  const prettyValueWithSymbol = [prettyValue, symbol].filter(Boolean).join(" ")
  return prettyValueWithSymbol
}
