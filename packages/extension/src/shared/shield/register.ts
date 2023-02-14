import {
  register,
  requestEmailAuthentication,
  verifyEmail,
} from "./backend/account"

export const requestEmail = async (email: string) => {
  return requestEmailAuthentication(email)
}

export const confirmEmail = async (code: string) => {
  const { userRegistrationStatus } = await verifyEmail(code)

  if (userRegistrationStatus === "notRegistered") {
    await register()
  }
}
