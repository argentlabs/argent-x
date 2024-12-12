import memoize from "memoizee"
import { RpcProvider as RpcProvider5 } from "starknet5"
import type { constants } from "starknet"
import { shortString } from "starknet"
import { RpcProvider as RpcProviderV4 } from "starknet4"

import type { Network } from "../shared/network/type"
import { argentXHeaders } from "../shared/api/headers"

export const getProviderForRpcUrl5 = memoize(
  (rpcUrl: string, chainId?: constants.StarknetChainId): RpcProvider5 => {
    return new RpcProvider5({
      nodeUrl: rpcUrl,
      chainId,
      headers: argentXHeaders,
    })
  },
  { normalizer: ([rpcUrl, chainId]) => `${rpcUrl}::${chainId}` },
)

/**
 * Returns a provider for the given network
 * @param network
 * @returns
 */
export function getProvider5(network: Network): RpcProvider5 {
  const chainId = shortString.encodeShortString(
    network.chainId,
  ) as constants.StarknetChainId
  return getProviderForRpcUrl5(network.rpcUrl, chainId)
}

/** ======================================================================== */

export function getProviderv4(network: Network): RpcProviderV4 {
  return new RpcProviderV4({
    nodeUrl: network.rpcUrl,
    headers: argentXHeaders,
  })
}

/** ======================================================================== */
