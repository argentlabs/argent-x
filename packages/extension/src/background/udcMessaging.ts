import type { UdcMessage } from "../shared/messages/UdcMessage"

import type { HandleMessage } from "./background"
import { UnhandledMessage } from "./background"

export const handleUdcMessaging: HandleMessage<UdcMessage> = async ({
  msg,
  background: { wallet, actionService },
  respond,
}) => {
  switch (msg.type) {
    // TODO: refactor after we have a plan for inpage
    case "REQUEST_DECLARE_CONTRACT": {
      const { data } = msg
      const { account, payload } = data
      if (account) {
        await wallet.selectAccount(account.id)
      }

      const action = await actionService.add(
        {
          type: "DECLARE_CONTRACT",
          payload,
        },
        {
          title: "Declare Contract",
          icon: "LegalPrimaryIcon",
        },
      )

      return respond({
        type: "REQUEST_DECLARE_CONTRACT_RES",
        data: {
          actionHash: action.meta.hash,
        },
      })
    }
  }

  throw new UnhandledMessage()
}
