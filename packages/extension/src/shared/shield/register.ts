import { sendMessage, waitForMessage } from "../messages"

export const requestEmail = async (email: string) => {
  sendMessage({ type: "SHIELD_REQUEST_EMAIL", data: email })

  const result = await Promise.race([
    waitForMessage("SHIELD_REQUEST_EMAIL_RES"),
    waitForMessage("SHIELD_REQUEST_EMAIL_REJ").then((error) => {
      throw new Error(error)
    }),
  ])

  return result
}

export const confirmEmail = async (code: string) => {
  sendMessage({ type: "SHIELD_CONFIRM_EMAIL", data: code })

  const result = await Promise.race([
    waitForMessage("SHIELD_CONFIRM_EMAIL_RES"),
    waitForMessage("SHIELD_CONFIRM_EMAIL_REJ").then((error) => {
      throw new Error(error)
    }),
  ])

  return result
}

export const shieldValidateAccount = async () => {
  sendMessage({ type: "SHIELD_VALIDATE_ACCOUNT" })

  const result = await Promise.race([
    waitForMessage("SHIELD_VALIDATE_ACCOUNT_RES"),
    waitForMessage("SHIELD_VALIDATE_ACCOUNT_REJ").then((error) => {
      throw new Error(error)
    }),
  ])

  return result
}

export const shieldAddAccount = async () => {
  sendMessage({ type: "SHIELD_ADD_ACCOUNT" })

  const result = await Promise.race([
    waitForMessage("SHIELD_ADD_ACCOUNT_RES"),
    waitForMessage("SHIELD_ADD_ACCOUNT_REJ").then((error) => {
      throw new Error(error)
    }),
  ])

  return result
}
