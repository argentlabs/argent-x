import type { JWK } from "jose"
import type { InvokeFunctionTransaction } from "starknet"

import { ActionItem } from "../background/actionQueue"
import { BackupWallet } from "./backup.model"

export type MessageType =
  | { type: "OPEN_UI" }
  | { type: "ADD_TRANSACTION"; data: InvokeFunctionTransaction }
  | { type: "GET_LATEST_ACTION_AND_COUNT" }
  | {
      type: "GET_LATEST_ACTION_AND_COUNT_RES"
      data: { action: ActionItem | null; count: number }
    }
  | { type: "GET_SELECTED_WALLET_ADDRESS" }
  | { type: "GET_SELECTED_WALLET_ADDRESS_RES"; data: string | undefined }
  | { type: "CONNECT"; data: { host: string } }
  | { type: "CONNECT_RES"; data: { address: string; network: string } }
  | {
      type: "SUBMITTED_TX"
      data: { tx: InvokeFunctionTransaction; txHash: string }
    }
  | { type: "FAILED_TX"; data: { tx: InvokeFunctionTransaction } }
  | { type: "ADD_WHITELIST"; data: string }
  | { type: "APPROVE_WHITELIST"; data: string }
  | { type: "REJECT_WHITELIST"; data: string }
  | { type: "REMOVE_WHITELIST"; data: string }
  | { type: "GET_PENDING_WHITELIST" }
  | { type: "GET_PENDING_WHITELIST_RES"; data: string[] }
  | { type: "IS_WHITELIST"; data: string }
  | { type: "IS_WHITELIST_RES"; data: boolean }
  | { type: "RESET_WHITELIST" }
  | { type: "WALLET_CONNECTED"; data: BackupWallet }
  | { type: "RESET_ALL" }
  | { type: "REQ_PUB" }
  | { type: "REQ_PUB_RES"; data: JWK }
  | { type: "NEW_ACCOUNT" }
  | { type: "STOP_SESSION" }
  | {
      type: "NEW_ACCOUNT_RES"
      data: { txHash: string; address: string; wallets: BackupWallet[] }
    }
  | { type: "REPORT_PROGRESS"; data: number }
  | { type: "HAS_SESSION" }
  | { type: "HAS_SESSION_RES"; data: boolean }
  | { type: "IS_INITIALIZED" }
  | { type: "IS_INITIALIZED_RES"; data: boolean }
  | { type: "GET_WALLETS" }
  | { type: "GET_WALLETS_RES"; data: BackupWallet[] }
  | { type: "START_SESSION"; data: { secure: true; body: string } }
  | { type: "START_SESSION_REJ" }
  | { type: "START_SESSION_RES" }
  | { type: "RECOVER_KEYSTORE"; data: string }
  | { type: "RECOVER_KEYSTORE_RES" }
  | { type: "SIGN"; data: { hash: string } }
  | { type: "SIGN_RES"; data: { r: string; s: string } }
  | { type: "GET_NETWORK" }
  | { type: "GET_NETWORK_RES"; data: string }
  | { type: "CHANGE_NETWORK"; data: string }

export type WindowMessageType = {
  forwarded?: boolean
  extensionId: string
} & MessageType
