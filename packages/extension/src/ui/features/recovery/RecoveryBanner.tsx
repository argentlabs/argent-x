import { AlertButton, icons } from "@argent/ui"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes, useCurrentPathnameWithQuery } from "../../routes"

const { LockIcon } = icons

export const RecoveryBanner: FC = () => {
  const navigate = useNavigate()
  const returnTo = useCurrentPathnameWithQuery()
  return (
    <AlertButton
      colorScheme={"warning"}
      title="Set up account recovery"
      description="Click here to secure your assets"
      size="lg"
      icon={<LockIcon />}
      onClick={() => {
        navigate(routes.setupRecovery(returnTo))
      }}
    />
  )
}
