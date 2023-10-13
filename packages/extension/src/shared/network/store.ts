import { ArrayStorage } from "../storage"
import { mergeArrayStableWith } from "../storage/__new/base"
import type { IRepository } from "../storage/__new/interface"
import { adaptArrayStorage } from "../storage/__new/repository"
import { defaultNetworks, defaultReadonlyNetworks } from "./defaults"
import type { BaseNetwork, Network } from "./type"

export type INetworkRepo = IRepository<Network>

export const networksEqual = (a: BaseNetwork, b: BaseNetwork) => a.id === b.id

/**
 * @deprecated use `networkRepo` instead
 */
export const allNetworksStore = new ArrayStorage<Network>(defaultNetworks, {
  namespace: "core:allNetworks",
  compare: networksEqual,
  serialize(value): Network[] {
    // filter out the readonly networks
    return value.filter(
      (n) => !defaultReadonlyNetworks.some((rn) => rn.id === n.id),
    )
  },
  deserialize(value): Network[] {
    // add the readonly networks
    return mergeArrayStableWith(
      value,
      defaultReadonlyNetworks,
      networksEqual,
      "unshift",
    )
  },
})

export const networkRepo: INetworkRepo = adaptArrayStorage(allNetworksStore)
