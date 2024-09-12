import { Network } from "../network"
import { WalletAccount } from "../wallet.model"

export type NetworkMessage =
  | { type: "REQUEST_SELECTED_NETWORK" }
  | { type: "REQUEST_SELECTED_NETWORK_RES"; data: { network: Network } }
  | { type: "REQUEST_SELECTED_NETWORK_REJ"; data: { error: string } }
  // - used by dapps to request addition of custom network
  | { type: "REQUEST_ADD_CUSTOM_NETWORK"; data: Partial<Network> }
  | {
      type: "REQUEST_ADD_CUSTOM_NETWORK_RES"
      data: { exists: boolean; actionHash?: string }
    }
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
  | {
      type: "REQUEST_SWITCH_CUSTOM_NETWORK_RES"
      data: { exists: boolean; actionHash?: string; isCurrentNetwork: boolean }
    }
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
