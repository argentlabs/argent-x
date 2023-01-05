import { AlertDialog } from "@argent/ui"
import { FC, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../routes"
import { useActions } from "../actions/actions.state"
import { ActionScreen } from "../actions/ActionScreen"
import { EXTENSION_IS_POPUP } from "../browser/constants"
import { useExtensionIsInTab, useFocusExtensionIfInTab } from "../browser/tabs"
import { recover } from "../recovery/recovery.service"
import { ShieldBaseEmailScreen } from "./ShieldBaseEmailScreen"

export const ShieldActionEmailScreen: FC = () => {
  const navigate = useNavigate()
  const [userAborted, setUserAborted] = useState(false)
  const [alertDialogIsOpen, setAlertDialogIsOpen] = useState(false)
  const actions = useActions()
  const extensionIsInTab = useExtensionIsInTab()
  useFocusExtensionIfInTab()

  const onAlertDialogCancel = useCallback(() => {
    setAlertDialogIsOpen(false)
  }, [])

  const onAlertDialogConfirm = useCallback(() => {
    setAlertDialogIsOpen(false)
    setUserAborted(true)
  }, [])

  const onCancel = useCallback(() => {
    setAlertDialogIsOpen(true)
  }, [])

  const onEmailRequested = useCallback(
    (email: string) => {
      navigate(routes.shieldActionOTP(email))
    },
    [navigate],
  )

  useEffect(() => {
    ;(async () => {
      if (!actions.length) {
        /** User cancelled all actions */
        if (EXTENSION_IS_POPUP) {
          window.close()
        } else {
          /** must navigate away from current explicit route - return to natural entry screen */
          navigate(await recover())
        }
      }
    })()
  }, [actions.length, extensionIsInTab, navigate])

  if (userAborted) {
    /** Still allows user access to the tx review screen */
    return <ActionScreen />
  }

  return (
    <>
      <AlertDialog
        isOpen={alertDialogIsOpen}
        title={"Argent Shield 2FA"}
        message={
          "This account is protected by Argent Shield and cannot sign transactions without 2FA"
        }
        cancelTitle={"Abort 2FA"}
        onCancel={onAlertDialogConfirm}
        confirmTitle={"Continue"}
        onConfirm={onAlertDialogCancel}
      />
      <ShieldBaseEmailScreen
        onCancel={onCancel}
        onEmailRequested={onEmailRequested}
      />
    </>
  )
}
