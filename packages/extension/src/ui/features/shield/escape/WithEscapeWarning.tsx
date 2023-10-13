import { FC, PropsWithChildren } from "react"

import { useUpdateAccountsOnChainEscapeState } from "../../accounts/accounts.service"
import { useAccountEscapeWarning } from "./useAccountEscape"

/**
 * If Argent Shield is enabled, trigger period escape state checks and show a warning on new account escape
 */

export const WithEscapeWarning: FC<PropsWithChildren> = ({ children }) => {
  useUpdateAccountsOnChainEscapeState()
  useAccountEscapeWarning()
  return <>{children}</>
}
