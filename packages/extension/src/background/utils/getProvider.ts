import { getProvider as getProviderUtil } from "../../shared/networks"
import { getNetwork } from "../customNetworks"

export const getProvider = async (networkId: string) => {
  const network = await getNetwork(networkId)
  return getProviderUtil(network)
}
