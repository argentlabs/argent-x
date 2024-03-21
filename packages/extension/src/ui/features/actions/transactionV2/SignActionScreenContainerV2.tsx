import { FC, useCallback } from "react"
import { isObject } from "lodash-es"

import { WithArgentShieldVerified } from "../../shield/WithArgentShieldVerified"
import { useActionScreen } from "../hooks/useActionScreen"
import { useMultisig } from "../../multisig/multisig.state"
import { useIsSignerInMultisig } from "../../multisig/hooks/useIsSignerInMultisig"
import { useAccount } from "../../accounts/accounts.state"
import { useDappDisplayAttributes } from "../connectDapp/useDappDisplayAttributes"
import { DeployAccountScreenContainer } from "../../accounts/DeployAccountScreenContainer"
import { RemovedMultisigWarningScreen } from "../../multisig/RemovedMultisigWarningScreen"
import { MultisigSignatureScreenWarning } from "../../multisig/MultisigSignatureScreenWarning"
import { ExecuteFromOutsideScreen } from "../ExecuteFromOutsideScreen"
import { WithActionScreenErrorFooter } from "../transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { SignActionScreenV2 } from "./SignActionScreenV2"
import { validateOutsideExecution } from "../transaction/executeFromOutside/utils"

export const SignActionScreenContainerV2: FC = () => {
  const {
    action,
    selectedAccount,
    approve,
    reject,
    rejectWithoutClose,
    closePopupIfLastAction,
  } = useActionScreen()
  if (action?.type !== "SIGN") {
    throw new Error(
      "SignActionScreenContainer used with incompatible action.type",
    )
  }

  const multisig = useMultisig(selectedAccount)
  const signerIsInMultisig = useIsSignerInMultisig(multisig)
  const accountWithDeployState = useAccount(selectedAccount)
  const dappDisplayAttributes = useDappDisplayAttributes(
    action.meta.origin || "",
  )

  const dataToSign = action.payload.typedData
  const skipDeployWarning = action.payload.options?.skipDeploy

  const onSubmit = useCallback(async () => {
    const result = await approve()
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      closePopupIfLastAction()
    }
  }, [closePopupIfLastAction, approve])

  if (
    !skipDeployWarning &&
    selectedAccount?.needsDeploy &&
    !accountWithDeployState?.deployTransaction
  ) {
    return (
      <WithArgentShieldVerified>
        <DeployAccountScreenContainer onReject={() => void reject()} />
      </WithArgentShieldVerified>
    )
  }

  if (multisig && !signerIsInMultisig) {
    return (
      <RemovedMultisigWarningScreen
        onReject={() => void rejectWithoutClose()}
      />
    )
  }

  if (multisig) {
    return (
      <MultisigSignatureScreenWarning
        selectedAccount={selectedAccount}
        onReject={() => void reject()}
      />
    )
  }

  const isValidOutsideExecution = validateOutsideExecution(
    action.payload.typedData,
    selectedAccount?.network,
  )

  if (
    dataToSign.domain.name === "Account.execute_from_outside" &&
    !isValidOutsideExecution
  ) {
    return (
      <ExecuteFromOutsideScreen
        selectedAccount={selectedAccount}
        onReject={() => void reject()}
      />
    )
  }

  return (
    <WithArgentShieldVerified>
      <SignActionScreenV2
        title={action.meta.title}
        subtitle={action.meta.origin}
        dappLogoUrl={dappDisplayAttributes.iconUrl}
        dappHost={action.meta.origin || ""}
        dataToSign={dataToSign}
        onSubmit={() => void onSubmit()}
        footer={<WithActionScreenErrorFooter />}
        onReject={() => void reject()}
        actionIsApproving={Boolean(action.meta.startedApproving)}
      />
    </WithArgentShieldVerified>
  )
}
