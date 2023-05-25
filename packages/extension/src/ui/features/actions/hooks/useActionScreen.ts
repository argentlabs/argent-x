import { useCallback, useEffect } from "react"

import { analytics } from "../../../services/analytics"
import {
  approveAction,
  rejectAction,
} from "../../../services/backgroundActions"
import { useSelectedAccount } from "../../accounts/accounts.state"
import { EXTENSION_IS_POPUP } from "../../browser/constants"
import { focusExtensionTab, useExtensionIsInTab } from "../../browser/tabs"
import { getOriginatingHost } from "../../browser/useOriginatingHost"
import { useActions } from "../actions.state"

export const useActionScreen = () => {
  const account = useSelectedAccount()
  const extensionIsInTab = useExtensionIsInTab()
  const actions = useActions()

  const [action] = actions
  const isLastAction = actions.length === 1

  const closePopup = useCallback(() => {
    if (EXTENSION_IS_POPUP) {
      window.close()
    }
  }, [])

  const closePopupIfLastAction = useCallback(() => {
    if (isLastAction) {
      closePopup()
    }
  }, [closePopup, isLastAction])

  const onSubmit = useCallback(async () => {
    await approveAction(action)
    closePopupIfLastAction()
  }, [action, closePopupIfLastAction])

  const onReject = useCallback(async () => {
    await analytics.track("rejectedTransaction", {
      networkId: account?.networkId || "unknown",
      host: await getOriginatingHost(),
    })
    await rejectAction(action.meta.hash)
    closePopupIfLastAction()
  }, [action, closePopupIfLastAction, account?.networkId])

  const rejectAllActions = useCallback(async () => {
    await rejectAction(actions.map((act) => act.meta.hash))
    closePopup()
  }, [actions, closePopup])

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
    onSubmit,
    onReject,
    rejectAllActions,
    closePopupIfLastAction,
  }
}
