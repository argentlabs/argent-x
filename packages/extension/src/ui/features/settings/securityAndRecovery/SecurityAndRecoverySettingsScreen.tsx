import { BarBackButton, CellStack, NavigationContainer } from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"

import type { ISettingsStorage } from "../../../../shared/settings/types"
import { routes } from "../../../../shared/ui/routes"
import { SettingsMenuItemLink } from "../ui/SettingsMenuItem"
import { getTitleForAutoLockTimeMinutes } from "../../../../shared/settings/defaultAutoLockTimes"

type Settings = Pick<ISettingsStorage, "autoLockTimeMinutes">

interface SecurityAndRecoverySettingsScreenProps {
  onBack: ReactEventHandler
  returnTo: string
  settings: Settings
  onChangeSetting: <T extends keyof Settings>(
    key: T,
    value: ISettingsStorage[T],
  ) => void
}

export const SecurityAndRecoverySettingsScreen: FC<
  SecurityAndRecoverySettingsScreenProps
> = ({ onBack, returnTo, settings }) => {
  const { autoLockTimeMinutes } = settings
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Security & recovery"}
    >
      <CellStack>
        <SettingsMenuItemLink
          to={routes.settingsAutoLockTimer(returnTo)}
          title="Auto lock timer"
          subtitle={getTitleForAutoLockTimeMinutes(autoLockTimeMinutes)}
        />
        <SettingsMenuItemLink
          to={routes.settingsSeed(returnTo)}
          title="Recovery phrase"
        />
      </CellStack>
    </NavigationContainer>
  )
}
