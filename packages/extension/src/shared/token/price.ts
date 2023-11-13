import { uint256, BigNumberish } from "starknet"

import {
  isNumeric,
  prettifyCurrencyNumber,
  prettifyTokenNumber,
} from "../utils/number"
import { bigDecimal } from "@argent/shared"
import { TokenPriceDetails } from "./__new/types/tokenPrice.model"
import { BaseToken, Token } from "./__new/types/token.model"
import { equalToken } from "./__new/utils"
import { TokenWithOptionalBigIntBalance } from "./__new/types/tokenBalance.model"
import { isArray, isUndefined } from "lodash-es"

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
  pricesData: TokenPriceDetails[] | undefined
  /** reponse from `/tokens/info` endpoint */
  tokenData: Token[] | undefined
}

/**
 * Given `token`, find the token in the `tokenData` and then the price details in `priceData`
 */

export const lookupTokenPriceDetails = ({
  token: baseToken,
  pricesData,
  tokenData,
}: ILookupTokenPriceDetails) => {
  if (
    !tokenData ||
    !isArray(tokenData) ||
    !pricesData ||
    !isArray(pricesData)
  ) {
    return
  }
  /** find token from tokenData by matching address */
  const tokenInPriceData = tokenData.find((token) =>
    equalToken(baseToken, token),
  )
  if (!tokenInPriceData) {
    return
  }
  /** find token price details from pricesData by matching priceId */
  return pricesData.find(
    ({ pricingId }) => pricingId === tokenInPriceData.pricingId,
  )
}

export interface ISumTokenBalancesToCurrencyValue {
  /** the tokens to sum */
  tokens: TokenWithOptionalBigIntBalance[]
  /** reponse from `/tokens/prices` endpoint */
  pricesData: TokenPriceDetails[]
  /** reponse from `/tokens/info` endpoint */
  tokenData: Token[]
}

export const sumTokenBalancesToCurrencyValue = ({
  tokens,
  pricesData,
  tokenData,
}: ISumTokenBalancesToCurrencyValue) => {
  let sumTokenBalance = BigInt(0)
  let didGetValidConversion = false
  tokens.forEach((token) => {
    const priceDetails = lookupTokenPriceDetails({
      token,
      pricesData,
      tokenData,
    })
    if (
      priceDetails &&
      // 0n is considered false otherwise
      !isUndefined(token.balance) &&
      !isUndefined(token.decimals)
    ) {
      const currencyValue = convertTokenAmountToCurrencyValue({
        amount: token.balance,
        decimals: token.decimals,
        unitCurrencyValue: priceDetails.ccyValue,
      })
      /** zero is a valid value here */
      if (currencyValue !== undefined) {
        didGetValidConversion = true
        sumTokenBalance =
          sumTokenBalance + bigDecimal.parseCurrency(currencyValue).value
      }
    }
  })
  /** undefined if there were no valid conversions */
  if (!didGetValidConversion) {
    return
  }
  /** keep as string to avoid loss of precision elsewhere */
  return bigDecimal.formatCurrency(sumTokenBalance)
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

  /** decimal is numeric, hence can be converted to Number */
  const decimalsNumber = Number(decimals)

  /** multiply to convert to currency */
  const currencyValue =
    BigInt(amount) *
    bigDecimal.parseCurrency(unitCurrencyValue.toString()).value
  /** keep as string to avoid loss of precision elsewhere */
  return bigDecimal.formatUnits({
    value: currencyValue,
    decimals: decimalsNumber + 6,
  })
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
  token: TokenWithOptionalBigIntBalance,
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
  showPlusSign?: boolean
  withSymbol?: boolean
  unlimitedText?: string
}

export const prettifyTokenAmount = ({
  amount,
  decimals,
  symbol,
  showPlusSign = false,
  withSymbol = true,
  unlimitedText = PRETTY_UNLIMITED,
}: IPrettifyTokenAmount) => {
  if (!isNumeric(amount)) {
    return null
  }
  let prettyValue
  let isPositiveValue = false
  if (isUnlimitedAmount(amount)) {
    prettyValue = unlimitedText
  } else {
    const decimalsNumber = Number(decimals)
    const balance = BigInt(amount)
    isPositiveValue = balance > 0n
    const balanceFullString =
      decimalsNumber > 0
        ? bigDecimal.formatUnits({ value: balance, decimals: decimalsNumber })
        : balance.toString()
    prettyValue =
      decimalsNumber > 0
        ? prettifyTokenNumber(balanceFullString)
        : balanceFullString
  }

  const prettyValueWithSymbol = [prettyValue, withSymbol && symbol]
    .filter(Boolean)
    .join(" ")

  return showPlusSign && isPositiveValue
    ? `+${prettyValueWithSymbol}`
    : prettyValueWithSymbol
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

  /** decimal is numeric, hence can be converted to Number */
  const decimalsNumber = Number(decimals)

  // keep as string to avoid loss of precision elsewhere
  return bigDecimal
    .parseUnits(unitAmount.toString(), decimalsNumber)
    .value.toString()
}
