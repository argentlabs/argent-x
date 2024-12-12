import type { FC, ReactNode } from "react"

import { activityForAccountView } from "../../views/activityCache"
import { useView } from "../../views/implementation/react"
import type { WalletAccount } from "../../../shared/wallet.model"
import { ActivityListContainer } from "./ActivityListContainer"

interface ActivityHistoryContainerProps {
  account: WalletAccount
  header?: ReactNode
}

export const ActivityHistoryContainer: FC<ActivityHistoryContainerProps> = ({
  account,
  header,
}) => {
  const activities = useView(activityForAccountView(account))
  return (
    <ActivityListContainer
      activities={activities}
      account={account}
      header={header}
    />
  )
}
