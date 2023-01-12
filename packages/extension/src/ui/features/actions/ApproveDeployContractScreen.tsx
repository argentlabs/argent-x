import { FC, useState } from "react"
import { Navigate } from "react-router-dom"
import { UniversalDeployerContractPayload } from "starknet"

import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { AccountAddress } from "./AccountAddress"
import { DeployContractFeeEstimation } from "./feeEstimation/DeployContractFeeEstimation"
import {
  ConfirmPageProps,
  DeprecatedConfirmScreen,
} from "./transaction/DeprecatedConfirmScreen"

export interface ApproveDeployContractScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  deployPayload: UniversalDeployerContractPayload
  onSubmit: () => void
}

const ApproveDeployContractScreen: FC<ApproveDeployContractScreenProps> = ({
  selectedAccount,
  actionHash,
  deployPayload,
  onSubmit,
  ...props
}) => {
  usePageTracking("signDeployTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })

  const [disableConfirm, setDisableConfirm] = useState(false)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <DeprecatedConfirmScreen
      title="Review deploy"
      confirmButtonText="Approve"
      confirmButtonDisabled={disableConfirm}
      selectedAccount={selectedAccount}
      onSubmit={onSubmit}
      showHeader={false}
      footer={
        <DeployContractFeeEstimation
          onErrorChange={setDisableConfirm}
          accountAddress={selectedAccount.address}
          networkId={selectedAccount.networkId}
          actionHash={actionHash}
          payload={deployPayload}
        />
      }
      {...props}
    >
      <AccountAddress selectedAccount={selectedAccount} />
    </DeprecatedConfirmScreen>
  )
}

export { ApproveDeployContractScreen }
