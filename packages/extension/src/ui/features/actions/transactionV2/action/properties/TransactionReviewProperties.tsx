import { FC } from "react"

import { Property } from "../../../../../../shared/transactionReview/schema"
import { TransactionReviewProperty } from "./TransactionReviewProperty"
import { LabelValueStack } from "@argent/ui"

interface TransactionReviewPropertiesProps {
  properties: Property[]
}

export const TransactionReviewProperties: FC<
  TransactionReviewPropertiesProps
> = ({ properties }) => {
  return (
    <LabelValueStack>
      {properties.map((property, index) => (
        <TransactionReviewProperty
          key={`proerty-${index}-${property.type}`}
          {...property}
        />
      ))}
    </LabelValueStack>
  )
}
