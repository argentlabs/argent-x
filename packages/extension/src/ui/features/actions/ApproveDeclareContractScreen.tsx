import { FC, useState } from "react"
import { Navigate } from "react-router-dom"
import { DeclareContractPayload } from "starknet"

import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { AccountAddress } from "./AccountAddress"
import { DeclareContractFeeEstimation } from "./feeEstimation/DeclareContractFeeEstimation"
import {
  ConfirmPageProps,
  DeprecatedConfirmScreen,
} from "./transaction/DeprecatedConfirmScreen"

export interface ApproveDeclareContractScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  payload: DeclareContractPayload
  onSubmit: () => void
}

const ApproveDeclareContractScreen: FC<ApproveDeclareContractScreenProps> = ({
  selectedAccount,
  actionHash,
  payload,
  onSubmit,
  ...props
}) => {
  usePageTracking("signDeclareTransaction", {
    networkId: selectedAccount?.networkId || "unknown",
  })

  const [disableConfirm, setDisableConfirm] = useState(false)

  if (!selectedAccount) {
    return <Navigate to={routes.accounts()} />
  }

  return (
    <DeprecatedConfirmScreen
      title="Review declare"
      confirmButtonText="Approve"
      confirmButtonDisabled={disableConfirm}
      selectedAccount={selectedAccount}
      onSubmit={onSubmit}
      showHeader={false}
      footer={
        <DeclareContractFeeEstimation
          onErrorChange={setDisableConfirm}
          accountAddress={selectedAccount.address}
          networkId={selectedAccount.networkId}
          actionHash={actionHash}
          payload={payload}
        />
      }
      {...props}
    >
      <AccountAddress selectedAccount={selectedAccount} />
    </DeprecatedConfirmScreen>
  )
}

export { ApproveDeclareContractScreen }
