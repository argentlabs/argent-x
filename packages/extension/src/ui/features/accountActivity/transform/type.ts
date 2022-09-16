import { KnownDapp } from "../../../../shared/knownDapps"
import { Token } from "../../../../shared/token/type"

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

export type TransformedTransactionEntity =
  | "UNKNOWN"
  | "ACCOUNT"
  | "DAPP"
  | "TOKEN"
  | "NFT"

export interface BaseTransformedTransaction {
  action: TransformedTransactionAction
  entity: TransformedTransactionEntity
  date?: string
  displayName?: string
  maxFee?: string
  actualFee?: string
  dappContractAddress?: string
  dapp?: Omit<KnownDapp, "contracts">
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
  dapp: Omit<KnownDapp, "contracts">
  fromTokenAddress: string
  toTokenAddress: string
  fromAmount: string
  toAmount: string
  fromToken: Token
  toToken: Token
}

export type TransformedTransaction =
  | BaseTransformedTransaction
  | TokenTransferTransaction
  | TokenMintTransaction
  | NFTTransaction
  | NFTTransferTransaction
  | SwapTransaction
