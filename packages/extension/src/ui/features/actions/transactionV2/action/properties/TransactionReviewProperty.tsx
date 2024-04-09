import { LabelValueRow } from "@argent/x-ui"
import { useMemo } from "react"

import type { Property } from "../../../../../../shared/transactionReview/schema"
import { TransactionReviewLabel } from "../../TransactionReviewLabel"
import { AmountProperty } from "./AmountProperty"
import { AddressProperty } from "./AddressProperty"
import { CallDataProperty } from "./CallDataProperty"
import { TimeStampProperty } from "./TimeStampProperty"
import { TextProperty } from "./TextProperty"
import { TokenAddressProperty } from "./TokenAddressProperty"

export function TransactionReviewProperty(property: Property) {
  const value = useMemo(() => {
    switch (property.type) {
      case "amount":
        return AmountProperty(property)
      case "address":
        return <AddressProperty {...property} />
      case "token_address":
        return TokenAddressProperty(property)
      case "nft":
        return TokenAddressProperty(property)
      case "calldata":
        return <CallDataProperty {...property} />
      case "text":
        return TextProperty(property)
      case "timestamp":
        return TimeStampProperty(property)
    }
    /** ensures all cases are handled */
    property satisfies never
  }, [property])
  return (
    <LabelValueRow
      label={<TransactionReviewLabel label={property.label} />}
      value={value}
    />
  )
}
