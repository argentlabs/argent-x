import { bigDecimal, BigDecimal } from "@argent/shared"
import { BaseToken } from "../../../../shared/token/__new/types/token.model"
import { BaseTokenAmount } from "../../../../shared/token/__new/types/tokenAmount.model"
import { TokenWithOptionalBigIntBalance } from "../../../../shared/token/__new/types/tokenBalance.model"
import { MIN_ETH } from "./constants"
import {
  SwapQuoteRoute,
  SwapQuoteRouteSchema,
} from "../../../../shared/swap/model/quote.model"
import { ETH } from "../../../../shared/token/__new/constants"
import { equalToken } from "../../../../shared/token/__new/utils"

/**
 * Checks if the given token is equivalent to Ethereum.
 * @param token - The token to check.
 * @returns {boolean} - True if the token represents Ethereum, false otherwise.
 */
export const isETH = (token: BaseToken): boolean =>
  Object.values(ETH).some((t) => equalToken(t, token))

/**
 * Calculates the maximum amount of a token that can be spent.
 * @param tokenBalance - The token balance, including the amount available.
 * @returns {bigint | undefined} - The maximum spendable amount or undefined if not calculable.
 */
export function maxAmountSpendFromTokenBalance(
  tokenBalance?: TokenWithOptionalBigIntBalance,
): bigint | undefined {
  if (!tokenBalance || !tokenBalance.balance) {
    return undefined
  }

  return maxAmountSpend({
    ...tokenBalance,
    amount: tokenBalance.balance,
  })
}

/**
 * Determines the maximum spendable amount of a token, accounting for Ethereum-specific logic.
 * @param tokenAmount - The amount of the token to check.
 * @returns {bigint | undefined} - The maximum spendable amount or undefined if not applicable.
 */
export function maxAmountSpend(
  tokenAmount?: BaseTokenAmount,
): bigint | undefined {
  if (!tokenAmount) {
    return undefined
  }
  if (!isETH(tokenAmount)) {
    return tokenAmount.amount
  }
  if (tokenAmount.amount > MIN_ETH) {
    return tokenAmount.amount - MIN_ETH
  }
  return 0n
}

/**
 * Extracts provider names from a trade route.
 * @param route - The trade route to parse.
 * @returns {string[]} - An array of provider names.
 */
export function getProvidersFromTradeRoute(route: SwapQuoteRoute): string[] {
  // As SwapQuoteRoute is any, let's parse it with zod to ensure we have the right data
  const parsedRoute = SwapQuoteRouteSchema.parse(route)

  const providers: string[] = [
    parsedRoute.name,
    ...parsedRoute.routes.map(getProvidersFromTradeRoute),
  ]

  return providers.flat()
}

/**
 * Converts basis points to a percentage representation.
 * @param bips - The number of basis points.
 * @returns {BigDecimal} - The percentage representation of the basis points.
 */
export function bipsToPercent(bips: number): BigDecimal {
  const numerator: BigDecimal = { value: BigInt(bips), decimals: 2 }
  const denominator: BigDecimal = {
    value: BigInt(10000),
    decimals: 2,
  }
  return bigDecimal.div(numerator, denominator)
}
