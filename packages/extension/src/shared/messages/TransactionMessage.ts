import type { Abi, Call, InvocationsDetails } from "starknet"

import { Transaction } from "../transactions"

export interface EstimateFeeResponse {
  amount: string
  unit: string
  suggestedMaxFee: string
}

export interface ExecuteTransactionRequest {
  transactions: Call | Call[]
  abis?: Abi[]
  transactionsDetail?: InvocationsDetails
}

export type TransactionMessage =
  | { type: "GET_TRANSACTIONS" }
  | { type: "GET_TRANSACTIONS_RES"; data: Transaction[] }
  | {
      type: "EXECUTE_TRANSACTION"
      data: ExecuteTransactionRequest
    }
  | { type: "EXECUTE_TRANSACTION_RES"; data: { actionHash: string } }
  | { type: "TRANSACTION_UPDATES"; data: Transaction[] }
  | { type: "TRANSACTION_SUCCESS"; data: Transaction }
  | { type: "TRANSACTION_FAILURE"; data: Transaction }
  | { type: "GET_TRANSACTION"; data: { hash: string; network: string } }
  | { type: "GET_TRANSACTION_RES"; data: Transaction }
  | { type: "GET_TRANSACTION_REJ" }
  | {
      type: "TRANSACTION_SUBMITTED"
      data: { txHash: string; actionHash: string }
    }
  | {
      type: "TRANSACTION_FAILED"
      data: { actionHash: string; error?: string }
    }
  | { type: "ESTIMATE_TRANSACTION_FEE"; data: Call | Call[] }
  | { type: "ESTIMATE_TRANSACTION_FEE_REJ" }
  | {
      type: "ESTIMATE_TRANSACTION_FEE_RES"
      data: EstimateFeeResponse
    }
  | {
      type: "UPDATE_TRANSACTION_FEE"
      data: { actionHash: string; maxFee?: InvocationsDetails["maxFee"] }
    }
  | {
      type: "UPDATE_TRANSACTION_FEE_RES"
      data: { actionHash: string }
    }
