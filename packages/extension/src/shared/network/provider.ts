import { Provider } from "starknet"

import { Network } from "./type"

export function getProvider(network: Network) {
  return new Provider({ baseUrl: network.baseUrl })
}
