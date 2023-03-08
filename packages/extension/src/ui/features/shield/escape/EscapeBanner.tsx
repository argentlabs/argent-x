import { AlertButton, icons } from "@argent/ui"
import { Spinner } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import {
  ESCAPE_SECURITY_PERIOD_DAYS,
  ESCAPE_TYPE_GUARDIAN,
} from "../../../../shared/account/details/getEscape"
import { routes } from "../../../routes"
import { Account } from "../../accounts/Account"
import { useAccountGuardianIsSelf } from "../useAccountGuardian"
import { usePendingChangeGuardian } from "../usePendingChangingGuardian"
import {
  useAccountHasPendingCancelEscape,
  useLiveAccountEscape,
} from "./useAccountEscape"

const { ArgentShieldIcon, ArgentShieldDeactivateIcon, AlertIcon } = icons

interface EscapeBannerProps {
  account: Account
}

export const getEscapeDisplayAttributes = (
  liveAccountEscape: ReturnType<typeof useLiveAccountEscape>,
) => {
  if (!liveAccountEscape) {
    return {}
  }
  const { activeFromNowMs, activeFromNowPretty, type } = liveAccountEscape
  const action = type === ESCAPE_TYPE_GUARDIAN ? "Removing" : "Changing"
  const entity = type === ESCAPE_TYPE_GUARDIAN ? "Argent Shield" : "Account Key"
  const colorScheme: "warning" | "danger" =
    type === ESCAPE_TYPE_GUARDIAN ? "warning" : "danger"
  const title =
    activeFromNowMs > 0
      ? `${action} ${entity} in ${activeFromNowPretty}`
      : `${entity} removed`
  return {
    entity,
    colorScheme,
    title,
  }
}

export const EscapeBanner: FC<EscapeBannerProps> = ({ account }) => {
  const navigate = useNavigate()
  const pending = useAccountHasPendingCancelEscape(account)
  const pendingChangeGuardian = usePendingChangeGuardian(account)
  const liveAccountEscape = useLiveAccountEscape(account)
  const accountGuardianIsSelf = useAccountGuardianIsSelf(account)
  if (pending) {
    return (
      <AlertButton
        colorScheme={"warning"}
        title={"Pending Escape Transaction"}
        description="This account has a pending escape transaction"
        size="lg"
        icon={<Spinner />}
        onClick={() => {
          navigate(routes.shieldEscapeWarning(account.address))
        }}
      />
    )
  }
  if (pendingChangeGuardian) {
    return (
      <AlertButton
        colorScheme={"warning"}
        title={"Pending Change Guardian Transaction"}
        description="This account has a pending change guardian transaction"
        size="lg"
        icon={<Spinner />}
        onClick={() => {
          navigate(routes.shieldEscapeWarning(account.address))
        }}
      />
    )
  }
  if (liveAccountEscape?.activeFromNowMs === 0 || accountGuardianIsSelf) {
    const step = accountGuardianIsSelf ? 2 : 1
    const title = `(${step}/2) Remove Argent Shield now`
    const description =
      step === 1
        ? `${ESCAPE_SECURITY_PERIOD_DAYS}-day security period is over.`
        : `Second transaction needed for completion`
    return (
      <AlertButton
        colorScheme={"warning"}
        title={title}
        description={description}
        size="lg"
        icon={<ArgentShieldDeactivateIcon />}
        onClick={() => {
          navigate(routes.shieldEscapeWarning(account.address))
        }}
      />
    )
  }
  if (!liveAccountEscape) {
    return null
  }
  const { type } = liveAccountEscape
  const { colorScheme, title } = getEscapeDisplayAttributes(liveAccountEscape)
  const icon =
    type === ESCAPE_TYPE_GUARDIAN ? <ArgentShieldIcon /> : <AlertIcon />
  return (
    <AlertButton
      colorScheme={colorScheme}
      title={title}
      description="If this was not you, click this banner"
      size="lg"
      icon={icon}
      onClick={() => {
        navigate(routes.shieldEscapeWarning(account.address))
      }}
    />
  )
}
