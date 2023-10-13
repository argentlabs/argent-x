import { defaultNetworks } from "../../../shared/network"
import { useAppState } from "../../app.state"

export const validateRemoveNetwork = async (networkId: string) => {
  const { switcherNetworkId } = useAppState.getState()
  if (switcherNetworkId === networkId) {
    throw new Error(
      `Network ${networkId} is the current network. Change networks before deleting.`,
    )
  }

  return true
}

/** check if current network id is outside the defaults */

export const validateRestoreDefaultNetworks = async () => {
  const { switcherNetworkId } = useAppState.getState()
  const defaultNetworkIds = defaultNetworks.map((network) => network.id)

  if (!defaultNetworkIds.includes(switcherNetworkId)) {
    throw new Error(
      `Current network ${switcherNetworkId} is a custom network and cannot be deleted. Change networks before resetting.`,
    )
  }

  return true
}
