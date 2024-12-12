import type { IPrettifyNumberConfig } from "@argent/x-shared"
import { prettifyTokenAmount } from "@argent/x-shared"
import type { TokenWithOptionalBigIntBalance } from "./__new/types/tokenBalance.model"

/**
 * Returns a string of token balance with symbol if available e.g.
 */

export const prettifyTokenBalance = (
  token: TokenWithOptionalBigIntBalance,
  withSymbol = true,
  overrides?: Partial<IPrettifyNumberConfig>,
) => {
  const { balance, decimals, symbol } = token
  if (balance === undefined || decimals === undefined) {
    return null
  }
  return prettifyTokenAmount({
    amount: balance,
    decimals,
    symbol: withSymbol ? symbol : "",
    prettyConfigOverrides: overrides,
  })
}
