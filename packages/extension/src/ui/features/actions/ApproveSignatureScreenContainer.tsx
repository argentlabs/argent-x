import { FC } from "react"
import type { typedData } from "starknet"

import { useAccount } from "../accounts/accounts.state"
import { DeployAccountScreenContainer } from "../accounts/DeployAccountScreenContainer"
import { useIsSignerInMultisig } from "../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../multisig/multisig.state"
import { RemovedMultisigWarningScreen } from "../multisig/RemovedMultisigWarningScreen"
import { ApproveSignatureScreen } from "./ApproveSignatureScreen"
import { ConfirmScreenProps } from "./transaction/ApproveTransactionScreen/ConfirmScreen"
import { WithActionScreenErrorFooter } from "./transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { MultisigSignatureScreenWarning } from "../multisig/MultisigSignatureScreenWarning"
import { ExecuteFromOutsideScreen } from "./ExecuteFromOutsideScreen"
import { validateOutsideExecution } from "./transaction/executeFromOutside/utils"

interface ApproveSignatureScreenContainerProps
  extends Omit<ConfirmScreenProps, "onSubmit"> {
  dataToSign: typedData.TypedData
  skipDeployWarning?: boolean
  onSubmit: (data: typedData.TypedData) => void
  onReject: () => void
  onRejectWithoutClose?: () => void
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
  ...props
}) => {
  const multisig = useMultisig(selectedAccount)
  const signerIsInMultisig = useIsSignerInMultisig(multisig)
  const accountWithDeployState = useAccount(selectedAccount)
  if (
    !skipDeployWarning &&
    selectedAccount?.needsDeploy &&
    !accountWithDeployState?.deployTransaction
  ) {
    return <DeployAccountScreenContainer {...props} />
  }

  if (multisig && !signerIsInMultisig) {
    return <RemovedMultisigWarningScreen onReject={onRejectWithoutClose} />
  }

  if (multisig) {
    return (
      <MultisigSignatureScreenWarning
        selectedAccount={selectedAccount}
        {...props}
      />
    )
  }

  const isValidOutsideExecution = validateOutsideExecution(
    dataToSign,
    selectedAccount?.network,
  )

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
