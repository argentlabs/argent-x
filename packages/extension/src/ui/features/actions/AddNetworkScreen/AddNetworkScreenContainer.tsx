import { FC, useState } from "react"

import { networkSchema } from "../../../../shared/network"
import { useActionScreen } from "../hooks/useActionScreen"
import { WithActionScreenErrorFooter } from "../transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { AddNetworkScreen } from "./AddNetworkScreen"

interface AddNetworkScreenProps {
  mode?: "add" | "switch"
}

export const AddNetworkScreenContainer: FC<AddNetworkScreenProps> = ({
  mode,
}) => {
  const { action, approveAndClose, reject } = useActionScreen()
  if (
    action?.type !== "REQUEST_ADD_CUSTOM_NETWORK" &&
    action?.type !== "REQUEST_SWITCH_CUSTOM_NETWORK"
  ) {
    throw new Error(
      "AddNetworkScreenContainer used with incompatible action.type",
    )
  }
  const requestedNetwork = action.payload
  const [error, setError] = useState("")
  const handleSubmit = async (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault()
    try {
      networkSchema.parse(requestedNetwork)
      await approveAndClose()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(`${error}`)
      }
    }
  }
  return (
    <AddNetworkScreen
      onSubmit={handleSubmit}
      requestedNetwork={requestedNetwork}
      error={error}
      onReject={() => void reject()}
      mode={mode}
      footer={<WithActionScreenErrorFooter />}
    />
  )
}
