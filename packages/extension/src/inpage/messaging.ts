import { sendMessage, waitForMessage } from "./messageActions"

/** check if current host is pre-authorized against currently selected account */
export const getIsPreauthorized = async () => {
  try {
    sendMessage({
      type: "IS_PREAUTHORIZED",
    })
    const isPreauthorized = await waitForMessage(
      "IS_PREAUTHORIZED_RES",
      10 * 1000, // 10 seconds, temporary
    )
    return isPreauthorized
  } catch {
    // ignore timeout or other error
  }
  return false
}
