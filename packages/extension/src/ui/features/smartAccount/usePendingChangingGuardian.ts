import { useMemo, useRef } from "react"

import type { Transaction } from "../../../shared/transactions"
import type { BaseWalletAccount } from "../../../shared/wallet.model"
import { useWalletAccount } from "../accounts/accounts.state"
import { useAccountTransactions } from "../accounts/accountTransactions.state"
import { useTransactionStatus } from "../accountTokens/useTransactionStatus"
import {
  ChangeGuardian,
  changeGuardianTransactionsToType,
} from "../../../shared/smartAccount/changeGuardianCallDataToType"

export interface PendingChangeGuardian {
  transaction: Transaction
  type: ChangeGuardian
}

/**
 * Hook to check if there is a pending 'changeGuardian' transaction for the provided account
 * @param account - the account to check
 * @returns `ChangeGuardian` status if there is a pending transaction, otherwise `undefined`
 */

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
      const type = changeGuardianTransactionsToType(transactions)
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
  /** if the account currently has guardian */
  hasGuardian: boolean
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
  const liveAccount = useWalletAccount(account?.id)

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
        hasGuardian,
      }
    }

    /** Checks if on-chain state changed */
    const guardianChanged = hasGuardian !== previousHasGuardian.current

    /** Tx success AND guardian state updated on-chain */
    if (transactionStatus === "SUCCESS" && guardianChanged) {
      return {
        type: pendingChangeGuardianType.current,
        status: transactionStatus,
        hasGuardian,
      }
    }

    /** PENDING while awaiting other states */
    return {
      type: pendingChangeGuardianType.current,
      status: "PENDING",
      hasGuardian,
    }
  }, [hasGuardian, transactionStatus])
}
