import { useMemo } from "react"

import { Currency, ETHER, Token } from "../../sdk"
import { validateAndParseAddress } from "../../sdk/utils"
import { useArgentTokenList } from "../../tokenlist"
import { useSwapProvider } from "../providers"

export function useAllTokens(): { [address: string]: Token } {
  const { selectedAccount, networkId } = useSwapProvider()

  const allTokens = useArgentTokenList()

  return useMemo(() => {
    if (!selectedAccount || !networkId) {
      return {}
    }

    return allTokens[networkId]
  }, [selectedAccount, networkId, allTokens])
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): Token | undefined | null {
  const { selectedAccount } = useSwapProvider()
  const currencyTokens = useAllTokens()

  const tokens = { ...currencyTokens }

  const address = tokenAddress && validateAndParseAddress(tokenAddress)
  const token: Token | undefined = address ? tokens[address] : undefined

  return useMemo(() => {
    if (token) {
      return token
    }
    if (!selectedAccount || !address) {
      return undefined
    }

    return undefined
  }, [address, selectedAccount, token])
}

export function useCurrency(
  currencyId: string | undefined,
): Currency | null | undefined {
  const isETH = currencyId?.toUpperCase() === "ETH"
  // const isTOKEN1 = currencyId === TOKEN1.address
  const token = useToken(isETH ? undefined : currencyId)
  return isETH ? ETHER : token
}
