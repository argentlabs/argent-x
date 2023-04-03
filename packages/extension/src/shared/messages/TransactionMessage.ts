import type {
  Abi,
  Call,
  InvocationsDetails,
  Sequencer,
  TransactionSimulation,
  UniversalDeployerContractPayload,
  constants,
} from "starknet"

import { Transaction } from "../transactions"
import { DeclareContract } from "../udc/type"
import { BaseWalletAccount } from "../wallet.model"

export interface EstimateFeeResponse {
  amount: string
  suggestedMaxFee: string
  accountDeploymentFee?: string
  maxADFee?: string
}

export interface DeployAccountEstimateFeeResponse
  extends Omit<
    EstimateFeeResponse,
    "suggestedMaxFee" | "accountDeploymentFee" | "theme"
  > {
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
      data: DeployAccountEstimateFeeResponse
    }
  | { type: "ESTIMATE_DECLARE_CONTRACT_FEE"; data: DeclareContract }
  | { type: "ESTIMATE_DECLARE_CONTRACT_FEE_REJ"; data: { error: string } }
  | {
      type: "ESTIMATE_DECLARE_CONTRACT_FEE_RES"
      data: EstimateFeeResponse
    }
  | {
      type: "ESTIMATE_DEPLOY_CONTRACT_FEE"
      data: UniversalDeployerContractPayload
    }
  | { type: "ESTIMATE_DEPLOY_CONTRACT_FEE_REJ"; data: { error: string } }
  | {
      type: "ESTIMATE_DEPLOY_CONTRACT_FEE_RES"
      data: EstimateFeeResponse
    }
  | {
      type: "SIMULATE_TRANSACTION_INVOCATION"
      data: Call | Call[]
    }
  | {
      type: "SIMULATE_TRANSACTION_INVOCATION_RES"
      data: {
        invocation: Sequencer.SimulateTransaction
        chainId: constants.StarknetChainId
      }
    }
  | {
      type: "SIMULATE_TRANSACTION_INVOCATION_REJ"
      data: { error: string }
    }
  | {
      type: "SIMULATE_TRANSACTION_FALLBACK"
      data: Call | Call[]
    }
  | {
      type: "SIMULATE_TRANSACTION_FALLBACK_RES"
      data: TransactionSimulation
    }
  | {
      type: "SIMULATE_TRANSACTION_FALLBACK_REJ"
      data: { error: string }
    }
