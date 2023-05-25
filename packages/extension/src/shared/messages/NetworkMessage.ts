import { Network } from "../network"
import { WalletAccount } from "../wallet.model"

export type NetworkMessage =
  // - used by dapps to request addition of custom network
  // | { type: "REQUEST_ADD_CUSTOM_NETWORK"; data: Network }
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
