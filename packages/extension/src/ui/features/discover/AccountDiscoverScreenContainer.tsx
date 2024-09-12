import { FC, useEffect } from "react"

import { clientDiscoverService } from "../../services/discover"
import { discoverDataView } from "../../views/discover"
import { useView } from "../../views/implementation/react"
import { AccountDiscoverScreen } from "./AccountDiscoverScreen"

export const AccountDiscoverScreenContainer: FC = () => {
  const discoverData = useView(discoverDataView)
  useEffect(() => {
    void clientDiscoverService.setViewedAt(Date.now())
  }, [])
  return <AccountDiscoverScreen newsItems={discoverData?.news} />
}
