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
