import type { Property } from "../../../../../../shared/transactionReview/schema"
import { formatDateTime } from "../../../../../services/dates"

export function TimeStampProperty(
  property: Extract<Property, { type: "timestamp" }>,
) {
  const value = formatDateTime(new Date(parseInt(property.value) * 1000))
  return value
}
