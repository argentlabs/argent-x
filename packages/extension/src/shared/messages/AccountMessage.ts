import {
  ArgentAccountType,
  BaseWalletAccount,
  WalletAccount,
} from "../wallet.model"

export type AccountMessage =
  | {
      type: "DEPLOY_ACCOUNT_ACTION_SUBMITTED"
      data: { txHash: string; actionHash: string }
    }
  | {
      type: "DEPLOY_ACCOUNT_ACTION_FAILED"
      data: { actionHash: string; error?: string }
    }
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
      data: { encryptedSecret: string; account: BaseWalletAccount }
    }
  | {
      type: "GET_ENCRYPTED_PRIVATE_KEY_RES"
      data: { encryptedPrivateKey: string }
    }
  | {
      type: "GET_PUBLIC_KEY"
      data?: BaseWalletAccount
    }
  | {
      type: "GET_PUBLIC_KEY_RES"
      data: { publicKey: string; account: BaseWalletAccount }
    }
  | {
      type: "GET_NEXT_PUBLIC_KEY"
      data: { networkId: string }
    }
  | {
      type: "GET_NEXT_PUBLIC_KEY_RES"
      data: { publicKey: string }
    }
  | {
      type: "GET_NEXT_PUBLIC_KEY_REJ"
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
      data: { account: BaseWalletAccount; guardian: string }
    }
  | {
      type: "ACCOUNT_CHANGE_GUARDIAN_RES"
    }
  | { type: "ACCOUNT_CHANGE_GUARDIAN_REJ"; data: string }
  | {
      type: "ACCOUNT_CANCEL_ESCAPE"
      data: { account: BaseWalletAccount }
    }
  | {
      type: "ACCOUNT_CANCEL_ESCAPE_RES"
    }
  | { type: "ACCOUNT_CANCEL_ESCAPE_REJ"; data: string }
  | {
      type: "ACCOUNT_TRIGGER_ESCAPE_GUARDIAN"
      data: { account: BaseWalletAccount }
    }
  | {
      type: "ACCOUNT_TRIGGER_ESCAPE_GUARDIAN_RES"
    }
  | { type: "ACCOUNT_TRIGGER_ESCAPE_GUARDIAN_REJ"; data: string }
  | {
      type: "ACCOUNT_ESCAPE_AND_CHANGE_GUARDIAN"
      data: { account: BaseWalletAccount }
    }
  | {
      type: "ACCOUNT_ESCAPE_AND_CHANGE_GUARDIAN_RES"
    }
  | { type: "ACCOUNT_ESCAPE_AND_CHANGE_GUARDIAN_REJ"; data: string }
