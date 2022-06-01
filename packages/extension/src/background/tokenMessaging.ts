import { TokenMessage } from "../shared/messages/TokenMessage"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { addToken, getTokens, hasToken, removeToken } from "./tokens"

export const handleTokenMessage: HandleMessage<TokenMessage> = async ({
  msg,
  background: { actionQueue },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "REQUEST_TOKEN": {
      const exists = await hasToken(msg.data.address)
      if (exists) {
        return sendToTabAndUi({ type: "REQUEST_TOKEN_RES", data: {} })
      }
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

    case "GET_TOKENS": {
      const tokens = await getTokens()
      return sendToTabAndUi({
        type: "GET_TOKENS_RES",
        data: tokens,
      })
    }

    case "REMOVE_TOKEN": {
      const address = msg.data
      const { success, tokens } = await removeToken(address)
      if (success) {
        return sendToTabAndUi({
          type: "UPDATE_TOKENS",
          data: tokens,
        })
      }
      return sendToTabAndUi({
        type: "REMOVE_TOKEN_RES",
        data: success,
      })
    }

    case "ADD_TOKEN": {
      const token = msg.data
      try {
        const { success, tokens } = await addToken(token)
        if (success) {
          return sendToTabAndUi({
            type: "UPDATE_TOKENS",
            data: tokens,
          })
        }
        return sendToTabAndUi({
          type: "ADD_TOKEN_RES",
          data: success,
        })
      } catch {
        return sendToTabAndUi({
          type: "ADD_TOKEN_REJ",
        })
      }
    }

    case "REJECT_REQUEST_TOKEN": {
      return await actionQueue.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
