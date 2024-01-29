import browser from "webextension-polyfill"

import { uiService } from "../shared/__new/services/ui"
import { PreAuthorisationMessage } from "../shared/messages/PreAuthorisationMessage"
import { Opened, backgroundUIService } from "./__new/services/ui"
import { UnhandledMessage } from "./background"
import { HandleMessage } from "./background"
import { preAuthorizationService } from "../shared/preAuthorization/service"

export function getOriginFromSender(
  sender: browser.runtime.MessageSender,
): string {
  const url = sender.origin ?? sender.url
  if (!url) {
    throw new Error("Message sender has no origin or url")
  }
  const { origin } = new URL(url) // Firefox uses url, Chrome uses origin
  return origin
}

export const handlePreAuthorizationMessage: HandleMessage<
  PreAuthorisationMessage
> = async ({ msg, origin, background: { wallet, actionService }, respond }) => {
  switch (msg.type) {
    case "CONNECT_DAPP": {
      let selectedAccount = await wallet.getSelectedAccount()
      let didOpenProgramatically = false

      if (!selectedAccount) {
        didOpenProgramatically = true
        const openAndUnlocked = await backgroundUIService.openUiAndUnlock()
        selectedAccount = await wallet.getSelectedAccount()
        if (!openAndUnlocked || !selectedAccount) {
          return respond({
            type: "REJECT_PREAUTHORIZATION",
          })
        }
      }

      const isAuthorized = await preAuthorizationService.isPreAuthorized({
        account: selectedAccount,
        host: origin,
      })

      if (!isAuthorized) {
        /** Prompt user to connect to dapp */
        const action = await actionService.add(
          {
            type: "CONNECT_DAPP",
            payload: { host: origin },
          },
          {
            origin,
          },
        )
        didOpenProgramatically = true
        const openAndUnlocked = await backgroundUIService.openUiAndUnlock()
        if (!openAndUnlocked) {
          return respond({
            type: "REJECT_PREAUTHORIZATION",
          })
        }
        /** Special case for CONNECT_DAPP - treat closing extension as rejection, in order to cleanly reset dapp */
        void backgroundUIService.emitter.once(Opened).then(() => {
          if (!backgroundUIService.opened) {
            void actionService.reject(action.meta.hash)
          }
        })
      }

      if (isAuthorized && selectedAccount?.address) {
        if (didOpenProgramatically) {
          /** user unlocked, close the ui */
          if (await uiService.hasFloatingWindow()) {
            await uiService.closeFloatingWindow()
          }
          if (uiService.hasPopup()) {
            uiService.closePopup()
          }
        }
        return respond({
          type: "CONNECT_DAPP_RES",
          data: selectedAccount,
        })
      }

      return
    }

    case "IS_PREAUTHORIZED": {
      const selectedAccount = await wallet.getSelectedAccount()

      if (!selectedAccount) {
        return respond({ type: "IS_PREAUTHORIZED_RES", data: false })
      }

      const valid = await preAuthorizationService.isPreAuthorized({
        account: selectedAccount,
        host: origin,
      })

      return respond({ type: "IS_PREAUTHORIZED_RES", data: valid })
    }
  }

  throw new UnhandledMessage()
}
