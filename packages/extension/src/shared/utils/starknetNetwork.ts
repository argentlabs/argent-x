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
