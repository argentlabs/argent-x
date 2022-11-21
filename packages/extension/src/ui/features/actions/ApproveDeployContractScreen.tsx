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
import { DeployContractFeeEstimation } from "./feeEstimation/DeployContractFeeEstimation"
import { AccountAddressField } from "./transaction/fields/AccountAddressField"

export interface ApproveDeployContractScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  classHash: string
  salt: string
  unique: boolean
  constructorCalldata: any
  /* TODO: add types */
  onSubmit: () => void
}

const ApproveDeployContractScreen: FC<ApproveDeployContractScreenProps> = ({
  selectedAccount,
  actionHash,
  classHash,
  salt,
  unique,
  constructorCalldata,
  onSubmit,
  ...props
}) => {
  usePageTracking("signTransaction", {
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
          classHash={classHash}
          salt={salt}
          unique={unique}
          constructorCalldata={constructorCalldata}
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

export { ApproveDeployContractScreen }
