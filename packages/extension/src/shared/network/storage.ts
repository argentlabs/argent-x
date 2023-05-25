import { ArrayStorage } from "../storage"
import { defaultNetworks } from "./defaults"
import { Network } from "./type"

export const equalNetwork = (a: Network, b: Network) => a.id === b.id

export const defaultCustomNetworks = defaultNetworks.filter(
  ({ readonly }) => !readonly,
)

export const defaultReadonlyNetworks = defaultNetworks.filter(
  ({ readonly }) => !!readonly,
)

export const allNetworksStore = new ArrayStorage<Network>(defaultNetworks, {
  namespace: "core:allNetworks",
  compare: equalNetwork,
})
