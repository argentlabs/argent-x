import { mergeArrayStableWith } from "../storage/array"
import { SelectorFn } from "../storage/types"
import { defaultNetworks } from "./defaults"
import { networkSchema } from "./schema"
import { networkSelector, networkSelectorByChainId } from "./selectors"
import {
  allNetworksStore,
  defaultReadonlyNetworks,
  equalNetwork,
} from "./storage"
import { Network } from "./type"

export function extendByDefaultReadonlyNetworks(customNetworks: Network[]) {
  return mergeArrayStableWith(
    defaultReadonlyNetworks,
    customNetworks,
    equalNetwork,
  )
}

export async function getNetworks(
  selector?: SelectorFn<Network>,
): Promise<Network[]> {
  const storedNetworks = await allNetworksStore.get()
  const allNetworks = extendByDefaultReadonlyNetworks(storedNetworks)
  if (selector) {
    return allNetworks.filter(selector)
  }
  return allNetworks
}

export async function getNetwork(networkId: string) {
  const [network] = await getNetworks(networkSelector(networkId))
  return network
}

export async function getNetworkByChainId(chainId: string) {
  const [network] = await getNetworks(networkSelectorByChainId(chainId))
  return network
}

export const addNetwork = async (network: Network) => {
  networkSchema.parse(network)
  await allNetworksStore.push(network)
}

export const removeNetwork = async (networkId: string) => {
  return allNetworksStore.remove(networkSelector(networkId))
}

export const restoreDefaultCustomNetworks = async () => {
  await allNetworksStore.remove((network) => !!network.id)
  await allNetworksStore.push(defaultNetworks)
}

export type { Network, NetworkStatus } from "./type"
export { networkSchema } from "./schema"
export { getProvider } from "./provider"
export { defaultNetworks, defaultNetwork } from "./defaults"
