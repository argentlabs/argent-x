import { sendMessage, waitForMessage } from "../../shared/messages"

export const shieldMaybeAddAccount = async () => {
  sendMessage({ type: "SHIELD_MAYBE_ADD_ACCOUNT" })

  const result = await Promise.race([
    waitForMessage("SHIELD_MAYBE_ADD_ACCOUNT_RES"),
    waitForMessage("SHIELD_MAYBE_ADD_ACCOUNT_REJ").then((error) => {
      throw new Error(error)
    }),
  ])

  return result
}
