import { isErrorOfType } from "../../errors/errorData"
import {
  emailVerificationStatusSchema,
  getVerificationErrorMessage,
} from "../backend/account"

export const getVerificationErrorFromBackendError = (error: unknown) => {
  if (!isErrorOfType<string>(error, "BaseError")) {
    return
  }
  const message = error.data.message
  const emailVerificationStatus =
    emailVerificationStatusSchema.safeParse(message)
  if (!emailVerificationStatus.success) {
    return
  }
  const verificationErrorMessage = getVerificationErrorMessage(
    emailVerificationStatus.data,
  )
  if (!verificationErrorMessage) {
    return
  }
  return verificationErrorMessage
}
