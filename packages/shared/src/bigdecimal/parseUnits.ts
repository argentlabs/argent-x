import { BigDecimal } from "./types"

/**
 * Parses a string value representing a number to a BigInt, with a specified number of decimals.
 * If the fraction part of the string value is longer than the allowed decimal places, it rounds the value.
 *
 * @param {string} value - The string value to be parsed.
 * @param {number} decimals - The number of decimals to consider during parsing.
 * @returns {bigint} The parsed BigInt value.
 */
export function parseUnits(value: string, decimals: number): BigDecimal {
  let [integer, fraction = ""] = value.split(".")

  const negative = integer.startsWith("-")
  if (negative) {
    integer = integer.slice(1)
  }

  // If the fraction is longer than allowed, round it off
  if (fraction.length > decimals) {
    const unitIndex = decimals
    const unit = Number(fraction[unitIndex])

    if (unit >= 5) {
      const fractionBigInt = BigInt(fraction.slice(0, decimals)) + 1n
      fraction = fractionBigInt.toString().padStart(decimals, "0")
    } else {
      fraction = fraction.slice(0, decimals)
    }
  } else {
    fraction = fraction.padEnd(decimals, "0")
  }

  const parsedValue = BigInt(`${negative ? "-" : ""}${integer}${fraction}`)

  return {
    value: parsedValue,
    decimals,
  }
}
