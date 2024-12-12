import memoize from "memoizee"

import type { BaseNetwork, Network } from "./type"

export const networkSelector = memoize(
  (networkId: string) => (network: BaseNetwork) => network.id === networkId,
  { primitive: true },
)

export const networkSelectorByChainId = memoize(
  (chainId: string) => (network: Network) => network.chainId === chainId,
  { primitive: true },
)
