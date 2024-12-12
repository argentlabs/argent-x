import type { FC } from "react"

import { routes } from "../../../shared/ui/routes"
import { SmartAccountBaseFinishScreen } from "./SmartAccountBaseFinishScreen"
import { useLiveAccountGuardianState } from "./usePendingChangingGuardian"
import { useRouteWalletAccount } from "./useRouteWalletAccount"

export const SmartAccountFinishScreen: FC = () => {
  const account = useRouteWalletAccount()
  const liveAccountGuardianState = useLiveAccountGuardianState(account)
  const accountName = account ? account.name : undefined

  if (!account) {
    return
  }

  /** TODO: find a nice way to preserve the original 'returnTo' tab route from settings screen */
  const returnRoute = routes.settingsAccount(
    account.id,
    routes.settings(routes.accountTokens()),
  )

  return (
    <SmartAccountBaseFinishScreen
      accountName={accountName}
      liveAccountGuardianState={liveAccountGuardianState}
      returnRoute={returnRoute}
    />
  )
}
