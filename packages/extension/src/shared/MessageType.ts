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
  | { type: "GET_TRANSACTION"; data: { hash: string; network: string } }
  | { type: "GET_TRANSACTION_RES"; data: TransactionStatus }
  | {
      type: "SUBMITTED_TX"
      data: {
        txHash: string
        actionHash: string
      }
    }
  | {
      type: "FAILED_TX"
      data: { actionHash: string; error?: string }
    }
  // ***** actions *****
  | { type: "GET_ACTIONS" }
  | {
      type: "GET_ACTIONS_RES"
      data: ExtActionItem[]
    }
  // ***** pre-authorizations *****
  | { type: "CONNECT"; data: { host: string } }
  | { type: "CONNECT_RES"; data: WalletAccount }
  | { type: "ADD_WHITELIST"; data: string }
  | { type: "APPROVE_WHITELIST"; data: { host: string; actionHash: string } }
  | { type: "REJECT_WHITELIST"; data: { host: string; actionHash: string } }
  | { type: "REMOVE_WHITELIST"; data: string }
  | { type: "GET_PENDING_WHITELIST" }
  | { type: "GET_PENDING_WHITELIST_RES"; data: string[] }
  | { type: "IS_WHITELIST"; data: string }
  | { type: "IS_WHITELIST_RES"; data: boolean }
  | { type: "RESET_WHITELIST" }
  // ***** tokens *****
  | { type: "ADD_TOKEN"; data: AddToken }
  | { type: "ADD_TOKEN_RES"; data: { actionHash: string } }
  | { type: "REJECT_ADD_TOKEN"; data: { actionHash: string } }
  | { type: "APPROVE_ADD_TOKEN"; data: { actionHash: string } }
  // ***** sessions *****
  | { type: "STOP_SESSION" }
  | { type: "REPORT_PROGRESS"; data: number }
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
  // ***** actions *****
  | { type: "ADD_SIGN"; data: typedData.TypedData }
  | { type: "ADD_SIGN_RES"; data: { actionHash: string } }
  | { type: "APPROVE_ACTION"; data: { actionHash: string } }
  | { type: "REJECT_ACTION"; data: { actionHash: string } }
  | {
      type: "ACTIONS_QUEUE_UPDATE"
      data: { actions: ExtActionItem[] }
    }
  | {
      type: "APPROVE_SIGN"
      data: { typedData: typedData.TypedData; actionHash: string }
    }
  | { type: "FAILED_SIGN"; data: { actionHash: string } }
  | { type: "SUCCESS_SIGN"; data: { r: string; s: string; actionHash: string } }
  // ***** misc *****
  | { type: "OPEN_UI" }
  | { type: "RESET_ALL" }
  | { type: "REQ_PUB" }
  | { type: "REQ_PUB_RES"; data: JWK }

export type WindowMessageType = MessageType & {
  forwarded?: boolean
  extensionId: string
}
