/**
 * Formats a BigInt value to a string with a given number of decimal places.
 *
 * @param {bigint} value - The BigInt value to be formatted.
 * @param {number} decimals - The number of decimal places to format the value to.
 * @returns {string} The formatted string.
 */
export function formatUnits(value: bigint, decimals: number): string {
  if (decimals === 0) {
    return value.toString()
  }

  const negative = value < 0n
  value = negative ? -value : value // if the value is negative, negate it

  const scaled = value.toString().padStart(decimals, "0")
  const integer = scaled.slice(0, -decimals) || "0"
  const fraction = scaled.slice(-decimals).replace(/0+$/, "")

  return `${negative ? "-" : ""}${integer}${fraction ? `.${fraction}` : ""}`
}
