import { Multicall } from "@argent/x-multicall"
import { memoize } from "lodash-es"

import { Network, getProvider } from "../network"

const MAX_BATCH_SIZE = process.env.MULTICALL_MAX_BATCH_SIZE

export class NoMulticallAddressError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = "NoMulticallAddressError"
  }
}

const defaultMulticallAddress =
  "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4"

const getMulticallAddress = (network: Network) => {
  return network.multicallAddress ?? defaultMulticallAddress
}

const maxBatchSize = MAX_BATCH_SIZE ? parseInt(MAX_BATCH_SIZE) : 10

const getMemoizeKey = (network: Network) => {
  // using chainId here because we want to memoize based on the network. RPC network can have same chainId as sequencer network
  const elements = [
    network.chainId,
    getMulticallAddress(network),
    maxBatchSize,
    localStorage.getItem("betaFeatureRpcProvider") === "true",
  ]
  const key = elements.filter(Boolean).join("-")
  return key
}

export const getMulticallForNetwork = memoize(
  (network: Network) => {
    const multicall = new Multicall(
      getProvider(network),
      getMulticallAddress(network),
      {
        batchInterval: 500,
        maxBatchSize,
      },
    )
    return multicall
  },
  (network: Network) => getMemoizeKey(network),
)
