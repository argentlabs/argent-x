import {
  isNFTTransferTransaction,
  isTokenTransferTransaction,
} from "./../activity/utils/transform/is"
import { formatAddress, hexSchema } from "@argent/x-shared"
import { constants, num } from "starknet"

import { TransactionError } from "../errors/transaction"
import type { WalletAccount } from "../wallet.model"
import type { BaseTransaction } from "./interface"
import type {
  ExtendedFinalityStatus,
  ExtendedTransactionStatus,
  Transaction,
  ExecutionStatus,
} from "../transactions"
import { SUCCESS_STATUSES } from "../transactions"
import { z } from "zod"
import { isSafeUpgradeTransaction } from "../utils/isSafeUpgradeTransaction"
import type { NativeActivity } from "@argent/x-shared/simulation"
import type { TransformedTransaction } from "../activity/utils/transform/type"

export function getTransactionIdentifier(transaction: BaseTransaction): string {
  return `${transaction.networkId}::${hexSchema.parse(transaction.hash)}`
}

export function identifierToBaseTransaction(
  identifier: string,
): BaseTransaction {
  const [networkId, hashString] = identifier.split("::")
  const hash = hexSchema.parse(hashString)
  return { networkId, hash }
}

export const checkTransactionHash = (
  transactionHash?: num.BigNumberish,
  account?: WalletAccount,
): boolean => {
  try {
    if (!transactionHash) {
      throw new TransactionError({
        code: "NO_TRANSACTION_HASH",
      })
    }
    const bn = num.toBigInt(transactionHash)
    if (bn <= constants.ZERO && account?.type !== "multisig") {
      throw new TransactionError({
        code: "INVALID_TRANSACTION_HASH_RANGE",
      })
    }
    return true
  } catch {
    return false
  }
}

const finalityStatusSchema = z.union([
  z.literal("RECEIVED"),
  z.literal("REJECTED"),
  z.literal("ACCEPTED_ON_L2"),
  z.literal("ACCEPTED_ON_L1"),
  z.literal("PENDING"),
  z.literal("CANCELLED"),
  z.literal("NOT_RECEIVED"),
])
const executionStatusSchema = z.union([
  z.literal("SUCCEEDED"),
  z.literal("REVERTED"),
])
const newTransactionSchema = z
  .object({
    status: z.object({
      finality_status: finalityStatusSchema,
      execution_status: executionStatusSchema.optional(),
    }),
  })
  .passthrough()

const oldTransactionSchema = z
  .object({
    finalityStatus: finalityStatusSchema,
    executionStatus: executionStatusSchema.optional(),
  })
  .passthrough()

export function getTransactionStatus(
  transaction: Transaction | undefined,
): ExtendedTransactionStatus {
  let finality_status: ExtendedFinalityStatus | undefined
  let execution_status: ExecutionStatus | undefined

  const oldTx = oldTransactionSchema.safeParse(transaction)
  if (oldTx.success) {
    finality_status = oldTx.data.finalityStatus
    execution_status = oldTx.data.executionStatus
  } else {
    const newTx = newTransactionSchema.safeParse(transaction)
    if (newTx.success) {
      finality_status = newTx.data.status.finality_status
      execution_status = newTx.data.status.execution_status
    }
  }

  return { finality_status, execution_status }
}

export function getPendingTransactions(
  transactions: Transaction[],
): Transaction[] {
  return transactions.filter((transaction) => {
    const { finality_status } = getTransactionStatus(transaction)
    return finality_status === "RECEIVED"
  })
}

export function getPendingUpgradeTransactions(
  transactions: Transaction[],
): Transaction[] {
  return getPendingTransactions(transactions).filter(isSafeUpgradeTransaction)
}

export const isSuccessfulTransaction = (tx: Transaction) => {
  const { finality_status } = getTransactionStatus(tx)
  return finality_status && SUCCESS_STATUSES.includes(finality_status)
}

export const getNativeActivityStatusForTransaction = (
  tx: Transaction,
): NativeActivity["status"] => {
  const { finality_status, execution_status } = getTransactionStatus(tx)
  if (execution_status) {
    if (execution_status === "REVERTED") {
      return "rejected"
    } else if (execution_status === "SUCCEEDED") {
      return "success"
    } else if (execution_status === "NOT_RECEIVED") {
      return "pending"
    }
  }
  if (finality_status) {
    if (finality_status === "NOT_RECEIVED") {
      return "queued"
    } else if (finality_status === "RECEIVED") {
      return "pending"
    } else if (finality_status === "REJECTED") {
      return "rejected"
    } else if (finality_status === "CANCELLED") {
      return "cancelled"
    } else if (SUCCESS_STATUSES.includes(finality_status)) {
      return "success"
    }
  }
  console.warn("Falling back to pending for tx status", {
    tx,
    finality_status,
    execution_status,
  })
  return "pending"
  // "failure"
}

export const getNativeActivitySubtitleForTransaction = (
  tx?: TransformedTransaction,
): string | undefined => {
  if (!tx) {
    return
  }

  const isTransfer =
    isTokenTransferTransaction(tx) || isNFTTransferTransaction(tx)

  if (isTransfer) {
    return `To: ${formatAddress(tx.toAddress)}`
  }
}

export const DAPP_TRANSACTION_TITLE = "Review transaction"
