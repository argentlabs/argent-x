import { UdcMessage } from "../shared/messages/UdcMessage"
import { getNetwork } from "../shared/network"
import { getProvider } from "../shared/network/provider"
import { HandleMessage, UnhandledMessage } from "./background"

export const handleUdcMessaging: HandleMessage<UdcMessage> = async ({
  msg,
  background,
  respond,
}) => {
  const { actionQueue, wallet } = background
  const { type } = msg

  switch (type) {
    case "REQUEST_DECLARE_CONTRACT": {
      const { data } = msg
      const { classHash, contract, ...restData } = data
      if ("address" in restData && "networkId" in restData) {
        await wallet.selectAccount({
          address: restData.address,
          networkId: restData.networkId,
        })
      }

      const action = await actionQueue.push({
        type: "DECLARE_CONTRACT_ACTION",
        payload: {
          classHash,
          contract,
        },
      })

      return respond({
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
          return respond({
            type: "FETCH_CONSTRUCTOR_PARAMS_RES",
            data: {
              contract,
            },
          })
        }
      } catch (error) {
        return respond({
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
          classHash: classHash.toString(),
          constructorCalldata,
          salt,
          unique,
        },
      })

      return respond({
        type: "REQUEST_DEPLOY_CONTRACT_RES",
        data: {
          actionHash: action.meta.hash,
        },
      })
    }
  }

  throw new UnhandledMessage()
}
