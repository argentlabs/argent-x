import {
  BarCloseButton,
  FlowHeader,
  NavigationContainer,
  icons,
  useToast,
} from "@argent/ui"
import { Center } from "@chakra-ui/react"
import { FC, useCallback, useEffect, useMemo, useRef } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { ESCAPE_TYPE_GUARDIAN } from "../../../../shared/account/details/escape.model"
import { IS_DEV } from "../../../../shared/utils/dev"
import { coerceErrorToString } from "../../../../shared/utils/error"
import { routes } from "../../../routes"
import { analytics } from "../../../services/analytics"
import { useAccountGuardianIsSelf } from "../useAccountGuardian"
import { usePendingChangeGuardian } from "../usePendingChangingGuardian"
import { useRouteAccount } from "../useRouteAccount"
import { EscapeGuardian } from "./EscapeGuardian"
import { EscapeGuardianReady } from "./EscapeGuardianReady"
import { EscapeSigner } from "./EscapeSigner"
import {
  hideEscapeWarning,
  useAccountHasPendingCancelEscape,
  useLiveAccountEscape,
} from "./useAccountEscape"
import { accountMessagingService } from "../../../services/accountMessaging"

const { ArgentShieldIcon } = icons

export const EscapeWarningScreen: FC = () => {
  const navigate = useNavigate()
  const account = useRouteAccount()
  const onClose = useCallback(async () => {
    account && (await hideEscapeWarning(account))
    navigate(routes.accountTokens())
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
    const escapeId =
      liveAccountEscape?.type === ESCAPE_TYPE_GUARDIAN
        ? "escapeGuardian"
        : "escapeSigner"
    analytics.track("argentShieldEscapeScreenSeen", {
      escapeId,
      remainingTime: liveAccountEscape.activeFromNowMs,
    })
  }, [liveAccountEscape])

  const onCancelEscape = useCallback(async () => {
    if (!account) {
      console.error("Cannot cancel escape - no account")
      return
    }
    if (liveAccountEscape) {
      if (liveAccountEscape.type === ESCAPE_TYPE_GUARDIAN) {
        analytics.track("argentShieldEscapeScreenAction", {
          escapeId: "escapeGuardian",
          remainingTime: liveAccountEscape.activeFromNowMs,
          action: "keepArgentShield",
        })
      } else {
        analytics.track("argentShieldEscapeScreenAction", {
          escapeId: "escapeSigner",
          remainingTime: liveAccountEscape.activeFromNowMs,
          action: "cancelKeyChange",
        })
      }
    }
    await hideEscapeWarning(account)
    try {
      await accountMessagingService.cancelEscape(account)
    } catch (error) {
      IS_DEV && console.warn(coerceErrorToString(error))
      toast({
        title: "Unable to cancel escape",
        status: "error",
        duration: 3000,
      })
    }
  }, [account, liveAccountEscape, toast])

  const onTriggerEscapeGuardian = useCallback(async () => {
    if (!account) {
      console.error("Cannot trigger escape guardian - no account")
      return
    }
    analytics.track("argentShieldEscapeScreenAction", {
      escapeId: "escapeSigner",
      remainingTime: liveAccountEscape?.activeFromNowMs || 0,
      action: "startRemoval",
    })
    await hideEscapeWarning(account)
    try {
      await accountMessagingService.triggerEscapeGuardian(account)
    } catch (error) {
      IS_DEV && console.warn(coerceErrorToString(error))
      toast({
        title: "Unable to trigger escape guardian",
        status: "error",
        duration: 3000,
      })
    }
  }, [account, liveAccountEscape, toast])

  const onEscapeAndChangeGuardian = useCallback(async () => {
    if (!account) {
      console.error("Cannot escape and change guardian - no account")
      return
    }
    analytics.track("argentShieldEscapeScreenAction", {
      escapeId: "escapeGuardian",
      remainingTime: liveAccountEscape?.activeFromNowMs || 0,
      action: accountGuardianIsSelf
        ? "continueWithRemoval"
        : "removeArgentShield",
    })

    await hideEscapeWarning(account)
    try {
      await accountMessagingService.escapeAndChangeGuardian(account)
    } catch (error) {
      IS_DEV && console.warn(coerceErrorToString(error))
      toast({
        title: "Unable to escape and change guardian",
        status: "error",
        duration: 3000,
      })
    }
  }, [account, accountGuardianIsSelf, liveAccountEscape, toast])

  const onContinue = useCallback(() => {
    analytics.track("argentShieldEscapeScreenAction", {
      escapeId: "escapeGuardian",
      remainingTime: liveAccountEscape?.activeFromNowMs || 0,
      action: "continueWithRemoval",
    })
    onClose()
  }, [liveAccountEscape?.activeFromNowMs, onClose])

  const content = useMemo(() => {
    if (pending) {
      return (
        <Center flex={1}>
          <FlowHeader
            title={"Pending Escape Transaction"}
            subtitle={"This account has a pending escape transaction"}
            isLoading
            size={"lg"}
            icon={ArgentShieldIcon}
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
            icon={ArgentShieldIcon}
          />
        </Center>
      )
    }
    if (liveAccountEscape?.activeFromNowMs === 0 || accountGuardianIsSelf) {
      return (
        <EscapeGuardianReady
          accountGuardianIsSelf={accountGuardianIsSelf}
          onRemove={onEscapeAndChangeGuardian}
        />
      )
    }
    if (liveAccountEscape?.type) {
      if (liveAccountEscape.type === ESCAPE_TYPE_GUARDIAN) {
        return (
          <EscapeGuardian
            liveAccountEscape={liveAccountEscape}
            onKeep={onCancelEscape}
            onContinue={onContinue}
          />
        )
      } else {
        return (
          <EscapeSigner
            liveAccountEscape={liveAccountEscape}
            onCancel={onCancelEscape}
            onRemove={onTriggerEscapeGuardian}
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
      rightButton={<BarCloseButton onClick={onClose} />}
      isAbsolute
    >
      {content}
    </NavigationContainer>
  )
}
