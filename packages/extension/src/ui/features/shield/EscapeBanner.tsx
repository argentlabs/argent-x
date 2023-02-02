import { AlertButton, icons } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes, useCurrentPathnameWithQuery } from "../../routes"
import { Account } from "../accounts/Account"
import { useLiveAccountEscape } from "./useAccountEscape"

const { ArgentShieldIcon } = icons

interface EscapeBannerProps {
  account: Account
}

export const EscapeBanner: FC<EscapeBannerProps> = ({ account }) => {
  const navigate = useNavigate()
  const returnTo = useCurrentPathnameWithQuery()
  const { data: liveAccountEscape } = useLiveAccountEscape(account)
  if (!liveAccountEscape) {
    return null
  }
  const { activeFromNowMs, activeFromNowPretty } = liveAccountEscape
  const title =
    activeFromNowMs > 0
      ? `Removing Argent Shield in ${activeFromNowPretty}`
      : "Argent Shield removed"
  return (
    <AlertButton
      colorScheme={"warning"}
      title={title}
      description="If this was not you, click this banner"
      size="lg"
      icon={<ArgentShieldIcon />}
      onClick={() => {
        navigate(routes.setupRecovery(returnTo))
      }}
    />
  )
}
