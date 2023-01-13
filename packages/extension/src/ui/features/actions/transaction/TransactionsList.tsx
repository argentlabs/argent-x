import { Flex } from "@chakra-ui/react"
import { isEmpty } from "lodash-es"
import { FC, useMemo } from "react"
import { Call } from "starknet"

import { Token } from "../../../../shared/token/type"
import {
  ApiTransactionReviewResponse,
  getDisplayWarnAndReasonForTransactionReview,
  getTransactionReviewActivityOfType,
} from "../../../../shared/transactionReview.service"
import { ApiTransactionSimulationResponse } from "../../../../shared/transactionSimulation.service"
import { WarningIcon } from "../../../components/Icons/WarningIcon"
import { BalanceChangeOverview } from "./BalanceChangeOverview"
import { TransactionActions } from "./TransactionActions"
import { TransactionBanner } from "./TransactionBanner"
import { VerifiedTransactionBanner } from "./VerifiedTransactionBanner"

export interface ITransactionsList {
  networkId: string
  transactions: Call[]
  transactionReview?: ApiTransactionReviewResponse
  transactionSimulation?: ApiTransactionSimulationResponse
  tokensByNetwork?: Token[]
}

/** Renders one or more transactions with review if available */

export const TransactionsList: FC<ITransactionsList> = ({
  transactions,
  transactionReview,
  transactionSimulation,
}) => {
  const { warn, reason } =
    getDisplayWarnAndReasonForTransactionReview(transactionReview)
  const approveTxn = getTransactionReviewActivityOfType(
    "approve",
    transactionReview,
  )

  const txnHasApprovalsOrTransfers = useMemo(
    () =>
      !isEmpty(transactionSimulation?.approvals) ||
      !isEmpty(transactionSimulation?.transfers),
    [transactionSimulation],
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
      {transactionSimulation && txnHasApprovalsOrTransfers ? (
        <BalanceChangeOverview transactionSimulation={transactionSimulation} />
      ) : (
        <TransactionActions transactions={transactions} />
      )}
    </Flex>
  )
}
