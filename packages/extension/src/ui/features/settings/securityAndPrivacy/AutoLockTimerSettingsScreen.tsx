import { BarBackButton, CellStack, NavigationContainer } from "@argent/x-ui"
import { FC, MouseEvent, ReactEventHandler } from "react"

import {
  defaultAutoLockTimesMinutes,
  getTitleForAutoLockTimeMinutes,
} from "../../../../shared/settings/defaultAutoLockTimes"
import { SettingsMenuItem } from "../ui/SettingsMenuItem"
import { SettingsRadioIcon } from "../ui/SettingsRadioIcon"

interface AutoLockTimerSettingsScreenProps {
  onBack: ReactEventHandler
  autoLockTimeMinutes: number
  onChange: (autoLockTimeMinutes: number) => void
}

export const AutoLockTimerSettingsScreen: FC<
  AutoLockTimerSettingsScreenProps
> = ({ onBack, autoLockTimeMinutes, onChange }) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Auto lock timer"}
    >
      <CellStack>
        {defaultAutoLockTimesMinutes.map((minutes) => {
          const checked = autoLockTimeMinutes === minutes
          const rightIcon = <SettingsRadioIcon checked={checked} />
          const onClick = (e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            onChange(minutes)
          }
          const key = `${minutes}`
          const title = getTitleForAutoLockTimeMinutes(minutes)
          return (
            <SettingsMenuItem
              key={key}
              title={title}
              onClick={onClick}
              rightIcon={rightIcon}
            />
          )
        })}
      </CellStack>
    </NavigationContainer>
  )
}
