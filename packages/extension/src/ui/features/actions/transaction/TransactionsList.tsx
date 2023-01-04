import { FC } from "react"
import { Call } from "starknet"

import { Token } from "../../../../shared/token/type"
import {
  ApiTransactionReviewResponse,
  getDisplayWarnAndReasonForTransactionReview,
  getTransactionReviewHasSwap,
} from "../../../../shared/transactionReview.service"
import { WarningIcon } from "../../../components/Icons/WarningIcon"
import { TransactionActions } from "./TransactionActions"
import { TransactionBanner } from "./TransactionBanner"
import { TransactionsListSwap } from "./TransactionsListSwap"
import { VerifiedTransactionBanner } from "./VerifiedTransactionBanner"

export interface ITransactionsList {
  networkId: string
  transactions: Call[]
  transactionReview?: ApiTransactionReviewResponse
  tokensByNetwork?: Token[]
}

/** Renders one or more transactions with review if available */

export const TransactionsList: FC<ITransactionsList> = ({
  transactions,
  transactionReview,
  tokensByNetwork = [],
}) => {
  const { warn, reason } =
    getDisplayWarnAndReasonForTransactionReview(transactionReview)
  const hasSwap = getTransactionReviewHasSwap(transactionReview)

  const verifiedDapp = transactionReview?.targetedDapp
  return (
    <>
      {warn && (
        <TransactionBanner
          variant={transactionReview?.assessment}
          icon={WarningIcon}
          message={reason}
        />
      )}
      {verifiedDapp && <VerifiedTransactionBanner dapp={verifiedDapp} />}
      {hasSwap ? (
        <TransactionsListSwap
          transactionReview={transactionReview}
          tokensByNetwork={tokensByNetwork}
        />
      ) : (
        <TransactionActions transactions={transactions} />
      )}
    </>
  )
}
