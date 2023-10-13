import {
  BarBackButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
  Switch,
} from "@argent/ui"
import { FC } from "react"

import { settingsStore } from "../../../shared/settings"
import {
  useKeyValueStorage,
  useLocalStorageState,
} from "../../../shared/storage/hooks"
import { SettingsScreenWrapper } from "./SettingsScreen"

export const BetaFeaturesSettings: FC = () => {
  const betaFeatureMultisig = useKeyValueStorage(
    settingsStore,
    "betaFeatureMultisig",
  )
  const [betaFeatureRpcProvider, setBetaFeatureRpcProvider] =
    useLocalStorageState("betaFeatureRpcProvider", false)

  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Experimental"}>
      <SettingsScreenWrapper>
        <CellStack>
          <ButtonCell
            onClick={() =>
              void settingsStore.set(
                "betaFeatureMultisig",
                !betaFeatureMultisig,
              )
            }
            rightIcon={
              <Switch isChecked={betaFeatureMultisig} pointerEvents="none" />
            }
            extendedDescription="Shows a multisig option on the add account menu, which allows a user to set up a multisig account with others"
          >
            Enable multisig account
          </ButtonCell>
          <ButtonCell
            onClick={() => setBetaFeatureRpcProvider(!betaFeatureRpcProvider)}
            rightIcon={
              <Switch isChecked={betaFeatureRpcProvider} pointerEvents="none" />
            }
            extendedDescription=" ArgentX will use an RPC Provider (instead of the feeder gateway) to
            interact with Starknet."
          >
            Use RPC Provider
          </ButtonCell>
        </CellStack>
      </SettingsScreenWrapper>
    </NavigationContainer>
  )
}
