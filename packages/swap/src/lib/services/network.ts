import { useMemo } from "react"
import { constants } from "starknet"

import { SupportedChainIds, SupportedNetworks } from "../../sdk/constants"

export function getNetworkIdFromChainId(
  chainId?: SupportedChainIds,
): SupportedNetworks | undefined {
  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return SupportedNetworks.MAINNET

    case constants.StarknetChainId.SN_GOERLI:
      return SupportedNetworks.TESTNET

    // case ChainId.TESTNET2:
    //   return SupportedNetworks.TESTNET2  /// AMM is not deployed on testnet2

    default:
      return undefined
  }
}

export function useNetworkIdFromChainId(
  chainId?: SupportedChainIds,
): SupportedNetworks | undefined {
  return useMemo(
    () => (chainId ? getNetworkIdFromChainId(chainId) : undefined),
    [chainId],
  )
}
