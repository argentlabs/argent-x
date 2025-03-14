import {
  BarBackButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
} from "@argent/x-ui"
import type { FC } from "react"

import { Switch } from "@chakra-ui/react"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BetaFeaturesSettingsScreenProps {}

export const BetaFeaturesSettingsScreen: FC<
  BetaFeaturesSettingsScreenProps
> = () => {
  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Beta Features"}>
      <CellStack>
        <ButtonCell
          rightIcon={<Switch isChecked={false} pointerEvents="none" />}
          extendedDescription="Argent X will use an RPC Provider (instead of the feeder gateway) to
            interact with Starknet."
        >
          Use RPC Provider
        </ButtonCell>
      </CellStack>
    </NavigationContainer>
  )
}
