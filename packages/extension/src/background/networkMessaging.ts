import { num, shortString } from "starknet"

import { NetworkMessage } from "../shared/messages/NetworkMessage"
import { networkService } from "../shared/network/service"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"

export const handleNetworkMessage: HandleMessage<NetworkMessage> = async ({
  msg,
  origin,
  background: { actionService },
  respond,
}) => {
  switch (msg.type) {
    case "REQUEST_ADD_CUSTOM_NETWORK": {
      const exists = await networkService.getByChainId(msg.data.chainId)

      if (exists) {
        return respond({
          type: "REQUEST_ADD_CUSTOM_NETWORK_REJ",
          data: {
            error: `Network with chainId ${msg.data.chainId} already exists`,
          },
        })
      }

      const { meta } = await actionService.add({
        type: "REQUEST_ADD_CUSTOM_NETWORK",
        payload: msg.data,
      })

      return respond({
        type: "REQUEST_ADD_CUSTOM_NETWORK_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "REQUEST_SWITCH_CUSTOM_NETWORK": {
      const { chainId } = msg.data
      const isHexChainId = num.isHex(chainId)

      const network = await networkService.getByChainId(
        isHexChainId ? shortString.decodeShortString(chainId) : chainId,
      )

      if (!network) {
        return respond({
          type: "REQUEST_SWITCH_CUSTOM_NETWORK_REJ",
          data: {
            error: `Network with chainId ${chainId} does not exist. Please add the network with wallet_addStarknetChain request`,
          },
        })
      }

      const { meta } = await actionService.add(
        {
          type: "REQUEST_SWITCH_CUSTOM_NETWORK",
          payload: network,
        },
        {
          origin,
        },
      )

      return respond({
        type: "REQUEST_SWITCH_CUSTOM_NETWORK_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "REJECT_REQUEST_ADD_CUSTOM_NETWORK":
    case "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK": {
      return await actionService.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
