import {
  BarBackButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
} from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"

import type { ISettingsStorage } from "../../../../shared/settings/types"

import { Switch } from "@chakra-ui/react"

type Settings = Pick<
  ISettingsStorage,
  "privacyAutomaticErrorReporting" | "privacyShareAnalyticsData"
>

interface PrivacySettingsScreenProps {
  onBack: ReactEventHandler
  settings: Settings
  onChangeSetting: <T extends keyof Settings>(
    key: T,
    value: ISettingsStorage[T],
  ) => void
}

export const PrivacySettingsScreen: FC<PrivacySettingsScreenProps> = ({
  onBack,
  settings,
  onChangeSetting,
}) => {
  const { privacyAutomaticErrorReporting, privacyShareAnalyticsData } = settings
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Privacy"}
    >
      <CellStack>
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
