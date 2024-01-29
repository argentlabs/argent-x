import { Warning } from "../../../../../shared/transactionReview/schema"
import { warningMap } from "./warningMap"

export const getHighestSeverity = (warnings: Warning[]): Warning | null => {
  if (warnings.length === 0) {
    return null
  }

  const severityOrder = ["critical", "high", "caution", "info"]
  return warnings.reduce((acc, curr) => {
    const currIndex = severityOrder.indexOf(curr.severity)
    const accIndex = severityOrder.indexOf(acc.severity)
    return currIndex < accIndex ? curr : acc
  }, warnings[0])
}

export const getTitleForWarnings = (warnings: Warning[]): string => {
  if (warnings.length === 1) {
    return warningMap[warnings[0].reason].title
  }
  return `${warnings.length} risks identified`
}
