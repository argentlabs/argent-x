import {
  BarCloseButton,
  H1,
  NavigationContainer,
  icons,
  useToast,
} from "@argent/ui"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { ESCAPE_TYPE_GUARDIAN } from "../../../../shared/account/details/getEscape"
import { IS_DEV } from "../../../../shared/utils/dev"
import { coerceErrorToString } from "../../../../shared/utils/error"
import { routes } from "../../../routes"
import { accountCancelEscape } from "../../../services/backgroundAccounts"
import { useRouteAccount } from "../useRouteAccount"
import { EscapeGuardian } from "./EscapeGuardian"
import { EscapeSigner } from "./EscapeSigner"
import { useLiveAccountEscape } from "./useAccountEscape"

export const EscapeWarningScreen: FC = () => {
  const navigate = useNavigate()
  const account = useRouteAccount()
  const onClose = useCallback(() => {
    navigate(routes.accountTokens())
  }, [navigate])
  const toast = useToast()

  const onKeepGuardian = useCallback(async () => {
    if (!account) {
      console.error("Cannot cancel escape - no account")
      return
    }
    try {
      await accountCancelEscape(account)
    } catch (error) {
      IS_DEV && console.warn(coerceErrorToString(error))
      toast({
        title: "Unable to cancel escape",
        status: "error",
        duration: 3000,
      })
    }
  }, [account, toast])

  const { data: liveAccountEscape } = useLiveAccountEscape(account)
  if (!liveAccountEscape) {
    return null
  }
  const { type } = liveAccountEscape
  return (
    <NavigationContainer
      rightButton={<BarCloseButton onClick={onClose} />}
      isAbsolute
    >
      {type === ESCAPE_TYPE_GUARDIAN ? (
        <EscapeGuardian
          liveAccountEscape={liveAccountEscape}
          onKeep={onKeepGuardian}
          onContinue={onClose}
        />
      ) : (
        <EscapeSigner liveAccountEscape={liveAccountEscape} />
      )}
    </NavigationContainer>
  )
}
