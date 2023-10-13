import { isEmpty } from "lodash-es"
import { useMemo } from "react"

import { ApiTransactionSimulationResponse } from "./transactionSimulationTypes"

const useBalanceChange = (
  transactionSimulations: ApiTransactionSimulationResponse[] | undefined,
) => {
  const showBalanceChange = useMemo(() => {
    const txnHasTransfers = transactionSimulations?.some(
      (txn) => !isEmpty(txn.transfers),
    )

    const txnHasApprovals = transactionSimulations?.some(
      (txn) => !isEmpty(txn.approvals),
    )

    // Show balance change if there is a transaction simulation and there are approvals or transfers
    return transactionSimulations && (txnHasTransfers || txnHasApprovals)
  }, [transactionSimulations])
  return { showBalanceChange }
}

export { useBalanceChange }
