import { constants } from "starknet"
import {
  isEqualAddress,
  type ArgentNetworkId,
  isArgentNetworkId,
  getArgentAccountClassHashes,
} from "@argent/x-shared"

import type { ArgentAccountType } from "../wallet.model"
import type { DefaultNetworkId, Network } from "./type"
import { PUBLIC_RPC_NODES } from "./constants"
import { argentApiNetworkForNetwork } from "../api/headers"

// LEGACY ⬇️
export function mapImplementationToArgentAccountType(
  implementation: string,
  network: Network,
  fallbackAccountType?: ArgentAccountType,
): ArgentAccountType {
  if (isEqualAddress(implementation, network.accountClassHash?.plugin)) {
    return "plugin"
  }

  if (
    isEqualAddress(implementation, network.accountClassHash?.betterMulticall)
  ) {
    return "betterMulticall"
  }

  const multisigClassHashes = getArgentAccountClassHashes("multisig")
  if (multisigClassHashes.find((ch) => isEqualAddress(implementation, ch))) {
    return "multisig"
  }

  // the class hash for a smart account is the same as the standard account, so we need to check the account type
  if (fallbackAccountType && fallbackAccountType === "smart") {
    if (isEqualAddress(implementation, network.accountClassHash?.smart)) {
      return "smart"
    }
  }

  return "standard"
}

export function getNetworkIdFromChainId(
  encodedChainId: string,
): ArgentNetworkId {
  switch (encodedChainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "mainnet-alpha"

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
    case "integration":
      return "integration"

    case "prod":
    case "staging":
      return "mainnet-alpha"

    case "hydrogen":
    case "dev":
    case "test":
      return "sepolia-alpha"

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

export function isProdOrStagingEnv() {
  const argentXEnv = process.env.ARGENT_X_ENVIRONMENT

  if (!argentXEnv) {
    throw new Error("ARGENT_X_ENVIRONMENT not set")
  }

  return (
    argentXEnv.toLowerCase() === "prod" ||
    argentXEnv.toLowerCase() === "staging"
  )
}
