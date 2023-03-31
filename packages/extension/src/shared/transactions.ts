import { lowerCase, upperFirst } from "lodash-es"
import { Call, Status, TransactionType, number } from "starknet"

import { WalletAccount } from "./wallet.model"

// Global Constants for Transactions
export const SUCCESS_STATUSES: Status[] = [
  "ACCEPTED_ON_L1",
  "ACCEPTED_ON_L2",
  "PENDING",
]

export const TRANSACTION_STATUSES_TO_TRACK: Status[] = [
  "RECEIVED",
  "NOT_RECEIVED",
]
export type ExtendedTransactionType =
  | TransactionType
  | "MULTISIG_ADD_SIGNERS"
  | "MULTISIG_UPDATE_THRESHOLD"
  | "MULTISIG_REMOVE_SIGNER"

export interface TransactionMeta {
  title?: string
  subTitle?: string
  isUpgrade?: boolean
  isChangeGuardian?: boolean
  isDeployAccount?: boolean
  isCancelEscape?: boolean
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
  status: Status
  failureReason?: { code: string; error_message: string }
  timestamp: number
}

export const compareTransactions = (
  a: TransactionBase,
  b: TransactionBase,
): boolean => a.hash === b.hash && a.account.networkId === a.account.networkId

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
  transactions.filter(
    ({ status, meta }) =>
      TRANSACTION_STATUSES_TO_TRACK.includes(status) ||
      (meta?.isDeployAccount && status === "PENDING"),
  )

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
  const nonHexNames = names.filter((name) => !number.isHex(name))
  const entrypointNames = nonHexNames.map((name) => lowerCase(name))
  const lastName = entrypointNames.pop()
  const title = entrypointNames.length
    ? `${entrypointNames.join(", ")} and ${lastName}`
    : lastName
  return upperFirst(title)
}

export function transformEntrypointName(entryPoint: string) {
  if (entryPoint === "changeThreshold") {
    return "setConfirmations"
  } else if (entryPoint === "addSigners") {
    return "addOwner"
  } else {
    return entryPoint
  }
}
