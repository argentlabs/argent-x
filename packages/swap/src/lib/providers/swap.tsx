import { createContext, useContext } from "react"

import { SupportedNetworks } from "../../sdk"
import { getMulticall } from "../services/multicall"
import { SwapContextInterface, SwapProviderArgs } from "./types"
import { constants, shortString } from "starknet"

const SwapContext = createContext<SwapContextInterface>({
  multicall: undefined,
  selectedAccount: undefined,
  rpcUrl: undefined,
  chainId: undefined,
})

export function SwapProvider({
  multicall,
  selectedAccount,
  rpcUrl,
  chainId,
  children,
}: SwapProviderArgs) {
  const networkId = selectedAccount?.networkId as SupportedNetworks | undefined
  const starknetChainId = chainId
    ? (shortString.encodeShortString(chainId) as constants.StarknetChainId)
    : undefined
  const fallbackMulticall = rpcUrl
    ? getMulticall(rpcUrl, starknetChainId)
    : undefined

  return (
    <SwapContext.Provider
      value={{
        multicall: multicall || fallbackMulticall,
        selectedAccount,
        networkId,
        rpcUrl,
        chainId: starknetChainId,
      }}
    >
      {children}
    </SwapContext.Provider>
  )
}

export const useSwapProvider = () => {
  return useContext(SwapContext)
}
