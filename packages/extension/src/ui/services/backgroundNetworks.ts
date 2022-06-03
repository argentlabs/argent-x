import { sendMessage, waitForMessage } from "../../shared/messages"
import { Network } from "../../shared/networks"

export const getNetworks = async () => {
  sendMessage({ type: "GET_CUSTOM_NETWORKS" })
  return waitForMessage("GET_CUSTOM_NETWORKS_RES")
}

export const getNetwork = async (
  networkId: string,
): Promise<Network | undefined> => {
  const result = await getNetworks()
  return result.find((x) => x.id === networkId)
}

export const addNetworks = async (networks: Network[]) => {
  sendMessage({ type: "ADD_CUSTOM_NETWORKS", data: networks })
  return waitForMessage("ADD_CUSTOM_NETWORKS_RES")
}

export const removeNetworks = async (networks: Network["id"][]) => {
  sendMessage({ type: "REMOVE_CUSTOM_NETWORKS", data: networks })
  return waitForMessage("REMOVE_CUSTOM_NETWORKS_RES")
}

export const getNetworkStatuses = async (networks: Network[] = []) => {
  sendMessage({ type: "GET_NETWORK_STATUSES", data: networks })
  return waitForMessage("GET_NETWORK_STATUSES_RES")
}
