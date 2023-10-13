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
          type: "DECLARE_CONTRACT_ACTION",
          payload: {
            ...rest,
          },
        },
        {
          origin,
        },
      )

      return respond({
        type: "REQUEST_DECLARE_CONTRACT_RES",
        data: {
          actionHash: action.meta.hash,
        },
      })
    }

    // TODO: refactor after refactoring actionHandlers
    case "REQUEST_DEPLOY_CONTRACT": {
      const { data } = msg
      const {
        address,
        networkId,
        classHash,
        constructorCalldata,
        salt,
        unique,
      } = data
      await wallet.selectAccount({ address, networkId })

      const action = await actionService.add(
        {
          type: "DEPLOY_CONTRACT_ACTION",
          payload: {
            classHash: classHash.toString(),
            constructorCalldata,
            salt,
            unique,
          },
        },
        {
          origin,
        },
      )

      return respond({
        type: "REQUEST_DEPLOY_CONTRACT_RES",
        data: {
          actionHash: action.meta.hash,
        },
      })
    }
  }

  throw new UnhandledMessage()
}
