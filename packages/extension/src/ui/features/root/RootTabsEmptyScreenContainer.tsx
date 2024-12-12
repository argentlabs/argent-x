import type { FC } from "react"

import { AccountListScreenContainer } from "../accounts/AccountListScreenContainer"
import { SettingsBarIconButton } from "../navigation/SettingsBarIconButton"

export const RootTabsEmptyScreenContainer: FC = () => {
  return (
    <AccountListScreenContainer
      leftButton={<SettingsBarIconButton />}
      rightButton={null}
    />
  )
}
