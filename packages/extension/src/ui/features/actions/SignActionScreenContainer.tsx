import { FC } from "react"

import { WithArgentShieldVerified } from "../shield/WithArgentShieldVerified"
import { ApproveSignatureScreenContainer } from "./ApproveSignatureScreenContainer"
import { useActionScreen } from "./hooks/useActionScreen"

export const SignActionScreenContainer: FC = () => {
  const {
    action,
    selectedAccount,
    approveAndClose,
    reject,
    rejectWithoutClose,
  } = useActionScreen()
  if (action?.type !== "SIGN") {
    throw new Error(
      "SignActionScreenContainer used with incompatible action.type",
    )
  }

  return (
    <WithArgentShieldVerified>
      <ApproveSignatureScreenContainer
        dataToSign={action.payload.typedData}
        skipDeployWarning={action.payload.options?.skipDeploy}
        onSubmit={() => void approveAndClose()}
        onReject={() => void reject()}
        onRejectWithoutClose={() => void rejectWithoutClose()}
        selectedAccount={selectedAccount}
        actionIsApproving={Boolean(action.meta.startedApproving)}
      />
    </WithArgentShieldVerified>
  )
}
