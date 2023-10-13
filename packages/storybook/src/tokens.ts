import { Token } from "@argent-x/extension/src/shared/token/type"
import {
  getFeeToken,
  parsedDefaultTokens,
} from "@argent-x/extension/src/shared/token/utils"
import { TokenDetailsWithBalance } from "@argent-x/extension/src/ui/features/accountTokens/tokens.state"

export const tokensByNetwork: Token[] = parsedDefaultTokens.filter(
  ({ networkId }) => networkId === "goerli-alpha",
)

export const feeToken = getFeeToken("goerli-alpha") as Token

export const tokenWithSymbol = (symbol: string): Token => {
  const token = parsedDefaultTokens.find((token) => token.symbol === symbol)
  if (!token) {
    throw `No token found for symbol ${symbol}`
  }
  return token
}

const ethToken = tokenWithSymbol("ETH")

export const tokenWithBalance = (
  balance?: number | string,
  token = ethToken,
): TokenDetailsWithBalance => {
  return {
    ...token,
    balance: balance ? BigInt(balance) : undefined,
  }
}
