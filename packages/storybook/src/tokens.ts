import { parsedDefaultTokens } from "@argent-x/extension/src/shared/token/__new/utils"
import { getFeeToken } from "@argent-x/extension/src/ui/features/actions/feeEstimation/__fixtures__/feeToken"

export const tokensByNetwork = parsedDefaultTokens.filter(
  ({ networkId }) => networkId === "goerli-alpha",
)

export const feeToken = getFeeToken("goerli-alpha")

export const tokenWithSymbol = (symbol: string) => {
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
) => {
  return {
    ...token,
    balance: balance ? BigInt(balance) : undefined,
  }
}
