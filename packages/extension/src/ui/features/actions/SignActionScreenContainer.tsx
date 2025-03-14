import type { FC } from "react"

import { WithSmartAccountVerified } from "../smartAccount/WithSmartAccountVerified"
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
    <WithSmartAccountVerified>
      <ApproveSignatureScreenContainer
        dataToSign={action.payload.typedData}
        host={action.meta.origin || ""}
        onSubmit={() => void approveAndClose()}
        onReject={() => void reject()}
        onRejectWithoutClose={() => void rejectWithoutClose()}
        selectedAccount={selectedAccount}
        actionIsApproving={Boolean(action.meta.startedApproving)}
      />
    </WithSmartAccountVerified>
  )
}
