import type { FC } from "react"

import type { TypedData } from "@starknet-io/types-js"
import { DeployAccountScreenContainer } from "../accounts/DeployAccountScreenContainer"
import { useIsAccountDeploying } from "../accountTokens/useIsAccountDeploying"
import {
  isSignerInMultisigView,
  multisigView,
} from "../multisig/multisig.state"
import { RemovedMultisigWarningScreen } from "../multisig/RemovedMultisigWarningScreen"
import { ApproveSignatureScreen } from "./ApproveSignatureScreen"
import { ExecuteFromOutsideScreen } from "./ExecuteFromOutsideScreen"
import type { ConfirmScreenProps } from "./transaction/ApproveTransactionScreen/ConfirmScreen"
import { WithActionScreenErrorFooter } from "./transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { useView } from "../../views/implementation/react"
import useValidateOutsideExecution from "./transaction/executeFromOutside/useValidateOutsideExecution"

interface ApproveSignatureScreenContainerProps
  extends Omit<ConfirmScreenProps, "onSubmit"> {
  dataToSign: TypedData
  skipDeployWarning?: boolean
  onSubmit: (data: TypedData) => void
  onReject: () => void
  onRejectWithoutClose?: () => void
  host: string
  actionIsApproving?: boolean
}

export const ApproveSignatureScreenContainer: FC<
  ApproveSignatureScreenContainerProps
> = ({
  dataToSign,
  skipDeployWarning = false,
  onSubmit,
  selectedAccount,
  onRejectWithoutClose,
  host,
  ...props
}) => {
  const multisig = useView(multisigView(selectedAccount))
  const signerIsInMultisig = useView(isSignerInMultisigView(selectedAccount))
  const isAccountDeploying = useIsAccountDeploying(selectedAccount)
  const isValidOutsideExecution = useValidateOutsideExecution(
    dataToSign,
    host,
    selectedAccount?.network,
  )

  if (
    !skipDeployWarning &&
    selectedAccount?.needsDeploy &&
    !isAccountDeploying
  ) {
    return <DeployAccountScreenContainer {...props} />
  }

  if (multisig && !signerIsInMultisig) {
    return <RemovedMultisigWarningScreen onReject={onRejectWithoutClose} />
  }

  if (
    dataToSign.domain.name === "Account.execute_from_outside" &&
    !isValidOutsideExecution
  ) {
    return (
      <ExecuteFromOutsideScreen selectedAccount={selectedAccount} {...props} />
    )
  }

  return (
    <ApproveSignatureScreen
      dataToSign={dataToSign}
      onSubmit={() => {
        onSubmit(dataToSign)
      }}
      footer={<WithActionScreenErrorFooter />}
      {...props}
    />
  )
}
