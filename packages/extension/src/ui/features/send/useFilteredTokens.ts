import { useMemo } from "react"

import { useTokensInCurrentNetwork } from "../accountTokens/tokens.state"

export const useFilteredTokens = (query?: string) => {
  const tokens = useTokensInCurrentNetwork()

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
