import { FC } from "react"

import { WarningScreen } from "../accounts/WarningScreen"

export const RemovedMultisigWarningScreen: FC<{
  onReject?: () => void
}> = ({ onReject }) => {
  return (
    <WarningScreen
      title="You can no longer use this account"
      description="You were removed from the multisig account you are trying to interact with"
      buttonLabel="Back to my accounts"
      onSubmit={onReject}
    />
  )
}
