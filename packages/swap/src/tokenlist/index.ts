import { useMemo } from "react"

import ArgentTokenList from "../assets/tokens.json"
import { SupportedNetworks } from "../sdk"
import { TokenAddressMap, TokenInfoList, WrappedTokenInfo } from "./types"

const EMPTY_LIST: TokenAddressMap = {
  "mainnet-alpha": {},
  "goerli-alpha": {},
}

export function useTokenList(): TokenInfoList {
  return useMemo(
    () =>
      ArgentTokenList.filter((ti) =>
        Object.values(SupportedNetworks).includes(ti.networkId as any),
      ).map((ti) => {
        return {
          ...ti,
          networkId: ti.networkId as SupportedNetworks,
          decimals: parseInt(ti.decimals),
        }
      }),
    [],
  )
}

export function listToTokenMap(tokens: TokenInfoList): TokenAddressMap {
  const map = tokens.reduce<TokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const token = new WrappedTokenInfo(tokenInfo)
      if (tokenMap[token.networkId][token.address] !== undefined) {
        throw Error("Duplicate tokens.")
      }
      return {
        ...tokenMap,
        [token.networkId]: {
          ...tokenMap[token.networkId],
          [token.address]: token,
        },
      }
    },
    { ...EMPTY_LIST },
  )
  return map
}

export function useArgentTokenList() {
  const argentTokenList = useTokenList()

  return useMemo(() => listToTokenMap(argentTokenList), [argentTokenList])
}

export { WrappedTokenInfo }
