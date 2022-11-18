import { UdpMessage } from "../shared/messages/UdpMessage"
import { getNetwork } from "../shared/network"
import { getProvider } from "../shared/network/provider"
import { HandleMessage, UnhandledMessage } from "./background"

export const handleUdpMessaging: HandleMessage<UdpMessage> = async ({
  msg,
  background,
  sendToTabAndUi,
}) => {
  const { actionQueue, wallet } = background
  const { type } = msg

  switch (type) {
    case "REQUEST_DECLARE_CONTRACT": {
      const { data } = msg
      const { address, networkId, classHash, contract } = data
      await wallet.selectAccount({ address, networkId })

      const action = await actionQueue.push({
        type: "DECLARE_CONTRACT_ACTION",
        payload: {
          classHash,
          contract,
        },
      })

      return sendToTabAndUi({
        type: "REQUEST_DECLARE_CONTRACT_RES",
        data: {
          actionHash: action.meta.hash,
        },
      })
    }

    case "FETCH_CONSTRUCTOR_PARAMS": {
      const {
        data: { networkId, classHash },
      } = msg

      const network = await getNetwork(networkId)
      const provider = getProvider(network)

      try {
        if ("getClassByHash" in provider) {
          const contract = await provider.getClassByHash(classHash)
          return sendToTabAndUi({
            type: "FETCH_CONSTRUCTOR_PARAMS_RES",
            data: {
              contract,
            },
          })
        }
      } catch (error) {
        return sendToTabAndUi({
          type: "FETCH_CONSTRUCTOR_PARAMS_REJ",
          data: {
            error: `${error}`,
          },
        })
      }
      return
    }

    case "REQUEST_DEPLOY_CONTRACT": {
      const { data } = msg
      const {
        address,
        networkId,
        classHash,
        constructorCalldata,
        salt,
        unique,
      } = data
      await wallet.selectAccount({ address, networkId })

      const action = await actionQueue.push({
        type: "DEPLOY_CONTRACT_ACTION",
        payload: {
          classHash,
          constructorCalldata,
          salt,
          unique,
        },
      })

      return sendToTabAndUi({
        type: "REQUEST_DEPLOY_CONTRACT_RES",
        data: {
          actionHash: action.meta.hash,
        },
      })
    }
  }

  throw new UnhandledMessage()
}
