import { memoize } from "lodash-es"

import { BaseNetwork, Network } from "./type"

export const networkSelector = memoize(
  (networkId: string) => (network: BaseNetwork) => network.id === networkId,
)

export const networkSelectorByChainId = memoize(
  (chainId: string) => (network: Network) => network.chainId === chainId,
)
