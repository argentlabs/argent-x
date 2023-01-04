import { Flex } from "@chakra-ui/react"
import { FC } from "react"
import { Call } from "starknet"

import { Token } from "../../../../shared/token/type"
import {
  ApiTransactionReviewResponse,
  getDisplayWarnAndReasonForTransactionReview,
  getTransactionReviewActivityOfType,
} from "../../../../shared/transactionReview.service"
import { WarningIcon } from "../../../components/Icons/WarningIcon"
import { SwapTransactionActions } from "./SwapTransactionActions"
import { TransactionActions } from "./TransactionActions"
import { TransactionBanner } from "./TransactionBanner"
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
}) => {
  const { warn, reason } =
    getDisplayWarnAndReasonForTransactionReview(transactionReview)
  const swapTxn = getTransactionReviewActivityOfType("swap", transactionReview)
  const approveTxn = getTransactionReviewActivityOfType(
    "approve",
    transactionReview,
  )

  const verifiedDapp = transactionReview?.targetedDapp
  return (
    <Flex direction="column" gap="2">
      {warn && (
        <TransactionBanner
          variant={transactionReview?.assessment}
          icon={WarningIcon}
          message={reason}
        />
      )}
      {verifiedDapp && <VerifiedTransactionBanner dapp={verifiedDapp} />}
      {swapTxn ? (
        <SwapTransactionActions
          swapTransaction={swapTxn}
          approveTransaction={approveTxn}
        />
      ) : (
        <TransactionActions transactions={transactions} />
      )}
    </Flex>
  )
}
