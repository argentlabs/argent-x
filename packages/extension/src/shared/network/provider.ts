import { SequencerProvider } from "starknet"

import { Network } from "./type"

export function getProvider(network: Network) {
  return new SequencerProvider({ baseUrl: network.baseUrl })
}
