import { sendMessage, waitForMessage } from "./messageActions"

/** check if current host is pre-authorized against currently selected account */
export const getIsPreauthorized = async () => {
  try {
    sendMessage({
      type: "IS_PREAUTHORIZED",
      data: window.location.host,
    })
    const isPreauthorized = await waitForMessage("IS_PREAUTHORIZED_RES", 1000)
    return isPreauthorized
  } catch (e) {
    // ignore timeout or other error
  }
  return false
}

export const getNetwork = async (networkId: string) => {
  try {
    sendMessage({
      type: "GET_NETWORK",
      data: networkId,
    })
    const network = await waitForMessage("GET_NETWORK_RES", 1000)
    return network
  } catch (error) {
    console.error(error)
    throw error
  }
}
