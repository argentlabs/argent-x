import { parseUnits } from "./parseUnits"
import { formatUnits } from "./formatUnits"
import { BigDecimal } from "./types"
import { abs } from "."

/**
 * Formats a BigInt representing wei into a string representing ether,
 * with a precision of 18 decimal places.
 *
 * {
 *    wei: bigint,
 *    decimals: 18
 * }
 *
 * @param {bigint} wei - The amount in wei to be formatted to ether.
 * @returns {string} The amount in ether.
 */
export function formatEther(wei: bigint): string {
  return formatUnits({ value: wei, decimals: 18 })
}

/**
 * Parses a string representing ether into a BigInt representing wei.
 *
 * @param {string} ether - The amount in ether to be parsed to wei.
 * @returns {bigint} The amount in wei.
 */
export function parseEther(ether: string): BigDecimal {
  return parseUnits(ether, 18)
}

/**
 * Formats a BigInt representing a currency amount into a string,
 * with a precision of 6 decimal places.
 *
 * {
 *    amount: bigint,
 *    decimals: 6
 * }
 *
 * @param {bigint} value - The amount to be formatted.
 * @returns {string} The formatted amount.
 */
export function formatCurrency(value: bigint): string {
  return formatUnits({ value, decimals: 6 })
}

/**
 * Parses a string representing a currency amount into a BigInt.
 *
 * @param {string} amount - The amount to be parsed.
 * @returns {bigint} The parsed amount.
 */
export function parseCurrency(amount: string): BigDecimal {
  return parseUnits(amount, 6)
}

/**
 * Computes the absolute value of a BigInt.
 *
 * @param {bigint} num - The number to be converted to its absolute value.
 * @returns {bigint} The absolute value of the number.
 */
export function absBigInt(num: bigint): bigint {
  return abs({ value: num, decimals: 0 }).value
}

/**
 * Parses a string representing a currency amount into a BigInt, and
 * then returns its absolute value.
 *
 * @param {string} amount - The amount to be parsed and then converted to absolute value.
 * @returns {bigint} The absolute value of the parsed amount.
 */
export function parseCurrencyAbs(amount: string): BigDecimal {
  return abs(parseCurrency(amount))
}
