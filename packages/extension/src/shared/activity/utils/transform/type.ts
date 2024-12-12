import type { Address } from "@argent/x-shared"
import type { Token } from "../../../token/__new/types/token.model"
import type { TransactionMeta } from "../../../transactions"
import type { ActivityTransactionFailureReason } from "./getTransactionFailureReason"

export type TransformedTransactionAction =
  | "UNKNOWN"
  | "CREATE"
  | "UPGRADE"
  | "MINT"
  | "TRANSFER"
  | "SEND"
  | "RECEIVE"
  | "SWAP"
  | "BUY"
  | "APPROVE"
  | "DECLARE"
  | "DEPLOY"
  | "ADD"
  | "REMOVE"
  | "CHANGE"
  | "REPLACE"
  | "REJECT_ON_CHAIN"

export type TransformedTransactionEntity =
  | "UNKNOWN"
  | "ACCOUNT"
  | "DAPP"
  | "TOKEN"
  | "NFT"
  | "CONTRACT"
  | "GUARDIAN"
  | "SIGNER"
  | "THRESHOLD"

export interface BaseTransformedTransaction {
  action: TransformedTransactionAction
  entity: TransformedTransactionEntity
  date?: string
  displayName?: string
  maxFee?: string
  actualFee?: string
  dappContractAddress?: string
}

export interface TokenTransferTransaction extends BaseTransformedTransaction {
  action: "TRANSFER" | "SEND" | "RECEIVE"
  entity: "TOKEN"
  amount: string
  fromAddress: string
  toAddress: string
  tokenAddress: string
  token: Token
}

export interface TokenApproveTransaction extends BaseTransformedTransaction {
  action: "APPROVE"
  entity: "TOKEN"
  amount: string
  spenderAddress: string
  tokenAddress: string
  token: Token
}

export interface TokenMintTransaction extends BaseTransformedTransaction {
  action: "MINT"
  entity: "TOKEN"
  amount: string
  toAddress: string
  tokenAddress: string
  token: Token
}

export interface NFTTransaction extends BaseTransformedTransaction {
  entity: "NFT"
  contractAddress: string
  tokenId: string
}

export interface NFTTransferTransaction extends NFTTransaction {
  action: "TRANSFER" | "SEND" | "RECEIVE"
  fromAddress: string
  toAddress: string
}

export interface SwapTransaction extends BaseTransformedTransaction {
  action: "SWAP"
  contractAddress: string
  dappContractAddress?: string
  fromTokenAddress: string
  toTokenAddress: string
  fromAmount: string
  toAmount: string
  fromToken: Token
  toToken: Token
}

export interface DeclareContractTransaction extends BaseTransformedTransaction {
  action: "DECLARE"
  entity: "CONTRACT"
  classHash: string
}

export interface DeployContractTransaction extends BaseTransformedTransaction {
  action: "DEPLOY"
  entity: "CONTRACT"
  contractAddress: string
}

export interface ChangeGuardianTransaction extends BaseTransformedTransaction {
  action: "ADD" | "REMOVE"
  entity: "GUARDIAN"
}

export interface ChangeMultisigSignerTransaction
  extends BaseTransformedTransaction {
  action: "ADD" | "REMOVE" | "REPLACE"
  entity: "SIGNER"
}

export interface ChangeMultisigSelfSignerTransaction
  extends ChangeMultisigSignerTransaction {
  newSigner: Address
}
export interface ChangeMultisigThresholdTransaction
  extends BaseTransformedTransaction {
  action: "CHANGE"
  entity: "THRESHOLD"
}
export interface RejectOnChainTransaction extends BaseTransformedTransaction {
  action: "REJECT_ON_CHAIN"
  entity: "TOKEN"
}

export interface UpgradeAccountTransaction extends BaseTransformedTransaction {
  action: "UPGRADE"
  entity: "CONTRACT"
  newClassHash: Address
}

export type TransformedTransaction =
  | BaseTransformedTransaction
  | TokenTransferTransaction
  | TokenApproveTransaction
  | TokenMintTransaction
  | NFTTransaction
  | NFTTransferTransaction
  | SwapTransaction
  | DeclareContractTransaction
  | DeployContractTransaction
  | ChangeGuardianTransaction
  | ChangeMultisigSignerTransaction
  | ChangeMultisigThresholdTransaction
  | RejectOnChainTransaction
  | UpgradeAccountTransaction

export interface ActivityTransaction {
  hash: string
  date: string
  meta?: TransactionMeta
  failureReason?: ActivityTransactionFailureReason
  timestamp?: number
}

export type DailyActivity = Record<string, ActivityTransaction[]>
