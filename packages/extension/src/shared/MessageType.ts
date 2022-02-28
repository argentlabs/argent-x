import type { JWK } from "jose"
import type { InvokeFunctionTransaction, typedData } from "starknet"

import { ExtActionItem } from "./actionQueue"
import { AddToken } from "./token.model"
import { TransactionStatus } from "./transactions.model"
import { WalletAccount } from "./wallet.model"

export type MessageType =
  // ***** accounts *****
  | { type: "NEW_ACCOUNT"; data: string }
  | {
      type: "NEW_ACCOUNT_RES"
      data: {
        status: "ok"
        txHash: string
        address: string
        account: WalletAccount
        accounts: WalletAccount[]
      }
    }
  | { type: "NEW_ACCOUNT_REJ"; data: { status: "ko"; error: string } }
  | { type: "GET_ACCOUNTS" }
  | { type: "GET_ACCOUNTS_RES"; data: WalletAccount[] }
  | { type: "CONNECT_ACCOUNT"; data: WalletAccount }
  | { type: "GET_SELECTED_ACCOUNT" }
  | { type: "GET_SELECTED_ACCOUNT_RES"; data: WalletAccount }
  | { type: "DELETE_ACCOUNT"; data: string }
  | { type: "DELETE_ACCOUNT_RES" }
  | { type: "DELETE_ACCOUNT_REJ" }
  // ***** transactions *****
  | { type: "GET_TRANSACTIONS" }
  | { type: "GET_TRANSACTIONS_RES"; data: TransactionStatus[] }
  | { type: "ADD_TRANSACTION"; data: InvokeFunctionTransaction }
  | { type: "ADD_TRANSACTION_RES"; data: { actionHash: string } }
  | { type: "TRANSACTION_UPDATES"; data: TransactionStatus[] }
  | { type: "TRANSACTION_SUCCESS"; data: TransactionStatus }
  | { type: "TRANSACTION_FAILURE"; data: TransactionStatus }
  | { type: "GET_TRANSACTION"; data: { hash: string; network: string } }
  | { type: "GET_TRANSACTION_RES"; data: TransactionStatus }
  | {
      type: "TRANSACTION_SUBMITTED"
      data: {
        txHash: string
        actionHash: string
      }
    }
  | {
      type: "TRANSACTION_FAILED"
      data: { actionHash: string; error?: string }
    }
  // ***** pre-authorizations *****
  | { type: "CONNECT_DAPP"; data: { host: string } }
  | { type: "CONNECT_DAPP_RES"; data: WalletAccount }
  | { type: "PREAUTHORIZE"; data: string }
  | {
      type: "REJECT_PREAUTHORIZATION"
      data: { host: string; actionHash: string }
    }
  | { type: "REMOVE_PREAUTHORIZATION"; data: string }
  | { type: "IS_PREAUTHORIZED"; data: string }
  | { type: "IS_PREAUTHORIZED_RES"; data: boolean }
  | { type: "RESET_PREAUTHORIZATIONS" }
  // ***** sessions *****
  | { type: "STOP_SESSION" }
  | { type: "HAS_SESSION" }
  | { type: "HAS_SESSION_RES"; data: boolean }
  | { type: "IS_INITIALIZED" }
  | { type: "IS_INITIALIZED_RES"; data: boolean }
  | { type: "START_SESSION"; data: { secure: true; body: string } }
  | { type: "START_SESSION_REJ" }
  | { type: "START_SESSION_RES" }
  // ***** backup *****
  | { type: "RECOVER_BACKUP"; data: string }
  | { type: "RECOVER_BACKUP_RES" }
  | { type: "DOWNLOAD_BACKUP_FILE" }
  | { type: "DOWNLOAD_BACKUP_FILE_RES" }
  // ***** tokens *****
  | { type: "ADD_TOKEN"; data: AddToken }
  | { type: "ADD_TOKEN_RES"; data: { actionHash: string } }
  | { type: "REJECT_ADD_TOKEN"; data: { actionHash: string } }
  | { type: "APPROVE_ADD_TOKEN"; data: { actionHash: string } }
  // ***** actions *****
  | { type: "GET_ACTIONS" }
  | {
      type: "GET_ACTIONS_RES"
      data: ExtActionItem[]
    }
  | { type: "APPROVE_ACTION"; data: { actionHash: string } }
  | { type: "REJECT_ACTION"; data: { actionHash: string } }
  | {
      type: "ACTIONS_QUEUE_UPDATE"
      data: { actions: ExtActionItem[] }
    }
  | { type: "SIGN_MESSAGE"; data: typedData.TypedData }
  | { type: "SIGN_MESSAGE_RES"; data: { actionHash: string } }
  | { type: "SIGNATURE_FAILURE"; data: { actionHash: string } }
  | {
      type: "SIGNATURE_SUCCESS"
      data: { r: string; s: string; actionHash: string }
    }
  // ***** misc *****
  | { type: "OPEN_UI" }
  | { type: "RESET_ALL" }
  | { type: "GET_PUBLIC_KEY" }
  | { type: "GET_PUBLIC_KEY_RES"; data: JWK }

export type WindowMessageType = MessageType & {
  forwarded?: boolean
  extensionId: string
}
