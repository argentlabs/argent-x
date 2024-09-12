import { FC } from "react"

import { useRouteAccountAddress } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { SmartAccountBaseFinishScreen } from "./SmartAccountBaseFinishScreen"
import { useLiveAccountGuardianState } from "./usePendingChangingGuardian"
import { useRouteWalletAccount } from "./useRouteWalletAccount"

export const SmartAccountFinishScreen: FC = () => {
  const account = useRouteWalletAccount()
  const accountAddress = useRouteAccountAddress()
  const liveAccountGuardianState = useLiveAccountGuardianState(account)
  const accountName = account ? account.name : undefined

  /** TODO: find a nice way to preserve the original 'returnTo' tab route from settings screen */
  const returnRoute = routes.settingsAccount(
    accountAddress,
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
