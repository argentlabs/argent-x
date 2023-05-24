import { constants } from "starknet5"

import { isEqualAddress } from "../../ui/services/addresses"
import { ArgentAccountType } from "../wallet.model"
import { Network } from "./type"

export function mapImplementationToArgentAccountType(
  implementation: string,
  network: Network,
): ArgentAccountType {
  if (isEqualAddress(implementation, network.accountClassHash?.plugin)) {
    return "plugin"
  }

  if (isEqualAddress(implementation, network.accountClassHash?.multisig)) {
    return "multisig"
  }

  if (
    isEqualAddress(implementation, network.accountClassHash?.betterMulticall)
  ) {
    return "betterMulticall"
  }

  return "standard"
}

export function getChainIdFromNetworkId(
  networkId: string,
): constants.StarknetChainId {
  switch (networkId) {
    case "mainnet-alpha":
      return constants.StarknetChainId.SN_MAIN

    case "goerli-alpha":
      return constants.StarknetChainId.SN_GOERLI

    case "goerli-alpha-2":
      return constants.StarknetChainId.SN_GOERLI2

    default:
      throw new Error(`Unknown networkId: ${networkId}`)
  }
}

export function getChainIdFromNetworkId(
  networkId: string,
): constants.StarknetChainId {
  switch (networkId) {
    case "mainnet-alpha":
      return constants.StarknetChainId.SN_MAIN

    case "goerli-alpha":
      return constants.StarknetChainId.SN_GOERLI

    case "goerli-alpha-2":
      return constants.StarknetChainId.SN_GOERLI2

    default:
      throw new Error(`Unknown networkId: ${networkId}`)
  }
}
