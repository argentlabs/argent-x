import {
  ArraySignatureType,
  Calldata,
  Sequencer,
  TransactionType,
  constants,
} from "starknet"

import { Fetcher } from "../api/fetcher"
import { EstimatedFees } from "./fees/fees.model"

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

export interface IFetchTransactionSimulation {
  invocation: SimulateInvokeRequest
  chainId: constants.StarknetChainId
  fetcher?: Fetcher
}

export interface IFetchTransactionSimulationBulk {
  invocations: SimulateTransactionsRequest
  chainId: constants.StarknetChainId
  fetcher?: Fetcher
}

export interface TransactionSimulationApproval {
  tokenAddress: string
  owner: string
  spender: string
  value?: string
  tokenId?: string
  details?: TokenDetails
}

export interface TransactionSimulationTransfer {
  tokenAddress: string
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

export type TransactionSimulationFeesEstimation = {
  gasPrice: number
  gasUsage: number
  overallFee: number
  unit: string
  maxFee: number
}

export type ApiTransactionSimulationResponse = {
  approvals: TransactionSimulationApproval[]
  transfers: TransactionSimulationTransfer[]
  feeEstimation: TransactionSimulationFeesEstimation
}

export type ApiTransactionBulkSimulationResponse =
  ApiTransactionSimulationResponse[]

export type ApiTransactionSimulationResponseUnparsed = {
  simulationResults: ApiTransactionBulkSimulationResponse
}

export interface TransactionSimulationWithFees {
  simulation: ApiTransactionBulkSimulationResponse
  feeEstimation: EstimatedFees
}

export type EventsToTrack = "Transfer" | "Approval"

export type TransferEvent = Omit<TransactionSimulationTransfer, "details">
export type ApprovalEvent = Omit<TransactionSimulationApproval, "details">
