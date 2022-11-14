import { SequencerProvider } from "starknet"
import { SequencerProvider as SequencerProviderv4 } from "starknet4"

import { Network } from "./type"

export function getProvider(network: Network) {
  return new SequencerProvider({ baseUrl: network.baseUrl })
}

export function getProviderv4(network: Network) {
  return new SequencerProviderv4({ baseUrl: network.baseUrl })
}
