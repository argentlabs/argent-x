import { useMemo } from "react"

import { useAppState } from "../../app.state"
import { useTokensInNetwork } from "../accountTokens/tokens.state"

export const useFilteredTokens = (query?: string) => {
  const { switcherNetworkId } = useAppState()
  const tokens = useTokensInNetwork(switcherNetworkId)

  const filteredTokens = useMemo(() => {
    if (!query) {
      return tokens
    }

    const queryLowercase = query.toLowerCase()

    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(queryLowercase) ||
        token.address.toLowerCase().includes(queryLowercase) ||
        token.symbol.toLowerCase().includes(queryLowercase),
    )
  }, [query, tokens])

  return {
    tokens,
    filteredTokens,
  }
}
