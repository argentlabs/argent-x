import { ActionMessage } from "../shared/messages/ActionMessage"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"

export const handleActionMessage: HandleMessage<ActionMessage> = async ({
  msg,
  origin,
  background: { actionService },
  respond,
}) => {
  switch (msg.type) {
    case "SIGN_MESSAGE": {
      const { meta } = await actionService.add(
        {
          type: "SIGN",
          payload: msg.data,
        },
        {
          origin,
        },
      )

      return respond({
        type: "SIGN_MESSAGE_RES",
        data: {
          actionHash: meta.hash,
        },
      })
    }

    case "SIGNATURE_FAILURE": {
      return await actionService.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
