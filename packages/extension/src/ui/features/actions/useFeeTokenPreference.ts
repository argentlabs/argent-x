import { feeTokenPreferenceAtom } from "../../views/feeTokenPreference"
import { useView } from "../../views/implementation/react"

export function useFeeTokenPreference() {
  return useView(feeTokenPreferenceAtom)
}
