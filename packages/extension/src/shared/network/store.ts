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
  deserialize(value: Network[]): Network[] {
    // overwrite the stored values for the default networks with the default values
    return mergeArrayStableWith(value, defaultReadonlyNetworks, {
      compareFn: networksEqual,
      insertMode: "unshift",
    })
  },
})

export const networkRepo: INetworkRepo = adaptArrayStorage(allNetworksStore)
