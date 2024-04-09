import type { Property } from "../../../../../../shared/transactionReview/schema"

export function TextProperty(property: Extract<Property, { type: "text" }>) {
  return property.text
}
