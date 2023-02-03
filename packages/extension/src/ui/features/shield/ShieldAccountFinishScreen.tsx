import { FC } from "react"

import { routes, useRouteAccountAddress } from "../../routes"
import {
  getAccountName,
  useAccountMetadata,
} from "../accounts/accountMetadata.state"
import { ShieldBaseFinishScreen } from "./ShieldBaseFinishScreen"
import { usePendingChangeGuardian } from "./usePendingChangingGuardian"
import { useRouteAccount } from "./useRouteAccount"

export const ShieldAccountFinishScreen: FC = () => {
  const account = useRouteAccount()
  const accountAddress = useRouteAccountAddress()
  const pendingChangeGuardian = usePendingChangeGuardian(account)
  const { accountNames } = useAccountMetadata()
  const accountName = account
    ? getAccountName(account, accountNames)
    : undefined

  /** TODO: find a nice way to preserve the original 'returnTo' tab route from settings screen */
  const returnRoute = routes.editAccount(
    accountAddress,
    routes.settings(routes.accountTokens()),
  )

  return (
    <ShieldBaseFinishScreen
      accountName={accountName}
      pendingChangeGuardian={pendingChangeGuardian}
      guardian={account?.guardian}
      returnRoute={returnRoute}
    />
  )
}
