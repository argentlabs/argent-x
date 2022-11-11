import { FC, useState } from "react"
import { Navigate } from "react-router-dom"

import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../components/Fields"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"
import { AccountDeploymentFeeEstimation } from "./feeEstimation/AccountDeploymentFeeEstimation"
import { AccountAddressField } from "./transaction/fields/AccountAddressField"

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
      showHeader={false}
      footer={
        <AccountDeploymentFeeEstimation
          onErrorChange={setDisableConfirm}
          accountAddress={selectedAccount.address}
          networkId={selectedAccount.networkId}
          actionHash={actionHash}
        />
      }
      {...props}
    >
      <FieldGroup>
        <AccountAddressField
          title="From"
          accountAddress={selectedAccount.address}
          networkId={selectedAccount.network.id}
        />
        <Field>
          <FieldKey>Network</FieldKey>
          <FieldValue>{selectedAccount.network.name}</FieldValue>
        </Field>
      </FieldGroup>
    </ConfirmScreen>
  )
}
