import { SupportedNetworks } from "@argent/x-swap"
import { constants } from "starknet"

import { Network } from "../network"

export const networkToStarknetNetwork = (network: Network) => {
  switch (network.chainId) {
    case "SN_MAIN":
      return "mainnet"
    case "SN_GOERLI":
      return "testnet"
    case "SN_GOERLI2":
      return "testnet2"
    default:
      return "testnet"
  }
}

export const networkIdToStarknetNetwork = (networkId: string) => {
  switch (networkId) {
    case "mainnet-alpha":
      return "mainnet"
    case "goerli-alpha":
      return "testnet"
    case "goerli-alpha-2":
      return "testnet2"
    default:
      return "testnet"
  }
}

export const chainIdToStarknetNetwork = (
  chainId: constants.StarknetChainId,
) => {
  switch (chainId) {
    case constants.StarknetChainId.MAINNET:
      return "mainnet"
    case constants.StarknetChainId.TESTNET:
      return "testnet"
    case constants.StarknetChainId.TESTNET2:
      return "testnet2"
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
    case "testnet2":
      return "goerli-alpha-2"
    default:
      return "goerli-alpha"
  }
}

export const networkNameToChainId = (
  networkName: SupportedNetworks,
): constants.StarknetChainId => {
  switch (networkName) {
    case SupportedNetworks.MAINNET:
      return constants.StarknetChainId.MAINNET
    case SupportedNetworks.TESTNET:
      return constants.StarknetChainId.TESTNET
    case SupportedNetworks.TESTNET2:
      return constants.StarknetChainId.TESTNET2
    default:
      return constants.StarknetChainId.TESTNET
  }
}

export const networkIdToChainId = (networkId: string) => {
  switch (networkId) {
    case "mainnet-alpha":
      return constants.StarknetChainId.MAINNET
    case "goerli-alpha":
      return constants.StarknetChainId.TESTNET
    case "goerli-alpha-2":
      return constants.StarknetChainId.TESTNET2
    default:
      return constants.StarknetChainId.TESTNET
  }
}
