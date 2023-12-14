import { constants } from "starknet"

import { Network } from "../network"

export const networkToStarknetNetwork = (network: Network) => {
  switch (network.chainId) {
    case "SN_MAIN":
      return "mainnet"
    case "SN_GOERLI":
      return "testnet"
    default:
      return "testnet"
  }
}

export const networkToDiscoveryNetwork = (network: Network) => {
  // Prioritize network.id over network.chainId
  switch (network.id) {
    case "mainnet-alpha":
      return "mainnet"
    case "goerli-alpha":
      return "goerli"
    default:
      return
  }
}

export const networkIdToStarknetNetwork = (networkId: string) => {
  switch (networkId) {
    case "mainnet-alpha":
      return "mainnet"
    case "goerli-alpha":
      return "testnet"
    default:
      return "testnet"
  }
}

export const chainIdToStarknetNetwork = (
  chainId: constants.StarknetChainId,
) => {
  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "mainnet"
    case constants.StarknetChainId.SN_GOERLI:
      return "testnet"
    default:
      return "testnet"
  }
}

export const starknetNetworkToNetworkId = (network: string) => {
  switch (network) {
    case "mainnet":
      return "mainnet-alpha"
    case "testnet":
      return "goerli-alpha"

    default:
      return "goerli-alpha"
  }
}
