import { useMemo, useRef } from "react"
import { Call, constants, number } from "starknet"

import { Transaction } from "../../../shared/transactions"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { useAccount } from "../accounts/accounts.state"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useTransactionStatus } from "../accountTokens/useTransactionStatus"

export enum ChangeGuardian {
  /** Guardian is not being changed */
  NONE = "NONE",
  /** Guardian is being added */
  ADDING = "ADDING",
  /** Guardian is being removed */
  REMOVING = "REMOVING",
}

/**
 * Hook to check if there is a pending 'changeGuardian' transaction for the provided account
 * @param account - the account to check
 * @returns `ChangeGuardian` status if there is a pending transaction, otherwise `undefined`
 */

const callDataToType = (transactions?: Call | Call[]) => {
  const calldata = Array.isArray(transactions)
    ? transactions[0].calldata
    : transactions?.calldata
  if (calldata?.[0]) {
    const guardianAddress = number.toBN(calldata[0])
    if (guardianAddress.eq(constants.ZERO)) {
      return ChangeGuardian.REMOVING
    } else {
      return ChangeGuardian.ADDING
    }
  }
  return ChangeGuardian.NONE
}

export interface PendingChangeGuardian {
  transaction: Transaction
  type: ChangeGuardian
}

export const usePendingChangeGuardian = (
  account?: BaseWalletAccount,
): PendingChangeGuardian | undefined => {
  const { pendingTransactions } = useAccountTransactions(account)
  const pendingChangeGuardian = useMemo(() => {
    const changeGuardianTransaction = pendingTransactions.find(
      (transaction) => transaction.meta?.isChangeGuardian,
    )
    if (changeGuardianTransaction) {
      const transactions = changeGuardianTransaction.meta?.transactions
      const type = callDataToType(transactions)
      return {
        transaction: changeGuardianTransaction,
        type,
      }
    }
  }, [pendingTransactions])

  return pendingChangeGuardian
}

export interface LiveAccountGuardianState {
  /** the type of change */
  type: ChangeGuardian
  /** the status of the change */
  status: ReturnType<typeof useTransactionStatus>
}

/**
 * Hook to return live pending 'changeGuardian' status for the provided account
 * When invoked will keep a reference to any pending changeGuardian tx
 * and return status during its lifecycle, including awaiting for on-chain
 * state to change before moving to SUCCESS state
 * @param account - the account to check
 * @returns `UseLiveAccountGuardianState` status
 */

export const useLiveAccountGuardianState = (
  account?: BaseWalletAccount,
): LiveAccountGuardianState => {
  const liveAccount = useAccount(account)

  /** keep initial guardian state so we can react to change */
  const hasGuardian = Boolean(liveAccount?.guardian)
  const previousHasGuardian = useRef(hasGuardian)

  /** react to the same transaction for our lifecycle */
  const pendingChangeGuardian = usePendingChangeGuardian(account)
  const pendingChangeGuardianType = useRef(
    pendingChangeGuardian?.type || ChangeGuardian.NONE,
  )
  const pendingChangeGuardianHash = useRef(
    pendingChangeGuardian?.transaction.hash || "",
  )
  const transactionStatus = useTransactionStatus(
    pendingChangeGuardianHash.current,
    account?.networkId,
  )

  return useMemo(() => {
    /** Tx failure or none found */
    if (["ERROR", "UNKNOWN"].includes(transactionStatus)) {
      return {
        type: pendingChangeGuardianType.current,
        status: transactionStatus,
      }
    }

    /** Checks if on-chain state changed */
    const guardianChanged = hasGuardian !== previousHasGuardian.current

    /** Tx success AND guardian state updated on-chain */
    if (transactionStatus === "SUCCESS" && guardianChanged) {
      return {
        type: pendingChangeGuardianType.current,
        status: transactionStatus,
      }
    }

    /** PENDING while awaiting other states */
    return {
      type: pendingChangeGuardianType.current,
      status: "PENDING",
    }
  }, [hasGuardian, transactionStatus])
}
