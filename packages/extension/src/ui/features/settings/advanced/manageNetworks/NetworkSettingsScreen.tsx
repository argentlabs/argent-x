import { NetworkSecondaryIcon, ResetPrimaryIcon } from "@argent/x-ui/icons"
import {
  AlertDialog,
  BarAddButton,
  BarBackButton,
  Button,
  CellStack,
  Empty,
  NavigationContainer,
  StickyGroup,
} from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"

import type { Network } from "../../../../../shared/network"
import {
  SettingsMenuItem,
  SettingsMenuItemRemove,
} from "../../ui/SettingsMenuItem"

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
            <Empty
              icon={<NetworkSecondaryIcon />}
              title={"No custom networks"}
            />
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
              leftIcon={<ResetPrimaryIcon />}
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
