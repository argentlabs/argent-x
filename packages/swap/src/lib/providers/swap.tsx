import { createContext, useContext } from "react"

import { SupportedNetworks } from "../../sdk"
import { getMulticallForNetwork } from "../services/multicall"
import { SwapContextInterface, SwapProviderArgs } from "./types"

const SwapContext = createContext<SwapContextInterface>({
  multicall: undefined,
  selectedAccount: undefined,
})

export function SwapProvider({
  multicall,
  selectedAccount,
  children,
}: SwapProviderArgs) {
  console.log("Initializing SwapProvider with", multicall, selectedAccount)

  const networkId = selectedAccount?.networkId as SupportedNetworks | undefined

  const fallbackMulticall =
    networkId && !multicall ? getMulticallForNetwork(networkId) : multicall

  return (
    <SwapContext.Provider
      value={{
        multicall: multicall || fallbackMulticall,
        selectedAccount,
        networkId,
      }}
    >
      {children}
    </SwapContext.Provider>
  )
}

export const useSwapProvider = () => {
  return useContext(SwapContext)
}
