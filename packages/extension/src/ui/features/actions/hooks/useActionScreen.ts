import { isObject } from "lodash-es"
import { useCallback, useEffect } from "react"

import { uiService } from "../../../../shared/__new/services/ui"
import { clientActionService } from "../../../services/action"
import { analytics } from "../../../services/analytics"
import { selectedAccountView } from "../../../views/account"
import { currentActionView, isLastActionView } from "../../../views/actions"
import { useView } from "../../../views/implementation/react"
import { focusExtensionTab, useExtensionIsInTab } from "../../browser/tabs"
import { getOriginatingHost } from "../../browser/useOriginatingHost"

export const useActionScreen = () => {
  const selectedAccount = useView(selectedAccountView)
  const extensionIsInTab = useExtensionIsInTab()

  const action = useView(currentActionView)
  const isLastAction = useView(isLastActionView)

  const closePopupIfLastAction = useCallback(() => {
    if (isLastAction) {
      void uiService.closeFloatingWindow()
    }
  }, [isLastAction])

  const approve = useCallback(async () => {
    const result = action
      ? await clientActionService.approveAndWait(action)
      : undefined
    return result
  }, [action])

  const approveAndClose = useCallback(async () => {
    const result = await approve()
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      closePopupIfLastAction()
    }
  }, [closePopupIfLastAction, approve])

  const reject = useCallback(async () => {
    /** TODO: refactor: move tracking into service or action handler */
    void analytics.track("rejectedTransaction", {
      networkId: selectedAccount?.networkId || "unknown",
      host: await getOriginatingHost(),
    })
    action && void clientActionService.reject(action.meta.hash)
  }, [action, selectedAccount?.networkId])

  const rejectAndClose = useCallback(async () => {
    await reject()
    closePopupIfLastAction()
  }, [reject, closePopupIfLastAction])

  const rejectAllActions = useCallback(async () => {
    await clientActionService.rejectAll()
    void uiService.closeFloatingWindow()
  }, [])

  /** Focus the extension if it is running in a tab  */
  useEffect(() => {
    const init = async () => {
      if (extensionIsInTab) {
        await focusExtensionTab()
      }
    }
    void init()
  }, [extensionIsInTab, action?.type])

  return {
    action,
    selectedAccount,
    approve,
    approveAndClose,
    reject: rejectAndClose,
    rejectWithoutClose: reject,
    rejectAllActions,
    closePopupIfLastAction,
  }
}
