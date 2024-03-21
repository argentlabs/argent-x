import { FC } from "react"

import { useView } from "../../../views/implementation/react"
import { labelsFindFamily } from "../../../views/transactionReviews"

export const TransactionReviewLabel: FC<{
  prefix?: string
  label?: string
  suffix?: string
}> = ({ prefix, label = "", suffix }) => {
  const labelString = useView(labelsFindFamily(label))
  return (
    <>
      {prefix}
      {labelString}
      {suffix}
    </>
  )
}
