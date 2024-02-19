import { constants } from "starknet"
import {
  isEqualAddress,
  type ArgentNetworkId,
  isArgentNetworkId,
} from "@argent/shared"

import type { ArgentAccountType } from "../wallet.model"
import type { DefaultNetworkId, Network, PublicRpcNode } from "./type"
import { PUBLIC_RPC_NODES } from "./constants"
import { argentApiNetworkForNetwork } from "../api/headers"

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

export function getNetworkIdFromChainId(
  encodedChainId: string,
): ArgentNetworkId {
  switch (encodedChainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "mainnet-alpha"

    case constants.StarknetChainId.SN_GOERLI:
      return "goerli-alpha"

    case constants.StarknetChainId.SN_SEPOLIA:
      return "sepolia-alpha"

    default:
      throw new Error(`Unknown chainId: ${encodedChainId}`)
  }
}

export function getDefaultNetworkId(): DefaultNetworkId {
  const argentXEnv = process.env.ARGENT_X_ENVIRONMENT

  if (!argentXEnv) {
    throw new Error("ARGENT_X_ENVIRONMENT not set")
  }

  switch (argentXEnv.toLowerCase()) {
    case "dev":
    case "integration":
      return "integration"

    case "prod":
    case "staging":
      return "mainnet-alpha"

    case "hydrogen":
    case "test":
      return "goerli-alpha"

    default:
      throw new Error(`Unknown ARGENTX_ENVIRONMENT: ${argentXEnv}`)
  }
}

export function getDefaultNetwork(defaultNetworks: Network[]): Network {
  const defaultNetworkId = getDefaultNetworkId()

  const defaultNetwork = defaultNetworks.find(
    (dn) => dn.id === defaultNetworkId,
  )

  if (!defaultNetwork) {
    throw new Error(`Unknown default network: ${defaultNetworkId}`)
  }

  return defaultNetwork
}

export function isArgentNetwork(network: Network) {
  return isArgentNetworkId(network.id)
}

export function getRandomPublicRPCNode(network: Network) {
  const randomIndex = Math.floor(Math.random() * PUBLIC_RPC_NODES.length)

  const randomNode = PUBLIC_RPC_NODES[randomIndex]

  if (!randomNode) {
    throw new Error(`No random node found for network: ${network.id}`)
  }

  return randomNode
}

export function getPublicRPCNodeUrls(network: Network) {
  if (!isArgentNetwork) {
    throw new Error(`Not an Argent network: ${network.id}`)
  }
  const key = argentApiNetworkForNetwork(network.id)
  if (!key) {
    throw new Error(`No nodes found for network: ${network.id}`)
  }
  const nodeUrls = PUBLIC_RPC_NODES.map((node) => node[key])

  return nodeUrls
}
