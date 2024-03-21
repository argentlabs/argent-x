import { TransactionAction } from "@argent/x-shared"
import { estimatedFeesAtom } from "../../../views/estimatedFees"
import { useView } from "../../../views/implementation/react"

export function useEstimatedFees(transactionAction: TransactionAction) {
  const estimatedFees = useView(estimatedFeesAtom(transactionAction))
  return estimatedFees
}
