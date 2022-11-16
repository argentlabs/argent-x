import { UdpMessage } from "../shared/messages/UdpMessage"
import { handleActionApproval, handleActionRejection } from "./actionHandlers"
import { HandleMessage, UnhandledMessage } from "./background"

export const handleUdpMessaging: HandleMessage<UdpMessage> = async ({
  msg,
  background,
  sendToTabAndUi,
}) => {
  const { actionQueue, wallet } = background
  const { type, data } = msg
  switch (type) {
    case "REQUEST_DECLARE_CONTRACT": {
      const { address, networkId, classHash, contract } = data
      await wallet.selectAccount({ address, networkId })

      const action = await actionQueue.push({
        type: "REQUEST_DECLARE_CONTRACT",
        payload: {
          classHash,
          contract,
          declareTransaction: {
            contractDefinition: JSON.parse(data.contract),
            senderAddress: address,
          },
        },
      })

      return sendToTabAndUi({
        type: "REQUEST_DECLARE_CONTRACT_RES",
        data: {
          actionHash: action.meta.hash,
        },
      })
    }

    case "APPROVE_DECLARE_ACTION": {
      const { actionHash } = msg.data
      const action = await actionQueue.remove(actionHash)
      if (!action) {
        throw new Error("Action not found")
      }
      const resultMessage = await handleActionApproval(action, background)
      if (resultMessage) {
        sendToTabAndUi(resultMessage)
      }
      return
    }

    case "REQUEST_DECLARE_CONTRACT_REJ": {
      const { actionHash } = msg.data
      const action = await actionQueue.remove(actionHash)
      if (!action) {
        throw new Error("Action not found")
      }
      const resultMessage = await handleActionRejection(action, background)
      if (resultMessage) {
        sendToTabAndUi(resultMessage)
      }
      return
    }

    case "REQUEST_DEPLOY_CONTRACT": {
      /* TODO: complete */

      /* account.estimateAccountDeployFee */

      /* return await actionQueue.remove(msg.data.actionHash) */
      return
    }
    case "REQUEST_DEPLOY_CONTRACT_REJ": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
