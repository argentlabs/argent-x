import { BaseWalletAccount, WalletAccount } from "../wallet.model"

export type AccountMessage =
  | { type: "NEW_ACCOUNT"; data: string }
  | {
      type: "NEW_ACCOUNT_RES"
      data: {
        txHash: string
        address: string
        account: WalletAccount
        accounts: WalletAccount[]
      }
    }
  | { type: "NEW_ACCOUNT_REJ"; data: { error: string } }
  | { type: "GET_ACCOUNTS"; data?: { showHidden: boolean } }
  | { type: "GET_ACCOUNTS_RES"; data: WalletAccount[] }
  | { type: "CONNECT_ACCOUNT"; data: WalletAccount }
  | { type: "CONNECT_ACCOUNT_RES"; data: WalletAccount }
  | { type: "DISCONNECT_ACCOUNT" }
  | { type: "GET_SELECTED_ACCOUNT" }
  | { type: "GET_SELECTED_ACCOUNT_RES"; data: WalletAccount | undefined }
  | { type: "DELETE_ACCOUNT"; data: BaseWalletAccount }
  | { type: "DELETE_ACCOUNT_RES" }
  | { type: "DELETE_ACCOUNT_REJ" }
  | { type: "HIDE_ACCOUNT"; data: BaseWalletAccount }
  | { type: "HIDE_ACCOUNT_RES" }
  | { type: "HIDE_ACCOUNT_REJ" }
  | {
      type: "UPGRADE_ACCOUNT"
      data: BaseWalletAccount
    }
  | { type: "UPGRADE_ACCOUNT_RES" }
  | { type: "UPGRADE_ACCOUNT_REJ" }
  | {
      type: "GET_ENCRYPTED_PRIVATE_KEY"
      data: { encryptedSecret: string }
    }
  | {
      type: "GET_ENCRYPTED_PRIVATE_KEY_RES"
      data: { encryptedPrivateKey: string }
    }
  | {
      type: "GET_ENCRYPTED_SEED_PHRASE"
      data: { encryptedSecret: string }
    }
  | {
      type: "GET_ENCRYPTED_SEED_PHRASE_RES"
      data: { encryptedSeedPhrase: string }
    }
