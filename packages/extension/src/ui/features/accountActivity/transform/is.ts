import { IExplorerTransaction } from "../../../../shared/explorer/type"
import { Transaction } from "../../../../shared/transactions"
import { ActivityTransaction } from "../useActivity"
import {
  DeclareContractTransaction,
  DeployContractTransaction,
  NFTTransaction,
  NFTTransferTransaction,
  SwapTransaction,
  TokenApproveTransaction,
  TokenMintTransaction,
  TokenTransferTransaction,
  TransformedTransaction,
} from "./type"

export const isTokenTransferTransaction = (
  transaction: TransformedTransaction,
): transaction is TokenTransferTransaction => {
  const { entity, action } = transaction
  return (
    entity === "TOKEN" &&
    (action === "SEND" || action === "RECEIVE" || action === "TRANSFER")
  )
}

export const isTokenApproveTransaction = (
  transaction: TransformedTransaction,
): transaction is TokenApproveTransaction => {
  const { entity, action } = transaction
  return entity === "TOKEN" && action === "APPROVE"
}

export const isTokenMintTransaction = (
  transaction: TransformedTransaction,
): transaction is TokenMintTransaction => {
  const { entity, action } = transaction
  return entity === "TOKEN" && action === "MINT"
}

export const isNFTTransaction = (
  transaction: TransformedTransaction,
): transaction is NFTTransaction => {
  const { entity } = transaction
  return entity === "NFT"
}

export const isNFTTransferTransaction = (
  transaction: TransformedTransaction,
): transaction is NFTTransferTransaction => {
  const { entity, action } = transaction
  return (
    entity === "NFT" &&
    (action === "SEND" || action === "RECEIVE" || action === "TRANSFER")
  )
}

export const isSwapTransaction = (
  transaction: TransformedTransaction,
): transaction is SwapTransaction => {
  const { action } = transaction
  return action === "SWAP"
}

export const isDeclareContractTransaction = (
  transaction: TransformedTransaction,
): transaction is DeclareContractTransaction => {
  const { action, entity } = transaction
  return entity === "CONTRACT" && action === "DECLARE"
}

export const isDeployContractTransaction = (
  transaction: TransformedTransaction,
): transaction is DeployContractTransaction => {
  const { action, entity } = transaction
  return entity === "CONTRACT" && action === "DEPLOY"
}

export const isActivityTransaction = (
  transaction: any,
): transaction is ActivityTransaction => {
  return !!(transaction.hash && transaction.date)
}

export const isVoyagerTransaction = (
  transaction: any,
): transaction is Transaction => {
  return !!(transaction.hash && transaction.timestamp && transaction.account)
}

export const isExplorerTransaction = (
  transaction: any,
): transaction is IExplorerTransaction => {
  return !!(!isVoyagerTransaction(transaction) && transaction.transactionHash)
}
