import { FC, useState } from "react"
import { Navigate } from "react-router-dom"
import { UniversalDeployerContractPayload } from "starknet"

import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { AccountAddress } from "./AccountAddress"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"
import { DeployContractFeeEstimation } from "./feeEstimation/DeployContractFeeEstimation"

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
    <ConfirmScreen
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
    </ConfirmScreen>
  )
}

export { ApproveDeployContractScreen }
