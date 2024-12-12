import type { FC } from "react"

import { useUpdateAccountsOnChainEscapeState } from "../../accounts/accounts.service"
import { useAccountEscapeWarning } from "./useAccountEscape"

/**
 * If Argent Guardian is enabled, trigger period escape state checks and show a warning on new account escape
 */

export const UseAccountEscapeWarning: FC = () => {
  useUpdateAccountsOnChainEscapeState()
  useAccountEscapeWarning()
  return null
}
