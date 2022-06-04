import { NetworkMessage } from "../shared/messages/NetworkMessage"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { getNetworkByChainId, hasNetwork } from "./customNetworks"
import { addNetworks, getNetworks, removeNetworks } from "./customNetworks"
import { getNetworkStatuses } from "./networkStatus"

export const handleNetworkMessage: HandleMessage<NetworkMessage> = async ({
  msg,
  background: { wallet, actionQueue },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "GET_CUSTOM_NETWORKS": {
      const networks = await getNetworks()
      return sendToTabAndUi({
        type: "GET_CUSTOM_NETWORKS_RES",
        data: networks,
      })
    }

    case "ADD_CUSTOM_NETWORKS": {
      const networks = msg.data
      const newNetworks = await addNetworks(networks)
      await Promise.all(
        newNetworks.map(
          (network) => wallet.discoverAccountsForNetwork(network, 2), // just close gaps up to 1 blank space, as these networks are new and should be linked lists
        ),
      )
      return sendToTabAndUi({
        type: "ADD_CUSTOM_NETWORKS_RES",
        data: newNetworks,
      })
    }

    case "REMOVE_CUSTOM_NETWORKS": {
      const networks = msg.data
      return sendToTabAndUi({
        type: "REMOVE_CUSTOM_NETWORKS_RES",
        data: await removeNetworks(networks),
      })
    }

    case "GET_NETWORK_STATUSES": {
      const networks = msg.data?.length ? msg.data : await getNetworks()
      const statuses = await getNetworkStatuses(networks)
      return sendToTabAndUi({
        type: "GET_NETWORK_STATUSES_RES",
        data: statuses,
      })
    }

    case "REQUEST_ADD_CUSTOM_NETWORK": {
      const exists = await hasNetwork(msg.data.chainId)

      if (exists) {
        return sendToTabAndUi({
          type: "REQUEST_ADD_CUSTOM_NETWORK_RES",
          data: {},
        })
      }

      const { meta } = await actionQueue.push({
        type: "REQUEST_ADD_CUSTOM_NETWORK",
        payload: msg.data,
      })

      return sendToTabAndUi({
        type: "REQUEST_ADD_CUSTOM_NETWORK_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "REQUEST_SWITCH_CUSTOM_NETWORK": {
      const network = await getNetworkByChainId(msg.data.chainId)

      if (!network) {
        return sendToTabAndUi({
          type: "REQUEST_SWITCH_CUSTOM_NETWORK_RES",
          data: {},
        })
      }

      const { meta } = await actionQueue.push({
        type: "REQUEST_SWITCH_CUSTOM_NETWORK",
        payload: network,
      })

      return sendToTabAndUi({
        type: "REQUEST_SWITCH_CUSTOM_NETWORK_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "REJECT_REQUEST_ADD_CUSTOM_NETWORK":
    case "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
