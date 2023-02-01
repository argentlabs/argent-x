import {
  ArgentAccountType,
  BaseWalletAccount,
  CreateAccountType,
  WalletAccount,
} from "../wallet.model"

export type AccountMessage =
  | {
      type: "NEW_ACCOUNT"
      data: {
        networkId: string
        type?: CreateAccountType
      }
    }
  | {
      type: "NEW_ACCOUNT_RES"
      data: {
        account: WalletAccount
        accounts: WalletAccount[]
      }
    }
  | { type: "NEW_ACCOUNT_REJ"; data: { error: string } }
  | { type: "DEPLOY_ACCOUNT"; data: BaseWalletAccount }
  | { type: "DEPLOY_ACCOUNT_RES" }
  | { type: "DEPLOY_ACCOUNT_REJ" }
  | {
      type: "DEPLOY_ACCOUNT_ACTION_SUBMITTED"
      data: { txHash: string; actionHash: string }
    }
  | {
      type: "DEPLOY_ACCOUNT_ACTION_FAILED"
      data: { actionHash: string; error?: string }
    }
  | { type: "GET_ACCOUNTS"; data?: { showHidden: boolean } }
  | { type: "GET_ACCOUNTS_RES"; data: WalletAccount[] }
  | { type: "CONNECT_ACCOUNT"; data?: BaseWalletAccount }
  | { type: "CONNECT_ACCOUNT_RES"; data?: WalletAccount }
  | { type: "DISCONNECT_ACCOUNT" }
  | { type: "GET_SELECTED_ACCOUNT" }
  | { type: "GET_SELECTED_ACCOUNT_RES"; data: WalletAccount | undefined }
  | { type: "DELETE_ACCOUNT"; data: BaseWalletAccount }
  | { type: "DELETE_ACCOUNT_RES" }
  | { type: "DELETE_ACCOUNT_REJ" }
  | {
      type: "UPGRADE_ACCOUNT"
      data: {
        wallet: BaseWalletAccount
        targetImplementationType?: ArgentAccountType
      }
    }
  | { type: "UPGRADE_ACCOUNT_RES" }
  | { type: "UPGRADE_ACCOUNT_REJ" }
  | {
      type: "REDEPLOY_ACCOUNT"
      data: BaseWalletAccount
    }
  | {
      type: "REDEPLOY_ACCOUNT_RES"
      data: {
        txHash: string
        address: string
      }
    }
  | { type: "REDEPLOY_ACCOUNT_REJ" }
  | {
      type: "GET_ENCRYPTED_PRIVATE_KEY"
      data: { encryptedSecret: string }
    }
  | {
      type: "GET_ENCRYPTED_PRIVATE_KEY_RES"
      data: { encryptedPrivateKey: string }
    }
  | {
      type: "GET_PUBLIC_KEY"
    }
  | {
      type: "GET_PUBLIC_KEY_RES"
      data: { publicKey: string }
    }
  | {
      type: "GET_ENCRYPTED_SEED_PHRASE"
      data: { encryptedSecret: string }
    }
  | {
      type: "GET_ENCRYPTED_SEED_PHRASE_RES"
      data: { encryptedSeedPhrase: string }
    }
  | {
      type: "ACCOUNT_CHANGE_GUARDIAN"
      data: { account: BaseWalletAccount; guardian: string | undefined }
    }
  | {
      type: "ACCOUNT_CHANGE_GUARDIAN_RES"
    }
  | { type: "ACCOUNT_CHANGE_GUARDIAN_REJ"; data: string }
