import { mergeArrayStableWith } from "../storage/array"
import { SelectorFn } from "../storage/types"
import { assertSchema } from "../utils/schema"
import { defaultNetworks } from "./defaults"
import { networkSchema } from "./schema"
import { networkSelector, networkSelectorByChainId } from "./selectors"
import { customNetworksStore, equalNetwork } from "./storage"
import { Network } from "./type"

export function extendByDefaultNetworks(customNetworks: Network[]) {
  return mergeArrayStableWith(defaultNetworks, customNetworks, equalNetwork)
}

export async function getNetworks(
  selector?: SelectorFn<Network>,
): Promise<Network[]> {
  const customNetworks = await customNetworksStore.get()
  const allNetworks = extendByDefaultNetworks(customNetworks)
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
  await assertSchema(networkSchema, network)
  return customNetworksStore.add(network)
}

export const removeNetwork = async (networkId: string) => {
  return customNetworksStore.remove(networkSelector(networkId))
}

export type { Network, NetworkStatus } from "./type"
export { customNetworksStore } from "./storage"
export { networkSchema } from "./schema"
export { getProvider } from "./provider"
export { isPublicNetwork } from "./public"
export { defaultNetworks, defaultNetwork } from "./defaults"
