import { isObject } from "lodash-es"
import { useCallback, useEffect } from "react"

import { uiService } from "../../../../shared/ui"
import { clientActionService } from "../../../services/action"
import { selectedAccountView } from "../../../views/account"
import { currentActionView, isLastActionView } from "../../../views/actions"
import { useView } from "../../../views/implementation/react"
import { focusExtensionTab, useExtensionIsInTab } from "../../browser/tabs"
import { EnrichedSimulateAndReview } from "@argent/x-shared/simulation"
import { ActionItemExtra } from "../../../../shared/actionQueue/schema"

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

  const updateTransactionReview = useCallback(
    async (transactionReview?: EnrichedSimulateAndReview) => {
      if (!action || !transactionReview) {
        return
      }
      await clientActionService.updateTransactionReview({
        actionHash: action.meta.hash,
        transactionReview,
      })
    },
    [action],
  )

  const approve = useCallback(
    async (extra?: ActionItemExtra) => {
      const result = action
        ? await clientActionService.approveAndWait({
            actionHash: action.meta.hash,
            extra,
          })
        : undefined
      return result
    },
    [action],
  )

  const approveAndClose = useCallback(async () => {
    const result = await approve()
    if (isObject(result) && "error" in result) {
      // stay on error screen
    } else {
      closePopupIfLastAction()
    }
  }, [closePopupIfLastAction, approve])

  const reject = useCallback(async () => {
    action && void clientActionService.reject(action.meta.hash)
  }, [action])

  const rejectAndClose = useCallback(async () => {
    await reject()
    closePopupIfLastAction()
  }, [reject, closePopupIfLastAction])

  const rejectAllActions = useCallback(async () => {
    await clientActionService.rejectAll()
    void uiService.closeFloatingWindow()
  }, [])

  const rejectActionWithHash = useCallback(
    async (actionHash: string) => {
      await clientActionService.reject(actionHash)
      closePopupIfLastAction()
    },
    [closePopupIfLastAction],
  )

  const clearActionError = useCallback((actionHash: string) => {
    return clientActionService.clearActionError(actionHash)
  }, [])

  const clearLastActionError = useCallback(async () => {
    if (action) {
      await clearActionError(action.meta.hash)
    }
  }, [action, clearActionError])

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
    rejectActionWithHash,
    rejectAllActions,
    closePopupIfLastAction,
    updateTransactionReview,
    clearActionError,
    clearLastActionError,
  }
}
