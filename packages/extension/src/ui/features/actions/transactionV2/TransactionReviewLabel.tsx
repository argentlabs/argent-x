import { FC } from "react"

import { useView } from "../../../views/implementation/react"
import { labelsFindFamily } from "../../../views/transactionReviews"

export const TransactionReviewLabel: FC<{ label?: string }> = ({
  label = "",
}) => {
  const labelString = useView(labelsFindFamily(label))
  return <>{labelString}</>
}
