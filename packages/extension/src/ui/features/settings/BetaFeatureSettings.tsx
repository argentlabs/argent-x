import {
  BarBackButton,
  ButtonCell,
  CellStack,
  NavigationContainer,
  Switch,
} from "@argent/ui"
import { FC } from "react"

import { SettingsScreenWrapper } from "./SettingsScreen"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { networkRepo } from "../../../shared/network/store"

export const BetaFeaturesSettings: FC = () => {
  const network = useCurrentNetwork()
  const isUsingRpcProvider = network.prefer === "rpc"

  const toggleNetworkProvider = async () => {
    await networkRepo.upsert({
      ...network,
      prefer: isUsingRpcProvider ? "sequencer" : "rpc",
    })
  }

  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Beta Features"}>
      <SettingsScreenWrapper>
        <CellStack>
          <ButtonCell
            onClick={toggleNetworkProvider}
            rightIcon={
              <Switch isChecked={isUsingRpcProvider} pointerEvents="none" />
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
