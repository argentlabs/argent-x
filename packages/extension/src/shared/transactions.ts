import { lowerCase, uniq, upperFirst } from "lodash-es"
import { Call, TransactionType, num, RPC } from "starknet"

import { WalletAccount } from "./wallet.model"
import {
  MultisigEntryPointType,
  MultisigTransactionType,
} from "./multisig/types"
import { getTransactionStatus } from "./transactions/utils"
import { Address } from "@argent/shared"

export type FinaliyStatus = RPC.SPEC.TXN_STATUS
export type ExecutionStatus = RPC.SPEC.TXN_EXECUTION_STATUS

export type ExtendedFinalityStatus =
  | FinaliyStatus
  | "PENDING" // For backward compatibility on mainnet
  | "CANCELLED" // Required for multisig
  | "NOT_RECEIVED" // Required for multisig

// Extends RPC.TransactionStatus from starknet.js
export type ExtendedTransactionStatus = {
  finality_status?: ExtendedFinalityStatus
  execution_status?: ExecutionStatus
}

// Global Constants for Transactions
export const SUCCESS_STATUSES: ExtendedFinalityStatus[] = [
  "ACCEPTED_ON_L2",
  "ACCEPTED_ON_L1",
]

export const FAILED_STATUS: (ExtendedFinalityStatus | ExecutionStatus)[] = [
  "REJECTED",
  "REVERTED",
  "CANCELLED",
]

export const TRANSACTION_STATUSES_TO_TRACK: ExtendedFinalityStatus[] = [
  "RECEIVED",
]

export type StarknetTransactionTypes = keyof typeof TransactionType

export type ExtendedTransactionType =
  | StarknetTransactionTypes
  | MultisigTransactionType
  | "ADD_ARGENT_SHIELD"
  | "REMOVE_ARGENT_SHIELD"

export interface TransactionMeta {
  title?: string
  subTitle?: string
  newClassHash?: Address
  isChangeGuardian?: boolean
  isDeployAccount?: boolean
  isCancelEscape?: boolean
  isMaxSend?: boolean
  transactions?: Call | Call[]
  type?: ExtendedTransactionType
}

export interface TransactionBase {
  hash: string
  account: {
    networkId: string
  }
}

export interface TransactionRequest extends TransactionBase {
  account: WalletAccount
  meta?: TransactionMeta
}

export interface Transaction extends TransactionRequest {
  status: ExtendedTransactionStatus
  failureReason?: { code: string; error_message: string }
  revertReason?: string
  timestamp: number
}

export const compareTransactions = (
  a: TransactionBase,
  b: TransactionBase,
): boolean => a.hash === b.hash && a.account.networkId === b.account.networkId

export function entryPointToHumanReadable(entryPoint: string): string {
  try {
    return upperFirst(lowerCase(entryPoint))
  } catch {
    return entryPoint
  }
}

export const getInFlightTransactions = (
  transactions: Transaction[],
): Transaction[] =>
  transactions.filter((transaction) => {
    const { finality_status } = getTransactionStatus(transaction)
    return (
      finality_status && TRANSACTION_STATUSES_TO_TRACK.includes(finality_status)
    )
  })

export function nameTransaction(calls: Call | Call[]) {
  const callsArray = Array.isArray(calls) ? calls : [calls]
  const entrypointNames = callsArray.map((call) => call.entrypoint)
  return transactionNamesToTitle(entrypointNames)
}

export function transactionNamesToTitle(
  names: string | string[],
): string | undefined {
  if (!Array.isArray(names)) {
    names = [names]
  }
  /** backend returns hex selectors for unknown names - filter them out */
  const nonHexNames = names.filter((name) => !num.isHex(name))

  /** dedupe entrypoints to avoid "Transfer, Transfer bug".  */
  const entrypointNames = uniq(nonHexNames.map((name) => lowerCase(name)))
  const lastName = entrypointNames.pop()
  const title = entrypointNames.length
    ? `${entrypointNames.join(", ")} and ${lastName}`
    : lastName
  return upperFirst(title)
}

export function transformEntrypointName(entryPoint: string) {
  switch (entryPoint) {
    case MultisigEntryPointType.CHANGE_THRESHOLD:
      return "setConfirmations"
    case MultisigEntryPointType.ADD_SIGNERS:
      return "addOwner"
    case MultisigEntryPointType.REMOVE_SIGNERS:
      return "removeOwner"
    case MultisigEntryPointType.REPLACE_SIGNER:
      return "replaceOwner"
    default:
      return entryPoint
  }
}

export const MULTISG_TXN_TYPES: ExtendedTransactionType[] = [
  MultisigTransactionType.MULTISIG_ADD_SIGNERS,
  MultisigTransactionType.MULTISIG_REMOVE_SIGNERS,
  MultisigTransactionType.MULTISIG_CHANGE_THRESHOLD,
  MultisigTransactionType.MULTISIG_REPLACE_SIGNER,
]
