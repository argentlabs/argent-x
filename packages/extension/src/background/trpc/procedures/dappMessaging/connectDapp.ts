import type { IPreAuthorizationService } from "../../../../shared/preAuthorization/IPreAuthorizationService"
import type { IUIService } from "../../../../shared/ui/IUIService"
import type { IBackgroundActionService } from "../../../services/action/IBackgroundActionService"
import { Opened } from "../../../services/ui"
import type { IBackgroundUIService } from "../../../services/ui/IBackgroundUIService"
import { Wallet } from "../../../wallet"
import type { ConnectDappInput } from "./schema"

export const connectDapp = async ({
  input,
  wallet,
  preAuthorizationService,
  backgroundUIService,
  actionService,
  uiService,
}: {
  wallet: Wallet
  input: ConnectDappInput
  preAuthorizationService: IPreAuthorizationService
  backgroundUIService: IBackgroundUIService
  actionService: IBackgroundActionService
  uiService: IUIService
}) => {
  let selectedAccount = await wallet.getSelectedAccount()
  let didOpenProgramatically = false
  const silent = input.silent ?? false
  if (silent) {
    /** If asked for silent connection, just check if an account is selected and isPreAuthorized
     * Do not open the UI to unlock the wallet or prompt the user to connect to the dapp
     */
    if (
      selectedAccount &&
      (await preAuthorizationService.isPreAuthorized({
        account: selectedAccount,
        host: input.origin ?? "",
      }))
    ) {
      return selectedAccount
    }
    return
  }

  if (!selectedAccount) {
    didOpenProgramatically = true
    const openAndUnlocked = await backgroundUIService.openUiAndUnlock()
    selectedAccount = await wallet.getSelectedAccount()
    if (!openAndUnlocked || !selectedAccount) {
      return
    }
  }

  const isAuthorized = await preAuthorizationService.isPreAuthorized({
    account: selectedAccount,
    host: input.origin ?? "",
  })

  if (!isAuthorized) {
    /** Prompt user to connect to dapp */
    const action = await actionService.add(
      {
        type: "CONNECT_DAPP",
        payload: { host: input.origin ?? "" },
      },
      {
        origin: input.origin ?? "",
      },
    )
    didOpenProgramatically = true
    const openAndUnlocked = await backgroundUIService.openUiAndUnlock()
    if (!openAndUnlocked) {
      return
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

    return selectedAccount
  }
}
