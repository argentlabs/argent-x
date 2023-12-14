import { UdcMessage } from "../shared/messages/UdcMessage"

import { HandleMessage, UnhandledMessage } from "./background"

export const handleUdcMessaging: HandleMessage<UdcMessage> = async ({
  msg,
  origin,
  background: { wallet, actionService },
  respond,
}) => {
  switch (msg.type) {
    // TODO: refactor after we have a plan for inpage
    case "REQUEST_DECLARE_CONTRACT": {
      const { data } = msg
      const { address, networkId, ...rest } = data
      if (address && networkId) {
        await wallet.selectAccount({
          address,
          networkId,
        })
      }

      const action = await actionService.add(
        {
          type: "DECLARE_CONTRACT",
          payload: {
            ...rest,
          },
        },
        {
          origin,
          icon: "DocumentIcon",
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
