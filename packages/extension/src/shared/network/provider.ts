import { memoize } from "lodash-es"
import { ProviderInterface, RpcProvider, SequencerProvider } from "starknet"
import {
  SequencerProvider as SequencerProviderV4,
  RpcProvider as RpcProviderV4,
} from "starknet4"
import { SequencerProvider as SequencerProviderv4__deprecated } from "starknet4-deprecated"

import { Network } from "./type"

/**
 * Returns a sequencer provider for the given base URL.
 */
const getProviderForBaseUrl = memoize((baseUrl: string): SequencerProvider => {
  return new SequencerProvider({ baseUrl })
})

/**
 * Returns a RPC provider for the given RPC URL.
 *
 */
export function getProviderForRpcUrl(rpcUrl: string): RpcProvider {
  return new RpcProvider({ nodeUrl: rpcUrl })
}

/**
 * Returns a provider for the given network
 * @param network
 * @returns
 */
export function getProvider(network: Network): ProviderInterface {
  if (network.rpcUrl && allowRpcProvider(network)) {
    return getProviderForRpcUrl(network.rpcUrl)
  } else if (network.sequencerUrl) {
    return getProviderForBaseUrl(network.sequencerUrl)
  } else if (
    "baseUrl" in network &&
    network.baseUrl &&
    typeof network.baseUrl === "string"
  ) {
    return getProviderForBaseUrl(network.baseUrl)
  } else {
    throw new Error("No v5 provider available")
  }
}

const allowRpcProvider = (network: Network) =>
  localStorage.getItem("betaFeatureRpcProvider") === "true" || !network.readonly

/** ======================================================================== */

const getProviderV4ForBaseUrl = memoize((baseUrl: string) => {
  return new SequencerProviderV4({ baseUrl })
})

export function getProviderV4ForRpcUrl(rpcUrl: string): RpcProviderV4 {
  return new RpcProviderV4({ nodeUrl: rpcUrl })
}

export function getProviderv4(network: Network) {
  if (network.rpcUrl) {
    return getProviderV4ForRpcUrl(network.rpcUrl)
  } else if (network.sequencerUrl) {
    return getProviderV4ForBaseUrl(network.sequencerUrl)
  } else {
    throw new Error("No v4 provider available")
  }
}

export function getProviderV4ForBaseUrl__deprecated(baseUrl: string) {
  return new SequencerProviderv4__deprecated({ baseUrl })
}

export function getProviderv4__deprecated(network: Network) {
  // Don't use RPC provider here as it's broken for v4
  if (network.sequencerUrl) {
    return getProviderV4ForBaseUrl__deprecated(network.sequencerUrl)
  } else {
    throw new Error("RPC is not supported for v4 deprecated provider")
  }
}

/** ======================================================================== */
