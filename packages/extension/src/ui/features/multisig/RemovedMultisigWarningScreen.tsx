import type { FC } from "react"

import { WarningScreen } from "../accounts/WarningScreen"
import { useNavigate } from "react-router-dom"
import { routes } from "../../../shared/ui/routes"
import { isFunction } from "lodash-es"

export const RemovedMultisigWarningScreen: FC<{
  onReject?: () => void
}> = ({ onReject }) => {
  const navigate = useNavigate()

  const onSubmit = () => {
    if (isFunction(onReject)) {
      onReject()
    }

    navigate(routes.accountTokens())
  }

  return (
    <WarningScreen
      title="You can no longer use this account"
      description="You were removed from the multisig account you are trying to interact with"
      buttonLabel="Back to my accounts"
      onSubmit={onSubmit}
    />
  )
}
