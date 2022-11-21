import { Network, NetworkStatus } from "../network"
import { WalletAccount } from "../wallet.model"

export type NetworkMessage =
  // ***** networks *****
  | { type: "GET_NETWORKS" }
  | { type: "GET_NETWORKS_RES"; data: Network[] }
  | { type: "GET_NETWORK"; data: Network["id"] }
  | { type: "GET_NETWORK_RES"; data: Network }
  | { type: "GET_CUSTOM_NETWORKS" }
  | { type: "GET_CUSTOM_NETWORKS_RES"; data: Network[] }
  | { type: "ADD_CUSTOM_NETWORKS"; data: Network[] }
  | { type: "ADD_CUSTOM_NETWORKS_RES"; data: Network[] }
  | { type: "REMOVE_CUSTOM_NETWORKS"; data: Network["id"][] }
  | { type: "REMOVE_CUSTOM_NETWORKS_RES"; data: Network[] }
  | { type: "GET_NETWORK_STATUSES"; data?: Network[] } // allows ui to get specific network statuses and defaults to all
  | {
      type: "GET_NETWORK_STATUSES_RES"
      data: Partial<Record<Network["id"], NetworkStatus>>
    }

  // - used by dapps to request addition of custom network
  | { type: "REQUEST_ADD_CUSTOM_NETWORK"; data: Network }
  | { type: "REQUEST_ADD_CUSTOM_NETWORK_RES"; data: { actionHash: string } }
  | {
      type: "REQUEST_ADD_CUSTOM_NETWORK_REJ"
      data: { error: string }
    }
  | { type: "REJECT_REQUEST_ADD_CUSTOM_NETWORK"; data: { actionHash: string } }
  | { type: "APPROVE_REQUEST_ADD_CUSTOM_NETWORK"; data: { actionHash: string } }

  // - used by dapps to request switching of already added custom network
  | {
      type: "REQUEST_SWITCH_CUSTOM_NETWORK"
      data: { chainId: Network["chainId"] }
    }
  | { type: "REQUEST_SWITCH_CUSTOM_NETWORK_RES"; data: { actionHash: string } }
  | {
      type: "REQUEST_SWITCH_CUSTOM_NETWORK_REJ"
      data: { error: string }
    }
  | {
      type: "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK"
      data: { actionHash: string }
    }
  | {
      type: "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK"
      data: { actionHash: string; selectedAccount: WalletAccount }
    }
