import {
  AlertDialog,
  BarAddButton,
  BarBackButton,
  Button,
  CellStack,
  Empty,
  NavigationContainer,
  StickyGroup,
  icons,
} from "@argent/x-ui"
import { FC, ReactEventHandler } from "react"

import type { Network } from "../../../../../shared/network"
import {
  SettingsMenuItem,
  SettingsMenuItemRemove,
} from "../../ui/SettingsMenuItem"

const { NetworkIcon, RestoreIcon } = icons

interface NetworkSettingsScreenProps {
  onBack: ReactEventHandler
  allNetworks: Network[]
  onViewNetwork: (network: Network) => void
  onRemoveNetwork: (network: Network) => void
  onAlertDialogClose: () => void
  isAlertDialogOpen: boolean
  alertDialogMessage: string
  onRestoreDefaults: ReactEventHandler
  isDefaultCustomNetworks: boolean
  onAddNetwork: ReactEventHandler
}

export const NetworkSettingsScreen: FC<NetworkSettingsScreenProps> = ({
  onBack,
  allNetworks = [],
  onViewNetwork,
  onRemoveNetwork,
  onAlertDialogClose,
  isAlertDialogOpen,
  alertDialogMessage,
  onRestoreDefaults,
  isDefaultCustomNetworks,
  onAddNetwork,
}) => {
  return (
    <>
      <NavigationContainer
        leftButton={<BarBackButton onClick={onBack} />}
        rightButton={<BarAddButton onClick={onAddNetwork} />}
        title={"Networks"}
      >
        <CellStack pb={!isDefaultCustomNetworks ? 16 : 4} flex={1}>
          {allNetworks.length === 0 ? (
            <Empty icon={<NetworkIcon />} title={"No custom networks"} />
          ) : (
            allNetworks.map((network) => {
              if (network.readonly) {
                return (
                  <SettingsMenuItem
                    key={network.id}
                    title={network.name}
                    onClick={() => {
                      onViewNetwork(network)
                    }}
                  />
                )
              }
              return (
                <SettingsMenuItemRemove
                  key={network.id}
                  title={network.name}
                  onClick={() => onViewNetwork(network)}
                  onRemoveClick={() => {
                    onRemoveNetwork(network)
                  }}
                />
              )
            })
          )}
        </CellStack>

        {!isDefaultCustomNetworks && (
          <StickyGroup px="4" pb="4" alignItems="center">
            <Button
              onClick={onRestoreDefaults}
              size={"2xs"}
              colorScheme="transparent"
              leftIcon={<RestoreIcon />}
              color="text-secondary"
            >
              Restore default networks
            </Button>
          </StickyGroup>
        )}
      </NavigationContainer>

      <AlertDialog
        isOpen={isAlertDialogOpen}
        title={"Cannot remove"}
        message={alertDialogMessage}
        onCancel={onAlertDialogClose}
      />
    </>
  )
}
