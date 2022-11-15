import { assignEns } from "./ans"
import {
  register,
  requestEmailAuthentication,
  verifyEmail,
} from "./backend/account"

export const requestEmail = async (email: string) => {
  return requestEmailAuthentication(email)
}

export const confirmEmail = async (code: string) => {
  const { status, userRegistrationStatus } = await verifyEmail(code)
  if (status !== "verified") {
    throw new Error("failed to verify email", { cause: status })
  }

  // TODO: [BE] make atomic
  if (userRegistrationStatus === "notRegistered") {
    console.log("assigned ENS:", await assignEns())
    await register()
  }
}
