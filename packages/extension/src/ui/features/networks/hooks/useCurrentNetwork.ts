import { useAppState } from "../../../app.state"
import { useNetwork } from "./useNetwork"

export const useCurrentNetwork = () => {
  const { switcherNetworkId } = useAppState()
  return useNetwork(switcherNetworkId)
}
