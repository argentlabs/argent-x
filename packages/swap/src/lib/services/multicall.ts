import { getBatchProvider } from "@argent/x-multicall"
import { memoize } from "lodash-es"

import type { ProviderInterface, constants } from "starknet"
import { getRpcProvider } from "./provider"

export class NoMulticallError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = "NoMulticallError"
  }
}

export const getMulticall = memoize(
  (
    rpcUrl: string,
    chainId?: constants.StarknetChainId,
  ): Pick<ProviderInterface, "callContract"> => {
    return getBatchProvider(getRpcProvider(rpcUrl, chainId))
  },
  (networkId) => networkId,
)
