import { UdpMessage } from "../shared/messages/UdpMessage"
import { handleActionRejection } from "./actionHandlers"
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

    case "REQUEST_DEPLOY_CONTRACT": {
      /* TODO: complete */

      /* account.estimateAccountDeployFee */

      /* return await actionQueue.remove(msg.data.actionHash) */
      return
    }
  }

  throw new UnhandledMessage()
}
