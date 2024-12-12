import { useDisclosure } from "@chakra-ui/react"
import { differenceWith, isEmpty, isEqual } from "lodash-es"
import type { FC } from "react"
import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { defaultNetworks, type Network } from "../../../../../shared/network"
import { networkService } from "../../../../../shared/network/service"
import { routes } from "../../../../../shared/ui/routes"
import { useNavigateReturnToOrBack } from "../../../../hooks/useNavigateReturnTo"
import { useNetworks } from "../../../networks/hooks/useNetworks"
import { NetworkSettingsScreen } from "./NetworkSettingsScreen"
import {
  useValidateRemoveNetwork,
  useValidateRestoreDefaultNetworks,
} from "./validateRemoveNetwork"

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
    if (defaultNetworks.length !== allNetworks.length) {
      return false
    }
    /** Find differences irrespective of order */
    const differences = differenceWith(defaultNetworks, allNetworks, isEqual)
    return isEmpty(differences)
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
      onRemoveNetwork={(network) => void onRemoveNetwork(network)}
      onAlertDialogClose={onAlertDialogClose}
      isAlertDialogOpen={isAlertDialogOpen}
      alertDialogMessage={errorMessage}
      onRestoreDefaults={() => void onRestoreDefaults()}
      isDefaultCustomNetworks={isDefaultCustomNetworks}
      onAddNetwork={onAddNetwork}
    />
  )
}
