import { FC } from "react"

import { AddTokenScreenContainer } from "./AddTokenScreenContainer"
import { useActionScreen } from "./hooks/useActionScreen"

export const AddTokenActionScreenContainer: FC = () => {
  const { action, onSubmit, onReject } = useActionScreen()
  if (action.type !== "REQUEST_TOKEN") {
    throw new Error(
      "AddTokenActionScreenContainer used with incompatible action.type",
    )
  }
  const defaultToken = action.payload

  return (
    <AddTokenScreenContainer
      hideBackButton
      defaultToken={defaultToken}
      onSubmit={onSubmit}
      onReject={onReject}
    />
  )
}
