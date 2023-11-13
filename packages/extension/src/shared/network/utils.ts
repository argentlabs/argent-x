import { constants } from "starknet"

import { isEqualAddress } from "../../ui/services/addresses"
import { ArgentAccountType } from "../wallet.model"
import { DefaultNetworkId, Network } from "./type"
import { PUBLIC_RPC_NODES } from "./constants"

// LEGACY ⬇️
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

    default:
      throw new Error(`Unknown networkId: ${networkId}`)
  }
}

export function getNetworkIdFromChainId(
  encodedChainId: string,
): "mainnet-alpha" | "goerli-alpha" {
  switch (encodedChainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "mainnet-alpha"

    case constants.StarknetChainId.SN_GOERLI:
      return "goerli-alpha"

    default:
      throw new Error(`Unknown chainId: ${encodedChainId}`)
  }
}

export function getDefaultNetwork(defaultNetworks: Network[]): Network {
  const argentXEnv = process.env.ARGENT_X_ENVIRONMENT
  let defaultNetworkId: DefaultNetworkId

  if (!argentXEnv) {
    throw new Error("ARGENT_X_ENVIRONMENT not set")
  }

  switch (argentXEnv.toLowerCase()) {
    case "prod":
    case "staging":
      defaultNetworkId = "mainnet-alpha"
      break

    case "hydrogen":
    case "test":
      defaultNetworkId = "goerli-alpha"
      break

    default:
      throw new Error(`Unknown ARGENTX_ENVIRONMENT: ${argentXEnv}`)
  }

  const defaultNetwork = defaultNetworks.find(
    (dn) => dn.id === defaultNetworkId,
  )

  if (!defaultNetwork) {
    throw new Error(`Unknown default network: ${defaultNetworkId}`)
  }

  return defaultNetwork
}

export const getNetworkUrl = (network: Network) => {
  if (network.rpcUrl) {
    return network.rpcUrl
  } else if (network.sequencerUrl) {
    return network.sequencerUrl
  } else if (
    "baseUrl" in network &&
    network.baseUrl &&
    typeof network.baseUrl === "string"
  ) {
    return network.baseUrl
  } else {
    throw new Error("No network URL found")
  }
}

export function isArgentNetwork(network: Network) {
  return network.id === "mainnet-alpha" || network.id === "goerli-alpha"
}

export function getRandomPublicRPCNode(network: Network) {
  const randomIndex = Math.floor(Math.random() * PUBLIC_RPC_NODES.length)

  const randomNode = PUBLIC_RPC_NODES[randomIndex]

  if (!randomNode) {
    throw new Error(`No random node found for network: ${network.id}`)
  }

  return randomNode
}
