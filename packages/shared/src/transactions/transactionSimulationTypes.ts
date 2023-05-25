import { Account, Call, SequencerProvider } from "starknet"

import { ApiData } from "../http/apiData"

export interface IUseTransactionSimulation {
  apiData: ApiData
  account?: Account
  transactions: Call | Call[]
  provider: SequencerProvider
  transactionSimulationEnabled?: boolean
}

export interface ApiTransactionSimulationResponse {
  approvals: TransactionSimulationApproval[]
  transfers: TransactionSimulationTransfer[]
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
