import { sendMessage, waitForMessage } from "../../shared/messages"
import { Network } from "../../shared/network"

export const getNetworkStatuses = async (networks: Network[] = []) => {
  sendMessage({ type: "GET_NETWORK_STATUSES", data: networks })
  return waitForMessage("GET_NETWORK_STATUSES_RES")
}
