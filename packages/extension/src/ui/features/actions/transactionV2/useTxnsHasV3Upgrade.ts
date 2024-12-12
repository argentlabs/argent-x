import { useCallback } from "react"
import type { Transaction } from "../../../../shared/transactions"
import { nonNullable } from "@argent/x-shared"
import { getV3UpgradeCall } from "../utils"

export function useV3UpgradeFromTxnsCallback() {
  return useCallback((transactions: Transaction[]) => {
    const txCallsArray = transactions
      .flatMap((txn) => txn.meta?.transactions)
      .filter(nonNullable)
    return getV3UpgradeCall(txCallsArray)
  }, [])
}

export function useTxnsHasV3UpgradeCallback() {
  const txnsHasV3Upgrade = useV3UpgradeFromTxnsCallback()
  return useCallback(
    (transactions: Transaction[]) => {
      return Boolean(txnsHasV3Upgrade(transactions))
    },
    [txnsHasV3Upgrade],
  )
}
