import { AccountMessage } from "../shared/messages/AccountMessage"
import { HandleMessage, UnhandledMessage } from "./background"

export const handleAccountMessage: HandleMessage<AccountMessage> = async ({
  msg,
  background: { actionService },
}) => {
  switch (msg.type) {
    // TODO: refactor after we refactor actionHandlers.ts
    case "DEPLOY_ACCOUNT_ACTION_FAILED": {
      return await actionService.remove(msg.data.actionHash)
    }
  }

  throw new UnhandledMessage()
}
