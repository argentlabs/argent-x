import type { JWK } from "jose"
import type { Abi, Call, InvocationsDetails, typedData } from "starknet"

import { ExtActionItem } from "./actionQueue"
import { Network } from "./networks"
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
  | { type: "ESTIMATE_TRANSACTION_FEE"; data: Call | Call[] }
  | {
      type: "ESTIMATE_TRANSACTION_FEE_RES"
      data: {
        amount: number
        unit: string
      }
    }
  | { type: "CONNECT_ACCOUNT"; data: WalletAccount }
  | { type: "DISCONNECT_ACCOUNT" }
  | { type: "GET_SELECTED_ACCOUNT" }
  | { type: "GET_SELECTED_ACCOUNT_RES"; data: WalletAccount | undefined }
  | { type: "DELETE_ACCOUNT"; data: string }
  | { type: "DELETE_ACCOUNT_RES" }
  | { type: "DELETE_ACCOUNT_REJ" }
  | {
      type: "UPGRADE_ACCOUNT"
      data: {
        walletAddress: string
      }
    }
  // ***** transactions *****
  | { type: "GET_TRANSACTIONS" }
  | { type: "GET_TRANSACTIONS_RES"; data: TransactionStatus[] }
  | {
      type: "EXECUTE_TRANSACTION"
      data: {
        transactions: Call | Call[]
        abis?: Abi[]
        transactionsDetail?: InvocationsDetails
      }
    }
  | { type: "EXECUTE_TRANSACTION_RES"; data: { actionHash: string } }
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
  | {
      type: "UPDATE_TRANSACTION_FEE"
      data: {
        actionHash: string
        maxFee?: InvocationsDetails["maxFee"]
      }
    }
  | {
      type: "UPDATE_TRANSACTION_FEE_RES"
      data: {
        actionHash: string
      }
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
  | { type: "REMOVE_PREAUTHORIZATION_RES" }
  | { type: "IS_PREAUTHORIZED"; data: string }
  | { type: "IS_PREAUTHORIZED_RES"; data: boolean }
  | { type: "RESET_PREAUTHORIZATIONS" }
  // ***** sessions *****
  | { type: "STOP_SESSION" }
  | { type: "HAS_SESSION" }
  | { type: "HAS_SESSION_RES"; data: boolean }
  | { type: "IS_INITIALIZED" }
  | {
      type: "IS_INITIALIZED_RES"
      data: { initialized: boolean; hasLegacy: boolean }
    }
  | { type: "START_SESSION"; data: { secure: true; body: string } }
  | { type: "START_SESSION_REJ" }
  | { type: "START_SESSION_RES"; data?: WalletAccount }
  // ***** backup *****
  | { type: "RECOVER_BACKUP"; data: string }
  | { type: "RECOVER_BACKUP_RES" }
  | { type: "RECOVER_BACKUP_REJ"; data: string }
  | { type: "RECOVER_SEEDPHRASE"; data: { secure: true; body: string } }
  | { type: "RECOVER_SEEDPHRASE_RES" }
  | { type: "RECOVER_SEEDPHRASE_REJ" }
  | { type: "DOWNLOAD_BACKUP_FILE" }
  | { type: "DOWNLOAD_BACKUP_FILE_RES" }
  | { type: "DOWNLOAD_LEGACY_BACKUP_FILE" }
  | { type: "DOWNLOAD_LEGACY_BACKUP_FILE_RES" }
  // ***** tokens *****
  | { type: "ADD_TOKEN"; data: AddToken }
  | { type: "ADD_TOKEN_RES"; data: { actionHash: string } }
  | { type: "REJECT_ADD_TOKEN"; data: { actionHash: string } }
  | { type: "APPROVE_ADD_TOKEN"; data: { actionHash: string } }
  // ***** custom networks *****
  | { type: "GET_CUSTOM_NETWORKS" }
  | { type: "GET_CUSTOM_NETWORKS_RES"; data: Network[] }
  | { type: "ADD_CUSTOM_NETWORKS"; data: Network[] }
  | { type: "ADD_CUSTOM_NETWORKS_RES"; data: Network[] }
  | { type: "REMOVE_CUSTOM_NETWORKS"; data: Network["id"][] }
  | { type: "REMOVE_CUSTOM_NETWORKS_RES"; data: Network[] }
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
  | {
      type: "GET_ENCRYPTED_SEED_PHRASE"
      data: {
        encryptedSecret: string
      }
    }
  | {
      type: "GET_ENCRYPTED_SEED_PHRASE_RES"
      data: {
        encryptedSeedPhrase: string
      }
    }

export type WindowMessageType = MessageType & {
  forwarded?: boolean
  extensionId: string
}
