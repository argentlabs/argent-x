import { isArray } from "lodash-es"
import { FC, useMemo } from "react"
import { Call } from "starknet"

import { Token } from "../../../../shared/token/type"
import {
  ApiTransactionReviewResponse,
  getDisplayWarnAndReasonForTransactionReview,
  getTransactionReviewHasSwap,
} from "../../../../shared/transactionReview.service"
import { WarningIcon } from "../../../components/Icons/WarningIcon"
import { TransactionBanner } from "./TransactionBanner"
import { TransactionItem } from "./TransactionItem"
import { TransactionsListSwap } from "./TransactionsListSwap"

export interface ITransactionsList {
  networkId: string
  transactions: Call | Call[]
  transactionReview?: ApiTransactionReviewResponse
  tokensByNetwork?: Token[]
}

/** Renders one or more transactions with review if available */

export const TransactionsList: FC<ITransactionsList> = ({
  networkId,
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
  const hasSwap = getTransactionReviewHasSwap(transactionReview)
  return (
    <>
      {warn && (
        <TransactionBanner
          variant={transactionReview?.assessment}
          icon={WarningIcon}
          message={reason}
        />
      )}
      {hasSwap ? (
        <TransactionsListSwap
          transactionReview={transactionReview}
          tokensByNetwork={tokensByNetwork}
        />
      ) : (
        transactionsArray.map((transaction, index) => (
          <TransactionItem
            key={index}
            networkId={networkId}
            transaction={transaction}
            tokensByNetwork={tokensByNetwork}
          />
        ))
      )}
    </>
  )
}
