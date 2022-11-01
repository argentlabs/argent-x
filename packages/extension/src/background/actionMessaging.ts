import { ActionMessage } from "../shared/messages/ActionMessage"
import { handleActionApproval, handleActionRejection } from "./actionHandlers"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"

export const handleActionMessage: HandleMessage<ActionMessage> = async ({
  msg,
  background,
  sendToTabAndUi,
}) => {
  const { actionQueue } = background

  switch (msg.type) {
    case "GET_ACTIONS": {
      const actions = await actionQueue.getAll()
      return sendToTabAndUi({
        type: "GET_ACTIONS_RES",
        data: actions,
      })
    }

    case "APPROVE_ACTION": {
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

    case "REJECT_ACTION": {
      const payload = msg.data.actionHash

      const actionHashes = Array.isArray(payload) ? payload : [payload]

      const actions = await Promise.all(
        actionHashes.map((actionHash) => actionQueue.remove(actionHash)),
      )

      if (!actions) {
        throw new Error("Action not found")
      }

      const resultMessages = (
        await Promise.all(
          actions.map(
            // Using conditional here to stop TS from complaining
            (action) => action && handleActionRejection(action, background),
          ),
        )
      ).filter((res) => !!res)

      if (resultMessages) {
        await Promise.all(
          resultMessages.map(
            // Using conditional here to stop TS from complaining
            (resultMessage) => resultMessage && sendToTabAndUi(resultMessage),
          ),
        )
      }
      return
    }

    case "SIGN_MESSAGE": {
      const { meta } = await actionQueue.push({
        type: "SIGN",
        payload: msg.data,
      })

      return sendToTabAndUi({
        type: "SIGN_MESSAGE_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "SIGNATURE_FAILURE": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
