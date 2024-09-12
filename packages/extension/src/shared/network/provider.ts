import { memoize } from "lodash-es"
import { RpcProvider as RpcProvider5 } from "starknet5"
import { RpcProvider as RpcProvider, shortString, constants } from "starknet"
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

export const getProviderForRpcUrl5 = memoize(
  (rpcUrl: string, chainId?: constants.StarknetChainId): RpcProvider5 => {
    return new RpcProvider5({
      nodeUrl: rpcUrl,
      chainId,
      headers: argentXHeaders,
    })
  },
  (a: string, b: string = "") => `${a}::${b}`,
)

export function getProvider(network: Network): RpcProvider {
  const chainId = shortString.encodeShortString(
    network.chainId,
  ) as constants.StarknetChainId
  return getProviderForRpcUrl(network.rpcUrl, chainId)
}

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
