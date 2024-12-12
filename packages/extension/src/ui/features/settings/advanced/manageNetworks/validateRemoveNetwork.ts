import { useCallback } from "react"
import { defaultNetworks } from "../../../../../shared/network"
import { selectedNetworkIdView } from "../../../../views/network"
import { useView } from "../../../../views/implementation/react"

export const useValidateRemoveNetwork = () => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  return useCallback(
    (networkId: string) => {
      if (selectedNetworkId === networkId) {
        throw new Error(
          `Network ${networkId} is the current network. Change networks before deleting.`,
        )
      }
      return true
    },
    [selectedNetworkId],
  )
}

/** check if current network id is outside the defaults */

export const useValidateRestoreDefaultNetworks = () => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  return useCallback(() => {
    const defaultNetworkIds = defaultNetworks.map((network) => network.id)
    if (!defaultNetworkIds.includes(selectedNetworkId)) {
      throw new Error(
        `Current network ${selectedNetworkId} is a custom network and cannot be deleted. Change networks before resetting.`,
      )
    }
    return true
  }, [selectedNetworkId])
}
