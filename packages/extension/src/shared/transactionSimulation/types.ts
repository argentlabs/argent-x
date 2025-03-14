import type {
  ArraySignatureType,
  Calldata,
  TransactionType,
  constants,
} from "starknet"

import type { Sequencer } from "starknet5"

import type { Fetcher } from "../api/fetcher"

export type WEI = "WEI" | "wei"
export type FRI = "FRI" | "fri"

export interface SimulationError extends Error {
  name: string
  responseJson: { status: string }
  responseText: string
  status: number
  statusText: string
  url: string
}

export interface SimulateDeployAccountRequest {
  type: typeof TransactionType.DEPLOY_ACCOUNT
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

export interface IFetchTransactionSimulationBulk {
  invocations: SimulateTransactionsRequest
  networkId: string
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

export type TransactionSimulationFeesEstimation =
  | {
      gasPrice: number
      gasUsage: number
      overallFee: number
      unit: WEI
      maxFee: number
    }
  | {
      gasPrice: number
      gasUsage: number
      overallFee: number
      unit: FRI
      maxAmount: number
      maxPricePerUnit: number
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

export type EventsToTrack = "Transfer" | "Approval"

export type TransferEvent = Omit<TransactionSimulationTransfer, "details">
export type ApprovalEvent = Omit<TransactionSimulationApproval, "details">
