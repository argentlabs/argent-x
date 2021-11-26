import type { JWK } from "jose"
import type { InvokeFunctionTransaction } from "starknet"

import { ActionItem } from "../background/actionQueue"

export type MessageType = {
  OPEN_UI: undefined
  ADD_TRANSACTION: InvokeFunctionTransaction
  GET_LATEST_ACTION_AND_COUNT: undefined
  GET_LATEST_ACTION_AND_COUNT_RES: { action: ActionItem | null; count: number }
  GET_SELECTED_WALLET_ADDRESS: undefined
  GET_SELECTED_WALLET_ADDRESS_RES: string | undefined
  CONNECT: { host: string }
  CONNECT_RES: string
  SUBMITTED_TX: { tx: InvokeFunctionTransaction; txHash: string }
  FAILED_TX: { tx: InvokeFunctionTransaction }
  ADD_WHITELIST: string
  APPROVE_WHITELIST: string
  REJECT_WHITELIST: string
  REMOVE_WHITELIST: string
  GET_PENDING_WHITELIST: undefined
  GET_PENDING_WHITELIST_RES: string[]
  IS_WHITELIST: string
  IS_WHITELIST_RES: boolean
  RESET_WHITELIST: undefined
  WALLET_CONNECTED: string
  RESET_ALL: undefined
  REQ_PUB: undefined
  REQ_PUB_RES: JWK
  NEW_ACCOUNT: undefined
  STOP_SESSION: undefined
  NEW_ACCOUNT_RES: { txHash: string; address: string; wallets: string[] }
  REPORT_PROGRESS: number
  HAS_SESSION: undefined
  HAS_SESSION_RES: boolean
  IS_INITIALIZED: undefined
  IS_INITIALIZED_RES: boolean
  GET_WALLETS: undefined
  GET_WALLETS_RES: string[]
  START_SESSION: { secure: true; body: string }
  START_SESSION_REJ: undefined
  START_SESSION_RES: undefined
  SIGN: { hash: string }
  SIGN_RES: { r: string; s: string }
}
