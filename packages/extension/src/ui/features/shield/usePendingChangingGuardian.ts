import { useMemo } from "react"
import { constants, number } from "starknet"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { useAccountTransactions } from "../accounts/accountTransactions.state"

export enum ChangeGuardian {
  /** Guardian is being added */
  ADDING = "ADDING",
  /** Guardian is being removed */
  REMOVING = "REMOVING",
  /** Guardian transaction but unrecognised */
  UNKNOWN = "UNKNOWN",
}

/**
 * Hook to check if there is a pending 'changeGuardian' transaction for the provided account
 * @param account - the account to check
 * @returns `ChangeGuardian` status if there is a pending transaction, otherwise `undefined`
 */

export const usePendingChangeGuardian = (
  account?: BaseWalletAccount,
): ChangeGuardian | undefined => {
  const { pendingTransactions } = useAccountTransactions(account)
  const pendingChangeGuardian = useMemo(() => {
    const changeGuardianTransaction = pendingTransactions.find(
      (transaction) => transaction.meta?.isChangeGuardian,
    )
    if (changeGuardianTransaction) {
      const transactions = changeGuardianTransaction.meta?.transactions
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
      } else {
        console.warn(
          "Unhandled pending guardian transaction",
          changeGuardianTransaction,
        )
        return ChangeGuardian.UNKNOWN
      }
    }
  }, [pendingTransactions])

  return pendingChangeGuardian
}
