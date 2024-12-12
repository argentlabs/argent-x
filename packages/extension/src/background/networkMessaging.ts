import { num, shortString } from "starknet"

import type { NetworkMessage } from "../shared/messages/NetworkMessage"
import { networkService } from "../shared/network/service"
import { UnhandledMessage } from "./background"
import type { HandleMessage } from "./background"
import { networkSchema } from "../shared/network"

export const handleNetworkMessage: HandleMessage<NetworkMessage> = async ({
  msg,
  origin,
  background: { actionService, wallet },
  respond,
}) => {
  switch (msg.type) {
    case "REQUEST_SELECTED_NETWORK": {
      const account = await wallet.getSelectedAccount()
      if (!account) {
        return respond({
          type: "REQUEST_SELECTED_NETWORK_REJ",
          data: {
            error: "No account selected",
          },
        })
      }

      return respond({
        type: "REQUEST_SELECTED_NETWORK_RES",
        data: {
          network: account.network,
        },
      })
    }

    case "REQUEST_ADD_CUSTOM_NETWORK": {
      const parsedCustomNetwork = networkSchema.safeParse(msg.data)
      if (!parsedCustomNetwork.success) {
        return respond({
          type: "REQUEST_ADD_CUSTOM_NETWORK_REJ",
          data: {
            error: parsedCustomNetwork.error.message,
          },
        })
      }

      const network = await networkService.getByChainId(
        parsedCustomNetwork.data.chainId,
      )

      const exists = Boolean(network)
      let actionHash: string | undefined
      if (!exists) {
        const { meta } = await actionService.add({
          type: "REQUEST_ADD_CUSTOM_NETWORK",
          payload: parsedCustomNetwork.data,
        })

        actionHash = meta.hash
      }

      return respond({
        type: "REQUEST_ADD_CUSTOM_NETWORK_RES",
        data: {
          exists,
          actionHash,
        },
      })
    }

    case "REQUEST_SWITCH_CUSTOM_NETWORK": {
      const { chainId } = msg.data
      const isHexChainId = num.isHex(chainId)

      const network = await networkService.getByChainId(
        isHexChainId ? shortString.decodeShortString(chainId) : chainId,
      )

      const account = await wallet.getSelectedAccount()
      const isCurrentNetwork = account?.network.id === network?.id

      const exists = Boolean(network)
      let actionHash: string | undefined
      if (exists && !isCurrentNetwork) {
        // Switch only if network exists
        const { meta } = await actionService.add(
          {
            type: "REQUEST_SWITCH_CUSTOM_NETWORK",
            payload: network,
          },
          {
            origin,
          },
        )

        actionHash = meta.hash
      }

      return respond({
        type: "REQUEST_SWITCH_CUSTOM_NETWORK_RES",
        data: {
          actionHash,
          exists,
          isCurrentNetwork,
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
