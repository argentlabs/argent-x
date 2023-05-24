import { FC, useState } from "react"
import { Navigate } from "react-router-dom"

import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { DeployAccountFeeEstimation } from "./feeEstimation/DeployAccountFeeEstimation"
import { AccountNetworkInfo } from "./transaction/ApproveTransactionScreen/AccountNetworkInfo"
import {
  ConfirmPageProps,
  ConfirmScreen,
} from "./transaction/ApproveTransactionScreen/ConfirmScreen"
import { DappHeader } from "./transaction/ApproveTransactionScreen/DappHeader"
import { TransactionActions } from "./transaction/ApproveTransactionScreen/TransactionActions"
import { ApproveScreenType } from "./transaction/types"

export interface ApproveDeployAccountScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  onSubmit: () => void
}

export const ApproveDeployAccountScreen: FC<
  ApproveDeployAccountScreenProps
> = ({ selectedAccount, actionHash, onSubmit, ...props }) => {
  usePageTracking("signTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })
  const [disableConfirm, setDisableConfirm] = useState(false)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <ConfirmScreen
      title="Review activation"
      confirmButtonText="Approve"
      confirmButtonDisabled={disableConfirm}
      selectedAccount={selectedAccount}
      onSubmit={onSubmit}
      showHeader={true}
      footer={
        <DeployAccountFeeEstimation
          onErrorChange={setDisableConfirm}
          accountAddress={selectedAccount.address}
          networkId={selectedAccount.networkId}
          actionHash={actionHash}
        />
      }
      {...props}
    >
      {/** Use Transaction Review to get DappHeader */}
      <DappHeader approveScreenType={ApproveScreenType.ACCOUNT_DEPLOY} />

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

      <AccountNetworkInfo account={selectedAccount} />
    </ConfirmScreen>
  )
}
