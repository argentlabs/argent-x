import { constants } from "starknet5"

import { isEqualAddress } from "../../ui/services/addresses"
import { ArgentAccountType } from "../wallet.model"
import { Network } from "./type"

export function mapArgentAccountTypeToImplementationKey(
  type: ArgentAccountType,
): keyof Required<Network>["accountClassHash"] {
  switch (type) {
    case "argent-plugin":
      return "argentPluginAccount"
    case "argent-better-multicall":
      return "argentBetterMulticallAccount"
    case "argent":
    default:
      return "argentAccount"
  }
}

export function mapImplementationToArgentAccountType(
  implementation: string,
  network: Network,
): ArgentAccountType {
  if (
    isEqualAddress(
      implementation,
      network.accountClassHash?.argentPluginAccount,
    )
  ) {
    return "argent-plugin"
  }
  if (
    isEqualAddress(
      implementation,
      network.accountClassHash?.argentBetterMulticallAccount,
    )
  ) {
    return "argent-better-multicall"
  }
  return "argent"
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
