import { ShieldSecondaryIcon } from "@argent/x-ui/icons"
import {
  BarCloseButton,
  FlowHeader,
  NavigationContainer,
  useToast,
} from "@argent/x-ui"
import { Center } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { ESCAPE_TYPE_GUARDIAN } from "../../../../shared/account/details/escape.model"
import { IS_DEV } from "../../../../shared/utils/dev"
import { coerceErrorToString } from "../../../../shared/utils/error"
import { routes } from "../../../../shared/ui/routes"
import { useAccountGuardianIsSelf } from "../useAccountGuardian"
import { usePendingChangeGuardian } from "../usePendingChangingGuardian"
import { useRouteWalletAccount } from "../useRouteWalletAccount"
import { EscapeGuardian } from "./EscapeGuardian"
import { EscapeGuardianReady } from "./EscapeGuardianReady"
import { EscapeSigner } from "./EscapeSigner"
import {
  hideEscapeWarning,
  useAccountHasPendingCancelEscape,
  useLiveAccountEscape,
} from "./useAccountEscape"
import { accountMessagingService } from "../../../services/accountMessaging"

export const EscapeWarningScreen: FC = () => {
  const navigate = useNavigate()
  const account = useRouteWalletAccount()
  const onClose = useCallback(async () => {
    if (account) {
      await hideEscapeWarning(account)
    }
    void navigate(routes.accountTokens(), { replace: true })
  }, [account, navigate])
  const toast = useToast()
  const liveAccountEscape = useLiveAccountEscape(account)
  const accountGuardianIsSelf = useAccountGuardianIsSelf(account)
  const pending = useAccountHasPendingCancelEscape(account)
  const pendingChangeGuardian = usePendingChangeGuardian(account)

  const didTrack = useRef(false)
  useEffect(() => {
    if (!liveAccountEscape) {
      return
    }
    if (didTrack.current) {
      return
    }
    didTrack.current = true
  }, [liveAccountEscape])

  const onCancelEscape = useCallback(async () => {
    if (!account) {
      console.error("Cannot cancel escape - no account")
      return
    }

    await hideEscapeWarning(account)
    try {
      await accountMessagingService.cancelEscape(account)
    } catch (error) {
      if (IS_DEV) {
        console.warn(coerceErrorToString(error))
      }
      toast({
        title: "Unable to cancel escape",
        status: "error",
        duration: 3000,
      })
    }
  }, [account, toast])

  const onTriggerEscapeGuardian = useCallback(async () => {
    if (!account) {
      console.error("Cannot trigger escape guardian - no account")
      return
    }

    await hideEscapeWarning(account)
    try {
      await accountMessagingService.triggerEscapeGuardian(account)
    } catch (error) {
      if (IS_DEV) {
        console.warn(coerceErrorToString(error))
      }
      toast({
        title: "Unable to trigger escape guardian",
        status: "error",
        duration: 3000,
      })
    }
  }, [account, toast])

  const onEscapeAndChangeGuardian = useCallback(async () => {
    if (!account) {
      console.error("Cannot escape and change guardian - no account")
      return
    }

    await hideEscapeWarning(account)
    try {
      await accountMessagingService.escapeAndChangeGuardian(account)
    } catch (error) {
      if (IS_DEV) {
        console.warn(coerceErrorToString(error))
      }
      toast({
        title: "Unable to escape and change guardian",
        status: "error",
        duration: 3000,
      })
    }
  }, [account, toast])

  const onContinue = useCallback(() => {
    void onClose()
  }, [onClose])

  const content = useMemo(() => {
    if (pending) {
      return (
        <Center flex={1}>
          <FlowHeader
            title={"Pending Escape Transaction"}
            subtitle={"This account has a pending escape transaction"}
            isLoading
            size={"lg"}
            icon={ShieldSecondaryIcon}
          />
        </Center>
      )
    }
    if (pendingChangeGuardian) {
      return (
        <Center flex={1}>
          <FlowHeader
            title={"Pending Change Guardian"}
            subtitle={"This account has a pending change guardian transaction"}
            isLoading
            size={"lg"}
            icon={ShieldSecondaryIcon}
          />
        </Center>
      )
    }
    if (liveAccountEscape?.activeFromNowMs === 0 || accountGuardianIsSelf) {
      return (
        <EscapeGuardianReady
          accountGuardianIsSelf={accountGuardianIsSelf}
          onRemove={() => void onEscapeAndChangeGuardian()}
        />
      )
    }
    if (liveAccountEscape?.type) {
      if (liveAccountEscape.type === ESCAPE_TYPE_GUARDIAN) {
        return (
          <EscapeGuardian
            liveAccountEscape={liveAccountEscape}
            onKeep={() => void onCancelEscape()}
            onContinue={onContinue}
          />
        )
      } else {
        return (
          <EscapeSigner
            liveAccountEscape={liveAccountEscape}
            onCancel={() => void onCancelEscape()}
            onRemove={() => void onTriggerEscapeGuardian()}
          />
        )
      }
    }
    return null
  }, [
    accountGuardianIsSelf,
    liveAccountEscape,
    onCancelEscape,
    onContinue,
    onEscapeAndChangeGuardian,
    onTriggerEscapeGuardian,
    pending,
    pendingChangeGuardian,
  ])

  if (!content) {
    /** no matching state for this screen any more */
    return <Navigate to={routes.accountTokens()} replace />
  }

  return (
    <NavigationContainer
      rightButton={<BarCloseButton onClick={() => void onClose()} />}
      isAbsolute
    >
      {content}
    </NavigationContainer>
  )
}
