import type { BigNumberish } from "starknet"
import { bigDecimal } from "@argent/x-shared"

export function formatTokenBalance(
  length: number,
  balance: BigNumberish = 0n,
  decimals = 18,
) {
  const balanceBn = BigInt(balance)

  let balanceFullString

  if (balanceBn === 0n) {
    balanceFullString = `0.${"0".repeat(length)}`
  } else {
    balanceFullString = bigDecimal.formatUnits({ value: balanceBn, decimals })
  }

  // show max ${length} characters or what's needed to show everything before the decimal point
  const balanceString = balanceFullString.slice(
    0,
    Math.max(length, balanceFullString.indexOf(".")),
  )

  // make sure separator is not the last character, if so remove it
  // remove unnecessary 0s from the end, except for ".0"
  let cleanedBalanceString = balanceString.replace(/\.$/, "").replace(/0+$/, "")
  if (cleanedBalanceString.endsWith(".")) {
    cleanedBalanceString += "0"
  }

  return cleanedBalanceString
}
