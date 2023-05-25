import { isEmpty } from "lodash-es"
import { useMemo } from "react"

import { ApiTransactionSimulationResponse } from "./transactionSimulationTypes"

const useBalanceChange = (
  transactionSimulation: ApiTransactionSimulationResponse | undefined,
) => {
  const showBalanceChange = useMemo(() => {
    const txnHasTransfers = !isEmpty(transactionSimulation?.transfers)
    const txnHasApprovals = !isEmpty(transactionSimulation?.approvals)

    // Show balance change if there is a transaction simulation and there are approvals or transfers
    return transactionSimulation && (txnHasTransfers || txnHasApprovals)
  }, [transactionSimulation])
  return { showBalanceChange }
}

export { useBalanceChange }
