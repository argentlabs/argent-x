import { prettifyTokenAmount } from "@argent/x-shared"
import { TokenWithOptionalBigIntBalance } from "./__new/types/tokenBalance.model"

/**
 * Returns a string of token balance with symbol if available e.g.
 */

export const prettifyTokenBalance = (
  token: TokenWithOptionalBigIntBalance,
  withSymbol = true,
) => {
  const { balance, decimals, symbol } = token
  if (balance === undefined || decimals === undefined) {
    return null
  }
  return prettifyTokenAmount({
    amount: balance,
    decimals,
    symbol: withSymbol ? symbol : "",
  })
}
