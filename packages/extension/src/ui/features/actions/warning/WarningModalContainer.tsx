import type { ITransactionReviewWarning } from "@argent/x-shared"
import { transactionReviewWarningSchema } from "@argent/x-shared"
import type { FC } from "react"
import { useMemo } from "react"

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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
