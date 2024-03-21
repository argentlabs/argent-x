import { shortString } from "starknet"
import { getProvider } from "../../shared/network"
import { isArgentNetwork } from "../../shared/network/utils"
import { sendMessage, waitForMessage } from "../messageActions"
import { getIsPreauthorized } from "../messaging"

export async function requestChainIdHandler() {
  const isPreauthorized = await getIsPreauthorized()

  if (!isPreauthorized) {
    throw new Error("Not preauthorized")
  }

  void sendMessage({ type: "REQUEST_SELECTED_NETWORK" })
  const result = await Promise.race([
    waitForMessage("REQUEST_SELECTED_NETWORK_RES", 10 * 60 * 1000),
    waitForMessage("REQUEST_SELECTED_NETWORK_REJ", 10 * 60 * 1000).catch(
      () => "timeout" as const,
    ),
  ])

  if (result === "timeout") {
    throw new Error("Timeout")
  }

  if ("error" in result) {
    throw Error(result.error)
  }

  // For Argent network, we return the chainId directly
  if (isArgentNetwork(result.network)) {
    return shortString.encodeShortString(result.network.chainId)
  }

  // For other networks, we return the chainId from the rpc
  return getProvider(result.network).getChainId()
}
