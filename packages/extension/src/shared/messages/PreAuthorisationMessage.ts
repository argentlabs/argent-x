import { IHostAndAccount, IPreAuthorizations } from "../preAuthorizations"
import { WalletAccount } from "../wallet.model"

export type PreAuthorisationMessage =
  | { type: "CONNECT_DAPP"; data: { host: string } }
  | { type: "CONNECT_DAPP_RES"; data: WalletAccount }
  | { type: "PREAUTHORIZE"; data: string }
  | {
      type: "REJECT_PREAUTHORIZATION"
      data: { host: string; actionHash: string }
    }
  | { type: "REMOVE_PREAUTHORIZATION"; data: IHostAndAccount }
  | { type: "REMOVE_PREAUTHORIZATION_RES" }
  | { type: "IS_PREAUTHORIZED"; data: string }
  | { type: "IS_PREAUTHORIZED_RES"; data: boolean }
  | { type: "RESET_PREAUTHORIZATIONS" }
  | { type: "RESET_PREAUTHORIZATIONS_RES" }
  | { type: "GET_PRE_AUTHORIZATIONS" }
  | { type: "GET_PRE_AUTHORIZATIONS_RES"; data: IPreAuthorizations }
