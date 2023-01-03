import CurrencyConversionNumber from "bignumber.js"
import { BigNumber, BigNumberish, utils } from "ethers"
import { uint256 } from "starknet"

import { TokenDetailsWithBalance } from "../tokens.state"
import {
  isNumeric,
  prettifyCurrencyNumber,
  prettifyTokenNumber,
} from "../utils/number"
import { BaseToken } from "./type"

const { UINT_256_MAX } = uint256

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
  ethValue: string
  ccyValue: string
  ethDayChange: string
  ccyDayChange: string
}

export interface ApiPriceDataResponse {
  prices: ApiPriceDetails[]
}

export interface ILookupTokenPriceDetails {
  /** the token to query */
  token: BaseToken
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
  if (!tokenData?.tokens) {
    return
  }
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
  let didGetValidConversion = false
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
      /** zero is a valid value here */
      if (currencyValue !== undefined) {
        didGetValidConversion = true
        sumTokenBalance = sumTokenBalance.plus(currencyValue)
      }
    }
  })
  /** undefined if there were no valid conversions */
  if (!didGetValidConversion) {
    return
  }
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
  if (
    !isNumeric(amount) ||
    !isNumeric(decimals) ||
    !isNumeric(unitCurrencyValue)
  ) {
    return
  }
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

export const prettifyTokenBalance = (
  token: TokenDetailsWithBalance,
  withSymbol = true,
) => {
  const { balance, decimals, symbol } = token
  if (balance === undefined || decimals === undefined) {
    return null
  }
  return prettifyTokenAmount({
    amount: balance,
    decimals,
    symbol: withSymbol ? symbol : "",
  })
}

export const PRETTY_UNLIMITED = "Unlimited"

export const isUnlimitedAmount = (amount: BigNumberish) => {
  return String(amount) === String(UINT_256_MAX)
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
  let prettyValue
  if (isUnlimitedAmount(amount)) {
    prettyValue = PRETTY_UNLIMITED
  } else {
    const decimalsNumber = Number(decimals)
    const balanceBn = BigNumber.from(amount)
    const balanceFullString = utils.formatUnits(balanceBn, decimalsNumber)
    prettyValue = prettifyTokenNumber(balanceFullString)
  }
  const prettyValueWithSymbol = [prettyValue, symbol].filter(Boolean).join(" ")
  return prettyValueWithSymbol
}

export interface IConvertTokenAmount {
  unitAmount?: BigNumberish
  decimals?: BigNumberish
}

/**
 * Convert a unit amount of token into native amount, useful for user input
 *
 * @example
 * ```ts
 * // Prints '1000000000000000000'
 * convertTokenUnitAmountWithDecimals({ unitAmount: 1, decimals: 18 }),
 * ```
 *
 * @example
 * ```ts
 * // Prints '123'
 * convertTokenUnitAmountWithDecimals({ unitAmount: 1.23, decimals: 2 }),
 * ```
 */

export const convertTokenUnitAmountWithDecimals = ({
  unitAmount,
  decimals,
}: IConvertTokenAmount) => {
  if (
    unitAmount === undefined ||
    !isNumeric(unitAmount) ||
    decimals === undefined ||
    !isNumeric(decimals)
  ) {
    return
  }
  const decimalsNumber = Number(decimals)
  /** amount to multipy by to take unit amount to token value */
  const unitMultiplyBy = Math.pow(10, decimalsNumber)
  /** take unit amount to token amount, enforcing integer */
  const amount = new CurrencyConversionNumber(unitAmount.toString())
    .multipliedBy(unitMultiplyBy)
    .integerValue()
  /** keep as string to avoid loss of precision elsewhere */
  return amount.toString()
}
