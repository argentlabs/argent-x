import { FC, useState } from "react"
import { Navigate } from "react-router-dom"

import { routes } from "../../../shared/ui/routes"
import { DeployAccountFeeEstimation } from "./feeEstimation/DeployAccountFeeEstimation"
import {
  ConfirmPageProps,
  ConfirmScreen,
} from "./transaction/ApproveTransactionScreen/ConfirmScreen"
import { WithActionScreenErrorFooter } from "./transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { NavigationBarAccountDetailsContainer } from "./transactionV2/header/NavigationBarAccountDetailsContainer"
import { Divider } from "@chakra-ui/react"
import {
  TransactionHeader,
  TransactionHeaderProps,
} from "./transactionV2/header"
import { TransactionReviewActions } from "@argent/x-ui/simulation"
import { ReviewOfTransaction } from "@argent/x-shared/simulation"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { TokenWithBalance } from "@argent/x-shared"

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
  setFeeToken: (token: TokenWithBalance) => void
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
  setFeeToken,
  feeToken,
  ...rest
}) => {
  const [disableConfirm, setDisableConfirm] = useState(false)
  const networkId = useCurrentNetwork().id

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }
  const navigationBar = (
    <>
      <NavigationBarAccountDetailsContainer />
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
      networkId={networkId}
    />
  )

  return (
    <ConfirmScreen
      confirmButtonIsLoading={actionIsApproving}
      confirmButtonDisabled={
        disableConfirm || actionIsApproving || disableLedgerApproval
      }
      footer={
        <WithActionScreenErrorFooter isTransaction>
          <DeployAccountFeeEstimation
            onErrorChange={setDisableConfirm}
            accountAddress={selectedAccount.address}
            networkId={selectedAccount.networkId}
            actionHash={actionHash}
            transactionSimulationLoading={false}
            feeToken={feeToken}
            setFeeToken={setFeeToken}
          />
        </WithActionScreenErrorFooter>
      }
      navigationBar={navigationBar}
      isLedger={isLedger}
      {...rest}
    >
      <TransactionHeader px={0} title={title} iconKey={iconKey} />
      {transactionReviewActions}
    </ConfirmScreen>
  )
}
