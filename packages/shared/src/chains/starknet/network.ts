import { constants } from "starknet"

import { NetworkError } from "../../errors/network"
import type { ArgentNetworkId } from "../../argent/type"

export function getChainIdFromNetworkId(
  networkId: ArgentNetworkId | constants.NetworkName | string,
): constants.StarknetChainId {
  switch (networkId) {
    case "mainnet-alpha":
    case constants.NetworkName.SN_MAIN:
      return constants.StarknetChainId.SN_MAIN

    case "sepolia-alpha":
    case constants.NetworkName.SN_SEPOLIA:
      return constants.StarknetChainId.SN_SEPOLIA

    case "goerli-alpha":
    case constants.NetworkName.SN_GOERLI:
      return constants.StarknetChainId.SN_GOERLI

    default:
      throw new NetworkError({
        code: "NOT_FOUND",
        message: `Unknown networkId: ${networkId}`,
      })
  }
}
