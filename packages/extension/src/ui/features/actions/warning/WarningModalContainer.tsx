import {
  ITransactionReviewWarning,
  transactionReviewWarningSchema,
} from "@argent/x-shared"
import { FC, useMemo } from "react"

import {
  WarningModal,
  type WarningModalProps,
  type WarningsByReason,
} from "./WarningModal"
import { useWarningsByReason } from "./helper"

const isITransactionReviewWarning = (
  obj: ITransactionReviewWarning | Record<string, ITransactionReviewWarning>,
): obj is ITransactionReviewWarning => {
  const parsedWarningSchema = transactionReviewWarningSchema.safeParse(obj)
  return parsedWarningSchema.success
}

interface WarningModalContainerProps
  extends Omit<WarningModalProps, "warningsByReason" | "title"> {}

export const WarningModalContainer: FC<WarningModalContainerProps> = ({
  warnings,
  ...rest
}) => {
  const warningsDetails = useWarningsByReason(
    warnings.map((warning) => warning.reason),
  )

  const warningsByReason: WarningsByReason = useMemo(() => {
    if (isITransactionReviewWarning(warningsDetails)) {
      return {
        [warningsDetails.reason]: warningsDetails,
      }
    }
    return warningsDetails
  }, [warningsDetails])

  return (
    <WarningModal
      warnings={warnings}
      warningsByReason={warningsByReason}
      {...rest}
    />
  )
}
