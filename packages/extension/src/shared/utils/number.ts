/**
 * BigDecimalNumber is to be used ONLY for arbitrary-precision decimal and non-decimal arithmetic
 * This is good for converting and multiplying currency values
 *
 * Not to be confused with BigInt
 */
import BigDecimalNumber from "bignumber.js"
import type { BigNumberish } from "starknet"

/** Checks if a value is numeric, ie. possible to coerce to a number, e.g. 123 or '123.0' */

export const isNumeric = (numToCheck: any): boolean =>
  !isNaN(parseFloat(numToCheck)) && isFinite(Number(numToCheck))

export interface IPrettifyNumberConfig {
  minDecimalPlaces: number
  maxDecimalPlaces: number
  /** significants digits to show in decimals while respecting decimal places */
  minDecimalSignificantDigits: number
  /** special case for zero, e.g. we may want to display $0.00 or 0.0 ETH */
  decimalPlacesWhenZero: number
}

export const prettifyNumberConfig: Record<string, IPrettifyNumberConfig> = {
  CURRENCY: {
    minDecimalPlaces: 2,
    maxDecimalPlaces: 10,
    minDecimalSignificantDigits: 2,
    decimalPlacesWhenZero: 2,
  },
  TOKEN: {
    minDecimalPlaces: 4,
    maxDecimalPlaces: 16,
    minDecimalSignificantDigits: 2,
    decimalPlacesWhenZero: 1,
  },
}

export const prettifyCurrencyNumber = (number: BigNumberish) => {
  return prettifyNumber(number, prettifyNumberConfig.CURRENCY)
}

export const prettifyTokenNumber = (number: BigNumberish) => {
  return prettifyNumber(number, prettifyNumberConfig.TOKEN)
}

/**
 * Prettify an input number for display according to the config
 *
 * @see test suite `number.test.ts` for examples
 */

export const prettifyNumber = (
  number: BigNumberish,
  {
    minDecimalPlaces,
    maxDecimalPlaces,
    minDecimalSignificantDigits: minDecimalSignificantDigits,
    decimalPlacesWhenZero,
  }: IPrettifyNumberConfig = prettifyNumberConfig.CURRENCY,
) => {
  if (!isNumeric(number)) {
    return null
  }
  const numberBDN = new BigDecimalNumber(
    typeof number === "bigint" ? number.toString() : number,
  )
  let untrimmed
  if (numberBDN.gte(1)) {
    /** simplest case, formatting to minDecimalPlaces will look good */
    untrimmed = numberBDN.toFormat(minDecimalPlaces)
  } else {
    /** now need to interrogate the appearance of decimal number < 1 */
    /** longest case - max decimal places e.g. 0.0008923088123 -> 0.0008923088 */
    const maxDecimalPlacesString = numberBDN.toFormat(maxDecimalPlaces)
    /** count the zeros, which will then allow us to know the final length with desired significant digits */
    const decimalPart = maxDecimalPlacesString.split(".")[1]
    const zeroMatches = decimalPart.match(/^0+/)
    const leadingZerosInDecimalPart =
      zeroMatches && zeroMatches.length ? zeroMatches[0].length : 0
    /** now we can re-format with leadingZerosInDecimalPart + maxDecimalSignificanDigits to give us the pretty version */
    /** e.g. 0.0008923088123 -> 0.00089 */
    const prettyDecimalPlaces = Math.max(
      leadingZerosInDecimalPart + minDecimalSignificantDigits,
      minDecimalPlaces,
    )
    untrimmed = numberBDN.toFormat(prettyDecimalPlaces)
  }
  /** the untrimmed string may have trailing zeros, e.g. 0.0890 */
  /** trim to a minimum specified by the config, e.g. we may want to display $0.00 or 0.0 ETH */
  let trimmed = untrimmed.replace(/0+$/, "")
  const minLength = 1 + untrimmed.indexOf(".") + decimalPlacesWhenZero
  if (trimmed.length < minLength) {
    trimmed = untrimmed.substring(0, minLength)
  }
  return trimmed
}
