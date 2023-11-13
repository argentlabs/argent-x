import { constants } from "starknet"
import { NetworkError } from "../../errors/network"

export function getChainIdFromNetworkId(
  networkId: string,
): constants.StarknetChainId {
  switch (networkId) {
    case "mainnet-alpha":
    case constants.NetworkName.SN_MAIN:
      return constants.StarknetChainId.SN_MAIN

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
