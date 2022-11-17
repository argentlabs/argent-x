import { Multicall } from "@argent/x-multicall"
import { memoize } from "lodash-es"

import { Network, getProvider } from "../network"

export class NoMulticallAddressError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = "NoMulticallAddressError"
  }
}

export const getMulticallForNetwork = memoize(
  (network: Network) => {
    if (!network.multicallAddress) {
      throw new NoMulticallAddressError(
        "Cannot create Multicall for network with no `multicallAddress`",
      )
    }
    const multicall = new Multicall(
      getProvider(network),
      network.multicallAddress,
    )
    return multicall
  },
  ({ baseUrl, multicallAddress }) =>
    [baseUrl, multicallAddress].filter(Boolean).join("-"),
)
