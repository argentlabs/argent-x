import { number, shortString } from "starknet"

import { NetworkMessage } from "../shared/messages/NetworkMessage"
import { getNetworkByChainId } from "../shared/network"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"

export const handleNetworkMessage: HandleMessage<NetworkMessage> = async ({
  msg,
  background: { actionQueue },
  respond,
}) => {
  switch (msg.type) {
    case "REQUEST_SWITCH_CUSTOM_NETWORK": {
      const { chainId } = msg.data

      const isHexChainId = number.isHex(chainId)

      const decodedChainId = shortString.decodeShortString(chainId)

      const network = await getNetworkByChainId(
        isHexChainId ? decodedChainId : chainId,
      )

      if (!network) {
        return respond({
          type: "REQUEST_SWITCH_CUSTOM_NETWORK_REJ",
          data: {
            error: `Network with chainId ${chainId} does not exist. Please add the network with wallet_addStarknetChain request`,
          },
        })
      }

      const { meta } = await actionQueue.push({
        type: "REQUEST_SWITCH_CUSTOM_NETWORK",
        payload: network,
      })

      return respond({
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
