import { Multicall } from "@argent/x-multicall"
import { memoize } from "lodash-es"

import { SupportedNetworks } from "../../sdk"
import { getProviderForNetworkId } from "./provider"

export class NoMulticallError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = "NoMulticallError"
  }
}

export const getMulticallForNetwork = memoize(
  (networkId: SupportedNetworks) => {
    const multicall = new Multicall(getProviderForNetworkId(networkId))
    return multicall
  },
  (networkId) => networkId,
)
