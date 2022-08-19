import { TokenMessage } from "../shared/messages/TokenMessage"
import { HandleMessage, UnhandledMessage } from "./background"

export const handleTokenMessaging: HandleMessage<TokenMessage> = async ({
  msg,
  background: { actionQueue },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "REQUEST_TOKEN": {
      // TODO: Check if token already exists

      const { meta } = await actionQueue.push({
        type: "REQUEST_TOKEN",
        payload: msg.data,
      })

      return sendToTabAndUi({
        type: "REQUEST_TOKEN_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "REJECT_REQUEST_TOKEN": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
