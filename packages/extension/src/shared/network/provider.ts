import { memoize } from "lodash-es"
import { RpcProvider, constants } from "starknet"
import { RpcProvider as RpcProvider6, shortString } from "starknet6"
import { RpcProvider as RpcProviderV4 } from "starknet4"

import { Network } from "./type"
import { argentXHeaders } from "../api/headers"

export const getProviderForRpcUrl = memoize(
  (rpcUrl: string, chainId?: constants.StarknetChainId): RpcProvider => {
    return new RpcProvider({
      nodeUrl: rpcUrl,
      chainId,
      headers: argentXHeaders,
    })
  },
  (a: string, b: string = "") => `${a}::${b}`,
)
export const getProviderForRpcUrl6 = memoize(
  (rpcUrl: string, chainId?: constants.StarknetChainId): RpcProvider6 => {
    return new RpcProvider6({
      nodeUrl: rpcUrl,
      chainId,
      headers: argentXHeaders,
    })
  },
  (a: string, b: string = "") => `${a}::${b}`,
)

/**
 * Returns a provider for the given network
 * @param network
 * @returns
 */
export function getProvider(network: Network): RpcProvider {
  const chainId = shortString.encodeShortString(
    network.chainId,
  ) as constants.StarknetChainId
  return getProviderForRpcUrl(network.rpcUrl, chainId)
}

export function getProvider6(network: Network): RpcProvider6 {
  const chainId = shortString.encodeShortString(
    network.chainId,
  ) as constants.StarknetChainId
  return getProviderForRpcUrl6(network.rpcUrl, chainId)
}

/** ======================================================================== */

export function getProviderv4(network: Network): RpcProviderV4 {
  return new RpcProviderV4({
    nodeUrl: network.rpcUrl,
    headers: argentXHeaders,
  })
}

/** ======================================================================== */
