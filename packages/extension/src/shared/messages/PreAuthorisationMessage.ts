import { WalletAccount } from "../wallet.model"

export type PreAuthorisationMessage =
  | { type: "CONNECT_DAPP" }
  | { type: "CONNECT_DAPP_RES"; data: WalletAccount }
  | { type: "IS_PREAUTHORIZED" }
  | { type: "IS_PREAUTHORIZED_RES"; data: boolean }
  | {
      type: "REJECT_PREAUTHORIZATION"
      data: { host: string; actionHash: string }
    }
