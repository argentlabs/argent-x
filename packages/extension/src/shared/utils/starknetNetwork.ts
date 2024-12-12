import { constants } from "starknet"

import type { Network } from "../network"

/**
 * NOTE: Sepolia - Currently Multisig only distinguishes between 'testnet' and 'mainnet'
 *
 * Sepolia is therefore not added here.
 */

export const networkToStarknetNetwork = (network: Network) => {
  switch (network.chainId) {
    case "SN_MAIN":
      return "mainnet"
    case "SN_SEPOLIA":
      return "sepolia"
    default:
      return "sepolia"
  }
}

export const networkIdToStarknetNetwork = (networkId: string) => {
  switch (networkId) {
    case "mainnet-alpha":
      return "mainnet"
    case "sepolia-alpha":
      return "sepolia"
    default:
      return "sepolia"
  }
}

export const chainIdToStarknetNetwork = (
  chainId: constants.StarknetChainId,
) => {
  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "mainnet"
    case constants.StarknetChainId.SN_SEPOLIA:
      return "sepolia"
    default:
      return "sepolia"
  }
}

export const chainIdToArgentNetwork = (chainId: constants.StarknetChainId) => {
  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "mainnet-alpha"
    case constants.StarknetChainId.SN_SEPOLIA:
      return "sepolia-alpha"
    default:
      throw new Error("No Argent network for chainId: " + chainId)
  }
}

export const starknetNetworkToNetworkId = (network: string) => {
  switch (network) {
    case "mainnet":
      return "mainnet-alpha"
    case "sepolia":
      return "sepolia-alpha"

    default:
      return "sepolia-alpha"
  }
}
