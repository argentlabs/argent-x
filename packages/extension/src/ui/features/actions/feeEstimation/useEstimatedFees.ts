import { Call } from "starknet"
import { estimatedFeesAtom } from "../../../views/estimatedFees"
import { useView } from "../../../views/implementation/react"

export function useEstimatedFees(transactions: Call | Call[]) {
  const estimatedFees = useView(estimatedFeesAtom(transactions))
  return estimatedFees
}
