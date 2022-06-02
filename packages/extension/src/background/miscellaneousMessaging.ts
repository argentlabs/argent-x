import { MiscenalleousMessage as MiscellaneousMessage } from "../shared/messages/MiscellaneousMessage"
import { sendMessageToUi } from "./activeTabs"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { openUi } from "./openUi"
import { clearStorage } from "./storage"

export const handleMiscellaneousMessage: HandleMessage<
  MiscellaneousMessage
> = async ({
  msg,
  background: { wallet },
  messagingKeys: { publicKeyJwk },
  sendToTabAndUi,
}) => {
  switch (msg.type) {
    case "OPEN_UI": {
      return openUi()
    }

    case "RESET_ALL": {
      clearStorage()
      wallet.reset()
      return sendToTabAndUi({ type: "DISCONNECT_ACCOUNT" })
    }

    case "GET_MESSAGING_PUBLIC_KEY": {
      return sendMessageToUi({
        type: "GET_MESSAGING_PUBLIC_KEY_RES",
        data: publicKeyJwk,
      })
    }
  }

  throw new UnhandledMessage()
}
