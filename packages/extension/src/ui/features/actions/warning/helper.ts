import { Warning } from "@argent/x-shared/simulation"
import { useView } from "../../../views/implementation/react"
import {
  allWarningsView,
  warningsFindFamily,
} from "../../../views/transactionReviews"
import { AllowArray } from "../../../../shared/storage/__new/interface"

export const useWarningsTitle = (warnings: Warning[]) => {
  const allWarnings = useView(allWarningsView)
  if (warnings.length === 1 && allWarnings) {
    return allWarnings.find((warning) => warning.reason === warnings[0].reason)
      ?.title
  }
  return `${warnings.length} risks identified`
}

export const useWarningsByReason = (key: AllowArray<string>) => {
  return useView(warningsFindFamily(key))
}
