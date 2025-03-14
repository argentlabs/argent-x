import { uiService } from "../shared/ui"
import type { PreAuthorizationMessage } from "../shared/messages/PreAuthorisationMessage"
import { Opened, backgroundUIService } from "./services/ui"
import { UnhandledMessage } from "./background"
import type { HandleMessage } from "./background"
import { preAuthorizationService } from "../shared/preAuthorization"
import { respondToHost } from "./respond"

export const handlePreAuthorizationMessage: HandleMessage<
  PreAuthorizationMessage
> = async ({ msg, origin, background: { wallet, actionService }, respond }) => {
  switch (msg.type) {
    case "CONNECT_DAPP": {
      let selectedAccount = await wallet.getSelectedAccount()
      let didOpenProgramatically = false

      const silent = msg.data?.silent ?? false
      if (silent) {
        /** If asked for silent connection, just check if an account is selected and isPreAuthorized
         * Do not open the UI to unlock the wallet or prompt the user to connect to the dapp
         */
        if (
          selectedAccount &&
          (await preAuthorizationService.isPreAuthorized({
            account: selectedAccount,
            host: origin,
          }))
        ) {
          return respondToHost(
            {
              type: "CONNECT_DAPP_RES",
              data: selectedAccount,
            },
            origin,
          )
        }
        return respond({
          type: "REJECT_PREAUTHORIZATION",
        })
      }

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
          if (await backgroundUIService.hasPopup()) {
            await backgroundUIService.closePopup()
          }
        }

        return respondToHost(
          {
            type: "CONNECT_DAPP_RES",
            data: selectedAccount,
          },
          origin,
        )
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
