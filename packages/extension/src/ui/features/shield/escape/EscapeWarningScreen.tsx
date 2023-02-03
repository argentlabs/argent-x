import { BarCloseButton, H1, NavigationContainer, icons } from "@argent/ui"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { ESCAPE_TYPE_GUARDIAN } from "../../../../shared/account/details/getEscape"
import { routes } from "../../../routes"
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
  const onKeepGuardian = useCallback(() => {
    console.warn("TODO: implement keep guardian")
  }, [])
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
