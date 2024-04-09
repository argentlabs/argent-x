import {
  BarBackButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
  SpacerCell,
  Switch,
} from "@argent/x-ui"
import { FC, ReactEventHandler } from "react"

import { ISettingsStorage } from "../../../../shared/settings/types"
import { routes } from "../../../routes"
import { SettingsMenuItemLink } from "../ui/SettingsMenuItem"
import { getTitleForAutoLockTimeMinutes } from "../../../../shared/settings/defaultAutoLockTimes"

type Settings = Pick<
  ISettingsStorage,
  | "privacyAutomaticErrorReporting"
  | "privacyShareAnalyticsData"
  | "autoLockTimeMinutes"
>

interface SecurityAndPrivacySettingsScreenProps {
  onBack: ReactEventHandler
  returnTo: string
  settings: Settings
  onChangeSetting: <T extends keyof Settings>(
    key: T,
    value: ISettingsStorage[T],
  ) => void
}

export const SecurityAndPrivacySettingsScreen: FC<
  SecurityAndPrivacySettingsScreenProps
> = ({ onBack, returnTo, settings, onChangeSetting }) => {
  const {
    privacyAutomaticErrorReporting,
    privacyShareAnalyticsData,
    autoLockTimeMinutes,
  } = settings
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Security & Privacy"}
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
        <SpacerCell />
        <ButtonCell
          rightIcon={
            <Switch
              isChecked={privacyAutomaticErrorReporting}
              pointerEvents="none"
            />
          }
          extendedDescription="Automatically share crash logs with Argent"
          onClick={() =>
            onChangeSetting(
              "privacyAutomaticErrorReporting",
              !privacyAutomaticErrorReporting,
            )
          }
        >
          Automatic Error Reporting
        </ButtonCell>
        <ButtonCell
          rightIcon={
            <Switch
              isChecked={privacyShareAnalyticsData}
              pointerEvents="none"
            />
          }
          extendedDescription="This helps the Argent team to identify issues, prioritise features and build a better product without compromising your privacy"
          onClick={() =>
            onChangeSetting(
              "privacyShareAnalyticsData",
              !privacyShareAnalyticsData,
            )
          }
        >
          Share anonymous data
        </ButtonCell>
      </CellStack>
    </NavigationContainer>
  )
}
