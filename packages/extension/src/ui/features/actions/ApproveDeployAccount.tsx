import { FC, useState } from "react"
import { Navigate } from "react-router-dom"

import { routes } from "../../routes"
import { DeployAccountFeeEstimation } from "./feeEstimation/DeployAccountFeeEstimation"
import {
  ConfirmPageProps,
  ConfirmScreen,
} from "./transaction/ApproveTransactionScreen/ConfirmScreen"
import { WithActionScreenErrorFooter } from "./transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { AccountDetails } from "./transactionV2/TransactionHeader/AccountDetails"
import { Divider } from "@chakra-ui/react"
import {
  TransactionHeader,
  TransactionHeaderProps,
} from "./transactionV2/TransactionHeader"
import { TransactionReviewActions } from "./transactionV2/action/TransactionReviewActions"
import { ReviewOfTransaction } from "../../../shared/transactionReview/schema"

export interface ApproveDeployAccountScreenProps
  extends Omit<ConfirmPageProps, "onSubmit">,
    Pick<TransactionHeaderProps, "title" | "iconKey"> {
  actionHash: string
  onSubmit: () => void
  actionIsApproving?: boolean
  displayCalldata?: string[]
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
  ...rest
}) => {
  const [disableConfirm, setDisableConfirm] = useState(false)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }
  const navigationBar = (
    <>
      <AccountDetails />
      <Divider color="neutrals.700" />
    </>
  )

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
    />
  )

  return (
    <ConfirmScreen
      confirmButtonIsLoading={actionIsApproving}
      confirmButtonDisabled={disableConfirm || actionIsApproving}
      footer={
        <WithActionScreenErrorFooter isTransaction>
          <DeployAccountFeeEstimation
            onErrorChange={setDisableConfirm}
            accountAddress={selectedAccount.address}
            networkId={selectedAccount.networkId}
            actionHash={actionHash}
            transactionSimulationLoading={false}
          />
        </WithActionScreenErrorFooter>
      }
      navigationBar={navigationBar}
      {...rest}
    >
      <TransactionHeader px={0} title={title} iconKey={iconKey} />
      {transactionReviewActions}
    </ConfirmScreen>
  )
}
