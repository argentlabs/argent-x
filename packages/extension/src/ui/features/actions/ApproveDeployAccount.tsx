import { FC, useState } from "react"
import { Navigate } from "react-router-dom"

import { routes } from "../../routes"
import { DeployAccountFeeEstimation } from "./feeEstimation/DeployAccountFeeEstimation"
import { AccountNetworkInfoArgentX } from "./transaction/ApproveTransactionScreen/AccountNetworkInfoArgentX"
import {
  ConfirmPageProps,
  ConfirmScreen,
} from "./transaction/ApproveTransactionScreen/ConfirmScreen"
import { DappHeaderArgentX } from "./transaction/ApproveTransactionScreen/DappHeader/DappHeaderArgentX"
import { TransactionActions } from "./transaction/ApproveTransactionScreen/TransactionActions"
import { WithActionScreenErrorFooter } from "./transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { ApproveScreenType } from "./transaction/types"

export interface ApproveDeployAccountScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  onSubmit: () => void
  actionIsApproving?: boolean
}

export const ApproveDeployAccountScreen: FC<
  ApproveDeployAccountScreenProps
> = ({
  selectedAccount,
  actionHash,
  onSubmit,
  actionIsApproving,
  ...props
}) => {
  const [disableConfirm, setDisableConfirm] = useState(false)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <ConfirmScreen
      title="Review activation"
      rejectButtonText="Cancel"
      confirmButtonIsLoading={actionIsApproving}
      confirmButtonDisabled={disableConfirm || actionIsApproving}
      selectedAccount={selectedAccount}
      onSubmit={onSubmit}
      showHeader={true}
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
      {...props}
    >
      {/** Use Transaction Review to get DappHeader */}
      <DappHeaderArgentX approveScreenType={ApproveScreenType.ACCOUNT_DEPLOY} />

      <TransactionActions
        action={{
          type: "DEPLOY_ACCOUNT",
          payload: {
            accountAddress: selectedAccount.address,
            classHash:
              selectedAccount.network.accountClassHash?.[selectedAccount.type],
            type: selectedAccount.type,
          },
        }}
      />

      <AccountNetworkInfoArgentX account={selectedAccount} />
    </ConfirmScreen>
  )
}
