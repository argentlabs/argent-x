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

export const getNetwork = async (networkId: string) => {
  try {
    sendMessage({
      type: "GET_NETWORK",
      data: networkId,
    })
    return await waitForMessage("GET_NETWORK_RES", 2000)
  } catch (error) {
    console.error(`Error getting network: ${error} for networkId: ${networkId}`)
    throw error
  }
}
