import memoize from "memoizee"
import { useMemo } from "react"

import { transactionsStore } from "../../../shared/transactions/store"
import { useArrayStorage } from "../../hooks/useStorage"
import type {
  ExtendedFinalityStatus,
  Transaction,
} from "../../../shared/transactions"
import { getTransactionStatus } from "../../../shared/transactions/utils"

function transformStatus(status: ExtendedFinalityStatus): Status {
  return ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2", "PENDING"].includes(status)
    ? "SUCCESS"
    : ["REJECTED", "REVERTED"].includes(status)
      ? "ERROR"
      : status === "CANCELLED"
        ? "CANCELLED"
        : "PENDING"
}

type Status = "UNKNOWN" | "PENDING" | "SUCCESS" | "ERROR" | "CANCELLED"

const transactionSelector = memoize(
  (hash?: string, networkId?: string) => (transaction: Transaction) =>
    transaction.hash === hash && transaction.account.networkId === networkId,
  { normalizer: ([hash = "0x0", networkId = ""]) => `${hash}-${networkId}` },
)

export const useTransactionStatus = (
  transactionHash?: string,
  networkId?: string,
): Status => {
  const [transaction] = useArrayStorage(
    transactionsStore,
    transactionSelector(transactionHash, networkId),
  )

  return useMemo(() => {
    const { finality_status } = getTransactionStatus(transaction)

    if (!finality_status) {
      return "UNKNOWN"
    }
    return transformStatus(finality_status)
  }, [transaction])
}
