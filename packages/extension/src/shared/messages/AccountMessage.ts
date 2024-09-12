import { WalletAccount } from "../wallet.model"

export type AccountMessage =
  | {
      type: "DEPLOY_ACCOUNT_ACTION_SUBMITTED"
      data: { txHash: string; actionHash: string }
    }
  | {
      type: "DEPLOY_ACCOUNT_ACTION_FAILED"
      data: { actionHash: string; error?: string }
    }
  | {
      type: "DEPLOY_MULTISIG_ACTION_FAILED"
      data: { actionHash: string; error?: string }
    }
  | { type: "CONNECT_ACCOUNT_RES"; data?: WalletAccount }
  | { type: "DISCONNECT_ACCOUNT" }
