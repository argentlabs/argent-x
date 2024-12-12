import { addressSchema } from "@argent/x-shared"
import type { FC } from "react"

import { AddTokenScreenContainer } from "./AddTokenScreenContainer"
import { useActionScreen } from "./hooks/useActionScreen"

export const AddTokenActionScreenContainer: FC = () => {
  const { action, approveAndClose, reject } = useActionScreen()
  if (action?.type !== "REQUEST_TOKEN") {
    throw new Error(
      "AddTokenActionScreenContainer used with incompatible action.type",
    )
  }
  const defaultToken = action.payload

  return (
    <AddTokenScreenContainer
      hideBackButton
      defaultToken={{
        ...defaultToken,
        address: addressSchema.parse(defaultToken.address),
      }}
      onSubmit={() => void approveAndClose()}
      onReject={() => void reject()}
    />
  )
}
