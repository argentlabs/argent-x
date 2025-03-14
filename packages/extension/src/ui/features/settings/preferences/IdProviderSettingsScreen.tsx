import { BarBackButton, CellStack, NavigationContainer } from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"

import { SettingsMenuItem } from "../ui/SettingsMenuItem"
import { SettingsRadioIcon } from "../ui/SettingsRadioIcon"

import { DappsBrotheridLogo, DappsStarknetidLogo } from "@argent/x-ui/logos"

interface IdProviderSettingsScreenProps {
  onBack: ReactEventHandler
  selectedIdProvider: "starknetid" | "brotherid"
  onChange: (key: "starknetid" | "brotherid") => void
}

export const IdProviderSettingsScreen: FC<IdProviderSettingsScreenProps> = ({
  onBack,
  selectedIdProvider,
  onChange,
}) => {
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={onBack} />}
      title={"Default Identity provider"}
    >
      <CellStack>
        <SettingsMenuItem
          title="StarknetID"
          onClick={() => {
            onChange("starknetid")
          }}
          leftIcon={<DappsStarknetidLogo w={10} h={10} rounded="xl" />}
          rightIcon={
            <SettingsRadioIcon checked={selectedIdProvider === "starknetid"} />
          }
        />
        <SettingsMenuItem
          title="BrotherID"
          onClick={() => {
            onChange("brotherid")
          }}
          leftIcon={<DappsBrotheridLogo w={10} h={10} rounded="xl" />}
          rightIcon={
            <SettingsRadioIcon checked={selectedIdProvider === "brotherid"} />
          }
        />
      </CellStack>
    </NavigationContainer>
  )
}
