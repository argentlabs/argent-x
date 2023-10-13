import { BigNumberish } from "starknet"
import { bigDecimal } from "@argent/shared"
import { isFunction } from "lodash-es"

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
  formatter?: (number: bigint) => string
}

export const prettifyNumberConfig: Record<string, IPrettifyNumberConfig> = {
  CURRENCY: {
    minDecimalPlaces: 2,
    maxDecimalPlaces: 10,
    minDecimalSignificantDigits: 2,
    decimalPlacesWhenZero: 2,
    formatter: new Intl.NumberFormat().format,
  },
  TOKEN: {
    minDecimalPlaces: 4,
    maxDecimalPlaces: 16,
    minDecimalSignificantDigits: 2,
    decimalPlacesWhenZero: 1,
    formatter: new Intl.NumberFormat().format,
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
    minDecimalSignificantDigits,
    decimalPlacesWhenZero,
    formatter,
  }: IPrettifyNumberConfig = prettifyNumberConfig.CURRENCY,
) => {
  // If the input is not a valid numeric value, return null
  if (!isNumeric(number)) {
    return null
  }

  // Handle zero case separately for performance and simplicity
  if (parseFloat(number.toString()) === 0) {
    return `0.${"0".repeat(decimalPlacesWhenZero)}`
  }

  const numberString = number.toString()
  let untrimmed: string

  // If number is greater than or equal to 1, we format with minimum decimal places
  if (parseFloat(numberString) >= 1) {
    const numberBN = bigDecimal.parseUnits(numberString, minDecimalPlaces)
    untrimmed = bigDecimal.formatUnits(numberBN, minDecimalPlaces)
  } else {
    // For numbers less than 1, determine the number of leading zeros after the decimal point
    const leadingZerosInDecimalPart =
      numberString.split(".")[1]?.match(/^0+/)?.[0]?.length || 0

    // Calculate the required decimal places, considering the leading zeros and minimum significant digits
    const prettyDecimalPlaces = Math.max(
      leadingZerosInDecimalPart + minDecimalSignificantDigits,
      minDecimalPlaces,
    )

    // Format the number with the required decimal places
    const numberBN = bigDecimal.parseUnits(numberString, prettyDecimalPlaces)
    untrimmed = bigDecimal.formatUnits(numberBN, prettyDecimalPlaces)
  }

  // Split the number into integer and fraction parts
  let [integer, fraction = ""] = untrimmed.split(".")

  // If formatter is a function, apply it to format the integer part
  if (isFunction(formatter)) {
    integer = formatter(BigInt(integer))
  }

  // Ensure that the fraction has at least the minimum required length
  fraction = fraction.padEnd(minDecimalPlaces, "0")

  // Join the integer and fraction parts and remove trailing zeros, while ensuring a minimum length
  const formatted = `${integer}${fraction ? `.${fraction}` : ""}`
  let trimmed = formatted.replace(/0+$/, "")
  const minLength = 1 + formatted.indexOf(".") + decimalPlacesWhenZero
  if (trimmed.length < minLength) {
    trimmed = formatted.substring(0, minLength)
  }

  return trimmed
}
