import { BarCloseButton, NavigationContainer, useToast } from "@argent/ui"
import { Center } from "@chakra-ui/react"
import { FC, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { constants } from "starknet"

import { ESCAPE_TYPE_GUARDIAN } from "../../../../shared/account/details/getEscape"
import { IS_DEV } from "../../../../shared/utils/dev"
import { coerceErrorToString } from "../../../../shared/utils/error"
import { routes } from "../../../routes"
import {
  accountCancelEscape,
  accountChangeGuardian,
} from "../../../services/backgroundAccounts"
import { ShieldHeader } from "../ui/ShieldHeader"
import { useRouteAccount } from "../useRouteAccount"
import { EscapeGuardian } from "./EscapeGuardian"
import { EscapeSigner } from "./EscapeSigner"
import {
  useAccountHasPendingCancelEscape,
  useLiveAccountEscape,
} from "./useAccountEscape"

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

  const onRemoveGuardian = useCallback(async () => {
    if (!account) {
      console.error("Cannot remove guardian - no account")
      return
    }
    try {
      await accountChangeGuardian(account, constants.ZERO.toString())
    } catch (error) {
      IS_DEV && console.warn(coerceErrorToString(error))
      toast({
        title: "Unable to remove guardian",
        status: "error",
        duration: 3000,
      })
    }
  }, [account, toast])

  const liveAccountEscape = useLiveAccountEscape(account)
  const pending = useAccountHasPendingCancelEscape(account)
  if (pending) {
    return (
      <NavigationContainer
        rightButton={<BarCloseButton onClick={onClose} />}
        isAbsolute
      >
        <Center flex={1}>
          <ShieldHeader
            title={"Pending Escape Transaction"}
            subtitle={"This account has a pending escape transaction"}
            isLoading
            size={"lg"}
          />
        </Center>
      </NavigationContainer>
    )
  }
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
        <EscapeSigner
          liveAccountEscape={liveAccountEscape}
          onRemove={onRemoveGuardian}
        />
      )}
    </NavigationContainer>
  )
}
