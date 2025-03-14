import type { ArgentNetworkId } from "@argent/x-shared"
import { ARGENT_API_ENABLED } from "../api/constants"

export const SMART_ACCOUNT_NETWORKS = [
  "sepolia-alpha" as ArgentNetworkId,
  "mainnet-alpha" as ArgentNetworkId,
]

export const useSmartAccountEnabled = (networkId?: string): boolean => {
  return isSmartAccountEnabled(networkId)
}

export const isSmartAccountEnabled = (networkId?: string): boolean => {
  return (
    !!ARGENT_API_ENABLED &&
    !!networkId &&
    SMART_ACCOUNT_NETWORKS.includes(networkId as ArgentNetworkId)
  )
}
