import { ArrayStorage } from "../storage"
import { Network } from "./type"

export const equalNetwork = (a: Network, b: Network) => a.id === b.id

export const customNetworksStore = new ArrayStorage<Network>([], {
  namespace: "core:customNetworks",
  compare: equalNetwork,
})
