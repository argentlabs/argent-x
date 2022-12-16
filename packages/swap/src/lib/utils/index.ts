import { number, uint256 } from "starknet"

import { CurrencyAmount, ETHER, JSBI, Percent } from "../../sdk"
import { validateAndParseAddress } from "../../sdk/utils"
import { MIN_ETH } from "../constants"
import { tryParseAmount } from "./parseAmount"
import { wrappedCurrency } from "./wrappedCurrency"

export { tryParseAmount, wrappedCurrency }
export * from "./prices"

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(addr: string | null | undefined): string | false {
  try {
    if (addr && !isZero(addr)) {
      return validateAndParseAddress(addr)
    }
    return false
  } catch {
    return false
  }
}

/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
export function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString)
}

export function uint256ToHex(value: uint256.Uint256): string {
  return number.toHex(uint256.uint256ToBN(value))
}

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 * This function can be used in future to ensure that user don't spend all the baseToken
 * for a trade
 * Let's keep it around for that reason
 */

export function maxAmountSpend(
  currencyAmount?: CurrencyAmount,
): CurrencyAmount | undefined {
  if (!currencyAmount) {
    return undefined
  }
  if (currencyAmount.currency === ETHER) {
    if (JSBI.greaterThan(currencyAmount.raw, MIN_ETH)) {
      return CurrencyAmount.ether(JSBI.subtract(currencyAmount.raw, MIN_ETH))
    } else {
      return CurrencyAmount.ether(currencyAmount.raw)
    }
  }
  return currencyAmount
}
