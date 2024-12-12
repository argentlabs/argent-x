import memoize from "memoizee"
import type { constants } from "starknet"
import { RpcProvider as RpcProvider, shortString } from "starknet"

import type { Network } from "./type"
import { argentXHeaders } from "../api/headers"

export const getProviderForRpcUrl = memoize(
  (rpcUrl: string, chainId?: constants.StarknetChainId): RpcProvider => {
    return new RpcProvider({
      nodeUrl: rpcUrl,
      chainId,
      headers: argentXHeaders,
    })
  },
  { normalizer: ([a, b = ""]) => `${a}::${b}` },
)

export function getProvider(network: Network): RpcProvider {
  const chainId = shortString.encodeShortString(
    network.chainId,
  ) as constants.StarknetChainId
  return getProviderForRpcUrl(network.rpcUrl, chainId)
}
