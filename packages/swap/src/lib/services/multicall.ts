import { getBatchProvider } from "@argent/x-multicall"
import { memoize } from "lodash-es"

import { SupportedNetworks } from "../../sdk"
import { getProviderForNetworkId } from "./provider"
import type { ProviderInterface } from "starknet"

export class NoMulticallError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = "NoMulticallError"
  }
}

export const getMulticallForNetwork = memoize(
  (networkId: SupportedNetworks): Pick<ProviderInterface, "callContract"> => {
    return getBatchProvider(getProviderForNetworkId(networkId))
  },
  (networkId) => networkId,
)
