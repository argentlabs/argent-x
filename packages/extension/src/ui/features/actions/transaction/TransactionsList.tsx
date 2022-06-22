import { isArray } from "lodash-es"
import { FC, useMemo } from "react"
import { Call } from "starknet"

import { ApiTransactionReviewResponse } from "../../../../shared/transactionReview.service"
import { WarningIcon } from "../../../components/Icons/WarningIcon"
import { TokenDetails } from "../../accountTokens/tokens.state"
import { TransactionBanner } from "./TransactionBanner"
import { TransactionItem } from "./TransactionItem"

export interface ITransactionsList {
  transactions: Call | Call[]
  transactionReview: ApiTransactionReviewResponse | undefined
  tokensByNetwork: TokenDetails[] | undefined
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
  const transactionReviewWarn = transactionReview?.assessment === "warn"
  const transactionReviewWarnAssessment =
    transactionReview?.reason === "recipientIsTokenAddress"
      ? "You are sending tokens to their own address. This is likely to burn them."
      : "This transaction has been flagged as dangerous. We recommend you reject this transaction unless you are sure."
  return (
    <>
      {transactionReviewWarn && (
        <TransactionBanner
          variant={transactionReview?.assessment}
          icon={WarningIcon}
          message={transactionReviewWarnAssessment}
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
