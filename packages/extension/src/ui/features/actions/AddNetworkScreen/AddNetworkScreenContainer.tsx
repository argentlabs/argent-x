import { FC, useState } from "react"

import { networkSchema } from "../../../../shared/network"
import { useActionScreen } from "../hooks/useActionScreen"
import { AddNetworkScreen } from "./AddNetworkScreen"

interface AddNetworkScreenProps {
  mode?: "add" | "switch"
}

export const AddNetworkScreenContainer: FC<AddNetworkScreenProps> = ({
  mode,
}) => {
  const { action, onSubmit, onReject } = useActionScreen()
  if (
    // action.type !== "REQUEST_ADD_CUSTOM_NETWORK" &&
    action.type !== "REQUEST_SWITCH_CUSTOM_NETWORK"
  ) {
    throw new Error(
      "AddNetworkScreenContainer used with incompatible action.type",
    )
  }
  const requestedNetwork = action.payload
  const [error, setError] = useState("")
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      networkSchema.parse(requestedNetwork)
      await onSubmit?.()
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
      onReject={onReject}
      mode={mode}
    />
  )
}
