import type { FC } from "react"
import { Navigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import type { ConfirmPageProps } from "./transaction/ApproveTransactionScreen/ConfirmScreen"
import { ConfirmScreen } from "./transaction/ApproveTransactionScreen/ConfirmScreen"
import { AccountDetailsNavigationBarContainer } from "../navigation/AccountDetailsNavigationBarContainer"
import type { TransactionHeaderProps } from "./transactionV2/header"
import { TransactionHeader } from "./transactionV2/header"
import { TransactionReviewActions } from "@argent/x-ui/simulation"
import type { ReviewOfTransaction } from "@argent/x-shared/simulation"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import type { TokenWithBalance } from "@argent/x-shared"
import { TransactionType } from "starknet"

export interface ApproveDeployAccountScreenProps
  extends Omit<ConfirmPageProps, "onSubmit">,
    Pick<TransactionHeaderProps, "title" | "iconKey"> {
  actionHash: string
  onSubmit: () => void
  actionIsApproving?: boolean
  displayCalldata?: string[]
  isLedger?: boolean
  disableLedgerApproval?: boolean
  feeToken: TokenWithBalance
  footer?: React.ReactNode
  disableConfirm?: boolean
}

export const ApproveDeployAccountScreen: FC<
  ApproveDeployAccountScreenProps
> = ({
  selectedAccount,
  actionHash,
  actionIsApproving,
  displayCalldata = [],
  title = "Deploy",
  iconKey,
  isLedger,
  disableLedgerApproval,
  feeToken,
  footer,
  disableConfirm,
  ...rest
}) => {
  const networkId = useCurrentNetwork().id

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }
  const navigationBar = <AccountDetailsNavigationBarContainer />

  /** Show mock tx review to the end user */

  const reviewOfTransaction: ReviewOfTransaction = {
    assessment: "verified",
    reviews: [
      {
        assessment: "verified",
        action: {
          name: title,
          properties: [],
          defaultProperties: [
            {
              type: "address",
              label: "default_contract",
              address: selectedAccount.address,
              verified: false,
            },
            {
              type: "calldata",
              label: "default_call",
              entrypoint: "constructor",
              calldata: displayCalldata,
            },
          ],
        },
      },
    ],
  }

  const transactionReviewActions = (
    <TransactionReviewActions
      reviewOfTransaction={reviewOfTransaction}
      initiallyExpanded
      networkId={networkId}
    />
  )

  return (
    <ConfirmScreen
      confirmButtonIsLoading={actionIsApproving}
      confirmButtonDisabled={
        disableConfirm || actionIsApproving || disableLedgerApproval
      }
      footer={footer}
      navigationBar={navigationBar}
      isLedger={isLedger}
      {...rest}
    >
      <TransactionHeader
        px={0}
        title={title}
        iconKey={iconKey}
        transactionType={TransactionType.DEPLOY_ACCOUNT}
      />
      {transactionReviewActions}
    </ConfirmScreen>
  )
}
