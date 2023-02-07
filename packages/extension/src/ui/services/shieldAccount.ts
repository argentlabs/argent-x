import { sendMessage, waitForMessage } from "../../shared/messages"

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
