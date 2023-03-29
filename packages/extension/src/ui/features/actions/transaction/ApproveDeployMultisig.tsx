import { FC, useState } from "react"
import { Navigate } from "react-router-dom"

import { routes } from "../../../routes"
import { usePageTracking } from "../../../services/analytics"
import { ConfirmPageProps } from "../DeprecatedConfirmScreen"
import { DeployAccountFeeEstimation } from "../feeEstimation/DeployAccountFeeEstimation"
import { AccountNetworkInfo } from "./ApproveTransactionScreen/AccountNetworkInfo"
import { ConfirmScreen } from "./ApproveTransactionScreen/ConfirmScreen"
import { DappHeader } from "./ApproveTransactionScreen/DappHeader"
import { TransactionActions } from "./ApproveTransactionScreen/TransactionActions"
import { ApproveScreenType } from "./types"

export interface ApproveDeployMultisigScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  onSubmit: () => void
}

export const ApproveDeployMultisig: FC<ApproveDeployMultisigScreenProps> = ({
  selectedAccount,
  actionHash,
  onSubmit,
  ...rest
}) => {
  usePageTracking("signTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })
  const [disableConfirm, setDisableConfirm] = useState(true)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <ConfirmScreen
      confirmButtonText="Confirm"
      rejectButtonText="Cancel"
      confirmButtonDisabled={disableConfirm}
      selectedAccount={selectedAccount}
      onSubmit={onSubmit}
      showHeader={true}
      footer={
        <DeployAccountFeeEstimation
          accountAddress={selectedAccount.address}
          actionHash={actionHash}
          networkId={selectedAccount.networkId}
          onErrorChange={setDisableConfirm}
        />
      }
      {...rest}
    >
      {/** Use Transaction Review to get DappHeader */}
      <DappHeader approveScreenType={ApproveScreenType.MULTISIG_DEPLOY} />

      <TransactionActions
        transactions={[
          {
            contractAddress: selectedAccount.address,
            entrypoint: "Activate Multisig", // This is just for display purposes. Not used in the actual transaction.
          },
        ]}
      />

      <AccountNetworkInfo account={selectedAccount} />
    </ConfirmScreen>
  )
}
