import type { Abi, Call, InvocationsDetails } from "starknet"

import { Transaction } from "../transactions"
import { BaseWalletAccount } from "../wallet.model"

export interface EstimateFeeResponse {
  amount: string
  suggestedMaxFee: string
  accountDeploymentFee?: string
  maxADFee?: string
}

export interface AccountDeploymentEstimateFeeResponse {
  accountDeploymentFee: string
  maxADFee: string
}

export interface ExecuteTransactionRequest {
  transactions: Call | Call[]
  abis?: Abi[]
  transactionsDetail?: InvocationsDetails
}

export type TransactionMessage =
  | {
      type: "EXECUTE_TRANSACTION"
      data: ExecuteTransactionRequest
    }
  | { type: "EXECUTE_TRANSACTION_RES"; data: { actionHash: string } }
  | { type: "TRANSACTION_UPDATES"; data: Transaction[] }
  | {
      type: "TRANSACTION_SUBMITTED"
      data: { txHash: string; actionHash: string }
    }
  | {
      type: "TRANSACTION_FAILED"
      data: { actionHash: string; error?: string }
    }
  | { type: "ESTIMATE_TRANSACTION_FEE"; data: Call | Call[] }
  | { type: "ESTIMATE_TRANSACTION_FEE_REJ"; data: { error: string } }
  | {
      type: "ESTIMATE_TRANSACTION_FEE_RES"
      data: EstimateFeeResponse
    }
  | { type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE"; data?: BaseWalletAccount }
  | { type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_REJ"; data: { error: string } }
  | {
      type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_RES"
      data: AccountDeploymentEstimateFeeResponse
    }
