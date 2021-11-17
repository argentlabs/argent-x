import type { JWK } from "jose"
import type { InvokeFunctionTransaction } from "starknet"

export type MessageType = {
  OPEN_UI: undefined
  ADD_TRANSACTION: InvokeFunctionTransaction
  READ_REQUESTED_TRANSACTIONS: undefined
  READ_REQUESTED_TRANSACTIONS_RES: InvokeFunctionTransaction[]
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
  START_SESSION: { enc: true; body: string }
}
