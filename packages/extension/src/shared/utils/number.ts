import BigNumber from "bignumber.js"
import { BigNumberish, toBigInt } from "ethers"

/** Checks if a value is numeric, ie. possible to coerce to a number, e.g. 123 or '123.0' */

export const isNumeric = (numToCheck: any): numToCheck is BigNumberish => {
  try {
    toBigInt(numToCheck)
    return true
  } catch {
    try {
      return !isNaN(parseFloat(numToCheck)) && isFinite(numToCheck)
    } catch {
      return false
    }
  }
}

export interface IPrettifyNumberConfig {
  minDecimalPlaces: number
  maxDecimalPlaces: number
  /** significants digits to show in decimals while respecting decimal places */
  minDecimalSignificanDigits: number
  /** special case for zero, e.g. we may want to display $0.00 or 0.0 ETH */
  decimalPlacesWhenZero: number
}

export const prettifyNumberConfig: Record<string, IPrettifyNumberConfig> = {
  CURRENCY: {
    minDecimalPlaces: 2,
    maxDecimalPlaces: 10,
    minDecimalSignificanDigits: 2,
    decimalPlacesWhenZero: 2,
  },
  TOKEN: {
    minDecimalPlaces: 4,
    maxDecimalPlaces: 16,
    minDecimalSignificanDigits: 2,
    decimalPlacesWhenZero: 1,
  },
}

export const prettifyCurrencyNumber = (number: BigNumber.Value) => {
  return prettifyNumber(number, prettifyNumberConfig.CURRENCY)
}

export const prettifyTokenNumber = (number: BigNumber.Value) => {
  return prettifyNumber(number, prettifyNumberConfig.TOKEN)
}

/**
 * Prettify an input number for display according to the config
 *
 * @see test suite `number.test.ts` for examples
 */

export const prettifyNumber = (
  number: BigNumber.Value,
  {
    minDecimalPlaces,
    maxDecimalPlaces,
    minDecimalSignificanDigits,
    decimalPlacesWhenZero,
  }: IPrettifyNumberConfig = prettifyNumberConfig.CURRENCY,
) => {
  if (!isNumeric(number)) {
    return null
  }
  const numberBN = new BigNumber(number)
  let untrimmed
  if (numberBN.gte(1)) {
    /** simplest case, formatting to minDecimalPlaces will look good */
    untrimmed = numberBN.toFormat(minDecimalPlaces)
  } else {
    /** now need to interrogate the appearance of decimal number < 1 */
    /** longest case - max decimal places e.g. 0.0008923088123 -> 0.0008923088 */
    const maxDecimalPlacesString = numberBN.toFormat(maxDecimalPlaces)
    /** count the zeros, which will then allow us to know the final length with desired significant digits */
    const decimalPart = maxDecimalPlacesString.split(".")[1]
    const zeroMatches = decimalPart.match(/^0+/)
    const leadingZerosInDecimalPart =
      zeroMatches && zeroMatches.length ? zeroMatches[0].length : 0
    /** now we can re-format with leadingZerosInDecimalPart + maxDecimalSignificanDigits to give us the pretty version */
    /** e.g. 0.0008923088123 -> 0.00089 */
    const prettyDecimalPlaces = Math.max(
      leadingZerosInDecimalPart + minDecimalSignificanDigits,
      minDecimalPlaces,
    )
    untrimmed = numberBN.toFormat(prettyDecimalPlaces)
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
