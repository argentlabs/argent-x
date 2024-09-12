import { BaseError } from "@argent/x-shared"
import { isErrorOfType } from "../../errors/errorData"

export const addBackendAccountErrorStatus = {
  accountAlreadyAdded: "This account is already added - please check account",
  accountInUse: "This account is already linked to a different email address",
} as const

export const getAddBackendAccountErrorFromBackendError = (error: unknown) => {
  // Need BaseError.name instead of "BaseError" because the import from x-shared alters the name
  if (!isErrorOfType<string>(error, BaseError.name)) {
    return null
  }

  const message = error.data.message
  if (!message) {
    return null
  }
  for (const [key, value] of Object.entries(addBackendAccountErrorStatus)) {
    if (message.includes(key)) {
      return value
    }
  }
}
