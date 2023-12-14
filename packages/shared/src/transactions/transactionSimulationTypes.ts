import {
  Account,
  ArraySignatureType,
  Call,
  Calldata,
  DeployAccountContractPayload,
  Sequencer,
  ProviderInterface,
  TransactionType,
} from "starknet"

import { Address } from "../chains"
import { ApiData } from "../http/apiData"

export interface SimulationError extends Error {
  name: string
  responseJson: { status: string }
  responseText: string
  status: number
  statusText: string
  url: string
}

export interface SimulateDeployAccountRequest {
  type: TransactionType.DEPLOY_ACCOUNT
  classHash: string
  calldata: Calldata
  salt: string
  version?: string
  signature?: ArraySignatureType
  nonce: string
}

export type SimulateInvokeRequest = Sequencer.InvokeEstimateFee

export type SimulateTransactionsRequest = (
  | SimulateDeployAccountRequest
  | SimulateInvokeRequest
)[]

export interface IUseTransactionSimulation {
  apiData: ApiData
  account?: Account
  accountDeployPayload?: DeployAccountContractPayload
  transactions: Call | Call[]
  provider: ProviderInterface
  transactionSimulationEnabled?: boolean
}

export type TransactionSimulationFeesEstimation = {
  gasPrice: bigint
  gasUsage: bigint
  overallFee: bigint
  unit: string
}

export type ApiTransactionSimulationResponseUnparsed = {
  simulationResults: ApiTransactionSimulationResponse[]
}

export interface ApiTransactionSimulationResponse {
  approvals: TransactionSimulationApproval[]
  transfers: TransactionSimulationTransfer[]
  feeEstimation?: TransactionSimulationFeesEstimation
}

export interface TransactionSimulationApproval {
  tokenAddress: Address
  owner: string
  spender: string
  value?: string
  tokenId?: string
  details?: TokenDetails
}

export interface TransactionSimulationTransfer {
  tokenAddress: Address
  from: string
  to: string
  value?: string
  tokenId?: string
  details?: TokenDetails
}

export interface TokenDetails {
  decimals: string | null
  symbol: string
  name: string
  tokenURI: string | null
  tokenType: "erc20" | "erc721" | "erc1155"
  usdValue: string | null
}
