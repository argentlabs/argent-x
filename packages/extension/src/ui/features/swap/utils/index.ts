import type { BigDecimal } from "@argent/x-shared"
import { bigDecimal } from "@argent/x-shared"
import type {
  BaseToken,
  Token,
} from "../../../../shared/token/__new/types/token.model"
import type { BaseTokenAmount } from "../../../../shared/token/__new/types/tokenAmount.model"
import type { TokenWithOptionalBigIntBalance } from "../../../../shared/token/__new/types/tokenBalance.model"
import type { SwapQuoteRoute } from "../../../../shared/swap/model/quote.model"
import { SwapQuoteRouteSchema } from "../../../../shared/swap/model/quote.model"
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
  return tokenAmount?.amount
}

type ProviderInfo = {
  name: string
  dappId?: string
}

/**
 * Extracts provider names and dappIds from a trade route, keeping existing entries for duplicates.
 * @param route - The trade route to parse.
 * @returns {ProviderInfo[]} - An array of provider information.
 */
export function getProvidersFromTradeRoute(
  route?: SwapQuoteRoute,
): ProviderInfo[] {
  if (!route) {
    return []
  }

  const parsedRoute = SwapQuoteRouteSchema.parse(route)

  const providers = new Map<string, ProviderInfo>()

  const addProvider = (info: ProviderInfo) => {
    const existing = providers.get(info.name)
    // Keep the entry with dappId if it exists
    if (!existing || (!existing.dappId && info.dappId)) {
      providers.set(info.name, info)
    }
  }

  addProvider({ name: parsedRoute.name, dappId: parsedRoute.dappId })
  parsedRoute.routes.map(getProvidersFromTradeRoute).flat().forEach(addProvider)

  return Array.from(providers.values())
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

export const predefinedSortOrder = [
  "ETH",
  "STRK",
  "USDC",
  "USDT",
  "DAI",
  "DAIv0",
  "LUSD",
  "vSTRK",
  "UNI",
  "EKUBO",
  "LORDS",
  "ZEND",
]

export function sortSwapTokens(tokens: Token[]) {
  return tokens.sort((a, b) => {
    const indexA = predefinedSortOrder.indexOf(a.symbol)
    const indexB = predefinedSortOrder.indexOf(b.symbol)

    if (indexA !== -1 && indexB !== -1) {
      // Both tokens are in the predefined order
      return indexA - indexB
    } else if (indexA !== -1) {
      // Only token A is in the predefined order
      return -1
    } else if (indexB !== -1) {
      // Only token B is in the predefined order
      return 1
    } else {
      // Neither token is in the predefined order, sort alphabetically
      return a.symbol.localeCompare(b.symbol)
    }
  })
}
