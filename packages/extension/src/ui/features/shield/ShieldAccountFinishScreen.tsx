import { FC } from "react"

import { routes, useRouteAccountAddress } from "../../routes"
import { ShieldBaseFinishScreen } from "./ShieldBaseFinishScreen"
import { useLiveAccountGuardianState } from "./usePendingChangingGuardian"
import { useRouteAccount } from "./useRouteAccount"

export const ShieldAccountFinishScreen: FC = () => {
  const account = useRouteAccount()
  const accountAddress = useRouteAccountAddress()
  const liveAccountGuardianState = useLiveAccountGuardianState(account)
  const accountName = account ? account.name : undefined

  /** TODO: find a nice way to preserve the original 'returnTo' tab route from settings screen */
  const returnRoute = routes.editAccount(
    accountAddress,
    routes.settings(routes.accountTokens()),
  )

  return (
    <ShieldBaseFinishScreen
      accountName={accountName}
      liveAccountGuardianState={liveAccountGuardianState}
      returnRoute={returnRoute}
    />
  )
}
