import type {
  Abi,
  AllowArray,
  Call,
  InvocationsDetails,
  UniversalDeployerContractPayload,
} from "starknet"

import { Transaction } from "../transactions"
import {
  SimulateTransactionsRequest,
  TransactionSimulationWithFees,
} from "../transactionSimulation/types"
import { DeclareContract } from "../udc/schema"
import { TransactionError } from "../errors/transaction"
import { EstimatedFees } from "../transactionSimulation/fees/fees.model"

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
  | { type: "ESTIMATE_DECLARE_CONTRACT_FEE"; data: DeclareContract }
  | { type: "ESTIMATE_DECLARE_CONTRACT_FEE_REJ"; data: { error: string } }
  | {
      type: "ESTIMATE_DECLARE_CONTRACT_FEE_RES"
      data: EstimatedFees
    }
  | {
      type: "ESTIMATE_DEPLOY_CONTRACT_FEE"
      data: UniversalDeployerContractPayload
    }
  | { type: "ESTIMATE_DEPLOY_CONTRACT_FEE_REJ"; data: { error: string } }
  | {
      type: "ESTIMATE_DEPLOY_CONTRACT_FEE_RES"
      data: EstimatedFees
    }
  | {
      type: "SIMULATE_TRANSACTION_INVOCATION"
      data: Call | Call[]
    }
  | {
      type: "SIMULATE_TRANSACTION_INVOCATION_RES"
      data: {
        transactions: SimulateTransactionsRequest
        chainId: string
      } | null
    }
  | {
      type: "SIMULATE_TRANSACTION_INVOCATION_REJ"
      data: { error: string }
    }
  | {
      type: "SIMULATE_TRANSACTIONS"
      data: AllowArray<Call>
    }
  | {
      type: "SIMULATE_TRANSACTIONS_RES"
      data: TransactionSimulationWithFees | null
    }
  | {
      type: "SIMULATE_TRANSACTIONS_REJ"
      data: { error: TransactionError }
    }
