import { FC, useState } from "react"
import { Navigate } from "react-router-dom"
import { CompiledContract } from "starknet"

import {
  Field,
  FieldGroup,
  FieldKey,
  FieldValue,
} from "../../components/Fields"
import { routes } from "../../routes"
import { usePageTracking } from "../../services/analytics"
import { ConfirmPageProps, ConfirmScreen } from "./ConfirmScreen"
import { DeclareContractFeeEstimation } from "./feeEstimation/DeclareContractFeeEstimation"
import { AccountAddressField } from "./transaction/fields/AccountAddressField"

export interface ApproveDeclareContractScreenProps
  extends Omit<ConfirmPageProps, "onSubmit"> {
  actionHash: string
  classHash: string
  contract: string | CompiledContract
  onSubmit: () => void
}

const ApproveDeclareContractScreen: FC<ApproveDeclareContractScreenProps> = ({
  selectedAccount,
  actionHash,
  classHash,
  contract,
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
    <ConfirmScreen
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
          classHash={classHash}
          contract={contract}
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

export { ApproveDeclareContractScreen }
