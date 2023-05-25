import { FC, useCallback } from "react"

import { waitForMessage } from "../../../shared/messages"
import { useAppState } from "../../app.state"
import { analytics } from "../../services/analytics"
import { approveAction } from "../../services/backgroundActions"
import { useSelectedAccount } from "../accounts/accounts.state"
import { WithArgentShieldVerified } from "../shield/WithArgentShieldVerified"
import { ApproveSignatureScreenContainer } from "./ApproveSignatureScreenContainer"
import { useActionScreen } from "./hooks/useActionScreen"

export const SignActionScreenContainer: FC = () => {
  const { action, closePopupIfLastAction, onReject } = useActionScreen()
  if (action.type !== "SIGN") {
    throw new Error(
      "SignActionScreenContainer used with incompatible action.type",
    )
  }
  const account = useSelectedAccount()
  const onSubmit = useCallback(async () => {
    await approveAction(action)
    useAppState.setState({ isLoading: true })
    await waitForMessage(
      "SIGNATURE_SUCCESS",
      ({ data }) => data.actionHash === action.meta.hash,
    )
    await analytics.track("signedMessage", {
      networkId: account?.networkId || "unknown",
    })
    closePopupIfLastAction()
    useAppState.setState({ isLoading: false })
  }, [account?.networkId, action, closePopupIfLastAction])

  return (
    <WithArgentShieldVerified>
      <ApproveSignatureScreenContainer
        dataToSign={action.payload}
        onSubmit={onSubmit}
        onReject={onReject}
        selectedAccount={account}
      />
    </WithArgentShieldVerified>
  )
}
