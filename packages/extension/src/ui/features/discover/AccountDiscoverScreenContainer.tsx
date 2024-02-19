import { FC, useEffect } from "react"

import { clientDiscoverService } from "../../services/discover"
import { discoverDataView } from "../../views/discover"
import { useView } from "../../views/implementation/react"
import { Account } from "../accounts/Account"
import { AccountDiscoverScreen } from "./AccountDiscoverScreen"

export interface AccountDiscoverScrenContainerProps {
  account: Account
}

export const AccountDiscoverScreenContainer: FC<
  AccountDiscoverScrenContainerProps
> = () => {
  const discoverData = useView(discoverDataView)
  useEffect(() => {
    void clientDiscoverService.setViewedAt(Date.now())
  }, [])
  return <AccountDiscoverScreen newsItems={discoverData?.news} />
}
