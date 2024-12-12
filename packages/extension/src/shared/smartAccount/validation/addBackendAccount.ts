import { getMessageFromTrpcError } from "@argent/x-shared"

export const addBackendAccountErrorStatus = {
  accountAlreadyAdded: "This account is already added - please check account",
  accountInUse: "This account is already linked to a different email address",
  ownerAlreadyInUse: "This email address is already in use",
} as const

export const getAddBackendAccountErrorFromBackendError = (error: unknown) => {
  const message = getMessageFromTrpcError(error)
  if (!message) {
    return null
  }
  for (const [key, value] of Object.entries(addBackendAccountErrorStatus)) {
    if (message.includes(key)) {
      return value
    }
  }
}
