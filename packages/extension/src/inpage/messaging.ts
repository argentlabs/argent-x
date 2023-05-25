import { sendMessage, waitForMessage } from "./messageActions"

/** check if current host is pre-authorized against currently selected account */
export const getIsPreauthorized = async () => {
  try {
    sendMessage({
      type: "IS_PREAUTHORIZED",
    })
    const isPreauthorized = await waitForMessage("IS_PREAUTHORIZED_RES", 1000)
    return isPreauthorized
  } catch (e) {
    // ignore timeout or other error
  }
  return false
}
