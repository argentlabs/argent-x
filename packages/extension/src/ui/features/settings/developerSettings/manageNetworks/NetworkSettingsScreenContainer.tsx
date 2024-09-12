import { isEqual } from "lodash-es"
import { FC, useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDisclosure } from "@chakra-ui/react"
import {
  defaultCustomNetworks,
  type Network,
} from "../../../../../shared/network"
import { networkService } from "../../../../../shared/network/service"
import { routes } from "../../../../../shared/ui/routes"
import { useNetworks } from "../../../networks/hooks/useNetworks"
import {
  useValidateRemoveNetwork,
  useValidateRestoreDefaultNetworks,
} from "./validateRemoveNetwork"
import { NetworkSettingsScreen } from "./NetworkSettingsScreen"
import { useNavigateReturnToOrBack } from "../../../../hooks/useNavigateReturnTo"

export const NetworkSettingsScreenContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const allNetworks = useNetworks()
  const navigate = useNavigate()
  const {
    isOpen: isAlertDialogOpen,
    onOpen: onAlertDialogOpen,
    onClose: onAlertDialogClose,
  } = useDisclosure()
  const validateRemoveNetwork = useValidateRemoveNetwork()
  const validateRestoreDefaultNetworks = useValidateRestoreDefaultNetworks()

  const [errorMessage, setErrorMessage] = useState("")

  const isDefaultCustomNetworks = useMemo(() => {
    return isEqual(allNetworks, [...allNetworks, ...defaultCustomNetworks])
  }, [allNetworks])

  const onRemoveNetwork = useCallback(
    async (network: Network) => {
      try {
        const shouldRemoveNetwork = validateRemoveNetwork(network.id)
        if (shouldRemoveNetwork) {
          await networkService.removeById(network.id)
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message)
          onAlertDialogOpen()
        } else {
          // unexpected, throw to error boundary
          throw error
        }
      }
    },
    [onAlertDialogOpen, validateRemoveNetwork],
  )

  const onRestoreDefaults = useCallback(async () => {
    try {
      const shouldRemoveNetwork = validateRestoreDefaultNetworks()
      if (shouldRemoveNetwork) {
        await networkService.restoreDefaults()
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        onAlertDialogOpen()
      } else {
        // unexpected, throw to error boundary
        throw error
      }
    }
  }, [onAlertDialogOpen, validateRestoreDefaultNetworks])

  const onViewNetwork = (network: Network) => {
    navigate(routes.settingsEditCustomNetwork(network.id))
  }

  const onAddNetwork = () => {
    navigate(routes.settingsAddCustomNetwork())
  }

  return (
    <NetworkSettingsScreen
      onBack={onBack}
      allNetworks={allNetworks}
      onViewNetwork={onViewNetwork}
      onRemoveNetwork={onRemoveNetwork}
      onAlertDialogClose={onAlertDialogClose}
      isAlertDialogOpen={isAlertDialogOpen}
      alertDialogMessage={errorMessage}
      onRestoreDefaults={onRestoreDefaults}
      isDefaultCustomNetworks={isDefaultCustomNetworks}
      onAddNetwork={onAddNetwork}
    />
  )
}
