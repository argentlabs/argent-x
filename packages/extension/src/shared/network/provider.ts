import { memoize } from "lodash-es"
import { RpcProvider, constants, shortString } from "starknet"
import { RpcProvider as RpcProviderV4 } from "starknet4"

import { Network } from "./type"

export const getProviderForRpcUrlAndChainId = memoize(
  (rpcUrl: string, chainId: constants.StarknetChainId): RpcProvider => {
    return new RpcProvider({ nodeUrl: rpcUrl, chainId })
  },
  (a: string, b: string) => `${a}::${b}`,
)

/**
 * Returns a provider for the given network
 * @param network
 * @returns
 */
export function getProvider(network: Network): RpcProvider {
  // Initialising RpcProvider with chainId removes the need for initial RPC calls to `starknet_chainId`
  const chainId = shortString.encodeShortString(
    network.chainId,
  ) as constants.StarknetChainId
  return getProviderForRpcUrlAndChainId(network.rpcUrl, chainId)
}

/** ======================================================================== */

export function getProviderv4(network: Network): RpcProviderV4 {
  return new RpcProviderV4({ nodeUrl: network.rpcUrl })
}

/** ======================================================================== */
