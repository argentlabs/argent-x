import BigNumber from "bignumber.js"
import { Account } from "starknet"

import { Token } from "../tokens/token"
import { ApiTransactionSimulationResponse } from "./transactionSimulationTypes"
import {
  TransactionSimulationApproval,
  TransactionSimulationTransfer,
} from "./transactionSimulationTypes"

export type IUseAggregatedSimData = {
  networkId: string
  account: Account
  tokens: Token[]
  transactionSimulation?: ApiTransactionSimulationResponse
}

interface CommonSimulationData {
  token: Token
  amount: BigNumber
  usdValue?: BigNumber
}

export interface ApprovalSimulationData extends CommonSimulationData {
  owner: string
  spender: string
}

export interface Recipient {
  address: string
  amount: BigNumber
  usdValue?: BigNumber
}

export interface TokenWithType extends Token {
  type: "erc20" | "erc721" | "erc1155"
  tokenId?: string
}

export interface AggregatedSimData extends CommonSimulationData {
  token: TokenWithType
  recipients: Recipient[]
  approvals: ApprovalSimulationData[]
  safe?: boolean
}

export interface IUseTransactionSimulatedData {
  transactionSimulation: ApiTransactionSimulationResponse
}

export type ValidatedTokenTransfer = Omit<
  TransactionSimulationTransfer,
  "details"
> & {
  token: TokenWithType
  usdValue: string | undefined
}

export type ValidatedTokenApproval = Omit<
  TransactionSimulationApproval,
  "details"
> & {
  token: TokenWithType
  usdValue: string | undefined
}

export type TokensRecord = Record<string, Token>
