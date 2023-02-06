import { Call } from "starknet"

import { Fetcher } from "../api/fetcher"
import { AllowArray } from "../storage/types"

export interface IFetchTransactionSimulation {
  transactions: AllowArray<Call>
  fetcher?: Fetcher
}

export interface TransactionSimulationApproval {
  tokenAddress: string
  owner: string
  spender: string
  value: string
  details: TokenDetails
}

export interface TransactionSimulationTransfer {
  tokenAddress: string
  from: string
  to: string
  value: string
  details: TokenDetails
}

export interface TokenDetails {
  decimals: string
  symbol: string
  name: string
  tokenURI: string | null
  tokenType: "erc20" | "erc721" | "erc1155"
  usdValue: string | null
}

export interface ApiTransactionSimulationResponse {
  approvals: TransactionSimulationApproval[]
  transfers: TransactionSimulationTransfer[]
}

export type EventsToTrack = "Transfer" | "Approval"

export type TransferEvent = Omit<TransactionSimulationTransfer, "details">
export type ApprovalEvent = Omit<TransactionSimulationApproval, "details">
