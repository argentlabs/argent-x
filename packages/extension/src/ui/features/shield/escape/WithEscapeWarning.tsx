import { FC, PropsWithChildren } from "react"

import { ARGENT_SHIELD_ENABLED } from "../../../../shared/shield/constants"
import { useUpdateAccountsOnChainEscapeState } from "../../accounts/accounts.service"
import { useAccountEscapeWarning } from "./useAccountEscape"

/**
 * If Argent Shield is enabled, trigger period escape state checks and show a warning on new account escape
 */

export const WithEscapeWarning: FC<PropsWithChildren> = ({ children }) => {
  return ARGENT_SHIELD_ENABLED ? (
    <WithArgentShieldEnabledEscapeWarning>
      {children}
    </WithArgentShieldEnabledEscapeWarning>
  ) : (
    <>{children}</>
  )
}

const WithArgentShieldEnabledEscapeWarning: FC<PropsWithChildren> = ({
  children,
}) => {
  useUpdateAccountsOnChainEscapeState()
  useAccountEscapeWarning()
  return <>{children}</>
}
