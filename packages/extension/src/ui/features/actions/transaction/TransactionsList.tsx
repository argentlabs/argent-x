import { isArray } from "lodash-es"
import { FC, useMemo } from "react"
import { Call } from "starknet"

import {
  ApiTransactionReviewResponse,
  getDisplayWarnAndReasonForTransactionReview,
} from "../../../../shared/transactionReview.service"
import { WarningIcon } from "../../../components/Icons/WarningIcon"
import { TokenDetails } from "../../accountTokens/tokens.state"
import { TransactionBanner } from "./TransactionBanner"
import { TransactionItem } from "./TransactionItem"

export interface ITransactionsList {
  transactions: Call | Call[]
  transactionReview?: ApiTransactionReviewResponse
  tokensByNetwork?: TokenDetails[]
}

/** Renders one or more transactions with review if available */

export const TransactionsList: FC<ITransactionsList> = ({
  transactions,
  transactionReview,
  tokensByNetwork = [],
}) => {
  const transactionsArray: Call[] = useMemo(
    () => (isArray(transactions) ? transactions : [transactions]),
    [transactions],
  )
  const { warn, reason } =
    getDisplayWarnAndReasonForTransactionReview(transactionReview)
  return (
    <>
      {warn && (
        <TransactionBanner
          variant={transactionReview?.assessment}
          icon={WarningIcon}
          message={reason}
        />
      )}
      {transactionsArray.map((transaction, index) => (
        <TransactionItem
          key={index}
          transaction={transaction}
          tokensByNetwork={tokensByNetwork}
        />
      ))}
    </>
  )
}
