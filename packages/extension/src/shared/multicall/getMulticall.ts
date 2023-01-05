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
    const defaultMulticallAddress =
      "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4"
    const multicall = new Multicall(
      getProvider(network),
      network.multicallAddress ?? defaultMulticallAddress,
    )
    return multicall
  },
  ({ baseUrl, multicallAddress }) =>
    [baseUrl, multicallAddress].filter(Boolean).join("-"),
)
