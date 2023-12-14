import {
  BarBackButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
} from "@argent/ui"
import { FC } from "react"

import { SettingsScreenWrapper } from "./SettingsScreen"

// Disabled in AppRoutes.tsx
// Re-enable when we have a beta feature to add

export const BetaFeaturesSettings: FC = () => {
  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Beta Features"}>
      <SettingsScreenWrapper>
        <CellStack>
          <ButtonCell></ButtonCell>
        </CellStack>
      </SettingsScreenWrapper>
    </NavigationContainer>
  )
}
