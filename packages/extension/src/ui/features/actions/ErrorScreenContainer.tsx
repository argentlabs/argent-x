import { useNavigateBack } from "@argent/x-ui"
import { FC } from "react"

import { coerceErrorToString } from "../../../shared/utils/error"
import { useLegacyAppState } from "../../app.state"
import { ErrorScreen } from "./ErrorScreen"

export const ErrorScreenContainer: FC = () => {
  const { error } = useLegacyAppState()
  const displayError = coerceErrorToString(error)
  const navigateBack = useNavigateBack()

  const message =
    error && error.replace ? error.replace(/^(error:\s*)+/gi, "") : displayError

  return <ErrorScreen onSubmit={navigateBack} message={message} />
}
