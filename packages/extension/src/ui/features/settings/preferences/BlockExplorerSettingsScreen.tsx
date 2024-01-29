import { BarBackButton, CellStack, NavigationContainer } from "@argent/ui"
import { FC, ReactEventHandler } from "react"

import {
  BlockExplorerKey,
  defaultBlockExplorers,
} from "../../../../shared/settings/defaultBlockExplorers"
import { SettingsMenuItem } from "../ui/SettingsMenuItem"
import { SettingsMenuItemLogo } from "../ui/SettingsMenuItemLogo"
import { SettingsRadioIcon } from "../ui/SettingsRadioIcon"

interface BlockExplorerSettingsScreenProps {
  onBack: ReactEventHandler
  blockExplorerKey: BlockExplorerKey
  onChange: (key: BlockExplorerKey) => void
}

export const BlockExplorerSettingsScreen: FC<
  BlockExplorerSettingsScreenProps
> = ({ onBack, blockExplorerKey, onChange }) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Default block explorer"}
    >
      <CellStack>
        {Object.entries(defaultBlockExplorers).map(([key, blockExplorer]) => {
          const { title, logo } = blockExplorer
          const checked = blockExplorerKey === key
          const leftIcon = <SettingsMenuItemLogo logo={logo} />
          const rightIcon = <SettingsRadioIcon checked={checked} />
          const onClick = () => {
            onChange(key)
          }
          return (
            <SettingsMenuItem
              key={key}
              title={title}
              onClick={onClick}
              leftIcon={leftIcon}
              rightIcon={rightIcon}
            />
          )
        })}
      </CellStack>
    </NavigationContainer>
  )
}
