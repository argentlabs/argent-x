import { memoize } from "lodash-es"
import { SequencerProvider } from "starknet"
import { SequencerProvider as SequencerProviderv4 } from "starknet4"
import { SequencerProvider as SequencerProviderv5 } from "starknet5"

import { Network } from "./type"

const getProviderForBaseUrl = memoize((baseUrl: string) => {
  return new SequencerProvider({ baseUrl })
})

export function getProvider(network: Network) {
  return getProviderForBaseUrl(network.baseUrl)
}

const getProviderV4ForBaseUrl = memoize((baseUrl: string) => {
  return new SequencerProviderv4({ baseUrl })
})

export function getProviderv4(network: Network) {
  return getProviderV4ForBaseUrl(network.baseUrl)
}

const getProviderV5ForBaseUrl = memoize((baseUrl: string) => {
  return new SequencerProviderv5({ baseUrl })
})

export function getProviderv5(network: Network) {
  return getProviderV5ForBaseUrl(network.baseUrl)
}
